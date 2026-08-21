"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Play,
  Terminal,
  Shield,
  Check,
} from "lucide-react";
import { Reveal } from "./motion";
import { CONSOLE_EVENTS } from "./constants";
import { cn } from "@/lib/utils";

const STATE_STYLE = {
  done:   { dot: "bg-emerald-500", text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  active: { dot: "bg-brand animate-dot-pulse", text: "text-brand", badge: "bg-brand-soft text-brand border-brand/30" },
  todo:   { dot: "bg-zinc-200", text: "text-zinc-400", badge: "bg-zinc-50 text-zinc-400 border-zinc-200" },
};

export function DemoSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="demo-heading"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_460px]">

        {/* ── Left copy ───────────────────────────── */}
        <div>
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
              Live investigation
            </p>
            <h2
              id="demo-heading"
              className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl"
            >
              See TrapKiller investigate a real webpage.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-500">
              The agent runs against a self-hosted demo subscription page — a
              site deliberately designed with dark patterns. Watch it perceive,
              detect, plan, and pause for approval in real time.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <ul className="space-y-3" aria-label="What the demo shows">
              {[
                "Full 7-stage pipeline executed live",
                "Dark patterns detected and explained",
                "Human approval gate demonstrated",
                "Outcome verification shown",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-zinc-600">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft"
                    aria-hidden="true"
                  >
                    <Check className="h-3 w-3 text-brand" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/demo"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Launch Live Demo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
            <Link
              href="/agent"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Terminal className="h-4 w-4" aria-hidden="true" />
              Try an Investigation
            </Link>
          </Reveal>
        </div>

        {/* ── Right — agent console preview ───────── */}
        <Reveal delay={0.1}>
          <div className="overflow-hidden rounded-2xl border border-border bg-zinc-900 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)]">
            {/* Console header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
                <span className="text-[11px] font-mono text-zinc-400">
                  trapkiller — agent session
                </span>
              </div>
              <span className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-500">
                <Shield className="h-3 w-3" aria-hidden="true" />
                demo mode
              </span>
            </div>

            {/* Console events */}
            <div className="p-4 space-y-2" role="log" aria-label="Agent event log" aria-live="polite">
              {CONSOLE_EVENTS.map((event, i) => {
                const sty = STATE_STYLE[event.state as keyof typeof STATE_STYLE];
                return (
                  <motion.div
                    key={`${event.stage}-${i}`}
                    initial={reduce ? undefined : { opacity: 0, x: -8 }}
                    whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{ delay: i * 0.09, duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5",
                      event.state === "active"
                        ? "bg-white/5 ring-1 ring-white/10"
                        : event.state === "done"
                          ? "opacity-60"
                          : "opacity-30"
                    )}
                  >
                    <span
                      className={cn("h-1.5 w-1.5 rounded-full shrink-0", sty.dot)}
                      aria-hidden="true"
                    />
                    <span
                      className={cn(
                        "shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide",
                        sty.badge
                      )}
                    >
                      {event.stage}
                    </span>
                    <span className={cn("text-[12px] font-mono", sty.text)}>
                      {event.label}
                    </span>
                    {event.state === "done" && (
                      <Check
                        className="ml-auto h-3.5 w-3.5 text-emerald-500 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Target info */}
            <div className="border-t border-white/10 px-4 py-3">
              <div className="flex items-center justify-between text-[10px] text-zinc-500">
                <span className="font-mono">localhost:3001/demo-target/account</span>
                <span className="text-emerald-500 font-medium">● live</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
