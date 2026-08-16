import type {
  ActivityRecord,
  CancellationTask,
  DarkPattern,
  RiskOverview,
} from "./types";

const base = Date.parse("2026-08-16T15:40:00Z");
const iso = (offsetSec: number) => new Date(base + offsetSec * 1000).toISOString();

export const mockPatterns: DarkPattern[] = [
  {
    id: "pat_confirm",
    type: "confirmshaming",
    severity: "high",
    confidence: 94,
    element: "Cancellation option",
    explanation:
      "The cancellation option uses guilt-inducing language to discourage the user from declining the offer.",
    whyItMatters:
      "Confirmshaming uses shame to pressure you into a choice you didn't intend to make. Nobody should be guilt-tripped into staying subscribed.",
  },
  {
    id: "pat_roach",
    type: "roach-motel",
    severity: "high",
    confidence: 91,
    element: "Cancellation flow",
    explanation:
      "The user can enter the cancellation process easily, but the exit path is intentionally difficult to locate.",
    whyItMatters:
      "Roach motels make it trivial to get in but hard to leave. A subscription you cannot cancel is effectively not yours.",
  },
  {
    id: "pat_retention",
    type: "hard-to-cancel",
    severity: "medium",
    confidence: 87,
    element: "Retention offer step",
    explanation:
      "A forced retention offer interrupts the cancellation flow and attempts to reverse the user's decision.",
    whyItMatters:
      "Forced retention offers add friction designed to wear you down. The agent navigates them so you don't have to.",
  },
  {
    id: "pat_forced",
    type: "forced-continuity",
    severity: "medium",
    confidence: 78,
    element: "Billing terms",
    explanation:
      "The free trial auto-renews without a clear reminder before the billing date.",
    whyItMatters:
      "Forced continuity signs you up for recurring charges you didn't clearly agree to.",
  },
  {
    id: "pat_drip",
    type: "drip-pricing",
    severity: "medium",
    confidence: 72,
    element: "Checkout summary",
    explanation:
      "Optional add-ons are added to the total only at the final step of checkout.",
    whyItMatters:
      "Drip pricing hides the true cost until the last moment, when you're most likely to accept it.",
  },
  {
    id: "pat_basket",
    type: "basket-sneaking",
    severity: "low",
    confidence: 64,
    element: "Subscription checkbox",
    explanation:
      "A subscription checkbox is pre-ticked by default during signup.",
    whyItMatters:
      "Basket sneaking adds items to your purchase without you choosing them.",
  },
  {
    id: "pat_misdirection",
    type: "misdirection",
    severity: "low",
    confidence: 58,
    element: "Dialog controls",
    explanation:
      "The primary action is visually de-emphasised so the user misses it.",
    whyItMatters:
      "Misdirection hides the option you actually want behind visual noise.",
  },
];

export const mockTasks: CancellationTask[] = [
  {
    id: "task_netflix",
    service: "Netflix",
    plan: "Premium Subscription",
    price: "₹649 / month",
    domain: "netflix.com",
    status: "completed",
    createdAt: iso(0),
    completedAt: iso(120),
    patternCount: 4,
  },
  {
    id: "task_spotify",
    service: "Spotify",
    plan: "Duo Plan",
    price: "₹199 / month",
    domain: "spotify.com",
    status: "approval",
    createdAt: iso(360),
    patternCount: 2,
  },
  {
    id: "task_adobe",
    service: "Adobe Creative Cloud",
    plan: "Photography Plan",
    price: "₹1,688 / month",
    domain: "adobe.com",
    status: "running",
    createdAt: iso(420),
    patternCount: 3,
  },
  {
    id: "task_aws",
    service: "Amazon Prime",
    plan: "Annual Membership",
    price: "₹1,499 / year",
    domain: "amazon.in",
    status: "waiting",
    createdAt: iso(900),
    patternCount: 0,
  },
  {
    id: "task_linkedin",
    service: "LinkedIn Premium",
    plan: "Career Plan",
    price: "₹1,399 / month",
    domain: "linkedin.com",
    status: "failed",
    createdAt: iso(1800),
    patternCount: 1,
  },
  {
    id: "task_medium",
    service: "Medium",
    plan: "Membership",
    price: "$5 / month",
    domain: "medium.com",
    status: "blocked",
    createdAt: iso(2400),
    patternCount: 2,
  },
];

export const mockActivity: ActivityRecord[] = [
  { id: "act_1", timestamp: iso(1), agent: "perception", event: "Page analyzed", website: "netflix.com", status: "success" },
  { id: "act_2", timestamp: iso(2), agent: "detection", event: "Roach Motel", website: "netflix.com", status: "warning" },
  { id: "act_3", timestamp: iso(3), agent: "detection", event: "Confirmshaming", website: "netflix.com", status: "warning" },
  { id: "act_4", timestamp: iso(4), agent: "planning", event: "Next action determined", website: "netflix.com", status: "success" },
  { id: "act_5", timestamp: iso(5), agent: "action", event: "Clicked Manage Subscription", website: "netflix.com", status: "success" },
  { id: "act_6", timestamp: iso(6), agent: "detection", event: "Retention offer detected", website: "netflix.com", status: "warning" },
  { id: "act_7", timestamp: iso(7), agent: "action", event: "Selected cancellation option", website: "netflix.com", status: "success" },
  { id: "act_8", timestamp: iso(118), agent: "verification", event: "Cancellation verified", website: "netflix.com", status: "verified" },
];

export const mockRisk: RiskOverview = {
  overall: "high",
  totalPatterns: 4,
  critical: 1,
  warnings: 3,
};

export const mockScannerHistory = [
  { url: "netflix.com", risk: "high" as const, patterns: 4, at: iso(-86400) },
  { url: "amazon.in", risk: "medium" as const, patterns: 2, at: iso(-172800) },
  { url: "example.com", risk: "low" as const, patterns: 0, at: iso(-259200) },
];

export function getTask(id: string): CancellationTask | undefined {
  return mockTasks.find((t) => t.id === id);
}