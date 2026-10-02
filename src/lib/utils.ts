import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { AgentId, Severity } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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