// =============================================================================
// lib/supabase/admin.ts
// Data client for trusted server code: the agent worker, background cleanup,
// system-generated events. Same in-memory store as server.ts.
// =============================================================================

import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let adminClient: DbClient | null = null;

export function createAdminClient(): DbClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    if (!adminClient) {
      adminClient = createSupabaseClient<Database>(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      }) as unknown as DbClient;
    }
    return adminClient;
  }

  return createDevClient() as unknown as DbClient;
}
