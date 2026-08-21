"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { DARK_PATTERNS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

export function ProblemSection() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <section
      id="product"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="problem-heading"
    >
      <SectionHeading
        eyebrow="The problem"
        title={
          <span id="problem-heading">
            The web can make the wrong choice feel like the{" "}
            <span className="text-brand">easy choice.</span>
          </span>
        }
        sub={
          <>
            Deceptive patterns exploit visual hierarchy, language, and friction
            to guide users toward outcomes that serve the service — not the user.
            TrapKiller identifies these patterns and explains the evidence.
          </>
        }
      />

      <Reveal delay={0.1}>
        <div
          className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
          aria-label="Dark patterns explained"
        >
          {DARK_PATTERNS.map((pattern, i) => {
            const isExpanded = expanded === pattern.id;
            return (
              <motion.div
                key={pattern.id}
                role="listitem"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : pattern.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`pattern-detail-${pattern.id}`}
                  className={cn(
                    "group w-full rounded-xl border bg-surface p-5 text-left transition-all duration-200",
                    isExpanded
                      ? pattern.risk === "high"
                        ? "border-rose-200 ring-1 ring-rose-200 shadow-sm"
                        : "border-amber-200 ring-1 ring-amber-200 shadow-sm"
                      : "border-border hover:border-zinc-300 hover:shadow-sm"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-white text-lg shadow-sm"
                        aria-hidden="true"
                      >
                        {pattern.icon}
                      </span>
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                          {pattern.brief}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                          {pattern.label}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                        pattern.risk === "high"
                          ? "bg-rose-50 text-rose-600"
                          : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {pattern.risk === "high" ? "High" : "Medium"}
                    </span>
                  </div>

                  {/* Brief description */}
                  <p className="mt-3 text-[13px] leading-5 text-zinc-500">
                    {pattern.explanation}
                  </p>

                  {/* Expandable detail */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        id={`pattern-detail-${pattern.id}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-3">
                          {/* Example */}
                          <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-zinc-400">
                              Example
                            </p>
                            <p className="mt-1 text-[11px] italic text-zinc-600">
                              {pattern.example}
                            </p>
                          </div>

                          {/* Impact */}
                          <div className="flex items-start gap-2">
                            <TriangleAlert
                              className={cn(
                                "mt-0.5 h-3.5 w-3.5 shrink-0",
                                pattern.risk === "high"
                                  ? "text-rose-500"
                                  : "text-amber-500"
                              )}
                              aria-hidden="true"
                            />
                            <p className="text-[12px] leading-5 text-zinc-500">
                              {pattern.impact}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expand toggle */}
                  <p
                    className={cn(
                      "mt-3 text-[11px] font-medium transition-colors",
                      isExpanded ? "text-zinc-400" : "text-brand group-hover:text-blue-700"
                    )}
                    aria-hidden="true"
                  >
                    {isExpanded ? "Show less" : "See example →"}
                  </p>
                </button>
              </motion.div>
            );
          })}
        </div>
      </Reveal>

      {/* Bottom note */}
      <Reveal delay={0.15}>
        <p className="mt-8 text-center text-[12px] text-zinc-400">
          Detection results are automated estimates. Not every website uses these patterns.
          Always verify with the evidence TrapKiller provides.
        </p>
      </Reveal>
    </section>
  );
}
