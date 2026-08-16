"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ShieldAlert,
  UserCheck,
  Lock,
  Check,
  Ban,
  Bot,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const FLOW = [
  { icon: Bot, label: "Agent", note: "navigates · analyzes · prepares cancellation", tone: "text-blue-600" },
  { label: "Reversible navigation", note: "clicks, typing, moving through screens", tone: "text-zinc-500" },
  { label: "USER APPROVAL", note: "the human gate", tone: "text-red-600", gate: true },
  { label: "Irreversible action", note: "final cancellation", tone: "text-zinc-500" },
  { label: "Verification", note: "outcome confirmed with evidence", tone: "text-emerald-600" },
];

export function SafetySection() {
  const [state, setState] = useState<"idle" | "done" | "stopped">("idle");

  return (
    <section id="safety" className="border-y border-border bg-surface/60 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Copy + flow */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Human-in-the-loop"
              title={
                <>
                  Autonomous doesn&apos;t mean{" "}
                  <span className="text-brand">uncontrolled.</span>
                </>
              }
              sub={
                <>
                  The agent handles the tedious navigation.{" "}
                  <strong className="font-semibold text-foreground">
                    You control the irreversible action.
                  </strong>
                </>
              }
            />

            <Reveal delay={0.12} className="mt-8">
              <div className="flex flex-col items-start gap-0">
                {FLOW.map((step, i) => (
                  <div key={step.label} className="flex flex-col items-start">
                    <div
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2",
                        step.gate
                          ? "border-2 border-red-300 bg-red-50"
                          : i === 0
                            ? "border border-blue-200 bg-blue-50"
                            : "border border-border bg-white"
                      )}
                    >
                      {step.icon && <step.icon className={cn("h-4 w-4", step.tone)} />}
                      <div>
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            step.gate ? "text-red-700" : "text-zinc-800"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-[11px] text-zinc-500">{step.note}</p>
                      </div>
                    </div>
                    {i < FLOW.length - 1 && (
                      <span className="ml-6 flex h-6 items-center">
                        <ArrowDown className="h-3.5 w-3.5 text-zinc-300" />
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Approval card */}
          <Reveal delay={0.15}>
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.3)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft">
                    <UserCheck className="h-4 w-4 text-brand" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Human approval
                  </p>
                </div>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                  paused
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
                Ready to cancel Premium?
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                The agent reached the final step. This action ends your access —
                so it&apos;s waiting for you.
              </p>

              <div className="mt-6 space-y-2.5">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setState(state === "done" ? "idle" : "done")}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    state === "done"
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white hover:bg-red-700"
                  )}
                >
                  {state === "done" ? (
                    <>
                      <Check className="h-4 w-4" /> Cancelled — verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4" /> Cancel Subscription
                    </>
                  )}
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setState(state === "stopped" ? "idle" : "stopped")}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                    state === "stopped"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-border-strong bg-surface text-foreground hover:bg-zinc-50"
                  )}
                >
                  {state === "stopped" ? (
                    <>
                      <Check className="h-4 w-4" /> Agent stopped
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" /> Stop Agent
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    <Lock className="h-3 w-3" /> Reversible
                  </p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                    The agent&apos;s clicks and navigation can be undone or stopped.
                  </p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-red-700">
                    <ShieldAlert className="h-3 w-3" /> Irreversible
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-800/80">
                    Final cancellation is gated behind your explicit approval.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}