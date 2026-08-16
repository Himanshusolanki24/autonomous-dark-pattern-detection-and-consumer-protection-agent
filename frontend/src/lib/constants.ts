import type { AgentId, PatternType, Severity } from "./types";

export const AGENT_LABELS: Record<AgentId, string> = {
  perception: "Perception Agent",
  detection: "Detection Agent",
  planning: "Planning Agent",
  action: "Action Agent",
  verification: "Verification Agent",
};

export const AGENT_SHORT: Record<AgentId, string> = {
  perception: "Perception",
  detection: "Detection",
  planning: "Planning",
  action: "Action",
  verification: "Verification",
};

export const PIPELINE_ORDER: AgentId[] = [
  "perception",
  "detection",
  "planning",
  "action",
  "verification",
];

export const PATTERN_LABELS: Record<PatternType, string> = {
  confirmshaming: "Confirmshaming",
  "roach-motel": "Roach Motel",
  "forced-continuity": "Forced Continuity",
  "drip-pricing": "Drip Pricing",
  "basket-sneaking": "Basket Sneaking",
  misdirection: "Misdirection",
  "hard-to-cancel": "Hard to Cancel",
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  running: "Running",
  approval: "Approval Required",
  completed: "Completed",
  failed: "Failed",
  blocked: "Blocked",
};

export const DEMO_SERVICE = {
  service: "Netflix",
  plan: "Premium Subscription",
  price: "₹649 / month",
  domain: "netflix.com",
  url: "https://www.netflix.com/account",
};