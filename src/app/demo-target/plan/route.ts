// =============================================================================
// app/demo-target/plan/route.ts
// StreamVault retention "save offer" page — a dark-pattern diversion designed to
// derail cancellation (misdirection + confirmshaming).
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamVault — Wait, don't go!</title>
  <style>
    * { box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; background:#0b0d14; color:#eef1f7; }
    header { display:flex; align-items:center; justify-content:space-between; padding:16px 40px; border-bottom:1px solid #232a3d; }
    .logo { font-weight:800; font-size:20px; }
    .logo b { background:linear-gradient(90deg,#e50914,#7c3aed); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .wrap { max-width:620px; margin:0 auto; padding:56px 40px; text-align:center; }
    .em { font-size:44px; }
    h1 { font-size:28px; margin:14px 0 8px; letter-spacing:-.5px; }
    .sub { color:#8a93a8; font-size:15px; margin:0 0 30px; }
    .offer { background:linear-gradient(160deg,#1b1030,#141826); border:1px solid #7c3aed; border-radius:18px; padding:28px; box-shadow:0 12px 40px rgba(124,58,237,.25); }
    .badge { display:inline-block; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1px; background:#7c3aed; color:#fff; padding:5px 12px; border-radius:999px; }
    .big { font-size:34px; font-weight:800; margin:16px 0 6px; }
    .strike { color:#8a93a8; text-decoration:line-through; font-size:18px; }
    .btn { font-size:16px; font-weight:700; padding:15px 28px; border-radius:12px; border:none; cursor:pointer; text-decoration:none; display:inline-block; width:100%; margin-top:22px; }
    .primary { background:linear-gradient(90deg,#e50914,#7c3aed); color:#fff; }
    .decline { display:inline-block; margin-top:22px; color:#4a5266; font-size:12px; text-decoration:underline; text-underline-offset:3px; }
    .decline:hover { color:#6b748c; }
    .fine { color:#565f73; font-size:12px; margin-top:14px; }
  </style>
</head>
<body>
  <header><div class="logo">▶ <b>StreamVault</b></div></header>
  <div class="wrap">
    <div class="em">😢</div>
    <h1>Wait — we'd hate to see you go</h1>
    <p class="sub">You've watched 142 hours this year. Don't lose your watchlist, downloads and 4K access.</p>
    <div class="offer">
      <span class="badge">Exclusive save offer</span>
      <div class="big">1 month <span style="color:#5ee08a;">FREE</span></div>
      <div><span class="strike">₹649/mo</span> &nbsp;then ₹649/mo — we'll <strong>pause, not cancel</strong> your membership.</div>
      <button class="primary" onclick="window.location.href='/demo-target/plan'">Keep my benefits</button>
    </div>
    <!-- Confirmshaming: the real cancel path is a tiny greyed-out link. -->
    <a class="decline" href="/demo-target/confirm?from=plan">No thanks, cancel subscription</a>
    <p class="fine">Offer expires soon. Prices renew automatically each month.</p>
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
