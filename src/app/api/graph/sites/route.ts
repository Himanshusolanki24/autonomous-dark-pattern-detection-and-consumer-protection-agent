// =============================================================================
// app/api/graph/sites/route.ts
// GET — every site the agents have visited, ranked by trap score. Feeds /sites.
// =============================================================================

import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { siteRanking } from "@/server/graph/neo4j";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  await requireUser();
  return jsonOk(await siteRanking());
});
