"use client";

import { api } from "@/lib/api";
import type { ActivityRecord, CancellationTask } from "@/lib/types";
import { hostnameOf } from "@/lib/utils";
import { mockActivity, mockTasks } from "@/lib/data";
import { STAGE_MAP } from "@/lib/services/agentService";

export interface BackendTask {
  id: string;
  serviceName: string;
  targetUrl: string;
  status: string;
  requestedAt: string;
  startedAt: string | null;
  approvedAt: string | null;
  completedAt: string | null;
  failureReason: string | null;
  sessionId: string | null;
}

interface BackendActivityItem {
  id: string;
  timestamp: string;
  agent: string | null;
  eventType: string;
  message: string;
  status: string | null;
  website: string | null;
}

const TASK_STATUS_MAP: Record<string, CancellationTask["status"]> = {
  running: "running",
  completed: "completed",
  failed: "failed",
  cancelled: "failed",
  waiting: "waiting",
};

const EVENT_STATUS_MAP: Record<string, ActivityRecord["status"]> = {
  running: "warning",
  completed: "success",
  approval_required: "warning",
  failed: "error",
  cancelled: "error",
  pending: "warning",
};

function mapTask(t: BackendTask): CancellationTask {
  const domain = hostnameOf(t.targetUrl);
  return {
    id: t.id,
    service: t.serviceName,
    plan: "Subscription",
    price: "—",
    domain,
    status: TASK_STATUS_MAP[t.status] ?? "running",
    createdAt: t.requestedAt ?? t.startedAt ?? new Date().toISOString(),
    completedAt: t.completedAt ?? undefined,
    patternCount: 0,
  };
}

export async function fetchTasks(): Promise<CancellationTask[]> {
  try {
    const res = await api.get<{ tasks: BackendTask[] }>("/api/cancellations");
    return (res.tasks ?? []).map(mapTask);
  } catch {
    return mockTasks.map((t) => ({ ...t }));
  }
}

export async function fetchActivity(): Promise<ActivityRecord[]> {
  try {
    const res = await api.get<{ items: BackendActivityItem[] }>("/api/activity?limit=50");
    return (res.items ?? [])
      .filter((a) => a.agent)
      .map((a) => ({
        id: a.id,
        timestamp: a.timestamp,
        agent: STAGE_MAP[a.agent ?? ""] ?? "perception",
        event: a.message,
        website: a.website ?? "unknown",
        status: EVENT_STATUS_MAP[a.status ?? ""] ?? "success",
      }));
  } catch {
    return mockActivity.map((a) => ({ ...a }));
  }
}

export interface StartCancellationInput {
  goal: string;
  targetUrl: string;
}

export async function startCancellation(
  input: StartCancellationInput
): Promise<{ sessionId: string; taskId: string }> {
  return api.post<{ sessionId: string; taskId: string; status: string }>(
    "/api/cancellations",
    { goal: input.goal, targetUrl: input.targetUrl }
  );
}

export async function stopTask(taskId: string): Promise<void> {
  await api.post(`/api/cancellations/${taskId}/stop`);
}

export function summarizeTasks(tasks: CancellationTask[]) {
  return {
    total: tasks.length,
    running: tasks.filter((t) => t.status === "running").length,
    approval: tasks.filter((t) => t.status === "approval").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };
}