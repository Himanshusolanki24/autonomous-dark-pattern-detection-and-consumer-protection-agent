// =============================================================================
// app/api/agent/[id]/approve/route.ts
// POST — approve the pending final action and resume the agent.
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { api, jsonOk } from "@/lib/api/handler";
import { requireUser } from "@/lib/auth/guards";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { transitionApproval } from "@/lib/db/approvals";
import { enqueueResume } from "@/lib/agent/runner";
import { emitEvent } from "@/lib/agent/events";

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
  const { sessionId: resumedId } = await transitionApproval(
    admin,
    approval.id,
    user.id,
    "approved"
  );

  await emitEvent(admin, resumedId, {
    userId: user.id,
    eventType: "approval_granted",
    message: "Approved — final action is authorized",
    status: "running",
  });

  enqueueResume({ sessionId: resumedId, userId: user.id, decision: "approved" });

  return jsonOk({ sessionId: resumedId, approval: "approved" });
});