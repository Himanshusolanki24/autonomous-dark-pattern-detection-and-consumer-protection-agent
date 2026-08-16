// =============================================================================
// app/api/activity/route.ts
// GET — paginated, filterable activity feed across all of the user's sessions.
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { api, jsonOk } from "@/lib/api/handler";
import { requireUser } from "@/lib/auth/guards";
import { parseOrThrow, activityQuerySchema } from "@/lib/security/validation";
import { listActivity } from "@/lib/db/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req: Request) => {
  const user = await requireUser();
  const searchParams = new URL(req.url).searchParams;

  const query = parseOrThrow(activityQuerySchema, {
    limit: searchParams.get("limit") ?? undefined,
    cursor: searchParams.get("cursor") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    agent: searchParams.get("agent") ?? undefined,
    date: searchParams.get("date") ?? undefined,
  });

  const { items, nextCursor } = await listActivity(await createClient(), {
    userId: user.id,
    limit: query.limit,
    cursor: query.cursor,
    status: query.status,
    agent: query.agent,
    date: query.date,
  });

  return jsonOk({
    items: items.map((e) => ({
      id: e.id,
      timestamp: e.created_at,
      agent: e.agent,
      eventType: e.event_type,
      message: e.message,
      status: e.status,
      website: (e as unknown as { agent_sessions?: { target_url?: string } }).agent_sessions
        ?.target_url ?? null,
    })),
    nextCursor,
  });
});