// =============================================================================
// server/graph/neo4j.ts
// Optional Neo4j knowledge graph + agent memory. Every agent stage reads it
// before deciding and writes back what it verified:
//
//   (:Site)-[:EXHIBITS {count, evidence}]->(:Pattern)      detection memory
//   (:Site)-[:SHOWS]->(:Indicator)-[:INDICATES]->(:Pattern) evidence phrases
//   (:Run)-[:ON]->(:Site), (:Run)-[:TOOK {order, path}]->(:Action)  run memory
//   (:Site)-[:HAS_PAGE]->(:Page)-[:LEADS_TO {click}]->(:Page)      path map
//
// Learning (reinforcement from rewards, value = running average in -1..1):
//   (:Indicator)-[:INDICATES {value, n}]->(:Pattern)  reward = human feedback
//   (:Site)-[:POLICY {path, value, n}]->(:Action)     reward = verified outcome
//
// Like the LLM client this is an enhancer: without NEO4J_URI (or if the
// database is unreachable) every call is a no-op and the agent still runs.
// Graph content is only ever a hint — callers re-check it against the live page.
// =============================================================================

import neo4j, { type Driver } from "neo4j-driver";
import type { DarkPatternDetection } from "@/types/agent";
import type { PatternType } from "@/types/database";
import { TAXONOMY, patternDefinition } from "@/server/detection/taxonomy";
import { trapScore, type TrapScore } from "@/lib/trap-score";

let driver: Driver | null | undefined;
// After a failure, skip the graph for a minute so a down database costs one
// timeout, not one per page.
let downUntil = 0;

function getDriver(): Driver | null {
  if (Date.now() < downUntil) return null;
  if (driver !== undefined) return driver;
  const uri = process.env.NEO4J_URI;
  if (!uri) return (driver = null);
  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(process.env.NEO4J_USERNAME ?? "neo4j", process.env.NEO4J_PASSWORD ?? ""),
    // Fail fast: a slow graph must never stall an agent run.
    { connectionTimeout: 3000, maxTransactionRetryTime: 3000, disableLosslessIntegers: true }
  );
  return driver;
}

/** Run one Cypher statement; returns null when the graph is off or failing. */
async function run<T = Record<string, unknown>>(
  op: string,
  cypher: string,
  params: Record<string, unknown>
): Promise<T[] | null> {
  const d = getDriver();
  if (!d) return null;
  try {
    const { records } = await d.executeQuery(cypher, params, {
      database: process.env.NEO4J_DATABASE ?? "neo4j",
    });
    return records.map((r) => r.toObject() as T);
  } catch (err) {
    downUntil = Date.now() + 60_000;
    console.warn(`[neo4j] ${op} failed, pausing graph for 60s:`, (err as Error).message.slice(0, 200));
    return null;
  }
}

