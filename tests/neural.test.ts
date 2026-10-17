import { describe, it, expect } from "vitest";
import { neuralClassify, segments, type Embed, type Head } from "@/server/detection/neural";
import type { PerceptionResult } from "@/types/agent";

const page: PerceptionResult = {
  url: "https://shop.test/item",
  title: "Item",
  visibleText: "Welcome back to the shop. Hurry, this deal is gone in 10 minutes! Read our returns policy.",
  elements: [],
  pageState: "unknown",
};

// A fake 2-number embedding: [urgent, calm]. No model is downloaded in tests.
const embed: Embed = async (texts) => texts.map((t) => (t.includes("Hurry") ? [1, 0] : [0, 1]));
const head: Head = {
  labels: ["benign", "false_urgency", "social_proof"],
  weights: [[0, 6], [6, 0], [0, 0]],
  bias: [0, 0, 0],
};

describe("neuralClassify", () => {
  it("splits the page into sentences", () => {
    expect(segments(page)).toEqual([
      "Welcome back to the shop.",
      "Hurry, this deal is gone in 10 minutes!",
      "Read our returns policy.",
    ]);
  });

  it("reports the sentence the head is sure about, quoted from the page", async () => {
    const out = await neuralClassify(page, embed, head);
    expect(out).toHaveLength(1);
    expect(out[0].patternType).toBe("false_urgency");
    expect(out[0].elementText).toBe("Hurry, this deal is gone in 10 minutes!");
  });

  it("never reports labels outside the taxonomy, or anything below the threshold", async () => {
    const socialOnly: Head = { ...head, labels: ["benign", "social_proof", "false_urgency"] };
    expect(await neuralClassify(page, embed, socialOnly)).toEqual([]);
    const unsure: Head = { ...head, weights: [[0, 1], [1, 0], [0, 0]] };
    expect(await neuralClassify(page, embed, unsure)).toEqual([]);
  });

  it("returns nothing when the model is unavailable or fails", async () => {
    expect(await neuralClassify(page, async () => null, head)).toEqual([]);
    expect(await neuralClassify(page, async () => { throw new Error("boom"); }, head)).toEqual([]);
  });
});
