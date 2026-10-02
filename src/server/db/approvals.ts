// =============================================================================
// lib/db/approvals.ts
// Server-validated approval transitions. RLS deliberately does NOT grant users
// UPDATE on agent_approvals — only this (service-role) path may flip status.
// =============================================================================

import type { DbClient } from "@/server/supabase/types";
import { ConflictError, NotFoundError } from "@/server/security/errors";

/**
 * Validates and transitions a pending approval for an owned session.
 * Returns the session id for resume. Throws on unauthorized / not-pending /
 * expired states.
 */
export async function transitionApproval(
  admin: DbClient,
  approvalId: string,
  userId: string,
  decision: "approved" | "rejected"
): Promise<{ sessionId: string; taskId: string | null }> {
  const { data: approval, error } = await admin
    .from("agent_approvals")
    .select("id, user_id, session_id, task_id, status, expires_at")
    .eq("id", approvalId)
    .maybeSingle();

  if (error || !approval || approval.user_id !== userId) {
    throw new NotFoundError("Approval not found");
  }
  if (approval.status !== "pending") {
    throw new ConflictError(`Approval already ${approval.status}`);
  }
  if (new Date(approval.expires_at).getTime() < Date.now()) {
    await admin
      .from("agent_approvals")
      .update({ status: "expired", responded_at: new Date().toISOString() })
      .eq("id", approvalId);
    throw new ConflictError("Approval has expired");
  }

  // Only a session paused for approval may resume.
  const { data: session } = await admin
    .from("agent_sessions")
    .select("id, status, user_id")
    .eq("id", approval.session_id)
    .maybeSingle();
  if (!session || session.user_id !== userId) {
    throw new NotFoundError("Session not found");
  }
  if (session.status !== "approval_required") {
    throw new ConflictError("Session is not waiting for approval");
  }

  await admin
    .from("agent_approvals")
    .update({ status: decision, responded_at: new Date().toISOString() })
    .eq("id", approvalId);
  await admin
    .from("agent_sessions")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", session.id);

  return { sessionId: session.id, taskId: approval.task_id };
}