function site(url: string): { host: string; path: string } | null {
  try {
    const u = new URL(url);
    return { host: u.hostname, path: u.pathname };
  } catch {
    return null;
  }
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

/** Learning rate: how far one reward moves a value toward it (value += ALPHA * (reward - value)). */
const ALPHA = 0.5;

/** How far a learned value must be from 0 before the agent acts on it. */
export const LEARNED_THRESHOLD = 0.4;

// -----------------------------------------------------------------------------
// Detection memory
// -----------------------------------------------------------------------------

export interface GraphContext {
  /** Evidence-backed findings previously recorded for this site. */
  prior: { patternType: string; evidence: string; timesSeen: number }[];
  /** Patterns that other sites show together with the ones found here. */
  related: { patternType: string; sites: number }[];
  /** Verified example phrases per pattern, most widely seen first. */
  examples: { patternType: string; phrases: string[] }[];
  /** Phrases with a learned value from human feedback (positive = real, negative = false alarm). */
  learned: LearnedIndicator[];
}

export interface LearnedIndicator {
  phrase: string;
  patternType: PatternType;
  value: number;
}

const EMPTY: GraphContext = { prior: [], related: [], examples: [], learned: [] };

/** What the graph knows that is relevant to classifying this page. */
export async function graphContext(url: string, foundTypes: PatternType[]): Promise<GraphContext> {
  const s = site(url);
  if (!s || !getDriver()) return EMPTY;
  const [prior, related, examples, learned] = await Promise.all([
    run<GraphContext["prior"][number]>(
      "prior",
      `MATCH (:Site {host: $host})-[e:EXHIBITS]->(p:Pattern)
       RETURN p.type AS patternType, e.evidence AS evidence, e.count AS timesSeen
       ORDER BY e.count DESC LIMIT 10`,
      { host: s.host }
    ),
    run<GraphContext["related"][number]>(
      "related",
      `MATCH (s:Site {host: $host})-[:EXHIBITS]->(known:Pattern)
       WITH collect(known.type) + $types AS types
       MATCH (p:Pattern)<-[:EXHIBITS]-(o:Site)-[:EXHIBITS]->(q:Pattern)
       WHERE p.type IN types AND NOT q.type IN types AND o.host <> $host
       RETURN q.type AS patternType, count(DISTINCT o) AS sites
       ORDER BY sites DESC LIMIT 5`,
      { host: s.host, types: foundTypes }
    ),
    run<GraphContext["examples"][number]>(
      "examples",
      `MATCH (i:Indicator)-[:INDICATES]->(p:Pattern)
       OPTIONAL MATCH (o:Site)-[:SHOWS]->(i)
       WITH p, i, count(o) AS sites ORDER BY sites DESC
       RETURN p.type AS patternType, collect(i.phrase)[..3] AS phrases`,
      {}
    ),
    run<LearnedIndicator>(
      "learned",
      `MATCH (i:Indicator)-[r:INDICATES]->(p:Pattern) WHERE r.value IS NOT NULL
       RETURN i.phrase AS phrase, p.type AS patternType, r.value AS value LIMIT 500`,
      {}
    ),
  ]);
  return { prior: prior ?? [], related: related ?? [], examples: examples ?? [], learned: learned ?? [] };
}

/** Record findings that carry page evidence. Unevidenced findings are skipped. */
export async function recordFindings(url: string, detections: DarkPatternDetection[]): Promise<void> {
  const s = site(url);
  const rows = detections
    .filter((x) => x.elementText)
    .map((x) => {
      const def = patternDefinition(x.patternType);
      return {
        type: x.patternType,
        label: def.label,
        description: def.description,
        evidence: x.elementText!.slice(0, 300),
        phrase: norm(x.elementText!).slice(0, 300),
        confidence: x.confidence,
      };
    });
  if (!s || rows.length === 0) return;
  await run(
    "recordFindings",
    `MERGE (s:Site {host: $host})
     WITH s UNWIND $rows AS r
     MERGE (p:Pattern {type: r.type})
       ON CREATE SET p.label = r.label, p.description = r.description
     MERGE (s)-[e:EXHIBITS]->(p)
       SET e.evidence = r.evidence, e.confidence = r.confidence,
           e.lastSeen = datetime(), e.count = coalesce(e.count, 0) + 1
     MERGE (i:Indicator {phrase: r.phrase})
       ON CREATE SET i.source = "observed"
     MERGE (i)-[:INDICATES]->(p)
     MERGE (s)-[:SHOWS]->(i)`,
    { host: s.host, rows }
  );
}

/**
 * Reward a finding from human feedback: +1 "correct", -1 "not a dark pattern".
 * Returns the phrase's new learned value, or null if the graph is unavailable.
 */
export async function rewardFinding(
  patternType: PatternType,
  evidence: string,
  reward: 1 | -1
): Promise<number | null> {
  const def = patternDefinition(patternType);
  const rows = await run<{ value: number }>(
    "rewardFinding",
    `MERGE (p:Pattern {type: $type})
       ON CREATE SET p.label = $label, p.description = $description
     MERGE (i:Indicator {phrase: $phrase})
       ON CREATE SET i.source = "feedback"
     MERGE (i)-[r:INDICATES]->(p)
     SET r.n = coalesce(r.n, 0) + 1,
         r.value = coalesce(r.value, 0) + $alpha * ($reward - coalesce(r.value, 0))
     RETURN r.value AS value`,
    {
      type: patternType,
      label: def.label,
      description: def.description,
      phrase: norm(evidence).slice(0, 300),
      reward,
      alpha: ALPHA,
    }
  );
  return rows?.[0]?.value ?? null;
}

// -----------------------------------------------------------------------------
// Run memory (planning / action / verification)
// -----------------------------------------------------------------------------

/** Remember a click the agent actually executed, and where it was made. */
export async function recordStep(
  runId: string,
  goal: string,
  url: string,
  order: number,
  label: string
): Promise<void> {
  const s = site(url);
  const text = norm(label).slice(0, 100);
  if (!s || !text) return;
  await run(
    "recordStep",
    `MERGE (s:Site {host: $host})
     MERGE (r:Run {id: $runId})
       ON CREATE SET r.goal = $goal, r.status = "running", r.startedAt = datetime()
     MERGE (r)-[:ON]->(s)
     MERGE (a:Action {label: $label})
     MERGE (r)-[t:TOOK {order: $order}]->(a)
       SET t.path = $path`,
    { host: s.host, path: s.path, runId, goal, order, label: text }
  );
}

// ponytail: a page is host + path; the query string is ignored. Key on it too
// if a site keeps its flow steps in ?step= style parameters.
const pageKey = (s: { host: string; path: string }) => `${s.host}${s.path}`;

/**
 * Path map: remember this page and, when a click brought the agent here, the
 * link from the page it was made on.
 */
export async function recordPage(
  url: string,
  state: string,
  title: string,
  opts: { entry?: boolean; from?: { from: string; label: string } } = {}
): Promise<void> {
  const s = site(url);
  if (!s) return;
  const from = opts.from ? site(opts.from.from) : null;
  await run(
    "recordPage",
    `MERGE (s:Site {host: $host})
     MERGE (pg:Page {key: $key})
       SET pg.host = $host, pg.path = $path, pg.state = $state, pg.title = $title,
           pg.entry = coalesce(pg.entry, false) OR $entry
     MERGE (s)-[:HAS_PAGE]->(pg)
     WITH pg
     OPTIONAL MATCH (prev:Page {key: $fromKey})
     FOREACH (_ IN CASE WHEN prev IS NULL OR prev = pg THEN [] ELSE [1] END |
       MERGE (prev)-[l:LEADS_TO {click: $click}]->(pg)
         SET l.count = coalesce(l.count, 0) + 1, l.lastSeen = datetime())`,
    {
      host: s.host,
      path: s.path,
      key: pageKey(s),
      state,
      title: title.slice(0, 200),
      entry: opts.entry ?? false,
      fromKey: from ? pageKey(from) : null,
      click: opts.from ? norm(opts.from.label).slice(0, 100) : null,
    }
  );
}

export interface Route {
  /** Clicks, in order, from this page to a page where cancellation was confirmed. */
  clicks: string[];
  steps: number;
}

/** Shortest known route from this page to a confirmed-cancelled page on the same site. */
export async function routeToSuccess(url: string): Promise<Route | null> {
  const s = site(url);
  if (!s) return null;
  const rows = await run<Route>(
    "routeToSuccess",
    `MATCH (a:Page {key: $key}), (b:Page {host: $host, state: "success"})
     WHERE a <> b
     MATCH p = shortestPath((a)-[:LEADS_TO*..10]->(b))
     RETURN [r IN relationships(p) | r.click] AS clicks, length(p) AS steps
     ORDER BY steps LIMIT 1`,
    { key: pageKey(s), host: s.host }
  );
  return rows?.[0] ?? null;
}

/** Reward per outcome. A run a human stopped says nothing about the clicks. */
const REWARD = { verified: 1, unverified: -1, failed: -1, stopped: 0 } as const;

/**
 * Close a run with what verification actually observed on the page, and pay
 * that out as a reward to every click the run made (once per run).
 */
export async function recordOutcome(
  runId: string,
  goal: string,
  url: string,
  status: keyof typeof REWARD
): Promise<void> {
  const s = site(url);
  if (!s) return;
  await run(
    "recordOutcome",
    `MERGE (s:Site {host: $host})
     MERGE (r:Run {id: $runId})
       ON CREATE SET r.goal = $goal, r.startedAt = datetime()
     MERGE (r)-[:ON]->(s)
     SET r.status = $status, r.endedAt = datetime()`,
    { host: s.host, runId, goal, status }
  );
  if (REWARD[status] === 0) return;
  await run(
    "reward",
    `MATCH (r:Run {id: $runId})-[:ON]->(s:Site)
     WHERE r.reward IS NULL
     SET r.reward = $reward
     WITH r, s
     MATCH (r)-[t:TOOK]->(a:Action)
     MERGE (s)-[q:POLICY {path: t.path}]->(a)
     SET q.n = coalesce(q.n, 0) + 1,
         q.value = coalesce(q.value, 0) + $alpha * ($reward - coalesce(q.value, 0))`,
    { runId, reward: REWARD[status], alpha: ALPHA }
  );
}

/**
 * Learned value (-1..1) of each click tried from this exact page: positive if
 * runs that made it ended verified, negative if they failed.
 */
export async function learnedSteps(url: string): Promise<Map<string, number>> {
  const s = site(url);
  if (!s) return new Map();
  const rows = await run<{ label: string; value: number }>(
    "learnedSteps",
    `MATCH (:Site {host: $host})-[q:POLICY {path: $path}]->(a:Action)
     RETURN a.label AS label, q.value AS value`,
    { host: s.host, path: s.path }
  );
  return new Map((rows ?? []).map((r) => [r.label, r.value]));
}

// -----------------------------------------------------------------------------
// Snapshot for the graph page
// -----------------------------------------------------------------------------

export interface GraphSnapshot {
  /** "off" = NEO4J_URI not set, "down" = set but unreachable. */
  status: "ok" | "off" | "down";
  nodes: { id: string; label: string; props: Record<string, unknown> }[];
  links: { source: string; target: string; type: string; props: Record<string, unknown> }[];
}

/** Dates and other driver objects are not JSON — show them as text. */
const plain = (props: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, v !== null && typeof v === "object" && !Array.isArray(v) ? String(v) : v])
  );

