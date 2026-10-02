"use client";

import { motion } from "framer-motion";
import {
  Eye,
  ScanSearch,
  FileText,
  Map,
  UserCheck,
  MousePointerClick,
  BadgeCheck,
  Check,
} from "lucide-react";
import type { AgentId, StageState } from "@/lib/types";
import { AGENT_SHORT, PIPELINE_ORDER } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAgentStore } from "@/stores/agent-store";

const STAGE_ICONS: Record<AgentId, React.ReactNode> = {
  perception: <Eye className="h-3.5 w-3.5" />,
  detection: <ScanSearch className="h-3.5 w-3.5" />,
  planning: <Map className="h-3.5 w-3.5" />,
  action: <MousePointerClick className="h-3.5 w-3.5" />,
  verification: <BadgeCheck className="h-3.5 w-3.5" />,
};

// Extended labels for tooltips
const STAGE_DESCRIPTIONS: Record<AgentId, string> = {
  perception: "Observing the page",
  detection: "Finding dark patterns",
  planning: "Determining next step",
  action: "Executing approved action",
  verification: "Confirming outcome",
};

interface StageNodeProps {
  agent: AgentId;
  state: StageState;
  isLast: boolean;
  compact?: boolean;
  index: number;
}

function Connector({ done }: { done: boolean }) {
  return (
    <div className="relative mx-1 h-px flex-1 min-w-[12px]" aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-zinc-200" />
      {done && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 origin-left rounded-full bg-emerald-400"
        />
      )}
    </div>
  );
}

function StageNode({ agent, state, isLast, compact, index }: StageNodeProps) {
  const isRunning = state === "running";
  const isCompleted = state === "completed";
  const isFailed = state === "failed";
  const isBlocked = state === "blocked";
  const isIdle = state === "idle";

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-1.5">
        {/* Circle */}
        <div
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
            isCompleted && "border-emerald-200 bg-emerald-50 text-emerald-600",
            isRunning  && "border-brand bg-brand-soft text-brand shadow-[0_0_0_4px_rgba(37,99,235,0.12)]",
            isFailed   && "border-red-200 bg-red-50 text-red-600",
            isBlocked  && "border-amber-300 bg-amber-50 text-amber-600 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]",
            isIdle     && "border-zinc-200 bg-white text-zinc-300"
          )}
          role="img"
          aria-label={`${AGENT_SHORT[agent]}: ${state}`}
        >
          {isCompleted ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
              <Check className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            STAGE_ICONS[agent]
          )}

          {/* Running pulse ring */}
          {isRunning && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-brand" />
            </span>
          )}

          {/* Blocked indicator */}
          {isBlocked && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-40" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-amber-500" />
            </span>
          )}
        </div>

        {/* Label */}
        {!compact && (
          <div className="text-center">
            <p className={cn(
              "text-[9px] font-bold uppercase tracking-[0.12em] transition-colors",
              isCompleted && "text-emerald-600",
              isRunning   && "text-brand",
              isFailed    && "text-red-600",
              isBlocked   && "text-amber-600",
              isIdle      && "text-zinc-300"
            )}>
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className={cn(
              "text-[10px] font-medium transition-colors whitespace-nowrap",
              isCompleted && "text-emerald-700",
              isRunning   && "text-zinc-800",
              isFailed    && "text-red-700",
              isBlocked   && "text-amber-700",
              isIdle      && "text-zinc-400"
            )}>
              {AGENT_SHORT[agent]}
            </p>
          </div>
        )}
      </div>
      {!isLast && <Connector done={isCompleted} />}
    </div>
  );
}

export function AgentPipeline({ compact = false }: { compact?: boolean }) {
  const { status, stageStates } = useAgentStore();

  return (
    <div>
      <div
        className="flex items-start justify-between overflow-x-auto py-2 gap-0"
        role="list"
        aria-label="Agent pipeline stages"
      >
        {PIPELINE_ORDER.map((agent, i) => (
          <StageNode
            key={agent}
            agent={agent}
            state={stageStates[agent]}
            isLast={i === PIPELINE_ORDER.length - 1}
            compact={compact}
            index={i}
          />
        ))}
      </div>
      <span className="sr-only">
        Agent pipeline status: {status}.{" "}
        {PIPELINE_ORDER.map((a) => `${AGENT_SHORT[a]}: ${stageStates[a]}`).join(", ")}.
      </span>

      {/* Active stage description */}
      {!compact && (() => {
        const activeAgent = PIPELINE_ORDER.find(
          (a) => stageStates[a] === "running" || stageStates[a] === "blocked"
        );
        if (!activeAgent) return null;
        const state = stageStates[activeAgent];
        return (
          <motion.p
            key={activeAgent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "mt-3 text-center text-[11px] font-medium",
              state === "blocked" ? "text-amber-600" : "text-brand"
            )}
          >
            {state === "blocked"
              ? `${AGENT_SHORT[activeAgent]} · Waiting for your approval`
              : `${AGENT_SHORT[activeAgent]} · ${STAGE_DESCRIPTIONS[activeAgent]}`}
          </motion.p>
        );
      })()}
    </div>
  );
}
