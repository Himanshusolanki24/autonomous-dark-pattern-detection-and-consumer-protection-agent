"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

const PATHS = [
  "M0 120 C 200 40, 320 200, 520 100",
  "M0 180 C 240 100, 380 260, 560 160",
  "M0 240 C 180 160, 420 300, 580 220",
];

export function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-t border-border bg-foreground text-white">
      {/* animated navigation-path background */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
        aria-hidden="true"
        viewBox="0 0 600 360"
        preserveAspectRatio="none"
      >
        {PATHS.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#cta-grad)"
            strokeWidth="1.5"
            strokeDasharray="6 10"
            animate={reduce ? undefined : { strokeDashoffset: [-80, 40] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: "linear" }}
          />
        ))}
        <defs>
          <linearGradient id="cta-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <motion.h2
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Stop fighting the cancellation maze.
        </motion.h2>
        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-5 max-w-xl text-lg text-zinc-300"
        >
          Let an agent do the tedious work. Keep the final decision yours.
        </motion.p>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/demo"
            className="group inline-flex h-13 items-center gap-2 rounded-lg bg-brand px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-600 active:scale-[0.98]"
          >
            Launch the Agent
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-white/10"
          >
            See How It Works
            <ArrowDown className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}