"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BadgeCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { ActivityRecord, AgentId } from "@/lib/types";
import { fetchActivity } from "@/lib/services/taskService";
import { AGENT_SHORT } from "@/lib/constants";
import { agentTone, cn, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Helpers ───────────────────────────────────────────────────────────────────

type AgentFilter = AgentId | "all";
type StatusFilter = ActivityRecord["status"] | "all";

const AGENT_FILTERS: { key: AgentFilter; label: string }[] = [
  { key: "all",         label: "All Agents" },
  { key: "perception",  label: "Perception" },
  { key: "detection",   label: "Detection" },
  { key: "planning",    label: "Planning" },
  { key: "action",      label: "Action" },
  { key: "verification",label: "Verification" },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error",   label: "Error" },
  { key: "verified",label: "Verified" },
];

const STATUS_META: Record<ActivityRecord["status"], { icon: React.ElementType; cls: string; label: string }> = {
  success:  { icon: CheckCircle2, cls: "text-emerald-500", label: "Success" },
  warning:  { icon: AlertTriangle, cls: "text-amber-500",  label: "Warning" },
  error:    { icon: XCircle,       cls: "text-red-500",    label: "Error"   },
  verified: { icon: BadgeCheck,    cls: "text-emerald-500",label: "Verified" },
};

function groupByDate(records: ActivityRecord[]): { label: string; items: ActivityRecord[] }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today.getTime() - 86400000);

  const groups: Map<string, ActivityRecord[]> = new Map();
  for (const r of records) {
    const d = new Date(r.timestamp);
    d.setHours(0, 0, 0, 0);
    let label: string;
    if (d.getTime() === today.getTime()) label = "Today";
    else if (d.getTime() === yesterday.getTime()) label = "Yesterday";
    else label = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const existing = groups.get(label) ?? [];
    existing.push(r);
    groups.set(label, existing);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

// ── Event row ─────────────────────────────────────────────────────────────────

function EventRow({ record, isLast }: { record: ActivityRecord; isLast: boolean }) {
  const tone = agentTone(record.agent);
  const statusMeta = STATUS_META[record.status];
  const StatusIcon = statusMeta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="relative flex gap-4 pb-4"
    >
      {/* Timeline connector */}
      {!isLast && (
        <span
          className="absolute left-[15px] top-8 h-full w-px bg-zinc-100"
          aria-hidden="true"
        />
      )}

      {/* Agent dot */}
      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-zinc-100",
            tone.dot.replace("bg-", "ring-").replace(" animate-dot-pulse", "")
          )}
          aria-hidden="true"
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 rounded-xl border border-zinc-100 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          {/* Left: agent + event */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-[12px] font-medium ", tone.color)}>
                {AGENT_SHORT[record.agent]}
              </span>
              <span className="text-[10px] text-zinc-300" aria-hidden="true">·</span>
              <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                {record.website}
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-zinc-700">{record.event}</p>
          </div>

          {/* Right: time + status */}
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-mono text-[10px] tabular-nums text-zinc-400">
              {formatTime(record.timestamp)}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium",
                statusMeta.cls
              )}
            >
              <StatusIcon className="h-3 w-3" aria-hidden="true" />
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Date group ────────────────────────────────────────────────────────────────

function DateGroup({ label, items }: { label: string; items: ActivityRecord[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="shrink-0 text-[12px] font-medium text-zinc-400">
          {label}
        </p>
        <span className="h-px flex-1 bg-zinc-100" aria-hidden="true" />
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
          {items.length}
        </span>
      </div>
      <div>
        {items.map((r, i) => (
          <EventRow key={r.id} record={r} isLast={i === items.length - 1} />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const [records, setRecords] = useState<ActivityRecord[] | null>(null);
  const [agentFilter, setAgentFilter] = useState<AgentFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchActivity()
      .then((r) => { if (active) setRecords(r); })
      .catch(() => { if (active) setRecords([]); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (agentFilter !== "all" && r.agent !== agentFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.website.toLowerCase().includes(q) && !r.event.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [records, agentFilter, statusFilter, search]);

  const groups = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div className="max-w-4xl space-y-5">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium text-zinc-400">
            Audit Log
          </p>
          <h2 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-zinc-900">
            Activity
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            {records !== null
              ? `${filtered.length} of ${records.length} events`
              : "Loading events…"}
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            filtersOpen
              ? "border-brand bg-brand-soft text-brand"
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          )}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {(agentFilter !== "all" || statusFilter !== "all" || search) && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
              {[agentFilter !== "all", statusFilter !== "all", !!search].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter panel ─────────────────────────── */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-4">
              {/* Search */}
              <div>
                <label htmlFor="activity-search" className="mb-1.5 block text-[12px] font-medium text-zinc-400">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
                  <input
                    id="activity-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by website or event…"
                    className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-[13px] placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Agent filter */}
                <div>
                  <p className="mb-2 text-[12px] font-medium text-zinc-400">
                    Agent
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENT_FILTERS.map(({ key, label }) => {
                      const isActive = agentFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setAgentFilter(key)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            isActive
                              ? "border-brand bg-brand-soft text-brand"
                              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                          )}
                          aria-pressed={isActive}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status filter */}
                <div>
                  <p className="mb-2 text-[12px] font-medium text-zinc-400">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(({ key, label }) => {
                      const isActive = statusFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setStatusFilter(key)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                            isActive
                              ? "border-brand bg-brand-soft text-brand"
                              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                          )}
                          aria-pressed={isActive}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Clear filters */}
              {(agentFilter !== "all" || statusFilter !== "all" || search) && (
                <button
                  onClick={() => { setAgentFilter("all"); setStatusFilter("all"); setSearch(""); }}
                  className="text-[11px] font-medium text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Content ──────────────────────────────── */}
      {records === null ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 py-16 text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm"
            aria-hidden="true"
          >
            <History className="h-5 w-5 text-zinc-300" />
          </span>
          <div>
            <p className="text-sm font-semibold text-zinc-700">No events match your filters</p>
            <p className="mt-1 text-[12px] leading-5 text-zinc-400 max-w-xs">
              {records.length === 0
                ? "Start an investigation to generate activity events."
                : "Try adjusting the filters or search query."}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="space-y-6"
          role="feed"
          aria-label="Activity log"
          aria-live="polite"
        >
          {groups.map(({ label, items }) => (
            <DateGroup key={label} label={label} items={items} />
          ))}
        </div>
      )}

      {/* ── Footer note ──────────────────────────── */}
      {records !== null && records.length > 0 && (
        <p className="text-center text-[11px] text-zinc-400">
          Events are retained for audit purposes.
        </p>
      )}
    </div>
  );
}
