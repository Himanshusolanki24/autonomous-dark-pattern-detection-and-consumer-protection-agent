// =============================================================================
// lib/browser/actions.ts
// SAFE action executors. Only these primitive actions are exposed to the agent.
// Text selectors are matched against the agent's target string with a strict,
// visible-element locator — never raw LLM-owned selectors.
// =============================================================================

import type { Page } from "playwright";
import type { AgentAction } from "@/types/agent";
import { BrowserAutomationError } from "@/lib/security/errors";

function visibleLocator(page: Page, target: string) {
  return page
    .getByText(target, { exact: false })
    .filter({ visible: true })
    .first();
}

async function safeClick(page: Page, target: string): Promise<void> {
  const el = visibleLocator(page, target);
  await el.scrollIntoViewIfNeeded({ timeout: 5000 });
  await el.click({ timeout: 8000 });
}

async function safeFill(page: Page, target: string, value: string): Promise<void> {
  const el = visibleLocator(page, target);
  await el.scrollIntoViewIfNeeded({ timeout: 5000 });
  await el.fill(value, { timeout: 8000 });
}

/**
 * Executes a single trusted action. Each action is independently bound by
 * timeouts; the runner enforces the global MAX_ACTIONS budget.
 */
export async function executeAction(page: Page, action: AgentAction): Promise<void> {
  switch (action.type) {
    case "click":
      if (!action.target) throw new BrowserAutomationError("click requires a target");
      await safeClick(page, action.target);
      return;
    case "fill":
      if (!action.target || action.value === undefined)
        throw new BrowserAutomationError("fill requires target and value");
      await safeFill(page, action.target, action.value);
      return;
    case "scroll":
      await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
      return;
    case "wait":
      await page.waitForTimeout(Math.min(Number(action.value ?? 800), 3000));
      return;
    case "navigate":
      throw new BrowserAutomationError(
        "navigate must be handled by the navigation layer, not the action executor"
      );
    case "request_approval":
    case "complete":
    case "fail":
      // Terminal / gating actions — no browser work.
      return;
    default:
      throw new BrowserAutomationError(`Unknown action type: ${(action as { type: string }).type}`);
  }
}