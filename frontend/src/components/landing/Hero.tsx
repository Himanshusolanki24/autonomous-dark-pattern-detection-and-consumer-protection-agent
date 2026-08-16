"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Lock, UserCheck, Globe } from "lucide-react";
import { AgentBrowser } from "./AgentBrowser";
import { EASE } from "./motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-16 pt-32 sm:pb-24 sm:pt-40">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(900px 380px at 8% 0%, rgba(37,99,235,0.06), transparent), radial-gradient(700px 320px at 92% 8%, rgba(16,185,129,0.05), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          {/* Left — copy */}
          <motion.div
            variants={container}
            initial={reduce ? undefined : "hidden"}
            animate={reduce ? undefined : "show"}
          >
            <motion.p
              variants={item}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand"
            >
              Agentic AI for the open web
            </motion.p>

            <motion.h1
              variants={item}
              className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl"
            >
              The web is designed to trap you.
              <br />
              Your AI agent{" "}
              <span className="relative whitespace-nowrap text-brand">
                fights back.
                <svg
                  viewBox="0 0 220 12"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand/30"
                  aria-hidden="true"
                  fill="none"
                >
                  <path
                    d="M3 9c60-6 150-6 214-3"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Dark Pattern Trap Killer detects manipulative interfaces and
              navigates painful subscription cancellation flows on your behalf —
              while keeping you in control of irreversible actions.
            </motion.p>

            <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/demo"
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-foreground px-6 text-base font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98]"
              >
                Launch the Agent
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#live-demo"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong bg-surface px-6 text-base font-medium text-foreground transition-colors hover:bg-zinc-50 active:scale-[0.98]"
              >
                <Play className="h-4 w-4" />
                Watch the Agent Work
              </a>
            </motion.div>

            <motion.ul
              variants={item}
              className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500"
            >
              <li className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-zinc-400" /> No stored passwords
              </li>
              <li className="inline-flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-zinc-400" /> Human approval required
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-zinc-400" /> Built for the web
              </li>
            </motion.ul>
          </motion.div>

          {/* Right — browser simulation */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30, scale: 0.98 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.25 }}
            className="relative px-2"
          >
            <AgentBrowser />
          </motion.div>
        </div>
      </div>
    </section>
  );
}