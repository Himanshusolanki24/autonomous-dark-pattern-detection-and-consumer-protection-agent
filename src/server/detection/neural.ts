// =============================================================================
// server/detection/neural.ts
// Neural detector. Each sentence on the page goes through a sentence-embedding
// transformer (all-MiniLM-L6-v2, run in-process with ONNX) and then through a
// classification head trained on the ec-darkpattern dataset
// (scripts/train-neural.ts -> neural-head.json). The heuristics need the exact
// wording; this recognises the same trick however it is worded.
//
// Like the LLM client this is an enhancer: if the model cannot be loaded (no
// network on first run, unsupported platform) it returns [] and the scan goes on.
// The evidence is always a sentence taken from the page, never model output.
// =============================================================================

import type { PerceptionResult, DarkPatternDetection } from "@/types/agent";
import type { PatternType } from "@/types/database";
import { TAXONOMY, patternDefinition } from "./taxonomy";
import trainedHead from "./neural-head.json";

export const MODEL = "Xenova/all-MiniLM-L6-v2";

// ponytail: one fixed probability cut-off for every pattern. Raise it if false
// alarms show up; per-pattern cut-offs are the upgrade path.
export const NEURAL_THRESHOLD = 0.85;

// ponytail: at most this many sentences per page, in page order. Long pages are
// cut off; rank by position/visibility if that turns out to miss findings.
const MAX_SEGMENTS = 200;

export interface Head {
  labels: string[];
  weights: number[][];
  bias: number[];
}

export type Embed = (texts: string[]) => Promise<number[][] | null>;

type Extractor = (
  texts: string[],
  opts: { pooling: "mean"; normalize: boolean }
) => Promise<{ tolist(): number[][] }>;

let extractor: Promise<Extractor | null> | undefined;

function loadModel(): Promise<Extractor | null> {
  // ponytail: a failed load is remembered until the process restarts.
  return (extractor ??= import("@huggingface/transformers")
    .then((t) => t.pipeline("feature-extraction", MODEL, { dtype: "q8" }) as unknown as Promise<Extractor>)
    .catch((err) => {
      console.warn("[neural] model unavailable, skipping neural detection:", (err as Error).message);
      return null;
    }));
}

/** Unit-length sentence embeddings, or null when the model is unavailable. */
export const embedTexts: Embed = async (texts) => {
  const model = await loadModel();
  if (!model) return null;
  return (await model(texts, { pooling: "mean", normalize: true })).tolist();
};

/** The page as short sentences: visible text split on punctuation, plus element labels. */
export function segments(perception: PerceptionResult): string[] {
  const parts = [
    ...perception.visibleText.split(/(?<=[.!?])\s+|\s+[—–|•·]\s+/),
    ...perception.elements.map((e) => e.text || e.ariaLabel || ""),
  ]
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 8 && s.length <= 200);
  return [...new Set(parts)].slice(0, MAX_SEGMENTS);
}

function softmax(z: number[]): number[] {
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
}

const isPattern = (label: string): label is PatternType => TAXONOMY.some((t) => t.type === label);

/**
 * One finding per pattern: the sentence the head is most sure about, if it
 * clears the threshold. Labels outside the taxonomy (benign, social_proof) are
 * predicted but never reported.
 */
export async function neuralClassify(
  perception: PerceptionResult,
  embed: Embed = embedTexts,
  head: Head = trainedHead
): Promise<DarkPatternDetection[]> {
  const sentences = segments(perception);
  if (sentences.length === 0) return [];

  let vectors: number[][] | null;
  try {
    vectors = await embed(sentences);
  } catch (err) {
    console.warn("[neural] inference failed, skipping neural detection:", (err as Error).message);
    return [];
  }
  if (!vectors) return [];

  const best = new Map<PatternType, { sentence: string; p: number }>();
  vectors.forEach((v, si) => {
    const probs = softmax(head.weights.map((w, c) => w.reduce((s, x, i) => s + x * v[i], head.bias[c])));
    const p = Math.max(...probs);
    const label = head.labels[probs.indexOf(p)];
    if (isPattern(label) && p >= NEURAL_THRESHOLD && p > (best.get(label)?.p ?? 0)) {
      best.set(label, { sentence: sentences[si], p });
    }
  });

  return [...best].map(([type, hit]) => ({
    patternType: type,
    severity: patternDefinition(type).defaultSeverity,
    confidence: Math.round(Math.min(0.99, hit.p) * 100) / 100,
    elementText: hit.sentence,
    elementRole: "text",
    explanation: `Neural classifier: this wording reads as ${patternDefinition(type).label} (${Math.round(hit.p * 100)}% sure).`,
  }));
}
