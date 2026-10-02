// =============================================================================
// app/api/agent/[id]/proof/route.ts
// GET — the cancellation proof screenshot captured by the verification stage.
// Files are written to PROOFS_DIR as proof_<sessionId>_<ts>.png; we serve the
// most recent one for the session. 404 until verification has run.
// =============================================================================

import { NextResponse } from "next/server";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { api } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { getSessionOwned } from "@/server/db/queries";
import { createClient } from "@/server/supabase/server";
import { NotFoundError } from "@/server/security/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROOFS_DIR = process.env.PROOFS_DIR ?? `${process.cwd()}/.proofs`;

export const GET = api(async (_req, ctx) => {
  await requireUser();
  const { id } = await ctx.params;
  // Ownership check — throws if the session isn't the caller's.
  await getSessionOwned(await createClient(), id);

  const prefix = `proof_${id}_`;
  let latest: string | null = null;
  try {
    // .proofs is runtime output, not source: tell Turbopack not to trace it into the build.
    const files = (await readdir(/*turbopackIgnore: true*/ PROOFS_DIR))
      .filter((f) => f.startsWith(prefix) && f.endsWith(".png"))
      .sort();
    latest = files.at(-1) ?? null;
  } catch {
    latest = null;
  }
  if (!latest) throw new NotFoundError("No proof screenshot yet");

  const png = await readFile(/*turbopackIgnore: true*/ join(/*turbopackIgnore: true*/ PROOFS_DIR, latest));
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: { "Content-Type": "image/png", "Cache-Control": "private, max-age=60" },
  });
});