// ponytail: the graph is shared across users (sites and patterns are not
// personal). Scope Run nodes by user before exposing this to untrusted tenants.
export async function graphSnapshot(): Promise<GraphSnapshot> {
  if (!process.env.NEO4J_URI) return { status: "off", nodes: [], links: [] };
  const [nodes, links] = await Promise.all([
    run<GraphSnapshot["nodes"][number]>(
      "snapshot nodes",
      `MATCH (n) RETURN elementId(n) AS id, labels(n)[0] AS label, properties(n) AS props LIMIT 400`,
      {}
    ),
    run<GraphSnapshot["links"][number]>(
      "snapshot links",
      `MATCH (a)-[r]->(b)
       RETURN elementId(a) AS source, elementId(b) AS target, type(r) AS type, properties(r) AS props LIMIT 1500`,
      {}
    ),
  ]);
  if (!nodes || !links) return { status: "down", nodes: [], links: [] };
  return {
    status: "ok",
    nodes: nodes.map((n) => ({ ...n, props: plain(n.props) })),
    links: links.map((l) => ({ ...l, props: plain(l.props) })),
  };
}

// -----------------------------------------------------------------------------
// Snapshot for the learning page
// -----------------------------------------------------------------------------

export interface LearningSnapshot {
  status: GraphSnapshot["status"];
  threshold: number;
  /** Evidence phrases seen on real pages; value is null until a human rates one. */
  findings: { patternType: string; label: string; phrase: string; sites: string[]; value: number | null; votes: number }[];
  /** Clicks the planner has a learned value for. */
  clicks: { host: string; path: string; label: string; value: number; runs: number }[];
  /** How many runs ended in each outcome. */
  runs: { status: string; count: number }[];
}

