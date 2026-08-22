import { describe, it, expect } from "vitest";
import { AgentCancelledError, buildGraph, GRAPH, routeAfterAct, routeAfterPlan } from "@/lib/agent/state";
import type { AgentState } from "@/lib/agent/state";
import type { RuntimeContext, NodeHandler } from "@/lib/agent/graph";

function baseState(): AgentState {
  return {
    sessionId: "s1",
    taskId: undefined,
    userId: "u1",
    goal: "cancel_subscription",
    targetUrl: "https://demo.test/account",
    currentStage: undefined,
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

describe("routeAfterPlan", () => {
  it("routes to completion when the goal is reached", () => {
    expect(routeAfterPlan({ ...baseState(), status: "completed" })).toBe(GRAPH.COMPLETE);
  });

  it("routes to failure when failed", () => {
    expect(routeAfterPlan({ ...baseState(), status: "failed" })).toBe(GRAPH.FAIL);
  });

  it("routes to the approval gate for a pending final action", () => {
    expect(
      routeAfterPlan({
        ...baseState(),
        pendingFinalAction: { type: "click", target: "Yes, cancel", reason: "final" },
      })
    ).toBe(GRAPH.APPROVAL_GATE);
  });

  it("routes to act on resume after approval", () => {
    expect(
      routeAfterPlan({
        ...baseState(),
        pendingFinalAction: { type: "click", target: "Yes, cancel", reason: "final" },
        resumeApproval: "approved",
      })
    ).toBe(GRAPH.ACT);
  });

  it("routes to failure after a rejection", () => {
    expect(
      routeAfterPlan({
        ...baseState(),
        pendingFinalAction: { type: "click", target: "Yes, cancel", reason: "final" },
        resumeApproval: "rejected",
      })
    ).toBe(GRAPH.FAIL);
  });

  it("routes back to action for a normal step", () => {
    expect(
      routeAfterPlan({ ...baseState(), lastAction: { type: "click", target: "Cancel", reason: "x" } })
    ).toBe(GRAPH.ACT);
  });
});

describe("routeAfterAct", () => {
  it("loops to perceive after a normal action", () => {
    expect(routeAfterAct(baseState())).toBe(GRAPH.PERCEIVE);
  });
  it("routes to complete/fail on terminal states", () => {
    expect(routeAfterAct({ ...baseState(), status: "completed" })).toBe(GRAPH.COMPLETE);
    expect(routeAfterAct({ ...baseState(), status: "failed" })).toBe(GRAPH.FAIL);
  });
});

describe("buildGraph wiring", () => {
  it("runs a stub happy-path to completion", async () => {
    const seen: string[] = [];
    const node =
      (stage: string, toStatus?: AgentState["status"]): NodeHandler =>
      async () => {
        seen.push(stage);
        return {
          currentStage: stage,
          ...(toStatus ? { status: toStatus } : {}),
        };
      };

    const graph = buildGraph({
      perceive: node(GRAPH.PERCEIVE),
      detect: node(GRAPH.DETECT),
      plan: async () => {
        seen.push(GRAPH.PLAN);
        return { currentStage: GRAPH.PLAN, status: "completed" };
      },
      act: node(GRAPH.ACT),
      approval_gate: node(GRAPH.APPROVAL_GATE),
      verify: node(GRAPH.VERIFY),
      complete: node(GRAPH.COMPLETE),
      fail: node(GRAPH.FAIL),
    });

    const final = await graph.invoke(baseState(), {
      configurable: {} as RuntimeContext,
    });

    expect(final.status).toBe("completed");
    // plan observed completed → routed to complete node
    expect(seen).toContain(GRAPH.COMPLETE);
  });

  it("aborts a node when the session was stopped by a human", async () => {
    let ran = false;
    // Stub supabase reporting the session as cancelled (as /stop would set it).
    const supabase = {
      from: () => ({
        select: () => ({
          eq: () => ({ maybeSingle: async () => ({ data: { status: "cancelled" } }) }),
        }),
      }),
    };
    const graph = buildGraph({
      perceive: async (s) => { ran = true; return s; },
      detect: async (s) => s,
      plan: async (s) => s,
      act: async (s) => s,
      approval_gate: async (s) => s,
      verify: async (s) => s,
      complete: async (s) => s,
      fail: async (s) => s,
    });

    await expect(
      graph.invoke(baseState(), { configurable: { supabase } as unknown as RuntimeContext })
    ).rejects.toBeInstanceOf(AgentCancelledError);
    expect(ran).toBe(false); // short-circuited before the node body ran
  });

  it("pauses at approval_required when a final action is pending", async () => {
    const graph = buildGraph({
      perceive: async (s) => s,
      detect: async (s) => s,
      plan: async (state) => ({
        ...state,
        pendingFinalAction: { type: "click", target: "Yes, cancel", reason: "final step" },
      }),
      act: async (s) => s,
      approval_gate: async (state) => ({
        ...state,
        status: "approval_required",
        approvalId: "a1",
      }),
      verify: async (s) => s,
      complete: async (s) => s,
      fail: async (s) => s,
    });

    const final = await graph.invoke(baseState(), { configurable: {} as RuntimeContext });
    expect(final.status).toBe("approval_required");
    expect(final.approvalId).toBe("a1");
  });

  it("executes the final action on approval resume", async () => {
    const executed: string[] = [];
    const graph = buildGraph({
      perceive: async (s) => s,
      detect: async (s) => s,
      // First pass proposes the final action; the executed action resolves the
      // page so the second pass reports goal reached (→ complete).
      plan: async (state) =>
        state.actionCount === 0
          ? { ...state, pendingFinalAction: { type: "click", target: "Yes, cancel", reason: "final step" } }
          : { ...state, status: "completed" },
      act: async (state) => {
        if (state.pendingFinalAction) executed.push(state.pendingFinalAction.target!);
        return {
          ...state,
          pendingFinalAction: undefined,
          resumeApproval: undefined,
          actionCount: state.actionCount + 1,
        };
      },
      approval_gate: async (s) => ({ ...s, status: "approval_required", approvalId: "a1" }),
      verify: async (s) => s,
      complete: async (s) => s,
      fail: async (s) => s,
    });

    const final = await graph.invoke(
      { ...baseState(), resumeApproval: "approved" },
      { configurable: {} as RuntimeContext }
    );
    expect(executed).toEqual(["Yes, cancel"]);
    expect(final.status).toBe("completed");
  });
});