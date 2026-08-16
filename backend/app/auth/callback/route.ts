// =============================================================================
// app/auth/callback/route.ts
// OAuth + email confirmation callback. Exchanges the code for a session,
// upserts the user's profile, then redirects to the dashboard.
// =============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  // Upsert profile (handle_new_user trigger covers inserts; update for repeats).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
      },
      { onConflict: "id" }
    );
  }

  return NextResponse.redirect(`${origin}${next.startsWith("/") ? next : "/dashboard"}`);
}