// =============================================================================
// lib/security/idempotency.ts
// `Idempotency-Key` support for critical mutations (agent/start, approve).
// Uses the idempotency_keys table via the admin client so it survives restarts.
// =============================================================================

import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";

export async function getCachedResponse(
  userId: string,
  key: string
): Promise<Json | null> {
  const { data } = await createAdminClient()
    .from("idempotency_keys")
    .select("response")
    .eq("user_id", userId)
    .eq("key", key)
    .maybeSingle();

  return data?.response ?? null;
}

/** Atomically reserve an idempotency key. Returns false if it already exists. */
export async function reserveKey(userId: string, key: string): Promise<boolean> {
  const { error } = await createAdminClient().from("idempotency_keys").insert({
    key,
    user_id: userId,
    response: null,
  });
  if (error && error.code === "23505") return false; // unique violation → replay
  if (error) throw error;
  return true;
}

export async function storeResponse(
  userId: string,
  key: string,
  response: Json
): Promise<void> {
  await createAdminClient()
    .from("idempotency_keys")
    .update({ response })
    .eq("user_id", userId)
    .eq("key", key);
}