#!/usr/bin/env tsx
// =============================================================================
// scripts/smoke-agent.ts
// End-to-end deterministic pipeline check against the self-hosted demo target
// (no Supabase, no LLM). Verifies perceive → classify → plan → act → verify.
//
// Run (with the backend dev server on :3001): npx tsx scripts/smoke-agent.ts
// =============================================================================

import { browserManager } from "@/lib/browser/manager";
import { perceive } from "@/lib/browser/perception";
import { classifyPage } from "@/lib/detection/classifier";
import { executeAction } from "@/lib/browser/actions";
import type { PerceptionResult } from "@/types/agent";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3001";

function plan(perception: PerceptionResult) {
  const EXPLICIT_CANCEL = [
    "yes, cancel",
    "cancel my subscription",
    "no thanks, cancel",
    "confirm cancellation",
    "confirm my cancellation",
    "cancel subscription",
  ];
  const CANCEL_NAV = ["cancel subscription", "cancel membership", "unsubscribe", "cancel my plan"];
  const RETENTION_TRAP = [
    "keep my benefits",
    "keep my plan",
    "i don't want to lose",
    "keep my premium",
    "pause my membership",
    "we have a special offer",
  ];

  const explicit = perception.elements.find((el) =>
    EXPLICIT_CANCEL.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m))
  );
  if (explicit) {
    return { type: "click" as const, target: explicit.text.slice(0, 100), reason: "explicit cancel" };
  }
  const nav = perception.elements.find(
    (el) =>
      CANCEL_NAV.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m)) &&
      !RETENTION_TRAP.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m))
  );
  if (nav) {
    return { type: "click" as const, target: nav.text.slice(0, 100), reason: "cancel nav" };
  }
  return { type: "scroll" as const, reason: "reveal options" };
}

async function main() {
  const sessionId = `smoke_${Date.now()}`;
  const browser = await browserManager.createSession(sessionId);
  let step = 0;
  let patternsFound = 0;

  try {
    await browser.page.goto(`${BASE}/demo-target/account`, { waitUntil: "domcontentloaded" });
    await browser.page.waitForTimeout(500);

    while (step < 12) {
      const perception = await perceive(browser.page);
      const result = await classifyPage(perception, { useLLM: false });
      patternsFound += result.detections.length;

      console.log(
        `[step ${step}] ${perception.pageState.padEnd(14)} ${perception.url}  risk=${result.overallRisk} patterns=${result.detections
          .map((d) => d.patternType)
          .join(",")}`
      );

      if (perception.pageState === "success") {
        console.log("\nSMOKE OK — cancellation confirmed. Verified evidence:");
        console.log(`  ${perception.title} · ${perception.visibleText.slice(0, 90)}`);
        console.log(`  dark patterns surfaced across flow: ${patternsFound}`);
        process.exitCode = 0;
        return;
      }

      const action = plan(perception);
      console.log(`  -> ${action.type} "${action.target ?? ""}" (${action.reason})`);
      await executeAction(browser.page, action);
      await browser.page.waitForTimeout(400);
      step++;
    }

    console.error("SMOKE FAIL — did not reach the success page within the step budget.");
    process.exitCode = 1;
  } finally {
    await browserManager.destroySession(sessionId, "smoke_done");
    process.exit(process.exitCode ?? 0);
  }
}

main().catch((err) => {
  console.error("SMOKE FAIL", err);
  process.exitCode = 1;
});