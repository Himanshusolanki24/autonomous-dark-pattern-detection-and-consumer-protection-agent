// =============================================================================
// app/demo-target/confirm/route.ts
// StreamVault final confirmation gate — the irreversible submit. This is where
// the agent pauses for human approval before "Yes, cancel my subscription".
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamVault — Confirm cancellation</title>
  <style>
    * { box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; background:#0b0d14; color:#eef1f7; }
    header { display:flex; align-items:center; justify-content:space-between; padding:16px 40px; border-bottom:1px solid #232a3d; }
    .logo { font-weight:800; font-size:20px; }
    .logo b { background:linear-gradient(90deg,#e50914,#7c3aed); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .wrap { max-width:600px; margin:0 auto; padding:48px 40px; }
    h1 { font-size:24px; margin:0 0 6px; letter-spacing:-.5px; }
    .sub { color:#8a93a8; font-size:14px; margin:0 0 26px; }
    .card { background:#141826; border:1px solid #232a3d; border-radius:16px; padding:24px; }
    .summary { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #232a3d; font-size:14px; }
    .summary:last-child { border-bottom:none; }
    .summary .k { color:#8a93a8; }
    .offer { margin-top:18px; border:1px dashed #7c3aed; border-radius:12px; padding:16px; background:rgba(124,58,237,.06); font-size:13px; color:#cdb8ff; }
    .btns { display:flex; flex-direction:column; gap:12px; margin-top:24px; }
    .btn { font-size:15px; font-weight:700; padding:14px 22px; border-radius:11px; border:none; cursor:pointer; text-decoration:none; text-align:center; display:block; }
    /* Misdirection: the retention choice is big & bright; the real cancel is muted. */
    .primary { background:linear-gradient(90deg,#e50914,#7c3aed); color:#fff; box-shadow:0 8px 24px rgba(124,58,237,.3); }
    .ghost { background:transparent; color:#8a93a8; border:1px solid #2c3446; }
    .ghost:hover { color:#eef1f7; }
    .fine { color:#565f73; font-size:12px; margin-top:18px; text-align:center; }
  </style>
</head>
<body>
  <header><div class="logo">▶ <b>StreamVault</b></div></header>
  <div class="wrap">
    <h1>Confirm cancellation</h1>
    <p class="sub">Please review what you'll lose before cancelling your Premium membership.</p>
    <div class="card">
      <div class="summary"><span class="k">Plan</span><span>Premium — 4K + HDR</span></div>
      <div class="summary"><span class="k">Price</span><span>₹649 / month</span></div>
      <div class="summary"><span class="k">Access ends</span><span>16 Sep 2026</span></div>
      <div class="summary"><span class="k">You'll lose</span><span>Downloads · 4 screens · 4K</span></div>
      <div class="offer">💡 <strong>Last chance:</strong> keep your plan for 1 month free — we'll pause, not cancel. You can come back anytime.</div>
      <div class="btns">
        <button class="btn primary" onclick="window.location.href='/demo-target/plan'">I don't want to lose my benefits</button>
        <button class="btn ghost" onclick="window.location.href='/demo-target/success'">Yes, cancel my subscription</button>
      </div>
    </div>
    <p class="fine">Note: cancellation may take up to 24 hours to process.</p>
  </div>
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
