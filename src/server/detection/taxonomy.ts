// =============================================================================
// lib/detection/taxonomy.ts
// The dark-pattern taxonomy used by the DETECTION agent.
// Extensible — add categories here (and to the DB enum) as they are supported.
// =============================================================================

import type { PatternType, Severity } from "@/types/database";

export interface PatternDefinition {
  type: PatternType;
  label: string;
  defaultSeverity: Severity;
  /** When set, a heuristic match alone warrants at least this confidence. */
  baseConfidence: number;
  description: string;
}

export const TAXONOMY: PatternDefinition[] = [
  {
    type: "confirmshaming",
    label: "Confirmshaming",
    defaultSeverity: "high",
    baseConfidence: 0.72,
    description:
      "Shame or guilt language used to pressure the user into keeping a subscription or declining an option.",
  },
  {
    type: "roach_motel",
    label: "Roach Motel",
    defaultSeverity: "high",
    baseConfidence: 0.6,
    description:
      "Easy to get in, hard to get out. The cancellation/exit path is deliberately hard to find.",
  },
  {
    type: "forced_continuity",
    label: "Forced Continuity",
    defaultSeverity: "medium",
    baseConfidence: 0.55,
    description:
      "Free trials that auto-renew into paid plans without a clear reminder.",
  },
  {
    type: "drip_pricing",
    label: "Drip Pricing",
    defaultSeverity: "medium",
    baseConfidence: 0.55,
    description:
      "Fees are revealed progressively so the final total surprises the user.",
  },
  {
    type: "basket_sneaking",
    label: "Basket Sneaking",
    defaultSeverity: "medium",
    baseConfidence: 0.5,
    description:
      "Extra items or subscriptions are added to the order without explicit consent.",
  },
  {
    type: "false_urgency",
    label: "False Urgency",
    defaultSeverity: "medium",
    baseConfidence: 0.55,
    description:
      "Fake countdowns or scarcity claims that pressure the user into a quick decision.",
  },
  {
    type: "misdirection",
    label: "Misdirection",
    defaultSeverity: "low",
    baseConfidence: 0.45,
    description:
      "Attention is drawn away from the option the user actually wants.",
  },
  {
    type: "nagging",
    label: "Nagging",
    defaultSeverity: "low",
    baseConfidence: 0.45,
    description:
      "Repeated prompts that interrupt and push a decision unrelated to the task.",
  },
  {
    type: "subscription_trap",
    label: "Subscription Trap",
    defaultSeverity: "high",
    baseConfidence: 0.6,
    description:
      "A hard-to-find or hard-to-cancel subscription coupled with recurring charges.",
  },
  {
    type: "urgency",
    label: "Urgency",
    defaultSeverity: "low",
    baseConfidence: 0.45,
    description: "Pressure via countdown timers or limited-stock claims.",
  },
  {
    type: "hidden_costs",
    label: "Hidden Costs",
    defaultSeverity: "medium",
    baseConfidence: 0.5,
    description: "Costs that are concealed until the final step.",
  },
  {
    type: "disguised_ads",
    label: "Disguised Ads",
    defaultSeverity: "low",
    baseConfidence: 0.45,
    description: "Advertisements styled as content or native UI.",
  },
  {
    type: "forced_action",
    label: "Forced Action",
    defaultSeverity: "medium",
    baseConfidence: 0.5,
    description:
      "Requiring an unrelated action (e.g. newsletter signup) to complete a task.",
  },
];

export const PATTERN_LABELS: Record<PatternType, string> = Object.fromEntries(
  TAXONOMY.map((p) => [p.type, p.label])
) as Record<PatternType, string>;

export function patternDefinition(type: PatternType): PatternDefinition {
  return TAXONOMY.find((p) => p.type === type) ?? TAXONOMY[0];
}

/** Compose an overall risk from detections (highest severity wins). */
export function overallRisk(detections: { severity: Severity }[]): Severity {
  const rank: Record<Severity, number> = { low: 0, medium: 1, high: 2, critical: 3 };
  return detections.reduce<Severity>(
    (max, d) => (rank[d.severity] > rank[max] ? d.severity : max),
    "low"
  );
}