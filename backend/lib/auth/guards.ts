// =============================================================================
// lib/auth/guards.ts
// Server-side authentication guards for route handlers.
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { AuthenticationError } from "@/lib/security/errors";

export interface AuthedUser {
  id: string;
  email: string | null;
}

/**
 * Resolves the authenticated user from the Supabase SSR session.
 * Throws AuthenticationError (→ 401) when there is no session.
 * The user id is ALWAYS derived from the session — never from the client.
 */
export async function requireUser(): Promise<AuthedUser> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError("Authentication required");
  }

  return { id: user.id, email: user.email ?? null };
}

export async function getOptionalUser(): Promise<AuthedUser | null> {
  try {
    return await requireUser();
  } catch {
    return null;
  }
}