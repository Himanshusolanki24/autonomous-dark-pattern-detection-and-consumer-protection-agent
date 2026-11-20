"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  ListChecks,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  AlertTriangle,
  ArrowRight,
  Globe,
  Loader2,
} from "lucide-react";
import type { CancellationTask, TaskStatus } from "@/lib/types";
import { fetchTasks, summarizeTasks } from "@/lib/services/taskService";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/case";
import { cn, formatTimestamp } from "@/lib/utils";

// ── Tab definitions ────────────────────────────────────────────────────────────

type TabKey = "active" | "approval" | "completed" | "failed";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "active", label: "Active", icon: Play },
  { key: "approval", label: "Approval Required", icon: ShieldAlert },
  { key: "completed", label: "Completed", icon: CheckCircle2 },
  { key: "failed", label: "Failed", icon: XCircle },
];

function tabStatuses(tab: TabKey): TaskStatus[] {
  switch (tab) {
    case "active": return ["waiting", "running", "blocked"];
    case "approval": return ["approval"];
    case "completed": return ["completed"];
    case "failed": return ["failed"];
  }
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_META: Record<TaskStatus, { label: string; cls: string; dot: string }> = {
  waiting: { label: "Waiting", cls: "border-border bg-zinc-50 text-zinc-600", dot: "bg-zinc-400" },
  running: { label: "Running", cls: "border-emerald-200 bg-success-soft text-emerald-700", dot: "bg-emerald-500 animate-dot-pulse" },
  approval: { label: "Approval Required", cls: "border-amber-200 bg-warning-soft text-amber-800", dot: "bg-amber-500 animate-dot-pulse" },
  completed: { label: "Completed", cls: "border-emerald-200 bg-success-soft text-emerald-700", dot: "bg-emerald-500" },
  failed: { label: "Failed", cls: "border-red-200 bg-danger-soft text-red-700", dot: "bg-red-500" },
  blocked: { label: "Blocked", cls: "border-red-200 bg-danger-soft text-red-700", dot: "bg-red-500" },
};

function StatusBadge({ status }: { status: TaskStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold", m.cls)}>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", m.dot)} aria-hidden="true" />
      {m.label}
    </span>
  );
}

// ── Task row card ─────────────────────────────────────────────────────────────

