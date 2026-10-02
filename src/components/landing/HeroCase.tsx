"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { MousePointer2 } from "lucide-react";
import { Stamp } from "@/components/ui/case";

// One orchestrated loop: mark the traps, pause at the irreversible click,
// wait for the human, then stamp the case closed.
const BEAT_MS = 1500;
const LAST = 6; // step 6 holds the finished state for one beat before looping

function Flag({ on, label, children }: { on: boolean; label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <AnimatePresence>
        {on && (
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="pointer-events-none absolute -inset-1.5 rounded-xl border-2 border-marker"
          >
            <span className="absolute -top-3 right-3 rounded-md bg-marker px-2 py-0.5 text-[11px] font-semibold text-foreground">
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
  const [step, setStep] = useState(reduce ? 4 : 0);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s >= LAST ? 0 : s + 1)), BEAT_MS);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative" aria-label="Animated example: TrapKiller marking traps on a cancellation page" role="img">
      <div className="relative overflow-hidden rounded-2xl bg-[#0d1020] p-6 text-white shadow-[0_30px_60px_-20px_rgba(21,26,45,0.55)] sm:p-7">
        <p className="text-[14px] font-bold text-rose-400">▶ StreamVault</p>
        <p className="font-display mt-5 text-[22px] font-bold">Confirm cancellation</p>
        <p className="mt-1 text-[13px] text-white/50">Premium · ₹649 / month · you’ll lose 4K and downloads</p>

        <div className="mt-5 space-y-3">
          <Flag on={step >= 2} label="Retention trap">
            <p className="rounded-xl border border-dashed border-violet-400/50 bg-violet-500/10 px-4 py-3 text-[13px] text-violet-200">
              Last chance: keep your plan 1 month free. We’ll pause, not cancel.
            </p>
          </Flag>
          <Flag on={step >= 1} label="Confirmshaming">
            <p className="rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-4 py-3 text-center text-[14px] font-semibold">
              I don’t want to lose my benefits
            </p>
          </Flag>
          <div className="relative">
            <p className="rounded-xl border border-white/10 px-4 py-3 text-center text-[13px] text-white/45">
              Yes, cancel my subscription
            </p>
            <AnimatePresence>
              {step >= 3 && (
                <motion.span
                  initial={{ opacity: 0, x: 70, y: -50 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  className="absolute left-1/2 top-1/2 text-marker"
                  aria-hidden="true"
                >
                  <MousePointer2 className="h-5 w-5 fill-marker" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-4 h-7">
          <AnimatePresence mode="wait">
            {step === 3 && (
              <motion.p
                key="wait"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-[12px] font-medium text-amber-300"
              >
                <span className="h-1.5 w-1.5 animate-dot-pulse rounded-full bg-amber-300" />
                Paused. Waiting for your OK
              </motion.p>
            )}
            {step >= 4 && (
              <motion.p
                key="ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-[12px] font-medium text-emerald-300"
              >
                Approved by you
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-[#0d1020]/70 backdrop-blur-[1px]"
            >
              <span className="rounded-xl bg-white px-2 py-1">
                <Stamp>Cancelled</Stamp>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
