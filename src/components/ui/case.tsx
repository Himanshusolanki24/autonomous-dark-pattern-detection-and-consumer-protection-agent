"use client";

// Building blocks for the "evidence lab" look: the agent marks
// evidence with a highlighter, shows pages inside browser chrome,
// and stamps closed cases.

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Lock } from "lucide-react";
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
  const reduce = useReducedMotion();
  return (
    <span className={cn("relative inline-block", className)}>
      <motion.span
        aria-hidden="true"
        className="absolute -inset-x-1 bottom-[0.02em] top-[0.4em] origin-left -rotate-[0.8deg] rounded-[4px] bg-gradient-to-r from-marker/90 via-marker to-marker/70"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, ease: SWEEP, delay }}
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
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-card",
        className
      )}
    >
      <div className="flex items-center gap-3 border-b border-border bg-gradient-to-b from-surface-raised to-muted/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate rounded-lg border border-border bg-surface px-3 py-1 font-mono text-[11.5px] text-zinc-500">
          <Lock className="h-3 w-3 shrink-0 text-zinc-400" aria-hidden="true" />
          <span className="truncate">{url}</span>
        </span>
        {right}
      </div>
      {children}
    </div>
  );
}

/** Page heading: small mono eyebrow, large display title, short lede, action slot. */
export function PageHeader({
  title,
  lede,
  eyebrow,
  children,
}: {
  title: React.ReactNode;
  lede?: React.ReactNode;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="eyebrow mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[32px] font-bold leading-[1.04] text-foreground sm:text-[40px]">
          {title}
        </h1>
        {lede && <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-zinc-500">{lede}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

/** Ink stamp that slams onto a closed case. */
export function Stamp({ children, tone = "success" }: { children: React.ReactNode; tone?: "success" | "danger" }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      initial={reduce ? false : { scale: 1.8, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -7 }}
      transition={{ type: "spring", stiffness: 520, damping: 22, delay: 0.15 }}
      className={cn(
        "font-display inline-block rounded-lg border-[3px] px-4 py-1.5 text-[22px] font-extrabold uppercase leading-none",
        tone === "success"
          ? "border-emerald-600/80 text-emerald-600"
          : "border-red-600/80 text-red-600"
      )}
    >
      {children}
    </motion.span>
  );
}

/** Number that springs up to its value, and re-springs when the value changes. */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const reduce = useReducedMotion();
  const spring = useSpring(0, { stiffness: 70, damping: 20 });
  const text = useTransform(spring, (v) => Math.round(v).toLocaleString("en-IN"));
  useEffect(() => spring.set(to), [spring, to]);
  if (reduce) return <span className={className}>{to.toLocaleString("en-IN")}</span>;
  return <motion.span className={className}>{text}</motion.span>;
}

/** Compact metric block used across the app. */
export function Stat({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "ink" | "brand" | "warning" | "success" | "danger";
}) {
  const tones = {
    ink: "text-foreground",
    brand: "text-brand",
    warning: "text-amber-600",
    success: "text-emerald-600",
    danger: "text-red-600",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <p className="eyebrow text-[10px]">{label}</p>
      <p className={cn("font-display mt-2 text-[30px] font-bold leading-none tabular-nums", tones[tone])}>{value}</p>
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-zinc-500">{hint}</p>}
    </div>
  );
}
