"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, ShieldAlert, Check } from "lucide-react";
import { DETECTION_ELEMENTS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

export function DetectionSection() {
  const [selected, setSelected] = useState(DETECTION_ELEMENTS[0]);
  const active = DETECTION_ELEMENTS.find((e) => e.id === selected.id)!;

  return (
    <section id="detection" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeading
        eyebrow="Detection"
        title={
          <>
            See the trap <span className="text-brand">before it gets you.</span>
          </>
        }
        sub={
          <>
            The agent reads the page like an auditor — and flags every
            manipulative element it finds. Click the highlighted regions.
          </>
        }
      />

      <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1fr_400px]">
        {/* Interactive browser */}
        <Reveal>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_20px_50px_-25px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3 border-b border-border bg-zinc-50 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-white px-3 py-1 text-xs text-zinc-500">
                <Lock className="h-3 w-3 shrink-0 text-emerald-600" />
                <span className="truncate font-mono">stream-example.com/account</span>
              </div>
            </div>

            {/* viewport — absolute layout mirrors DETECTION_ELEMENTS boxes */}
            <div className="relative h-[420px] overflow-hidden bg-white">
              <div className="absolute left-[8%] top-[4%] flex w-[84%] items-center justify-between">
                <span className="text-sm font-bold tracking-tight text-zinc-900">
                  stream<span className="text-blue-600">-example</span>
                </span>
                <span className="text-[10px] text-zinc-400">Account · Billing</span>
              </div>

              <div className="absolute left-[10%] top-[16%] w-[80%] rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <p className="text-xs font-medium text-zinc-500">Premium Membership</p>
                <p className="mt-1 text-lg font-semibold text-zinc-900">
                  ₹999 <span className="text-xs font-normal text-zinc-400">/ month</span>
                </p>
              </div>

              <div className="absolute left-[14%] top-[40%] w-[72%] rounded-lg bg-zinc-900 py-2 text-center text-xs font-medium text-white">
                Keep My Premium Benefits
              </div>

              <div className="absolute left-[14%] top-[55%] w-[72%] rounded-lg border border-zinc-200 bg-white py-2 text-center text-xs text-zinc-500">
                No, I want to lose my benefits
              </div>

              <div className="absolute left-[14%] top-[72%] w-[72%] text-center text-[11px] text-zinc-400 underline decoration-dotted underline-offset-2">
                Cancel membership
              </div>

              <div className="absolute left-[14%] top-[84%] w-[72%] text-center text-[10px] text-zinc-300">
                You can manage your plan from the help centre (3–5 business days)
              </div>

              {/* clickable detection overlays */}
              {DETECTION_ELEMENTS.map((el) => {
                const isActive = el.id === active.id;
                const riskHigh = el.risk === "high";
                return (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => setSelected(el)}
                    className="group absolute cursor-pointer"
                    style={{
                      top: `${el.box.top}%`,
                      left: `${el.box.left}%`,
                      width: `${el.box.width}%`,
                      height: `${el.box.height}%`,
                    }}
                    aria-pressed={isActive}
                    aria-label={`Show detection: ${el.label}`}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute -inset-1 rounded-md transition-all duration-200",
                        isActive
                          ? riskHigh
                            ? "ring-2 ring-red-500 ring-offset-1"
                            : "ring-2 ring-amber-500 ring-offset-1"
                          : "ring-1 ring-transparent group-hover:ring-zinc-400",
                        isActive && riskHigh && "animate-stage-pulse"
                      )}
                    />
                    <span
                      className={cn(
                        "pointer-events-none absolute -right-1 -top-2 flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm transition-colors",
                        isActive
                          ? riskHigh
                            ? "bg-red-600"
                            : "bg-amber-500"
                          : "bg-zinc-500/90 group-hover:bg-zinc-700"
                      )}
                    >
                      <ShieldAlert className="h-2.5 w-2.5" />
                      {el.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>

        {/* Inspector panel */}
        <Reveal delay={0.1}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="sticky top-24 rounded-2xl border border-border bg-surface p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                  Detection inspector
                </p>
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-semibold",
                    active.risk === "high"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  )}
                >
                  {active.risk === "high" ? "HIGH RISK" : "MEDIUM RISK"}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
                {active.label}
              </h3>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Confidence</span>
                  <span className="font-medium tabular-nums">{active.confidence}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    key={active.id}
                    initial={{ width: 0 }}
                    animate={{ width: `${active.confidence}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      active.risk === "high" ? "bg-red-500" : "bg-amber-500"
                    )}
                  />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-600">{active.explanation}</p>

              <div className="mt-5 space-y-2 rounded-xl border border-border bg-zinc-50 p-3 text-xs">
                <p className="font-semibold text-zinc-500">What the agent does</p>
                <ul className="space-y-1.5">
                  {[
                    "Locates the exit path automatically",
                    "Ignores the retention offers",
                    "Stops before the irreversible step",
                  ].map((line) => (
                    <li key={line} className="flex items-center gap-2 text-zinc-700">
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}