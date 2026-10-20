"use client";

import { api, ApiError, BACKEND_URL } from "@/lib/api";

export type TinyFishApi = "search" | "fetch" | "browser" | "agent";

export interface TinyFishCall {
  api: TinyFishApi;
  label: string;
  ok: boolean;
  ms: number;
  id?: string;
  error?: string;
}

export interface TinyFishStatus {
  enabled: boolean;
  demoUrl: string | null;
}

export interface SearchHit {
  title: string;
  url: string;
  snippet: string;
  site: string;
}

export interface AgentEvent {
  type: string;
  run_id?: string;
  streaming_url?: string;
  purpose?: string;
  status?: string;
  result?: unknown;
  error?: unknown;
  ms?: number;
}

export function tinyfishStatus(): Promise<TinyFishStatus> {
  return api.get<TinyFishStatus>("/api/tinyfish/status");
}

export function searchPages(q: string): Promise<{ results: SearchHit[]; tinyfish: TinyFishCall[] }> {
  return api.get(`/api/tinyfish/search?q=${encodeURIComponent(q)}`);
}

/** Starts a TinyFish agent run and calls `onEvent` for each event as it streams in. */
export async function runTinyFishAgent(
  url: string,
  mode: "explore" | "confirm",
  onEvent: (e: AgentEvent) => void,
  signal?: AbortSignal
): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/api/tinyfish/agent`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, mode }),
    signal,
  });
  if (!res.ok || !res.body) {
    let message = `the server failed (${res.status})`;
    try {
      message = ((await res.json()) as { error?: { message?: string } }).error?.message ?? message;
    } catch {
      // keep the status message
    }
    throw new ApiError(message, res.status);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (line) onEvent(JSON.parse(line) as AgentEvent);
    }
    if (done) return;
  }
}

/** The agent's answer as text: objects come back as-is, plain answers under result.result. */
export function resultText(result: unknown): string {
  if (result == null) return "";
  if (typeof result === "string") return result;
  const inner = (result as { result?: unknown }).result;
  return typeof inner === "string" ? inner : JSON.stringify(result, null, 2);
}
