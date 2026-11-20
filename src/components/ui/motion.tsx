"use client";

// Shared motion vocabulary for the lab. Every primitive honours the
// user's reduced-motion preference via Framer Motion's MotionConfig
// (set once in AppShell) and CSS fallbacks.

import { useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade-and-rise when the element scrolls into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Card that carries a soft radial highlight following the cursor.
 * Pure CSS variables + one overlay; no re-render on mouse move.
 */
export function SpotlightCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref as never}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn("group relative overflow-hidden", className)}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: active ? 1 : 0,
          background:
            "radial-gradient(440px circle at var(--mx, 50%) var(--my, 50%), rgba(79,70,229,0.09), transparent 62%)",
        }}
      />
      <div className="relative h-full">{children}</div>
    </Tag>
  );
}

/** Seamless marquee rail. Content is rendered twice; the rail slides 50%. */
export function Marquee({
  children,
  className,
  duration = 32,
  reverse = false,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <div className={cn("flex flex-wrap gap-3", className)}>{children}</div>;
  }
  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      <div
        className="flex w-max shrink-0 items-center group-hover:[animation-play-state:paused]"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        <span className="flex items-center gap-3 pr-3">{children}</span>
        {/* Second copy is purely visual; the first copy stays readable by screen readers. */}
        <span aria-hidden="true" className="flex items-center gap-3 pr-3">
          {children}
        </span>
      </div>
    </div>
  );
}

/** Thin animated rule that draws itself when scrolled into view. */
export function DrawLine({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={cn("h-px w-full origin-left bg-gradient-to-r from-brand via-signal/50 to-transparent", className)}
      initial={reduce ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: EASE }}
    />
  );
}
