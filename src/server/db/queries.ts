// =============================================================================
// lib/db/queries.ts
// Typed read helpers for route handlers. Uses the USER-scoped server client so
// RLS enforces ownership isolation automatically.
// =============================================================================

import type { Database, AgentStage } from "@/types/database";
import type { DbClient } from "@/server/supabase/types";
import { NotFoundError } from "@/server/security/errors";

export interface ActivityQuery {
  userId: string;
  limit: number;
  cursor?: string;
  status?: string;
  agent?: string;
  date?: string;
}

export async function getSessionOwned(db: DbClient, sessionId: string) {
  const { data, error } = await db
    .from("agent_sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (error || !data) throw new NotFoundError("Session not found");
  return data;
}

export async function listSessionsOwned(db: DbClient, userId: string, limit = 20) {
  const { data, error } = await db
    .from("agent_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listSessionDetections(db: DbClient, sessionId: string, limit = 50) {
  const { data, error } = await db
    .from("dark_pattern_detections")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function listSessionEvents(db: DbClient, sessionId: string, limit = 200) {
  const { data, error } = await db
    .from("agent_events")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/**
 * Activity feed with optional filters + keyset pagination.
 * Two queries (events, then their sessions) instead of a nested FK join, since
 * the hand-maintained Database types do not carry relationship metadata.
 */
export async function listActivity(
  db: DbClient,
  query: ActivityQuery
): Promise<{
  items: (Database["public"]["Tables"]["agent_events"]["Row"] & { website: string | null })[];
  nextCursor: string | null;
}> {
  let q = db
    .from("agent_events")
    .select("*")
    .eq("user_id", query.userId)
    .order("created_at", { ascending: false })
    .limit(query.limit + 1);

  if (query.cursor) {
    q = q.lt("created_at", query.cursor);
  }
  if (query.status) {
    q = q.eq("status", query.status);
  }
  if (query.agent) {
    q = q.eq("agent", query.agent as AgentStage);
  }
  if (query.date) {
    const day = query.date; // YYYY-MM-DD
    q = q.gte("created_at", `${day}T00:00:00.000Z`).lt("created_at", `${day}T23:59:59.999Z`);
  }

  const { data, error } = await q;
  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > query.limit;
  const page = hasMore ? rows.slice(0, query.limit) : rows;
  const nextCursor = hasMore && page.length > 0 ? page[page.length - 1].created_at : null;

  // Resolve website (target_url host) for the visible session ids.
  const sessionIds = Array.from(new Set(page.map((r) => r.session_id)));
  const websiteById = new Map<string, string>();
  if (sessionIds.length > 0) {
    const { data: sessions } = await db
      .from("agent_sessions")
      .select("id, target_url")
      .in("id", sessionIds);
    for (const s of sessions ?? []) {
      websiteById.set(s.id, safeHost(s.target_url));
    }
  }

  const items = page.map((r) => ({
    ...r,
    website: websiteById.get(r.session_id) ?? null,
  }));

  return { items, nextCursor };
}

export async function getApprovalOwned(db: DbClient, approvalId: string) {
  const { data, error } = await db
    .from("agent_approvals")
    .select("*")
    .eq("id", approvalId)
    .maybeSingle();
  if (error || !data) throw new NotFoundError("Approval not found");
  return data;
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}