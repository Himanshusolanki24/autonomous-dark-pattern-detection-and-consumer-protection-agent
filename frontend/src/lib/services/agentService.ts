"use client";

import { api } from "@/lib/api";
import { useAgentStore } from "@/stores/agent-store";
import type {
  AgentEvent,
  AgentId,
  AgentStatus,
  BrowserScreen,
  DarkPattern,
  EventStatus,
  PatternType,
} from "@/lib/types";
import { nowIso } from "@/lib/utils";

export interface BackendEvent {
  id: string;
  sessionId: string;
  agent: AgentId | null;
  eventType: string;
  message: string;
  status: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface BackendDetection {
  id: string;
  patternType: string;
  severity: DarkPattern["severity"];
  confidence: number;
  explanation: string;
  elementText: string | null;
}

export interface AgentSessionDetail {
  id: string;
  goal: string;
  status: string;
  currentStage: AgentId | null;
  targetUrl: string;
  state: Record<string, unknown> | null;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  detections: BackendDetection[];
}

export const STAGE_MAP: Record<string, AgentId> = {
  perception: "perception",
  detection: "detection",
  planning: "planning",
  action: "action",
  verification: "verification",
};

const EVENT_STATUS_MAP: Record<string, EventStatus> = {
  running: "running",
  completed: "success",
  approval_required: "warning",
  failed: "error",
  cancelled: "error",
  pending: "running",
};

const SESSION_STATUS_MAP: Record<string, AgentStatus> = {
  running: "running",
  approval_required: "blocked",
  completed: "completed",
  failed: "failed",
  cancelled: "blocked",
  idle: "idle",
};

export const PATTERN_TYPE_MAP: Record<string, PatternType> = {
  confirmshaming: "confirmshaming",
  forced_continuity: "forced-continuity",
  roach_motel: "roach-motel",
  drip_pricing: "drip-pricing",
  basket_sneaking: "basket-sneaking",
  misdirection: "misdirection",
  hard_to_cancel: "hard-to-cancel",
};

export interface StartAgentInput {
  goal: string;
  targetUrl: string;
  idempotencyKey?: string;
}

export async function startAgentRun(
  input: StartAgentInput
): Promise<{ sessionId: string }> {
  const res = await api.post<{ sessionId: string; taskId: string; status: string }>(
    "/api/agent/start",
    { goal: input.goal, targetUrl: input.targetUrl },
    input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : undefined
  );
  return res;
}

export async function fetchSession(sessionId: string): Promise<AgentSessionDetail> {
  return api.get<AgentSessionDetail>(`/api/agent/${sessionId}`);
}

export async function fetchEvents(sessionId: string): Promise<BackendEvent[]> {
  const res = await api.get<{ events: BackendEvent[] }>(`/api/agent/${sessionId}/events`);
  return res.events ?? [];
}

export async function approveSession(sessionId: string): Promise<void> {
  await api.post(`/api/agent/${sessionId}/approve`);
}

export async function rejectSession(sessionId: string): Promise<void> {
  await api.post(`/api/agent/${sessionId}/reject`);
}

export async function stopSession(sessionId: string): Promise<void> {
  await api.post(`/api/agent/${sessionId}/stop`);
}

export function mapEvent(ev: BackendEvent): AgentEvent {
  return {
    id: ev.id,
    timestamp: ev.createdAt ?? nowIso(),
    agent: STAGE_MAP[ev.agent ?? ""] ?? "planning",
    message: ev.message,
    status: EVENT_STATUS_MAP[ev.status ?? ""] ?? "running",
    metadata: (ev.metadata ?? {}) as AgentEvent["metadata"],
  };
}

export function mapDetection(d: BackendDetection): DarkPattern {
  return {
    id: d.id,
    type: PATTERN_TYPE_MAP[d.patternType] ?? "hard-to-cancel",
    severity: d.severity,
    confidence: d.confidence,
    element: d.elementText ?? "Detected element",
    explanation: d.explanation,
    whyItMatters:
      "The agent flags this so you can make an informed decision before anything is submitted.",
  };
}

export function mapSessionStatus(status: string): AgentStatus {
  return SESSION_STATUS_MAP[status] ?? "running";
}

/**
 * Polls a session until terminal, folding backend events + detections into the
 * local agent store. Caller should clear the returned timer on unmount.
 */
export function startPolling(
  sessionId: string,
  onDone?: () => void,
  intervalMs = 1500
): { cancel: () => void } {
  let cancelled = false;
  let timer: ReturnType<typeof setInterval> | null = null;
  const store = useAgentStore.getState;

  const tick = async () => {
    if (cancelled) return;
    try {
      const [session, events] = await Promise.all([fetchSession(sessionId), fetchEvents(sessionId)]);

      const s = store();
      s.setStatus(mapSessionStatus(session.status));

      // Update individual stage states from events
      const hasPerceptionStart = events.some((e) => e.agent === "perception");
      const hasPerceptionDone = events.some((e) => e.agent === "perception" && e.eventType === "perception_completed");
      const hasDetectionStart = events.some((e) => e.agent === "detection");
      const hasDetectionDone = events.some((e) => e.agent === "detection" && e.eventType === "detection_completed");
      const hasPlanningStart = events.some((e) => e.agent === "planning");
      const hasPlanningDone = events.some((e) => e.agent === "planning" && (e.eventType === "goal_reached" || e.eventType === "planning_completed"));
      const hasActionStart = events.some((e) => e.agent === "action");
      const hasActionDone = events.some((e) => e.agent === "action" && e.eventType === "action_completed");
      const hasVerifyDone = events.some((e) => e.agent === "verification" && e.eventType === "task_completed");

      if (hasPerceptionDone) s.setStage("perception", "completed");
      else if (hasPerceptionStart) s.setStage("perception", "running");

      if (hasDetectionDone) s.setStage("detection", "completed");
      else if (hasDetectionStart) s.setStage("detection", "running");

      if (hasPlanningDone) s.setStage("planning", "completed");
      else if (hasPlanningStart) s.setStage("planning", "running");

      if (hasActionDone) s.setStage("action", "completed");
      else if (hasActionStart) s.setStage("action", "running");

      if (hasVerifyDone || session.status === "completed") {
        s.setStage("perception", "completed");
        s.setStage("detection", "completed");
        s.setStage("planning", "completed");
        s.setStage("action", "completed");
        s.setStage("verification", "completed");
      }

      // Update browser preview state
      if (session.targetUrl) {
        const screen: BrowserScreen = 
          session.status === "completed" || session.targetUrl.includes("success")
          ? "success"
          : session.targetUrl.includes("confirm")
          ? "confirm"
          : "account";
        s.setBrowser({
          url: session.targetUrl,
          title: session.targetUrl ? new URL(session.targetUrl).hostname : "Live Browser",
          screen,
          isScanning: session.status === "running",
        });
      }

      const pendingEvents = events
        .filter((e) => !s.events.some((known) => known.id === e.id))
        .map(mapEvent);
      for (const e of pendingEvents) s.addEvent(e);

      if (session.detections.length > 0) {
        s.setPatterns(session.detections.map(mapDetection));
      }

      if (session.status === "approval_required") {
        s.setApprovalRequired(true);
      }

      if (session.status === "completed") {
        s.setStatus("completed");
        s.setVerification({
          service: session.targetUrl ? new URL(session.targetUrl).hostname : "Target Site",
          plan: session.goal ?? "Investigation",
          status: "Investigation verified",
          timestamp: nowIso(),
          method: "DOM & dark pattern classification",
          proofId: `proof_${session.id.slice(0, 8)}`,
        });
        finish();
      } else if (session.status === "failed" || session.status === "cancelled") {
        finish();
      }
    } catch {
      finish();
    }
  };

  const finish = () => {
    if (cancelled) return;
    cancelled = true;
    if (timer) clearInterval(timer);
    onDone?.();
  };

  timer = setInterval(tick, intervalMs);
  void tick();
  return { cancel: finish };
}