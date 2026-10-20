// GET — whether TinyFish is on, and the public test-site URL its cloud can reach.

import { api, jsonOk } from "@/server/api/handler";
import { tinyfishEnabled } from "@/server/tinyfish/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () =>
  jsonOk({
    enabled: tinyfishEnabled(),
    // The cloud can't reach localhost, so local dev points TinyFish at the deployed test site.
    demoUrl: process.env.TINYFISH_TARGET_URL ?? null,
  })
);
