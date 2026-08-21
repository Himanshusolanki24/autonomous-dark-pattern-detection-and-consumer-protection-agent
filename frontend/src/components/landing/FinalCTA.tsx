"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Reveal } from "./motion";

export function FinalCTA() {
  const reduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden border-t border-border bg-foreground text-white"
      aria-labelledby="cta-heading"
    >
      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Gradient spots */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 70%), radial-gradient(ellipse 500px 300px at 80% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl px-4 py-28 text-center sm:px-6 sm:py-36">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
            TrapKiller
          </p>
        </Reveal>

        <motion.h2
          id="cta-heading"
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
        >
          Take back control of
          <br />
          the interface.
        </motion.h2>

        <motion.p
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 leading-relaxed"
        >
          Understand what the interface is asking. See the evidence. Decide
          what happens next.
        </motion.p>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Link
            href="/demo"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-white px-7 text-base font-semibold text-zinc-900 shadow-lg transition-all hover:bg-zinc-100 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            Try TrapKiller
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/demo"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 px-7 text-base font-medium text-white transition-colors hover:bg-white/10 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            View Demo
          </Link>
        </motion.div>

        <Reveal delay={0.25}>
          <p className="mt-10 text-[12px] text-zinc-500">
            Detection results are automated estimates. Not every website uses deceptive patterns.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
