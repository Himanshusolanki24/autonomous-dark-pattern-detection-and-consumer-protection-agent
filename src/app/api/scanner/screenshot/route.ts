// =============================================================================
// app/api/scanner/screenshot/route.ts
// GET ?url= — renders a URL server-side (Playwright) and returns a JPEG. Used by
// the live page preview so sites that block iframe embedding still show.
// =============================================================================

import { NextResponse } from "next/server";
import { api } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { checkRateLimit } from "@/server/security/rate-limit";
import { validateTargetUrl } from "@/server/security/ssrf";
import { browserManager } from "@/server/browser/manager";
import { BrowserAutomationError } from "@/server/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req: Request) => {
  const user = await requireUser();
  checkRateLimit(user.id, "scanner");

  const raw = new URL(req.url).searchParams.get("url");
  if (!raw) throw new Error("Missing url");
  const url = await validateTargetUrl(raw);

  let shot: Buffer;
  try {
    shot = await browserManager.screenshot(url.toString());
  } catch (err) {
    if (err instanceof BrowserAutomationError) throw err;
    // First line only: the rest is Playwright's call log.
    const reason = (err as Error).message.split("\n")[0];
    console.error("[screenshot] render failed:", (err as Error).message);
    throw new BrowserAutomationError(`Could not render ${url.hostname}: ${reason}`);
  }

  return new NextResponse(new Uint8Array(shot), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=60",
    },
  });
});
