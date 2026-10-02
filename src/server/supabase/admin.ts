// =============================================================================
// lib/supabase/admin.ts
// Service-role client. BYPASSES RLS.
//
//   Use ONLY from trusted server code: the agent worker, background cleanup,
//   system-generated events, retention jobs.
//
//   NEVER import into client components, browser code, hooks, or public payloads.
// =============================================================================

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";

let _admin: DbClient | null = null;

export function createAdminClient(): DbClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    if (process.env.SUPABASE_DEV_MODE !== "false") {
      return createDevClient() as unknown as DbClient;
    }
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!_admin) {
    _admin = createSupabaseClient<Database, "public", Database["public"]>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _admin;
}

/** Guard so accidental client-side imports fail loudly rather than leak keys. */
export function assertServerOnly(caller: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `[supabase/admin] createAdminClient() called from the browser via ${caller}. ` +
        "The service-role key must never reach client code."
    );
  }
}