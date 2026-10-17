# TrapKiller — Complete Project Analysis

> A file-by-file analysis of the whole repository, written after reading every source file.
> It goes further than `DEEP_RESEARCH.md`: it describes what the code **actually does today** (including where that differs from the comments and the older docs), traces every request and agent run end to end, and lists every bug, gap and inconsistency found.
>
> Snapshot: branch `main`, 14 October 2026, after the neural detector was added. About 22,000 lines in 190 files.

## Contents

- **Overview** — what the product is, how it is built, the state it is in
- **Part A** — the server: agent engine, browser, detection (rules, neural network, LLM), knowledge graph, security, data layer
- **Part B** — the REST API, and one agent run traced end to end
- **Part C** — client-side library, store and types
- **Part D** — the database schema (unused at runtime)
- **Part E** — the user interface: every page and component
- **Part F** — test site, tests, scripts, docs, configuration, pitch video
- **Part G** — every issue found, ranked
- **Part H** — where the app's own explanations do not match the code
- **Part I** — index of every file

---

## Overview

### What it is

**TrapKiller** is a consumer-protection tool for subscription "dark patterns" (designs that trick people into staying subscribed). It has two modes:

1. **Scan a page** (read-only): a real headless Chrome opens the page, reads its text and buttons, and reports which dark patterns it finds, quoting the words it found them in.
2. **Send the agent in**: the agent walks a cancellation flow click by click, skips "keep my benefits"-style traps, **pauses for a human to approve the final irreversible click**, then checks the result on the page and saves a screenshot.

Around these sit a knowledge graph that remembers sites, findings and click routes, a learning loop driven by human verdicts and verified outcomes, a site ranking by "trap score", a scripted demo, a marketing landing page and a separate pitch-video project.

### How it is built

One Next.js 16 app (App Router, React 19, TypeScript) contains the UI, the REST API and the agent engine.

```
Browser UI (React, Zustand store, polling every 1.5 s)
        │  fetch /api/*
        ▼
Next.js route handlers (src/app/api)  ── auth: always the demo user
        │
        ├─ Scanner:  Playwright → perceive → classifyPage → findings
        │
        └─ Agent:    in-process queue (2 at a time) → LangGraph
                     PERCEIVE → DETECT → PLAN → ACT ↺ … → APPROVAL (pause)
                     → (human approves) → ACT → VERIFY → COMPLETE
                         │          │         │
                         │          │         └─ optional LLM planner
                         │          ├─ rules + neural network (MiniLM + trained head)
                         │          └─ optional LLM detector (quotes must be on the page)
                         └─ optional Neo4j graph (memory, routes, learning)

Storage: an in-memory store (lost on restart) + PNG proofs in .proofs/
```

Deterministic code makes every decision that matters. The LLM, Neo4j and the neural model are optional extras: if they are missing or fail, the app still works with its phrase rules. Anything an LLM or the graph suggests is checked against the live page before it is used.

### State of the project

- It runs end to end on the built-in **StreamVault** test site with no external services: scan, agent run, approval pause, verified cancellation, proof screenshot. `npm test` (74 tests) and `npm run typecheck` pass.
- **There is no login and no database.** Supabase and Google sign-in were removed (commit `1c9e485`); the SQL migrations and several docs still describe them. Everything lives in memory and disappears on restart.
- The detection side is the strongest part: verbatim-quote grounding for LLM findings, learning from feedback, and now a trained neural classifier (94.0 % held-out accuracy on ec-darkpattern).
- The weakest parts are the outcome reporting and UI wiring: an unverified run is reported as a verified cancellation (G1), "Reject" does not reject (G2), stopping a task does not stop its agent (G3), most pattern types are mislabelled in the UI (G4), and the agent only attempts real cancellations on URLs containing "cancel" or "demo-target" (G7). Part G lists 30 ranked issues plus low-priority cleanup.


---

## Part A — The server (`src/server/`)

Everything in `src/server/` runs only on the Node.js server. API routes (`src/app/api/`) call into it; the browser never imports it.

### A1. Agent engine (`src/server/agent/`)

#### `state.ts` — the LangGraph definition

- **`AgentStateAnnotation`**: the run's state, every field JSON-serialisable so it can be saved to `agent_sessions.state` and resumed later. Fields: `sessionId`, `taskId`, `userId`, `goal` (typed as plain `string`), `targetUrl`, `currentStage`, `status` (`running | approval_required | completed | failed | cancelled`), `actionCount`, `lastUrl`, `lastDetection`, `lastDecision`, `lastAction`, `pendingFinalAction`, `approvalId`, `errorMessage`, `evidence`, `resumeApproval`, `lastClick` (`{from, label}`: the click ACT just made, used by PERCEIVE to draw the path map).
- No reducers are declared, so every node's partial return **overwrites** those keys (last write wins).
- **`AgentCancelledError`**: thrown when a human has stopped the run.
- **`GRAPH`**: node names `perceive, detect, plan, act, approval_gate, verify, complete, fail`.
- **`routeAfterPlan(state)`**: `completed → verify`, `failed → fail`, `resumeApproval === "rejected" → fail`, `pendingFinalAction && !resumeApproval → approval_gate`, otherwise `act`.
- **`routeAfterAct(state)`**: `completed → verify`, `failed → fail`, otherwise back to `perceive` (the loop).
- **`buildGraph(nodes)`** wires it:

```
START → perceive → detect → plan ─┬─> act ──┬─> perceive (loop)
                                  │         ├─> verify
                                  │         └─> fail
                                  ├─> approval_gate ─┬─> END (status approval_required: paused)
                                  │                  └─> act
                                  ├─> verify → complete → END
                                  └─> fail → END
```

  `complete` is listed as a possible target of both conditional edges but neither router ever returns it.
- **`makeNode`** wraps every node. Before the node body runs it reads `agent_sessions.status` from the store and throws `AgentCancelledError` if it is `cancelled`. This is the cooperative "stop" mechanism: a stop takes effect at the next node boundary, not mid-node (the stop route also kills the browser, which makes any in-flight Playwright call throw).

#### `graph.ts` — wiring real handlers

- `RuntimeContext` = `{ sessionId, userId, taskId, browser, supabase, proofsDir }`, passed through LangGraph's `configurable` so nodes stay free of globals.
- `createGraph()` maps each node name to its handler and calls `buildGraph`.

#### `runner.ts` — running a session

- `runToCompletion(input)` handles both a fresh start (`StartRunInput`) and a resume after a human decision (`ResumeRunInput`, recognised by the `decision` key).
  1. Reads the session row. For a resume it rebuilds the state from the saved `state` and sets `status: "running"` and `resumeApproval: decision`.
  2. Reuses the live browser session if one exists (normal for an approval resume), otherwise creates one and navigates to `lastUrl` or `targetUrl` (20 s `domcontentloaded`, then a 10 s `load` fallback, then carries on with whatever loaded).
  3. `graph.invoke(state, { configurable: ctx })`, then `persistFinalState`.
  4. On an exception it re-reads the status; a human stop is recorded as `cancelled`, anything else emits `task_failed` and saves `failed` + `errorMessage`.
  5. `finally`: tears the browser down unless the run is paused at `approval_required`.
- `persistFinalState` writes only `status`, `state` and `completed_at`. It never writes `current_stage` or `error_message` columns (see Part G).
- `enqueueStart` / `enqueueResume` push the run onto the in-process job queue, so the API returns 202 at once.
- The header comment says "a per-session lock prevents concurrent double-runs"; **no such lock exists**. Two resumes for the same session (for example a double-clicked approve that slips past the approval checks) would run the graph twice on one browser page.
- `PROOFS_DIR` defaults to `<cwd>/.proofs`.

#### `events.ts`

- `emitEvent(supabase, sessionId, opts)` inserts into `agent_events` and swallows errors (a failed event never stops a run). Events are user-visible, so they must not carry chain-of-thought.
- `stageLabel(stage)` maps stage names to "Perceiving / Detecting / Planning / Acting / Verifying". It is not used anywhere.

#### `agents/perception.ts` — PERCEIVE

1. Fails the run if `actionCount >= MAX_ACTIONS` (25).
2. Emits `stage_started`.
3. On the first visit (page is `about:blank`) navigates to `targetUrl`, same timeouts as the runner.
4. `perceive(page)` (see A2), then `browserManager.captureShot` so the live preview shows the page the agent has open.
5. `recordPage` in Neo4j: this page, plus a `LEADS_TO` edge from the previous page labelled with the click that led here (`state.lastClick`).
6. Emits `perception_completed`; returns `lastUrl`, clears `lastClick` and `lastDetection`, sets `lastDecision` to "On <url> (<pageState>)".

The perception result itself is **not** stored in state; DETECT and PLAN each call `perceive()` again, so one loop iteration reads the page three times.

#### `agents/detection.ts` — DETECT

Perceives again, runs `classifyPage` (heuristics → neural → graph context → LLM → learning, see A3), inserts every finding into `dark_pattern_detections` with the session id, emits `detection_completed` ("Found N dark pattern(s) · knowledge graph: …"), and stores the first finding as `lastDetection`.

On an approval resume the graph restarts at PERCEIVE, so the confirmation page is classified a second time and its findings are inserted twice.

#### `agents/planning.ts` — PLAN (the decision maker)

A deterministic rule ladder; the first rule that fires wins.

| # | Rule | Result |
|---|---|---|
| 1 | goal is `detect_dark_patterns` or `investigation`, or `pageState === "success"`, or text contains "your subscription is cancelled" | `complete` (emits `goal_reached`) → routed to VERIFY |
| 2 | `actionCount >= MAX_ACTIONS` | `fail` |
| 3 | an element containing an `EXPLICIT_CANCEL` phrase ("yes, cancel", "cancel my subscription", "no thanks, cancel", "confirm cancellation", …), best by learned value | click it; if it also matches `FINAL_CONFIRM` ("yes, cancel", "confirm cancellation", "confirm my cancellation") and the human has not approved yet, it is parked as `pendingFinalAction` (→ approval gate) |
| 4 | a `CANCEL_NAV` link ("cancel subscription", "cancel membership", "unsubscribe", "cancel my plan") that is not a `RETENTION_TRAP` | click it |
| 4b | any element whose learned value (+2 if it is the next click on the shortest known route) ≥ `LEARNED_THRESHOLD` (0.4) and is not a retention trap | click it; if the route says it is the last click before the cancelled page, park it for approval |
| 5 | LLM plan (only with `LLM_API_KEY`) whose target matches a real element | take it |
| 6 | `actionCount >= 1` or goal `detect_dark_patterns` | `complete` |
| — | otherwise | `scroll` |

