"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck,
  ShieldAlert,
  Check,
  Ban,
  Lock,
  ArrowDown,
  Bot,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

type ApprovalState = "idle" | "approved" | "rejected";

const FLOW_STEPS = [
  {
    label: "AI Agent",
    note: "Perceives, detects, explains, plans",
    icon: Bot,
    tone: "border-blue-200 bg-blue-50",
    iconTone: "text-blue-600",
    isGate: false,
  },
  {
    label: "Reversible navigation",
    note: "Clicks, scrolls, fills forms — can be stopped anytime",
    icon: null,
    tone: "border-border bg-surface",
    iconTone: "text-zinc-400",
    isGate: false,
  },
  {
    label: "Human Approval Gate",
    note: "Agent pauses — you decide",
    icon: UserCheck,
    tone: "border-amber-300 bg-amber-50",
    iconTone: "text-amber-600",
    isGate: true,
  },
  {
    label: "Irreversible action",
    note: "Cancellation, deletion, account change",
    icon: null,
    tone: "border-border bg-surface",
    iconTone: "text-zinc-400",
    isGate: false,
  },
  {
    label: "Verification",
    note: "Outcome confirmed with evidence",
    icon: Check,
    tone: "border-emerald-200 bg-emerald-50",
    iconTone: "text-emerald-600",
    isGate: false,
  },
] as const;

export function SafetySection() {
  const [state, setState] = useState<ApprovalState>("idle");

  return (
    <section
      id="human-control"
      className="border-y border-border bg-surface/50 scroll-mt-20"
      aria-labelledby="safety-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">

          {/* ── Left copy ───────────────────────────────── */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Human control"
              title={
                <span id="safety-heading">
                  AI can navigate.{" "}
                  <span className="text-brand">You make the decision.</span>
                </span>
              }
              sub={
                <>
                  TrapKiller is designed around a single principle: the agent
                  handles the tedious navigation, but the user retains control
                  of every action that cannot be undone.
                </>
              }
            />

            <Reveal delay={0.12} className="mt-8">
              <div className="flex flex-col items-start gap-0" role="list" aria-label="Agent control flow">
                {FLOW_STEPS.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-start w-full" role="listitem">
                    <div
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg border px-3.5 py-2.5",
                        step.tone
                      )}
                    >
                      {step.icon ? (
                        <step.icon
                          className={cn("h-4 w-4 shrink-0", step.iconTone)}
                          aria-hidden="true"
                        />
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 ml-1.5" aria-hidden="true" />
                      )}
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            step.isGate ? "text-amber-800" : "text-zinc-800"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-zinc-500">{step.note}</p>
                      </div>
                      {step.isGate && (
                        <span className="ml-auto text-[9px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                          Your gate
                        </span>
                      )}
                    </div>
                    {i < FLOW_STEPS.length - 1 && (
                      <span className="ml-6 flex h-5 items-center" aria-hidden="true">
                        <ArrowDown className="h-3 w-3 text-zinc-200" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    <Lock className="h-3 w-3" aria-hidden="true" />
                    Reversible
                  </p>
                  <p className="mt-1.5 text-[11px] leading-5 text-emerald-800/80">
                    Navigation can be stopped at any time before the gate.
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    Gated
                  </p>
                  <p className="mt-1.5 text-[11px] leading-5 text-amber-800/80">
                    Irreversible actions require your explicit approval.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── Right — approval modal demo ────────── */}
          <Reveal delay={0.15}>
            <div
              className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.2)] sm:p-8"
              role="region"
              aria-label="Approval modal demo"
            >
              {/* Modal header */}
              <div className="flex items-start gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground">
                  <UserCheck className="h-5 w-5 text-white" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Human Approval Required
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-foreground">
                    Cancel subscription?
                  </p>
                </div>
                <span className="ml-auto rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                  Paused
                </span>
              </div>

              {/* Context */}
              <div className="mt-4 space-y-3">
                <p className="text-sm leading-6 text-zinc-600">
                  This action may change your account state. TrapKiller has
                  identified a possible cancellation path and is waiting for
                  your approval before proceeding.
                </p>

                {/* Risk indicators */}
                <div className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-medium">Action type</span>
                    <span className="font-semibold text-rose-600">Irreversible</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-medium">Path identified</span>
                    <span className="font-semibold text-emerald-600">Yes — 3 steps</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500 font-medium">Dark patterns bypassed</span>
                    <span className="font-semibold text-zinc-700">2 detected</span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <AnimatePresence mode="wait">
                  {state === "idle" ? (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-2.5"
                    >
                      <button
                        type="button"
                        onClick={() => setState("approved")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98]"
                      >
                        <Check className="h-4 w-4" aria-hidden="true" />
                        Approve — cancel subscription
                      </button>
                      <button
                        type="button"
                        onClick={() => setState("rejected")}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98]"
                      >
                        <Ban className="h-4 w-4" aria-hidden="true" />
                        Reject — stop agent
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={state}
                      initial={{ opacity: 0, scale: 0.97, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 280, damping: 22 }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border p-4",
                        state === "approved"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-zinc-200 bg-zinc-50"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                          state === "approved" ? "bg-emerald-600" : "bg-zinc-700"
                        )}
                        aria-hidden="true"
                      >
                        {state === "approved" ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <Ban className="h-4 w-4 text-white" />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">
                          {state === "approved"
                            ? "Approved — agent continuing"
                            : "Rejected — agent stopped"}
                        </p>
                        <p className="text-[11px] text-zinc-500">
                          {state === "approved"
                            ? "TrapKiller will now execute and verify."
                            : "No action was taken. You remain in control."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setState("idle")}
                        className="ml-auto text-[10px] text-zinc-400 hover:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                        aria-label="Reset demo"
                      >
                        Reset
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
