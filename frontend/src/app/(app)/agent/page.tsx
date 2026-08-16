"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoSimulator } from "@/lib/services/simulator";
import { startAgentRun, startPolling } from "@/lib/services/agentService";
import { mockTasks } from "@/lib/data";
import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentEventStream } from "@/components/agent/AgentEventStream";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { DetectionOverlay } from "@/components/scanner/DetectionOverlay";
import { BrowserFrame } from "@/components/browser/BrowserFrame";
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
import { DEMO_SERVICE } from "@/lib/constants";

export default function AgentPage() {
  const store = useAgentStore();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pollRef = useRef<{ cancel: () => void } | null>(null);

  const startAgent = useCallback(async () => {
    const task = mockTasks[0];
    try {
      const { sessionId } = await startAgentRun({
        goal: "cancel_subscription",
        targetUrl: DEMO_SERVICE.url,
      });
      store.startSession({
        ...task,
        id: sessionId,
        service: task.service,
        plan: task.plan,
      });
      store.setLive(true);
      pollRef.current?.cancel();
      pollRef.current = startPolling(sessionId, () => {
        pollRef.current = null;
      });
    } catch {
      store.setLive(false);
      demoSimulator.start(task);
    }
  }, [store]);

  const reset = useCallback(() => {
    pollRef.current?.cancel();
    pollRef.current = null;
    demoSimulator.reset();
  }, []);

  useEffect(() => {
    return () => pollRef.current?.cancel();
  }, []);

  const pattern = store.patterns.find((p) => p.id === selectedPattern) ?? null;
  const idle = store.status === "idle";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Agent</h2>
          <p className="text-sm text-muted-foreground">
            Watch the agent perceive, detect, plan, act and verify in real time.
          </p>
        </div>
        <div className="flex gap-2">
          {idle ? (
            <Button onClick={startAgent}>
              <Play className="h-4 w-4" />
              Start Agent
            </Button>
          ) : (
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>

      <Card className={idle ? "opacity-90" : undefined}>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Agent Activity</CardTitle>
            <CardDescription className="mt-1">
              {idle
                ? "The pipeline is idle. Start the agent to begin a cancellation journey."
                : "The pipeline below reflects the live agent session."}
            </CardDescription>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              idle
                ? "border-zinc-200 bg-surface text-zinc-500"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            )}
          >
            <StatusDot className={idle ? "bg-zinc-300" : "bg-emerald-500 animate-dot-pulse"} />
            {idle ? "IDLE" : "ACTIVE"}
          </span>
        </CardHeader>
        <CardContent>
          <AgentPipeline />
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Live page view</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <DetectionOverlay pattern={pattern} onClose={() => setSelectedPattern(null)} />
            <BrowserFrame
              browser={store.browser}
              onElementClick={(t) => {
                const hit = store.patterns.find((p) => p.type === t);
                if (hit) setSelectedPattern(hit.id);
              }}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-4">
              <AgentEventStream
                events={store.events}
                collapsed={collapsed}
                onCollapse={() => setCollapsed((v) => !v)}
              />
            </CardContent>
          </Card>

          <AgentDecision decision={store.decision} />
        </div>
      </div>
    </div>
  );
}