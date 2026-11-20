"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Eye, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { api } from "@/lib/api";
import type { DarkPattern } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PATTERN_LABELS } from "@/lib/constants";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { CONFIDENCE_TIER_LABEL, confidenceTier } from "@/lib/confidence";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: DarkPattern | null;
  onViewEvidence?: (pattern: DarkPattern) => void;
}

const SEVERITY_TONE: Record<string, string> = {
  critical: "border-red-200 bg-danger-soft text-red-700",
  high: "border-amber-200 bg-warning-soft text-amber-700",
  medium: "border-blue-100 bg-brand-soft text-blue-700",
  low: "border-border bg-zinc-100 text-zinc-600",
};

export function EvidenceDrawer({ isOpen, onClose, pattern, onViewEvidence }: EvidenceDrawerProps) {
  // Keyed by finding so the answer resets when a different one is opened.
  const [rated, setRated] = useState<{ id: string; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const rating = pattern && rated?.id === pattern.id ? rated.text : null;

  const rate = (correct: boolean) => {
    if (!pattern?.feedback) return;
    setRated({ id: pattern.id, text: "Saving…" });
    api
      .post<{ learned: boolean }>("/api/graph/feedback", { ...pattern.feedback, correct })
      .then((r) =>
        setRated({
          id: pattern.id,
          text: !r.learned
            ? "Couldn't save — the knowledge graph is not connected."
            : correct
              ? "Thanks. The agent will flag this wording from now on."
              : "Thanks. The agent will stop flagging this wording.",
        })
      )
      .catch((e: Error) => setRated({ id: pattern.id, text: `Couldn't save: ${e.message}` }));
  };

  return (
    <AnimatePresence>
      {isOpen && pattern && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="evidence-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-lift"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-soft text-amber-600">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="eyebrow text-[9.5px]">Evidence</p>
                  <h2 id="evidence-title" className="font-display mt-0.5 text-[17px] font-semibold leading-snug">
                    {PATTERN_LABELS[pattern.type] ?? pattern.type}
                  </h2>
                  <p className="mt-0.5 text-[11.5px] text-zinc-500">Potential dark pattern detected</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none"
                aria-label="Close evidence drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="eyebrow text-[9.5px]">Confidence</p>
                  <ConfidenceBar confidence={pattern.confidence} className="mt-1.5" />
                  <p className="mt-1 text-[11.5px] text-zinc-500">
                    {CONFIDENCE_TIER_LABEL[confidenceTier(pattern.confidence)]} confidence
                  </p>
                </div>
                <div>
                  <p className="eyebrow text-[9.5px]">Risk</p>
                  <span
                    className={cn(
                      "mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold capitalize",
                      SEVERITY_TONE[pattern.severity] ?? SEVERITY_TONE.low
                    )}
                  >
                    {pattern.severity}
                  </span>
                </div>
              </div>

              <div>
                <p className="eyebrow text-[9.5px]">Why flagged</p>
                <blockquote className="mt-1.5 rounded-r-lg border-l-2 border-marker bg-marker/10 py-2 pl-3 pr-2 text-[13px] leading-relaxed text-zinc-700">
                  {pattern.explanation}
                </blockquote>
              </div>

              <div>
                <p className="eyebrow text-[9.5px]">Visible text</p>
                <p className="mt-1 break-all font-mono text-[12px] leading-5 text-zinc-700">{pattern.element}</p>
              </div>

              {pattern.element && (
                <div>
                  <p className="eyebrow text-[9.5px]">Affected element</p>
                  <p className="mt-1 text-[12.5px] leading-5 text-zinc-600">{pattern.element}</p>
                </div>
              )}

              <div>
                <p className="eyebrow text-[9.5px]">Source</p>
                <p className="mt-1 text-[12.5px] text-zinc-500">DOM / visible text</p>
              </div>

              {pattern.feedback && (
                <div className="rounded-xl border border-border bg-zinc-50/70 p-3.5">
                  <p className="text-[13px] font-semibold text-foreground">Is this really a dark pattern?</p>
                  <p className="mt-0.5 text-[11.5px] text-zinc-500">Your answer teaches the agent.</p>
                  {rating ? (
                    <p className="mt-2 text-[12.5px] leading-5 text-zinc-700" role="status">
                      {rating}
                    </p>
                  ) : (
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => rate(true)}>
                        <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                        Yes, correct
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => rate(false)}>
                        <ThumbsDown className="h-3.5 w-3.5" aria-hidden="true" />
                        No, false alarm
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-border bg-zinc-50/60 px-5 py-4">
              {onViewEvidence && (
                <Button size="sm" variant="soft" onClick={() => onViewEvidence(pattern)} className="w-full">
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Open full evidence
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
