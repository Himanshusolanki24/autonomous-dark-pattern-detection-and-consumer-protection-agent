// =============================================================================
// app/demo-target/success/route.ts
// Success page — the VERIFY agent's ground truth for "cancellation confirmed".
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Your subscription is cancelled</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px; color: #111; background: #fff; text-align: center; }
    h1 { font-size: 22px; }
    .badge { display: inline-block; background: #e6f4ea; color: #1e7a34; padding: 8px 16px; border-radius: 999px; font-weight: 600; margin-top: 12px; }
    .muted { color: #666; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>Subscription cancelled</h1>
  <div class="badge">Your subscription has been cancelled</div>
  <p class="muted">No further charges. You'll keep access until the end of the current billing period.</p>
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