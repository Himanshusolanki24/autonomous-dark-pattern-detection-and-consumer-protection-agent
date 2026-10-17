// =============================================================================
// scripts/train-neural.ts
// Trains the classification head of the neural detector and writes it to
// src/server/detection/neural-head.json. Run with `npm run neural:train`.
//
// Data: ec-darkpattern (Yada et al., IEEE BigData 2022, Apache-2.0) — 2,356
// texts from shopping sites, half dark patterns, half not. Each text is turned
// into a 384-number embedding by the frozen MiniLM transformer; a softmax layer
// is trained on top with gradient descent and scored on a held-out 20%.
// =============================================================================

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { MODEL, embedTexts } from "@/server/detection/neural";

const DATASET = "https://raw.githubusercontent.com/yamanalab/ec-darkpattern/master/dataset/dataset.tsv";

// Dataset category -> the label the head predicts. Obstruction (27 texts),
// Sneaking (12) and Forced Action (4) are too few to learn from and are left out.
// ponytail: social_proof has no type in our taxonomy, so the detector learns it
// (so it is not mistaken for something else) but does not report it.
const LABEL_OF: Record<string, string> = {
  "Not Dark Pattern": "benign",
  Urgency: "false_urgency",
  Scarcity: "false_urgency",
  Misdirection: "misdirection",
  "Social Proof": "social_proof",
};

/** Small seeded generator so the split and the result are the same every run. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const softmax = (z: number[]) => {
  const max = Math.max(...z);
  const e = z.map((v) => Math.exp(v - max));
  const sum = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / sum);
};

async function main() {
  const tsv = await (await fetch(DATASET)).text();
  // A few texts span several lines, so match whole rows instead of splitting lines.
  const rows = [...tsv.matchAll(/^(\d+)\t([\s\S]*?)\t([01])\t([A-Za-z ]+)$/gm)]
    .map((m) => ({ text: m[2].replace(/\s+/g, " ").trim(), label: LABEL_OF[m[4]] }))
    .filter((r) => r.label && r.text.length > 0);
  const labels = [...new Set(Object.values(LABEL_OF))];
  console.log(`${rows.length} texts, labels: ${labels.join(", ")}`);

  const random = mulberry32(42);
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }

  const X: number[][] = [];
  for (let i = 0; i < rows.length; i += 64) {
    const batch = await embedTexts(rows.slice(i, i + 64).map((r) => r.text));
    if (!batch) throw new Error("The embedding model could not be loaded");
    X.push(...batch);
  }
  const y = rows.map((r) => labels.indexOf(r.label));
  const split = Math.floor(rows.length * 0.8);
  const dim = X[0].length;

  // Softmax regression, full-batch gradient descent with a little weight decay.
  const W = labels.map(() => new Array<number>(dim).fill(0));
  const b = labels.map(() => 0);
  const LR = 5;
  const DECAY = 1e-5;
  for (let epoch = 0; epoch < 1500; epoch++) {
    const gW = labels.map(() => new Array<number>(dim).fill(0));
    const gb = labels.map(() => 0);
    for (let n = 0; n < split; n++) {
      const p = softmax(W.map((w, c) => w.reduce((s, v, i) => s + v * X[n][i], b[c])));
      p.forEach((pc, c) => {
        const err = pc - (y[n] === c ? 1 : 0);
        gb[c] += err;
        for (let i = 0; i < dim; i++) gW[c][i] += err * X[n][i];
      });
    }
    labels.forEach((_, c) => {
      b[c] -= (LR * gb[c]) / split;
      for (let i = 0; i < dim; i++) W[c][i] -= LR * (gW[c][i] / split + DECAY * W[c][i]);
    });
  }

  // Held-out score: the 20% the head never saw.
  const predict = (x: number[]) => {
    const p = softmax(W.map((w, c) => w.reduce((s, v, i) => s + v * x[i], b[c])));
    return p.indexOf(Math.max(...p));
  };
  let correct = 0;
  const perLabel = labels.map(() => ({ total: 0, hit: 0 }));
  for (let n = split; n < rows.length; n++) {
    const hit = predict(X[n]) === y[n];
    correct += hit ? 1 : 0;
    perLabel[y[n]].total++;
    perLabel[y[n]].hit += hit ? 1 : 0;
  }
  const accuracy = correct / (rows.length - split);
  console.log(`held-out accuracy: ${(accuracy * 100).toFixed(1)}% on ${rows.length - split} texts`);
  perLabel.forEach((l, c) => console.log(`  ${labels[c]}: ${l.hit}/${l.total} recalled`));

  const round = (v: number) => Math.round(v * 1e4) / 1e4;
  writeFileSync(
    resolve("src/server/detection/neural-head.json"),
    JSON.stringify({
      model: MODEL,
      dataset: DATASET,
      trained: rows.slice(0, split).length,
      heldOut: rows.length - split,
      accuracy: round(accuracy),
      labels,
      weights: W.map((w) => w.map(round)),
      bias: b.map(round),
    })
  );
  console.log("wrote src/server/detection/neural-head.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
