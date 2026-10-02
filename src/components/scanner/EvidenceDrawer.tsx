"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X, Eye } from "lucide-react";
import type { DarkPattern } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PATTERN_LABELS } from "@/lib/constants";
import { ConfidenceBar } from "@/components/ui/confidence-bar";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: DarkPattern | null;
  onViewEvidence?: (pattern: DarkPattern) => void;
}

export function EvidenceDrawer({
  isOpen,
  onClose,
  pattern,
  onViewEvidence,
}: EvidenceDrawerProps) {
  if (!isOpen || !pattern) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0, transform: "scale(0.95)" }}
      animate={{ opacity: 1, transform: "scale(1)" }}
      exit={{ opacity: 0, transform: "scale(0.95)" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        className="relative bg-white rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transform"
      >
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:text-zinc-700"
            aria-label="Close evidence drawer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="font-semibold text-zinc-800">
                {PATTERN_LABELS[pattern.type]}
              </p>
              <p className="text-sm text-zinc-500">Potential dark pattern detected</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Confidence
              </p>
              <ConfidenceBar confidence={pattern.confidence} className="w-48" />
              <p className="mt-1 text-sm text-zinc-500">
                {pattern.confidence >= 80 ? "High" : pattern.confidence >= 60 ? "Medium" : "Low"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Risk
              </p>
              <span className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium",
                pattern.severity === "critical"
                  ? "bg-red-100 text-red-700"
                  : pattern.severity === "high"
                    ? "bg-amber-100 text-amber-700"
                    : pattern.severity === "medium"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-600"
              )}>
                {pattern.severity}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Why flagged
            </p>
            <blockquote className="mt-1 pl-3 border-l-2 border-amber-300 text-sm italic text-zinc-700">
              {pattern.explanation}
            </blockquote>
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Visible text
            </p>
            <p className="mt-1 text-zinc-700 break-all">{pattern.element}</p>
          </div>

          {pattern.element && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Affected element
              </p>
              <p className="mt-1 text-zinc-600">{pattern.element}</p>
            </div>
          )}

          <div className="mt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Source
            </p>
            <p className="mt-1 text-zinc-500">DOM / visible text</p>
          </div>

          <div className="mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Close
            </Button>
            {onViewEvidence && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onViewEvidence(pattern)}
                className="mt-2 w-full"
              >
                <Eye className="h-4 w-4 mr-2" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}