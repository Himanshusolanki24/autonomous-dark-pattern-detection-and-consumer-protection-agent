// =============================================================================
// app/api/agent/[id]/stop/route.ts
// POST — terminate a running/paused session. Browser session is torn down.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { browserManager } from "@/server/browser/manager";
import { ConflictError } from "@/server/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("agent_sessions")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!session) throw new ConflictError("Session not found");
  if (session.status === "completed" || session.status === "cancelled" || session.status === "failed") {
    throw new ConflictError(`Session already ${session.status}`);
  }

  const admin = createAdminClient();
  await admin
    .from("agent_sessions")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", id);
  await admin
    .from("agent_events")
    .insert({
      session_id: id,
      user_id: user.id,
      agent: null,
      event_type: "task_cancelled",
      message: "Session stopped by user",
      status: "cancelled",
    });

  await browserManager.killSession(id);

  return jsonOk({ sessionId: id, status: "cancelled" });
});