// =============================================================================
// app/demo-target/success/route.ts
// StreamVault cancellation confirmation — the VERIFY agent's ground truth. Must
// contain a success marker ("subscription is cancelled" / "cancelled").
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamVault — Your subscription is cancelled</title>
  <style>
    * { box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; background:#0b0d14; color:#eef1f7; }
    header { display:flex; align-items:center; justify-content:space-between; padding:16px 40px; border-bottom:1px solid #232a3d; }
    .logo { font-weight:800; font-size:20px; }
    .logo b { background:linear-gradient(90deg,#e50914,#7c3aed); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .wrap { max-width:560px; margin:0 auto; padding:64px 40px; text-align:center; }
    .check { width:76px; height:76px; margin:0 auto 20px; border-radius:50%; background:rgba(94,224,138,.12); border:1px solid rgba(94,224,138,.4); display:flex; align-items:center; justify-content:center; }
    h1 { font-size:26px; margin:0 0 10px; letter-spacing:-.5px; }
    .badge { display:inline-block; background:rgba(94,224,138,.14); color:#5ee08a; padding:9px 18px; border-radius:999px; font-weight:700; font-size:15px; }
    .sub { color:#8a93a8; font-size:14px; margin-top:18px; line-height:1.6; }
    .card { background:#141826; border:1px solid #232a3d; border-radius:14px; padding:20px; margin-top:28px; text-align:left; font-size:14px; }
    .summary { display:flex; justify-content:space-between; padding:8px 0; }
    .summary .k { color:#8a93a8; }
  </style>
</head>
<body>
  <header><div class="logo">▶ <b>StreamVault</b></div></header>
  <div class="wrap">
    <div class="check">
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#5ee08a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </div>
    <h1>Subscription cancelled</h1>
    <div class="badge">✓ Your subscription has been cancelled</div>
    <p class="sub">No further charges will be made. You'll keep access to Premium until the end of your current billing period on <strong>16 Sep 2026</strong>.</p>
    <div class="card">
      <div class="summary"><span class="k">Plan</span><span>Premium — 4K + HDR</span></div>
      <div class="summary"><span class="k">Status</span><span style="color:#5ee08a;font-weight:600;">Cancelled</span></div>
      <div class="summary"><span class="k">Auto-renew</span><span>Disabled</span></div>
      <div class="summary"><span class="k">Confirmation</span><span>SV-2026-0916-CX</span></div>
    </div>
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
