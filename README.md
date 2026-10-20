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
  components/             UI (layout shell, agent, browser preview, shared ui)
  lib/                    client-side helpers: API client, services, types, constants
  stores/                 Zustand store for the live agent session
  server/                 server-only code
    agent/                LangGraph pipeline: perceive → detect → plan → act → approval → verify
    browser/              Playwright session manager, perception, safe actions
    detection/            dark-pattern classifier (phrase rules + neural network) and taxonomy
    llm/                  optional OpenAI-compatible LLM client (OpenAI, Mistral…)
    security/             SSRF guard, rate limiting, idempotency, errors
    supabase/  db/  auth/  queue/  api/
  types/                  shared server types (agent, API, database)
  proxy.ts                Next.js proxy: CORS
supabase/                 migrations, seed, local config
tests/                    Vitest suites
scripts/                  smoke run, type generation, proof cleanup
docs/setup/               Supabase and deployment guides
video/                    Remotion pitch video (separate package)
```

## Tech stack

| Layer | Tech |
| ----- | ---- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4, Framer Motion, Radix UI, Zustand |
| Agent | LangGraph JS, Playwright (headless Chromium), optional OpenAI-compatible LLM |
| Neural detector | MiniLM sentence-embedding transformer run in-process (transformers.js / ONNX) with a classification head trained on the ec-darkpattern dataset |
| Data | In-memory store with a single demo user (no sign-in) |
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
| `npm run neural:train` | Retrain the neural detector's classification head (downloads the dataset, prints held-out accuracy, writes `src/server/detection/neural-head.json`) |
| `npm run graph:seed` | One-off: create Neo4j constraints and load the pattern taxonomy + indicator phrases |
| `npm run tinyfish:smoke` | Live check of all four TinyFish APIs (Search, Fetch, Browser, Web Agent) against the public test site; uses real TinyFish credits |

## Neural detector

Every sentence on a scanned page goes through a deep neural network: a 6-layer MiniLM transformer turns it into an embedding, and a softmax layer trained on 2,313 labelled texts from the [ec-darkpattern](https://github.com/yamanalab/ec-darkpattern) dataset decides whether it is false urgency, misdirection, social proof or harmless. On the 463 texts held out from training it gets 94.0% right. Findings above 85% certainty are added to what the phrase rules found; the evidence is always the sentence from the page.

The model (about 23 MB) is downloaded from Hugging Face the first time a page is scanned and cached. If it cannot be loaded, scans carry on with the phrase rules alone.

## TinyFish integration

### Why we use TinyFish

Dark patterns live on real, live websites, and that is where a local headless browser falls short:

- **Real sites fight bots.** Many subscription pages block or degrade a plain headless Chromium. TinyFish's cloud browsers are built to load real sites the way a person would see them.
- **It doesn't scale from a laptop.** Each agent run keeps a browser open for minutes while it waits for your approval. Running that in the cloud means the server (including a serverless deploy on Vercel) doesn't have to host Chromium itself.
- **One page view isn't enough evidence.** The scanner wants the page's full text, not only what fits in the first screen. TinyFish Fetch returns the whole page as clean markdown.
- **Users don't always know the URL.** People type "StreamVault", not `https://…/account`. TinyFish Search turns a service name into candidate pages.
- **Some cancel flows are too messy for fixed rules.** Our own planner follows phrase rules tuned to known flows. The TinyFish Web Agent can walk an unfamiliar flow from a plain-English goal, while we keep the human-approval step.

TinyFish is an add-on, not a requirement. Without `TINYFISH_API_KEY` everything runs on local Chromium as before, and if a TinyFish call fails the app falls back to the local browser.

### How we use it

All four TinyFish APIs are used, each in a specific place:

| API | Endpoint | Where it plugs in | What it does |
| --- | -------- | ----------------- | ------------ |
| **Browser** | `POST https://api.browser.tinyfish.ai` → `cdp_url` | `src/server/browser/manager.ts` (`browserFor`) | Opens a TinyFish cloud browser and drives it with Playwright over CDP. Used for both scans and agent runs. One shared cloud browser, one isolated context per session |
| **Fetch** | `POST https://api.fetch.tinyfish.ai` (`format: "markdown"`) | `src/app/api/scanner/analyze/route.ts` | Fetches the page's full text and adds it to what the detector reads, alongside the Playwright view, before `classifyPage` runs |
| **Search** | `GET https://api.search.tinyfish.ai` | `src/app/api/tinyfish/search/route.ts` | On the scanner, typing a name with no "." (e.g. `StreamVault`) shows 5 results. You pick one; it never auto-picks |
| **Web Agent** | `POST https://agent.tinyfish.ai/v1/automation/run-sse` | `src/app/api/tinyfish/agent/route.ts`, `src/components/tinyfish/TinyFishAgentPanel.tsx` | "Run with the TinyFish agent" on the Agent page, with a live view of the run (see below) |

**The Web Agent keeps the human in the loop.** It runs in two steps:

