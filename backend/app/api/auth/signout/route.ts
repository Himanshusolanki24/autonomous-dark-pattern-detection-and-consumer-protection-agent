// =============================================================================
// app/api/auth/signout/route.ts
// POST — sign the user out (cookie-session revocation + local session clear).
// =============================================================================

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { api } from "@/lib/api/handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
});