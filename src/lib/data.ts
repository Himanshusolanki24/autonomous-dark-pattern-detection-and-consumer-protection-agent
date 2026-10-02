import type {
  ActivityRecord,
  CancellationTask,
  DarkPattern,
  RiskOverview,
  AgentId,
  Severity,
} from "./types";

/**
 * DEMO MODE DATA — explicitly isolated for development/demo purposes.
 * 
 * ⚠️ PRODUCTION WARNING ⚠️
 * This data is for development/testing only and must NOT be used in the
 * real investigation flow. The real flow uses backend agent sessions
 * with actual URLs and Playwright-perceived data.
 * 
 * To opt-in to demo mode, import from "@/lib/services/simulator"
 * and use demoSimulator.start() explicitly. Do NOT import mock data
 * directly in production component files.
 */

// Generic pattern data — not website-specific
export const demoPatterns: DarkPattern[] = [
  {
    id: "pat_confirm",
    type: "confirmshaming",
    severity: "high",
    confidence: 94,
    element: "Cancellation option",
    explanation:
      "The cancellation option uses guilt-inducing language to discourage the user from declining the offer.",
    whyItMatters:
      "Confirmshaming uses shame to pressure you into a choice you didn't intend to make.",
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
];

// Generic task data — not website-specific
export const demoTasks: CancellationTask[] = [
  {
    id: "task_example",
    service: "Example Service",
    plan: "Subscription",
    price: "$9.99 / month",
    domain: "example.com",
    status: "completed",
    createdAt: new Date().toISOString(),
    completedAt: new Date(Date.now() + 120000).toISOString(),
    patternCount: 2,
  },
];

// Generic activity records — not website-specific
export const demoActivity: ActivityRecord[] = [
  { id: "act_1", timestamp: new Date().toISOString(), agent: "perception", event: "Page analyzed", website: "example.com", status: "success" },
  { id: "act_2", timestamp: new Date(Date.now() - 1000).toISOString(), agent: "detection", event: "Roach Motel", website: "example.com", status: "warning" },
];

// Generic risk overview
export const demoRisk: RiskOverview = {
  overall: "medium",
  totalPatterns: 2,
  critical: 0,
  warnings: 2,
};

// Generic scanner history
export const demoScannerHistory = [
  { url: "example.com", risk: "medium" as const, patterns: 2, at: new Date(Date.now() - 86400000).toISOString() },
];

/**
 * Demo simulator — opt-in for development mode.
 * 
 * Usage: import { demoSimulator } from "@/lib/services/simulator";
 *        demoSimulator.start(demoTasks[0]);
 * 
 * This must NOT be called automatically in production investigation flow.
 * The real flow uses backend agent sessions with real URLs.
 */
export { demoSimulator } from "@/lib/services/simulator";

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function uid(prefix = "evt"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const severityOrder: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function maxSeverity(a: Severity, b: Severity): Severity {
  return severityOrder[b] > severityOrder[a] ? b : a;
}

export function severityTone(severity: Severity): {
  badge: string;
  dot: string;
  text: string;
} {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-600",
        text: "text-red-700",
      };
    case "high":
      return {
        badge: "bg-red-50 text-red-700 border-red-200",
        dot: "bg-red-600",
        text: "text-red-700",
      };
    case "medium":
      return {
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
        text: "text-amber-700",
      };
    case "low":
      return {
        badge: "bg-zinc-100 text-zinc-600 border-zinc-200",
        dot: "bg-zinc-400",
        text: "text-zinc-600",
      };
  }
}

export function agentTone(agent: AgentId): {
  color: string;
  dot: string;
} {
  switch (agent) {
    case "perception":
      return { color: "text-sky-700", dot: "bg-sky-500" };
    case "detection":
      return { color: "text-amber-700", dot: "bg-amber-500" };
    case "planning":
      return { color: "text-indigo-700", dot: "bg-indigo-500" };
    case "action":
      return { color: "text-blue-700", dot: "bg-blue-500" };
    case "verification":
      return { color: "text-emerald-700", dot: "bg-emerald-500" };
  }
}

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    return new URL(url).toString().replace(/\/$/, "");
  } catch {
    return url;
  }
}

export function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}