export async function learningSnapshot(): Promise<LearningSnapshot> {
  const empty = { threshold: LEARNED_THRESHOLD, findings: [], clicks: [], runs: [] };
  if (!process.env.NEO4J_URI) return { status: "off", ...empty };
  const [findings, clicks, runs] = await Promise.all([
    run<LearningSnapshot["findings"][number]>(
      "learning findings",
      `MATCH (i:Indicator)-[r:INDICATES]->(p:Pattern)
       OPTIONAL MATCH (s:Site)-[:SHOWS]->(i)
       WITH i, r, p, collect(DISTINCT s.host) AS sites
       WHERE size(sites) > 0 OR r.value IS NOT NULL
       RETURN p.type AS patternType, p.label AS label, i.phrase AS phrase, sites,
              r.value AS value, coalesce(r.n, 0) AS votes
       ORDER BY r.value IS NULL DESC, size(sites) DESC LIMIT 100`,
      {}
    ),
    run<LearningSnapshot["clicks"][number]>(
      "learning clicks",
      `MATCH (s:Site)-[q:POLICY]->(a:Action)
       RETURN s.host AS host, q.path AS path, a.label AS label, q.value AS value, q.n AS runs
       ORDER BY q.value DESC LIMIT 100`,
      {}
    ),
    run<LearningSnapshot["runs"][number]>(
      "learning runs",
      `MATCH (r:Run) RETURN r.status AS status, count(*) AS count`,
      {}
    ),
  ]);
  if (!findings || !clicks || !runs) return { status: "down", ...empty };
  return { status: "ok", threshold: LEARNED_THRESHOLD, findings, clicks, runs };
}

