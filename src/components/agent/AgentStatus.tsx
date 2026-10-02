"use client";

import { cn } from "@/lib/utils";
import type { AgentStatus as AgentStatusType } from "@/lib/types";

const STATUS_META: Record<
  AgentStatusType,
  { label: string; dot: string; badge: string }
> = {
  idle: {
    label: "Agent Idle",
    dot: "bg-zinc-400",
    badge: "border-zinc-200 bg-surface text-zinc-600",
  },
  running: {
    label: "Agent Online",
    dot: "bg-emerald-500 animate-dot-pulse",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  completed: {
    label: "Agent Complete",
    dot: "bg-emerald-500",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  blocked: {
    label: "Approval Required",
    dot: "bg-amber-500 animate-dot-pulse",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  failed: {
    label: "Agent Stopped",
    dot: "bg-red-500",
    badge: "border-red-200 bg-red-50 text-red-700",
  },
};

export function AgentStatus({
  status,
  className,
}: {
  status: AgentStatusType;
  className?: string;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        meta.badge,
        className
      )}
      role="status"
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}