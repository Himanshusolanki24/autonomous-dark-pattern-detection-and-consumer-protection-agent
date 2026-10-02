"use client";

import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentStatus } from "@/components/agent/AgentStatus";
import { useAgentStore } from "@/stores/agent-store";

export function ActiveTask() {
  const { task, status, browser } = useAgentStore();

  if (!task) {
    return (
      <div className="rounded-xl border border-dashed border-border-strong bg-surface/60 p-5 text-center">
        <p className="text-sm text-muted-foreground">No active agent session.</p>
        <p className="mt-1 text-xs text-zinc-400">
          Start the agent from the Overview to begin a cancellation journey.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">
            {task.service}{" "}
            <span className="font-normal text-zinc-500">· {task.plan}</span>
          </p>
          <p className="mt-0.5 font-mono text-xs text-zinc-400">{browser.url}</p>
        </div>
        <AgentStatus status={status} />
      </div>
      <div className="mt-4">
        <AgentPipeline />
      </div>
    </div>
  );
}