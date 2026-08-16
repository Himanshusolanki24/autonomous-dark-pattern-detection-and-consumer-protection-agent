// =============================================================================
// app/api/agent/[id]/route.ts
// GET — full session detail incl. detections.
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { api, jsonOk } from "@/lib/api/handler";
import { requireUser } from "@/lib/auth/guards";
import { getSessionOwned, listSessionDetections } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const supabase = await createClient();

  const session = await getSessionOwned(supabase, id);
  const detections = await listSessionDetections(supabase, id);

  return jsonOk({
    id: session.id,
    goal: session.goal,
    status: session.status,
    currentStage: session.current_stage,
    targetUrl: session.target_url,
    state: session.state,
    startedAt: session.started_at,
    completedAt: session.completed_at,
    errorMessage: session.error_message,
    createdAt: session.created_at,
    detections: detections.map((d) => ({
      id: d.id,
      patternType: d.pattern_type,
      severity: d.severity,
      confidence: d.confidence,
      explanation: d.explanation,
      elementText: d.element_text,
    })),
    ownedBy: user.id,
  });
});