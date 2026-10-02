"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  FlaskConical,
} from "lucide-react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { cn } from "@/lib/utils";

const STATUS_BADGE: Record<string, string> = {
  idle: "border-zinc-200 bg-surface text-zinc-500",
  running: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blocked: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
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
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <FlaskConical className="h-5 w-5 text-amber-600" />
            Live Demo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A deterministic, simulated cancellation journey. Watch the agent work
            end to end — it never submits anything without your approval.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
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
                <Pause className="h-4 w-4" /> Pause
              </>
            ) : running && paused ? (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            ) : (
              <>
                <Play className="h-4 w-4" /> Start Demo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              demoSimulator.skipToApproval();
              sync();
            }}
          >
            <SkipForward className="h-4 w-4" />
            Skip to Approval
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
            STATUS_BADGE[store.status]
          )}
          role="status"
        >
          <StatusDot
            className={cn(
              idle && "bg-zinc-300",
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

        {store.status === "blocked" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            The final action is paused — approve it in the dialog.
          </span>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Agent Pipeline</CardTitle>
          <CardDescription>PERCEIVE → DETECT → PLAN → ACT → VERIFY</CardDescription>
        </CardHeader>
        <CardContent>
          <AgentPipeline />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Live page view</CardTitle>
              <CardDescription>
                Simulated view of the service inside the user&apos;s session.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <DetectionOverlay
                pattern={pattern}
                onClose={() => setSelectedPattern(null)}
              />
              <BrowserFrame
                browser={store.browser}
                onElementClick={(t) => {
                  const hit = store.patterns.find((p) => p.type === t);
                  if (hit) setSelectedPattern(hit.id);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <AgentEventStream events={store.events} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {finished && store.verification ? (
            <ProofViewer verification={store.verification} />
          ) : (
            <div className="rounded-xl border border-border bg-surface p-5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Waiting for completion</p>
              <p className="mt-1 text-xs">
                Once the agent verifies the cancellation, the proof evidence will
                appear here.
              </p>
            </div>
          )}

          <AgentDecision decision={store.decision} />

          {!idle && (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Safety note
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-600">
                The agent may navigate freely, but the final cancellation is
                gated behind explicit human approval. You can stop the agent at
                any time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}