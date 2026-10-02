"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, Check, MousePointerClick, ScanSearch, BadgeCheck } from "lucide-react";
import { VERIFICATION_EVIDENCE } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "action",
    label: "Action",
    icon: MousePointerClick,
    description:
      "Agent performs the approved action inside the real authenticated browser session.",
    color: "text-brand",
    bg: "bg-brand-soft",
    border: "border-brand/30",
    dot: "bg-brand",
  },
  {
    id: "verify",
    label: "Verify",
    icon: ScanSearch,
    description:
      "Checks the resulting page and account state against the expected outcome.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    icon: BadgeCheck,
    description:
      "Expected outcome detected. Evidence captured for the audit trail.",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
] as const;

export function VerificationSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="verification-heading"
    >
      <SectionHeading
        eyebrow="Verification"
        title={
          <span id="verification-heading">
            A click isn&apos;t{" "}
            <span className="text-brand">proof.</span>
          </span>
        }
        sub={
          <>
            After every approved action, TrapKiller checks the resulting page
            and account state to confirm the intended outcome was actually
            achieved — not just attempted.
          </>
        }
      />

      <div className="mt-14 grid items-start gap-10 lg:grid-cols-2">

        {/* ── Flow visualization ─────────────────────── */}
        <Reveal>
          <div className="flex flex-col items-center gap-0 sm:gap-0">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex w-full max-w-sm flex-col items-center">
                <motion.div
                  initial={reduce ? undefined : { opacity: 0, x: -16 }}
                  whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "w-full rounded-xl border p-5",
                    step.bg, step.border
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        step.bg, "border", step.border
                      )}
                      aria-hidden="true"
                    >
                      <step.icon className={cn("h-5 w-5", step.color)} />
                    </span>
                    <div>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest", step.color)}>
                        Step {i + 1}
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {step.label}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-zinc-600">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {i < STEPS.length - 1 && (
                  <div className="flex h-8 flex-col items-center justify-center" aria-hidden="true">
                    <ArrowDown className="h-4 w-4 text-zinc-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* ── Evidence panel ──────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-emerald-500 animate-dot-pulse"
                  aria-hidden="true"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Verification Result
                </p>
              </div>
              <p className="mt-1 text-base font-semibold text-emerald-900">
                Cancellation confirmed
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Checks */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                  Evidence checks
                </p>
                <ul className="space-y-2" aria-label="Verification evidence">
                  {VERIFICATION_EVIDENCE.map((item, i) => (
                    <motion.li
                      key={item}
                      initial={reduce ? undefined : { opacity: 0, x: -8 }}
                      whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20px" }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                      className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600"
                        aria-hidden="true"
                      >
                        <Check className="h-3 w-3 text-white" />
                      </span>
                      <span className="text-[12px] font-medium text-emerald-800">
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Page state example */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  Page state after action
                </p>
                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                  <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-100 px-3 py-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#28c840]" aria-hidden="true" />
                    <span className="ml-2 font-mono text-[9px] text-zinc-400">
                      subscriptions.example.com/success
                    </span>
                  </div>
                  <div className="p-3 text-center">
                    <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100" aria-hidden="true">
                      <Check className="h-4 w-4 text-emerald-600" />
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold text-zinc-800">
                      Subscription cancelled
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      Your access continues until end of billing period.
                    </p>
                  </div>
                </div>
              </div>

              {/* Caveat */}
              <p className="text-[11px] text-zinc-400 leading-5">
                Verification is best-effort. TrapKiller checks observable page state
                and cannot guarantee outcomes on all websites or account systems.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
