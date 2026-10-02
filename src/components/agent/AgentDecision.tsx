"use client";

import { BrainCircuit, ShieldCheck } from "lucide-react";
import type { AgentDecision as Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </span>
      <span
        className={cn(
          "text-right text-sm",
          highlight ? "font-medium text-brand" : "text-zinc-700"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function AgentDecision({ decision }: { decision: Decision | null }) {
  if (!decision) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-indigo-600" />
        <h4 className="text-sm font-semibold">Agent Decision</h4>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
          Decision summary · not raw reasoning
        </span>
      </div>
      <div className="divide-y divide-border/70">
        <Row label="Goal" value={decision.goal} />
        <Row label="Current state" value={decision.currentState} />
        <Row label="Next action" value={decision.nextAction} highlight />
        <div className="flex items-start gap-3 py-2">
          <span className="mt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-400">
            Reason
          </span>
          <p className="text-sm text-zinc-700">{decision.reason}</p>
        </div>
      </div>
      <div
        className={cn(
          "mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
          decision.safe
            ? "bg-success-soft text-emerald-700"
            : "bg-danger-soft text-red-700"
        )}
      >
        {decision.safe && <ShieldCheck className="h-3.5 w-3.5" />}
        {decision.safe
          ? "The next action is reversible and safe to execute."
          : "The next action is irreversible and requires your approval."}
      </div>
    </div>
  );
}