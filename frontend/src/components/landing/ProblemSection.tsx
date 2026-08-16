"use client";

import { motion } from "framer-motion";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { MAZE_STEPS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

export function ProblemSection() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            align="left"
            eyebrow="The problem"
            title={
              <>
                Some websites don&apos;t want you to{" "}
                <span className="text-brand">leave.</span>
              </>
            }
            sub={
              <>
                Signing up can take seconds. Cancelling can take ten minutes,
                five screens, and three carefully worded attempts to make you
                stay.
              </>
            }
          />
          <Reveal delay={0.15} className="mt-8 space-y-3">
            {[
              "Options are buried behind extra steps.",
              "Decline buttons are written to shame you.",
              "Retention offers interrupt the path.",
              "The real exit is hidden until the last screen.",
            ].map((point) => (
              <div key={point} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <p className="text-sm text-zinc-600">{point}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Cancellation maze */}
        <Reveal delay={0.1}>
          <div className="mx-auto max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                The cancellation maze
              </p>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">
                avg. 6 min
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <span className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-medium text-white">
                START — sign up in 5 seconds
              </span>

              <motion.div
                className="mt-1 w-full space-y-1.5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                variants={{ show: { transition: { staggerChildren: 0.16 } } }}
              >
                {MAZE_STEPS.map((step, i) => (
                  <motion.div
                    key={`${step.label}-${i}`}
                    variants={{
                      hidden: { opacity: 0, x: -14 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                    }}
                  >
                    <div className="flex justify-center py-0.5">
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-300" />
                    </div>
                    <div
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium",
                        step.trap
                          ? step.trap.tone === "red"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          : "border-border bg-white text-zinc-700"
                      )}
                    >
                      <span>{step.label}</span>
                      {step.trap && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider">
                          <TriangleAlert className="h-3 w-3" />
                          {step.trap.label}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="flex justify-center py-1">
                <ChevronDown className="h-3.5 w-3.5 text-zinc-300" />
              </div>
              <span className="rounded-full border border-dashed border-zinc-300 px-3 py-1 text-[11px] font-medium text-zinc-400">
                …still subscribed.
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}