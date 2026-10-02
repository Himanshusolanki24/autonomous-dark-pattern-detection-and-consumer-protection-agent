"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DarkPattern, Severity } from "@/lib/types";
import { PATTERN_LABELS } from "@/lib/constants";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { useAgentStore } from "@/stores/agent-store";
import { AgentStatus } from "@/lib/types";

function getSeverityBadgeClass(severity: Severity | undefined): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
      return "bg-amber-100 text-amber-700";
    case "medium":
      return "bg-emerald-100 text-emerald-700";
    default:
      return "bg-zinc-100 text-zinc-600";
  }
}

function getSeverityDotClass(severity: Severity | undefined): string {
  switch (severity) {
    case "critical":
      return "bg-red-600";
    case "high":
      return "bg-amber-600";
    case "medium":
      return "bg-emerald-500";
    default:
      return "bg-zinc-400";
  }
}

function PerceptionStep({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.08 }}
      className="flex items-center gap-2"
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full",
          completed && "bg-emerald-100 text-emerald-600",
          !completed && "border border-border-strong text-zinc-300"
        )}
      >
        {completed ? "✓" : "○"}
      </span>
      <span className="text-sm text-zinc-600">{label}</span>
    </motion.div>
  );
}

export function InvestigationPanel({
  perception,
  detections,
  isAgentRunning,
}: {
  perception: import("@/lib/types").PerceptionData | undefined;
  detections: DarkPattern[];
  isAgentRunning?: boolean;
}) {
  const store = useAgentStore();

  const perceptionSteps = useMemo(() => {
    if (!perception) {
      return [
        { completed: false, label: "Page loaded" },
        { completed: false, label: "DOM analyzed" },
        { completed: false, label: "Visible text extracted" },
        { completed: false, label: "Interactive elements mapped" },
        { completed: false, label: "CTA elements identified" },
      ];
    }

    const visibleText = perception.visibleText ?? "";
    const elements = perception.elements ?? [];

    return [
      { completed: true, label: "Page loaded" },
      { completed: true, label: "DOM analyzed" },
      {
        completed: visibleText.length > 0,
        label: "Visible text extracted",
      },
      {
        completed: elements.length > 0,
        label: "Interactive elements mapped",
      },
{
      completed:
        /(free trial|auto-renew|submit|continue|buy now)/i.test(visibleText),
      label: "CTA elements identified",
},
    ];
  }, [perception]);

  const severityBadgeClasses = useMemo(() =>
    detections.map((d) => getSeverityBadgeClass(d.severity)),
    [detections]
  );

  const severityDotClasses = useMemo(() =>
    detections.map((d) => getSeverityDotClass(d.severity)),
    [detections]
  );

  const detectionCards = (
    <div className="space-y-3">
      {detections.map((pattern, i) => (
        <motion.div
          key={pattern.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-xl border border-border bg-surface shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn("h-2 w-2 rounded-full", severityDotClasses[i])}
              />
              <h4 className="text-base font-semibold">
                {PATTERN_LABELS[pattern.type]}
              </h4>
            </div>
            <ConfidenceBar confidence={pattern.confidence} className="w-40" />
          </div>

          <p className="mt-2 text-sm text-zinc-700">{pattern.explanation}</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Affected element
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-800">{pattern.element}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Risk
              </p>
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                severityBadgeClasses[i]
              )}>
                {pattern.severity ?? "Medium"}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-500">{pattern.whyItMatters}</p>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-medium text-zinc-800">AI INVESTIGATION</h2>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
            "border-zinc-200 bg-surface text-zinc-600"
          )}
          role="status"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
          Agent Ready
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Perception Stage */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            PERCEIVE
          </p>
          <div className="space-y-1.5 mt-2">
            {perceptionSteps.map((step) => (
              <PerceptionStep key={step.label} {...step} />
            ))}
          </div>
        </div>

        {/* Detection Stage */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            DETECT
          </p>
          {detections.length > 0 ? (
            detectionCards
          ) : (
            <p className="text-sm text-zinc-500">
              No potential dark patterns detected.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Planning Stage */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            PLAN
          </p>
          {isAgentRunning === true ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-4 rounded-xl border border-border bg-surface shadow-sm"
            >
              <p className="text-sm text-zinc-500">
                Generating action plan based on detected patterns...
              </p>
            </motion.div>
          ) : (
            <p className="text-sm text-zinc-500">
              Detection complete. Review evidence and generate a plan.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}