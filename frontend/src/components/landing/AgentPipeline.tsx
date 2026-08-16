"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, RotateCw } from "lucide-react";
import { PIPELINE_STAGES } from "./constants";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const STAGE_COLORS = [
  { ring: "ring-sky-400", dot: "bg-sky-500", text: "text-sky-600", bar: "bg-sky-400" },
  { ring: "ring-amber-400", dot: "bg-amber-500", text: "text-amber-600", bar: "bg-amber-400" },
  { ring: "ring-indigo-400", dot: "bg-indigo-500", text: "text-indigo-600", bar: "bg-indigo-400" },
  { ring: "ring-blue-400", dot: "bg-blue-500", text: "text-blue-600", bar: "bg-blue-400" },
  { ring: "ring-emerald-400", dot: "bg-emerald-500", text: "text-emerald-600", bar: "bg-emerald-400" },
] as const;

// Per-stage highlight position inside the mini browser viewport (% coords)
const STAGE_HIGHLIGHT = [
  { label: "Entire page structure", box: { top: 12, left: 8, width: 84, height: 76 } },
  { label: "Decline option — confirmshaming", box: { top: 58, left: 18, width: 64, height: 10 } },
  { label: "Planned path → cancel flow", box: { top: 72, left: 18, width: 64, height: 6 } },
  { label: "Navigating to subscription settings", box: { top: 22, left: 18, width: 64, height: 9 } },
  { label: "Outcome verified — cancelled", box: { top: 40, left: 18, width: 64, height: 22 } },
] as const;

export function AgentPipeline() {
  const [active, setActive] = useState(1);
  const stage = PIPELINE_STAGES[active];
  const color = STAGE_COLORS[active];
  const highlight = STAGE_HIGHLIGHT[active];

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8" id="agent">
      <Reveal className="max-w-2xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          The agent pipeline
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Five steps. Zero maze.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Hover a stage to see what the agent does — and watch the matching part
          of the page light up.
        </p>
      </Reveal>

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_420px]">
        {/* Stage nodes */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {PIPELINE_STAGES.map((s, i) => {
            const c = STAGE_COLORS[i];
            const isActive = i === active;
            return (
              <button
                key={s.id}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={cn(
                  "group relative flex-1 rounded-xl border bg-surface p-4 text-left transition-all duration-300",
                  isActive
                    ? cn("border-transparent shadow-lg ring-2", c.ring, "-translate-y-1")
                    : "border-border hover:border-zinc-300 hover:bg-zinc-50"
                )}
                aria-pressed={isActive}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                    isActive ? cn(c.dot, "text-white") : "bg-zinc-100 text-zinc-500"
                  )}
                >
                  <s.icon className="h-4.5 w-4.5" />
                </span>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                  0{s.index}
                </p>
                <p className={cn("mt-0.5 text-sm font-semibold", isActive && c.text)}>
                  {s.label}
                </p>
                <AnimatePresence>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-2 overflow-hidden text-xs leading-5 text-zinc-600"
                    >
                      {s.detail}
                    </motion.p>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>

        {/* Mini browser reacting to the active stage */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-md">
            <div className="flex items-center gap-2 border-b border-border bg-zinc-50 px-3 py-2">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex flex-1 items-center gap-1.5 rounded-md border border-border bg-white px-2 py-0.5 text-[10px] text-zinc-400">
                <Lock className="h-2.5 w-2.5 text-emerald-500" />
                <AnimatePresence mode="wait">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate font-mono"
                  >
                    {active >= 3
                      ? "stream-example.com/subscription-settings"
                      : "stream-example.com/account"}
                  </motion.span>
                </AnimatePresence>
                <RotateCw className="ml-auto h-2.5 w-2.5 text-zinc-300" />
              </div>
            </div>

            <div className="relative h-56 bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-900">stream-example</span>
                <span className="text-[9px] text-zinc-400">Billing</span>
              </div>
              <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <p className="text-[10px] text-zinc-400">Premium Membership</p>
                <p className="text-sm font-semibold text-zinc-900">₹999 / month</p>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="rounded-md bg-zinc-900 py-1.5 text-center text-[10px] font-medium text-white">
                  Keep My Premium Benefits
                </div>
                <div className="rounded-md border border-zinc-200 bg-white py-1.5 text-center text-[10px] text-zinc-400">
                  No, I want to lose my benefits
                </div>
              </div>

              {/* Stage highlight overlay */}
              <AnimatePresence>
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <motion.div
                    initial={{ x: 6 }}
                    animate={{ x: 0 }}
                    className={cn(
                      "absolute rounded-md ring-2 ring-offset-1",
                      color.ring
                    )}
                    style={{
                      top: `${highlight.box.top}%`,
                      left: `${highlight.box.left}%`,
                      width: `${highlight.box.width}%`,
                      height: `${highlight.box.height}%`,
                    }}
                  />
                  <div className="absolute bottom-2 right-2 rounded-md bg-white/95 px-2 py-1 text-[9px] font-medium shadow-sm border border-border">
                    <span className={color.dot}>&nbsp;</span>{" "}
                    <span className="text-zinc-600">{highlight.label}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* stage progress bar */}
            <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", color.dot, "animate-dot-pulse")} />
              <p className={cn("text-[11px] font-medium", color.text)}>
                {stage.index} · {stage.summary}
              </p>
              <span className="ml-auto text-[10px] text-zinc-400">stage {stage.index}/5</span>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}