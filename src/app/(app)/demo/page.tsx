"use client";

import { useCallback, useEffect, useState } from "react";
import { FlaskConical, Pause, Play, RotateCcw, ShieldCheck, SkipForward } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoSimulator } from "@/lib/services/simulator";
import { demoTasks } from "@/lib/data";
import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentEventStream } from "@/components/agent/AgentEventStream";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { DetectionOverlay } from "@/components/scanner/DetectionOverlay";
import { BrowserFrame } from "@/components/browser/BrowserFrame";
import { ProofViewer } from "@/components/cancellation/ProofViewer";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/case";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  idle: "border-border bg-zinc-50 text-zinc-600",
  running: "border-emerald-200 bg-success-soft text-emerald-700",
  blocked: "border-amber-200 bg-warning-soft text-amber-800",
  completed: "border-emerald-200 bg-success-soft text-emerald-700",
  failed: "border-red-200 bg-danger-soft text-red-700",
};

export default function DemoPage() {
  const store = useAgentStore();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [running, setRunning] = useState(demoSimulator.isRunning());
  const [paused, setPaused] = useState(demoSimulator.isPaused());
  const [finished, setFinished] = useState(false);

  const sync = useCallback(() => {
    setRunning(demoSimulator.isRunning());
    setPaused(demoSimulator.isPaused());
  }, []);

  useEffect(() => {
    demoSimulator.onFinish = () => {
      setFinished(true);
      sync();
    };
    return () => {
      demoSimulator.onFinish = null;
    };
  }, [sync]);

  const start = useCallback(() => {
    setFinished(false);
    demoSimulator.start(demoTasks[0]);
    sync();
  }, [sync]);

  const reset = useCallback(() => {
    setFinished(false);
    demoSimulator.reset();
    sync();
  }, [sync]);

  const pattern = store.patterns.find((p) => p.id === selectedPattern) ?? null;
  const idle = store.status === "idle" && !finished;

  return (
    <div className="max-w-7xl space-y-5">
      <PageHeader
        eyebrow="Simulation"
        title="Live demo"
        lede="A deterministic, simulated cancellation journey. Watch the agent work end to end — it never submits anything without your approval."
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-warning-soft px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-amber-800">
          <FlaskConical className="h-3 w-3" aria-hidden="true" />
          Simulated
        </span>
      </PageHeader>

      {/* Control bar */}
      <div className="panel relative overflow-hidden p-4">
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-marker/15 blur-3xl"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                STATUS_BADGE[store.status]
              )}
              role="status"
            >
              <StatusDot
                className={cn(
                  idle && "bg-zinc-400",
                  store.status === "running" && "bg-emerald-500 animate-dot-pulse",
                  store.status === "blocked" && "bg-amber-500 animate-dot-pulse",
                  store.status === "completed" && "bg-emerald-500",
                  store.status === "failed" && "bg-red-500"
                )}
              />
              {idle && "Ready"}
              {store.status === "running" && (paused ? "Paused" : "Running")}
              {store.status === "blocked" && "Awaiting approval"}
              {store.status === "completed" && "Completed"}
              {store.status === "failed" && "Stopped"}
            </span>
            <p className="text-[12px] text-zinc-500">
              {store.status === "blocked"
                ? "The final action is paused — approve it in the dialog."
                : idle
                  ? "Start the run to watch each stage fill in."
                  : "Every stage, event and decision is recorded below."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (running && !paused) {
                  demoSimulator.pause();
                } else if (running && paused) {
                  demoSimulator.resume();
                } else {
                  start();
                }
                sync();
              }}
              disabled={finished && !running}
            >
              {running && !paused ? (
                <>
                  <Pause className="h-3.5 w-3.5" aria-hidden="true" /> Pause
                </>
              ) : running && paused ? (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" /> Resume
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" /> Start demo
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                demoSimulator.skipToApproval();
                sync();
              }}
            >
              <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
              Skip to approval
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Pipeline */}
      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3.5">
          <h2 className="font-display text-[15px] font-semibold">Agent pipeline</h2>
          <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
            perceive → detect → plan → act → verify
          </p>
        </div>
        <div className="p-5">
          <AgentPipeline />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="panel overflow-hidden">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-5 py-3.5">
              <h2 className="font-display text-[15px] font-semibold">Live page view</h2>
              <p className="text-[11.5px] text-zinc-500">Simulated view of the service inside the session.</p>
            </div>
            <div className="relative p-5">
              <DetectionOverlay pattern={pattern} onClose={() => setSelectedPattern(null)} />
              <BrowserFrame
                browser={store.browser}
                onElementClick={(t) => {
                  const hit = store.patterns.find((p) => p.type === t);
                  if (hit) setSelectedPattern(hit.id);
                }}
              />
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="flex items-baseline justify-between gap-2 border-b border-border px-5 py-3.5">
              <h2 className="font-display text-[15px] font-semibold">Event stream</h2>
              <span className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
                {store.events.length} events
              </span>
            </div>
            <div className="p-5">
              <AgentEventStream events={store.events} />
            </div>
          </section>
        </div>

        <div className="space-y-5">
          {finished && store.verification ? (
            <ProofViewer verification={store.verification} />
          ) : (
            <section className="panel relative overflow-hidden p-5">
              <span
                aria-hidden="true"
                className="lab-grid-faint pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_30%,black,transparent)]"
              />
              <div className="relative">
                <p className="eyebrow text-[9.5px]">Proof</p>
                <p className="font-display mt-1.5 text-[16px] font-semibold">Waiting for completion</p>
                <p className="mt-1 text-[12px] leading-5 text-zinc-500">
                  Once the agent verifies the cancellation, the proof evidence will appear here.
                </p>
              </div>
            </section>
          )}

          <AgentDecision decision={store.decision} />

          {!idle && (
            <section className="rounded-2xl border border-border bg-zinc-50/70 p-4">
              <p className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
                <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
                Safety note
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-zinc-600">
                The agent may navigate freely, but the final cancellation is gated behind explicit human
                approval. You can stop the agent at any time.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
