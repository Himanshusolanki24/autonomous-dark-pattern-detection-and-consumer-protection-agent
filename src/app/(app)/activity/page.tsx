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
import { PageHeader } from "@/components/ui/case";

// ── Helpers ───────────────────────────────────────────────────────────────────

type AgentFilter = AgentId | "all";
type StatusFilter = ActivityRecord["status"] | "all";

const AGENT_FILTERS: { key: AgentFilter; label: string }[] = [
  { key: "all", label: "All agents" },
  { key: "perception", label: "Perception" },
  { key: "detection", label: "Detection" },
  { key: "planning", label: "Planning" },
  { key: "action", label: "Action" },
  { key: "verification", label: "Verification" },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "verified", label: "Verified" },
];

const STATUS_META: Record<ActivityRecord["status"], { icon: React.ElementType; cls: string; label: string }> = {
  success: { icon: CheckCircle2, cls: "text-emerald-600", label: "Success" },
  warning: { icon: AlertTriangle, cls: "text-amber-600", label: "Warning" },
  error: { icon: XCircle, cls: "text-red-600", label: "Error" },
  verified: { icon: BadgeCheck, cls: "text-emerald-600", label: "Verified" },
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
      className="relative flex gap-4 pb-3"
    >
      {!isLast && <span className="absolute left-[15px] top-9 h-full w-px bg-border" aria-hidden="true" />}

      <div className="relative z-10 flex shrink-0 flex-col items-center">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface shadow-card"
          aria-hidden="true"
        >
          <span className={cn("h-2.5 w-2.5 rounded-full", tone.dot)} />
        </span>
      </div>

      <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 shadow-card transition-colors hover:border-border-strong">
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("text-[11.5px] font-semibold", tone.color)}>{AGENT_SHORT[record.agent]}</span>
              <span className="text-[10px] text-zinc-300" aria-hidden="true">·</span>
              <span className="rounded-md border border-border bg-zinc-50 px-1.5 py-0.5 font-mono text-[9.5px] text-zinc-500">
                {record.website}
              </span>
            </div>
            <p className="mt-1 text-[12.5px] leading-5 text-zinc-700">{record.event}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="font-mono text-[9.5px] tabular-nums text-zinc-400">{formatTime(record.timestamp)}</span>
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium", statusMeta.cls)}>
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
        <p className="eyebrow shrink-0 text-[9.5px]">{label}</p>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        <span className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[9.5px] font-semibold text-zinc-400">
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
  const activeFilters = [agentFilter !== "all", statusFilter !== "all", !!search].filter(Boolean).length;

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        eyebrow="Audit log"
        title="Activity"
        lede={
          records !== null
            ? `${filtered.length} of ${records.length} events, newest first. Every step the agent takes is kept here.`
            : "Loading events…"
        }
      >
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none",
            filtersOpen
              ? "border-brand bg-brand-soft text-blue-700"
              : "border-border bg-surface text-zinc-600 hover:bg-zinc-50"
          )}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filters
          {activeFilters > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
              {activeFilters}
            </span>
          )}
        </button>
      </PageHeader>

      {/* Filter panel */}
      <AnimatePresence initial={false}>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="panel space-y-4 p-4">
              <div>
                <label htmlFor="activity-search" className="eyebrow mb-1.5 block text-[9.5px]">
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
                    className="h-9 w-full rounded-lg border border-border bg-zinc-50 pl-9 pr-3 text-[13px] placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="eyebrow mb-2 text-[9.5px]">Agent</p>
                  <div className="flex flex-wrap gap-1.5">
                    {AGENT_FILTERS.map(({ key, label }) => {
                      const isActive = agentFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setAgentFilter(key)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none",
                            isActive
                              ? "border-blue-200 bg-brand-soft text-blue-700"
                              : "border-border bg-surface text-zinc-500 hover:bg-zinc-50"
                          )}
                          aria-pressed={isActive}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="eyebrow mb-2 text-[9.5px]">Status</p>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_FILTERS.map(({ key, label }) => {
                      const isActive = statusFilter === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setStatusFilter(key)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-none",
                            isActive
                              ? "border-blue-200 bg-brand-soft text-blue-700"
                              : "border-border bg-surface text-zinc-500 hover:bg-zinc-50"
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

              {activeFilters > 0 && (
                <button
                  onClick={() => { setAgentFilter("all"); setStatusFilter("all"); setSearch(""); }}
                  className="text-[11px] font-medium text-zinc-400 transition-colors hover:text-zinc-700"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {records === null ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-strong bg-zinc-50/50 py-16 text-center">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface text-zinc-300 shadow-card"
            aria-hidden="true"
          >
            <History className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[13.5px] font-semibold text-zinc-700">No events match your filters</p>
            <p className="mx-auto mt-1 max-w-xs text-[12px] leading-5 text-zinc-400">
              {records.length === 0
                ? "Start an investigation to generate activity events."
                : "Try adjusting the filters or search query."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6" role="feed" aria-label="Activity log" aria-live="polite">
          {groups.map(({ label, items }) => (
            <DateGroup key={label} label={label} items={items} />
          ))}
        </div>
      )}

      {records !== null && records.length > 0 && (
        <p className="text-center font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
          Events are retained for audit purposes
        </p>
      )}
    </div>
  );
}
