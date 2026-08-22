// =============================================================================
// app/api/scanner/screenshot/route.ts
// GET ?url= — renders a URL server-side (Playwright) and returns a PNG. Used by
// the live page preview so sites that block iframe embedding still show.
// =============================================================================

import { NextResponse } from "next/server";
import { api } from "@/lib/api/handler";
import { requireUser } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { validateTargetUrl } from "@/lib/security/ssrf";
import { browserManager } from "@/lib/browser/manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req: Request) => {
  const user = await requireUser();
  checkRateLimit(user.id, "scanner");

  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) throw new Error("Missing url");
  const url = await validateTargetUrl(raw);

  const png = await browserManager.screenshot(url.toString());

  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=30",
    },
  });
});
