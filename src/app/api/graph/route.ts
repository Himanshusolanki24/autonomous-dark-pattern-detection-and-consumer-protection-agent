// =============================================================================
// app/api/graph/route.ts
// GET — the knowledge graph (nodes + relationships) for the graph page.
// =============================================================================

import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { graphSnapshot } from "@/server/graph/neo4j";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  await requireUser();
  return jsonOk(await graphSnapshot());
});
