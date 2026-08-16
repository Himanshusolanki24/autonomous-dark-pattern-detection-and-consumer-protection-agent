# Dark Pattern Trap Killer

An agentic AI consumer-protection platform that detects dark patterns on subscription and checkout pages, and runs a guided multi-agent cancellation flow — navigating retention traps, pausing for human approval before irreversible actions, and verifying the result with evidence.

Built for a hackathon. Runs end-to-end locally with **no external services required** (a dev-mode in-memory store replaces Supabase until you configure it).

## Features

- **Multi-agent pipeline** (LangGraph): `perception → detection → planning → action → verification`
- **Dark-pattern classifier** — confirmshaming, roach motel, forced continuity, drip pricing, basket sneaking, misdirection, hard-to-cancel
- **Guided cancellation agent** — clicks through the real page with Playwright, detects retention traps, and pauses for **human approval** before the final irreversible action
- **Read-only scanner** — analyze any URL for dark patterns without taking any action
- **Proof of cancellation** — evidence chain (page state, screenshots) written to `backend/.proofs/`
- **Activity feed, tasks, dashboard** — real data from the backend API
- **Security** — SSRF protection, rate limiting, idempotency keys, audit log, RLS-isolated Supabase schema

## Repository layout

```
backend/   Next.js API + LangGraph agent engine + Playwright browser layer + Supabase schema
frontend/  Next.js UI (dashboard, agent, scanner, tasks, activity, settings, security, demo)
video/     Remotion demo video (hackathon pitch)
```

## Tech stack

| Layer    | Tech |
| -------- | ---- |
| API      | Next.js 16 (App Router), TypeScript, Zod |
| Agents   | LangGraph (`@langchain/langgraph`), Playwright |
| Database | Supabase (Postgres, RLS, Realtime) — or dev-mode in-memory store |
| UI       | Next.js 16, React 19, Tailwind CSS v4, Zustand, Framer Motion, Radix UI |
| Tests    | Vitest + Playwright smoke script |

## Quick start (dev mode — no Supabase required)

> In dev mode the backend uses an in-memory store and a fixed demo user, so the whole flow works out of the box. Set `SUPABASE_DEV_MODE=false` to require real Supabase credentials.

**Prerequisites:** Node.js 20+, Playwright browsers (`npx playwright install chromium`).

```bash
# 1. Backend — starts on http://localhost:3001
cd backend
npm install
npx playwright install chromium
npm run dev

# 2. Frontend — starts on http://localhost:3000
cd frontend
npm install
npm run dev
```

Open http://localhost:3000.

### Try the live flow

The backend hosts a self-hosted demo target (a mock "AcmeCloud" subscription site):

- **Scanner** — scan `http://localhost:3001/demo-target/account` from the `/scanner` page and see real detections.
- **Agent** — hit **Start Agent** on the `/agent` page. Watch the pipeline perceive, detect, plan, act and verify against the demo target in real time.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL` | only for real Supabase | `SUPABASE_DEV_MODE=false` to enforce |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | only for real Supabase | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | only for real Supabase | service-role key |
| `SUPABASE_DEV_MODE` | optional | `"false"` to disable the in-memory store; default enabled |
| `PROOFS_DIR` | optional | proof output dir (default `backend/.proofs/`) |
| `LLM_*` / provider keys | optional | only needed for non-deterministic planning/LLM nodes |

### Frontend (`frontend/.env.local`)

| Variable | Required | Notes |
| -------- | -------- | ----- |
| `NEXT_PUBLIC_API_URL` | optional | backend base URL, default `http://localhost:3001` |

## API endpoints

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/scanner/analyze` | Read-only dark-pattern scan of a URL |
| POST | `/api/agent/start` | Start a guided cancellation agent run (202, fire-and-forget) |
| GET | `/api/agent/[id]` | Session detail + detections |
| GET | `/api/agent/[id]/events` | Ordered event stream for a session |
| POST | `/api/agent/[id]/approve` | Approve the pending final action and resume |
| POST | `/api/agent/[id]/reject` | Reject the pending final action |
| POST | `/api/agent/[id]/stop` | Stop the session |
| GET / POST | `/api/cancellations` | List / start cancellation tasks |
| GET | `/api/cancellations/[id]` | Task detail |
| POST | `/api/cancellations/[id]/stop` | Stop a task |
| GET | `/api/activity?limit=&cursor=&status=&agent=&date=` | Paginated, filterable activity feed |
| GET / PATCH | `/api/profile` | User profile |
| GET | `/api/auth/me` | Current session |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/health` | Health check |

All API routes require authentication; in dev mode the in-memory store auto-authenticates a demo user.

## Testing

```bash
cd backend
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest (51 tests / 6 suites)
npm run smoke       # end-to-end agent run against the self-hosted demo target
```

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

## Supabase setup (production)

For real auth + persistence, configure a Supabase project:

1. `cd backend && cp .env.example .env` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Apply migrations: `supabase link --project-ref <ref> && supabase db push` (or `npm run db:reset` for local).
3. Enable Google OAuth in Supabase Auth → Providers, and configure the auth callback at `http://localhost:3001/auth/callback`.
4. Set `SUPABASE_DEV_MODE=false`.

See `backend/docs/setup/` for `supabase.md`, `google-auth.md` and `deployment.md`.

## Security model

- **SSRF protection** — only `http(s)`, blocks private/loopback/reserved IPs and DNS-rebinding attempts
- **Rate limiting** — per-user limits on scanner, agent-start and approval actions
- **Idempotency keys** — duplicate agent-start requests return the cached response
- **Audit log** — every agent event is persisted for the activity feed and evidence chain
- **Human-in-the-loop** — the final irreversible action requires an explicit approval; approvals are server-validated and transitioned with the service-role client only

## License

Proprietary — hackathon project.