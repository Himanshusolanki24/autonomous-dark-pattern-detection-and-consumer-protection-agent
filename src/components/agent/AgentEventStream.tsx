"use client";

import { memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, CircleX, Loader2, ChevronDown, Terminal } from "lucide-react";
import type { AgentEvent } from "@/lib/types";
import { AGENT_LABELS } from "@/lib/constants";
import { agentTone, cn, formatTime } from "@/lib/utils";

const STATUS_ICON = {
  running: <Loader2 className="h-3 w-3 animate-spin text-brand" />,
  success: <CheckCircle2 className="h-3 w-3 text-emerald-500" />,
  warning: <AlertTriangle className="h-3 w-3 text-amber-500" />,
  error:   <CircleX className="h-3 w-3 text-red-500" />,
} as const;

const EventRow = memo(function EventRow({ event, isFirst }: { event: AgentEvent; isFirst: boolean }) {
  const tone = agentTone(event.agent);
  const isRunning = event.status === "running";
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("relative flex gap-3 py-2.5", !isFirst && "border-t border-zinc-100")}
    >
      <div className="flex shrink-0 flex-col items-center pt-0.5">
        <span className={cn("h-2 w-2 rounded-full shrink-0", tone.dot)} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className={cn("text-[10px] font-bold uppercase tracking-widest", tone.color)}>
            {AGENT_LABELS[event.agent]}
          </span>
          <span className="text-[10px] tabular-nums text-zinc-400">{formatTime(event.timestamp)}</span>
        </div>
        <p className={cn("mt-0.5 text-[13px] leading-5", isRunning ? "text-zinc-700" : "text-zinc-600")}>
          {event.message}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
            {STATUS_ICON[event.status]}
            <span className="capitalize">{event.status}</span>
          </span>
          {event.metadata && Object.entries(event.metadata).length > 0 && (
            <span className="inline-flex flex-wrap gap-1">
              {Object.entries(event.metadata).map(([k, v]) => (
                <span key={k} className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[9px] text-zinc-500">
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
  maxHeight = "h-[320px]",
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
    if (!collapsed) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length, collapsed]);

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Event Stream</span>
          {events.length > 0 && (
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500">{events.length}</span>
          )}
        </div>
        {onCollapse && (
          <button onClick={onCollapse} className="inline-flex items-center gap-1 rounded text-[11px] text-zinc-400 transition-colors hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-expanded={!collapsed}>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} aria-hidden="true" />
            {collapsed ? "Expand" : "Collapse"}
          </button>
        )}
      </div>
      <ul className={cn("overflow-y-auto pr-1 transition-all", collapsed ? "max-h-0 overflow-hidden" : maxHeight)} aria-live="polite" aria-label="Agent event stream" aria-atomic="false">
        {events.length === 0 ? (
          <li className="flex flex-col items-center gap-2 py-10 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100" aria-hidden="true">
              <Terminal className="h-4 w-4 text-zinc-300" />
            </span>
            <p className="text-[12px] text-zinc-400">No events yet.</p>
            <p className="text-[11px] text-zinc-300">Start the agent to begin the session.</p>
          </li>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event, i) => <EventRow key={event.id} event={event} isFirst={i === 0} />)}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </ul>
    </div>
  );
}
