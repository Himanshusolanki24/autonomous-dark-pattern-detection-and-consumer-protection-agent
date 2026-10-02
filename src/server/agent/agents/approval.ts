// =============================================================================
// lib/agent/agents/approval.ts
// APPROVAL_GATE: parks the run and creates a human-approval request before a
// critical, irreversible final action executes. The run pauses (END) until an
// authorized user approves/rejects via the API.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { emitEvent } from "../events";
import { randomUUID } from "node:crypto";
import { APPROVAL_TTL_MS } from "@/types/agent";

export const approvalGateNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { supabase } = ctx;
  const action = state.pendingFinalAction;

  if (!action) {
    // Nothing to approve — treat as no-op and continue.
    return { currentStage: "approval_gate", status: "running" };
  }

  const approvalId = randomUUID();
  const expiresAt = new Date(Date.now() + APPROVAL_TTL_MS).toISOString();

  // Create the approval record. RLS forbids users from writing these rows;
  // this server-side (service-role) client creates and later transitions it.
  // action_type is a controlled enum — the pending click is recorded in `description`.
  await supabase.from("agent_approvals").insert({
    id: approvalId,
    session_id: state.sessionId,
    task_id: state.taskId ?? null,
    user_id: state.userId,
    action_type: "final_cancellation",
    risk_level: "high",
    description: action.reason,
    status: "pending",
    requested_at: new Date().toISOString(),
    expires_at: expiresAt,
  });

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    eventType: "approval_requested",
    message: `Approval required before: ${action.reason}`,
    status: "approval_required",
  });

  return {
    currentStage: "approval_gate",
    status: "approval_required",
    approvalId,
  };
};