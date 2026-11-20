// =============================================================================
// lib/browser/actions.ts
// SAFE action executors. Only these primitive actions are exposed to the agent.
// Text selectors are matched against the agent's target string with a strict,
// visible-element locator — never raw LLM-owned selectors.
// =============================================================================

import type { Page } from "playwright";
import type { AgentAction } from "@/types/agent";
import { BrowserAutomationError } from "@/server/security/errors";

async function visibleLocator(page: Page, target: string) {
  // 1. Prefer exact role-based button or link matching
  const button = page.getByRole("button", { name: target, exact: true }).filter({ visible: true }).first();
  if ((await button.count().catch(() => 0)) > 0) return button;

  const link = page.getByRole("link", { name: target, exact: true }).filter({ visible: true }).first();
  if ((await link.count().catch(() => 0)) > 0) return link;

  // 2. Prefer exact text match
  const exact = page.getByText(target, { exact: true }).filter({ visible: true }).first();
  if ((await exact.count().catch(() => 0)) > 0) return exact;

  // 3. Fall back to substring match
  return page
    .getByText(target, { exact: false })
    .filter({ visible: true })
    .first();
}

async function safeClick(page: Page, target: string): Promise<void> {
  const el = await visibleLocator(page, target);
  await el.scrollIntoViewIfNeeded({ timeout: 5000 });
  await el.click({ timeout: 8000 });
}

async function safeFill(page: Page, target: string, value: string): Promise<void> {
  const el = await visibleLocator(page, target);
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