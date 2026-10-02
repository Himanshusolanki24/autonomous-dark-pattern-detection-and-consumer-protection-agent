"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import type { CancellationTask } from "@/lib/types";
import { CancellationStatus } from "./CancellationStatus";
import { formatTimestamp, hostnameOf } from "@/lib/utils";

export function CancellationCard({
  task,
  index = 0,
  onSelect,
}: {
  task: CancellationTask;
  index?: number;
  onSelect?: (task: CancellationTask) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-base font-semibold text-zinc-600">
        {task.service.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold">{task.service}</p>
          <CancellationStatus status={task.status} />
        </div>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{task.plan}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono">{task.price}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-400">
          <Search className="h-3 w-3" />
          {hostnameOf(`https://${task.domain}`)}
        </p>
      </div>

      <div className="hidden shrink-0 text-right sm:block">
        {task.completedAt ? (
          <>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-xs font-medium text-emerald-600">
              {formatTimestamp(task.completedAt)}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-xs text-zinc-500">{formatTimestamp(task.createdAt)}</p>
          </>
        )}
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(task)}
          className="shrink-0 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          aria-label={`View details for ${task.service}`}
        >
          View Details
          <ArrowUpRight className="ml-1 inline h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}