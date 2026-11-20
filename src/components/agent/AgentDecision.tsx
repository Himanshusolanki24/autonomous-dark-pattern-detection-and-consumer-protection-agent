"use client";

import { BrainCircuit, ShieldCheck } from "lucide-react";
import type { AgentDecision as Decision } from "@/lib/types";
import { cn } from "@/lib/utils";

function Row({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">{label}</span>
      <span className={cn("text-right text-[12.5px] leading-5", highlight ? "font-semibold text-brand" : "text-zinc-700")}>
        {value}
      </span>
    </div>
  );
}

export function AgentDecision({ decision }: { decision: Decision | null }) {
  if (!decision) return null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-brand" aria-hidden="true" />
        <h4 className="font-display text-[14px] font-semibold">Agent decision</h4>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-400">
          Summary · not raw reasoning
        </span>
      </div>
      <div className="divide-y divide-border/70">
        <Row label="Goal" value={decision.goal} />
        <Row label="Current state" value={decision.currentState} />
        <Row label="Next action" value={decision.nextAction} highlight />
        <div className="flex items-start gap-3 py-2">
          <span className="mt-0.5 shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">Reason</span>
          <p className="text-[12.5px] leading-5 text-zinc-700">{decision.reason}</p>
        </div>
      </div>
      <div
        className={cn(
          "mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-[11.5px] font-medium leading-5",
          decision.safe ? "bg-success-soft text-emerald-700" : "bg-warning-soft text-amber-800"
        )}
      >
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {decision.safe
          ? "The next action is reversible and safe to execute."
          : "The next action is irreversible and requires your approval."}
      </div>
    </div>
  );
}
