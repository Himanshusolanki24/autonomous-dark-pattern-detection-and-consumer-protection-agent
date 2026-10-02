"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ActivityRecord } from "@/lib/types";
import { AGENT_SHORT } from "@/lib/constants";
import { agentTone, cn, formatTime } from "@/lib/utils";

const STATUS_META: Record<
  ActivityRecord["status"],
  { label: string; cls: string }
> = {
  success: { label: "Success", cls: "bg-emerald-50 text-emerald-700" },
  warning: { label: "Warning", cls: "bg-amber-50 text-amber-700" },
  error: { label: "Error", cls: "bg-red-50 text-red-700" },
  verified: { label: "Verified", cls: "bg-emerald-50 text-emerald-700" },
};

export function RecentActivity({ items }: { items: ActivityRecord[] }) {
  const recent = items.slice(-5).reverse();
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Recent activity</h3>
        <Link
          href="/activity"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-border/70">
        {recent.map((item) => {
          const tone = agentTone(item.agent);
          const status = STATUS_META[item.status];
          return (
            <li key={item.id} className="flex items-center gap-3 py-2.5">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-zinc-800">{item.event}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={tone.color}>{AGENT_SHORT[item.agent]}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.website}</span>
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                  status.cls
                )}
              >
                {status.label}
              </span>
              <span className="w-14 shrink-0 text-right text-xs tabular-nums text-zinc-400">
                {formatTime(item.timestamp)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}