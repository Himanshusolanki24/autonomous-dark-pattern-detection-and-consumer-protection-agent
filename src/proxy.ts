// =============================================================================
// proxy.ts
// Next.js proxy (replaces the deprecated middleware convention).
// Handles CORS for cross-origin API calls from the frontend dev server.
// =============================================================================

import { type NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:3000"];

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  if (request.method === "OPTIONS") {
    const response = applyCors(request, new NextResponse(null, { status: 204 }));
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Idempotency-Key"
    );
    return response;
  }

  return applyCors(request, NextResponse.next());
}

export const config = {
  matcher: ["/api/:path*"],
};