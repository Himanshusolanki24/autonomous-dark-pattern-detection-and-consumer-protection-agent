// =============================================================================
// lib/agent/runner.ts
// Orchestrates a full agent run: browser session → LangGraph → DB persistence
// → teardown. Callers fire-and-forget via jobQueue; the run is resumable after
// a human approval by re-invoking the graph with resumeApproval.
// =============================================================================

import { createAdminClient } from "@/lib/supabase/admin";
import { browserManager } from "@/lib/browser/manager";
import { createGraph } from "./graph";
import { AgentCancelledError, type AgentState } from "./state";
import { emitEvent } from "./events";
import { jobQueue } from "@/lib/queue/runner";
import { validateTargetUrl } from "@/lib/security/ssrf";
import type { Json } from "@/types/database";

export interface StartRunInput {
  sessionId: string;
  taskId?: string;
  userId: string;
  goal: string;
  targetUrl: string;
  initialDecision?: string;
}

export interface ResumeRunInput {
  sessionId: string;
  userId: string;
  decision: "approved" | "rejected";
}

const PROOFS_DIR = process.env.PROOFS_DIR ?? `${process.cwd()}/.proofs`;

function initialState(input: StartRunInput): AgentState {
  return {
    sessionId: input.sessionId,
    taskId: input.taskId,
    userId: input.userId,
    goal: input.goal,
    targetUrl: input.targetUrl,
    currentStage: "perception",
    status: "running",
    actionCount: 0,
    lastUrl: undefined,
    lastDetection: undefined,
    lastDecision: undefined,
    lastAction: undefined,
    pendingFinalAction: undefined,
    approvalId: undefined,
    errorMessage: undefined,
    evidence: undefined,
    resumeApproval: undefined,
  };
}

async function persistFinalState(sessionId: string, state: AgentState): Promise<void> {
  await createAdminClient()
    .from("agent_sessions")
    .update({
      status: state.status,
      state: state as unknown as Json,
      completed_at:
        state.status === "completed" || state.status === "failed" || state.status === "cancelled"
          ? new Date().toISOString()
          : null,
    })
    .eq("id", sessionId);
}

/**
 * Runs the graph to completion (or to an approval pause). Safe to call
 * fire-and-forget; a per-session lock prevents concurrent double-runs.
 */
export async function runToCompletion(input: StartRunInput | ResumeRunInput): Promise<void> {
  const supabase = createAdminClient();
  const graph = createGraph();

  // Reconcile current persisted state for resumes.
  const { data: session } = await supabase
    .from("agent_sessions")
    .select("state, status")
    .eq("id", input.sessionId)
    .maybeSingle();

  let state: AgentState;
  if ("decision" in input) {
    const prev = (session?.state ?? {}) as Partial<AgentState>;
    state = {
      ...(initialState({
        sessionId: input.sessionId,
        userId: input.userId,
        goal: prev.goal ?? "cancel_subscription",
        targetUrl: prev.targetUrl ?? "",
      })),
      ...prev,
      status: "running",
      resumeApproval: input.decision,
    };
  } else {
    state = initialState(input);
  }

  // Browser session: reuse if alive (approval resume), else (re)create.
  let browser = browserManager.getSession(input.sessionId);
  if (!browser) {
    browser = await browserManager.createSession(input.sessionId);
    const target = state.lastUrl && state.lastUrl !== "about:blank" ? state.lastUrl : state.targetUrl;
    try {
      await browser.page.goto(target, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch {
      // Fallback if domcontentloaded times out on heavy SPAs
      try {
        await browser.page.goto(target, { waitUntil: "load", timeout: 10000 });
      } catch {
        // Continue to let perceive read whatever DOM was loaded
      }
    }
  }

  const ctx = {
    sessionId: input.sessionId,
    userId: input.userId,
    taskId: state.taskId,
    browser,
    supabase,
    proofsDir: PROOFS_DIR,
  };

  let finalState: AgentState | null = null;
  try {
    finalState = await graph.invoke(state, { configurable: ctx });
    await persistFinalState(input.sessionId, finalState);
  } catch (err) {
    // A human stop (cooperative cancel, or a mid-action browser teardown that
    // surfaces as a generic error) must not be mislabeled as a failure. The
    // /stop route already recorded "cancelled" + emitted the event, so re-read
    // the DB and leave it alone if so.
    const { data: current } = await supabase
      .from("agent_sessions")
      .select("status")
      .eq("id", input.sessionId)
      .maybeSingle();
    if (err instanceof AgentCancelledError || current?.status === "cancelled") {
      finalState = { ...state, status: "cancelled" };
    } else {
      const message = err instanceof Error ? err.message : String(err);
      await emitEvent(supabase, input.sessionId, {
        userId: input.userId,
        agent: "planning",
        eventType: "task_failed",
        message,
        status: "failed",
      });
      await persistFinalState(input.sessionId, {
        ...state,
        status: "failed",
        errorMessage: message,
      });
      finalState = { ...state, status: "failed", errorMessage: message };
    }
  } finally {
    if (finalState?.status !== "approval_required") {
      await browserManager.destroySession(input.sessionId, "completed");
    }
  }
}

/** Enqueue a fire-and-forget run. The API route returns before completion. */
export function enqueueStart(input: StartRunInput): void {
  jobQueue.enqueue(() => runToCompletion(input));
}

export function enqueueResume(input: ResumeRunInput): void {
  jobQueue.enqueue(() => runToCompletion(input));
}

/** Validate the target URL (SSRF) before anything is queued. */
export async function validateStartTarget(targetUrl: string): Promise<URL> {
  return validateTargetUrl(targetUrl);
}