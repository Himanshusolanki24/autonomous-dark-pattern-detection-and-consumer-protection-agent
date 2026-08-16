// =============================================================================
// lib/security/audit.ts
// Structured audit logging + a request-id factory for tracing:
//   request → agent session → agent events → browser actions → verification
// =============================================================================

import { randomUUID } from "node:crypto";
import type { Json } from "@/types/database";

const FORBIDDEN = ["password", "token", "cookie", "api_key", "apikey", "secret", "card", "cvv"];

export function makeRequestId(): string {
  return `req_${randomUUID().slice(0, 8)}`;
}

/** Redacts sensitive keys recursively before anything touches logs/storage. */
export function sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    const low = key.toLowerCase();
    if (FORBIDDEN.some((f) => low.includes(f))) {
      out[key] = "[redacted]";
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      out[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export interface AuditContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

export function logEvent(
  context: AuditContext,
  message: string,
  meta: Record<string, unknown> = {}
): void {
  const safe = sanitizeMetadata(meta);
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level: "info",
    message,
    requestId: context.requestId,
    userId: context.userId ?? null,
    sessionId: context.sessionId ?? null,
    ...safe,
  });
  // stdout — a structured logging pipeline (e.g. Vercel / Datadog) consumes it.
  console.log(line);
}

/**
 * Persists an audit_logs row (service role) with redacted metadata.
 * Users never write audit rows; the server owns the audit trail.
 */
export async function persistAudit(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  ctx: AuditContext,
  action: string,
  opts: {
    resourceType?: string;
    resourceId?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      user_id: ctx.userId ?? null,
      session_id: ctx.sessionId ?? null,
      action,
      resource_type: opts.resourceType ?? null,
      resource_id: opts.resourceId ?? null,
      ip_hash: ctx.ip ? sha256(ctx.ip).slice(0, 32) : null,
      user_agent: ctx.userAgent ? ctx.userAgent.slice(0, 200) : null,
      metadata: sanitizeMetadata(opts.metadata ?? {}) as Json,
    });
  } catch (err) {
    // Audit must never take down the primary operation.
    logEvent(ctx, "audit_persist_failed", { action, error: String(err) });
  }
}

import { createHash } from "node:crypto";

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}