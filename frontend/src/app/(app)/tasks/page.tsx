"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ListChecks, Plus, TriangleAlert, Ban } from "lucide-react";
import type { CancellationTask, TaskStatus } from "@/lib/types";
import { fetchTasks, summarizeTasks } from "@/lib/services/taskService";
import { CancellationCard } from "@/components/cancellation/CancellationCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { demoSimulator } from "@/lib/services/simulator";

const FILTERS: { key: TaskStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "waiting", label: "Waiting" },
  { key: "running", label: "Running" },
  { key: "approval", label: "Approval Required" },
  { key: "completed", label: "Completed" },
  { key: "failed", label: "Failed" },
  { key: "blocked", label: "Blocked" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<CancellationTask[] | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [selected, setSelected] = useState<CancellationTask | null>(null);

  useEffect(() => {
    let active = true;
    fetchTasks()
      .then((t) => {
        if (active) setTasks(t);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => summarizeTasks(tasks ?? []), [tasks]);

  const visible = useMemo(() => {
    if (!tasks) return [];
    return filter === "all" ? tasks : tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  const runTask = (task: CancellationTask) => {
    demoSimulator.start(task);
  };

  if (!tasks) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Cancellation Tasks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every cancellation journey the agent is working on.
          </p>
        </div>
        <Button asChild>
          <Link href="/scanner">
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ["Total", summary.total],
          ["Running", summary.running],
          ["Approval", summary.approval],
          ["Completed", summary.completed],
          ["Failed", summary.failed],
          ["Blocked", summary.blocked],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-border bg-surface p-3 shadow-sm">
            <p className="text-lg font-semibold tabular-nums">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "border-brand bg-brand-soft text-brand"
                : "border-border-strong bg-surface text-zinc-600 hover:bg-zinc-50"
            )}
            aria-pressed={filter === f.key}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/60 py-16 text-center">
          <ListChecks className="h-8 w-8 text-zinc-300" />
          <p className="text-sm text-muted-foreground">No tasks in this state.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((task, i) => (
            <CancellationCard
              key={task.id}
              task={task}
              index={i}
              onSelect={(t) => {
                setSelected(t);
                if (t.status === "waiting") runTask(t);
              }}
            />
          ))}
        </div>
      )}

      {selected && selected.status === "approval" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <TriangleAlert className="h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              {selected.service} needs your approval
            </p>
            <p className="text-xs text-amber-700/80">
              The agent reached the final cancellation step and is paused.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {selected && selected.status === "blocked" && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Ban className="h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {selected.service} is blocked
            </p>
            <p className="text-xs text-red-700/80">
              The agent could not complete this flow. Review the audit log.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );
}