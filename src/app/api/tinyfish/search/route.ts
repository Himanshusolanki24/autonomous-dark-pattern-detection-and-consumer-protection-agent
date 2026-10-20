// GET ?q= — TinyFish Search: the top 5 pages for a service name, for the user to pick from.

import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { checkRateLimit } from "@/server/security/rate-limit";
import { AppError, ValidationError } from "@/server/security/errors";
import { search, tinyfishEnabled, type TinyFishCall } from "@/server/tinyfish/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req: Request) => {
  const user = await requireUser();
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 200) throw new ValidationError("Type a service name to search for.");
  if (!tinyfishEnabled()) throw new ValidationError("Search needs TINYFISH_API_KEY. Paste a page address instead.");
  checkRateLimit(user.id, "tinyfishSearch");

  const tinyfish: TinyFishCall[] = [];
  let hits;
  try {
    hits = await search(`${q} cancel subscription account`, tinyfish);
  } catch (err) {
    throw new AppError(`TinyFish search failed: ${(err as Error).message}`, 502, "TINYFISH_ERROR", true);
  }
  return jsonOk({ query: q, results: hits.slice(0, 5), tinyfish });
});