1. **Explore run:** the goal tells it to walk the cancel flow, decline every retention offer, and **stop on the final confirmation screen without clicking it**. It reports each screen and every trick it saw.
2. You review the report and press **Approve** or **Reject**. Approve starts a second short **confirm run** that clicks the final button and reports the confirmation message. Reject does nothing.

The goals are in `CANCEL_GOALS` in `src/server/tinyfish/client.ts`. The run streams back as server-sent events; the live `streaming_url` is shown in an iframe, with an "open in new tab" link as a fallback.

**When the cloud is used.** TinyFish runs in the cloud, so it can't reach `localhost` or private addresses. `reachableFromCloud()` keeps those targets on local Chromium. To try TinyFish against the test site in local dev, set `TINYFISH_TARGET_URL` to the public deploy (`https://autonomous-dark-pattern-detection-a.vercel.app/demo-target/account`).

**You can see every call.** The TinyFish activity panel (`src/components/tinyfish/TinyFishActivity.tsx`) lists each call made for a scan or run: API, status, time in ms, and run/session id. Scans and agent case logs also say which browser was used (`tinyfish` or `local`).

**Code map**

- `src/server/tinyfish/client.ts`: the four API clients (all send the `X-API-Key` header), the call recorder, the SSE parser, `reachableFromCloud()` and `CANCEL_GOALS`
- `src/app/api/tinyfish/status/route.ts`: tells the UI whether TinyFish is on
- `src/lib/services/tinyfishService.ts`: client-side calls
- Rate limits (`src/server/security/rate-limit.ts`): Search 60/hour, Web Agent 10/hour

**Check it live:** `npm run tinyfish:smoke` makes one real call to each API against the public test site (uses TinyFish credits).

## Environment variables

Copy `.env.example` to `.env.local`. Everything is optional in dev mode.

| Variable | Notes |
| -------- | ----- |
| `SUPABASE_DEV_MODE` | Set `"false"` to turn on SSRF blocking of private and loopback addresses. Always on when deployed to Vercel. |
| `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL` | Optional LLM fallback for planning and classification, e.g. `https://api.mistral.ai/v1` with `mistral-large-latest` |
| `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE` | Optional Neo4j knowledge graph and agent memory. Detection reads prior findings, co-occurring patterns and example phrases; planning reuses clicks from verified runs; action and verification write back. LLM findings are kept only if their evidence quote appears verbatim on the page. Run `npm run graph:seed` once. It also keeps a path map of each cancellation flow (pages linked by the clicks between them), which the planner uses to follow the shortest known route and to ask for approval before the click that lands on the cancelled page. The graph also holds what the agent learns from rewards: clicks are rewarded when a run is verified, and findings are rewarded by the "Is this really a dark pattern?" buttons in the scanner. |
| `TINYFISH_API_KEY` | Turns on TinyFish: public pages open in a TinyFish cloud browser (local Chromium is the fallback), the scanner adds TinyFish Fetch text, a typed name runs TinyFish Search, and the Agent page gets "Run with the TinyFish agent" |
| `TINYFISH_TARGET_URL` | Public URL of the test site for TinyFish, which can't reach localhost |
| `PROOFS_DIR` | Where proof screenshots are written (default `.proofs/`) |
| `NEXT_PUBLIC_API_URL` | Only if the API is hosted on a different origin from the UI (default: same origin) |

## API

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/scanner/analyze` | Read-only dark-pattern scan of a URL |
| GET | `/api/scanner/screenshot?url=` | Server-rendered screenshot of a page |
| GET | `/api/graph` | Knowledge-graph snapshot (nodes and relationships) for the `/graph` page |
| POST | `/api/graph/feedback` | Mark a finding correct or a false alarm (the detector's reward signal) |
| GET | `/api/graph/sites` | Sites ranked by trap score, with the shortest known cancel route, for the `/sites` page |
| GET | `/api/graph/learning` | What the agent has learned and which findings still need a verdict, for the `/learning` page |
| POST | `/api/agent/start` | Start an agent run (202, runs in the background) |
| GET | `/api/agent/[id]` · `/api/agent/[id]/events` · `/api/agent/[id]/proof` | Session, event log, proof screenshot |
| POST | `/api/agent/[id]/approve` · `/reject` · `/stop` | Human decisions |
| GET/POST | `/api/cancellations` · `/api/cancellations/[id]` · `/[id]/stop` | Cancellation tasks |
| GET | `/api/activity` | Paginated activity feed |
| GET/PATCH | `/api/profile` | Profile |
| GET | `/api/health` | Health check |

## Safety model

- **Human in the loop:** the final irreversible action is parked until you approve it; reject and the run stops.
- **Safe actions only:** the agent can click, type, scroll and wait. Page text is treated as data, never as instructions.
- **Stop anytime:** each pipeline step checks whether the session was stopped before it runs.
- **SSRF guard, rate limits, idempotency keys:** in `src/server/security/`. SSRF blocking of private addresses applies when `SUPABASE_DEV_MODE=false` or on Vercel.

## Deployment

The agent keeps a real browser open across steps and waits for your approval, so it needs a long-running Node server (a VM or container). Serverless functions are not a good fit as built. See `docs/setup/deployment.md`.
