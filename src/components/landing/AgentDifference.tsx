"use client";

import { motion } from "framer-motion";
import { ArrowDown, Check, X } from "lucide-react";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const DETECTOR_STEPS = [
  { label: "Website analyzed", done: true },
  { label: "Potential pattern identified", done: true },
  { label: "Report generated", done: true },
  { label: "User left to navigate", done: false, missing: true },
  { label: "No evidence shown", done: false, missing: true },
  { label: "No human control layer", done: false, missing: true },
  { label: "No verification", done: false, missing: true },
];

const TRAPKILLER_STEPS = [
  { label: "User sets a goal", stage: "Goal" },
  { label: "Website observed", stage: "PERCEIVE" },
  { label: "Potential patterns detected", stage: "DETECT" },
  { label: "Evidence explained to user", stage: "EXPLAIN" },
  { label: "Safer path planned", stage: "PLAN" },
  { label: "User gives explicit approval", stage: "APPROVE", key: true },
  { label: "Approved action executed", stage: "ACT" },
  { label: "Outcome verified with proof", stage: "VERIFY" },
];

const STAGE_COLORS: Record<string, string> = {
  Goal: "bg-zinc-100 text-zinc-600 border-zinc-200",
  PERCEIVE: "bg-sky-50 text-sky-600 border-sky-200",
  DETECT: "bg-amber-50 text-amber-600 border-amber-200",
  EXPLAIN: "bg-indigo-50 text-indigo-600 border-indigo-200",
  PLAN: "bg-blue-50 text-blue-600 border-blue-200",
  APPROVE: "bg-emerald-50 text-emerald-700 border-emerald-300",
  ACT: "bg-brand-soft text-brand border-brand/30",
  VERIFY: "bg-emerald-50 text-emerald-700 border-emerald-300",
};

const DIFFERENCES = [
  { label: "Evidence shown to user", detector: false, trapkiller: true },
  { label: "Human approval gate", detector: false, trapkiller: true },
  { label: "Outcome verification", detector: false, trapkiller: true },
  { label: "Navigates on your behalf", detector: false, trapkiller: true },
  { label: "Audit trail", detector: false, trapkiller: true },
  { label: "Pattern detection", detector: true, trapkiller: true },
];

export function AgentDifference() {
  return (
    <section
      className="border-y border-border bg-zinc-50/40"
      aria-labelledby="difference-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              The agent difference
            </p>
            <h2
              id="difference-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              Detection is only the beginning.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-500">
              A scanner tells you something is wrong. TrapKiller explains the
              evidence, navigates the maze, and keeps you in control of every
              decision.
            </p>
          </div>
        </Reveal>

        {/* Side-by-side flows */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Traditional detector */}
          <Reveal delay={0.05}>
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Traditional scanner
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-zinc-700">
                    Detect. Report. Stop.
                  </p>
                </div>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-[10px] font-medium text-zinc-500">
                  Limited
                </span>
              </div>

              <div className="space-y-2">
                {DETECTOR_STEPS.map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {i > 0 && (
                      <ArrowDown
                        className="my-1 h-3.5 w-3.5 text-zinc-200"
                        aria-hidden="true"
                      />
                    )}
                    <div
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[12px] font-medium",
                        step.missing
                          ? "border-zinc-100 bg-zinc-50 text-zinc-300 line-through decoration-zinc-300"
                          : "border-zinc-200 bg-white text-zinc-700"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          step.done && !step.missing ? "bg-emerald-100" : "bg-zinc-100"
                        )}
                        aria-hidden="true"
                      >
                        {step.done && !step.missing ? (
                          <Check className="h-2.5 w-2.5 text-emerald-600" />
                        ) : (
                          <X className="h-2.5 w-2.5 text-zinc-300" />
                        )}
                      </span>
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* TrapKiller */}
          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-brand/30 bg-white p-6 sm:p-8 ring-1 ring-brand/10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    TrapKiller Agent
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">
                    Detect. Explain. Navigate. Verify.
                  </p>
                </div>
                <span className="rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 text-[10px] font-semibold text-brand">
                  Full Agent
                </span>
              </div>

              <div className="space-y-2">
                {TRAPKILLER_STEPS.map((step, i) => (
                  <div key={i} className="flex flex-col items-center">
                    {i > 0 && (
                      <ArrowDown
                        className="my-1 h-3.5 w-3.5 text-zinc-200"
                        aria-hidden="true"
                      />
                    )}
                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ delay: i * 0.07, duration: 0.35 }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[12px] font-medium",
                        step.key
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border-zinc-200 bg-white text-zinc-700"
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                          STAGE_COLORS[step.stage]
                        )}
                        aria-label={`Stage: ${step.stage}`}
                      >
                        {step.stage}
                      </span>
                      {step.label}
                      {step.key && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wide text-emerald-600">
                          You decide
                        </span>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Difference table */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-12 max-w-2xl overflow-hidden rounded-xl border border-border bg-surface">
            <div className="grid grid-cols-3 border-b border-border bg-zinc-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              <span>Feature</span>
              <span className="text-center">Scanner</span>
              <span className="text-center text-brand">TrapKiller</span>
            </div>
            {DIFFERENCES.map((row, i) => (
              <div
                key={i}
                className={cn(
                  "grid grid-cols-3 items-center px-4 py-3 text-[12px]",
                  i < DIFFERENCES.length - 1 && "border-b border-border"
                )}
              >
                <span className="font-medium text-zinc-700">{row.label}</span>
                <span className="flex justify-center">
                  {row.detector ? (
                    <Check className="h-4 w-4 text-emerald-500" aria-label="Yes" />
                  ) : (
                    <X className="h-4 w-4 text-zinc-300" aria-label="No" />
                  )}
                </span>
                <span className="flex justify-center">
                  {row.trapkiller ? (
                    <Check className="h-4 w-4 text-brand" aria-label="Yes" />
                  ) : (
                    <X className="h-4 w-4 text-zinc-300" aria-label="No" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
