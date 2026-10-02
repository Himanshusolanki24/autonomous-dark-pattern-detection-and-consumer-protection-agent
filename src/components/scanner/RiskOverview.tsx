"use client";

import { motion } from "framer-motion";
import { Gauge, AlertTriangle, ShieldAlert, ListChecks } from "lucide-react";
import type { RiskOverview } from "@/lib/types";
import { SEVERITY_LABELS } from "@/lib/constants";
import { cn, severityTone } from "@/lib/utils";

export function RiskOverview({ risk }: { risk: RiskOverview }) {
  const tone = severityTone(risk.overall);

  const stats = [
    { label: "Patterns Detected", value: risk.totalPatterns, icon: ListChecks },
    { label: "Critical", value: risk.critical, icon: ShieldAlert },
    { label: "Warnings", value: risk.warnings, icon: AlertTriangle },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        Risk Overview
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <span className={cn("flex h-12 w-12 items-center justify-center rounded-xl", tone.badge)}>
            <Gauge className={cn("h-6 w-6", tone.text)} />
          </span>
          <div>
            <p className={cn("text-2xl font-semibold", tone.text)}>
              {SEVERITY_LABELS[risk.overall]}
            </p>
            <p className="text-xs text-muted-foreground">Overall Risk</p>
          </div>
        </div>
        <div className="ml-auto grid grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <s.icon className="mx-auto h-4 w-4 text-zinc-400" />
              <p className="mt-1 text-xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}