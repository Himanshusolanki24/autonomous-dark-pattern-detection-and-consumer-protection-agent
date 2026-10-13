// =============================================================================
// lib/supabase/admin.ts
// Data client for trusted server code: the agent worker, background cleanup,
// system-generated events. Same in-memory store as server.ts.
// =============================================================================

import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";

export function createAdminClient(): DbClient {
  return createDevClient() as unknown as DbClient;
}