Graph inputs: `learnedSteps(url)` (Q-like values per click from this page) and `routeToSuccess(url)` (shortest `LEADS_TO` path to a `success` page). `valueOf(el) = learned + (onRoute ? 2 : 0)`; ties keep page order.

Notes:
- `"cancel subscription"` is in both `EXPLICIT_CANCEL` and `CANCEL_NAV`, so rule 4 only fires for "cancel membership", "unsubscribe" and "cancel my plan".
- Rule 3 does not filter retention traps; it relies on the trap phrases not containing a cancel phrase.
- Rule 6 means that after any single click, a page with no recognised cancel affordance ends the run as `complete`. Combined with the VERIFY problem below, a run that got lost after one click can end "completed".
- `"investigation"` is not a valid goal anywhere else (`goalSchema` allows `cancel_subscription` and `detect_dark_patterns`; `types/agent.ts` declares only `cancel_subscription`). `state.goal` is a plain `string`, which is why TypeScript does not flag it.
- With goal `detect_dark_patterns` rule 1 fires on the very first PLAN, so that mode is "perceive, detect, verify, complete" with no clicks.

#### `agents/action.ts` — ACT

- Picks `pendingFinalAction` if the human approved, otherwise `lastAction`. `complete`/`fail` are no-ops here.
- Enforces the action budget, emits `action_started` ("Step N: click …"), records `urlBefore`, runs `executeAction`.
- After a successful click: `recordStep` in Neo4j and sets `lastClick` for the path map.
- On an exception: if it was the very first action the run fails; otherwise it emits `action_failed` "retrying" and **then also emits `action_completed` and increments `actionCount`**, so a failed action is reported as executed and the loop simply perceives and plans again (the "retry" is the next loop).
- Always clears `pendingFinalAction` and `resumeApproval`.

#### `agents/approval.ts` — APPROVAL_GATE

Inserts an `agent_approvals` row (`action_type: "final_cancellation"`, `risk_level: "high"`, `description: action.reason`, `expires_at` = now + 15 min), emits `approval_requested`, returns `status: "approval_required"`, and the graph ends. Nothing runs until `/approve` or `/reject`.

The approval lives 15 minutes but the browser session times out after 10 (`SESSION_TIMEOUT_MS`). Approving after 10 minutes still works: the runner opens a new browser at `lastUrl` and re-plans from there, but any in-page state (form contents, cookies) of the original session is gone.

#### `agents/verification.ts` — VERIFY

Perceives; `confirmed = pageState === "success" || text includes "subscription is cancelled" / "cancelled" / "cancellation confirmed"`. Calls `recordOutcome` (reward +1 or −1 to every click of the run), saves a PNG proof to `PROOFS_DIR` regardless of the result, writes its path to `cancellation_tasks.proof_screenshot_path`, emits `verification_completed`.

**Bug:** when the outcome is *not* confirmed VERIFY returns `status: "running"`, but `verify → complete` is an unconditional edge, and COMPLETE sets `status: "completed"` and emits "Task completed successfully". An unverified run therefore ends as a success in the UI, while the graph memory records it as a failure (−1).

The "cancelled" marker is very loose: any page containing the word "cancelled" (for example "Orders can be cancelled within 24 hours") counts as proof.

#### `agents/finalize.ts` — COMPLETE / FAIL

- COMPLETE emits `task_completed` and sets `completed`.
- FAIL records the run outcome (`stopped` = reward 0 when the human rejected, else `failed` = −1), emits `task_failed`.
- Neither updates `cancellation_tasks.status`, so tasks stay `running` forever (Part G).

### A2. Browser layer (`src/server/browser/`)

#### `manager.ts` — Playwright lifecycle

- One shared headless Chromium (`--no-sandbox --disable-dev-shm-usage`), launched lazily; a failed launch is cleared so the next call retries.
- `createSession(id)`: a new `BrowserContext` per session (no shared cookies), viewport 1280×800, a desktop Chrome user agent, navigation timeout 30 s, action timeout 10 s, and a hard 10-minute timer that destroys the session.
- `screenshot(url)`: preview screenshots. Cached for 60 s (max 30 entries, oldest evicted). Races two sources: its own render (`renderShot`) and a shot filed by a session that has the same page open (`captureShot`), whichever arrives first.
- `renderShot(url)`: throwaway context, media requests aborted, `domcontentloaded` (10 s) + up to 2.5 s for `load` + 400 ms, JPEG quality 72 of the first screen.
- `captureShot(page, ...urls)`: screenshot of a page a session already has open, filed under one or more URLs; errors ignored.
- `destroySession` / `killSession`: close the context and clear the timer.
- `maxPages` is accepted as an option but never used.

#### `perception.ts` — what the agent "sees"

`SNAPSHOT_SCRIPT` runs inside the page via `evaluateTrusted`:
- `text`: `document.body.innerText` with all whitespace collapsed to single spaces (so line breaks between buttons disappear; this is why the neural detector sometimes sees two button labels as one sentence).
- Elements: `button, a[href], input, select, textarea, [role='button']` that are inside the viewport, not `visibility:hidden`/`display:none`, and have text or an aria-label. Text is cut to 200, later 120 characters; the first 80 elements are kept. Elements below the fold are **not** included (only the current viewport counts as visible), which is why PLAN falls back to `scroll`.
- `box`: x/y as fractions of the viewport, width/height in pixels (mixed units; the type comment says "fractional 0..1").
- `visibleText` is capped at 12,000 characters.
- `inferPageState`: `success` if title+text contains "success" or "cancelled"; `confirmation` for "confirm", "are you sure", "final step"; `plan_selection` for "select a plan", "what would you like"; else `unknown`. `initial` is never produced. Because "cancelled" appears in many ordinary pages, `success` can be inferred wrongly, and PLAN rule 1 then ends the run immediately.

#### `actions.ts` — the only things the agent can do

`click` and `fill` use `page.getByText(target, { exact: false }).filter({ visible: true }).first()`, scroll it into view and act (5 s / 8 s timeouts). `scroll` = `window.scrollBy(600)`; `wait` ≤ 3 s; `navigate` throws by design; `request_approval/complete/fail` do nothing. Selectors are always text taken from the page, never a CSS selector from an LLM.

`getByText` with `exact: false` matches substrings, so a target like "Cancel" could click the first visible element whose text merely contains "Cancel".

#### `security.ts`

`BROWSER_LIMITS` (navigation 30 s, action 10 s, 20 navigations, `AGENT_MAX_ACTIONS` default 25) and `canNavigate` are defined but **never used**; the real limits are the hard-coded values in `manager.ts` and `MAX_ACTIONS` in `types/agent.ts`. `AGENT_MAX_ACTIONS` therefore has no effect. `evaluateTrusted` is the single `page.evaluate` entry point.

### A3. Detection (`src/server/detection/`)

#### `taxonomy.ts`

13 pattern types with label, default severity, base confidence and description: confirmshaming (high, 0.72), roach_motel (high, 0.60), forced_continuity (medium, 0.55), drip_pricing (medium, 0.55), basket_sneaking (medium, 0.50), false_urgency (medium, 0.55), misdirection (low, 0.45), nagging (low, 0.45), subscription_trap (high, 0.60), urgency (low, 0.45), hidden_costs (medium, 0.50), disguised_ads (low, 0.45), forced_action (medium, 0.50). `PATTERN_LABELS`, `patternDefinition(type)` (falls back to confirmshaming for an unknown type), `overallRisk` (highest severity, `low` when empty).

#### `classifier.ts` — `classifyPage(perception, { useLLM })`

1. **`heuristicClassify`** (always): lower-cased substring matching.
   - `GUILT_LANGUAGE` (13 phrases) → confirmshaming, high, `boost(0.72, hits)`.
   - `AUTO_RENEW` (6) → forced_continuity, medium.
   - `RETENTION_OFFER` (7) → a second forced_continuity finding (0.6 + boost); `dedupe` keeps only the first one per type, so when both fire, the auto-renew one wins.
   - `FALSE_URGENCY` (5) → false_urgency.
   - Roach motel: a `HIDDEN_CANCEL` element exists **and** a retention offer was found.
   - `boost(base, n) = min(0.99, base + 0.05·n)`.
   - Confirmshaming's `elementText` comes from the first *element* containing a guilt phrase; when the phrase is only in body text, `elementText` is `undefined` (seen in the live scan output). Such a finding is then skipped by `recordFindings` and cannot be rated on the learning page.
   - Substring matching produces obvious false positives: "free trial" fires forced_continuity on any page that offers a trial; "are you sure" fires confirmshaming on any confirmation dialog; "countdown" fires on a page about a countdown timer product.
2. **Enhancers** (skipped when `useLLM === false`, as in tests and the smoke script):
   - **Neural pass** (`neural.ts`, below) adds pattern types the rules missed.
   - **`graphContext`** from Neo4j (prior findings for this host, co-occurring patterns on other hosts, example phrases, learned phrase values).
   - **LLM pass** (`chatStructured`, temperature 0): a "conservative UI auditor" prompt listing the taxonomy and the graph hints; every finding must carry a verbatim `evidence` quote. **`isGrounded`** keeps it only if the quote appears in the page text or element labels (case and whitespace insensitive).
   - **`applyLearning`**: drops a finding whose exact `type|evidence` humans marked a false alarm (value ≤ −0.4); adds phrases humans confirmed (value ≥ 0.4) that appear on this page, confidence `0.6 + 0.35·value` capped at 0.95.
   - **`recordFindings`** writes evidence-backed findings back to Neo4j.
3. Returns `{ detections, overallRisk, graph: { prior, related } }`.

Merge order is "first finding per type wins": heuristics → neural → LLM → learned. A wrong heuristic finding therefore cannot be replaced by a better LLM finding of the same type.

