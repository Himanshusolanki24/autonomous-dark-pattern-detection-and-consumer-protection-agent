// =============================================================================
// server/tinyfish/client.ts
// TinyFish gives the agent the live web: Search finds pages, Fetch returns clean
// page text, Browser is a cloud Chromium we drive over CDP, and Web Agent walks
// multi-step flows from a plain-English goal. Every call is recorded so the UI
// can show what TinyFish did (the "TinyFish activity" panel).
// =============================================================================

export type TinyFishApi = "search" | "fetch" | "browser" | "agent";

/** One TinyFish call, as shown in the activity panel. Never contains the API key. */
export interface TinyFishCall {
  api: TinyFishApi;
  label: string;
  ok: boolean;
  ms: number;
  id?: string;
  error?: string;
}

const SEARCH_URL = "https://api.search.tinyfish.ai";
const FETCH_URL = "https://api.fetch.tinyfish.ai";
const BROWSER_URL = "https://api.browser.tinyfish.ai";
const AGENT_URL = "https://agent.tinyfish.ai/v1/automation";

export function tinyfishKey(): string | null {
  return process.env.TINYFISH_API_KEY?.trim() || null;
}

export function tinyfishEnabled(): boolean {
  return tinyfishKey() !== null;
}

/** The cloud can't reach this machine, so local and private targets stay on the local browser. */
export function reachableFromCloud(raw: string): boolean {
  try {
    const host = new URL(raw).hostname;
    return !(
      host === "localhost" ||
      host === "0.0.0.0" ||
      host.endsWith(".local") ||
      /^127\.|^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
      host === "[::1]"
    );
  } catch {
    return false;
  }
}

export class TinyFishError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
    this.name = "TinyFishError";
  }
}

