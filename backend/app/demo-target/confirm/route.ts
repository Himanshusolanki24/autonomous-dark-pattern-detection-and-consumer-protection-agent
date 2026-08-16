// =============================================================================
// app/demo-target/confirm/route.ts
// Confirmation gate — the "roach motel" friction point of the demo flow.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Confirm cancellation</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #111; background: #fff; }
    h1 { font-size: 20px; }
    .card { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-top: 16px; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    button, a.btn { font-size: 16px; padding: 12px 20px; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
    .primary { background: #0f62fe; color: #fff; }
    .muted { color: #666; font-size: 14px; margin-top: 12px; }
    .offer { border: 1px dashed #0f62fe; border-radius: 10px; padding: 16px; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>We'd hate to see you go</h1>
  <div class="card">
    <p>Are you sure you want to cancel your Premium subscription?</p>
    <div class="offer">
      <strong>Before you go:</strong> keep your plan for 1 month at no cost, then we'll pause — not cancel — your membership. Just say the word.
    </div>
    <div class="actions">
      <button class="primary" onclick="window.location.href='/demo-target/plan'">I don't want to lose my benefits</button>
      <button onclick="window.location.href='/demo-target/success'">Yes, cancel my subscription</button>
    </div>
  </div>
  <p class="muted">Please note: cancellation may take up to 24 hours to process.</p>
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