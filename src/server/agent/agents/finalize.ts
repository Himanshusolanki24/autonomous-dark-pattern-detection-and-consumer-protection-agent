// =============================================================================
// lib/agent/agents/finalize.ts
// COMPLETE / FAIL: persist terminal state, update the session/task, emit events.
// The browser session is torn down by the runner, not here (node purity).
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { emitEvent } from "../events";

export const completeNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  await emitEvent(ctx.supabase, state.sessionId, {
    userId: state.userId,
    agent: "verification",
    eventType: "task_completed",
    message: "Task completed successfully",
    status: "completed",
  });
  return { currentStage: "complete", status: "completed" };
};

export const failNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const message = state.errorMessage ?? "Task failed";
  await emitEvent(ctx.supabase, state.sessionId, {
    userId: state.userId,
    agent: "planning",
    eventType: "task_failed",
    message,
    status: "failed",
  });
  return { currentStage: "fail", status: "failed" };
};