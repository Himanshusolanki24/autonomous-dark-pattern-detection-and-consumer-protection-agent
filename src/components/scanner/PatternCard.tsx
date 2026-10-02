"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";
import type { DarkPattern } from "@/lib/types";
import { PATTERN_LABELS } from "@/lib/constants";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { cn, severityTone } from "@/lib/utils";

export function PatternCard({
  pattern,
  index = 0,
}: {
  pattern: DarkPattern;
  index?: number;
}) {
  const tone = severityTone(pattern.severity);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
    >
      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={cn("h-2 w-2 rounded-full", tone.dot)} />
            <h3 className="text-base font-semibold">{PATTERN_LABELS[pattern.type]}</h3>
          </div>
          <SeverityBadge severity={pattern.severity} />
        </div>

        <p className="mt-3 text-sm text-zinc-700">{pattern.explanation}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Affected element
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-800">{pattern.element}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Confidence
            </p>
            <ConfidenceBar confidence={pattern.confidence} className="mt-1" />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-50 p-3">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
          <div>
            <p className="text-xs font-semibold text-zinc-600">Why this matters</p>
            <p className="mt-0.5 text-xs text-zinc-500">{pattern.whyItMatters}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}