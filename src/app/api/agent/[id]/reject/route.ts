// =============================================================================
// app/api/agent/[id]/reject/route.ts
// POST — reject the pending final action. The run is stopped (not retried).
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { createAdminClient } from "@/server/supabase/admin";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { checkRateLimit } from "@/server/security/rate-limit";
import { transitionApproval } from "@/server/db/approvals";
import { enqueueResume } from "@/server/agent/runner";
import { emitEvent } from "@/server/agent/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req: Request, ctx) => {
  const user = await requireUser();
  const { id: sessionId } = await ctx.params;

  checkRateLimit(user.id, "approval");

  const supabase = await createClient();
  const { data: approval } = await supabase
    .from("agent_approvals")
    .select("id, status")
    .eq("session_id", sessionId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!approval) throw new Error("No pending approval for this session");

  const admin = createAdminClient();
  const { sessionId: rejectedId } = await transitionApproval(
    admin,
    approval.id,
    user.id,
    "rejected"
  );

  await emitEvent(admin, rejectedId, {
    userId: user.id,
    eventType: "approval_rejected",
    message: "Rejected — the final action was not authorized",
    status: "cancelled",
  });

  enqueueResume({ sessionId: rejectedId, userId: user.id, decision: "rejected" });

  return jsonOk({ sessionId: rejectedId, approval: "rejected" });
});