// =============================================================================
// lib/agent/graph.ts
// Builds the executable LangGraph with real node handlers.
// RuntimeContext carries the browser session + admin client so nodes stay pure.
// =============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { BrowserSessionHandle } from "@/lib/browser/manager";
import type { AgentState } from "./state";
import { buildGraph } from "./state";
import { perceiveNode } from "./agents/perception";
import { detectNode } from "./agents/detection";
import { planNode } from "./agents/planning";
import { actNode } from "./agents/action";
import { approvalGateNode } from "./agents/approval";
import { verifyNode } from "./agents/verification";
import { completeNode, failNode } from "./agents/finalize";

export interface RuntimeContext {
  sessionId: string;
  userId: string;
  taskId?: string;
  browser: BrowserSessionHandle | null;
  supabase: SupabaseClient<Database>;
  proofsDir?: string;
}

export type NodeHandler = (
  state: AgentState,
  ctx: RuntimeContext
) => Promise<Partial<AgentState>>;

export function createGraph() {
  const nodes: Record<string, NodeHandler> = {
    perceive: perceiveNode,
    detect: detectNode,
    plan: planNode,
    act: actNode,
    approval_gate: approvalGateNode,
    verify: verifyNode,
    complete: completeNode,
    fail: failNode,
  };
  return buildGraph(nodes);
}