// -----------------------------------------------------------------------------
// Site ranking
// -----------------------------------------------------------------------------

export interface SiteRank extends TrapScore {
  host: string;
  patterns: { type: string; label: string; severity: string; evidence: string; seen: number }[];
  /** Shortest known route from the page a run started on to a cancelled page. */
  route: string[] | null;
  cancelRuns: number;
  verifiedRuns: number;
}

export async function siteRanking(): Promise<{ status: GraphSnapshot["status"]; sites: SiteRank[] }> {
  if (!process.env.NEO4J_URI) return { status: "off", sites: [] };
  const [sites, routes] = await Promise.all([
    run<{ host: string; patterns: { type: PatternType; evidence: string; seen: number }[]; cancelRuns: number; verifiedRuns: number }>(
      "ranking sites",
      `MATCH (s:Site)
       OPTIONAL MATCH (s)-[e:EXHIBITS]->(p:Pattern)
       WITH s, [x IN collect({type: p.type, evidence: e.evidence, seen: e.count}) WHERE x.type IS NOT NULL] AS patterns
       OPTIONAL MATCH (r:Run {goal: "cancel_subscription"})-[:ON]->(s)
         WHERE r.status IN ["verified", "unverified", "failed"]
       RETURN s.host AS host, patterns, count(r) AS cancelRuns,
              sum(CASE r.status WHEN "verified" THEN 1 ELSE 0 END) AS verifiedRuns`,
      {}
    ),
    run<{ host: string; clicks: string[] }>(
      "ranking routes",
      `MATCH (a:Page {entry: true}), (b:Page {state: "success"})
       WHERE a.host = b.host AND a <> b
       MATCH p = shortestPath((a)-[:LEADS_TO*..10]->(b))
       WITH a.host AS host, p ORDER BY length(p)
       WITH host, collect(p)[0] AS p
       RETURN host, [r IN relationships(p) | r.click] AS clicks`,
      {}
    ),
  ]);
  if (!sites || !routes) return { status: "down", sites: [] };
  const routeOf = new Map(routes.map((r) => [r.host, r.clicks]));
  const ranked = sites.map((s) => {
    const patterns = s.patterns.map((p) => {
      const def = patternDefinition(p.type);
      return { ...p, label: def.label, severity: def.defaultSeverity };
    });
    const route = routeOf.get(s.host) ?? null;
    return {
      host: s.host,
      patterns,
      route,
      cancelRuns: s.cancelRuns,
      verifiedRuns: s.verifiedRuns,
      ...trapScore({
        severities: patterns.map((p) => p.severity),
        cancelClicks: route?.length ?? null,
        cancelRuns: s.cancelRuns,
        verifiedRuns: s.verifiedRuns,
      }),
    };
  });
  return { status: "ok", sites: ranked.sort((a, b) => b.score - a.score) };
}

// -----------------------------------------------------------------------------
// One-off setup (npm run graph:seed)
// -----------------------------------------------------------------------------

/** Create constraints and load the taxonomy + known indicator phrases. */
export async function seedGraph(indicators: Partial<Record<PatternType, string[]>>): Promise<boolean> {
  const unique: [string, string][] = [
    ["Site", "host"],
    ["Pattern", "type"],
    ["Indicator", "phrase"],
    ["Run", "id"],
    ["Action", "label"],
    ["Page", "key"],
  ];
  for (const [label, prop] of unique) {
    const ok = await run(
      "constraint",
      `CREATE CONSTRAINT ${label.toLowerCase()}_${prop} IF NOT EXISTS FOR (n:${label}) REQUIRE n.${prop} IS UNIQUE`,
      {}
    );
    if (!ok) return false;
  }
  const seeded = await run(
    "seed",
    `UNWIND $patterns AS t
     MERGE (p:Pattern {type: t.type})
       SET p.label = t.label, p.description = t.description, p.severity = t.defaultSeverity
     WITH p, t UNWIND t.phrases AS phrase
     MERGE (i:Indicator {phrase: phrase})
       ON CREATE SET i.source = "heuristic"
     MERGE (i)-[:INDICATES]->(p)`,
    { patterns: TAXONOMY.map((t) => ({ ...t, phrases: indicators[t.type] ?? [] })) }
  );
  return seeded !== null;
}

export async function closeGraph(): Promise<void> {
  await driver?.close();
  driver = undefined;
}
