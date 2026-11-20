"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, MousePointer2 } from "lucide-react";
import { Stamp, Window } from "@/components/ui/case";
import { cn } from "@/lib/utils";

// One orchestrated loop: read the page, mark the traps, pause at the
// irreversible click, wait for the human, then stamp the case closed.
const BEAT_MS = 1450;
const LAST = 5;

const COPY = [
  "Reading the page…",
  "Confirmshaming marked",
  "Retention trap marked",
  "Paused before the final click",
  "You approved the cancel",
  "Cancelled · proof saved",
] as const;

function Flag({
  on,
  label,
  tone = "marker",
  children,
}: {
  on: boolean;
  label: string;
  tone?: "marker" | "danger";
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className={cn(
              "pointer-events-none absolute -inset-1.5 rounded-xl border-2",
              tone === "danger" ? "border-red-400/80" : "border-marker"
            )}
          >
            <span
              className={cn(
                "absolute -top-2.5 right-3 rounded-md px-1.5 py-0.5 text-[10.5px] font-bold shadow-sm",
                tone === "danger" ? "bg-red-500 text-white" : "bg-marker text-foreground"
              )}
            >
              {label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeroCase() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s >= LAST ? 0 : s + 1)), BEAT_MS);
    return () => clearInterval(t);
  }, [reduce]);

  // Reduced motion gets the finished frame, not a frozen first beat.
  const beat = reduce ? LAST : step;
  const marks = beat >= 2 ? 2 : beat >= 1 ? 1 : 0;

  return (
    <div
      className="relative"
      aria-label="Animated example: TrapKiller marking dark patterns on a cancellation page, then waiting for approval before cancelling"
      role="img"
    >
      {/* Ambient wash behind the window */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[32px] bg-gradient-to-br from-brand/12 via-signal/8 to-marker/20 blur-2xl"
      />

      <div className="relative animate-float [animation-duration:7s]">
        <Window
          url="streamvault.example/account/cancel"
          right={
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[10px] text-zinc-500">
              <span className={cn("h-1.5 w-1.5 rounded-full", marks > 0 ? "bg-brand" : "bg-zinc-300")} />
              {marks} {marks === 1 ? "mark" : "marks"}
            </span>
          }
          className="relative"
        >
          <div className="relative overflow-hidden bg-gradient-to-b from-surface to-zinc-50/60 p-4 sm:p-5">
            {/* Scan sweep */}
            {!reduce && beat === 0 && (
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="animate-scan-down absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-brand/10 to-transparent" />
                <div className="animate-scan-down absolute inset-x-0 h-px bg-brand/60" />
              </div>
            )}

            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 text-[11px] font-bold text-white">
                S
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-semibold leading-none">StreamVault</p>
                <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
                  Account · cancel
                </p>
              </div>
              <span className="ml-auto rounded-md bg-zinc-100 px-2 py-1 text-[9.5px] font-semibold uppercase tracking-wide text-zinc-500">
                Live page
              </span>
            </div>

            <p className="font-display mt-4 text-[19px] font-bold leading-tight">Confirm cancellation</p>
            <p className="mt-1 text-[11.5px] text-zinc-500">
              Premium · ₹649 / month · you&rsquo;ll lose 4K and downloads
            </p>

            <div className="mt-4 space-y-2.5">
              <Flag on={beat >= 2} label="Retention trap">
                <p className="rounded-xl border border-dashed border-violet-300 bg-violet-50 px-3.5 py-2.5 text-[11.5px] leading-snug text-violet-800">
                  Last chance: keep your plan 1 month free. We&rsquo;ll pause, not cancel.
                </p>
              </Flag>

              <Flag on={beat >= 1} label="Confirmshaming">
                <p className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-3.5 py-2.5 text-center text-[12.5px] font-semibold text-white">
                  I don&rsquo;t want to lose my benefits
                </p>
              </Flag>

              <div className="relative">
                <p
                  className={cn(
                    "rounded-xl border px-3.5 py-2.5 text-center text-[11.5px] font-medium transition-colors",
                    beat >= 3
                      ? "border-brand/40 bg-brand-soft text-blue-700"
                      : "border-border text-zinc-400"
                  )}
                >
                  Yes, cancel my subscription
                </p>
                <AnimatePresence>
                  {beat >= 3 && (
                    <motion.span
                      initial={{ opacity: 0, x: 60, y: -40 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 150, damping: 18 }}
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-foreground"
                      aria-hidden="true"
                    >
                      <span className="absolute -inset-2 rounded-full bg-brand/15 animate-pulse-ring" />
                      <MousePointer2 className="relative h-4 w-4 fill-foreground" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Status rail */}
            <div className="mt-4 flex h-8 items-center gap-2 border-t border-border pt-3">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full transition-colors",
                  beat >= 5
                    ? "bg-emerald-500 text-white"
                    : beat === 3
                      ? "bg-amber-400 text-foreground"
                      : "bg-zinc-100 text-zinc-400"
                )}
              >
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              </span>
              <AnimatePresence mode="wait">
                <motion.p
                  key={beat}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.18 }}
                  className="truncate text-[11px] font-medium text-zinc-600"
                  aria-live="polite"
                >
                  {COPY[beat]}
                </motion.p>
              </AnimatePresence>
              <span className="ml-auto shrink-0 font-mono text-[9.5px] text-zinc-400">
                {beat + 1}/{LAST + 1}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {beat >= 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center rounded-b-2xl bg-surface/75 backdrop-blur-[1px]"
              >
                <motion.span
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                  className="rounded-xl bg-surface px-2.5 py-1.5 shadow-lift"
                >
                  <Stamp>Cancelled</Stamp>
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </Window>

        {/* Floating evidence chip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="absolute -bottom-4 -left-3 hidden items-center gap-2 rounded-xl border border-border bg-surface/95 px-3 py-2 shadow-lift backdrop-blur sm:flex"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-marker/25">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">
            quote kept as evidence
          </span>
        </motion.div>
      </div>
    </div>
  );
}