async function request(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const key = tinyfishKey();
  if (!key) throw new TinyFishError("TINYFISH_API_KEY is not set");
  const res = await fetch(url, {
    ...init,
    headers: { "X-API-Key": key, "Content-Type": "application/json", ...(init.headers ?? {}) },
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    let message = `TinyFish returned ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } | string };
      const m = typeof body.error === "string" ? body.error : body.error?.message;
      if (m) message = m;
    } catch {
      // keep the status message
    }
    throw new TinyFishError(message, res.status);
  }
  return res;
}

/** Times a call and appends it to `log` whether it succeeds or fails. */
async function recorded<T>(
  log: TinyFishCall[] | undefined,
  api: TinyFishApi,
  label: string,
  fn: () => Promise<T>,
  idOf?: (r: T) => string | undefined
): Promise<T> {
  const t0 = Date.now();
  try {
    const r = await fn();
    log?.push({ api, label, ok: true, ms: Date.now() - t0, id: idOf?.(r) });
    return r;
  } catch (err) {
    log?.push({ api, label, ok: false, ms: Date.now() - t0, error: (err as Error).message });
    throw err;
  }
}

// ---------------------------------------------------------------- Search API

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  site: string;
}

export function search(query: string, log?: TinyFishCall[]): Promise<SearchHit[]> {
  return recorded(log, "search", `Search "${query}"`, async () => {
    const qs = new URLSearchParams({
      query,
      language: "en",
      purpose: "Find the account, cancellation and help pages of a subscription service",
    });
    const res = await request(`${SEARCH_URL}?${qs}`, { method: "GET" }, 30_000);
    const body = (await res.json()) as {
      results?: { title: string; url: string; snippet: string; site_name: string }[];
    };
    return (body.results ?? []).map((r) => ({ title: r.title, url: r.url, snippet: r.snippet, site: r.site_name }));
  });
}

// ----------------------------------------------------------------- Fetch API

export interface FetchedPage {
  url: string;
  finalUrl: string;
  title: string | null;
  text: string;
}

export function fetchPages(urls: string[], log?: TinyFishCall[]): Promise<FetchedPage[]> {
  return recorded(log, "fetch", `Fetch ${urls.length} page${urls.length === 1 ? "" : "s"} as text`, async () => {
    const res = await request(
      FETCH_URL,
      { method: "POST", body: JSON.stringify({ urls: urls.slice(0, 10), format: "markdown", ttl: 0 }) },
      60_000
    );
    const body = (await res.json()) as {
      results?: { url: string; final_url?: string; title?: string | null; text?: string }[];
      errors?: { url: string; error: string }[];
    };
    const pages = (body.results ?? []).map((r) => ({
      url: r.url,
      finalUrl: r.final_url ?? r.url,
      title: r.title ?? null,
      text: r.text ?? "",
    }));
    if (pages.length === 0 && body.errors?.length) throw new TinyFishError(body.errors[0].error);
    return pages;
  });
}

// --------------------------------------------------------------- Browser API

export interface CloudBrowserSession {
  sessionId: string;
  cdpUrl: string;
}

export function createBrowserSession(log?: TinyFishCall[]): Promise<CloudBrowserSession> {
  return recorded(
    log,
    "browser",
    "Start a cloud browser",
    async () => {
      // Session creation can take 10-30 s, so the timeout is generous.
      const res = await request(BROWSER_URL, { method: "POST", body: JSON.stringify({ timeout_seconds: 600 }) }, 60_000);
      const body = (await res.json()) as { session_id: string; cdp_url: string };
      return { sessionId: body.session_id, cdpUrl: body.cdp_url };
    },
    (s) => s.sessionId
  );
}

export async function closeBrowserSession(sessionId: string): Promise<void> {
  // Ending a session that already ended also returns 204, so this is safe to repeat.
  await request(`${BROWSER_URL}/${encodeURIComponent(sessionId)}`, { method: "DELETE" }, 15_000).catch(() => {});
}

// ----------------------------------------------------------------- Web Agent

/** One event of a TinyFish agent run (the SSE `data:` payloads). */
export interface AgentStreamEvent {
  type: "STARTED" | "STREAMING_URL" | "PROGRESS" | "HEARTBEAT" | "COMPLETE" | string;
  run_id?: string;
  streaming_url?: string;
  purpose?: string;
  status?: string;
  result?: unknown;
  error?: unknown;
}

/** Opens a streaming agent run. The caller reads the SSE body. */
export function runAgentStream(url: string, goal: string, signal?: AbortSignal): Promise<Response> {
  return request(`${AGENT_URL}/run-sse`, { method: "POST", body: JSON.stringify({ url, goal }), signal }, 300_000);
}

/** Splits an SSE byte stream into the JSON objects of its `data:` lines. */
export async function* readAgentEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<AgentStreamEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      try {
        yield JSON.parse(line.slice(5).trim()) as AgentStreamEvent;
      } catch {
        // a partial or non-JSON line; skip it
      }
    }
    if (done) return;
  }
}

/** The agent's answer as text: objects come back as-is, plain answers under result.result. */
export function agentResultText(result: unknown): string {
  if (result == null) return "";
  if (typeof result === "string") return result;
  const inner = (result as { result?: unknown }).result;
  if (typeof inner === "string") return inner;
  return JSON.stringify(result, null, 2);
}

export const CANCEL_GOALS = {
  /** First run: walk the flow but stop before anything irreversible. */
  explore:
    "Find how to cancel the subscription on this site and walk the cancellation flow. " +
    "Decline every retention offer, discount, pause option or 'keep my benefits' button. " +
    "STOP on the final confirmation screen: do NOT click the final button that actually cancels. " +
    "Then report, as a short list: each screen you passed, every trick used to keep the user subscribed, " +
    "and the exact label of the final confirm button you did not click.",
  /** Second run, only after the user approves: finish the cancellation. */
  confirm:
    "Cancel the subscription on this site. Decline every retention offer, discount or pause option, " +
    "then click the final button that confirms the cancellation. " +
    "Report the exact confirmation message shown after cancelling.",
} as const;
