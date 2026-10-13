// =============================================================================
// app/login/page.tsx
// Sign-in page. The proxy sends signed-out visitors here with ?next=<route>;
// Google returns to /auth/callback, which sets the session and redirects on.
// =============================================================================

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { createClient } from "@/server/supabase/server";

const ERRORS: Record<string, string> = {
  missing_code: "The sign-in link was incomplete. Please try again.",
  auth_failed: "We couldn’t sign you in. Please try again.",
};

// Only same-site paths, so ?next= can never send someone to another site.
function safeNext(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

async function signInWithGoogle(formData: FormData) {
  "use server";
  const next = safeNext(formData.get("next")?.toString());

  // No Supabase project configured: the in-memory dev store has a demo user.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect(next);

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  redirect(error || !data.url ? "/login?error=auth_failed" : data.url);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-marker">
            <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-display text-[18px] font-bold">TrapKiller</span>
        </Link>
        <h1 className="mt-8 text-[26px] font-bold leading-tight">Sign in</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">
          Sign in to scan pages and keep a record of your cancellations.
        </p>
        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-warning-soft px-3 py-2.5 text-[14px] text-amber-800">
            {ERRORS[error] ?? ERRORS.auth_failed}
          </p>
        )}
        <form action={signInWithGoogle} className="mt-6">
          <input type="hidden" name="next" value={safeNext(next)} />
          <button
            type="submit"
            className="w-full rounded-lg bg-foreground px-4 py-2.5 text-[15px] font-medium text-white transition-transform active:scale-[0.97]"
          >
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
