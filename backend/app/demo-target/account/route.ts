// =============================================================================
// app/demo-target/account/route.ts
// Self-hosted mock subscription page (the "account" step of the demo flow).
// Lets the worker run end-to-end without any external site.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AcmeCloud — Subscription</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #111; background: #fff; }
    h1 { font-size: 22px; }
    .plan { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-top: 16px; }
    .actions { display: flex; gap: 12px; margin-top: 24px; }
    button, a.btn { font-size: 16px; padding: 12px 20px; border-radius: 8px; border: none; cursor: pointer; text-decoration: none; display: inline-block; }
    .primary { background: #0f62fe; color: #fff; }
    .danger { background: #c22; color: #fff; }
    .muted { color: #666; font-size: 14px; margin-top: 12px; }
  </style>
</head>
<body>
  <h1>AcmeCloud</h1>
  <p>Signed in as <strong>demo@acme.test</strong></p>
  <div class="plan">
    <h2>Premium Plan</h2>
    <p>$19.00 / month · renews automatically</p>
    <p class="muted">You are on the free trial. Your trial ends in 5 days and you will be charged $19.00/mo unless you cancel.</p>
  </div>
  <div class="actions">
    <a class="btn primary" href="/demo-target/plan">I want to keep my benefits</a>
    <a class="btn danger" href="/demo-target/confirm?from=account">Cancel subscription</a>
  </div>
  <p class="muted">We'd hate to see you go. Need help? Chat with us.</p>
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