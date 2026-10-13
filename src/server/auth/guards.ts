// =============================================================================
// lib/auth/guards.ts
// The app has no sign-in: every request runs as the single demo user.
// =============================================================================

import { DEV_USER_EMAIL, DEV_USER_ID } from "@/server/supabase/dev-store";

export interface AuthedUser {
  id: string;
  email: string | null;
}

export async function requireUser(): Promise<AuthedUser> {
  return { id: DEV_USER_ID, email: DEV_USER_EMAIL };
}
