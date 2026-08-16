// =============================================================================
// lib/agent/agents/detection.ts
// DETECT: classify the page against the dark-pattern taxonomy and persist any
// confirmed findings to dark_pattern_detections.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { perceive } from "@/lib/browser/perception";
import { classifyPage } from "@/lib/detection/classifier";
import { emitEvent } from "../events";

export const detectNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { browser, supabase } = ctx;
  if (!browser) {
    throw new Error("No browser session available for detect node");
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "detection",
    eventType: "stage_started",
    message: "Scanning the page for dark patterns",
    status: "running",
  });

  const perception = await perceive(browser.page);
  const result = await classifyPage(perception);

  const primary = result.detections[0];

  if (result.detections.length > 0) {
    // Persist each confirmed detection (nullable session id for scanner-only runs).
    await supabase.from("dark_pattern_detections").insert(
      result.detections.map((d) => ({
        session_id: state.sessionId,
        user_id: state.userId,
        pattern_type: d.patternType,
        severity: d.severity,
        confidence: d.confidence,
        element_text: d.elementText ?? null,
        element_role: d.elementRole ?? null,
        explanation: d.explanation,
        source_url: perception.url,
        metadata: {},
      }))
    );
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "detection",
    eventType: "detection_completed",
    message:
      result.detections.length > 0
        ? `Found ${result.detections.length} dark pattern(s)`
        : "No dark patterns detected on this page",
    status: "running",
  });

  return {
    currentStage: "detection",
    lastDetection: primary
      ? {
          patternType: primary.patternType,
          severity: primary.severity,
          confidence: primary.confidence,
          explanation: primary.explanation,
        }
      : undefined,
  };
};