// =============================================================================
// lib/browser/security.ts
// Playwright session guardrails: timeouts + navigation/action limits.
// Webpage content is untrusted; we never evaluate arbitrary JS from an LLM.
// =============================================================================

export const BROWSER_LIMITS = {
  navigationTimeoutMs: 30_000,
  actionTimeoutMs: 10_000,
  maxNavigations: 20,
  maxTotalActions: Number(process.env.AGENT_MAX_ACTIONS ?? 25),
} as const;

export interface NavigationGuard {
  navigationCount: number;
  navigationLimit: number;
}

export function canNavigate(guard: NavigationGuard): boolean {
  return guard.navigationCount < guard.navigationLimit;
}

/**
 * Executes trusted page.evaluate() only. This function is the ONLY place
 * arbitrary JS touches the page, and it is project-owned — never LLM-owned.
 */
export async function evaluateTrusted<T>(
  page: import("playwright").Page,
  fn: () => T
): Promise<T> {
  return page.evaluate(fn);
}