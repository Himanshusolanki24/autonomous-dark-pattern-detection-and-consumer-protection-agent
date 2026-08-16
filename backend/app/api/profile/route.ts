// =============================================================================
// app/api/profile/route.ts
// GET — profile. PATCH — update profile (name / avatar).
// =============================================================================

import { createClient } from "@/lib/supabase/server";
import { api, jsonOk } from "@/lib/api/handler";
import { requireUser } from "@/lib/auth/guards";
import { parseOrThrow, profilePatchSchema } from "@/lib/security/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return jsonOk({
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    name: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    createdAt: profile?.created_at ?? null,
  });
});

export const PATCH = api(async (req: Request) => {
  const user = await requireUser();
  const supabase = await createClient();
  const body = parseOrThrow(profilePatchSchema, await req.json());

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: body.full_name,
      avatar_url: body.avatar_url,
    })
    .eq("id", user.id);

  if (error) throw error;

  const { data: updated } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return jsonOk({
    id: user.id,
    email: updated?.email ?? null,
    name: updated?.full_name ?? null,
    avatarUrl: updated?.avatar_url ?? null,
    createdAt: updated?.created_at ?? null,
  });
});