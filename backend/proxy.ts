// =============================================================================
// proxy.ts
// Next.js proxy (replaces the deprecated middleware convention).
// =============================================================================

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/agent/:path*",
    "/scanner/:path*",
    "/cancellations/:path*",
    "/activity/:path*",
    "/settings/:path*",
    "/api/agent/:path*",
    "/api/cancellations/:path*",
    "/api/activity/:path*",
    "/api/profile/:path*",
  ],
};