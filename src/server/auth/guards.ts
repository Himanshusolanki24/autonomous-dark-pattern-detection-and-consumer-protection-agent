// =============================================================================
// lib/auth/guards.ts
// The app has no sign-in: every request runs as the single demo user.
// =============================================================================

import { DEV_USER_EMAIL, DEV_USER_ID } from "@/server/supabase/dev-store";
import { AuthenticationError } from "@/server/security/errors";
import { headers } from "next/headers";

export interface AuthedUser {
  id: string;
  email: string | null;
}

export async function requireUser(): Promise<AuthedUser> {
  const secret = process.env.APP_AUTH_SECRET;
  if (secret) {
    let authHeader: string | null = null;
    try {
      const h = await headers();
      authHeader = h.get("authorization") ?? h.get("x-auth-token");
    } catch {
      // outside request context (e.g. scripts/unit tests)
    }
    if (!authHeader) {
      throw new AuthenticationError("Authentication required: missing authorization token");
    }
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token !== secret) {
      throw new AuthenticationError("Invalid authorization credentials");
    }
  }

  return { id: DEV_USER_ID, email: DEV_USER_EMAIL };
}
