"use client";

import { motion } from "framer-motion";
import {
  Eye,
  ScanSearch,
  ListChecks,
  MousePointerClick,
  ShieldCheck,
} from "lucide-react";
import type { AgentId, StageState } from "@/lib/types";
import { AGENT_SHORT, PIPELINE_ORDER } from "@/lib/constants";
import { useAgentStore } from "@/stores/agent-store";
import { cn } from "@/lib/utils";

const STAGE_ICONS: Record<AgentId, React.ReactNode> = {
  perception: <Eye className="h-4 w-4" />,
  detection: <ScanSearch className="h-4 w-4" />,
  planning: <ListChecks className="h-4 w-4" />,
  action: <MousePointerClick className="h-4 w-4" />,
  verification: <ShieldCheck className="h-4 w-4" />,
};

function Connector({ state }: { state: StageState }) {
  const done = state === "completed";
  return (
    <div className="relative mx-1.5 h-px w-8 sm:w-14 md:w-20 lg:w-24">
      <div className="absolute inset-0 bg-zinc-200" />
      {done && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 origin-left bg-emerald-400"
        />
      )}
    </div>
  );
}

function StageNode({
  agent,
  state,
  isLast,
  compact = false,
}: {
  agent: AgentId;
  state: StageState;
  isLast: boolean;
  compact?: boolean;
}) {
  const icon = STAGE_ICONS[agent];
  const running = state === "running";
  const failed = state === "failed";
  const blocked = state === "blocked";
  const completed = state === "completed";
  const idle = state === "idle";

  const circleClass = cn(
    "relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
    completed && "border-emerald-200 bg-emerald-50 text-emerald-600",
    running && "border-brand bg-brand-soft text-brand animate-stage-pulse",
    failed && "border-red-200 bg-red-50 text-red-600",
    blocked && "border-amber-200 bg-amber-50 text-amber-600",
    idle && "border-border-strong bg-surface text-zinc-400"
  );

  const labelClass = cn(
    "mt-2 text-xs font-medium",
    completed && "text-emerald-700",
    running && "text-brand",
    failed && "text-red-700",
    blocked && "text-amber-700",
    idle && "text-zinc-400"
  );

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <div
          className={circleClass}
          role="img"
          aria-label={`${AGENT_SHORT[agent]} stage ${state}`}
        >
          {state === "completed" ? (
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            icon
          )}
          {running && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-brand" />
            </span>
          )}
        </div>
        {!compact && <span className={labelClass}>{AGENT_SHORT[agent]}</span>}
      </div>
      {!isLast && <Connector state={state} />}
    </div>
  );
}

export function AgentPipelineBottom({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { stageStates } = useAgentStore();

  return (
    <div className="flex items-start justify-between py-2 border-t border-border border-t-zinc-200">
      {PIPELINE_ORDER.map((agent, i) => (
        <StageNode
          key={agent}
          agent={agent}
          state={stageStates[agent]}
          isLast={i === PIPELINE_ORDER.length - 1}
          compact={compact}
        />
      ))}
    </div>
  );
}