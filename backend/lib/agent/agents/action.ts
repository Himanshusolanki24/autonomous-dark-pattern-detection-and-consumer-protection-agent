// =============================================================================
// lib/agent/agents/action.ts
// ACT: execute the chosen action. On resume, executes the approved final action.
// Bounded by MAX_ACTIONS; one navigation/action step per invocation.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { executeAction } from "@/lib/browser/actions";
import { emitEvent } from "../events";
import { MAX_ACTIONS } from "@/types/agent";
import type { AgentAction } from "@/types/agent";

export const actNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { browser, supabase } = ctx;
  if (!browser) {
    throw new Error("No browser session available for act node");
  }

  // After human approval, execute the parked final action.
  const actionToRun =
    state.resumeApproval === "approved" && state.pendingFinalAction
      ? state.pendingFinalAction
      : state.lastAction;

  if (!actionToRun || actionToRun.type === "complete" || actionToRun.type === "fail") {
    // Terminal actions are handled by the finalize nodes.
    return { currentStage: "action" };
  }

  const nextCount = state.actionCount + 1;
  if (nextCount > MAX_ACTIONS) {
    return {
      status: "failed",
      errorMessage: `Action budget exceeded (${MAX_ACTIONS})`,
      currentStage: "action",
    };
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "action",
    eventType: "action_started",
    message: `Step ${nextCount}: ${actionToRun.type} "${(actionToRun.target ?? "").slice(0, 60)}"`,
    status: "running",
  });

  try {
    await executeAction(browser.page, actionToRun as AgentAction);
  } catch (err) {
    // A single failed action retries up to once, then fails the run.
    if (state.actionCount === 0) {
      return {
        status: "failed",
        errorMessage: `Action failed: ${err instanceof Error ? err.message : String(err)}`,
        currentStage: "action",
      };
    }
    await emitEvent(supabase, state.sessionId, {
      userId: state.userId,
      agent: "action",
      eventType: "action_failed",
      message: `Step ${nextCount} failed; retrying`,
      status: "running",
    });
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "action",
    eventType: "action_completed",
    message: `Executed ${actionToRun.type}`,
    status: "running",
  });

  // The pending final action has now been executed — clear it so the resume
  // path re-perceives rather than re-executes.
  return {
    currentStage: "action",
    actionCount: nextCount,
    pendingFinalAction: undefined,
    resumeApproval: undefined,
  };
};