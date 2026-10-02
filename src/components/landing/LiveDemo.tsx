"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Lock, RotateCw, Play } from "lucide-react";
import { CONSOLE_EVENTS } from "./constants";
import { cn } from "@/lib/utils";

const STAGE_TONE: Record<string, { cls: string; dot: string }> = {
  PERCEPTION: { cls: "bg-sky-500/15 text-sky-300", dot: "bg-sky-400" },
  DETECTION: { cls: "bg-amber-500/15 text-amber-300", dot: "bg-amber-400" },
  PLANNING: { cls: "bg-indigo-500/15 text-indigo-300", dot: "bg-indigo-400" },
  ACTION: { cls: "bg-blue-500/15 text-blue-300", dot: "bg-blue-400" },
  APPROVAL: { cls: "bg-red-500/15 text-red-300", dot: "bg-red-400" },
};

const STEP_MS = 900;
const HOLD_MS = 2200;

export function LiveDemo() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(1);
  const effective = reduce ? CONSOLE_EVENTS.length : count;

  useEffect(() => {
    if (reduce) return;
    const done = count >= CONSOLE_EVENTS.length;
    const t = setTimeout(
      () => {
        if (done) setCount(1);
        else setCount((c) => c + 1);
      },
      done ? HOLD_MS : STEP_MS
    );
    return () => clearTimeout(t);
  }, [count, reduce]);

  const navigated = effective >= 4;
  const approved = effective >= CONSOLE_EVENTS.length;

  return (
    <section id="live-demo" className="relative scroll-mt-24 overflow-hidden bg-zinc-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(800px 360px at 15% 0%, rgba(37,99,235,0.14), transparent), radial-gradient(700px 320px at 90% 100%, rgba(220,38,38,0.10), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
            Live demo
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Watch the agent fight the maze.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            A real-time look at the agent console as it works toward one goal:
            getting you out.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2">
          {/* Browser */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 bg-zinc-900/80 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-white/5 px-3 py-1 text-xs text-zinc-400">
                <Lock className="h-3 w-3 shrink-0 text-emerald-400" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={navigated ? "confirm" : "account"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="truncate font-mono"
                  >
                    {navigated ? "stream-example.com/confirm" : "stream-example.com/account"}
                  </motion.span>
                </AnimatePresence>
                <RotateCw className="ml-auto h-3 w-3 text-zinc-600" />
              </div>
            </div>

            <div className="relative h-[320px] overflow-hidden bg-zinc-950 sm:h-[380px]">
              <AnimatePresence mode="wait">
                {!navigated ? (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        stream<span className="text-blue-400">-example</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">Billing</span>
                    </div>
                    <div className="mx-auto mt-4 max-w-sm rounded-xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs text-zinc-400">Premium Membership</p>
                      <p className="mt-1 text-2xl font-semibold text-white">
                        ₹999 <span className="text-sm text-zinc-500">/ month</span>
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="rounded-lg bg-white/90 py-2.5 text-center text-sm font-medium text-zinc-900">
                          Keep My Premium Benefits
                        </div>
                        <div className="relative rounded-lg border border-white/15 bg-zinc-900 py-2.5 text-center text-sm text-zinc-400">
                          No, I want to lose my benefits
                          {count >= 2 && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -right-1.5 -top-2 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white"
                            >
                              TRAP
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        stream<span className="text-blue-400">-example</span>
                      </span>
                      <span className="text-[10px] text-zinc-500">Confirm cancellation</span>
                    </div>
                    <div className="mx-auto mt-4 max-w-sm rounded-xl border border-white/10 bg-white/5 p-5">
                      <p className="text-xs text-zinc-400">Summary</p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        Premium Membership
                      </p>
                      <div className="mt-4 space-y-2">
                        <div
                          className={cn(
                            "rounded-lg bg-red-600 py-2.5 text-center text-sm font-medium text-white",
                            approved && "animate-warn-outline"
                          )}
                        >
                          Cancel Subscription
                        </div>
                        <div className="rounded-lg border border-white/15 bg-zinc-900 py-2.5 text-center text-sm text-zinc-400">
                          Keep Membership
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {approved && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-red-400/30 bg-red-500/15 px-3 py-1 text-[11px] font-medium text-red-300"
                >
                  ⚠ Approval required — paused before irreversible action
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Agent console */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-dot-pulse" />
              <p className="text-xs font-medium text-zinc-300">Agent console</p>
              <span className="ml-auto text-[10px] text-zinc-500">live</span>
            </div>

            <div className="space-y-1.5 p-4 font-mono text-xs">
              {CONSOLE_EVENTS.map((ev, i) => {
                const tone = STAGE_TONE[ev.stage];
                const isActive = i === effective - 1 && !approved;
                const isDone = i < effective || (approved && i < CONSOLE_EVENTS.length);
                return (
                  <motion.div
                    key={`${ev.stage}-${ev.label}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: isDone || isActive ? 1 : 0.35, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2.5 py-2",
                      isActive && "bg-white/5"
                    )}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : isActive ? (
                        <span className={cn("h-2 w-2 rounded-full", tone.dot, "animate-dot-pulse")} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "w-20 shrink-0 rounded px-1.5 py-0.5 text-center text-[9px] font-semibold tracking-wide",
                        tone.cls
                      )}
                    >
                      {ev.stage}
                    </span>
                    <span
                      className={cn(
                        "truncate",
                        isDone ? "text-zinc-300" : isActive ? "text-white" : "text-zinc-600"
                      )}
                    >
                      {ev.label}
                    </span>
                  </motion.div>
                );
              })}

              <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-zinc-400">
                <Play className="h-3 w-3" />
                <span className="text-[11px]">
                  The final click is always yours — the agent can&apos;t approve itself.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}