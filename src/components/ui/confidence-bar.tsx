"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { confidencePct } from "@/lib/confidence";

interface ConfidenceBarProps {
  /** Canonical 0–1 fraction. Values >1 are saturated and render as 100%. */
  confidence: number;
  tone?: "warning" | "danger" | "brand" | "success";
  className?: string;
}

function ConfidenceBar({ confidence, tone = "warning", className }: ConfidenceBarProps) {
  const pct = confidencePct(confidence);
  const barClass =
    tone === "danger"
      ? "bg-red-600"
      : tone === "brand"
        ? "bg-brand"
        : tone === "success"
          ? "bg-emerald-500"
          : "bg-amber-500";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
        {/* scaleX instead of width: the fill springs in on the compositor, no layout work. */}
        <motion.div
          className={cn("h-full origin-left rounded-full", barClass)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.15 }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {pct}%
      </span>
    </div>
  );
}

export { ConfidenceBar };
