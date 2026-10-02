// =============================================================================
// app/api/health/route.ts
// Public liveness probe. No auth, no secrets, no DB dependency.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ok: true,
    service: "dark-pattern-trap-killer-backend",
    ts: new Date().toISOString(),
  });
}