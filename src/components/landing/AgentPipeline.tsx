"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { PIPELINE_STAGES } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const STAGE_STYLE = [
  { ring: "ring-sky-400",    dot: "bg-sky-500",     text: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-200" },
  { ring: "ring-amber-400",  dot: "bg-amber-500",   text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  { ring: "ring-indigo-400", dot: "bg-indigo-500",  text: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200" },
  { ring: "ring-blue-400",   dot: "bg-blue-500",    text: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  { ring: "ring-emerald-400",dot: "bg-emerald-500", text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { ring: "ring-brand",      dot: "bg-brand",       text: "text-brand",       bg: "bg-brand-soft", border: "border-brand/30" },
  { ring: "ring-emerald-500",dot: "bg-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
] as const;

// Mini visual per stage inside the preview panel
const STAGE_VISUALS = [
  {
    title: "Full page structure observed",
    items: ["DOM analyzed", "Interactive elements mapped", "Form fields identified"],
  },
  {
    title: "Potential patterns flagged",
    items: ["Confirmshaming — 94% confidence", "Roach Motel — 91% confidence", "Misdirection — 58% confidence"],
  },
  {
    title: "Evidence assembled for each pattern",
    items: ["Affected element identified", "Why it matters explained", "Automated estimate provided"],
  },
  {
    title: "Safer path determined",
    items: ["User goal: cancel subscription", "Bypass retention offers", "Locate exit path"],
  },
  {
    title: "Paused — waiting for you",
    items: ["Action described clearly", "Risk level shown", "Reject or Approve"],
  },
  {
    title: "Performing approved action",
    items: ["Only approved steps executed", "Real browser session used", "Reversible where possible"],
  },
  {
    title: "Outcome confirmed",
    items: ["Confirmation page detected", "Account state verified", "Evidence captured"],
  },
];

export function AgentPipeline() {
  const [active, setActive] = useState(0);
  const stage = PIPELINE_STAGES[active];
  const style = STAGE_STYLE[active];
  const visual = STAGE_VISUALS[active];

  return (
    <section
      id="how-it-works"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="pipeline-heading"
    >
      <SectionHeading
        eyebrow="How it works"
        title={
          <span id="pipeline-heading">
            Seven stages. Zero surprises.
          </span>
        }
        sub={
          <>
            Every TrapKiller investigation follows a fixed pipeline. Select a
            stage to see what the agent does — and why it matters.
          </>
        }
      />

      <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_380px]">

        {/* ── Stage selector ───────────────────────────── */}
        <div>
          {/* Horizontal stage strip on desktop */}
          <div
            className="relative mb-8 hidden items-center gap-0 lg:flex"
            role="tablist"
            aria-label="Pipeline stages"
          >
            {PIPELINE_STAGES.map((s, i) => {
              const sty = STAGE_STYLE[i];
              const isActive = i === active;
              const isDone = i < active;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`stage-panel-${s.id}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      "group flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      isActive
                        ? cn("ring-2 shadow-md", sty.ring, sty.bg)
                        : isDone
                          ? "opacity-60 hover:opacity-100"
                          : "hover:bg-zinc-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? cn(sty.dot, "text-white")
                          : isDone
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-zinc-100 text-zinc-500"
                      )}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </span>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-zinc-400">
                      0{s.index}
                    </p>
                    <p
                      className={cn(
                        "text-[11px] font-semibold",
                        isActive ? sty.text : "text-zinc-600"
                      )}
                    >
                      {s.label}
                    </p>
                  </button>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div
                      className={cn(
                        "h-px flex-1 transition-colors",
                        i < active ? "bg-emerald-300" : "bg-border"
                      )}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Active stage detail (large) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              id={`stage-panel-${stage.id}`}
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "rounded-2xl border p-6 sm:p-8",
                style.bg, style.border
              )}
            >
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white",
                    style.dot
                  )}
                  aria-hidden="true"
                >
                  <stage.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                    Stage 0{stage.index} of 07
                  </p>
                  <h3 className={cn("mt-0.5 text-2xl font-semibold tracking-tight", style.text)}>
                    {stage.label}
                  </h3>
                </div>
              </div>

              <p className="mt-4 text-base leading-relaxed text-zinc-600">
                {stage.detail}
              </p>

              {/* Mobile: stage list nav */}
              <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
                {PIPELINE_STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={i === active}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-colors",
                      i === active
                        ? cn(style.dot, "text-white")
                        : "bg-white border border-border text-zinc-600 hover:bg-zinc-50"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Next/prev */}
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActive((a) => Math.max(0, a - 1))}
                  disabled={active === 0}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActive((a) => Math.min(PIPELINE_STAGES.length - 1, a + 1))}
                  disabled={active === PIPELINE_STAGES.length - 1}
                  className={cn(
                    "rounded-lg px-4 py-2 text-[12px] font-medium text-white transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    style.dot
                  )}
                >
                  Next →
                </button>
                <span className="ml-auto text-[11px] text-zinc-400">
                  {active + 1} / {PIPELINE_STAGES.length}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Stage preview panel ───────────────────── */}
        <Reveal delay={0.1} className="sticky top-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
            >
              {/* Mini browser header */}
              <div className="flex items-center gap-2 border-b border-border bg-zinc-50 px-3 py-2">
                <div className="flex gap-1" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                  <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                  <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                </div>
                <span className="text-[9px] font-mono text-zinc-400">
                  agent.trapkiller.app
                </span>
              </div>

              {/* Stage visual content */}
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full animate-dot-pulse",
                      style.dot
                    )}
                    aria-hidden="true"
                  />
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", style.text)}>
                    {stage.label} · Stage 0{stage.index}
                  </p>
                </div>

                <p className="text-xs font-semibold text-zinc-700">{visual.title}</p>

                <ul className="mt-3 space-y-2" aria-label={`Stage ${stage.index} details`}>
                  {visual.items.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.25 }}
                      className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-[11px] text-zinc-600"
                    >
                      <Check
                        className={cn("h-3.5 w-3.5 shrink-0", style.text)}
                        aria-hidden="true"
                      />
                      {item}
                    </motion.li>
                  ))}
                </ul>

                <div className={cn("mt-4 rounded-lg p-3 text-[11px] font-medium", style.bg, style.text)}>
                  {stage.summary}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
