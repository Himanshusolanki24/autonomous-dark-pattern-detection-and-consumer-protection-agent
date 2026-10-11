"use client";

import { useCallback, useEffect, useState } from "react";
import { GraduationCap, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Marker, PageHeader } from "@/components/ui/case";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Finding { patternType: string; label: string; phrase: string; sites: string[]; value: number | null; votes: number }
interface Click { host: string; path: string; label: string; value: number; runs: number }
interface Snapshot {
  status: "ok" | "off" | "down";
  threshold: number;
  findings: Finding[];
  clicks: Click[];
  runs: { status: string; count: number }[];
}

const keyOf = (f: Finding) => `${f.patternType}|${f.phrase}`;

// ── Small pieces ──────────────────────────────────────────────────────────────

/** A learned value from -1 to 1, with what the agent does about it. */
function Score({ value, threshold, yes, no }: { value: number; threshold: number; yes: string; no: string }) {
  const tone = value >= threshold ? "good" : value <= -threshold ? "bad" : "unsure";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium",
        tone === "good" && "bg-success-soft text-emerald-700",
        tone === "bad" && "bg-danger-soft text-red-700",
        tone === "unsure" && "bg-zinc-100 text-zinc-600"
      )}
    >
      <span className="font-mono tabular-nums">{value > 0 ? "+" : ""}{value.toFixed(2)}</span>
      {tone === "good" ? yes : tone === "bad" ? no : "Not sure yet"}
    </span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3">
      <p className="font-display text-[28px] font-bold leading-none text-foreground tabular-nums">{value}</p>
      <p className="mt-1.5 text-[12px] text-zinc-500">{label}</p>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 max-w-2xl text-[13px] leading-5 text-zinc-500">{hint}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Nothing({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-[13px] text-zinc-500">
      {children}
    </p>
  );
}

function VoteButtons({ busy, onVote }: { busy: boolean; onVote: (correct: boolean) => void }) {
  return (
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button size="sm" variant="outline" disabled={busy} onClick={() => onVote(true)}>
        <ThumbsUp className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
        Yes, a trick
      </Button>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => onVote(false)}>
        <ThumbsDown className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
        No, false alarm
      </Button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LearningPage() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .get<Snapshot>("/api/graph/learning")
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

  const vote = (f: Finding, correct: boolean) => {
    setBusy(keyOf(f));
    api
      .post("/api/graph/feedback", { patternType: f.patternType, evidence: f.phrase, correct })
      .then(load)
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(null));
  };

  const waiting = data?.findings.filter((f) => f.value === null) ?? [];
  const rated = data?.findings.filter((f) => f.value !== null) ?? [];
  const t = data?.threshold ?? 0.4;
  const runCount = (status: string) => data?.runs.find((r) => r.status === status)?.count ?? 0;

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Learning"
        lede="The agent learns from rewards. Your verdict on a finding teaches it which wording is a real trick. A cancellation that is verified on the page teaches it which clicks work."
      >
        <button
          onClick={() => void load()}
          className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </PageHeader>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-danger-soft px-4 py-3 text-[13px] text-red-700">
          {error}
        </p>
      )}

      {data === null ? (
        !error && <Skeleton className="h-[420px] w-full rounded-2xl" />
      ) : data.status !== "ok" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-16 text-center">
          <GraduationCap className="h-6 w-6 text-zinc-300" aria-hidden="true" />
          <p className="text-sm font-semibold text-zinc-700">
            {data.status === "off" ? "Learning is switched off" : "Can't reach Neo4j"}
          </p>
          <p className="max-w-md text-[12px] leading-5 text-zinc-400">
            {data.status === "off"
              ? "What the agent learns is stored in the knowledge graph. Set the NEO4J_ variables in .env.local and restart the server."
              : "A free Aura instance pauses when unused — resume it at console.neo4j.io, then refresh."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={waiting.length} label="Findings waiting for your verdict" />
            <Stat value={rated.filter((f) => Math.abs(f.value ?? 0) >= t).length} label="Wordings it has learned" />
            <Stat value={data.clicks.length} label="Clicks it has a score for" />
            <Stat value={runCount("verified")} label="Runs verified on the page" />
          </div>

          <Section
            title="Was the agent right?"
            hint="These are the exact words it flagged on real pages. Say yes and it will flag that wording everywhere without help. Say no and it stops flagging it."
          >
            {waiting.length === 0 ? (
              <Nothing>Nothing to review. Scan a page or run the agent and its findings will show up here.</Nothing>
            ) : (
              <ul className="space-y-2">
                {waiting.map((f) => (
                  <li
                    key={keyOf(f)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-zinc-500">
                        {f.label}
                        {f.sites.length > 0 && <span className="font-normal text-zinc-400"> · seen on {f.sites.join(", ")}</span>}
                      </p>
                      <p className="mt-1 break-words text-[15px] leading-6 text-foreground">
                        <Marker>“{f.phrase}”</Marker>
                      </p>
                    </div>
                    <VoteButtons busy={busy === keyOf(f)} onVote={(c) => vote(f, c)} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="What it learned about wording"
            hint={`Each verdict moves a score between −1 and +1. At +${t} or more the agent flags the wording by itself; at −${t} or less it ignores it. You can change your mind.`}
          >
            {rated.length === 0 ? (
              <Nothing>No verdicts yet. Answer one above and it will appear here with its score.</Nothing>
            ) : (
              <ul className="space-y-2">
                {rated.map((f) => (
                  <li
                    key={keyOf(f)}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-zinc-500">
                        {f.label} · {f.votes} verdict{f.votes === 1 ? "" : "s"}
                      </p>
                      <p className="mt-0.5 break-words text-[14px] leading-6 text-zinc-800">“{f.phrase}”</p>
                    </div>
                    <Score value={f.value ?? 0} threshold={t} yes="Flags it" no="Ignores it" />
                    <VoteButtons busy={busy === keyOf(f)} onVote={(c) => vote(f, c)} />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section
            title="What it learned about clicks"
            hint="Every click in a run gets +1 when the cancellation is verified on the page and −1 when the run fails. On each page the agent picks the click with the best score."
          >
            {data.clicks.length === 0 ? (
              <Nothing>No scored clicks yet. Run a cancellation on the demo site to see this fill in.</Nothing>
            ) : (
              <ul className="space-y-2">
                {data.clicks.map((c) => (
                  <li
                    key={`${c.host}${c.path}${c.label}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="break-all font-mono text-[11px] text-zinc-400">
                        {c.host}
                        {c.path}
                      </p>
                      <p className="mt-0.5 break-words text-[14px] font-medium leading-6 text-zinc-800">Click “{c.label}”</p>
                    </div>
                    <span className="text-[12px] text-zinc-500">
                      {c.runs} run{c.runs === 1 ? "" : "s"}
                    </span>
                    <Score value={c.value} threshold={t} yes="Prefers it" no="Avoids it" />
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <p className="text-[12px] text-zinc-400">
            Runs so far: {runCount("verified")} verified, {runCount("unverified")} ended without proof,{" "}
            {runCount("failed")} failed.
          </p>
        </>
      )}
    </div>
  );
}
