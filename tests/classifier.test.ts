import { describe, it, expect } from "vitest";
import { applyLearning, classifyPage, heuristicClassify, isGrounded } from "@/server/detection/classifier";
import { overallRisk } from "@/server/detection/taxonomy";
import type { PerceptionResult } from "@/types/agent";

function perception(overrides: Partial<PerceptionResult> = {}): PerceptionResult {
  return {
    url: "https://demo.test/confirm",
    title: "Confirm cancellation",
    visibleText: "",
    elements: [],
    pageState: "confirmation",
    ...overrides,
  };
}

describe("heuristicClassify", () => {
  it("detects confirmshaming from guilt language", () => {
    const result = heuristicClassify(
      perception({
        visibleText: "Are you sure? We'd hate to see you go. You will lose access to premium.",
        elements: [{ role: "button", text: "I don't want to lose my benefits", tagName: "button", visible: true, box: { x: 0, y: 0, width: 10, height: 10 } }],
      })
    );
    const cs = result.find((d) => d.patternType === "confirmshaming");
    expect(cs).toBeDefined();
    expect(cs?.severity).toBe("high");
    expect(cs?.confidence).toBeGreaterThan(0.7);
  });

  it("detects forced continuity from auto-renew copy", () => {
    const result = heuristicClassify(
      perception({ visibleText: "Your plan renews automatically and your trial ends in 5 days." })
    );
    expect(result.some((d) => d.patternType === "forced_continuity")).toBe(true);
  });

  it("detects roach motel when cancel link is present but retention dominates", () => {
    const result = heuristicClassify(
      perception({
        visibleText: "Before you go: keep my premium. We have a special offer for you.",
        elements: [
          { role: "button", text: "Keep my benefits", tagName: "button", visible: true, box: { x: 0, y: 0, width: 10, height: 10 } },
          { role: "link", text: "Cancel subscription", tagName: "a", visible: true, box: { x: 0, y: 0, width: 10, height: 10 } },
        ],
      })
    );
    expect(result.some((d) => d.patternType === "roach_motel")).toBe(true);
  });

  it("returns empty for benign content", () => {
    const result = heuristicClassify(perception({ visibleText: "Thank you for your purchase." }));
    expect(result).toHaveLength(0);
  });
});

describe("overallRisk", () => {
  it("picks the highest severity", () => {
    expect(overallRisk([{ severity: "low" }, { severity: "critical" }])).toBe("critical");
    expect(overallRisk([{ severity: "medium" }])).toBe("medium");
    expect(overallRisk([])).toBe("low");
  });
});

describe("classifyPage (deterministic path, no LLM)", () => {
  it("falls back to heuristics when LLM is not configured", async () => {
    const result = await classifyPage(
      perception({ visibleText: "We'd hate to see you go. You will lose your benefits." }),
      { useLLM: false }
    );
    expect(result.overallRisk).toBe("high");
    expect(result.detections.length).toBeGreaterThan(0);
  });
});

describe("isGrounded (LLM hallucination gate)", () => {
  const page = perception({
    visibleText: "Only 2 seats  left!\nOffer ends tonight.",
    elements: [{ role: "button", text: "No thanks, I hate saving money", tagName: "button", visible: true, box: { x: 0, y: 0, width: 10, height: 10 } }],
  });

  it("keeps findings quoted verbatim from text or elements", () => {
    expect(isGrounded("only 2 seats left!", page)).toBe(true);
    expect(isGrounded("I hate saving money", page)).toBe(true);
  });

  it("drops findings whose evidence is not on the page", () => {
    expect(isGrounded("A hidden $9.99 fee is added at checkout", page)).toBe(false);
    expect(isGrounded("", page)).toBe(false);
  });
});

describe("applyLearning (reinforcement from human feedback)", () => {
  const page = perception({ visibleText: "Renews automatically. Members also get early access deals." });
  const found = heuristicClassify(page);

  it("drops a finding whose evidence was marked a false alarm", () => {
    expect(found.some((d) => d.patternType === "forced_continuity")).toBe(true);
    const out = applyLearning(found, [{ phrase: "renews automatically", patternType: "forced_continuity", value: -0.5 }], page);
    expect(out.some((d) => d.patternType === "forced_continuity")).toBe(false);
  });

  it("flags a confirmed phrase the heuristics do not know, only when it is on the page", () => {
    const learned = [
      { phrase: "early access deals", patternType: "nagging" as const, value: 0.75 },
      { phrase: "not on this page", patternType: "misdirection" as const, value: 1 },
    ];
    const out = applyLearning(found, learned, page);
    expect(out.find((d) => d.patternType === "nagging")?.elementText).toBe("early access deals");
    expect(out.some((d) => d.patternType === "misdirection")).toBe(false);
  });

  it("ignores values too weak to act on", () => {
    const weak = [
      { phrase: "renews automatically", patternType: "forced_continuity" as const, value: -0.2 },
      { phrase: "early access deals", patternType: "nagging" as const, value: 0.2 },
    ];
    expect(applyLearning(found, weak, page)).toEqual(found);
  });
});
