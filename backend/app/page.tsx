// =============================================================================
// app/page.tsx
// Minimal status page for the backend host.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function Home() {
  let ok = true;
  let detail = "ok";
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001"}/api/health`, {
      cache: "no-store",
    });
    ok = res.ok;
    if (!ok) detail = `health check returned ${res.status}`;
  } catch (err) {
    ok = false;
    detail = err instanceof Error ? err.message : String(err);
  }

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 28 }}>TrapKiller API</h1>
      <p>Dark Pattern Trap Killer — backend control plane is running.</p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          background: ok ? "#123524" : "#3a1616",
          color: ok ? "#4ade80" : "#f87171",
          fontWeight: 600,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "currentColor" }} />
        {ok ? "healthy" : "degraded"}
      </div>
      {!ok && <p style={{ color: "#f87171" }}>{detail}</p>}
    </main>
  );
}