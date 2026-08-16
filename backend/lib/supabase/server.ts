// =============================================================================
// lib/supabase/server.ts
// SSR client bound to the authenticated user's cookies.
// The database enforces isolation; this client carries the user's RLS identity.
// =============================================================================

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import type { Database } from "@/types/database";
import type { DbClient } from "./types";
import { createDevClient } from "./dev-store";

export async function createClient(): Promise<DbClient> {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    if (process.env.SUPABASE_DEV_MODE !== "false") {
      return createDevClient() as unknown as DbClient;
    }
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return createServerClient<Database, "public", Database["public"]>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — safe to ignore (middleware refreshes).
        }
      },
    },
  });
}