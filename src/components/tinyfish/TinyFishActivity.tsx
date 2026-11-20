"use client";

import { Check, X } from "lucide-react";
import type { TinyFishCall } from "@/lib/services/tinyfishService";
import { cn } from "@/lib/utils";

const API_NAME: Record<TinyFishCall["api"], string> = {
  search: "Search API",
  fetch: "Fetch API",
  browser: "Browser",
  agent: "Web Agent",
};

/** Every TinyFish call behind what's on screen: which API, outcome, time and id. */
export function TinyFishActivity({ calls, className }: { calls: TinyFishCall[]; className?: string }) {
  if (calls.length === 0) return null;
  return (
    <section aria-label="TinyFish activity" className={cn("panel p-4", className)}>
      <h2 className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">TinyFish activity</span>
        <span className="font-mono text-[9.5px] tabular-nums text-zinc-400">
          {calls.length} call{calls.length === 1 ? "" : "s"}
        </span>
      </h2>
      <ol className="mt-3 space-y-2.5">
        {calls.map((c, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[12.5px]">
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white",
                c.ok ? "bg-emerald-500" : "bg-red-500"
              )}
              aria-label={c.ok ? "succeeded" : "failed"}
            >
              {c.ok ? <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" /> : <X className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="leading-5">
                <span className="font-semibold text-brand">{API_NAME[c.api]}</span>
                <span className="text-zinc-600"> · {c.label}</span>
                {c.ms > 0 && <span className="font-mono text-[10.5px] text-zinc-400"> · {(c.ms / 1000).toFixed(1)} s</span>}
              </p>
              {c.id && <p className="truncate font-mono text-[10.5px] text-zinc-400">{c.id}</p>}
              {c.error && <p className="text-[11.5px] leading-5 text-red-600">{c.error}</p>}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
