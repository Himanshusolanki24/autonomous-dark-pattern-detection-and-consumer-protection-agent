# Supabase Setup

The backend uses Supabase for Postgres (schema + RLS), Auth (Google OAuth), Storage (agent proof screenshots) and Realtime (live agent events).

## 1. Create the project

1. Go to https://supabase.com and create a project (or reuse one).
2. Note the project URL and the two keys you'll need:
   - **Project URL** — `NEXT_PUBLIC_SUPABASE_URL`
   - **Publishable / anon key** — `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - **Service role key** — `SUPABASE_SERVICE_ROLE_KEY` (Secret; server-only. Never expose to the browser.)

## 2. Apply the migrations

The schema is reproducible from SQL. Never create tables by hand.

```bash
npm run db:start     # start the local Supabase stack (if using the CLI)
npm run db:reset     # apply migrations + seed against the local stack
```

For a hosted project, run the files in `supabase/migrations/` in order through
**SQL Editor** or the Supabase CLI:

```bash
supabase link --project-ref <ref>
supabase db push
```

Files:

| File | Purpose |
| ---- | ------- |
| `001_initial_schema.sql` | Enums, tables, grants |
| `002_rls.sql` | Row Level Security on every table |
| `003_indexes.sql` | Query + rate-limit indexes |
| `004_functions_triggers.sql` | `handle_new_user`, `set_updated_at`, approval expiry, Realtime publication |
| `005_storage.sql` | Private `agent-proofs` bucket + retention |
| `seed.sql` | Demo records (optional) |

## 3. Regenerate TypeScript types after any schema change

```bash
npm run db:types     # or: scripts/generate-types.ts
```

This regenerates `types/database.ts` from the live database. Keep it in sync
with the migrations — the app code compiles against it.

## 4. Configure Auth providers

See [google-auth.md](./google-auth.md).

## 5. Realtime

Migration `004` adds `agent_events` to the `supabase_realtime` publication.
The frontend subscribes to channel `agent_events:id=eq.<sessionId>` to stream
events into the live agent feed.

## Security model

- **RLS is the authorization boundary.** Every user-owned table is RLS-protected
  with ownership predicates (`auth.uid() = user_id`). The database, not the
  frontend, decides who can read/write what.
- `agent_approvals` has **no user UPDATE policy** — approvals are transitioned
  only by the application's service-role path after validation
  (`lib/db/approvals.ts`).
- `audit_logs` is **read-only for users**; only the service role appends.
- The service-role key must live only in server-side environment variables
  (Vercel: Project Environment Variables, never `NEXT_PUBLIC_`).