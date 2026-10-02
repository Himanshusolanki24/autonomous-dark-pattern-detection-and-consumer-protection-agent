// =============================================================================
// app/api/cancellations/[id]/stop/route.ts
// POST — cancel a task and stop its agent session if it is still running.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { browserManager } from "@/server/browser/manager";
import { ConflictError, NotFoundError } from "@/server/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("cancellation_tasks")
    .select("id, status, agent_session_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !task) throw new NotFoundError("Task not found");
  if (task.status === "completed" || task.status === "cancelled" || task.status === "failed") {
    throw new ConflictError(`Task already ${task.status}`);
  }

  const admin = createAdminClient();
  await admin
    .from("cancellation_tasks")
    .update({ status: "cancelled", completed_at: new Date().toISOString() })
    .eq("id", id);

  if (task.agent_session_id) {
    await admin
      .from("agent_sessions")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", task.agent_session_id);
    await admin
      .from("agent_events")
      .insert({
        session_id: task.agent_session_id,
        user_id: user.id,
        agent: null,
        event_type: "task_cancelled",
        message: "Cancellation task stopped by user",
        status: "cancelled",
      });
    await browserManager.killSession(task.agent_session_id);
  }

  return jsonOk({ taskId: id, status: "cancelled" });
});