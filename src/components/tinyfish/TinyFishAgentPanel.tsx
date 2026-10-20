"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ExternalLink, Loader2, Play, ShieldCheck, X } from "lucide-react";
import {
  resultText,
  runTinyFishAgent,
  tinyfishStatus,
  type AgentEvent,
  type TinyFishCall,
} from "@/lib/services/tinyfishService";
import { TinyFishActivity } from "@/components/tinyfish/TinyFishActivity";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Phase = "idle" | "exploring" | "awaiting" | "confirming" | "done" | "rejected" | "error";

interface RunView {
  runId?: string;
  streamUrl?: string;
  steps: string[];
  result?: string;
}

/**
 * Runs the TinyFish Web Agent on a cancellation flow. The first run stops before
 * the final confirm; only Approve starts a second run that finishes the job.
 */
export function TinyFishAgentPanel() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [run, setRun] = useState<RunView>({ steps: [] });
  const [calls, setCalls] = useState<TinyFishCall[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    tinyfishStatus()
      .then((s) => {
        setEnabled(s.enabled);
        // TinyFish can only reach public pages, so prefill the deployed test site.
        const local = /localhost|127\.0\.0\.1/.test(window.location.hostname);
        setUrl(local ? s.demoUrl ?? "" : `${window.location.origin}/demo-target/account`);
      })
      .catch(() => setEnabled(false));
    return () => abort.current?.abort();
  }, []);

  const start = async (mode: "explore" | "confirm") => {
    setError(null);
    setPhase(mode === "explore" ? "exploring" : "confirming");
    setRun({ steps: [] });
    abort.current = new AbortController();
    const t0 = Date.now();
    let runId: string | undefined;
    let status: string | undefined;
    const label = mode === "explore" ? "Walk the cancel flow, stop before confirm" : "Finish the cancellation (approved)";
    try {
      await runTinyFishAgent(
        url.trim(),
        mode,
        (e: AgentEvent) => {
          if (e.run_id) runId = e.run_id;
          setRun((r) => {
            if (e.type === "STARTED") return { ...r, runId: e.run_id };
            if (e.type === "STREAMING_URL") return { ...r, streamUrl: e.streaming_url };
            if (e.type === "PROGRESS" && e.purpose) return { ...r, steps: [...r.steps, e.purpose] };
            if (e.type === "COMPLETE") return { ...r, result: resultText(e.result) || resultText(e.error) };
            return r;
          });
          if (e.type === "COMPLETE") status = e.status;
          if (e.type === "ERROR") throw new Error(String(e.error));
        },
        abort.current.signal
      );
      const ok = status === "COMPLETED";
      setCalls((c) => [...c, { api: "agent", label, ok, ms: Date.now() - t0, id: runId, error: ok ? undefined : `Run ended: ${status ?? "no result"}` }]);
      if (!ok) throw new Error(`The TinyFish run ended without finishing (${status ?? "no result"}).`);
      setPhase(mode === "explore" ? "awaiting" : "done");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setCalls((c) =>
        c.some((x) => x.id === runId && runId) ? c : [...c, { api: "agent", label, ok: false, ms: Date.now() - t0, id: runId, error: (err as Error).message }]
      );
      setError((err as Error).message);
      setPhase("error");
    }
  };

  if (enabled === false) return null;
  const busy = phase === "exploring" || phase === "confirming";

  return (
    <section className="max-w-5xl rounded-2xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[16px] font-semibold">Run with the TinyFish agent</h2>
        <span className="text-[12px] text-zinc-500">TinyFish Web Agent · cloud browser · live view</span>
      </div>
      <p className="mt-1 text-[13.5px] text-zinc-500">
        Give TinyFish a plain-English goal. It walks the cancel flow on a cloud browser, declines retention offers, and stops before
        the final confirm until you approve.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          aria-label="Public page address for the TinyFish agent"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={busy}
          className="h-11 flex-1 rounded-xl border border-border-strong bg-background px-4 font-mono text-[13px] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15 disabled:opacity-60"
        />
        <Button onClick={() => void start("explore")} disabled={busy || !url.trim() || enabled === null} className="h-11 rounded-xl px-5">
          {phase === "exploring" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          {phase === "exploring" ? "TinyFish is working…" : "Run with TinyFish"}
        </Button>
      </div>

      {phase !== "idle" && (
        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-3">
            <div className="aspect-video overflow-hidden rounded-xl border border-border bg-zinc-950">
              {run.streamUrl && busy ? (
                <iframe src={run.streamUrl} title="TinyFish live browser view" className="h-full w-full" allow="clipboard-read" />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-[13px] text-zinc-400">
                  {busy ? "Starting the TinyFish cloud browser…" : "The live view closes when the run ends."}
                </div>
              )}
            </div>
            {run.streamUrl && busy && (
              <a href={run.streamUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12.5px] text-brand">
                Open the live view in a new tab <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            )}

            {phase === "awaiting" && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">Stopped before the final confirm</p>
                <p className="mt-1 text-[13.5px] text-amber-900/80">Nothing irreversible has happened. Approve to let TinyFish finish the cancellation.</p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => void start("confirm")}>
                    <Check className="h-4 w-4" aria-hidden="true" /> Approve
                  </Button>
                  <Button variant="outline" onClick={() => setPhase("rejected")}>
                    <X className="h-4 w-4" aria-hidden="true" /> Reject
                  </Button>
                </div>
              </div>
            )}
            {phase === "rejected" && <p className="text-[14px] text-zinc-600">Rejected. TinyFish was not asked to confirm; the subscription is untouched.</p>}
            {phase === "done" && (
              <p className="flex items-center gap-2 font-semibold text-emerald-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" /> Cancellation finished by TinyFish. Run id saved below as proof.
              </p>
            )}
            {error && (
              <p role="alert" className="text-[13.5px] text-red-600">
                {error}
              </p>
            )}
            {run.result && (
              <div>
                <h3 className="text-[13px] font-semibold">What TinyFish reported</h3>
                <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-[12.5px] leading-relaxed text-zinc-700">
                  {run.result}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[13px] font-semibold">Steps</h3>
              <ol className="mt-2 space-y-2">
                {run.steps.map((s, i) => (
                  <li key={i} className={cn("flex gap-2 text-[13px]", i === run.steps.length - 1 && busy ? "text-foreground" : "text-zinc-600")}>
                    <span className="font-mono text-zinc-400">{i + 1}</span>
                    {s}
                  </li>
                ))}
                {busy && <li className="flex items-center gap-2 text-[13px] text-zinc-400"><Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> working</li>}
              </ol>
            </div>
            <TinyFishActivity calls={calls} />
          </div>
        </div>
      )}
    </section>
  );
}
