// =============================================================================
// lib/supabase/types.ts
// Explicit Supabase client generic so table Row/Insert types resolve concretely
// (deferred conditional generics otherwise degrade rows to `never`).
// =============================================================================

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type DbClient = SupabaseClient<Database, "public", Database["public"]>;