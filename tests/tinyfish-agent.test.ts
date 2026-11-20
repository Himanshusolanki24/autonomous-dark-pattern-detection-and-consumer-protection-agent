import { describe, it, expect } from "vitest";
import { classifyPage } from "@/server/detection/classifier";

describe("TinyFish agent report classification", () => {
  it("classifies agent completion text for dark patterns", async () => {
    const reportText = "The page had a forced continuity trap that renews automatically unless cancelled, and a retention offer keep my benefits.";
    const result = await classifyPage(
      {
        url: "https://example.com/cancellation",
        title: "TinyFish agent report",
        visibleText: reportText,
        elements: [],
        pageState: "unknown",
      },
      { useLLM: false }
    );

    expect(result.detections.length).toBeGreaterThan(0);
    const types = result.detections.map((d) => d.patternType);
    expect(types).toContain("forced_continuity");
  });
});
