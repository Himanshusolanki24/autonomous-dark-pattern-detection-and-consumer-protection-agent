// =============================================================================
// lib/agent/events.ts
// Agent event emission → agent_events table (Realtime publishes inserts).
// Events are user-visible: they must NOT contain internal chain-of-thought.
// =============================================================================

import type { EventType, AgentStage, AgentStatus } from "@/types/database";
import type { DbClient } from "@/server/supabase/types";

export interface EmitOptions {
  agent?: AgentStage;
  eventType: EventType;
  message: string;
  status?: AgentStatus | "completed" | "approval_required";
}

/** Fire-safe event emit; the run continues even if an event fails to persist. */
export async function emitEvent(
  supabase: DbClient,
  sessionId: string,
  opts: EmitOptions & { userId: string }
): Promise<void> {
  try {
    await supabase.from("agent_events").insert({
      session_id: sessionId,
      user_id: opts.userId,
      agent: opts.agent ?? null,
      event_type: opts.eventType,
      message: opts.message,
      status: opts.status ?? null,
    });
  } catch (err) {
    console.error("[agent/events] emit failed", { sessionId, opts, err: String(err) });
  }
}

/** Human-readable stage label for the activity feed. */
export function stageLabel(stage: AgentStage): string {
  switch (stage) {
    case "perception":
      return "Perceiving";
    case "detection":
      return "Detecting";
    case "planning":
      return "Planning";
    case "action":
      return "Acting";
    case "verification":
      return "Verifying";
    default:
      return stage;
  }
}