// =============================================================================
// lib/agent/agents/verification.ts
// VERIFY: confirms the outcome with real evidence (page text + screenshot).
// Never trusts the agent's own assertion alone.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { perceive } from "@/server/browser/perception";
import { emitEvent } from "../events";
import { recordOutcome } from "@/server/graph/neo4j";

const SUCCESS_MARKERS = ["subscription is cancelled", "cancelled", "cancellation confirmed"];

export const verifyNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { browser, supabase, proofsDir } = ctx;
  if (!browser) {
    throw new Error("No browser session available for verify node");
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "verification",
    eventType: "stage_started",
    message: "Verifying the outcome",
    status: "running",
  });

  const perception = await perceive(browser.page);
  const text = perception.visibleText.toLowerCase();

  const confirmed = perception.pageState === "success" || SUCCESS_MARKERS.some((m) => text.includes(m));

  // Graph memory: only runs verified against the page become "proven" paths.
  await recordOutcome(state.sessionId, state.goal, perception.url, confirmed ? "verified" : "unverified");

  // Capture proof regardless so the user always has evidence to inspect.
  let proofPath: string | undefined;
  if (proofsDir) {
    try {
      const name = `proof_${state.sessionId}_${Date.now()}.png`;
      proofPath = await browser.page.screenshot({ path: `${proofsDir}/${name}` }).then(
        () => `${proofsDir}/${name}`
      );
    } catch {
      proofPath = undefined;
    }
  }
  if (proofPath && state.taskId) {
    await supabase
      .from("cancellation_tasks")
      .update({ proof_screenshot_path: proofPath })
      .eq("id", state.taskId);
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "verification",
    eventType: "verification_completed",
    message: confirmed ? "Outcome verified — cancellation confirmed" : "Outcome not confirmed yet",
    status: confirmed ? "completed" : "running",
  });

  return {
    currentStage: "verification",
    status: confirmed ? "completed" : "running",
    evidence: confirmed
      ? `Verified: ${perception.title} — ${text.slice(0, 120)}`
      : undefined,
    lastUrl: perception.url,
  };
};