#### `neural.ts` — the deep neural network (added in this session)

- Model: `Xenova/all-MiniLM-L6-v2` (6-layer transformer, 384-dim sentence embeddings, int8-quantised ONNX, ≈23 MB) run in-process by `@huggingface/transformers`; downloaded from Hugging Face on first use and cached.
- `segments(perception)`: visible text split on sentence punctuation and on " — | • · " separators, plus element labels; 8–200 characters, de-duplicated, first 200.
- Head: a softmax layer (`neural-head.json`, 4 labels × 384 weights) trained by `scripts/train-neural.ts` on the ec-darkpattern dataset (Yada et al., IEEE BigData 2022, Apache-2.0). Labels: `benign`, `false_urgency` (Urgency + Scarcity), `misdirection`, `social_proof`. 1,850 training texts, 463 held out: **94.0 % held-out accuracy** (benign 211/214, false_urgency 128/132, misdirection 39/53, social_proof 57/64).
- `neuralClassify`: one finding per pattern type, the sentence with the highest probability ≥ 0.85; `benign` and `social_proof` are never reported (no taxonomy type). Evidence is always the page sentence. Any load or inference error returns `[]`.
- Known weaknesses: trained on shopping sites, so cancellation-flow guilt ("We'd be so sad to lose you") is missed; "No thanks, cancel subscription" was flagged as misdirection at 98 % because the model learned that "No thanks, …" is usually shaming.

### A4. LLM client (`src/server/llm/client.ts`)

- `config()` reads `LLM_API_KEY`, `LLM_BASE_URL` (default OpenAI), `LLM_MODEL` (default `gpt-4o-mini`); returns null without a key.
- `chat()`: POST `/chat/completions` with optional `response_format: json_object`; throws `AgentError` on non-2xx. There is no request timeout, so a hanging provider stalls the node until the provider gives up.
- `chatStructured(schema, opts)`: JSON mode, `maxTokens` 4000 by default, swallows request errors (logs a warning), `extractJson` tolerates ```json fences, validates with Zod; any failure returns `null` and callers fall back to the rules.
- Callers: the detector (`SYSTEM_DETECTOR`) and the planner (`PLAN_SYSTEM`).

### A5. Knowledge graph & learning (`src/server/graph/neo4j.ts`)

Optional: without `NEO4J_URI` every function is a no-op. Driver options: 3 s connection timeout, 3 s retry time, plain JS numbers. **Any** failed query sets `downUntil = now + 60 s`, during which every call returns null (one slow query switches the whole graph off for a minute).

Schema:

```
(:Site {host})-[:EXHIBITS {count, evidence, confidence, lastSeen}]->(:Pattern {type, label, description, severity})
(:Site)-[:SHOWS]->(:Indicator {phrase, source})-[:INDICATES {value, n}]->(:Pattern)
(:Run {id, goal, status, startedAt, endedAt, reward})-[:ON]->(:Site)
(:Run)-[:TOOK {order, path}]->(:Action {label})
(:Site)-[:HAS_PAGE]->(:Page {key = host+path, host, path, state, title, entry})-[:LEADS_TO {click, count, lastSeen}]->(:Page)
(:Site)-[:POLICY {path, value, n}]->(:Action)
```

| Function | Called by | What it does |
|---|---|---|
| `graphContext(url, types)` | classifier | 4 parallel queries: `prior` (top 10 EXHIBITS for this host by count), `related` (patterns other hosts show with these, top 5), `examples` (3 phrases per pattern, ordered by how many sites show them), `learned` (up to 500 phrases with a value) |
| `recordFindings(url, detections)` | classifier | MERGE site, pattern, EXHIBITS (count+1), indicator phrase, INDICATES, SHOWS |
| `rewardFinding(type, evidence, ±1)` | `/api/graph/feedback` | `value += 0.5·(reward − value)`, `n += 1` on INDICATES |
| `recordStep(runId, goal, url, order, label)` | ACT | Run node, TOOK edge with the page path |
| `recordPage(url, state, title, {entry, from})` | PERCEIVE | Page node, HAS_PAGE, LEADS_TO from the previous page labelled with the click |
| `routeToSuccess(url)` | PLAN | `shortestPath` (≤10 hops) to any `state:"success"` page on the same host |
| `recordOutcome(runId, goal, url, status)` | VERIFY, FAIL | sets run status; for verified (+1) or unverified/failed (−1), once per run (`r.reward IS NULL`), updates `POLICY.value` for every click the run took |
| `learnedSteps(url)` | PLAN | POLICY values for this host + path |
| `graphSnapshot()` | `/api/graph` | up to 400 nodes and 1,500 relationships |
| `learningSnapshot()` | `/api/graph/learning` | unrated/rated phrases, click values, run outcome counts |
| `siteRanking()` | `/api/graph/sites` | per host: patterns, cancel runs, verified runs, shortest route from an entry page to a success page, then `trapScore` |
| `seedGraph(indicators)` | `scripts/seed-graph.ts` | 6 uniqueness constraints + taxonomy + heuristic phrases |

Learning details and quirks:
- `ALPHA = 0.5`, so one reward moves a value half-way: a single "false alarm" vote takes a new phrase to −0.5, past the −0.4 threshold. One click of a button changes detector behaviour for every future scan, for every site.
- Because the page key ignores the query string, a site whose flow lives in `?step=` parameters collapses into one page (noted in a `ponytail:` comment).
- Rewards are credited to every click of a run equally (no discounting), and only verified/unverified outcomes count, so the "reinforcement learning" is a running average of run outcomes per (host, path, click label).
- `siteRanking` uses the severity of the pattern *type*, not of the individual finding.

### A6. Security (`src/server/security/`)

- **`ssrf.ts` `validateTargetUrl`**: only http/https, no user:password, loopback hostnames and literal private IPs rejected, DNS resolved and every address checked. In dev (`SUPABASE_DEV_MODE !== "false"` and not on Vercel) loopback and private targets are **allowed** (so the StreamVault demo on localhost works). Gaps: DNS failures are ignored (the URL passes); the check happens once before navigation, so redirects, later DNS answers (rebinding at connect time), and every page the agent clicks through to are never re-checked. `validateTargetUrlSync` is only used by tests.
- **`rate-limit.ts`**: in-memory sliding window per user and bucket: `agentStart` 10/h, `scanner` 30/h, `feedback` 120/h, `approval` 20/h; unknown bucket = 60/min. Pruned every 5 minutes. `rateLimitHeaders` is never used. The screenshot route shares the `scanner` bucket, so preview images eat into the 30 scans per hour.
- **`idempotency.ts`**: `Idempotency-Key` support for `agent/start` and `POST /cancellations`. It relies on a database unique constraint (`23505`), which the in-memory store does not have, so `reserveKey` always succeeds and the "duplicate request" branch can never fire. A cached response still short-circuits replays once `storeResponse` has run.
- **`errors.ts`**: `AppError` with status, code and `expose`; subclasses for 401, 403, 404, 422, 409, 429 and agent/browser/verification 500s. `errorBody` never includes a stack.
- **`validation.ts`**: Zod schemas, all `.strict()`. `targetUrlSchema` adds `https://` when the scheme is missing. `goalSchema` = `cancel_subscription | detect_dark_patterns`. `approvalActionSchema`, `idParamSchema` are not used by any route.
- **`audit.ts`**: `makeRequestId`, `sanitizeMetadata` (recursive key-name redaction, arrays not inspected), `logEvent` (JSON line to stdout), `persistAudit` (hashed IP) — `persistAudit` and `makeRequestId` are never called, so no audit rows are written.

### A7. Data layer (`src/server/supabase/`, `src/server/db/`)

**There is no Supabase at runtime.** `admin.ts` and `server.ts` both return `createDevClient()`, the in-memory store; `@supabase/supabase-js` is only used for its TypeScript types (`DbClient`). Older docs (including `DEEP_RESEARCH.md`) describe a Supabase / Google OAuth mode that was removed in commit `1c9e485 Remove login`.

- **`dev-store.ts`**: a module-level `Map<table, rows[]>` implementing `select/insert/update/eq/in/lt/gte/order/limit/single/maybeSingle/then`. Inserts get an id (`<table>_<uuid>`) and `created_at`. Consequences:
  - All data is lost on every server restart (and on dev hot-reloads of this module).
  - No constraints, foreign keys, defaults, triggers or RLS: `requested_at`, `expires_at` defaults, `updated_at` triggers and unique keys from the SQL migrations do not exist.
  - `update` only sets `updated_at` the first time (afterwards the field already exists).
  - `select("*, agent_sessions(*)")` returns the plain row; joins are not supported.
  - `order` uses `localeCompare` on strings (fine for ISO timestamps, wrong for numbers).
  - Single-process only: it would not work across several server instances.
