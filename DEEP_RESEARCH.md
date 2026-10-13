# TrapKiller — Deep Research & Codebase Analysis

> **Autonomous Dark-Pattern Detection & Consumer-Protection Agent**
> A single Next.js application: UI + REST API + autonomous agent engine in one install.
> 125 TypeScript/TSX files · ~14,500 LOC · 9 Vitest suites · 20 git commits

---

## 1. Executive Summary

**TrapKiller** is an AI agent for consumer protection. It does two things:

1. **Read-only scanning** — loads a subscription/checkout page in a real headless browser, perceives the DOM, and classifies it against a dark-pattern taxonomy. It never clicks anything.
2. **Guided cancellation** — walks the cancellation flow for you, deliberately stepping *around* retention traps ("Keep my benefits", "pause instead"), and **stops for human approval before the one irreversible click** — then captures a screenshot as proof.

The defining architectural bet is that **detection and planning are deterministic state machines first, and LLMs / knowledge-graph memory are optional enhancers that can never break the core flow.** Every LLM finding is re-verified against the live page (anti-hallucination gate); every knowledge-graph hint is treated as a hint, never as proof.

| Layer | Technology |
|---|---|
| App | Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript 5 |
| UI | Tailwind CSS v4, Framer Motion, Radix UI, Zustand |
| Agent | `@langchain/langgraph` (LangGraph JS), Playwright (headless Chromium) |
| Memory | Optional Neo4j knowledge graph (reinforcement learning) |
| Data | Supabase (Postgres + RLS, Google OAuth) **or** an in-memory dev store |
| LLM | Optional OpenAI-compatible chat completions (OpenAI / Mistral) |
| Tests | Vitest |

The app is intentionally **runnable with zero external services** — `SUPABASE_DEV_MODE` (default on) substitutes an in-memory `dev-store` for Supabase, and the LLM and Neo4j are no-ops when their env vars are unset.

---

## 2. Problem Domain: Dark Patterns

A **dark pattern** is a UI/UX decision deliberately designed to trick users into doing something they didn't intend — most commonly, making subscription cancellation hard. TrapKiller implements a 13-category **taxonomy** (`src/server/detection/taxonomy.ts`):

| Pattern | Default severity | Base confidence | Description |
|---|---|---|---|
| `confirmshaming` | high | 0.72 | Guilt/shame language to pressure keeping a subscription |
| `roach_motel` | high | 0.60 | Easy to get in, hard to get out |
| `forced_continuity` | medium | 0.55 | Free trials that auto-renew into paid plans |
| `drip_pricing` | medium | 0.55 | Fees revealed progressively |
| `basket_sneaking` | medium | 0.50 | Extra items added without consent |
| `false_urgency` | medium | 0.55 | Fake countdowns / scarcity |
| `misdirection` | low | 0.45 | Attention drawn away from the desired option |
| `nagging` | low | 0.45 | Repeated interruptive prompts |
| `subscription_trap` | high | 0.60 | Hard-to-cancel subscription + recurring charges |
| `urgency` | low | 0.45 | Countdown/limited-stock pressure |
| `hidden_costs` | medium | 0.50 | Costs concealed until the final step |
| `disguised_ads` | low | 0.45 | Ads styled as content |
| `forced_action` | medium | 0.50 | Unrelated action required to complete a task |

These map to the Postgres `pattern_type` enum and the Neo4j `Pattern` nodes. `overallRisk()` composes a single severity (highest wins) from the set of detections.

---

