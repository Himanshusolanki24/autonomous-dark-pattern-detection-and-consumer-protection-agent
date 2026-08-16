import { describe, it, expect } from "vitest";
import { classifyPage, heuristicClassify } from "@/lib/detection/classifier";
import { overallRisk } from "@/lib/detection/taxonomy";
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