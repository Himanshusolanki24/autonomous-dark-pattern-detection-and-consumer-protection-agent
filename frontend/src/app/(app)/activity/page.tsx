"use client";

import { useEffect, useMemo, useState } from "react";
import { History, Loader2 } from "lucide-react";
import type { ActivityRecord } from "@/lib/types";
import { fetchActivity } from "@/lib/services/taskService";
import { AGENT_SHORT } from "@/lib/constants";
import { agentTone, cn, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const AGENT_FILTERS = [
  "all",
  "perception",
  "detection",
  "planning",
  "action",
  "verification",
] as const;
const STATUS_FILTERS = ["all", "success", "warning", "error", "verified"] as const;

const STATUS_META: Record<ActivityRecord["status"], { label: string; cls: string }> = {
  success: { label: "Success", cls: "bg-emerald-50 text-emerald-700" },
  warning: { label: "Warning", cls: "bg-amber-50 text-amber-700" },
  error: { label: "Error", cls: "bg-red-50 text-red-700" },
  verified: { label: "Verified", cls: "bg-emerald-50 text-emerald-700" },
};

export default function ActivityPage() {
  const [records, setRecords] = useState<ActivityRecord[] | null>(null);
  const [agent, setAgent] = useState<(typeof AGENT_FILTERS)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let active = true;
    fetchActivity()
      .then((r) => {
        if (active) setRecords(r);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!records) return [];
    return records.filter((r) => {
      if (agent !== "all" && r.agent !== agent) return false;
      if (status !== "all" && r.status !== status) return false;
      if (website && !r.website.includes(website.toLowerCase())) return false;
      return true;
    });
  }, [records, agent, status, website]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Activity</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A complete audit log of every agent action across sessions.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm sm:grid-cols-3">
        <div>
          <label
            htmlFor="agent-filter"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400"
          >
            Agent
          </label>
          <select
            id="agent-filter"
            value={agent}
            onChange={(e) => setAgent(e.target.value as typeof agent)}
            className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-sm focus:outline-2 focus:outline-brand"
          >
            {AGENT_FILTERS.map((a) => (
              <option key={a} value={a}>
                {a === "all" ? "All agents" : AGENT_SHORT[a]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="status-filter"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-sm focus:outline-2 focus:outline-brand"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="website-filter"
            className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400"
          >
            Website
          </label>
          <input
            id="website-filter"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="netflix.com"
            className="h-9 w-full rounded-lg border border-border-strong bg-surface px-2 text-sm placeholder:text-zinc-400 focus:outline-2 focus:outline-brand"
          />
        </div>
      </div>

      {!records ? (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface/60 py-16 text-center">
          <History className="h-8 w-8 text-zinc-300" />
          <p className="text-sm text-muted-foreground">No events match your filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-zinc-50 text-[11px] uppercase tracking-wide text-zinc-400">
                <th className="px-4 py-2.5 font-medium">Timestamp</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Event</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Website</th>
                <th className="px-4 py-2.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const tone = agentTone(r.agent);
                const s = STATUS_META[r.status];
                return (
                  <tr key={r.id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs tabular-nums text-zinc-500">
                      {formatTime(r.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-xs font-medium",
                          tone.color
                        )}
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                        {AGENT_SHORT[r.agent]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-800">{r.event}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs text-zinc-500 sm:table-cell">
                      {r.website}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          s.cls
                        )}
                      >
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {records && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3" />
          {filtered.length} of {records.length} events shown
        </p>
      )}
    </div>
  );
}