// =============================================================================
// app/demo-target/plan/route.ts
// Retention offer page — a dark-pattern diversion in the demo flow.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Keep your plan — special offer</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #111; background: #fff; text-align: center; }
    h1 { font-size: 22px; }
    .card { border: 1px solid #0f62fe; border-radius: 10px; padding: 20px; margin-top: 16px; }
    .actions { display: flex; gap: 12px; margin-top: 24px; justify-content: center; }
    button, a.btn { font-size: 16px; padding: 12px 20px; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
    .primary { background: #0f62fe; color: #fff; }
    .muted { color: #666; font-size: 14px; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>Wait — before you go</h1>
  <div class="card">
    <p>We have a special offer for you: <strong>keep your Premium benefits for 1 month free</strong>, then we pause — not cancel — your membership. No action needed, just click below.</p>
    <div class="actions">
      <button class="primary" onclick="window.location.href='/demo-target/plan'">Keep my benefits</button>
      <a class="muted" style="text-decoration:underline" href="/demo-target/confirm?from=plan">No thanks, cancel subscription</a>
    </div>
  </div>
  <p class="muted">Offer ends soon.</p>
</body>
</html>`;

export function GET() {
  return new Response(HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}