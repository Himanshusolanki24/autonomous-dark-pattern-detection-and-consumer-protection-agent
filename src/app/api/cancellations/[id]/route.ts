// =============================================================================
// app/api/cancellations/[id]/route.ts
// GET — one cancellation task with its session + approvals.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { NotFoundError } from "@/server/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cancellation_tasks")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) throw new NotFoundError("Task not found");

  const { data: session } = data.agent_session_id
    ? await supabase
        .from("agent_sessions")
        .select("id, status, current_stage, error_message")
        .eq("id", data.agent_session_id)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null };

  const { data: approvals } = await supabase
    .from("agent_approvals")
    .select("id, status, action_type, risk_level, description, requested_at, responded_at, expires_at")
    .eq("task_id", id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return jsonOk({
    id: data.id,
    serviceName: data.service_name,
    targetUrl: data.target_url,
    status: data.status,
    requestedAt: data.requested_at,
    startedAt: data.started_at,
    approvedAt: data.approved_at,
    completedAt: data.completed_at,
    failureReason: data.failure_reason,
    proofScreenshotPath: data.proof_screenshot_path,
    session: session
      ? {
          id: session.id,
          status: session.status,
          currentStage: session.current_stage,
          errorMessage: session.error_message,
        }
      : null,
    approvals: (approvals ?? []).map((a) => ({
      id: a.id,
      status: a.status,
      actionType: a.action_type,
      riskLevel: a.risk_level,
      description: a.description,
      requestedAt: a.requested_at,
      respondedAt: a.responded_at,
      expiresAt: a.expires_at,
    })),
  });
});