- **`DEV_USER_ID = "dev_user_001"`**, `DEV_USER_EMAIL = "demo@trapkiller.dev"`.
- **`types.ts`**: `DbClient = SupabaseClient<Database, "public", …>`.
- **`db/queries.ts`**: `getSessionOwned`, `listSessionsOwned` (unused), `listSessionDetections`, `listSessionEvents` (oldest first, 200), `listActivity` (newest first, keyset cursor on `created_at`, optional status/agent/date filters, then a second query to attach the session's host as `website`), `getApprovalOwned` (unused). The "owned" names come from the RLS era; with the dev store there is no ownership filter in `getSessionOwned`.
- **`db/approvals.ts` `transitionApproval`**: checks owner, `pending`, not expired (marks it `expired` if so), session owned and `approval_required`; then sets the approval to the decision and the session to `running`. It is a read-then-write sequence with no lock, so two simultaneous approve calls can both pass.

### A8. Auth, API wrapper, queue, proxy

- **`auth/guards.ts`**: `requireUser()` always returns the demo user. There is no sign-in; anyone who can reach the server acts as that user.
- **`api/handler.ts`**: `api(handler)` maps `AppError` to its status + body; anything else is logged and returned as a generic 500. `jsonOk` wraps `NextResponse.json`.
- **`queue/runner.ts`**: `JobQueue` with `MAX_CONCURRENCY = 2`; errors are logged; `drain()` for tests. Queued jobs live in memory and are lost on restart; a run that was in progress is left `running` forever.
- **`src/proxy.ts`** (Next 16's replacement for middleware): CORS for `/api/*`; allowed origins from `CORS_ORIGIN` (default `http://localhost:3000`); answers `OPTIONS` with 204 and the allowed methods and headers.

---

## Part B — The REST API (`src/app/api/`)

Every route is `runtime = "nodejs"`, `dynamic = "force-dynamic"`, wrapped in `api()` and calls `requireUser()` (always the demo user), except `/api/health`.

| Route | Method | What it does | Notes |
|---|---|---|---|
| `/api/health` | GET | `{ ok, service, ts }` | no auth |
| `/api/scanner/analyze` | POST `{url}` | rate limit `scanner`; SSRF check; new browser session `scan_<uuid>`; `goto` + 1.2 s wait; perceive; `captureShot`; `classifyPage`; insert findings (no session id); return `{url, title, overallRisk, patternsDetected, detections[]}`; always destroys the browser | read-only, never clicks |
| `/api/scanner/screenshot?url=` | GET | rate limit `scanner`; SSRF; `browserManager.screenshot`; JPEG, `private, max-age=60` | a missing `url` throws a plain `Error` → 500 instead of 422 |
| `/api/agent/start` | POST `{goal, targetUrl}` | rate limit `agentStart`; idempotency key; validate; SSRF; insert `cancellation_tasks` (running) and `agent_sessions` (running, stage perception); emit `session_started`; `enqueueStart`; 202 `{sessionId, taskId, status}` | the task's `agent_session_id` is **never set** |
| `/api/agent/[id]` | GET | session + its detections | `ownedBy` field echoes the user id |
| `/api/agent/[id]/events` | GET | session events, oldest first (max 200) | no ownership check at all |
| `/api/agent/[id]/proof` | GET | newest `proof_<id>_*.png` in `PROOFS_DIR` | 404 until VERIFY ran |
| `/api/agent/[id]/approve` | POST | rate limit `approval`; newest approval of the session; `transitionApproval(approved)`; emit `approval_granted`; `enqueueResume(approved)` | no approval → plain `Error` → 500 instead of 404 |
| `/api/agent/[id]/reject` | POST | same with `rejected`; emits `approval_rejected` with status `cancelled`; resume → the graph re-perceives, re-detects, re-plans and then routes to FAIL | |
| `/api/agent/[id]/stop` | POST | 409 if already terminal; set `cancelled`, insert `task_cancelled` event, kill the browser | does not update the cancellation task |
| `/api/cancellations` | GET | up to 100 tasks, newest first | `sessionId` is always `null` (see above) |
| `/api/cancellations` | POST | a copy of `agent/start` (only the event message differs) | duplicated code |
| `/api/cancellations/[id]` | GET | task + session (never found) + approvals by `task_id` | |
| `/api/cancellations/[id]/stop` | POST | sets the task `cancelled`; would stop the session, but `agent_session_id` is never set, so **the agent keeps running** | |
| `/api/activity` | GET `?limit&cursor&status&agent&date` | `listActivity` | the route reads `website` from a non-existent `agent_sessions` join and ignores the `website` field `listActivity` already computed, so **`website` is always `null`** |
| `/api/profile` | GET / PATCH | read / update the `profiles` row | the dev store never creates a profile row, so GET returns the email only and PATCH changes nothing and returns nulls |
| `/api/graph` | GET | `graphSnapshot()` | |
| `/api/graph/feedback` | POST `{patternType, evidence, correct}` | rate limit `feedback`; `rewardFinding` → `{learned, value}` | |
| `/api/graph/learning` | GET | `learningSnapshot()` | |
| `/api/graph/sites` | GET | `siteRanking()` | |

The README also lists `/api/auth/me` and `/api/auth/signout` via `DEEP_RESEARCH.md`; those routes do not exist any more.

### B1. One agent run, end to end

1. The agent page calls `POST /api/agent/start` → task + session rows → `session_started` event → job queued → 202.
2. The queue calls `runToCompletion`: browser context, navigate to the target.
3. Loop: PERCEIVE (screenshot, path map) → DETECT (findings saved) → PLAN.
4. On `/account` PLAN finds the "Cancel subscription" link (rule 3) → ACT clicks it → the link goes straight to `/confirm` (the `/plan` retention page is not on this path, see F1) → PERCEIVE, DETECT → PLAN on `/confirm` finds "Yes, cancel my subscription", which matches `FINAL_CONFIRM` → `pendingFinalAction` → APPROVAL_GATE inserts an approval row → graph ends, browser kept open.
5. The browser UI polls `GET /api/agent/[id]` and `/events` every 1.5 s, sees `approval_requested`, shows the approval modal.
6. Approve → `transitionApproval` → `enqueueResume` → the graph restarts at PERCEIVE (same browser page) → DETECT again → PLAN (now approved, returns the click) → ACT runs the parked action → PERCEIVE on `/success` → PLAN rule 1 → `completed` → VERIFY (proof screenshot, +1 reward) → COMPLETE → browser destroyed.
7. The poller sees a terminal status, stops, shows the proof (`/api/agent/[id]/proof`).

---

## Part C — Client-side library (`src/lib/`, `src/stores/`, `src/types/`)

### C1. Two type systems that do not match

The server and the browser each have their own vocabulary, and a mapping layer joins them.

| Concept | Server (`src/types/`, DB) | Client (`src/lib/types.ts`) |
|---|---|---|
| Pattern types | 13, `snake_case` (`false_urgency`, `roach_motel`, …) | 7, `kebab-case` (`roach-motel`, …, plus `hard-to-cancel`, which the server does not have) |
| Session status | `running, approval_required, completed, failed, cancelled` | `AgentStatus`: `idle, running, completed, blocked, failed` |
| Confidence | 0–1 | 0–1 from the API, but the demo data uses 0–100 (`confidence: 94`) |

`PATTERN_TYPE_MAP` (in `agentService.ts`) maps only 7 server types; **every other type falls back to `"hard-to-cancel"`**. So false urgency, urgency, nagging, subscription trap, hidden costs, disguised ads and forced action are all shown in the UI as "Hard to Cancel". This includes the neural detector's `false_urgency` findings and most LLM findings.

`src/types/api.ts` (an "API contract" with `ApiEvent`, `ScannerResponse`, `Paginated`, …) is **not imported anywhere**; each service file declares its own copy of the response shapes instead (and `ApiEvent.id` is typed `number` although ids are strings).

### C2. `api.ts`

- `BACKEND_URL` = `NEXT_PUBLIC_API_URL` or same origin.
- `demoTargetUrl()` = `<origin>/demo-target/account`.
- `request()` always sends JSON with `credentials: "include"` and `cache: "no-store"`; a network failure becomes `ApiError(…, 0, "NETWORK_ERROR")`; a non-2xx body's `{error: {code, message}}` becomes `ApiError`.
- `api.get/post/patch`; `isUnauthed(err)` (401) is left over from the login era.

### C3. `services/agentService.ts` — talking to a live agent run

- `startAgentRun`, `fetchSession`, `fetchEvents`, `approveSession`, `rejectSession`, `stopSession`: thin wrappers over the routes.
- `mapEvent` (unknown agent → `planning`; status mapped to `running/success/warning/error`), `mapDetection`, `mapSessionStatus` (`approval_required` and `cancelled` both become `blocked`).
- **`startPolling(sessionId, onDone, 1500 ms)`**: every 1.5 s fetches the session and all its events, then:
  - derives each pipeline stage's state from which event types exist (`perception_completed`, `detection_completed`, `goal_reached`/`planning_completed`, `action_completed`, `task_completed`); `planning_completed` is never emitted by the server.
  - sets the browser preview from `session.targetUrl`, which never changes during a run, so the preview "screen" is `account` until the run completes, then `success`.
  - appends events it has not seen, replaces the pattern list with the session's detections, sets `approvalRequired` when the session is `approval_required`.
  - on `completed` builds a `VerificationResult` with the fixed text "Investigation verified" and method "DOM & dark pattern classification" (also for a cancellation), and stops.
  - **any single failed request stops polling for good** (`catch { finish() }`), so one network blip freezes the live view.
  - Polling refetches every event every 1.5 s (no cursor); the server caps the list at 200, so a long run stops showing new events after 200.

### C4. `services/scannerService.ts`

`scanUrl(url)` → `POST /api/scanner/analyze` → maps detections to `DarkPattern` (with a `feedback` object when there is evidence, so the user can rate it), builds a fake `PerceptionData` from the detections themselves (elements without boxes), and a `RiskOverview` (`critical` count, `warnings` = high + medium). It also re-declares `ElementPosition` and `PerceptionData`, which already exist in `lib/types.ts`.

### C5. `services/taskService.ts`

`fetchTasks` and `fetchActivity` **silently fall back to demo data** (`demoTasks`, `demoActivity`) when the API call fails, contrary to the "must NOT be used in the real flow" warning in `data.ts`. `mapTask` hard-codes `plan: "Subscription"`, `price: "—"`, `patternCount: 0`. `startCancellation`, `stopTask`, `summarizeTasks` (counts `approval` and `blocked`, which `mapTask` never produces).

### C6. `services/simulator.ts` — the scripted demo

`DemoSimulator` replays a fixed 15-step story into the same Zustand store the real agent uses: perception → detection (roach motel, confirmshaming) → planning → action → retention trap → final confirmation → approval pause (a step with `delayMs: -1`) → submit → verified with proof `proof_7f3a9c21`. Supports `start, pause, resume, stop, reset, skipToApproval, approve, stopAgent`. Used by the `/demo` page and the approval modal.

Notes: its browser states use `https://www.netflix.com/account`, although `DEMO_SERVICE` in `constants.ts` says "Uses a fictional service — not any real brand"; it claims a verification method of "Cancellation confirmation page + email header check", which nothing in the project does; confidences are on a 0–100 scale.

### C7. `data.ts`

Demo patterns, tasks, activity, risk, scanner history, a re-export of `demoSimulator`, and **copies of eight helpers that also exist in `utils.ts`** (`formatTime`, `formatTimestamp`, `shortId`, `nowIso`, `uid`, `maxSeverity`, `severityTone`, `agentTone`, `normalizeUrl`, `hostnameOf`).

### C8. Small modules

- **`constants.ts`**: agent labels, `PIPELINE_ORDER`, client `PATTERN_LABELS`, severity and status labels, `DEMO_SERVICE` ("StreamFlow", ₹549/month; the real test site is called StreamVault and charges ₹649).
- **`navigation.ts`**: sidebar sections — Workspace (Overview, Agent, Scan a page, Cancellations, Activity, Knowledge graph, Learning, Site ranking) and System (Privacy & safety, Settings). `/demo` is not in the menu.
- **`trap-score.ts`**: `trapScore({severities, cancelClicks, cancelRuns, verifiedRuns})` → `score` 0–100 = patterns (5/10/20/30 per low/medium/high/critical, max 60) + exit (10 per click beyond the first, max 30) + failures (10 × share of runs not verified); level `high` ≥ 50, `medium` ≥ 20. A route of 0 clicks and "never measured" both give exit 0.
- **`graph-layout.ts`**: deterministic Fruchterman–Reingold layout (golden-angle spiral start, 300 iterations, stronger gravity for unlinked nodes, fit to canvas, then up to 80 rounds pushing overlapping circles apart). O(n²) per iteration.
- **`utils.ts`**: `cn` (clsx + tailwind-merge), time formatting (`en-GB`), `shortId`, `uid` (`Math.random`), `maxSeverity`, `severityTone`/`agentTone` (Tailwind classes), `normalizeUrl` (adds https, strips the trailing slash), `hostnameOf` (strips `www.`).

### C9. `stores/agent-store.ts`

One global Zustand store for "the" live session: `task, status, stageStates, events, decision, patterns, browser, approvalRequired, verification, live` with setters, `startSession` and `resetSession`. Because it is global, the real agent (via `startPolling`) and the demo simulator write into the same store; running both would mix their events.

### C10. `types/agent.ts` and `types/database.ts`

- `types/agent.ts`: `InteractiveElement`, `PerceptionResult` (`pageState` includes `initial`, never produced), `DarkPatternDetection`, `DetectionResult`, `AgentAction`, `VerificationResult`, `AgentGraphState` (a typed mirror of the LangGraph state that is **not used** by the graph, which has its own looser annotation), constants `MAX_ACTIONS = 25`, `APPROVAL_TTL_MS = 15 min`, `SESSION_TIMEOUT_MS = 10 min`. `AgentGoal` is only `"cancel_subscription"` although `detect_dark_patterns` is accepted by the API.

---

## Part D — The database schema (`supabase/`) and `types/database.ts`

**Important:** none of this is used at runtime today. The app stores everything in the in-memory dev store (A7). The SQL files describe the schema the app was built for and would need again if Supabase were reconnected; `types/database.ts` (hand-maintained, 431 lines) mirrors it and is what gives the dev-store queries their TypeScript types.

### D1. `001_initial_schema.sql` — enums and tables

Enums: `agent_status` (idle, running, approval_required, completed, failed, cancelled), `agent_stage` (5 stages), `pattern_type` (the 13 taxonomy types), `severity`, `event_type` (25 values, of which the code emits 15: `session_started, stage_started, perception_completed, detection_completed, goal_reached, action_started, action_completed, action_failed, approval_requested, approval_granted, approval_rejected, verification_completed, task_completed, task_failed, task_cancelled`), `task_status`, `approval_status`, `action_type` (`final_cancellation`).

| Table | Key columns | Notes |
|---|---|---|
| `profiles` | `id` → `auth.users` | name, avatar, email |
| `agent_sessions` | uuid id, `user_id`, goal, status, current_stage, target_url, `state jsonb`, started/completed, error_message | one agent run |
| `agent_events` | bigint identity id, session_id, user_id, agent, event_type, message, status (free text), metadata | event log |
| `dark_pattern_detections` | bigint id, nullable session_id, pattern_type, severity, `confidence numeric(5,4)` checked 0–1, element text/role, explanation, screenshot_path, source_url | evidence |
| `cancellation_tasks` | uuid id, `agent_session_id`, service_name, target_url, status, requested/started/approval_requested/approved/completed timestamps, failure_reason, proof path | user-facing task |
| `agent_approvals` | uuid id, session_id, task_id, action_type, description, risk_level, status, requested/responded/expires | human gate |
| `audit_logs` | user, session, action, resource, `ip_hash`, user_agent, metadata | never written by the app |
| `idempotency_keys` | `key` primary key, user_id, response | |

Grants: `anon` and `authenticated` can `select` every table; `authenticated` can insert/update/delete everything; RLS (002) narrows that.

### D2. `002_rls.sql` — row-level security

Every table has RLS on, with `auth.uid() = user_id` policies. Notable design points: `agent_approvals` has **no update policy** for users (only the server can flip an approval); `dark_pattern_detections` has no update/delete (evidence is write-once); `audit_logs` is read-only for users. Inconsistency: `agent_events` **does** have an `events_update_own` policy, so users could rewrite their own event log, contradicting the "append-only" description elsewhere.

### D3. `003_indexes.sql`

24 indexes on `user_id`, `status`, `created_at desc` and the composite access paths (`(user_id, status)`, `(session_id, created_at desc)`, `(session_id, pattern_type)`). `profiles_id_idx` duplicates the primary-key index.

### D4. `004_functions_triggers.sql`

`handle_new_user` (creates a profile on sign-up from Google metadata), `set_updated_at` triggers on profiles, sessions and tasks, `expire_pending_approvals()` (meant for pg_cron, never scheduled), and `agent_events` added to the Realtime publication (the UI polls instead of subscribing).

### D5. `005_storage.sql`

A private `agent-proofs` bucket with per-user folder policies and `delete_expired_proofs()`. The app never uses Supabase Storage (proofs are PNG files on local disk). The insert policy references a column `bulk_extension_name`, which does not exist on `storage.objects` in Supabase, so this migration would most likely fail as written.

### D6. `seed.sql`, `config.toml`

- The seed inserts a profile, a completed session, a task, three detections and seven events for user `…d001`. Because `profiles.id` and every `user_id` reference `auth.users`, and the seed does not create that auth user, `supabase db reset` would fail on the foreign keys unless the user is created first.
- The app's `DEV_USER_ID` is `"dev_user_001"`, which is not a UUID; it would be rejected by every `uuid` column if Supabase were reconnected.
- `config.toml`: local ports 54321–54324, Postgres 15, email sign-up without confirmation, Google OAuth enabled with empty credentials, 5 MB storage limit, Realtime on.

### D7. `types/database.ts`

Hand-written to match 001 (despite the header saying it is generated by `npm run db:types`). Exports the enum unions, `Database` (Row/Insert/Update for each table, empty `Relationships`, so typed joins are not possible — which is why `listActivity` does two queries) and `Tables/TablesInsert/TablesUpdate` helpers.

---

## Part E — The user interface (`src/app/`, `src/components/`)

### E1. Layout and navigation

- **`app/layout.tsx`**: fonts Geist, Geist Mono and Bricolage Grotesque (display), SEO and Open Graph metadata (`locale: en_IN`), `metadataBase` from `NEXT_PUBLIC_APP_URL` or the Vercel production URL, and a "Skip to main content" link.
- **`app/(app)/layout.tsx`**: wraps every app page in `AppShell` and marks the app `noindex`.
- **`components/layout/AppShell.tsx`**: desktop sidebar, mobile drawer, a page-enter spring animation keyed by route, `⌘K / Ctrl+K` for the command palette, `MotionConfig reducedMotion="user"`, and the global **`ApprovalModal`** (so an approval prompt can appear on any page).
- **`Sidebar.tsx`**: dark sidebar built from `NAV_SECTIONS`, a gliding active-page highlight, an amber dot on "Agent" when the store status is `blocked`, a status card ("Agent is working / Waiting for your approval / …") and a "Watch a demo run" link.
- **`MobileNav.tsx`**: a slide-in drawer in an older light style; shows a hard-coded fictional user "Aarav Kapoor · aarav@trapkiller.app", which matches neither the demo user (`demo@trapkiller.dev`) nor anything the API returns.
- **`CommandPalette.tsx`**: Radix dialog, filters page labels, Enter opens the first match; arrow-key navigation is not supported; the `label.includes("Scanner")` icon check never matches (the label is "Scan a page").

### E2. Pages

| Route | File | What it shows | Data source | Notes |
|---|---|---|---|---|
| `/` | `app/page.tsx` | Marketing landing page: hero with animated `HeroCase`, regulator figures (ICPEN 2024 sweep 75.7 % of 642 sites; India's CCPA guidelines naming 13 dark patterns, Nov 2023; Amazon's $2.5 B FTC settlement, 2025), how it works, what it catches, comparison table, safety promises, GitHub link | static | Some claims are stronger than the code: "Checks every page against 13 known tricks" (the rules cover 4 types and the neural head adds misdirection; the rest only with an LLM key or learned phrases); "No quote from the page, no finding" (heuristic confirmshaming findings can have no quote) |
| `/dashboard` | `(app)/dashboard/page.tsx` | URL box that deep-links to the scanner, agent status card, 4 counters, latest 6 events, a 4-item watchlist | Zustand store only | Counters reset on reload; nothing comes from the server |
| `/scanner` | `(app)/scanner/page.tsx` | URL form (or `?url=` deep link), live screenshot in a browser frame, fake 4-step progress (advances every 700 ms regardless of the server), verdict ("Looks clean" / risk word), findings with "Why it's a trap" and "See evidence", "Hand it to the agent" | `scanUrl`, `LiveShot` | Every failure (rate limit, SSRF rejection, timeout) shows the same "couldn't be scanned" text |
| `/agent` | `(app)/agent/page.tsx` | Start form (pre-filled with StreamVault), case track (5 stages), "Cancellation confirmed" banner with the proof screenshot, live preview, caught traps, case log | `startCancellation` + `startPolling` | See notes below |
| `/tasks` | `(app)/tasks/page.tsx` | Cancellation tasks: 4 counters, tabs Active / Approval / Completed / Failed | `fetchTasks` (falls back to demo data) | Tasks never leave `running` (Part G); "View" links go to `/agent`, not to the task's session; banners mention "the backend on port 3001", a leftover from when the API was a separate server; `loadError` can never be set because `fetchTasks` never throws |
| `/activity` | `(app)/activity/page.tsx` | Event timeline grouped by day, client-side search and agent/status filters | `fetchActivity` (last 50) | Website is always "unknown" (Part B); events without an agent (approvals, stops) are dropped; `running` events are shown as "Warning"; the server-side filters and cursor are never used |
| `/graph` | `(app)/graph/page.tsx` | Interactive SVG of the Neo4j graph: legend doubles as type filter, hover highlights neighbours, click opens a details panel; labels placed to avoid overlap | `/api/graph` | Layout recomputed on the main thread whenever a filter changes (O(n²)·300 for up to 400 nodes) |
| `/learning` | `(app)/learning/page.tsx` | Findings awaiting a verdict ("Yes, a trick" / "No, false alarm"), learned wordings and click scores, run counts | `/api/graph/learning`, `/api/graph/feedback` | Clear "off"/"down" states for Neo4j |
| `/sites` | `(app)/sites/page.tsx` | Sites ranked by trap score with the score breakdown, tricks with evidence, shortest cancel route, attempts | `/api/graph/sites` | Explains the score formula on the page |
| `/security` | `(app)/security/page.tsx` | Static "Privacy & safety" explainer | static | Several statements are not true of the code (Part H) |
| `/settings` | `(app)/settings/page.tsx` | Profile name, detection sensitivity, toggles, evidence retention, demo link, danger zone | local state only | **Nothing is saved**: every "Save changes" button waits 800 ms and shows "Saved"; the sensitivity setting and toggles are not read anywhere; "Reset" in the danger zone only closes itself; `/api/profile` is never called |
| `/demo` | `(app)/demo/page.tsx` | Scripted simulator run with pipeline, event stream, decision card, detection overlay and proof viewer; Start/Pause/Resume, Skip to approval, Reset | `demoSimulator` | Not in the sidebar menu (linked from the sidebar card and the palette) |
| `/cancel` | `app/cancel/page.tsx` | A standalone, client-only 3-step "Cancel Subscription" mock (confirm → reason → final) | static | Not linked from anywhere and not used by the agent; appears to be an earlier test page |

**Agent page details (`/agent`)**
- The goal is guessed from the URL: if it contains `demo-target` or `cancel` the run is `cancel_subscription`, otherwise **`detect_dark_patterns`**, which never clicks anything. So "Hand it to the agent" from the scanner on a real site like `example.com/account` only re-detects, despite the button text "The agent walks the cancel flow".
- It starts runs through `POST /api/cancellations` (not `/api/agent/start`); `startAgentRun` in `agentService.ts` is unused.
- `?session=<id>` resumes watching a run; `?url=` auto-starts one.
- When the store status is `completed` the green "Cancellation confirmed · Verified" banner is shown, also for a look-only `detect_dark_patterns` run and for a run whose VERIFY did not confirm anything (A1).
- A cancelled session maps to `blocked`, so a run stopped from elsewhere shows "waiting for your approval".
- Trap names use the client `PATTERN_LABELS`, so most types read "Hard to Cancel" (C1).

**The live preview never moves.** `startPolling` sets `browser.url` to `session.targetUrl`, which is the starting URL and never changes. `PagePreview` renders any http(s) URL through `LiveShot`, an `<img>` of `/api/scanner/screenshot?url=<start url>` keyed by that URL, so it loads once and keeps showing the first page while the agent moves on through the flow.

**The demo hits a real website.** The simulator's browser states use `https://www.netflix.com/account`. Because `PagePreview` renders every http(s) URL with `LiveShot`, the `/demo` page asks the server to screenshot the real netflix.com instead of showing its built-in "StreamFlow" mock screens (which are only shown for non-http URLs, i.e. never). It also spends the `scanner` rate limit.

### E3. Components

| Component | Used by | Purpose / notes |
|---|---|---|
| `agent/ApprovalModal` | AppShell (global) | Fixed overlay when `approvalRequired`: pending action, what will happen, irreversibility warning; **Approve** calls `approveSession` (or the simulator); **"Reject — Stop Agent" calls `stopSession`, not `rejectSession`**, so the `/reject` route is never used by the UI: a rejection marks the session `cancelled`, leaves the approval row `pending`, and records no "stopped" outcome in the graph. Escape is blocked but focus is not actually trapped (the comment says "Trap focus"). The title always says "Cancel <service>", even for other actions. |
| `agent/AgentDecision` | agent, demo | goal / state / next action / reason card with a reversible/irreversible note. The real agent never sets `decision` in the store, so on `/agent` it only appears for the simulator. |
| `agent/AgentPipeline`, `agent/AgentEventStream` | demo only | animated 5-stage pipeline and event list |
| `agent/AgentStatus` | MobileNav | status pill |
| `browser/BrowserFrame` + `BrowserToolbar` | agent, demo | fake browser chrome; typing a URL overrides the preview locally until the agent's URL changes; Back/Forward disabled, Reload does nothing; always shows a green "Secure" lock, even for `http://localhost` |
| `browser/PagePreview` (`LiveShot`, StreamFlow mock screens) | BrowserFrame, scanner | see E2 |
| `browser/DarkPatternHighlight` | PagePreview mocks | clickable badge "label · NN%" |
| `scanner/EvidenceDrawer` | scanner | finding details and "Is this really a dark pattern?" rating (→ `/api/graph/feedback`). **Bug:** the confidence word uses `confidence >= 80 ? "High" : >= 60 ? "Medium" : "Low"`, but real confidences are 0–1, so every real finding is labelled "Low". Severity colours are inconsistent with the rest of the app (medium is green, high is amber). |
| `scanner/DetectionOverlay` | demo | side panel for a clicked mock pattern |
| `cancellation/ProofViewer` | demo | "Cancellation Verified" card with a hard-coded `netflix.com/account` thumbnail; the "View Proof" button does nothing |
| `landing/HeroCase` | landing | looping animation: mark traps → pause at the final click → approve → stamp "closed"; honours reduced motion |
| `ui/case.tsx` | many | the "case file" design language: `Marker` (highlighter sweep on scroll into view), `Window` (browser chrome), `PageHeader`, `Stamp`, `CountUp` |
| `ui/confidence-bar` | scanner, drawers | accepts 0–1 or 0–100 |
| `ui/*` (button, card, dialog, avatar, separator, skeleton, switch, severity-badge, status-dot, tooltip) | various | shadcn-style primitives on Radix + `class-variance-authority`. `ui/input.tsx` and `ui/badge.tsx` are unused; of `tooltip.tsx` only `TooltipProvider` is used. |

### E4. Styling (`globals.css`)

Tailwind v4 `@theme inline` tokens: background `#f4f5f2`, foreground navy `#151a2d`, brand `#2f3f95`, highlighter yellow `marker #ffe15a`, danger/warning/success with soft variants; the `zinc-*` and `blue-*` scales are redefined to warm greys and the brand blue, so old `zinc`/`blue` class names pick up the brand automatically. Keyframes for overlays, dialogs, pulses and scans, a skip-link, and a `prefers-reduced-motion` block. There is no dark theme. Two visual styles coexist: the newer "case file" pages (dashboard, scanner, agent, learning, sites, graph) and older card-grid pages (tasks, activity, settings, security, demo, mobile nav).

---

## Part F — Test site, tests, scripts, docs, configuration, video

### F1. StreamVault test site (`src/app/demo-target/*/route.ts`)

Four route handlers return self-contained HTML (inline CSS, no external assets, `no-store`):

| Page | Title | Planted patterns | Links |
|---|---|---|---|
| `/account` | "Account & Membership" | auto-renew warning (forced continuity), big "Keep my benefits" button (misdirection), tiny low-contrast "Cancel subscription" link (roach motel), footer "We'd hate to see you go" (confirmshaming) | "Keep my benefits" → `/plan`; **"Cancel subscription" → `/confirm`** |
| `/plan` | "Wait, don't go!" | save offer "1 month FREE — we'll pause, not cancel", "Offer expires soon", "renew automatically" | "Keep my benefits" → itself; "No thanks, cancel subscription" → `/confirm` |
| `/confirm` | "Confirm cancellation" | "Last chance: keep your plan for 1 month free", big "I don't want to lose my benefits" vs ghost "Yes, cancel my subscription" | big button → `/plan`; ghost → `/success` |
| `/success` | "Your subscription is cancelled" | none ("Auto-renew: Disabled", confirmation SV-2026-0916-CX) | — |

The agent's real path is **account → confirm → (approval) → success**: two clicks. The `/plan` retention page is only reached if something clicks "Keep my benefits" — `README.md` and `DEEP_RESEARCH.md` describe the flow as account → plan → confirm → success, which is not what the links do.

### F2. Tests (`tests/`, Vitest, node environment, forks pool, 30 s timeout)

10 files, **74 tests, all passing** (the README still says "52 tests, 4 failing", which is out of date).

| File | Covers |
|---|---|
| `agent-graph.test.ts` (12) | both routers; graph wiring with stub nodes: happy path, human stop aborts before a node, pause at approval, final action executed on resume |
| `approval.test.ts` (5) | `transitionApproval`: approve, wrong owner, not pending, expired, session not paused |
| `classifier.test.ts` (11) | heuristics, `overallRisk`, `classifyPage` without enhancers, `isGrounded`, `applyLearning` |
| `neural.test.ts` (4) | sentence splitting, reporting with a fake embedder/head, unreported labels and threshold, model failure → `[]` |
| `planning-route.test.ts` (4) | `planNode` with a mocked path map: approval before the last click, click after approval, follow route, no route → no click |
| `security-ssrf.test.ts` (19) | private IPv4/IPv6 ranges, protocol and credential checks, production vs dev mode |
| `validation.test.ts` (9) | Zod schemas, https prefix, strict mode, idempotency key length |
| `rate-limit.test.ts` (3), `trap-score.test.ts` (4), `graph-layout.test.ts` (3) | as named |

Not covered: VERIFY → COMPLETE for an unverified page, the runner and queue, every API route, perception/actions against a real page, the dev store, the Neo4j queries, the client services and mappings, and all UI.

### F3. Scripts (`scripts/`)

| Script | npm | Notes |
|---|---|---|
| `smoke-agent.ts` | `npm run smoke` | Drives perceive → classify (rules only) → plan → act on the test site until `success`, ≤12 steps. It has **its own copy** of the planner's phrase lists and does not use the approval gate, so it can pass while the real planner is broken (or vice versa). Its header says "backend dev server on :3001", but it defaults to 3000. |
| `seed-graph.ts` | `npm run graph:seed` | loads `.env.local`, creates constraints, seeds taxonomy + heuristic phrases |
| `train-neural.ts` | `npm run neural:train` | trains the neural head (A3) |
| `cleanup-proofs.ts` | `npm run cleanup:proofs` | deletes PNGs in `PROOFS_DIR` older than `PROOF_RETENTION_DAYS` (7). Its header says it also clears `screenshot_path` references in the database; it does not. Nothing schedules it: there are currently 15 proof screenshots in `.proofs/`. |
| `generate-types.ts` | `npm run db:types` | **broken**: passes the Supabase URL's host name as `--project-id` (it needs the project ref) and writes to `types/database.ts` (the file is at `src/types/database.ts`). Supabase is not used anyway. |

### F4. Documentation

- `README.md`: accurate on most of the architecture; out of date on the test count/failures and the demo flow.
- `DEEP_RESEARCH.md`: a good overview, but describes the project **before** login and Supabase were removed: Supabase/Google OAuth, `requireUser` from SSR sessions, RLS as the live authorization boundary, idempotency backed by the table, `/api/auth/*` routes, `/auth/callback`, `server/supabase/client.ts` and `proxy.ts` (do not exist), "the ApprovalModal traps focus", the 4 failing tests, and "9 suites / 8 suites".
- `docs/setup/deployment.md`: matches the in-memory model, but still lists "Migrations applied" in the checklist and `AGENT_MAX_ACTIONS` (which has no effect).
- `docs/setup/supabase.md`: describes a Supabase setup the code no longer uses, links to `google-auth.md` (does not exist) and a Realtime subscription the frontend does not make.
- `video/README.md`: accurate for the video package.

### F5. Configuration

- `package.json`: scripts listed above; runtime deps Next 16.3.1, React 19.2.8, LangGraph 0.2, Playwright 1.62.1, neo4j-driver 6, Supabase JS 2.48 (types only), Zod 3, Zustand 5, Framer Motion 13, Radix, lucide-react, `@huggingface/transformers` 4.3.1. `npm audit --omit=dev` reports 9 advisories (1 critical in `next`, 1 high in `langsmith` via LangChain, moderates in LangChain/`uuid`, lows in Supabase auth-js).
- `next.config.ts`: `agentRules: false`, `serverExternalPackages` (playwright, neo4j-driver, transformers, onnxruntime-node), pinned `turbopack.root` and `outputFileTracingRoot`.
- `tsconfig.json`: strict, bundler resolution, `@/*` → `src/*`, excludes `video`.
- `eslint.config.mjs`: Next core-web-vitals + TypeScript, ignores `video/**`.
- `vitest.config.ts`, `postcss.config.mjs` (Tailwind v4 plugin), `vercel.json` (build/install commands; the app is not suited to serverless as built).
- `.env.example`: `NEXT_PUBLIC_APP_URL`, LLM, Neo4j, plus `AGENT_API_URL`, `AGENT_API_SECRET` and `REDIS_URL`, **which nothing reads** (`REDIS_URL` appears only in comments). Variables the code does read but `.env.example` omits: `SUPABASE_DEV_MODE`, `CORS_ORIGIN`, `PROOFS_DIR`, `PROOF_RETENTION_DAYS`.
- `.gitignore`: ignores `.env*`, `.proofs/`, build output, Supabase temp folders.

### F6. Pitch video (`video/`)

A separate Remotion 4.0.288 project (React 18): 12 scenes, 120 s at 30 fps, 1920×1080 (hook "the cancellation maze" → product → goal → perception → detection → planning → action → approval → verification → pipeline → why it matters → final). Scenes are fully scripted animations using a fictional "Streamify" service; they are not recordings of the app. `npm start` opens Remotion Studio on port 3000, which clashes with the app's dev server.

---

## Part G — Every issue found, ranked

Severity: **High** = wrong result shown to the user or a safety promise broken; **Medium** = a feature that silently does not work; **Low** = cleanup, dead code, or a misleading comment.

### High

| # | Issue | Where | Effect |
|---|---|---|---|
| G1 | An unverified run is reported as a success | `state.ts` (`verify → complete` edge), `verification.ts`, `finalize.ts` | VERIFY returns `running` when nothing is confirmed, COMPLETE then sets `completed` and emits "Task completed successfully"; the UI shows "Cancellation confirmed · Verified". The graph meanwhile records −1 for the run. |
| G2 | "Reject" in the approval dialog does not reject | `ApprovalModal.tsx` calls `stopSession` | The approval stays `pending`, the session becomes `cancelled`, the `/reject` route and the "stopped" (reward 0) outcome are never used. |
| G3 | Stopping a cancellation task does not stop its agent | `api/agent/start` and `api/cancellations` POST never set `cancellation_tasks.agent_session_id` | `/api/cancellations/[id]/stop` marks the task cancelled but the browser keeps clicking. Also `sessionId` is always `null` in the task list. |
| G4 | Most pattern types are shown as "Hard to Cancel" | `PATTERN_TYPE_MAP` in `agentService.ts` | false_urgency, urgency, nagging, subscription_trap, hidden_costs, disguised_ads, forced_action (including all neural `false_urgency` findings) are mislabelled in the scanner, agent page and evidence drawer. |
| G5 | Every real finding is labelled "Low" confidence | `EvidenceDrawer.tsx` compares 0–1 values with 80/60 | The drawer contradicts the percentage shown next to it. |
| G6 | Loose success detection | `inferPageState` ("success"/"cancelled" anywhere), VERIFY markers ("cancelled") | Any page mentioning "cancelled" counts as a confirmed cancellation; PLAN rule 1 then ends the run immediately. Combined with G1 and PLAN rule 6 (complete after one click when nothing is recognised), a run can be shown as a successful cancellation when nothing was cancelled. |
| G7 | Real sites are never actually cancelled from the UI | `agent/page.tsx` goal guess | Only URLs containing `demo-target` or `cancel` get the cancellation goal; others run look-only detection while the UI says the agent "walks the cancel flow" and shows "Cancellation confirmed" at the end. |

### Medium

| # | Issue | Where |
|---|---|---|
| G8 | Cancellation tasks stay `running` forever (no code updates `status`, `completed_at`, `failure_reason` after a run) | runner / finalize |
| G9 | `agent_sessions.current_stage` and `error_message` are never written after creation | `persistFinalState` |
| G10 | Live preview shows only the starting page for the whole run | `startPolling` → `browser.url = targetUrl`; `LiveShot` keyed by URL |
| G11 | `/demo` screenshots the real netflix.com and uses up the scan rate limit; its mock screens are never shown | `simulator.ts` URLs + `PagePreview` |
| G12 | Activity "website" is always unknown | `api/activity/route.ts` ignores `listActivity`'s `website` |
| G13 | Polling stops for good after one failed request, and stops showing events after 200 | `startPolling`, `listSessionEvents` |
| G14 | All data (sessions, findings, tasks, approvals) is lost on restart; single process only | in-memory dev store |
| G15 | No authentication: anyone who can reach the server acts as the demo user and can start agents, approve, read proofs | `requireUser` |
| G16 | SSRF check only covers the first URL: redirects, DNS changes at connect time and every page the agent clicks to are not checked; DNS failures pass; in dev (the default) private and loopback targets are allowed | `ssrf.ts`, runner |
| G17 | Settings page saves nothing; sensitivity and toggles have no effect | `settings/page.tsx` |
| G18 | Idempotency "duplicate" protection never fires (no unique constraint in the dev store) | `idempotency.ts` |
| G19 | Approval resume re-detects the page and inserts duplicate findings; reject resume does the same before failing | graph restarts at PERCEIVE |
| G20 | A failed action is reported as executed and counted ("retrying" then "Executed click") | `action.ts` |
| G21 | `transitionApproval` and the runner have no lock; two quick approvals can resume the same run twice (the runner comment claims a lock exists) | `approvals.ts`, `runner.ts` |
| G22 | Approval lives 15 min but the browser session is destroyed after 10 min | `APPROVAL_TTL_MS` vs `SESSION_TIMEOUT_MS` |
| G23 | Proof screenshots are never deleted automatically (15 currently on disk) although the UI says they are deleted at session end | `.proofs/`, `cleanup-proofs.ts` unscheduled |
| G24 | Substring heuristics produce false positives ("free trial", "are you sure", "countdown") and miss findings whose phrase is only in body text (no evidence → cannot be rated) | `classifier.ts` |
| G25 | Neural detector: trained on shopping sites, so it misses cancellation guilt wording and flags "No thanks, cancel subscription" as misdirection; also sees merged button labels as one sentence because perception collapses line breaks | `neural.ts`, `perception.ts` |
| G26 | One "false alarm" vote (ALPHA 0.5 → −0.5) immediately disables that wording for every site; one failed Neo4j query disables the whole graph for 60 s | `neo4j.ts` |
| G27 | No LLM request timeout | `llm/client.ts` |
| G28 | The screenshot route shares the scanner's 30/hour limit; a missing `url` or a missing approval returns 500 instead of 4xx | `scanner/screenshot`, `approve`, `reject` routes |
| G29 | `generate-types.ts` is broken (wrong project id and output path) | script |
| G30 | Supabase migrations would fail as written (`bulk_extension_name` column; seed without auth user; non-UUID dev user) | `supabase/` |

### Low

- Dead code: `src/types/api.ts`; `AgentGraphState` in `types/agent.ts`; `stageLabel`; `listSessionsOwned`; `getApprovalOwned`; `persistAudit`; `makeRequestId`; `rateLimitHeaders`; `BROWSER_LIMITS`/`canNavigate` (so `AGENT_MAX_ACTIONS` does nothing); `approvalActionSchema`/`idParamSchema` (tests only); `validateTargetUrlSync` (tests only); `startAgentRun`; `rejectSession`; `isUnauthed`; `STATUS_LABELS`; `SEVERITY_LABELS`; `ui/input.tsx`; `ui/badge.tsx`; Tooltip parts other than the provider; `maxPages` option; `/cancel` page; `.env.example` entries `AGENT_API_URL`, `AGENT_API_SECRET`, `REDIS_URL`.
- Duplication: `api/agent/start` and `POST /api/cancellations` are near copies; `data.ts` copies 10 helpers from `utils.ts`; `scannerService.ts` re-declares `ElementPosition`/`PerceptionData`; `smoke-agent.ts` copies the planner's phrase lists.
- `"cancel subscription"` is in both `EXPLICIT_CANCEL` and `CANCEL_NAV`; `"investigation"` goal exists only in the planner; `complete` listed as a router target but never returned; `pageState: "initial"` never produced; `box` mixes fractions and pixels.
- `getByText(..., { exact: false })` can click the wrong element when one label contains another.
- Three page reads per loop (PERCEIVE, DETECT, PLAN each call `perceive`).
- The RLS policy `events_update_own` contradicts "append-only events".
- UI copy: tasks page "backend on port 3001"; settings/security "backend/.proofs/"; mobile nav fake user; simulator "email header check"; demo `DEMO_SERVICE` (StreamFlow ₹549) vs test site (StreamVault ₹649); `BrowserToolbar` always shows "Secure"; `ProofViewer` "View Proof" does nothing; command palette Scanner icon check.
- Graph page re-runs the force layout on every filter toggle.
- `npm audit`: 1 critical (`next`) and 1 high (`langsmith`) advisory in production dependencies.

---

## Part H — Where the app's own explanations do not match the code

The `/security` page, settings page and docs make promises. Checked against the code:

| Claim | Where | Reality |
|---|---|---|
| "Proof screenshots are retained only for the duration of your session, then deleted" / "deleted automatically when the session ends" | security, settings | Never deleted unless `npm run cleanup:proofs` is run by hand (7-day rule). |
| Proofs "stored in `backend/.proofs/`" | security, settings | `<project>/.proofs/` (no `backend/` folder). |
| "Click buttons you have explicitly approved" | security | Only the final step is approved; every earlier click is automatic. |
| "Rejecting stops the agent without any action taken" | security | True in effect, but via Stop, not Reject (G2). |
| "Approvals are validated server-side — the frontend cannot fake them" | security | Validated, but any caller can call `/approve` as the single demo user (G15). |
| "Blocks private/loopback/reserved IPs and DNS-rebinding" | security | Only outside dev mode, only for the first URL (G16). |
| "Duplicate agent-start requests return the cached response" | security | Only after the first response is stored; simultaneous duplicates both run (G18). |
| "Every agent event … is persisted to the audit log" | security | Events go to the in-memory `agent_events`; `audit_logs` is never written and everything is lost on restart. |
| "Each investigation gets a fresh browser context … no session data persists" | security | True. |
| "The approval dialog … traps focus" | `DEEP_RESEARCH.md` | Only Escape is blocked. |
| "The database, not the frontend, is the authorization boundary (RLS)" | `DEEP_RESEARCH.md`, `docs/setup/supabase.md` | No database; no authorization at all. |
| "Checks every page against 13 known tricks" | landing | Rules + neural cover 5 types; the other 8 only with an LLM key or phrases learned from feedback. |
| Flow account → plan → confirm → success | README, `DEEP_RESEARCH.md` | account → confirm → success (F1). |
| "4 tests fail" | README, `DEEP_RESEARCH.md` | All 74 pass. |

---

## Part I — Index of every file

Lines in brackets. Section references point to the detailed description above.

### Root and configuration

| File | Purpose |
|---|---|
| `README.md` (121) | Quick start, structure, stack, scripts, env vars, API, safety model (F4) |
| `DEEP_RESEARCH.md` (580) | Earlier analysis, partly out of date (F4) |
| `PROJECT_ANALYSIS.md` | This document |
| `package.json` / `package-lock.json` | Dependencies and npm scripts (F5) |
| `next.config.ts` | Next.js options, server-external packages (F5) |
| `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`, `vercel.json` | Tooling config (F5) |
| `.env.example`, `.gitignore` | Env template, ignore rules (F5) |
| `docs/setup/deployment.md`, `docs/setup/supabase.md` | Setup guides (F4) |
| `public/*.svg` | Default Next.js icons (`file`, `globe`, `next`, `vercel`, `window`); not referenced by the app |

### Server — `src/server/`

| File | Purpose |
|---|---|
| `agent/state.ts` | LangGraph state, routers, graph wiring, cooperative stop (A1) |
| `agent/graph.ts` | Node registry, `RuntimeContext` (A1) |
| `agent/runner.ts` | Run/resume orchestration, persistence, teardown (A1) |
| `agent/events.ts` | `emitEvent`, unused `stageLabel` (A1) |
| `agent/agents/perception.ts` | PERCEIVE node (A1) |
| `agent/agents/detection.ts` | DETECT node (A1) |
| `agent/agents/planning.ts` | PLAN node, rule ladder (A1) |
| `agent/agents/action.ts` | ACT node (A1) |
| `agent/agents/approval.ts` | APPROVAL_GATE node (A1) |
| `agent/agents/verification.ts` | VERIFY node (A1) |
| `agent/agents/finalize.ts` | COMPLETE / FAIL nodes (A1) |
| `browser/manager.ts` | Playwright lifecycle, screenshots (A2) |
| `browser/perception.ts` | Page snapshot, page-state guess (A2) |
| `browser/actions.ts` | Safe action executor (A2) |
| `browser/security.ts` | Unused limits, `evaluateTrusted` (A2) |
| `detection/taxonomy.ts` | 13 pattern types (A3) |
| `detection/classifier.ts` | Rules, LLM pass, grounding, learning (A3) |
| `detection/neural.ts` | Neural detector (A3) |
| `detection/neural-head.json` | Trained softmax weights (A3) |
| `llm/client.ts` | OpenAI-compatible client (A4) |
| `graph/neo4j.ts` | Knowledge graph and learning (A5) |
| `security/ssrf.ts`, `rate-limit.ts`, `idempotency.ts`, `errors.ts`, `validation.ts`, `audit.ts` | Security helpers (A6) |
| `supabase/dev-store.ts`, `admin.ts`, `server.ts`, `types.ts` | In-memory data store and its clients (A7) |
| `db/queries.ts`, `db/approvals.ts` | Read helpers, approval transition (A7) |
| `auth/guards.ts` | `requireUser` → demo user (A8) |
| `api/handler.ts` | Route wrapper (A8) |
| `queue/runner.ts` | In-process job queue (A8) |
| `src/proxy.ts` | CORS for `/api/*` (A8) |

### API — `src/app/api/` (all in Part B)

`health`, `scanner/analyze`, `scanner/screenshot`, `agent/start`, `agent/[id]`, `agent/[id]/events`, `agent/[id]/proof`, `agent/[id]/approve`, `agent/[id]/reject`, `agent/[id]/stop`, `cancellations`, `cancellations/[id]`, `cancellations/[id]/stop`, `activity`, `profile`, `graph`, `graph/feedback`, `graph/learning`, `graph/sites` — 19 route files.

### Test site — `src/app/demo-target/`

`account/route.ts`, `plan/route.ts`, `confirm/route.ts`, `success/route.ts` (F1).

### Pages — `src/app/`

`layout.tsx`, `globals.css`, `page.tsx` (landing), `cancel/page.tsx`, `(app)/layout.tsx`, and `(app)/` pages `dashboard`, `scanner`, `agent`, `tasks`, `activity`, `graph`, `learning`, `sites`, `security`, `settings`, `demo` (E1, E2, E4).

### Components — `src/components/` (E3)

- `layout/`: `AppShell`, `Sidebar`, `MobileNav`, `CommandPalette`
- `agent/`: `ApprovalModal`, `AgentDecision`, `AgentPipeline`, `AgentEventStream`, `AgentStatus`
- `browser/`: `BrowserFrame`, `BrowserToolbar`, `PagePreview`, `DarkPatternHighlight`
- `scanner/`: `EvidenceDrawer`, `DetectionOverlay`
- `cancellation/`: `ProofViewer`
- `landing/`: `HeroCase`
- `ui/`: `avatar`, `badge`, `button`, `card`, `case`, `confidence-bar`, `dialog`, `input`, `separator`, `severity-badge`, `skeleton`, `status-dot`, `switch`, `tooltip`

### Client library — `src/lib/`, `src/stores/`, `src/types/` (Part C)

`lib/api.ts`, `lib/constants.ts`, `lib/data.ts`, `lib/graph-layout.ts`, `lib/navigation.ts`, `lib/trap-score.ts`, `lib/types.ts`, `lib/utils.ts`, `lib/services/agentService.ts`, `lib/services/scannerService.ts`, `lib/services/taskService.ts`, `lib/services/simulator.ts`, `stores/agent-store.ts`, `types/agent.ts`, `types/api.ts` (unused), `types/database.ts`.

### Database — `supabase/` (Part D)

`migrations/001_initial_schema.sql`, `002_rls.sql`, `003_indexes.sql`, `004_functions_triggers.sql`, `005_storage.sql`, `seed.sql`, `config.toml`.

### Tests and scripts (F2, F3)

`tests/agent-graph`, `approval`, `classifier`, `graph-layout`, `neural`, `planning-route`, `rate-limit`, `security-ssrf`, `trap-score`, `validation` (`.test.ts`); `scripts/smoke-agent.ts`, `seed-graph.ts`, `train-neural.ts`, `cleanup-proofs.ts`, `generate-types.ts`.

### Pitch video — `video/` (F6)

`package.json`, `README.md`, `remotion.config.ts`, `tsconfig.json`, `src/index.tsx` (registers the 1920×1080 composition), `src/Root.tsx` (sequences the scenes), `src/lib/tokens.ts` (colours, fonts, scene start frames and durations, 3,600 frames), `src/lib/anim.ts` (spring/fade/slide helpers), `src/components/` (`BrowserChrome`, `AgentConsole`, `PipelineBar`, `SceneWrapper`), `src/scenes/Scene1Hook` … `Scene12Final`.
