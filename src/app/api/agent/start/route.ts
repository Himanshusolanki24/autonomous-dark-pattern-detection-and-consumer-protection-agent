// =============================================================================
// app/api/agent/start/route.ts
// POST — start a guided cancellation agent run.
// Enforces auth, rate limit, idempotency and SSRF validation before enqueueing.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { parseOrThrow, startAgentSchema, validIdempotencyKey } from "@/server/security/validation";
import { checkRateLimit } from "@/server/security/rate-limit";
import { reserveKey, getCachedResponse, storeResponse } from "@/server/security/idempotency";
import { validateStartTarget, enqueueStart } from "@/server/agent/runner";
import { emitEvent } from "@/server/agent/events";
import { ConflictError } from "@/server/security/errors";
import type { Json } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req: Request) => {
  const user = await requireUser();

  checkRateLimit(user.id, "agentStart");

  const idempotencyKey = req.headers.get("Idempotency-Key");
  if (validIdempotencyKey(idempotencyKey)) {
    const cached = await getCachedResponse(user.id, idempotencyKey);
    if (cached) return jsonOk(cached);
    const reserved = await reserveKey(user.id, idempotencyKey);
    if (!reserved) throw new ConflictError("Duplicate request for this idempotency key");
  }

  const body = parseOrThrow(startAgentSchema, await req.json());
  await validateStartTarget(body.targetUrl);

  const supabase = await createClient();
  const serviceName = new URL(body.targetUrl).hostname;

  // Create the task (cancellation_tasks) then the agent session (agent_sessions).
  const { data: task, error: taskErr } = await supabase
    .from("cancellation_tasks")
    .insert({
      user_id: user.id,
      service_name: serviceName,
      target_url: body.targetUrl,
      status: "running",
    })
    .select("id")
    .single();
  if (taskErr) throw taskErr;

  const { data: session, error: sessionErr } = await supabase
    .from("agent_sessions")
    .insert({
      user_id: user.id,
      goal: body.goal,
      status: "running",
      current_stage: "perception",
      target_url: body.targetUrl,
      started_at: new Date().toISOString(),
      state: {
        goal: body.goal,
        targetUrl: body.targetUrl,
        status: "running",
        actionCount: 0,
      },
    })
    .select("id")
    .single();
  if (sessionErr) throw sessionErr;

  await emitEvent(supabase, session.id, {
    userId: user.id,
    agent: "perception",
    eventType: "session_started",
    message: `Agent session started for ${serviceName}`,
    status: "running",
  });

  enqueueStart({
    sessionId: session.id,
    taskId: task.id,
    userId: user.id,
    goal: body.goal,
    targetUrl: body.targetUrl,
  });

  const response = { sessionId: session.id, taskId: task.id, status: "running" };
  if (validIdempotencyKey(idempotencyKey)) {
    await storeResponse(user.id, idempotencyKey, response as unknown as Json);
  }

  return jsonOk(response, { status: 202 });
});