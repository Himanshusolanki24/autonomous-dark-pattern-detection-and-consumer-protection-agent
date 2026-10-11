import { describe, it, expect } from "vitest";
import { trapScore } from "@/lib/trap-score";

describe("trapScore", () => {
  it("is zero for a clean site", () => {
    expect(trapScore({ severities: [], cancelClicks: null, cancelRuns: 0, verifiedRuns: 0 })).toEqual({
      score: 0,
      level: "low",
      parts: { patterns: 0, exit: 0, failures: 0 },
    });
  });

  it("adds severity points, extra cancel clicks and failed attempts", () => {
    const s = trapScore({ severities: ["high", "medium", "low"], cancelClicks: 3, cancelRuns: 4, verifiedRuns: 3 });
    expect(s.parts).toEqual({ patterns: 35, exit: 20, failures: 3 });
    expect(s.score).toBe(58);
    expect(s.level).toBe("high");
  });

  it("does not charge for a one-click cancel and caps each part", () => {
    expect(trapScore({ severities: [], cancelClicks: 1, cancelRuns: 1, verifiedRuns: 1 }).score).toBe(0);
    const worst = trapScore({ severities: Array(9).fill("critical"), cancelClicks: 12, cancelRuns: 5, verifiedRuns: 0 });
    expect(worst.parts).toEqual({ patterns: 60, exit: 30, failures: 10 });
    expect(worst.score).toBe(100);
  });

  it("ignores severities it does not know", () => {
    expect(trapScore({ severities: ["weird"], cancelClicks: null, cancelRuns: 0, verifiedRuns: 0 }).score).toBe(0);
  });
});
