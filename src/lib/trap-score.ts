// Trap score: one 0-100 number for how hard a site makes it to leave.
// It is our own yardstick, not an industry standard. The three parts are kept
// separate so the page can show where a score comes from.

export type Severity = "low" | "medium" | "high" | "critical";

const SEVERITY_POINTS: Record<Severity, number> = { low: 5, medium: 10, high: 20, critical: 30 };

export interface TrapScore {
  score: number;
  level: "low" | "medium" | "high";
  parts: {
    /** Dark patterns found, weighted by severity. Up to 60. */
    patterns: number;
    /** 10 for every click beyond the first that cancelling takes. Up to 30. */
    exit: number;
    /** Share of cancellation attempts that did not end verified. Up to 10. */
    failures: number;
  };
}

export function trapScore(input: {
  severities: string[];
  /** Clicks on the shortest known route to a cancelled page; null when never measured. */
  cancelClicks: number | null;
  cancelRuns: number;
  verifiedRuns: number;
}): TrapScore {
  const patterns = Math.min(
    60,
    input.severities.reduce((sum, s) => sum + (SEVERITY_POINTS[s as Severity] ?? 0), 0)
  );
  const exit = input.cancelClicks ? Math.min(30, Math.max(0, input.cancelClicks - 1) * 10) : 0;
  const failures =
    input.cancelRuns > 0 ? Math.round((10 * (input.cancelRuns - input.verifiedRuns)) / input.cancelRuns) : 0;
  const score = patterns + exit + failures;
  return { score, level: score >= 50 ? "high" : score >= 20 ? "medium" : "low", parts: { patterns, exit, failures } };
}
