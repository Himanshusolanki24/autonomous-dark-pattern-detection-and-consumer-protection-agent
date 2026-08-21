"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowDown, UserCheck, FileSearch } from "lucide-react";
import { HeroBrowser } from "./HeroBrowser";
import { EASE } from "./motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36"
      aria-labelledby="hero-headline"
    >
      {/* Subtle background gradient — light, not aggressive */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 800px 500px at 0% 0%, rgba(37,99,235,0.035) 0%, transparent 70%), radial-gradient(ellipse 600px 400px at 100% 10%, rgba(16,185,129,0.025) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-14">

          {/* ── Left — copy ─────────────────────────────── */}
          <motion.div
            variants={container}
            initial={reduce ? undefined : "hidden"}
            animate={reduce ? undefined : "show"}
          >
            {/* Status badge */}
            <motion.p
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-600 shadow-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-dot-pulse" aria-hidden="true" />
              AI Consumer Protection Agent
            </motion.p>

            {/* Headline */}
            <motion.h1
              id="hero-headline"
              variants={item}
              className="mt-6 text-balance text-[2.6rem] font-semibold leading-[1.06] tracking-tight text-foreground sm:text-[3.4rem]"
            >
              Don&apos;t Let the Interface{" "}
              <span className="relative inline-block">
                Decide for You.
                {/* Underline accent */}
                <svg
                  viewBox="0 0 330 10"
                  className="absolute -bottom-1 left-0 w-full"
                  aria-hidden="true"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M4 7 C80 2, 240 2, 326 5"
                    stroke="rgba(37,99,235,0.25)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={item}
              className="mt-6 max-w-md text-base leading-relaxed text-zinc-500 sm:text-lg"
            >
              TrapKiller is an AI browser agent that detects potential deceptive
              patterns, explains the evidence, and helps you navigate the web
              with more control.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                href="/demo"
                className="group inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-6 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Try TrapKiller
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
                See How It Works
              </a>
            </motion.div>

            {/* Trust micro-copy */}
            <motion.ul
              variants={item}
              className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-zinc-400"
              aria-label="Key properties"
            >
              <li className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 shrink-0 text-zinc-300" aria-hidden="true" />
                Human approval required
              </li>
              <li className="inline-flex items-center gap-1.5">
                <FileSearch className="h-3.5 w-3.5 shrink-0 text-zinc-300" aria-hidden="true" />
                Evidence-based detection
              </li>
              <li className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 shrink-0 flex items-center justify-center" aria-hidden="true">
                  <span className="h-2 w-2 rounded-full border-2 border-zinc-300" />
                </span>
                Automated estimates only
              </li>
            </motion.ul>
          </motion.div>

          {/* ── Right — product visualization ────────── */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 28, scale: 0.975 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.22 }}
            className="relative px-2 lg:px-0"
          >
            <HeroBrowser />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