## 3. Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  Next.js 16 App Router (single process)                           │
│                                                                   │
│  src/app/        pages (dashboard, scanner, agent, tasks, …)        │
│  src/app/api/    REST routes (scanner, agent, graph, …)           │
│  src/proxy.ts    Next.js "proxy": session refresh + CORS          │
├─────────────────────────────────────────────────────────────────────┤
│  CLIENT (Zustand store + React)                                   │
│  src/stores/agent-store.ts   live session state                   │
│  src/lib/services/*          API client + mappers + polling         │
├─────────────────────────────────────────────────────────────────────┤
│  SERVER (the engine)                                              │
│  src/server/agent/       LangGraph: perceive→detect→plan→act→…      │
│  src/server/browser/     Playwright lifecycle, perception, actions│
│  src/server/detection/   heuristic classifier + taxonomy          │
│  src/server/graph/       Neo4j knowledge graph (optional)         │
│  src/server/llm/         OpenAI-compatible client (optional)      │
│  src/server/security/    SSRF, rate-limit, idempotency, audit   │
│  src/server/supabase/    admin/server/client/dev-store           │
│  src/server/db/          typed read helpers + approval transitions│
│  src/server/queue/       in-process job queue (MAX_CONCURRENCY=2) │
└─────────────────────────────────────────────────────────────────────┘
```

Key invariant: **UI, API and agent engine run together**, so there is one install and one dev server. A long-running Node server is required (a VM or container) because the agent keeps a real browser open across steps and waits for human approval — serverless functions are not a fit as built.

---

## 4. The Agent Pipeline (LangGraph)

The heart of the system is a LangGraph `StateGraph` in `src/server/agent/state.ts` orchestrating five agents plus an approval gate.

### 4.1 Nodes

```
START → PERCEIVE → DETECT → PLAN ──(conditional)──┬→ ACT → PERCEIVE (loop)
                                                  ├→ APPROVAL_GATE → (END, paused)
                                                  ├→ VERIFY → COMPLETE → END
                                                  └→ FAIL → END
```

| Node | File | Responsibility |
|---|---|---|
| `perceive` | `agents/perception.ts` | Navigate (first visit) / refresh perception of the live page. Emits `stage_started`/`perception_completed`. Records the page + the click that led here in the graph path map. |
| `detect` | `agents/detection.ts` | Classify the page (`classifyPage`), persist confirmed findings to `dark_pattern_detections`, report graph context (prior/related). |
| `plan` | `agents/planning.ts` | Decide the next action. Deterministic rules → LLM refinement → fallback. Sets `pendingFinalAction` when the irreversible step is reached. |
| `act` | `agents/action.ts` | Execute the chosen (or approved) action via `executeAction`. Records the click in the graph. |
| `approval_gate` | `agents/approval.ts` | Create an `agent_approvals` row, emit `approval_requested`, return `status: "approval_required"` → **the graph ends (paused)** until a human decides. |
| `verify` | `agents/verification.ts` | Confirm the outcome from page text + screenshot proof. Records the run outcome (verified/unverified) as a graph reward. |
| `complete`/`fail` | `agents/finalize.ts` | Persist terminal state, emit `task_completed`/`task_failed`. |

### 4.2 State

`AgentStateAnnotation` (`state.ts`) is fully JSON-serializable so it persists to `agent_sessions.state` (jsonb) and runs can **resume after a human approval**. Notable fields: `status` (running | approval_required | completed | failed | cancelled), `actionCount`, `lastDetection`, `lastDecision`, `lastAction`, `pendingFinalAction`, `approvalId`, `resumeApproval`, `lastClick` (the click ACT just executed + the page it was made from, consumed by PERCEIVE to map the flow).

### 4.3 Routing

Two conditional edges decide the loop:

- **`routeAfterPlan`** (`state.ts:70`): `completed`→VERIFY, `failed`→FAIL, `resumeApproval==="rejected"`→FAIL, a `pendingFinalAction` without `resumeApproval`→**APPROVAL_GATE**, otherwise→ACT.
- **`routeAfterAct`** (`state.ts:81`): `completed`→VERIFY, `failed`→FAIL, otherwise→PERCEIVE (loop).

### 4.4 Human-in-the-loop cancel

Every node is wrapped by `makeNode` (`state.ts:125`). Before any node body runs, it reads the session's `status` from the DB; if `/stop` has set it to `"cancelled"`, the node throws `AgentCancelledError` **before** doing any LLM/browser work. The runner (`runner.ts:144`) distinguishes a human stop from a real failure by re-reading the DB — so a cooperative stop is never mislabeled as a failure.

### 4.5 Runner & resumption

`src/server/agent/runner.ts` orchestrates a run: create/reuse a browser session → invoke the graph → persist final state → teardown. Runs are **fire-and-forget** via `enqueueStart`/`enqueueResume` (the job queue), so the API returns 202 immediately.

**Approval resume** (`runToCompletion` with a `ResumeRunInput`) reconciles the persisted state, sets `resumeApproval: "approved"|"rejected"`, reuses the still-alive browser session (so the browser isn't torn down at `approval_required`), and re-invokes the graph. On resume, `routeAfterPlan` sends `pendingFinalAction` + `resumeApproval==="approved"` to **ACT**, which executes the parked final action (`action.ts:25`), clears `pendingFinalAction`, and re-perceives.

---

## 5. Detection Engine

`src/server/detection/classifier.ts` — a deterministic heuristic detector over a `PerceptionResult`, with an optional LLM pass and graph learning layered on top.

### 5.1 Heuristic classification (always runs, no LLM required)

Phrase lists drive five detectors (`classifier.ts:25-68`):

- **Confirmshaming** — `GUILT_LANGUAGE` ("lose your benefits", "we'd hate to see you go", "are you sure"…). High severity.
- **Forced continuity** — `AUTO_RENEW` ("renews automatically", "free trial"…) and `RETENTION_OFFER` ("keep my premium", "special offer"…). Medium.
- **False urgency** — `FALSE_URGENCY` ("only a few left", "countdown"…). Medium.
- **Roach motel** — cancellation exits (`HIDDEN_CANCEL`) present **and** retention offers dominate. High.

Confidence is boosted by signal count, capped at 0.99 (`boost`). `dedupe` keeps one detection per pattern type.

### 5.2 LLM refinement (optional — skipped without `LLM_API_KEY`)

`chatStructured(llmDetectionSchema, …)` asks a "conservative UI auditor" for JSON findings. The system prompt requires **every finding to carry an `evidence` field: a verbatim quote from the page**. The **anti-hallucination gate** `isGrounded()` (`classifier.ts:231`) keeps an LLM finding only if its evidence quote appears (case/whitespace-insensitive) in the page text or element labels. Heuristic detections are authoritative; the LLM can only *add* grounded findings.

### 5.3 Graph learning applied

`applyLearning()` (`classifier.ts:244`) drops findings whose exact evidence was marked a false alarm (`value ≤ -LEARNED_THRESHOLD`) and adds confirmed phrases (`value ≥ +LEARNED_THRESHOLD`) **only if grounded on the page**. Findings are recorded back to the graph via `recordFindings`.

### 5.4 `classifyPage` flow

```
heuristicClassify() → graphContext() → LLM (grounded findings merged) → applyLearning() → recordFindings()
```

Returns `{ detections, overallRisk, graph: { prior, related } }`.

---

## 6. Browser Automation Layer

`src/server/browser/` — Playwright lifecycle, perception, and a whitelist of safe actions.

### 6.1 Manager (`manager.ts`)

- **One shared Chromium instance**, **one isolated `BrowserContext` per session** (users never share cookies/auth).
- Sessions are guarded by a hard timeout (`SESSION_TIMEOUT_MS` = 10 min) and destroyed after completion.
- A failed launch is cleared (`finally`) so one bad launch can't poison every later run.
- **Screenshot cache**: the live page preview reuses a JPEG (60 s TTL, max 30). `captureShot()` files a screenshot from a session that already has the page open, so X-Frame-Options-blocking sites still render without a second load. `renderShot()` skips media (video/audio are never visible in a still) and uses `domcontentloaded` + a short bounded wait.

### 6.2 Perception (`perception.ts`)

A single `evaluateTrusted` (`security.ts:27`) — the **only** place arbitrary JS touches the page, and it is project-owned, never LLM-owned — extracts a bounded, sanitized snapshot:

- `visibleText` capped at `MAX_VISIBLE_TEXT` (12,000 chars) — never sent wholesale to the LLM.
- Interactive elements (`button, a[href], input, select, textarea, [role='button']`), filtered to **visible** ones with text or aria-label, capped at 80, text at 120 chars.
- Viewport-relative `box` (fractional 0..1) used for overlays.
- `inferPageState()` — a cheap classifier: `success` / `confirmation` / `plan_selection` / `unknown`, which drives the demo-target flow.

### 6.3 Safe actions (`actions.ts`)

Only these primitives are executable, each independently timeout-bound:

- `click` / `fill` — matched via `page.getByText(target).filter({ visible: true }).first()` — **strict, visible-element locator, never a raw LLM-owned selector**.
- `scroll` — `window.scrollBy({ top: 600 })`.
- `wait` — capped at 3 s.
- `navigate` — **throws** (must be handled by the navigation layer, not the action executor).
- `request_approval` / `complete` / `fail` — terminal/gating, no browser work.

`BROWSER_LIMITS` (`security.ts`): navigation 30 s, action 10 s, max 20 navigations, `maxTotalActions` (env `AGENT_MAX_ACTIONS`, default 25). `MAX_ACTIONS` (types/agent.ts) = 25.

---

## 7. Knowledge Graph & Reinforcement Learning (Neo4j)

`src/server/graph/neo4j.ts` — the most sophisticated subsystem. An **optional** enhancer: without `NEO4J_URI` (or if the DB is unreachable) every call is a no-op and the agent still runs. Like the LLM, graph content is only ever a hint — callers re-check it against the live page. A failure pauses the graph for 60 s (`downUntil`) so a down DB costs one timeout, not one per page.

### 7.1 Schema

```
(:Site)-[:EXHIBITS {count, evidence, confidence}]->(:Pattern)     detection memory
(:Site)-[:SHOWS]->(:Indicator)-[:INDICATES {value, n}]->(:Pattern)  evidence phrases
(:Run)-[:ON]->(:Site), (:Run)-[:TOOK {order, path}]->(:Action)   run memory
(:Site)-[:HAS_PAGE]->(:Page)-[:LEADS_TO {click, count}]->(:Page)  path map
(:Site)-[:POLICY {path, value, n}]->(:Action)                     learned click policy
```

### 7.2 Two learning signals (value = running average in −1..1, `ALPHA = 0.5`)

1. **Findings** (`rewardFinding`): a human marks a finding correct (+1) or a false alarm (−1) via `/api/graph/feedback`. Updates `Indicator-[:INDICATES]->Pattern` with `value += ALPHA * (reward - value)`.
2. **Clicks** (`recordOutcome`): a run that ends **verified** rewards every click it took (+1); an **unverified/failed** run rewards −1; a **stopped** run rewards 0 (a human declining says nothing about whether the clicks were right). Updates `Site-[:POLICY]->Action`. Paid out **once per run** (`WHERE r.reward IS NULL`).

`LEARNED_THRESHOLD = 0.4` — how far a value must be from 0 before the agent acts on it.

### 7.3 What the planner reads

- `learnedSteps(url)` — the learned value of each click tried from this exact page.
- `routeToSuccess(url)` — **shortest known path** (`shortestPath` up to 10 hops) from this page to a `state:"success"` page on the same site.
- In `planning.ts`, the planner scores each element as `learnedValue + (onRoute ? 2 : 0)` — **the next click on the shortest known route outranks any learned score**. It prefers high-value clicks and avoids negative ones, and routes the 1-step-to-success click to the approval gate.

### 7.4 What detection reads

`graphContext(url, foundTypes)` returns four things in parallel:
- `prior` — evidence-backed findings previously recorded for this site (top 10 by count).
- `related` — patterns that **other sites** show together with the ones found here (co-occurrence, top 5).
- `examples` — verified example phrases per pattern (top 3, most widely seen first).
- `learned` — phrases with a learned value from human feedback (top 500).

These are fed to the LLM detector as hints ("It is a hint, not proof").

### 7.5 Snapshots (for the UI)

- `graphSnapshot()` — nodes + relationships for the `/graph` page (Fruchterman–Reingold layout, computed once in `lib/graph-layout.ts`).
- `learningSnapshot()` — findings awaiting a verdict, learned wordings, scored clicks, run outcome counts for the `/learning` page.
- `siteRanking()` — every site ranked by **trap score** (`lib/trap-score.ts`), with patterns, shortest route, and run stats for the `/sites` page.

### 7.6 Trap score (`lib/trap-score.ts`)

A 0–100 yardstick (not an industry standard), three capped parts:
- **patterns** (≤60): severity points (low 5 / medium 10 / high 20 / critical 30).
- **exit** (≤30): 10 per click beyond the first on the shortest cancel route.
- **failures** (≤10): share of cancellation attempts that did not end verified.

### 7.7 Seeding

`npm run graph:seed` (`scripts/seed-graph.ts`) creates uniqueness constraints (Site.host, Pattern.type, Indicator.phrase, Run.id, Action.label, Page.key) and loads the taxonomy + the heuristic indicator phrases (`SEED_INDICATORS`).

---

## 8. LLM Integration

`src/server/llm/client.ts` — a thin server-side abstraction over OpenAI-compatible `/chat/completions`. The key lives only on the server; without `LLM_API_KEY` it returns `null` (the deterministic paths run fine).

- `chat()` — plain-text completion.
- `chatStructured(schema, opts)` — JSON mode, validated against a Zod schema. **Returns `null`** when no LLM is configured, the request fails (e.g. a 429), or parsing fails — callers fall back to deterministic logic. `maxTokens` defaults to 4000 (headroom for reasoning models whose thinking tokens count against the limit). `extractJson()` tolerates code-fenced JSON.

Two call sites: the **detector** (`SYSTEM_DETECTOR`) and the **planner** (`PLAN_SYSTEM`). Both treat page content as untrusted data, never instructions.

---

## 9. Security Model

`src/server/security/` — defense in depth.

### 9.1 SSRF guard (`ssrf.ts`)

`validateTargetUrl()`:
- Only `http`/`https`; no userinfo; no `javascript:`/`data:`/`file:`/`about:`.
- Hostname not `localhost`/`0.0.0.0`/loopback.
- Resolves the IP (DNS `lookup` with `all:true`) and re-checks the **effective** IP to defeat DNS rebinding.
- Private ranges blocked: IPv4 `10/8`, `127/8`, `0/8`, `169.254/16`, `172.16/12`, `192.168/16`, `100.64/10` (CGNAT); IPv6 `::1`, `::`, `::ffff:` mapped, `fe80:`, `fc`/`fd` (ULA). Malformed → unsafe.
- **Dev affordance**: `SUPABASE_DEV_MODE !== "false"` allows loopback so the self-hosted demo site works. In production (`SUPABASE_DEV_MODE=false`) private/loopback are blocked.

### 9.2 Rate limiting (`rate-limit.ts`)

Per-user sliding-window, in-process (swap the store for Redis via `REDIS_URL` for horizontal deploys). Buckets:
- `agentStart` 10/hour, `scanner` 30/hour, `feedback` 120/hour, `approval` 20/hour.
- A 5-minute prune interval clears stale buckets. Throws `RateLimitError` (429).

### 9.3 Idempotency (`idempotency.ts`)

`Idempotency-Key` header support for critical mutations (`agent/start`, `approve`). Backed by the `idempotency_keys` table via the admin client so it survives restarts. `reserveKey()` uses the Postgres unique violation (`23505`) to detect replays; `storeResponse()` caches the response so a retry returns the original 202.

### 9.4 Typed errors (`errors.ts`)

`AppError` hierarchy (`AuthenticationError` 401, `AuthorizationError` 403, `NotFoundError` 404, `ValidationError` 422, `AgentError`, `BrowserAutomationError`, `VerificationError`, `RateLimitError` 429, `ConflictError` 409). `errorBody()` **never returns a stack trace** — only `code` + `message` for `expose` errors; everything else is a generic `INTERNAL_ERROR`.

### 9.5 Validation (`validation.ts`)

Zod schemas for every API surface (`startAgentSchema`, `scannerSchema`, `approvalActionSchema`, `profilePatchSchema`, `activityQuerySchema`, `idParamSchema`), all `.strict()` (reject unknown fields). `targetUrlSchema` auto-prefixes `https://` when typed without a scheme. `validIdempotencyKey()` = 8–128 chars.

### 9.6 Audit (`audit.ts`)

`logEvent()` writes structured JSON to stdout (consumed by Vercel/Datadog). `persistAudit()` writes `audit_logs` rows (service-role only — users never write audit rows) with `sanitizeMetadata()` redacting keys matching `password/token/cookie/api_key/secret/card/cvv`, and `ip_hash` (SHA-256, truncated). `makeRequestId()` produces `req_<uuid8>` for tracing request → session → events → actions → verification.

### 9.7 API wrapper (`api/handler.ts`)

`api()` wraps route handlers so `AppError`s map to clean JSON responses and unhandled errors are logged (never leak stacks) and returned as 500.

### 9.8 Auth (`auth/guards.ts`)

`requireUser()` resolves the authenticated user from the Supabase SSR session — **the user id is always derived from the session, never from the client**. Throws 401 when there is no session.

### 9.9 Safe actions

The agent can only `click`, `type`, `scroll`, `wait`. **Page text is treated as data, never as instructions.** The only `page.evaluate` is project-owned (`evaluateTrusted`).

---

## 10. Data Model (Supabase)

Migrations in `supabase/migrations/` are the source of truth; `types/database.ts` is generated from them (`npm run db:types`).

### 10.1 Tables

| Table | Purpose |
|---|---|
| `profiles` | User profile (auto-created on signup via `handle_new_user` trigger). |
| `agent_sessions` | One agent run. `state` jsonb persists the graph so a paused run **resumes**. `status`, `current_stage`, `target_url`, `error_message`. |
| `agent_events` | Append-only event log (Realtime publishes inserts). Nullable `session_id` so the scanner can persist too. |
| `dark_pattern_detections` | Evidence. `confidence numeric(5,4)` with a `0..1` check. **Users may not mutate after creation** (evidence is immutable; service-role deletes for retention). |
| `cancellation_tasks` | A guided cancellation. Tracks `approval_requested_at`, `approved_at`, `proof_screenshot_path`, `failure_reason`. |
| `agent_approvals` | A pending approval pauses the agent. `action_type` enum (`final_cancellation`), `risk_level`, `expires_at`. |
| `audit_logs` | Append-only; users read their own; appends are service-role only. |
| `idempotency_keys` | Backs the `Idempotency-Key` header. |

### 10.2 Row Level Security (`002_rls.sql`)

The **database — not the frontend — is the authorization boundary.** Every user-owned table has `auth.uid() = user_id` policies for select/insert/update/delete. Critically, **`agent_approvals` has no UPDATE policy** — users may insert (request) but **cannot flip their own approval to `approved`**; only the server-validated `transitionApproval` (service role) may, after ownership/pending/expiry checks. `dark_pattern_detections` has no update/delete for users (evidence is immutable).

### 10.3 Functions & triggers (`004_functions_triggers.sql`)

- `handle_new_user()` — auto-create a profile on signup.
- `set_updated_at()` — reusable `updated_at` trigger.
- `expire_pending_approvals()` — flip stale pending approvals to `expired` (safe to schedule with pg_cron).
- Realtime: `agent_events` added to `supabase_realtime` publication.

### 10.4 Storage (`005_storage.sql`)

A **private** `agent-proofs` bucket (no anonymous/public read). Policies scope objects to `{user_id}/{session_id}/{filename}`. Signed URLs (server-side, service role) are the only way to read proofs. `delete_expired_proofs()` removes objects past their `expires_at` (7-day retention; evidence metadata is kept in the detection/task tables).

### 10.5 Indexes (`003_indexes.sql`)

Covering indexes on the hot query patterns: `user_id`, `status`, `created_at desc`, composite `(user_id, status)`, `(session_id, created_at desc)`, `(session_id, pattern_type)`.

### 10.6 Three Supabase clients

- **`admin.ts`** — service-role, **bypasses RLS**. Only from trusted server code (agent worker, background cleanup, system events). `assertServerOnly()` guard throws if called from the browser.
- **`server.ts`** — SSR client bound to the authenticated user's cookies (carries the user's RLS identity).
- **`client.ts`** — browser (publishable) client, safe for client components only.

### 10.7 Dev store (`dev-store.ts`)

When `NEXT_PUBLIC_SUPABASE_URL` is absent and `SUPABASE_DEV_MODE !== "false"`, `createDevClient()` returns an in-memory stand-in implementing just the query-builder surface the app uses (`select/insert/update/eq/in/lt/gte/order/limit/single/maybeSingle/then`), with a fixed `DEV_USER_ID`/`DEV_USER_EMAIL` and a `getUser()` that always returns the demo user. This lets the app run end-to-end with **no external services**.

---

## 11. API Surface

All routes are `runtime = "nodejs"`, `dynamic = "force-dynamic"`. Auth via `requireUser()` unless noted.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Public liveness probe (no auth, no secrets, no DB). |
| POST | `/api/scanner/analyze` | Read-only scan: navigate → perceive → `classifyPage` → persist detections. No agent, no actions. |
| GET | `/api/scanner/screenshot?url=` | Server-rendered screenshot of a page (live preview). |
| POST | `/api/agent/start` | Start an agent run (202, runs in background). Auth + rate-limit + idempotency + SSRF before enqueue. Creates a `cancellation_task` + `agent_session`. |
| GET | `/api/agent/[id]` | Session detail (+ detections). |
| GET | `/api/agent/[id]/events` | Event log (Realtime publishes inserts). |
| GET | `/api/agent/[id]/proof` | Proof screenshot. |
| POST | `/api/agent/[id]/approve` | Approve the pending final action and resume. |
| POST | `/api/agent/[id]/reject` | Reject — the run stops (not retried). |
| POST | `/api/agent/[id]/stop` | Terminate a running/paused session; browser torn down. |
| GET/POST | `/api/cancellations` | List tasks / start a guided cancellation (delegates to the agent engine). |
| GET | `/api/cancellations/[id]` | Task detail. |
| POST | `/api/cancellations/[id]/stop` | Stop a task. |
| GET | `/api/activity` | Paginated, filterable activity feed (keyset pagination, limit/cursor/status/agent/date). |
| GET/PATCH | `/api/profile` | Read/update profile. |
| GET | `/api/auth/me` | Current user. |
| POST | `/api/auth/signout` | Sign out. |
| GET | `/api/graph` | Knowledge-graph snapshot (nodes + relationships) for `/graph`. |
| POST | `/api/graph/feedback` | Mark a finding correct / false alarm — the detector's reward signal. |
| GET | `/api/graph/learning` | What the agent learned + findings needing a verdict, for `/learning`. |
| GET | `/api/graph/sites` | Every site ranked by trap score, for `/sites`. |

**Auth callback** (`/auth/callback`): exchanges the OAuth code for a session, upserts the profile, redirects to `/dashboard`.

**Proxy** (`src/proxy.ts`): refreshes the Supabase session on every matched request and applies CORS (allowed origins from `CORS_ORIGIN`, default `localhost:3000`). Handles `OPTIONS` preflight with `Idempotency-Key` in allowed headers.

---

## 12. Frontend Architecture

### 12.1 Pages (`src/app/`)

- **Landing** (`page.tsx`) — marketing/hero.
- **`(app)/` group** (wrapped in `AppShell`): `dashboard` (overview), `agent` (live agent panel), `scanner`, `tasks` (cancellations), `activity`, `graph`, `learning`, `sites`, `security`, `settings`, `demo`.
- **`demo-target/`** — the StreamVault test site (see §13).
- **`auth/callback`** — OAuth callback.

### 12.2 State (`src/stores/agent-store.ts`)

A Zustand store holds the live session: `task`, `status`, `stageStates` (per-agent idle/running/completed/blocked/failed), `events`, `decision`, `patterns`, `browser`, `approvalRequired`, `verification`, `live`.

### 12.3 Services (`src/lib/services/`)

- **`agentService.ts`** — `startAgentRun`, `fetchSession`, `fetchEvents`, `approveSession`, `rejectSession`, `stopSession`, and **`startPolling`** which polls session + events every 1.5 s, folds them into the store (deriving stage states from event types), and finishes on terminal status.
- **`scannerService.ts`** — `scanUrl` → maps backend detections to the UI `DarkPattern` shape, computing a `RiskOverview`.
- **`taskService.ts`** — tasks + activity, with a demo fallback.
- **`simulator.ts`** — an opt-in demo simulator (not used in the real flow).

### 12.4 Notable UI components

- **`AgentPipeline`** — a 5-node pipeline visualization with animated connectors, a dashed orbiting ring on the running stage, and a ping indicator on the blocked (approval) stage.
- **`ApprovalModal`** — traps focus while open, shows the pending action, "what will happen", an irreversibility warning, and Approve/Reject buttons.
- **`BrowserFrame`/`PagePreview`/`LiveShot`** — the live page rendered from the agent's browser screenshots.
- **`graph/page.tsx`** — an interactive force-directed graph (legend doubles as a node-type filter; hover traces links; click opens a details panel; labels are placed to avoid overlap).
- **`learning/page.tsx`** — the human-in-the-loop teaching surface: rate findings ("Yes, a trick" / "No, false alarm") and see learned scores (−1..+1).
- **`sites/page.tsx`** — trap-score ranking with a per-part breakdown.

### 12.5 Client API client (`lib/api.ts`)

Same-origin by default (`NEXT_PUBLIC_API_URL` overrides for a split deploy). `credentials: "include"`, `cache: "no-store"`. Parses the `{ error: { code, message } }` body into an `ApiError`. `demoTargetUrl()` returns the StreamVault URL.

---

## 13. Demo Target: StreamVault

`src/app/demo-target/` — a realistic fake streaming service with **planted dark patterns**, served as self-contained HTML (inline CSS/SVG, no external assets) so it renders instantly for screenshots. Four pages form the cancellation flow:

1. **`/account`** — the account page. "Renews automatically" (forced continuity), a big "Keep my benefits" CTA (misdirection), and a **tiny, low-contrast "Cancel subscription" link** (roach motel). Footer: "We'd hate to see you go" (confirmshaming).
2. **`/plan`** — a retention "save offer" page: "Wait — we'd hate to see you go", "1 month FREE", "we'll pause, not cancel" (forced continuity + confirmshaming), with the real cancel path as a tiny greyed-out "No thanks, cancel subscription" link.
3. **`/confirm`** — the final confirmation gate. "Last chance: keep your plan for 1 month free" (misdirection), a big bright "I don't want to lose my benefits" button vs. a muted "Yes, cancel my subscription" ghost button. **This is where the agent pauses for human approval.**
4. **`/success`** — "Your subscription has been cancelled", "Auto-renew: Disabled". Contains the success markers ("subscription is cancelled" / "cancelled") that the VERIFY agent looks for.

The planner's word lists are tuned to this flow: `EXPLICIT_CANCEL`, `FINAL_CONFIRM`, `CANCEL_NAV`, and `RETENTION_TRAP` (the last deliberately ignored when entering the cancellation flow).

---

## 14. Testing

`vitest.config.ts` — node environment, `tests/**/*.test.ts`, fork pool, 30 s timeout. 9 suites:

| Suite | Covers |
|---|---|
| `classifier.test.ts` | Heuristic detection (confirmshaming/forced-continuity/roach-motel), `overallRisk`, deterministic `classifyPage`, the `isGrounded` hallucination gate, and `applyLearning` (drops false alarms, adds grounded confirmed phrases, ignores weak values). |
| `agent-graph.test.ts` | `routeAfterPlan`/`routeAfterAct` routing, graph wiring (happy path, human-cancel short-circuit, approval pause, approval-resume execution). |
| `security-ssrf.test.ts` | `isPrivateAddress` (IPv4/IPv6 ranges), `validateTargetUrlSync` (protocols/credentials), production-mode loopback/private rejection, dev-mode localhost allowance. |
| `trap-score.test.ts` | Zero for clean, severity + exit + failure parts, caps, unknown severities. |
| `graph-layout.test.ts` | Force layout: nodes inside canvas, separation, linked-closer-than-unlinked, empty graph. |
| `rate-limit.test.ts` | Under-limit allows, 429 when full, per-user bucket scoping. |
| `approval.test.ts` | `transitionApproval`: valid approve, wrong-owner 404, non-pending 409, expired 409, session-not-paused 409. |
| `validation.test.ts` | Zod schemas (https prefix, strict unknown-field rejection, goal enum, idempotency key length). |

**Known issue (per README):** 4 tests currently fail — two SSRF tests expect private addresses blocked but dev mode allows them; two graph-routing tests expect `completed`→COMPLETE but the code routes `completed`→VERIFY (the latter is actually the intended behavior — a reached goal is verified on the page before completing).

**Smoke test** (`scripts/smoke-agent.ts`): an end-to-end deterministic pipeline check against the self-hosted demo target (no Supabase, no LLM). Drives perceive → classify → plan → act → verify until the success page, printing the risk + patterns at each step.

---

## 15. Deployment & Operations

`docs/setup/deployment.md` + `vercel.json` + `next.config.ts`.

- `serverExternalPackages: ["playwright", "neo4j-driver"]` keeps the real browser and driver out of the bundle.
- `turbopack.root` + `outputFileTracingRoot` pin the app root (works in local dev and Vercel build).
- `agentRules: false` stops `next dev` writing AI-assistant instruction files into the repo.
- **Prereq:** `npx playwright install chromium` on the deploy target.
- **Queueing (MVP):** in-process, concurrency 2. For horizontal scaling: replace `enqueueStart`/`enqueueResume` with a BullMQ producer (`REDIS_URL`) and run a separate worker that consumes jobs and calls `runToCompletion`. The graph state persists to `agent_sessions.state`, so a run is always resumable from any instance.
- **Production checklist:** migrations applied + types in sync, Google OAuth configured, service-role key server-side only, Playwright installed, proof retention job scheduled, lint/typecheck/test/build green.
- **Env:** see `.env.example`. Required: Supabase URL/keys, Google OAuth, `NEXT_PUBLIC_APP_URL`. Optional: LLM, Redis, Neo4j, `AGENT_MAX_ACTIONS`, `PROOFS_DIR`. **Set `SUPABASE_DEV_MODE="false"` in production** (this also turns on SSRF blocking of private/loopback addresses).

---

## 16. Design Patterns & Notable Engineering Decisions

1. **Deterministic-first agent.** Detection and planning are heuristic state machines; the LLM and Neo4j are optional enhancers that degrade to no-ops. The app runs with zero external services.
2. **Anti-hallucination grounding.** Every LLM detection must quote verbatim evidence that `isGrounded()` re-finds on the page; ungrounded findings are discarded. Graph content is "a hint, not proof."
3. **Human-in-the-loop as a graph pause.** The approval gate is a first-class graph node that ends the graph (`approval_required` → END); resume re-invokes with `resumeApproval`. The browser session survives the pause so the user returns to the exact page.
4. **Cooperative cancellation.** Every node checks the DB `status` before doing work; a human stop throws before any LLM/browser action, and the runner distinguishes stop from failure.
5. **The database is the authorization boundary.** RLS policies enforce ownership; `agent_approvals` deliberately has no user UPDATE policy; the service role is the only path that can transition an approval.
6. **Immutable evidence.** `dark_pattern_detections` has no user update/delete; findings are write-once.
7. **Reinforcement learning with two reward channels** (human feedback on findings + verified outcomes on clicks), both as running averages in −1..1 with a shared `ALPHA`, and a `LEARNED_THRESHOLD` before acting. A human "stop" rewards 0 (it says nothing about the clicks).
8. **Path mapping.** `LEADS_TO` edges (built from `lastClick`) let `routeToSuccess` compute the shortest known route to a cancelled page, which the planner prefers over any learned score.
9. **Bounded perception.** Visible text capped at 12k chars, elements at 80 — the LLM never receives a whole page.
10. **Defense in depth.** SSRF (with DNS-rebinding re-check), per-user rate limits, idempotency keys, typed errors with no stack leaks, structured audit logging with redaction, and a whitelist of safe browser actions matched against visible elements only.

---

## 17. Known Issues & Limitations

- **4 failing tests** (see §14) — SSRF dev-mode allowance and a routing-expectation mismatch.
- **In-process queue & rate limiter** — per-instance state; horizontal deploys need Redis/BullMQ (wired as optional via `REDIS_URL` but not implemented).
- **Serverless-hostile** — the long-lived browser + approval wait requires a long-running Node server.
- **Neo4j snapshot is shared across users** — the code notes Run nodes should be scoped by user before exposing to untrusted tenants (`neo4j.ts` "ponytail" comment).
- **Demo data is isolated** — `lib/data.ts` demo patterns/tasks are explicitly flagged "must NOT be used in the real investigation flow"; the real flow uses backend agent sessions.
- **Scanner can't handle login-walled pages** (noted in the scanner UI).
- **LLM/Neo4j are no-ops when unconfigured** — enhanced detection/planning/memory simply don't run.

---

## 18. File Map

```
src/
  app/
    page.tsx                       landing page
    layout.tsx                     root layout
    (app)/                         the app shell + pages
      layout.tsx                   AppShell wrapper
      dashboard/ agent/ scanner/ tasks/ activity/
      graph/ learning/ sites/ security/ settings/ demo/
    api/                           REST routes (see §11)
      agent/start, agent/[id]{,/events,/proof,/approve,/reject,/stop}
      scanner/{analyze,screenshot}
      cancellations/{,[id],/[id]/stop}
      graph{,/feedback,/learning,/sites}
      activity/ profile/ auth/{me,signout} health/
    auth/callback/                 OAuth callback
    demo-target/{account,plan,confirm,success}/  StreamVault test site
  components/
    layout/   AppShell, Sidebar, MobileNav, CommandPalette
    agent/    AgentPipeline, ApprovalModal, AgentEventStream, AgentDecision, AgentStatus
    browser/  BrowserFrame, BrowserToolbar, PagePreview, DarkPatternHighlight
    scanner/  DetectionOverlay, EvidenceDrawer
    cancellation/ ProofViewer
    landing/  HeroCase
    ui/       button, card, dialog, badge, switch, tooltip, avatar, input,
              separator, skeleton, case, confidence-bar, severity-badge, status-dot
  lib/
    api.ts, types.ts, constants.ts, utils.ts, navigation.ts, data.ts,
    trap-score.ts, graph-layout.ts,
    services/{agentService,scannerService,taskService,simulator}.ts
  stores/agent-store.ts            Zustand live-session store
  server/
    agent/   graph.ts, state.ts, runner.ts, events.ts,
             agents/{perception,detection,planning,action,approval,verification,finalize}.ts
    browser/ manager.ts, perception.ts, actions.ts, security.ts
    detection/ classifier.ts, taxonomy.ts
    graph/   neo4j.ts
    llm/     client.ts
    security/ ssrf.ts, rate-limit.ts, idempotency.ts, errors.ts, validation.ts, audit.ts
    supabase/ admin.ts, server.ts, client.ts, proxy.ts, types.ts, dev-store.ts
    db/      queries.ts, approvals.ts
    queue/   runner.ts
    api/     handler.ts
    auth/    guards.ts
  proxy.ts                         Next.js proxy: session refresh + CORS
  types/   agent.ts, api.ts, database.ts
supabase/  migrations/{001..005}, seed.sql, config.toml
scripts/   seed-graph.ts, smoke-agent.ts, generate-types.ts, cleanup-proofs.ts, _probe.ts
tests/     8 *.test.ts suites
docs/setup/ supabase.md, google-auth.md, deployment.md
```

---

## 19. How to Run

```bash
npm install
npx playwright install chromium   # one-time: the browser the agent drives
npm run dev                        # http://localhost:3000
```

Then, on the built-in StreamVault test site (`/demo-target/account`):
- **Scan a page** — press "Try the StreamVault test site", read the verdict.
- **Agent** — press "Hand it to the agent", watch it work through the page, approve the final step.

Optional: `npm run graph:seed` (Neo4j constraints + taxonomy), `npm run smoke` (end-to-end pipeline check), `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

---

*Generated by deep-reading the full TrapKiller codebase. All file/line references are to the repository at the time of analysis.*
