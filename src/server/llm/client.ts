// =============================================================================
// lib/llm/client.ts
// Thin server-side LLM abstraction (OpenAI-compatible chat completions).
// The key lives only on the server. This is an optional enhancer: the MVP's
// detection/planning paths are deterministic and run without an LLM key.
// =============================================================================

import { z } from "zod";
import { AgentError } from "@/server/security/errors";

interface ChatOptions {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  /** Ask the provider for syntactically valid JSON (OpenAI-compatible JSON mode). */
  json?: boolean;
}

// ponytail: one fixed budget per call. A slow model falls back to the
// deterministic path instead of stalling the run (or a serverless function).
const LLM_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 20_000);

function config() {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  if (!apiKey) return null;
  return { apiKey, baseUrl, model };
}

/** Plain-text completion. Returns null when no LLM is configured. */
export async function chat(opts: ChatOptions): Promise<string | null> {
  const cfg = config();
  if (!cfg) return null;

  const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: "POST",
    signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: opts.temperature ?? 0.2,
      max_tokens: opts.maxTokens ?? 800,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    throw new AgentError(`LLM request failed (${res.status})`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content?.trim() ?? null;
}

/**
 * Structured completion validated against a Zod schema. Returns null when no
 * LLM is configured, the request fails (e.g. a 429), or parsing fails — callers
 * fall back to deterministic logic.
 */
export async function chatStructured<T>(
  schema: z.ZodType<T>,
  opts: ChatOptions
): Promise<T | null> {
  let text: string | null;
  try {
    text = await chat({
      ...opts,
      json: true,
      // Headroom for reasoning models, whose thinking tokens count against the
      // limit: at 1200 they regularly cut the JSON off mid-object.
      maxTokens: opts.maxTokens ?? 4000,
    });
  } catch (err) {
    // The LLM is an enhancer: a rate limit or outage must not fail the scan.
    console.warn("[llm] request failed, using deterministic logic:", (err as Error).message);
    return null;
  }
  if (!text) return null;

  const json = extractJson(text);
  if (!json) return null;
  const parsed = schema.safeParse(json);
  return parsed.success ? parsed.data : null;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // tolerate code-fenced JSON
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        return JSON.parse(match[1].trim());
      } catch {
        return null;
      }
    }
    return null;
  }
}