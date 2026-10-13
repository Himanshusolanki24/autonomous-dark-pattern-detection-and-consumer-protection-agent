// =============================================================================
// lib/supabase/server.ts
// Data client for route handlers. The app has no sign-in, so every request
// runs as the demo user on the in-memory store.
// =============================================================================

import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";

export async function createClient(): Promise<DbClient> {
  return createDevClient() as unknown as DbClient;
}
