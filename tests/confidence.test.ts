import { describe, it, expect } from "vitest";
import {
  confidencePct,
  confidenceTier,
  CONFIDENCE_TIER_LABEL,
} from "@/lib/confidence";

describe("confidencePct", () => {
  it("converts the canonical 0–1 scale to integer percent", () => {
    expect(confidencePct(0)).toBe(0);
    expect(confidencePct(0.87)).toBe(87);
    expect(confidencePct(1)).toBe(100);
  });

  it("rounds like the bar always has", () => {
    expect(confidencePct(0.555)).toBe(56);
  });

  it("clamps runaway values into 0–100", () => {
    expect(confidencePct(1.5)).toBe(100);
    expect(confidencePct(-0.2)).toBe(0);
  });
});

describe("confidenceTier", () => {
  it("labels ≥0.8 as high, ≥0.6 as medium, else low", () => {
    expect(confidenceTier(0.8)).toBe("high");
    expect(confidenceTier(0.94)).toBe("high");
    expect(confidenceTier(0.79)).toBe("medium");
    expect(confidenceTier(0.6)).toBe("medium");
    expect(confidenceTier(0.59)).toBe("low");
    expect(confidenceTier(0)).toBe("low");
  });

  it("keeps the scale in sync with backend confidences", () => {
    // Confirmshaming heuristic base confidence must read as High, not Low.
    expect(CONFIDENCE_TIER_LABEL[confidenceTier(0.72)]).toBe("Medium");
    // Roach motel boosted past one extra signal must read as High.
    expect(CONFIDENCE_TIER_LABEL[confidenceTier(0.7)]).toBe("Medium");
    expect(CONFIDENCE_TIER_LABEL[confidenceTier(0.85)]).toBe("High");
  });
});
