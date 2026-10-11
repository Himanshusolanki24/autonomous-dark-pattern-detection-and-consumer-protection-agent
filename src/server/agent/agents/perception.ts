// =============================================================================
// lib/agent/agents/perception.ts
// PERCEIVE: navigate (first visit) / refresh perception of the live page.
// Never passes raw webpage text wholesale to an LLM.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { perceive } from "@/server/browser/perception";
import { emitEvent } from "../events";
import { MAX_ACTIONS } from "@/types/agent";
import { browserManager } from "@/server/browser/manager";
import { recordPage } from "@/server/graph/neo4j";

export const perceiveNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { browser } = ctx;
  if (!browser) {
    throw new Error("No browser session available for perceive node");
  }
  const { page } = browser;

  // Guard: never burn actions on navigation loops.
  if (state.actionCount >= MAX_ACTIONS) {
    return {
      status: "failed",
      errorMessage: `Action budget exceeded (${MAX_ACTIONS})`,
      currentStage: "perception",
    };
  }

  await emitEvent(ctx.supabase, state.sessionId, {
    userId: state.userId,
    agent: "perception",
    eventType: "stage_started",
    message: "Perceiving the current page",
    status: "running",
  });

  // First visit: navigate to the target URL (SSRF-validated by the runner).
  const pageUrl = page.url();
  const firstVisit = !pageUrl || pageUrl === "about:blank";
  if (firstVisit) {
    try {
      await page.goto(state.targetUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch {
      try {
        await page.goto(state.targetUrl, { waitUntil: "load", timeout: 10000 });
      } catch {
        // Continue and perceive whatever content was received
      }
    }
  }

  const result = await perceive(page);
  // Hand the preview a picture of the page we already have open.
  // The runner has usually navigated already, so "first look" is judged from
  // the run's state: nothing has been perceived yet.
  const firstLook = !state.lastUrl;
  await browserManager.captureShot(page, result.url, ...(firstLook ? [state.targetUrl] : []));
  // Path map: this page, and the click that led here from the previous one.
  await recordPage(result.url, result.pageState, result.title, { entry: firstLook, from: state.lastClick });

  await emitEvent(ctx.supabase, state.sessionId, {
    userId: state.userId,
    agent: "perception",
    eventType: "perception_completed",
    message: `Perceived ${result.title || result.url}`,
    status: "running",
  });

  return {
    currentStage: "perception",
    lastUrl: result.url,
    lastClick: undefined,
    lastDetection: undefined,
    lastDecision: `On ${result.url} (${result.pageState})`,
  };
};