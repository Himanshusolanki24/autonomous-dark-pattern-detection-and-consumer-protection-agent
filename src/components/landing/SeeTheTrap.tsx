"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Check, Shield } from "lucide-react";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const DECEPTIVE_FLOW = [
  { label: "I want to cancel my subscription", isGoal: true },
  { label: "Keep subscription", trap: "Roach Motel" },
  { label: "Extra confirmation step", trap: "Friction" },
  { label: '"Don\'t you want to keep benefits?"', trap: "Confirmshaming" },
  { label: "Special retention offer", trap: "Retention" },
  { label: "Confusing CTA layout", trap: "Misdirection" },
  { label: "Cancellation option hidden", trap: "Interface Interference" },
];

const TRAPKILLER_FLOW = [
  { label: "I want to cancel my subscription", isGoal: true },
  { label: "Detects dark patterns on page", stage: "DETECT" },
  { label: "Explains evidence to user", stage: "EXPLAIN" },
  { label: "Plans safer navigation path", stage: "PLAN" },
  { label: "Asks your approval first", stage: "APPROVE", isKey: true },
  { label: "Executes approved action", stage: "ACT" },
  { label: "Verifies outcome with evidence", stage: "VERIFY" },
];

const TRAP_COLORS: Record<string, string> = {
  "Roach Motel": "bg-rose-50 border-rose-200 text-rose-700",
  Friction: "bg-orange-50 border-orange-200 text-orange-700",
  Confirmshaming: "bg-rose-50 border-rose-200 text-rose-700",
  Retention: "bg-amber-50 border-amber-200 text-amber-700",
  Misdirection: "bg-amber-50 border-amber-200 text-amber-700",
  "Interface Interference": "bg-rose-50 border-rose-200 text-rose-700",
};

const STAGE_COLORS: Record<string, string> = {
  DETECT: "bg-amber-50 border-amber-200 text-amber-700",
  EXPLAIN: "bg-indigo-50 border-indigo-200 text-indigo-700",
  PLAN: "bg-blue-50 border-blue-200 text-blue-700",
  APPROVE: "bg-emerald-50 border-emerald-200 text-emerald-700",
  ACT: "bg-brand-soft border-brand/30 text-brand",
  VERIFY: "bg-emerald-50 border-emerald-200 text-emerald-700",
};

function FlowStep({
  label,
  badge,
  badgeColor,
  isGoal,
  isKey,
  delay,
}: {
  label: string;
  badge?: string;
  badgeColor?: string;
  isGoal?: boolean;
  isKey?: boolean;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, x: -10 }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center"
    >
      <div
        className={cn(
          "relative w-full rounded-lg border px-3 py-2.5 text-center text-[12px] font-medium",
          isGoal
            ? "border-zinc-300 bg-zinc-900 text-white font-semibold"
            : isKey
              ? "border-emerald-300 bg-emerald-900 text-white font-semibold"
              : "border-border bg-white text-zinc-700"
        )}
      >
        {label}
        {badge && (
          <span
            className={cn(
              "absolute -right-1 -top-1.5 rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide border",
              badgeColor
            )}
          >
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function SeeTheTrap() {
  return (
    <section
      className="border-y border-border bg-zinc-50/40"
      aria-labelledby="seethetrap-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              See the trap
            </p>
            <h2
              id="seethetrap-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              The same goal. Two very different paths.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-zinc-500">
              Without assistance, a simple cancellation request can be turned
              into a multi-step maze. TrapKiller navigates it with you.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* Left — deceptive flow */}
          <div className="rounded-2xl border border-rose-200/60 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600">
                Without TrapKiller
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {DECEPTIVE_FLOW.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <FlowStep
                    label={step.label}
                    badge={step.trap}
                    badgeColor={step.trap ? TRAP_COLORS[step.trap] : undefined}
                    isGoal={step.isGoal}
                    delay={i * 0.08}
                  />
                  {i < DECEPTIVE_FLOW.length - 1 && (
                    <ArrowDown
                      className="h-3.5 w-3.5 text-rose-300"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2.5">
              <p className="text-[11px] font-medium text-rose-700">
                Result: still subscribed — or gave up.
              </p>
            </div>
          </div>

          {/* Right — TrapKiller flow */}
          <div className="rounded-2xl border border-emerald-200/60 bg-white p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-700">
                With TrapKiller
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {TRAPKILLER_FLOW.map((step, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <FlowStep
                    label={step.label}
                    badge={step.stage}
                    badgeColor={step.stage ? STAGE_COLORS[step.stage] : undefined}
                    isGoal={step.isGoal}
                    isKey={step.isKey}
                    delay={i * 0.08}
                  />
                  {i < TRAPKILLER_FLOW.length - 1 && (
                    <ArrowDown
                      className="h-3.5 w-3.5 text-emerald-300"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5">
              <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
              <p className="text-[11px] font-medium text-emerald-700">
                Outcome verified. You stayed in control.
              </p>
            </div>
          </div>
        </div>

        {/* Key insight */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-xl border border-border bg-surface p-5">
            <Shield
              className="mt-0.5 h-5 w-5 shrink-0 text-brand"
              aria-hidden="true"
            />
            <p className="text-sm leading-6 text-zinc-600">
              <strong className="font-semibold text-foreground">
                The key difference:
              </strong>{" "}
              TrapKiller never silently takes irreversible actions. Before any
              consequential step, it stops and asks for your explicit approval.
              You remain the decision-maker.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
