"use client";

// Building blocks for the "case file" look: the agent marks evidence with a
// highlighter, shows pages inside a browser window, and stamps closed cases.

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const SWEEP = [0.65, 0, 0.35, 1] as const;

/** Highlighter stroke that sweeps in behind its text — the signature "caught it" mark. */
export function Marker({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <motion.span
        aria-hidden="true"
        className="absolute -inset-x-1 bottom-[0.05em] top-[0.45em] origin-left -rotate-[0.6deg] rounded-[3px] bg-marker"
        initial={{ scaleX: 0 }}
        // Sweeps when it scrolls into view, so marks below the fold aren't spent before anyone sees them.
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.55, ease: SWEEP, delay }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

/** Browser window chrome around a page or screenshot. */
export function Window({
  url,
  children,
  className,
  right,
}: {
  url: string;
  children: React.ReactNode;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      <div className="flex items-center gap-3 border-b border-border bg-muted/70 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-surface px-3 py-1 font-mono text-[12px] text-zinc-500">
          {url}
        </span>
        {right}
      </div>
      {children}
    </div>
  );
}

/** Page heading: large display title, a short lede, and an optional action slot. */
export function PageHeader({
  title,
  lede,
  children,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="text-[34px] font-bold leading-[1.05] text-foreground sm:text-[40px]">{title}</h1>
        {lede && <p className="mt-2 text-[15px] leading-relaxed text-zinc-500">{lede}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** Ink stamp that slams onto a closed case. */
export function Stamp({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "danger" }) {
  return (
    <motion.span
      initial={{ scale: 1.8, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -7 }}
      transition={{ type: "spring", stiffness: 520, damping: 22, delay: 0.15 }}
      className={cn(
        "font-display inline-block rounded-lg border-[3px] px-4 py-1.5 text-[22px] font-extrabold uppercase leading-none",
        tone === "success" ? "border-emerald-600 text-emerald-600" : "border-red-600 text-red-600"
      )}
    >
      {children}
    </motion.span>
  );
}

/** Number that springs up to its value, and re-springs when the value changes. */
export function CountUp({ to }: { to: number }) {
  const spring = useSpring(0, { stiffness: 70, damping: 20 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-IN"));
  useEffect(() => spring.set(to), [spring, to]);
  return <motion.span>{text}</motion.span>;
}