function TaskRow({ task, index }: { task: CancellationTask; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22, delay: index * 0.04 }}
      className="panel panel-hover group flex items-start gap-4 p-4"
    >
      <div className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-brand-soft text-[15px] font-bold text-blue-700">
        {task.service.charAt(0).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-foreground">{task.service}</p>
          <StatusBadge status={task.status} />
        </div>
        <p className="text-[12px] text-zinc-500">{task.plan}</p>
        <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Globe className="h-3 w-3" aria-hidden="true" />
            {task.domain}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {formatTimestamp(task.createdAt)}
          </span>
          {task.patternCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-amber-600">
              <AlertTriangle className="h-3 w-3" aria-hidden="true" />
              {task.patternCount} pattern{task.patternCount !== 1 ? "s" : ""} detected
            </span>
          )}
          {task.completedAt && (
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              Completed {formatTimestamp(task.completedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        {task.status === "approval" ? (
          <Button asChild size="sm" variant="marker">
            <Link href="/agent">
              Review
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        ) : task.status === "running" || task.status === "blocked" ? (
          <Button asChild variant="outline" size="sm">
            <Link href="/agent">
              View
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        ) : task.status === "completed" ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-success-soft px-2.5 py-1 text-[10.5px] font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Verified
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const config: Record<TabKey, { icon: React.ElementType; title: string; body: string; action?: React.ReactNode }> = {
    active: {
      icon: Play,
      title: "No active tasks",
      body: "Start an investigation from the Scanner to create a new cancellation task.",
      action: (
        <Button asChild size="sm" className="mt-4">
          <Link href="/scanner">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New investigation
          </Link>
        </Button>
      ),
    },
    approval: {
      icon: ShieldAlert,
      title: "No pending approvals",
      body: "When the agent reaches an irreversible action, it will pause here for your review.",
    },
    completed: {
      icon: CheckCircle2,
      title: "No completed tasks yet",
      body: "Completed investigations with verified outcomes will appear here.",
    },
    failed: {
      icon: XCircle,
      title: "No failed tasks",
      body: "Tasks that could not be completed due to errors or automation blocks will appear here.",
    },
  };

  const { icon: Icon, title, body, action } = config[tab];

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-zinc-50/50 px-4 py-16 text-center">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-zinc-300 shadow-card"
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-[13.5px] font-semibold text-zinc-700">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-[12px] leading-5 text-zinc-400">{body}</p>
      </div>
      {action}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<CancellationTask[] | null>(null);
  const [tab, setTab] = useState<TabKey>("active");
  const [isDemoData, setIsDemoData] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    fetchTasks()
      .then((t) => {
        if (!active) return;
        setTasks(t);
        // taskService falls back to demoTasks silently — detect by size
        setIsDemoData(t.length === 1 && t[0]?.domain === "example.com");
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => { active = false; };
  }, []);

  const summary = useMemo(() => summarizeTasks(tasks ?? []), [tasks]);

  const tabTasks = useMemo(() => {
    if (!tasks) return [];
    const statuses = tabStatuses(tab);
    return tasks.filter((t) => statuses.includes(t.status));
  }, [tasks, tab]);

  const tabCount = (t: TabKey) => {
    if (!tasks) return 0;
    return tasks.filter((tk) => tabStatuses(t).includes(tk.status)).length;
  };

  // Loading
  if (!tasks) {
    return (
      <div className="max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <PageHeader
        eyebrow="Case queue"
        title="Cancellation tasks"
        lede="Track every cancellation journey the agent is working on."
      >
        <Button asChild size="sm">
          <Link href="/scanner">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New task
          </Link>
        </Button>
      </PageHeader>

      {isDemoData && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-brand-soft px-4 py-3">
          <Loader2 className="h-4 w-4 shrink-0 text-blue-500" aria-hidden="true" />
          <p className="text-[12px] text-blue-700">
            Showing demo data. Start the backend on port 3001 for live task data.
          </p>
        </div>
      )}

      {loadError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-danger-soft px-4 py-3">
          <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
          <p className="text-[12px] text-red-700">
            Could not load tasks. Ensure the backend is running on port 3001.
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total", value: summary.total, icon: ListChecks, tone: "text-zinc-500 bg-zinc-100" },
          { label: "Active", value: summary.running, icon: Play, tone: "text-emerald-600 bg-success-soft" },
          { label: "Approval", value: summary.approval, icon: ShieldAlert, tone: "text-amber-600 bg-warning-soft" },
          { label: "Done", value: summary.completed, icon: CheckCircle2, tone: "text-emerald-600 bg-success-soft" },
        ].map(({ label, value, icon: Icon, tone }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="panel p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="eyebrow text-[9.5px]">{label}</p>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", tone)}>
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
            <p className="font-display mt-2 text-[26px] font-bold tabular-nums leading-none text-foreground">{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div
        className="relative flex gap-1 rounded-xl border border-border bg-zinc-50 p-1"
        role="tablist"
        aria-label="Task filters"
      >
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = tabCount(key);
          const isActive = tab === key;
          const isApproval = key === "approval" && count > 0;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${key}`}
              onClick={() => setTab(key)}
              className={cn(
                "relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-colors focus-visible:outline-none",
                isActive
                  ? "text-foreground"
                  : isApproval
                    ? "text-amber-700 hover:text-amber-800"
                    : "text-zinc-500 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="task-tab"
                  className="absolute inset-0 rounded-lg border border-border bg-surface shadow-card"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon
                className={cn("relative h-3.5 w-3.5 shrink-0", isApproval && !isActive ? "animate-dot-pulse" : "")}
                aria-hidden="true"
              />
              <span className="relative hidden sm:inline">{label}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "relative rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    isApproval ? "bg-warning-soft text-amber-700" : "bg-zinc-200/80 text-zinc-600"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Approval tab alert */}
      {tab === "approval" && tabTasks.length > 0 && (
        <div className="flex flex-wrap items-start gap-3 rounded-xl border border-amber-300 bg-warning-soft px-4 py-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 animate-dot-pulse" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-amber-900">
              {tabTasks.length} task{tabTasks.length !== 1 ? "s" : ""} waiting for your approval
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-amber-800">
              The agent has paused before an irreversible action. Review and approve in the Agent view.
            </p>
          </div>
          <Button asChild size="sm" variant="marker" className="shrink-0">
            <Link href="/agent">
              Go to agent
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}

      {/* Task list */}
      <div
        id={`tabpanel-${tab}`}
        role="tabpanel"
        aria-label={TABS.find((t) => t.key === tab)?.label}
      >
        <AnimatePresence mode="wait" initial={false}>
          {tabTasks.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <EmptyState tab={tab} />
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-2.5"
            >
              {tabTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {tasks.length > 0 && (
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
          {tasks.length} total task{tasks.length !== 1 ? "s" : ""} · backend data
        </p>
      )}
    </div>
  );
}
