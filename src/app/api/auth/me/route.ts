// =============================================================================
// app/api/auth/me/route.ts
// GET — current user. The canonical identity check for the frontend.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { api, jsonOk } from "@/server/api/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return jsonOk({ authenticated: false });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return jsonOk({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email ?? null,
      name: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
    },
  });
});