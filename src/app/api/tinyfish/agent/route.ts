// =============================================================================
// POST — run the TinyFish Web Agent on a cancellation flow and stream its events
// (one JSON object per line) back to the page.
//   mode "explore": walk the flow and STOP before the final confirm.
//   mode "confirm": only after the user approved — finish the cancellation.
// =============================================================================

import { z } from "zod";
import { NextResponse } from "next/server";
import { api } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { checkRateLimit } from "@/server/security/rate-limit";
import { parseOrThrow } from "@/server/security/validation";
import { validateTargetUrl } from "@/server/security/ssrf";
import { AppError, ValidationError } from "@/server/security/errors";
import {
  CANCEL_GOALS,
  readAgentEvents,
  reachableFromCloud,
  runAgentStream,
  tinyfishEnabled,
} from "@/server/tinyfish/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const bodySchema = z
  .object({
    url: z.string().min(1).max(2048),
    mode: z.enum(["explore", "confirm"]),
  })
  .strict();

export const POST = api(async (req: Request) => {
  const user = await requireUser();
  const body = parseOrThrow(bodySchema, await req.json());
  if (!tinyfishEnabled()) throw new ValidationError("The TinyFish agent needs TINYFISH_API_KEY.");
  const url = await validateTargetUrl(body.url);
  if (!reachableFromCloud(url.toString())) {
    throw new ValidationError("TinyFish runs in the cloud and can't open localhost. Use the public test-site URL.");
  }
  checkRateLimit(user.id, "tinyfishAgent");

  let upstream: Response;
  try {
    upstream = await runAgentStream(url.toString(), CANCEL_GOALS[body.mode], req.signal);
  } catch (err) {
    throw new AppError(`TinyFish couldn't start the agent: ${(err as Error).message}`, 502, "TINYFISH_ERROR", true);
  }
  if (!upstream.body) throw new AppError("TinyFish returned no event stream", 502, "TINYFISH_ERROR", true);

  const source = upstream.body;
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const t0 = Date.now();
      try {
        for await (const ev of readAgentEvents(source)) {
          controller.enqueue(encoder.encode(JSON.stringify({ ...ev, ms: Date.now() - t0 }) + "\n"));
        }
      } catch (err) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "ERROR", error: (err as Error).message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });
  return new NextResponse(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
});
