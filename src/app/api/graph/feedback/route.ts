// =============================================================================
// app/api/graph/feedback/route.ts
// POST — a human marks a finding correct or a false alarm. That is the reward
// signal the detector learns from (see rewardFinding in server/graph/neo4j.ts).
// =============================================================================

import { z } from "zod";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { parseOrThrow } from "@/server/security/validation";
import { checkRateLimit } from "@/server/security/rate-limit";
import { TAXONOMY } from "@/server/detection/taxonomy";
import { rewardFinding } from "@/server/graph/neo4j";
import type { PatternType } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const feedbackSchema = z
  .object({
    patternType: z.enum(TAXONOMY.map((t) => t.type) as [PatternType, ...PatternType[]]),
    evidence: z.string().trim().min(3).max(300),
    correct: z.boolean(),
  })
  .strict();

export const POST = api(async (req: Request) => {
  const user = await requireUser();
  checkRateLimit(user.id, "feedback");
  const body = parseOrThrow(feedbackSchema, await req.json());
  const value = await rewardFinding(body.patternType, body.evidence, body.correct ? 1 : -1);
  return jsonOk({ learned: value !== null, value });
});
