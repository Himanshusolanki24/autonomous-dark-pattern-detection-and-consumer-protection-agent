"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { PatternType } from "@/lib/types";

interface DarkPatternHighlightProps {
  patternType: PatternType;
  confidence: number;
  label: string;
  children: React.ReactNode;
  onClick?: (patternType: PatternType) => void;
}

export function DarkPatternHighlight({
  patternType,
  confidence,
  label,
  children,
  onClick,
}: DarkPatternHighlightProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="relative animate-warn-outline rounded-lg"
      role="button"
      tabIndex={0}
      aria-label={`${label} detected on this element. Click for details.`}
      onClick={() => onClick?.(patternType)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(patternType);
        }
      }}
    >
      {children}
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
        className="pointer-events-none absolute -top-2.5 right-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm"
      >
        <AlertTriangle className="h-3 w-3" />
        {label} · {confidence}%
      </motion.span>
    </motion.div>
  );
}