// =============================================================================
// lib/confidence.ts
// One helper for interpreting finding confidences so every UI surface
// (bar, drawer, labels) can never disagree about the same number.
//
// Canonical scale is 0–1 (what the backend's classifier, neural head and LLM
// gate all emit). Graph/DB values may occasionally exceed 1 after boosting, so
// pct() clamps into 0–100.
// =============================================================================

export type ConfidenceTier = "high" | "medium" | "low";

/** Tier breakpoints on the 0–1 scale (mirrored by the drawer's copy). */
export const CONFIDENCE_HIGH_FROM = 0.8;
export const CONFIDENCE_MEDIUM_FROM = 0.6;

/**
 * 0–1 confidence → integer percent (0–100), rounded once and clamped.
 * Values >1 are treated as saturated (rendered as 100%) — they can only be
 * runaway data, never a real percentage.
 */
export function confidencePct(confidence: number): number {
  const raw = confidence <= 1 ? confidence * 100 : 100;
  return Math.max(0, Math.round(Math.min(100, raw)));
}

/** Framework for labelling a finding — matches what ConfidenceBar shows. */
export function confidenceTier(confidence: number): ConfidenceTier {
  if (confidence >= CONFIDENCE_HIGH_FROM) return "high";
  if (confidence >= CONFIDENCE_MEDIUM_FROM) return "medium";
  return "low";
}

export const CONFIDENCE_TIER_LABEL: Record<ConfidenceTier, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};
