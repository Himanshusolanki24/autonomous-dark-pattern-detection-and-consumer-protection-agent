// =============================================================================
// lib/supabase/client.ts
// Browser (publishable) client. Safe for client components and hooks only.
// NEVER import the admin client here.
// =============================================================================

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import type { DbClient } from "./types";

export function createClient(): DbClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  return createBrowserClient<Database, "public", Database["public"]>(url, key);
}