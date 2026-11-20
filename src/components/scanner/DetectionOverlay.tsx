"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ExternalLink, X } from "lucide-react";
import type { DarkPattern } from "@/lib/types";
import { PATTERN_LABELS } from "@/lib/constants";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Button } from "@/components/ui/button";

export function DetectionOverlay({ pattern, onClose }: { pattern: DarkPattern | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {pattern && (
        <motion.aside
          initial={{ opacity: 0, x: 24, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 24, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="absolute right-3 top-3 z-20 w-80 max-w-[calc(100%-24px)] overflow-hidden rounded-2xl border border-amber-200/80 bg-surface shadow-lift"
          role="dialog"
          aria-label="Dark pattern detected"
        >
          <div className="flex items-start gap-2.5 border-b border-amber-100 bg-warning-soft px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface text-amber-600 shadow-card">
              <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-amber-700">Dark pattern detected</p>
              <h4 className="font-display mt-0.5 text-[14px] font-semibold leading-snug text-foreground">
                {PATTERN_LABELS[pattern.type]}
              </h4>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-none"
              aria-label="Close detection details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
                Confidence
              </span>
              <ConfidenceBar
                confidence={pattern.confidence}
                className="w-44"
                tone={pattern.severity === "high" || pattern.severity === "critical" ? "danger" : "warning"}
              />
            </div>

            <div className="mt-3">
              <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">Why</p>
              <blockquote className="mt-1 border-l-2 border-marker pl-3 text-[12.5px] leading-5 text-zinc-700">
                {pattern.explanation}
              </blockquote>
            </div>

            <p className="mt-3 text-[11.5px] leading-5 text-zinc-500">
              Affects: <span className="font-medium text-zinc-700">{pattern.element}</span>
            </p>

            <Button size="sm" variant="soft" className="mt-4 w-full" onClick={onClose}>
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Continue with agent
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
