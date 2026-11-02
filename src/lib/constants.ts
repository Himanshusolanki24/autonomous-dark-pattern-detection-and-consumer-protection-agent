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
  "false-urgency": "False Urgency",
  urgency: "Urgency",
  nagging: "Nagging",
  "subscription-trap": "Subscription Trap",
  "hidden-costs": "Hidden Costs",
  "disguised-ads": "Disguised Ads",
  "forced-action": "Forced Action",
};

/**
 * Per-type "why it matters" copy for findings so the UI explains each class of
 * trick instead of one generic line. Mirrors the server taxonomy descriptions.
 */
export const WHY_IT_MATTERS: Record<PatternType, string> = {
  confirmshaming:
    "Guilt or shame language pressures you into keeping something you meant to cancel.",
  "roach-motel":
    "Getting in took one click; getting out is deliberately buried so you give up and keep paying.",
  "forced-continuity":
    "The subscription auto-renews into a paid plan without a clear reminder before billing.",
  "drip-pricing":
    "The real total is revealed only at the last step, so the price you agreed to is not the price you pay.",
  "basket-sneaking":
    "Extra items or add-ons land in your order without you actively choosing them.",
  misdirection:
    "Design draws your attention away from the option you actually want (often the decline button).",
  "hard-to-cancel":
    "The exit path is obscured — what you are seeing may make cancelling harder than it should be.",
  "false-urgency":
    "Countdowns or scarcity claims are used to rush a decision you would otherwise think through.",
  urgency:
    "Pressure via countdown timers or limited-stock claims on this page.",
  nagging:
    "Repeated prompts keep interrupting you with something unrelated to what you came to do.",
  "subscription-trap":
    "Hard-to-cancel subscription terms are coupled with recurring charges that continue by default.",
  "hidden-costs":
    "Costs are held back until a late step, so what looked cheap costs more at checkout.",
  "disguised-ads":
    "Advertising is styled as neutral content or interface, not as an ad.",
  "forced-action":
    "An unrelated action (signup, share, survey) is required before you can finish your task.",
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

/** Demo-mode service config. Uses a fictional service — not any real brand. */
export const DEMO_SERVICE = {
  service: "StreamFlow",
  plan: "Premium Subscription",
  price: "₹549 / month",
  domain: "streamflow.example.com",
  url: "/demo-target/account",
};