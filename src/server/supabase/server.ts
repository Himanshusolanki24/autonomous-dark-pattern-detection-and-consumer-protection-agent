// =============================================================================
// lib/supabase/server.ts
// Data client for route handlers. The app has no sign-in, so every request
// runs as the demo user on the in-memory store.
// =============================================================================

import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export async function createClient(): Promise<DbClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    return createSupabaseClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }) as unknown as DbClient;
  }

  return createDevClient() as unknown as DbClient;
}
