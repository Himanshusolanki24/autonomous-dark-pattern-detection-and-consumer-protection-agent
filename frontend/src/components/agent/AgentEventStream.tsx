"use client";

import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  CircleX,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { AgentEvent } from "@/lib/types";
import { AGENT_LABELS } from "@/lib/constants";
import { agentTone, cn, formatTime, shortId } from "@/lib/utils";

const STATUS_ICON = {
  running: <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />,
  success: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />,
  error: <CircleX className="h-3.5 w-3.5 text-red-500" />,
} as const;

const STATUS_LABEL = {
  running: "Running",
  success: "Success",
  warning: "Warning",
  error: "Error",
} as const;

const EventRow = memo(function EventRow({
  event,
  index,
}: {
  event: AgentEvent;
  index: number;
}) {
  const tone = agentTone(event.agent);
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex gap-3 py-2"
    >
      <div className="flex flex-col items-center">
        <span className={cn("mt-1 h-2 w-2 rounded-full", tone.dot)} />
        {index > 0 && <span className="mt-1 w-px flex-1 bg-border" aria-hidden="true" />}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("text-xs font-medium", tone.color)}>
            {AGENT_LABELS[event.agent]}
          </span>
          <span className="flex items-center gap-2">
            <span className="text-[11px] tabular-nums text-zinc-400">
              {formatTime(event.timestamp)}
            </span>
            <span
              className="hidden items-center gap-1 text-[11px] text-zinc-400 group-hover:inline-flex"
              title={`Event ID: ${event.id}`}
            >
              #{shortId(event.id)}
            </span>
          </span>
        </div>
        <p className="mt-0.5 text-sm text-zinc-700">{event.message}</p>

        <div className="mt-1 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            {STATUS_ICON[event.status]}
            {STATUS_LABEL[event.status]}
          </span>
          {event.metadata && (
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {Object.entries(event.metadata).map(([k, v]) => (
                <span
                  key={k}
                  className="inline-flex items-center gap-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500"
                >
                  {k}={String(v)}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>
    </motion.li>
  );
});

export function AgentEventStream({
  events,
  maxHeight = "h-[360px]",
  onCollapse,
  collapsed,
}: {
  events: AgentEvent[];
  maxHeight?: string;
  onCollapse?: () => void;
  collapsed?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsed) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [events.length, collapsed]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Live event stream
        </span>
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            aria-expanded={!collapsed}
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")}
            />
            {collapsed ? "Expand" : "Collapse"}
          </button>
        )}
      </div>

      <ul
        className={cn(
          "space-y-0 overflow-y-auto pr-1",
          collapsed ? "max-h-0" : maxHeight
        )}
        aria-live="polite"
        aria-label="Agent event stream"
      >
        {events.length === 0 ? (
          <li className="flex h-24 items-center justify-center text-sm text-muted-foreground">
            No events yet. Start the agent to begin the session.
          </li>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event, i) => (
              <EventRow key={event.id} event={event} index={i} />
            ))}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </ul>
    </div>
  );
}