// =============================================================================
// lib/agent/state.ts
// LangGraph state for the PERCEIVE → DETECT → PLAN → ACT → VERIFY pipeline.
// All fields are JSON-serializable so graph state persists to agent_sessions.
// =============================================================================

import { Annotation, START, END, StateGraph } from "@langchain/langgraph";
import type { RuntimeContext } from "@/server/agent/graph";

export const AgentStateAnnotation = Annotation.Root({
  sessionId: Annotation<string>,
  taskId: Annotation<string | undefined>,
  userId: Annotation<string>,
  goal: Annotation<string>,
  targetUrl: Annotation<string>,
  currentStage: Annotation<string | undefined>,
  status: Annotation<
    "running" | "approval_required" | "completed" | "failed" | "cancelled"
  >,
  actionCount: Annotation<number>,
  lastUrl: Annotation<string | undefined>,
  lastDetection: Annotation<
    | {
        patternType: string;
        severity: string;
        confidence: number;
        explanation: string;
      }
    | undefined
  >,
  lastDecision: Annotation<string | undefined>,
  lastAction: Annotation<
    | { type: string; target?: string; value?: string; reason?: string }
    | undefined
  >,
  pendingFinalAction: Annotation<
    | { type: string; target?: string; value?: string; reason?: string }
    | undefined
  >,
  approvalId: Annotation<string | undefined>,
  errorMessage: Annotation<string | undefined>,
  evidence: Annotation<string | undefined>,
  resumeApproval: Annotation<string | undefined>,
});

export type AgentState = typeof AgentStateAnnotation.State;

/** Thrown by a node when a human has stopped the session (status → cancelled). */
export class AgentCancelledError extends Error {
  constructor() {
    super("Session cancelled by user");
    this.name = "AgentCancelledError";
  }
}

export const GRAPH = {
  PERCEIVE: "perceive",
  DETECT: "detect",
  PLAN: "plan",
  ACT: "act",
  APPROVAL_GATE: "approval_gate",
  VERIFY: "verify",
  COMPLETE: "complete",
  FAIL: "fail",
} as const;

/** Conditional edge target after the plan node. */
export function routeAfterPlan(state: AgentState): string {
  if (state.status === "completed") return GRAPH.VERIFY;
  if (state.status === "failed") return GRAPH.FAIL;
  // A rejected approval terminates the run.
  if (state.resumeApproval === "rejected") return GRAPH.FAIL;
  // A critical final action that needs human consent is parked at the gate.
  if (state.pendingFinalAction && !state.resumeApproval) return GRAPH.APPROVAL_GATE;
  return GRAPH.ACT;
}

/** Conditional edge target after the action node. */
export function routeAfterAct(state: AgentState): string {
  if (state.status === "completed") return GRAPH.VERIFY;
  if (state.status === "failed") return GRAPH.FAIL;
  return GRAPH.PERCEIVE;
}

export function buildGraph(
  nodes: Record<string, (state: AgentState, ctx: RuntimeContext) => Promise<Partial<AgentState>>>
) {
  const g = new StateGraph(AgentStateAnnotation)
    .addNode(GRAPH.PERCEIVE, makeNode(nodes, GRAPH.PERCEIVE))
    .addNode(GRAPH.DETECT, makeNode(nodes, GRAPH.DETECT))
    .addNode(GRAPH.PLAN, makeNode(nodes, GRAPH.PLAN))
    .addNode(GRAPH.ACT, makeNode(nodes, GRAPH.ACT))
    .addNode(GRAPH.APPROVAL_GATE, makeNode(nodes, GRAPH.APPROVAL_GATE))
    .addNode(GRAPH.VERIFY, makeNode(nodes, GRAPH.VERIFY))
    .addNode(GRAPH.COMPLETE, makeNode(nodes, GRAPH.COMPLETE))
    .addNode(GRAPH.FAIL, makeNode(nodes, GRAPH.FAIL))
    .addEdge(START, GRAPH.PERCEIVE)
    .addEdge(GRAPH.PERCEIVE, GRAPH.DETECT)
    .addEdge(GRAPH.DETECT, GRAPH.PLAN)
    .addConditionalEdges(GRAPH.PLAN, routeAfterPlan, [
      GRAPH.ACT,
      GRAPH.APPROVAL_GATE,
      GRAPH.VERIFY,
      GRAPH.COMPLETE,
      GRAPH.FAIL,
    ])
    .addConditionalEdges(GRAPH.ACT, routeAfterAct, [
      GRAPH.PERCEIVE,
      GRAPH.VERIFY,
      GRAPH.COMPLETE,
      GRAPH.FAIL,
    ])
    .addConditionalEdges(GRAPH.APPROVAL_GATE, (s) =>
      s.status === "approval_required" ? END : GRAPH.ACT
    )
    .addEdge(GRAPH.VERIFY, GRAPH.COMPLETE)
    .addEdge(GRAPH.COMPLETE, END)
    .addEdge(GRAPH.FAIL, END);

  return g.compile();
}

function makeNode(
  nodes: Record<string, (state: AgentState, ctx: RuntimeContext) => Promise<Partial<AgentState>>>,
  name: string
) {
  const handler = nodes[name];
  if (!handler) {
    throw new Error(`Missing node implementation: ${name}`);
  }
  return async (state: AgentState, config: { configurable?: Record<string, unknown> }) => {
    const ctx = config.configurable as unknown as RuntimeContext;
    // Cooperative human cancel: bail before starting any node (and any LLM/
    // browser work it does) if the session was stopped. DB is the source of
    // truth — the /stop route sets status = "cancelled". Best-effort: if the
    // read fails, the /stop browser-kill + runner catch still end the run.
    if (ctx.supabase) {
      const { data } = await ctx.supabase
        .from("agent_sessions")
        .select("status")
        .eq("id", state.sessionId)
        .maybeSingle();
      if (data?.status === "cancelled") throw new AgentCancelledError();
    }
    return handler(state, ctx);
  };
}