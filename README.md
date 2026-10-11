# TrapKiller — Dark Pattern Trap Killer

An AI agent for consumer protection. It scans subscription and checkout pages for dark patterns, walks the cancellation flow for you while stepping around retention traps, **stops for your approval before the final irreversible click**, and saves a screenshot as proof.

It is a single Next.js app: the UI, the API and the agent engine run together, so there is one install and one dev server. It works with no external services (an in-memory dev store stands in for Supabase).

## Quick start

**Prerequisites:** Node.js 20.9+ (required by Next.js 16).

```bash
npm install
npx playwright install chromium   # one-time: the browser the agent drives
npm run dev                        # http://localhost:3000
```

Then try it on the built-in **StreamVault** test site (a fake streaming service with planted dark patterns, served at `/demo-target/account`):

- **Scan a page:** open the app, press "Try the StreamVault test site", and read the verdict.
- **Agent:** press "Hand it to the agent", watch it work through the page, and approve the final step.

## Project structure

```
src/
  app/
    page.tsx              landing page
    (app)/                the app: dashboard, scanner, agent, tasks, activity, security, settings, demo
    api/                  REST API (scanner, agent sessions, approvals, cancellations, activity, profile, health)
    demo-target/          StreamVault test site with planted dark patterns
    auth/callback/        Supabase OAuth callback
  components/             UI (layout shell, agent, browser preview, shared ui)
  lib/                    client-side helpers: API client, services, types, constants
  stores/                 Zustand store for the live agent session
  server/                 server-only code
    agent/                LangGraph pipeline: perceive → detect → plan → act → approval → verify
    browser/              Playwright session manager, perception, safe actions
    detection/            dark-pattern classifier and taxonomy
    llm/                  optional OpenAI-compatible LLM client (OpenAI, Mistral…)
    security/             SSRF guard, rate limiting, idempotency, errors
    supabase/  db/  auth/  queue/  api/
  types/                  shared server types (agent, API, database)
  proxy.ts                Next.js proxy: session refresh + CORS
supabase/                 migrations, seed, local config
tests/                    Vitest suites
scripts/                  smoke run, type generation, proof cleanup
docs/setup/               Supabase, Google auth, deployment guides
video/                    Remotion pitch video (separate package)
```

## Tech stack

| Layer | Tech |
| ----- | ---- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, Framer Motion, Radix UI, Zustand |
| Agent | LangGraph JS, Playwright (headless Chromium), optional OpenAI-compatible LLM |
| Data | Supabase (Postgres + RLS, Google OAuth) or the in-memory dev store |
| Tests | Vitest |

## Scripts

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Start the app on port 3000 |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Vitest suites (52 tests; see note below) |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run smoke` | Scripted run against the test site (needs the dev server running) |
| `npm run db:start` / `db:reset` / `db:types` | Local Supabase helpers |
| `npm run graph:seed` | One-off: create Neo4j constraints and load the pattern taxonomy + indicator phrases |

Known issue: 4 tests currently fail. The two SSRF tests expect private addresses to be blocked, but dev mode allows them. The two graph-routing tests expect `completed` to route to COMPLETE, but the code routes it to VERIFY.

## Environment variables

Copy `.env.example` to `.env.local`. Everything is optional in dev mode.

| Variable | Notes |
| -------- | ----- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Real Supabase auth and persistence |
| `SUPABASE_DEV_MODE` | Defaults to on (in-memory store and a demo user). Set `"false"` in production: this also turns on SSRF blocking of private and loopback addresses. |
| `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` | Optional LLM fallback for planning and classification, e.g. `https://api.mistral.ai/v1` with `mistral-large-latest` |
| `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` | Optional Neo4j knowledge graph and agent memory. Detection reads prior findings, co-occurring patterns and example phrases; planning reuses clicks from verified runs; action and verification write back. LLM findings are kept only if their evidence quote appears verbatim on the page. Run `npm run graph:seed` once. The graph also holds what the agent learns from rewards: clicks are rewarded when a run is verified, and findings are rewarded by the "Is this really a dark pattern?" buttons in the scanner. |
| `PROOFS_DIR` | Where proof screenshots are written (default `.proofs/`) |
| `NEXT_PUBLIC_API_URL` | Only if the API is hosted on a different origin from the UI (default: same origin) |

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/scanner/analyze` | Read-only dark-pattern scan of a URL |
| GET | `/api/scanner/screenshot?url=` | Server-rendered screenshot of a page |
| GET | `/api/graph` | Knowledge-graph snapshot (nodes and relationships) for the `/graph` page |
| POST | `/api/graph/feedback` | Mark a finding correct or a false alarm (the detector's reward signal) |
| GET | `/api/graph/learning` | What the agent has learned and which findings still need a verdict, for the `/learning` page |
| POST | `/api/agent/start` | Start an agent run (202, runs in the background) |
| GET | `/api/agent/[id]` · `/api/agent/[id]/events` · `/api/agent/[id]/proof` | Session, event log, proof screenshot |
| POST | `/api/agent/[id]/approve` · `/reject` · `/stop` | Human decisions |
| GET/POST | `/api/cancellations` · `/api/cancellations/[id]` · `/[id]/stop` | Cancellation tasks |
| GET | `/api/activity` | Paginated activity feed |
| GET/PATCH | `/api/profile` · GET `/api/auth/me` · POST `/api/auth/signout` | Account |
| GET | `/api/health` | Health check |

## Safety model

- **Human in the loop:** the final irreversible action is parked until you approve it; reject and the run stops.
- **Safe actions only:** the agent can click, type, scroll and wait. Page text is treated as data, never as instructions.
- **Stop anytime:** each pipeline step checks whether the session was stopped before it runs.
- **SSRF guard, rate limits, idempotency keys:** in `src/server/security/`. SSRF blocking of private addresses applies when `SUPABASE_DEV_MODE=false`.

## Deployment

The agent keeps a real browser open across steps and waits for your approval, so it needs a long-running Node server (a VM or container). Serverless functions are not a good fit as built. See `docs/setup/deployment.md`.
