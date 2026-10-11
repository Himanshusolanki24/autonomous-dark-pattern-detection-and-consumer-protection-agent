"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Gauge, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/case";
import { Skeleton } from "@/components/ui/skeleton";
import { SeverityBadge } from "@/components/ui/severity-badge";

// ── Types ─────────────────────────────────────────────────────────────────────

type Level = "low" | "medium" | "high";
interface Site {
  host: string;
  score: number;
  level: Level;
  parts: { patterns: number; exit: number; failures: number };
  patterns: { type: string; label: string; severity: "low" | "medium" | "high" | "critical"; evidence: string; seen: number }[];
  route: string[] | null;
  cancelRuns: number;
  verifiedRuns: number;
}
interface Ranking { status: "ok" | "off" | "down"; sites: Site[] }

const LEVEL: Record<Level, { text: string; bar: string; chip: string }> = {
  high: { text: "Hard to leave", bar: "bg-danger", chip: "bg-danger-soft text-red-700" },
  medium: { text: "Some traps", bar: "bg-warning", chip: "bg-warning-soft text-amber-800" },
  low: { text: "Few traps seen", bar: "bg-success", chip: "bg-success-soft text-emerald-700" },
};

// ── One site ──────────────────────────────────────────────────────────────────

function SiteCard({ site, rank }: { site: Site; rank: number }) {
  const lv = LEVEL[site.level];
  return (
    <li className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-zinc-400">#{rank}</p>
          <h2 className="break-all text-[20px] font-bold leading-tight text-foreground">{site.host}</h2>
          <span className={cn("mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium", lv.chip)}>{lv.text}</span>
        </div>
        <div className="w-full sm:w-56">
          <p className="flex items-baseline justify-between">
            <span className="text-[12px] text-zinc-500">Trap score</span>
            <span className="font-display text-[30px] font-bold leading-none text-foreground tabular-nums">
              {site.score}
              <span className="text-[13px] font-medium text-zinc-400"> / 100</span>
            </span>
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100"
            role="img"
            aria-label={`Trap score ${site.score} out of 100`}
          >
            <div className={cn("h-full rounded-full", lv.bar)} style={{ width: `${site.score}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-4 text-zinc-500">
            {site.parts.patterns} from tricks · {site.parts.exit} from exit effort · {site.parts.failures} from failed tries
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-700">Tricks found</h3>
          {site.patterns.length === 0 ? (
            <p className="mt-1.5 text-[13px] text-zinc-500">None found on the pages scanned.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {site.patterns.map((p) => (
                <li key={p.type} className="text-[13px] leading-5">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-zinc-800">{p.label}</span>
                    <SeverityBadge severity={p.severity} />
                  </span>
                  <span className="block break-words text-zinc-500">“{p.evidence}”</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="text-[13px] font-semibold text-zinc-700">Way out</h3>
          {site.route ? (
            <>
              <p className="mt-1.5 text-[13px] text-zinc-600">
                <b className="font-semibold text-foreground">
                  {site.route.length} click{site.route.length === 1 ? "" : "s"}
                </b>{" "}
                to cancel, by the shortest route the agent knows:
              </p>
              <ol className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-2">
                {site.route.map((click, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ArrowRight className="h-3.5 w-3.5 text-zinc-400" aria-hidden="true" />}
                    <span className="rounded-md border border-border bg-zinc-50 px-2 py-1 text-[12px] text-zinc-800">{click}</span>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="mt-1.5 text-[13px] leading-5 text-zinc-500">
              Not measured. The agent has not completed a cancellation on this site, so exit effort is not part of its score.
            </p>
          )}
          {site.cancelRuns > 0 && (
            <p className="mt-3 text-[12px] text-zinc-500">
              {site.verifiedRuns} of {site.cancelRuns} cancellation attempt{site.cancelRuns === 1 ? "" : "s"} ended verified.
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SitesPage() {
  const [data, setData] = useState<Ranking | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .get<Ranking>("/api/graph/sites")
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch((e: Error) => setError(e.message)),
    []
  );
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Site ranking"
        lede="Every site the agent has visited, ranked by how hard it makes leaving. The worst offenders come first."
      >
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </PageHeader>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-danger-soft px-4 py-3 text-[13px] text-red-700">
          {error}
        </p>
      ) : data === null ? (
        <Skeleton className="h-[360px] w-full rounded-2xl" />
      ) : data.status !== "ok" || data.sites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
          <Gauge className="h-6 w-6 text-zinc-300" aria-hidden="true" />
          <p className="text-sm font-semibold text-zinc-700">
            {data.status === "off"
              ? "The knowledge graph is switched off"
              : data.status === "down"
                ? "Can't reach Neo4j"
                : "No sites yet"}
          </p>
          <p className="max-w-md text-[12px] leading-5 text-zinc-400">
            {data.status === "off"
              ? "The ranking is built from the knowledge graph. Set the NEO4J_ variables in .env.local and restart the server."
              : data.status === "down"
                ? "A free Aura instance pauses when unused — resume it at console.neo4j.io, then refresh."
                : "Scan a page or run the agent, and the site will be ranked here."}
          </p>
        </div>
      ) : (
        <>
          <ol className="space-y-3">
            {data.sites.map((s, i) => (
              <SiteCard key={s.host} site={s} rank={i + 1} />
            ))}
          </ol>

          <section className="rounded-2xl border border-border bg-zinc-50 p-5 text-[13px] leading-6 text-zinc-600">
            <h2 className="text-[14px] font-semibold text-foreground">How the trap score is made</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <b className="font-semibold text-zinc-800">Tricks, up to 60:</b> each dark pattern found adds 5, 10, 20 or 30
                points for low, medium, high or critical severity.
              </li>
              <li>
                <b className="font-semibold text-zinc-800">Exit effort, up to 30:</b> 10 points for every click beyond the
                first that cancelling takes, on the shortest route the agent has walked.
              </li>
              <li>
                <b className="font-semibold text-zinc-800">Failed tries, up to 10:</b> the share of cancellation attempts
                that did not end verified.
              </li>
            </ul>
            <p className="mt-2 text-zinc-500">
              This is TrapKiller&apos;s own yardstick, not an official rating. It only counts what the agent has seen, so a
              site scanned once on a public page will score lower than its real cancel flow deserves.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
