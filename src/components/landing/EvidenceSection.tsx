"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, FileSearch, ChevronRight } from "lucide-react";
import { DETECTION_ELEMENTS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const RISK_STYLE = {
  high: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
    ring: "ring-rose-200",
    icon: "text-rose-500",
    dot: "bg-rose-500",
  },
  medium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
    ring: "ring-amber-200",
    icon: "text-amber-500",
    dot: "bg-amber-500",
  },
};

export function EvidenceSection() {
  const [selected, setSelected] = useState(DETECTION_ELEMENTS[0].id);
  const active = DETECTION_ELEMENTS.find((e) => e.id === selected)!;
  const riskStyle = RISK_STYLE[active.risk];

  return (
    <section
      id="detection"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="evidence-heading"
    >
      <SectionHeading
        eyebrow="Evidence"
        title={
          <span id="evidence-heading">
            Don&apos;t just tell users something is wrong.{" "}
            <span className="text-brand">Show them why.</span>
          </span>
        }
        sub={
          <>
            Every detection comes with an evidence panel — showing the affected
            element, an automated confidence estimate, and why it may matter to
            the user. No black boxes.
          </>
        }
      />

      <div className="mt-14 grid items-start gap-8 lg:grid-cols-[1fr_420px]">
        {/* ── Detection list ─────────────────────────── */}
        <Reveal>
          <div className="space-y-3" role="list" aria-label="Detected patterns">
            {DETECTION_ELEMENTS.map((el) => {
              const isActive = el.id === selected;
              const sty = RISK_STYLE[el.risk];
              return (
                <button
                  key={el.id}
                  type="button"
                  onClick={() => setSelected(el.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "group w-full rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    isActive
                      ? cn("bg-white ring-2 shadow-sm", sty.ring, "border-transparent")
                      : "border-border bg-surface hover:bg-white hover:border-zinc-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        isActive
                          ? cn("border-transparent", sty.badge)
                          : "border-border bg-zinc-50 text-zinc-400"
                      )}
                      aria-hidden="true"
                    >
                      <ShieldAlert className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{el.label}</p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={cn(
                              "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                              sty.badge
                            )}
                          >
                            {el.risk === "high" ? "High" : "Medium"}
                          </span>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-zinc-300 transition-transform",
                              isActive && "rotate-90 text-zinc-500"
                            )}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-zinc-500 line-clamp-2">
                        {el.explanation}
                      </p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div
                      className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100"
                      role="progressbar"
                      aria-valuenow={el.confidence}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Confidence: ${el.confidence}%`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${el.confidence}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        className={cn("h-full rounded-full", sty.bar)}
                      />
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums text-zinc-400">
                      {el.confidence}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] text-zinc-400">
            Confidence is an automated estimate. Always verify with the full evidence.
          </p>
        </Reveal>

        {/* ── Evidence panel ──────────────────────────── */}
        <Reveal delay={0.1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="sticky top-24 overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
            >
              {/* Panel header */}
              <div className="border-b border-border bg-zinc-50 px-5 py-4">
                <div className="flex items-center gap-2">
                  <FileSearch className="h-4 w-4 text-zinc-400" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Evidence Inspector
                  </p>
                </div>
              </div>

              <div className="p-5">
                {/* Pattern name + risk */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-foreground">
                    {active.label}
                  </h3>
                  <span
                    className={cn(
                      "shrink-0 rounded border px-2 py-1 text-[10px] font-bold uppercase",
                      riskStyle.badge
                    )}
                  >
                    {active.risk === "high" ? "High Risk" : "Medium Risk"}
                  </span>
                </div>

                {/* Confidence meter */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Confidence (automated estimate)</span>
                    <span className="font-semibold tabular-nums">{active.confidence}%</span>
                  </div>
                  <div
                    className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100"
                    role="progressbar"
                    aria-valuenow={active.confidence}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <motion.div
                      key={active.id}
                      initial={{ width: 0 }}
                      animate={{ width: `${active.confidence}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn("h-full rounded-full", riskStyle.bar)}
                    />
                  </div>
                </div>

                {/* Evidence details */}
                <div className="mt-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Affected Element
                    </p>
                    <p className="mt-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[11px] text-zinc-700">
                      {active.affectedElement}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Evidence
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-zinc-600">
                      {active.explanation}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Why it may matter
                    </p>
                    <p className="mt-1.5 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5 text-[12px] leading-5 text-amber-800">
                      {active.whyItMatters}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className={cn(
                    "mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[12px] font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                    active.risk === "high"
                      ? "bg-rose-600 text-white"
                      : "bg-amber-500 text-white"
                  )}
                  aria-label={`View full evidence for ${active.label}`}
                >
                  <FileSearch className="h-4 w-4" aria-hidden="true" />
                  View Full Evidence
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
