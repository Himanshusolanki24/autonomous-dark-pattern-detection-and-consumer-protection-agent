// =============================================================================
// app/api/graph/learning/route.ts
// GET — what the agent has learned from rewards, and what still needs a
// human's verdict. Feeds the /learning page.
// =============================================================================

import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { learningSnapshot } from "@/server/graph/neo4j";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  await requireUser();
  return jsonOk(await learningSnapshot());
});
