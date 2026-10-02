"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lock, RotateCw, ShieldAlert, Check, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase =
  | "loading"
  | "perceiving"
  | "detected"
  | "evidence"
  | "approval";

interface PhaseConfig {
  id: Phase;
  label: string;
  duration: number;
  color: string;
}

const PHASES: PhaseConfig[] = [
  { id: "loading",    label: "Loading page…",              duration: 1400, color: "bg-zinc-600" },
  { id: "perceiving", label: "Perceiving interface…",      duration: 1800, color: "bg-brand" },
  { id: "detected",   label: "Potential pattern detected", duration: 2200, color: "bg-amber-500" },
  { id: "evidence",   label: "Assembling evidence…",       duration: 1800, color: "bg-indigo-500" },
  { id: "approval",   label: "Awaiting your approval",     duration: 3000, color: "bg-foreground" },
];

const PIPELINE = ["PERCEIVE", "DETECT", "EXPLAIN", "PLAN", "APPROVE", "ACT", "VERIFY"] as const;
const ACTIVE_AT: Record<Phase, number> = {
  loading: -1,
  perceiving: 0,
  detected: 1,
  evidence: 2,
  approval: 4,
};

export function HeroBrowser() {
  const reduce = useReducedMotion();
  // If reduced motion, start at the last (approval) phase and stay there
  const [phaseIdx, setPhaseIdx] = useState(() => (reduce ? PHASES.length - 1 : 0));

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => {
      setPhaseIdx((p) => (p + 1) % PHASES.length);
    }, PHASES[phaseIdx].duration);
    return () => clearTimeout(t);
  }, [phaseIdx, reduce]);

  const phase = PHASES[phaseIdx];
  const activeStage = ACTIVE_AT[phase.id];
  const isDetected = phaseIdx >= 2;
  const isEvidence = phaseIdx >= 3;
  const isApproval = phaseIdx === 4;

  return (
    <div className="relative" role="img" aria-label="TrapKiller product visualization: browser analysis in progress">
      {/* ── Browser Chrome ─────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_80px_-24px_rgba(0,0,0,0.22)] ring-1 ring-border/50">

        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-border bg-zinc-50/80 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-border bg-white px-3 py-1 text-xs text-zinc-400">
            <Lock className="h-3 w-3 shrink-0 text-emerald-500" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.span
                key={phaseIdx >= 4 ? "cancel" : "account"}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.15 }}
                className="truncate font-mono"
              >
                {phaseIdx >= 4 ? "subscriptions.example.com/cancel" : "subscriptions.example.com/account"}
              </motion.span>
            </AnimatePresence>
            <RotateCw
              className={cn("ml-auto h-3 w-3 shrink-0 text-zinc-300", phaseIdx === 0 && !reduce && "animate-spin")}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Page viewport ────────────────────────────── */}
        <div className="relative h-[380px] overflow-hidden bg-white sm:h-[420px]">

          {/* Scan shimmer on load */}
          <AnimatePresence>
            {phaseIdx === 1 && !reduce && (
              <motion.div
                key="scan"
                initial={{ top: "-30%" }}
                animate={{ top: "130%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="pointer-events-none absolute inset-x-0 h-1/5 bg-gradient-to-b from-transparent via-brand/8 to-transparent"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          {/* Main page content */}
          <div className="absolute inset-0 p-5 sm:p-6">
            {/* Site header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="text-xs font-bold tracking-tight text-zinc-800">
                stream<span className="text-blue-600">flow</span>
              </span>
              <span className="text-[10px] text-zinc-400">Account · Billing</span>
            </div>

            {/* Subscription card */}
            <div className="mx-auto mt-4 max-w-xs rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                Premium Plan
              </p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
                ₹999{" "}
                <span className="text-xs font-normal text-zinc-400">/ month</span>
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-400">
                Renews automatically on 16 Sep
              </p>

              <div className="mt-4 space-y-2">
                {/* Primary retention CTA */}
                <div
                  className={cn(
                    "w-full rounded-lg bg-zinc-900 px-3 py-2 text-center text-[11px] font-medium text-white transition-all",
                    isDetected && "ring-2 ring-amber-400 ring-offset-1"
                  )}
                >
                  Keep My Premium Benefits
                  {isDetected && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="ml-2 inline-flex items-center gap-0.5 rounded bg-amber-500 px-1 py-0.5 text-[8px] font-bold uppercase text-white"
                    >
                      Trap
                    </motion.span>
                  )}
                </div>

                {/* Confirmshaming button */}
                <div
                  className={cn(
                    "relative w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-center text-[11px] text-zinc-400 transition-all",
                    isDetected && "border-amber-300 text-rose-500 ring-2 ring-amber-300 ring-offset-1"
                  )}
                >
                  No, I want to lose my benefits
                  {isDetected && (
                    <motion.span
                      initial={{ opacity: 0, x: 6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="absolute -right-2 -top-2 rounded bg-rose-500 px-1.5 py-0.5 text-[8px] font-bold uppercase text-white shadow-sm"
                    >
                      Confirmshaming
                    </motion.span>
                  )}
                </div>

                {/* Hidden cancel link */}
                <div
                  className={cn(
                    "block text-center text-[10px] text-zinc-300 underline decoration-dotted underline-offset-2",
                    isDetected && "ring-1 ring-amber-300 rounded-sm"
                  )}
                >
                  cancel membership
                </div>
              </div>
            </div>
          </div>

          {/* ── Evidence panel ────────────────────────── */}
          <AnimatePresence>
            {isEvidence && !isApproval && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="absolute right-4 top-4 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl"
                role="status"
                aria-live="polite"
              >
                <div className="border-b border-zinc-100 bg-zinc-50 px-3 py-2">
                  <div className="flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600">
                      Potential Pattern
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-900">Forced Continuity</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Confidence</span>
                    <span className="font-semibold tabular-nums text-zinc-700">78%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-zinc-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-amber-500"
                    />
                  </div>
                  <p className="mt-2 text-[10px] leading-4 text-zinc-500">
                    Subscription may renew without prominent notice.
                  </p>
                  <button
                    type="button"
                    tabIndex={-1}
                    className="mt-2.5 flex w-full items-center justify-center gap-1 rounded-md border border-brand/30 bg-brand-soft px-2 py-1.5 text-[10px] font-semibold text-brand"
                  >
                    View Evidence
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Approval overlay ─────────────────────── */}
          <AnimatePresence>
            {isApproval && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[3px]"
                role="dialog"
                aria-modal="true"
                aria-label="Human approval required"
              >
                <motion.div
                  initial={{ scale: 0.92, y: 10 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                  className="w-60 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                      <UserCheck className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                        Human Approval Required
                      </p>
                      <p className="text-sm font-semibold text-zinc-900">Cancel subscription?</p>
                    </div>
                  </div>
                  <p className="mt-2.5 text-[11px] leading-4 text-zinc-500">
                    This action may change your account state. TrapKiller has identified a possible cancellation path.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex-1 rounded-lg border border-border py-2 text-[11px] font-medium text-zinc-600"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      tabIndex={-1}
                      className="flex-1 rounded-lg bg-foreground py-2 text-[11px] font-medium text-white"
                    >
                      Approve
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Pipeline bar ──────────────────────────────── */}
        <div className="border-t border-border bg-zinc-50/60 px-4 py-2.5">
          <div className="flex items-center justify-between gap-1" role="list" aria-label="Agent pipeline stages">
            {PIPELINE.map((stage, i) => {
              const isDone = i < activeStage;
              const isActive = i === activeStage;
              return (
                <div
                  key={stage}
                  role="listitem"
                  className={cn(
                    "flex-1 text-center text-[8px] font-semibold uppercase tracking-wide transition-colors",
                    isDone
                      ? "text-emerald-600"
                      : isActive
                        ? "text-brand"
                        : "text-zinc-300"
                  )}
                >
                  {isDone && (
                    <span className="mr-0.5 inline-block">
                      <Check className="inline h-2 w-2" />
                    </span>
                  )}
                  {stage}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Status pill ──────────────────────────────────── */}
      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2" aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-lg",
              phase.color
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full bg-white/70",
                !isApproval && !reduce && "animate-dot-pulse"
              )}
              aria-hidden="true"
            />
            {phase.label}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
