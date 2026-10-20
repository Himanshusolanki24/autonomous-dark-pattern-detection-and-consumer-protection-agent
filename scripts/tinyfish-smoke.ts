#!/usr/bin/env tsx
// =============================================================================
// scripts/tinyfish-smoke.ts
// Live check of all four TinyFish APIs against the public StreamVault test site.
// Uses real TinyFish credits: one call per API.
//
// Run: npm run tinyfish:smoke   (needs TINYFISH_API_KEY and TINYFISH_TARGET_URL in .env.local)
// =============================================================================

import { config } from "dotenv";
config({ path: ".env.local" });

import { chromium } from "playwright";
import {
  agentResultText,
  closeBrowserSession,
  createBrowserSession,
  fetchPages,
  readAgentEvents,
  runAgentStream,
  search,
  tinyfishEnabled,
} from "@/server/tinyfish/client";
import { classifyPage } from "@/server/detection/classifier";

const TARGET = process.env.TINYFISH_TARGET_URL ?? "";

async function check(name: string, fn: () => Promise<string>): Promise<boolean> {
  const t0 = Date.now();
  try {
    const detail = await fn();
    console.log(`PASS  ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s): ${detail}`);
    return true;
  } catch (err) {
    console.log(`FAIL  ${name} (${((Date.now() - t0) / 1000).toFixed(1)} s): ${(err as Error).message}`);
    return false;
  }
}

async function main() {
  if (!tinyfishEnabled() || !TARGET) {
    console.error("Set TINYFISH_API_KEY and TINYFISH_TARGET_URL in .env.local first.");
    process.exit(1);
  }
  console.log(`TinyFish smoke test against ${TARGET}\n`);

  const results = [
    await check("Search API", async () => {
      const hits = await search("Netflix cancel subscription account");
      if (hits.length === 0) throw new Error("no results");
      return `${hits.length} results, top: ${hits[0].url}`;
    }),

    await check("Fetch API → detector", async () => {
      const [page] = await fetchPages([TARGET]);
      if (!page?.text) throw new Error("no text returned");
      const found = await classifyPage(
        { url: page.finalUrl, title: page.title ?? "", visibleText: page.text, elements: [], pageState: "unknown" },
        { useLLM: false }
      );
      return `${page.text.length} chars; detector found: ${found.detections.map((d) => d.patternType).join(", ") || "nothing"}`;
    }),

    await check("Browser (Playwright over CDP)", async () => {
      const session = await createBrowserSession();
      try {
        const browser = await chromium.connectOverCDP(session.cdpUrl, { timeout: 30_000 });
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        await page.goto(TARGET, { waitUntil: "domcontentloaded" });
        const title = await page.title();
        const hasTrap = await page.getByText("Keep my benefits").count();
        await browser.close();
        return `session ${session.sessionId}, title "${title}", trap button found: ${hasTrap > 0}`;
      } finally {
        await closeBrowserSession(session.sessionId);
      }
    }),

    await check("Web Agent (run-sse)", async () => {
      const res = await runAgentStream(TARGET, "Read the plan name and the monthly price on this page. Do not click anything.");
      let runId = "";
      let streamed = false;
      let done: { status?: string; result?: unknown } | null = null;
      for await (const ev of readAgentEvents(res.body!)) {
        if (ev.run_id) runId = ev.run_id;
        if (ev.type === "STREAMING_URL") streamed = true;
        if (ev.type === "COMPLETE") done = ev;
      }
      if (done?.status !== "COMPLETED") throw new Error(`run ${runId} ended: ${done?.status ?? "no COMPLETE event"}`);
      return `run ${runId}, live view: ${streamed}, answer: ${agentResultText(done.result).replace(/\s+/g, " ").slice(0, 80)}`;
    }),
  ];

  const passed = results.filter(Boolean).length;
  console.log(`\n${passed}/${results.length} TinyFish APIs working`);
  process.exit(passed === results.length ? 0 : 1);
}

void main();
