// =============================================================================
// app/demo-target/account/route.ts
// Realistic mock streaming-service account page ("StreamVault") with embedded
// dark patterns. Entry point of the demo cancellation flow. Self-contained HTML
// (inline CSS/SVG, no external assets) so it renders instantly for screenshots.
// =============================================================================

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamVault — Account & Membership</title>
  <style>
    :root { --bg:#0b0d14; --panel:#141826; --line:#232a3d; --text:#eef1f7; --muted:#8a93a8; --brand:#e50914; --brand2:#7c3aed; }
    * { box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; margin:0; background:var(--bg); color:var(--text); }
    header { display:flex; align-items:center; justify-content:space-between; padding:16px 40px; border-bottom:1px solid var(--line); background:rgba(11,13,20,.9); }
    .logo { display:flex; align-items:center; gap:10px; font-weight:800; font-size:20px; letter-spacing:-.5px; }
    .logo b { background:linear-gradient(90deg,var(--brand),var(--brand2)); -webkit-background-clip:text; background-clip:text; color:transparent; }
    nav { display:flex; gap:26px; font-size:14px; color:var(--muted); }
    nav span { cursor:pointer; }
    nav span:hover { color:var(--text); }
    .avatar { width:34px; height:34px; border-radius:8px; background:linear-gradient(135deg,var(--brand),var(--brand2)); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:14px; }
    .wrap { max-width:860px; margin:0 auto; padding:40px; }
    h1 { font-size:26px; margin:0 0 4px; letter-spacing:-.5px; }
    .sub { color:var(--muted); font-size:14px; margin:0 0 28px; }
    .card { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:24px; margin-bottom:18px; }
    .row { display:flex; align-items:center; justify-content:space-between; }
    .tag { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#fff; background:linear-gradient(90deg,var(--brand),var(--brand2)); padding:4px 10px; border-radius:999px; }
    .price { font-size:30px; font-weight:800; letter-spacing:-1px; }
    .price small { font-size:14px; font-weight:500; color:var(--muted); }
    .meta { display:grid; grid-template-columns:1fr 1fr; gap:14px 40px; margin-top:20px; font-size:14px; }
    .meta .k { color:var(--muted); }
    .meta .v { font-weight:600; margin-top:2px; }
    .warn { margin-top:18px; padding:12px 14px; border-radius:10px; background:rgba(229,9,20,.08); border:1px solid rgba(229,9,20,.25); color:#ffb4b8; font-size:13px; }
    .btnrow { display:flex; gap:14px; margin-top:26px; align-items:center; }
    .btn { font-size:15px; font-weight:600; padding:13px 22px; border-radius:10px; border:none; cursor:pointer; text-decoration:none; display:inline-block; }
    .primary { background:linear-gradient(90deg,var(--brand),var(--brand2)); color:#fff; box-shadow:0 6px 20px rgba(124,58,237,.35); }
    /* Dark pattern: the cancel link is deliberately tiny, low-contrast, buried. */
    .cancel-link { color:#4a5266; font-size:12px; text-decoration:underline; text-underline-offset:3px; }
    .cancel-link:hover { color:#6b748c; }
    footer { border-top:1px solid var(--line); color:#565f73; font-size:12px; padding:24px 40px; text-align:center; }
  </style>
</head>
<body>
  <header>
    <div class="logo">▶ <b>StreamVault</b></div>
    <nav><span>Home</span><span>My List</span><span>Browse</span><span>Account</span></nav>
    <div class="avatar">DU</div>
  </header>
  <div class="wrap">
    <h1>Account & Membership</h1>
    <p class="sub">Signed in as <strong>demo.user@streamvault.app</strong> · Member since Jan 2024</p>

    <div class="card">
      <div class="row">
        <div>
          <span class="tag">Premium 4K · UHD</span>
          <div class="price" style="margin-top:10px;">₹649 <small>/ month</small></div>
        </div>
        <div style="text-align:right;">
          <div class="k" style="color:var(--muted);font-size:13px;">Next payment</div>
          <div class="v" style="font-weight:700;font-size:16px;margin-top:2px;">16 Sep 2026</div>
        </div>
      </div>
      <div class="meta">
        <div><div class="k">Plan</div><div class="v">Premium — 4 screens, 4K + HDR</div></div>
        <div><div class="k">Payment method</div><div class="v">Visa •••• 4291</div></div>
        <div><div class="k">Billing</div><div class="v">Renews automatically every month</div></div>
        <div><div class="k">Status</div><div class="v" style="color:#5ee08a;">Active</div></div>
      </div>
      <div class="warn">⚠ Your subscription <strong>renews automatically</strong> on 16 Sep 2026 and you will be charged ₹649 unless you cancel before then.</div>
    </div>

    <div class="card">
      <div class="row">
        <div>
          <div style="font-weight:700;font-size:16px;">Manage membership</div>
          <div class="sub" style="margin:6px 0 0;">Update your plan, payment details, or membership status.</div>
        </div>
        <a class="btn primary" href="/demo-target/plan">Keep my benefits</a>
      </div>
      <div style="margin-top:22px;border-top:1px solid var(--line);padding-top:16px;">
        <!-- Roach motel: cancellation buried as a tiny low-contrast link. -->
        <a class="cancel-link" href="/demo-target/confirm?from=account">Cancel subscription</a>
      </div>
    </div>
  </div>
  <footer>© 2026 StreamVault Inc. · Help Center · Terms · Privacy · We'd hate to see you go.</footer>
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
