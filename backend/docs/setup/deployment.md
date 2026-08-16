# Deployment

The backend is a Next.js (App Router) server that runs the agent worker in-process
and talks to Supabase for auth/data/storage.

## Environments

| Env | URL base | Notes |
| --- | -------- | ----- |
| Local | `http://localhost:3001` | `npm run dev` |
| Production | your Vercel project | `npm run build && npm start` |

`NEXT_PUBLIC_APP_URL` must be set so internal fetches (e.g. the status page
health check) resolve correctly.

## Environment variables

See `.env.example`. Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; do not prefix with `NEXT_PUBLIC_`)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`

Optional:

- `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` — optional LLM refinement of
  detection/planning. The agent runs fully deterministically without these.
- `REDIS_URL` — reserved for BullMQ-backed queueing when scaling horizontally
  (not used by the in-process MVP queue).
- `AGENT_MAX_ACTIONS` — action budget (default 25).
- `PROOFS_DIR` — where proof screenshots are written (default `.proofs`).

## Running the worker

The Playwright chromium browser is bundled as a server-side dependency
(`serverExternalPackages: ["playwright"]`). Before first run on a fresh host:

```bash
npx playwright install chromium
```

## Queueing model (MVP)

`lib/queue/runner.ts` is an in-process queue with a concurrency limit of 2.
Suitable for a single-instance deployment. For horizontal scaling:

1. Replace `enqueueStart` / `enqueueResume` in `lib/agent/runner.ts` with a
   BullMQ producer (`REDIS_URL`).
2. Run a separate worker process that consumes jobs and calls
   `runToCompletion`.

The agent graph state persists to `agent_sessions.state` (jsonb), so a run is
always resumable from any instance.

## Production checklist

- [ ] Migrations applied (`supabase/migrations/`) and `types/database.ts` in sync
- [ ] Google OAuth configured + redirect URIs correct
- [ ] Service-role key stored server-side only
- [ ] `npx playwright install chromium` run on the deploy target
- [ ] Rate-limit buckets are in-memory (per instance) — fine for MVP
- [ ] Proof retention job scheduled (`scripts/cleanup-proofs.ts` or Supabase cron)
- [ ] `npm run lint && npm run typecheck && npm run test && npm run build` green