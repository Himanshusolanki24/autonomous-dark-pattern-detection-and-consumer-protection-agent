"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  RotateCw,
  Lock,
  ShieldAlert,
  ArrowRight,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Phase {
  id: "perceiving" | "analyzing" | "detected" | "planning" | "navigating" | "approval";
  label: string;
  duration: number;
}

const PHASES: Phase[] = [
  { id: "perceiving", label: "Perceiving page…", duration: 1700 },
  { id: "analyzing", label: "Analyzing interface…", duration: 1700 },
  { id: "detected", label: "Confirmshaming detected", duration: 2600 },
  { id: "planning", label: "Planning next action…", duration: 1700 },
  { id: "navigating", label: "Navigating cancellation flow…", duration: 2400 },
  { id: "approval", label: "Approval required", duration: 3400 },
];

const phaseTone: Record<Phase["id"], string> = {
  perceiving: "bg-zinc-900/80 text-white",
  analyzing: "bg-zinc-900/80 text-white",
  detected: "bg-amber-500 text-white",
  planning: "bg-indigo-600 text-white",
  navigating: "bg-brand text-white",
  approval: "bg-red-600 text-white",
};

export function AgentBrowser() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const effective = reduce ? PHASES.length - 1 : phase;

  useEffect(() => {
    if (reduce) return;
    const current = PHASES[phase];
    const t = setTimeout(() => {
      setPhase((p) => (p + 1) % PHASES.length);
    }, current.duration);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const current = PHASES[effective];
  const detected = effective >= 2;
  const navigating = effective >= 4;
  const approval = effective === PHASES.length - 1;
  const analyzing = effective === 1 || effective === 2;

  return (
    <div className="relative">
      {/* Browser chrome */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3 border-b border-border bg-zinc-50 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 py-1 text-xs text-zinc-500">
            <Lock className="h-3 w-3 shrink-0 text-emerald-600" />
            <AnimatePresence mode="wait">
              <motion.span
                key={navigating ? "confirm" : "account"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                className="truncate font-mono"
              >
                {navigating ? "stream-example.com/confirm" : "stream-example.com/account"}
              </motion.span>
            </AnimatePresence>
            <RotateCw className="ml-auto h-3 w-3 shrink-0 text-zinc-300" />
          </div>
        </div>

        {/* Page viewport */}
        <div className="relative h-[400px] overflow-hidden bg-white sm:h-[440px]">
          {/* scan shimmer while perceiving/analyzing */}
          <AnimatePresence>
            {phase === 0 && (
              <motion.div
                initial={{ top: "-20%" }}
                animate={{ top: "120%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-brand/10 to-transparent"
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!navigating ? (
              <motion.div
                key="account"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight text-zinc-900">
                    stream<span className="text-blue-600">-example</span>
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    Account · Billing
                  </span>
                </div>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <p className="text-xs font-medium text-zinc-500">Premium Membership</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
                    ₹999 <span className="text-sm font-normal text-zinc-400">/ month</span>
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Renews automatically on 16 Sep
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {/* Keep button — the retention trap */}
                    <button
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        "w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white",
                        analyzing && "ring-2 ring-blue-400 ring-offset-1"
                      )}
                    >
                      Keep My Premium Benefits
                    </button>

                    {/* Confirmshaming decline option */}
                    <div className="relative">
                      <button
                        type="button"
                        tabIndex={-1}
                        className={cn(
                          "w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-500",
                          analyzing && "ring-2 ring-blue-400 ring-offset-1",
                          detected && !navigating &&
                            "text-red-600 ring-2 ring-amber-400 ring-offset-1"
                        )}
                      >
                        No, I want to lose my benefits
                      </button>
                      {detected && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute -right-2 -top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm"
                        >
                          Trap
                        </motion.span>
                      )}
                    </div>

                    {/* Roach motel — hard to find exit */}
                    <button
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        "mx-auto block text-xs text-zinc-400 underline decoration-dotted underline-offset-2",
                        analyzing && "ring-2 ring-blue-400 ring-offset-1 rounded-sm"
                      )}
                    >
                      Cancel membership
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight text-zinc-900">
                    stream<span className="text-blue-600">-example</span>
                  </span>
                  <span className="text-[10px] font-medium text-zinc-400">
                    Confirm cancellation
                  </span>
                </div>

                <div className="mx-auto mt-5 max-w-sm rounded-xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <p className="text-xs font-medium text-zinc-500">Summary</p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                    Premium Membership
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Access ends at the end of your billing period.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    <button
                      type="button"
                      tabIndex={-1}
                      className={cn(
                        "w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white",
                        approval && "animate-warn-outline"
                      )}
                    >
                      Cancel Subscription
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-600"
                    >
                      Keep Membership
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detection panel */}
          <AnimatePresence>
            {detected && !navigating && (
              <motion.div
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="absolute right-4 top-4 w-52 rounded-xl border border-amber-200 bg-white p-3.5 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-600">
                    Dark pattern detected
                  </p>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-zinc-900">Confirmshaming</p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "94%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-amber-500"
                  />
                </div>
                <p className="mt-1 text-[10px] font-medium text-zinc-400">
                  94% confidence
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approval gate overlay */}
          <AnimatePresence>
            {approval && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
              >
                <motion.div
                  initial={{ scale: 0.94, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="w-64 rounded-2xl border border-red-200 bg-white p-5 text-center shadow-2xl"
                >
                  <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-zinc-900">
                    Approval required
                  </p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    The agent paused before the irreversible action.
                  </p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-white"
                  >
                    I approve — cancel it
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Status pill */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
        <motion.div
          layout
          className={cn(
            "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium shadow-md",
            phaseTone[current.id]
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              approval ? "bg-red-200" : "bg-current opacity-80 animate-dot-pulse"
            )}
          />
          {current.label}
          {approval && <Check className="h-3 w-3" />}
        </motion.div>
      </div>

      {/* Path arrow — agent moving toward exit */}
      <AnimatePresence>
        {detected && !navigating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -left-6 top-1/2 hidden -translate-y-1/2 lg:block"
          >
            <div className="flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-[10px] font-medium text-indigo-600 shadow-md">
              <motion.span
                animate={reduce ? undefined : { x: [0, 6, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center"
              >
                <ArrowRight className="h-3 w-3" />
              </motion.span>
              exit path
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}