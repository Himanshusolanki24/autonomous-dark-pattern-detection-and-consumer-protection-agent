// =============================================================================
// app/api/agent/[id]/events/route.ts
// GET — ordered event stream for one session (polls; realtime preferred).
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { listSessionEvents } from "@/server/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  const events = await listSessionEvents(await createClient(), id);

  return jsonOk({
    events: events.map((e) => ({
      id: e.id,
      sessionId: e.session_id,
      agent: e.agent,
      eventType: e.event_type,
      message: e.message,
      status: e.status,
      createdAt: e.created_at,
    })),
  });
});