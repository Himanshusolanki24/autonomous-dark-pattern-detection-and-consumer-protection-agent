// =============================================================================
// app/api/scanner/analyze/route.ts
// POST — read-only dark-pattern scan of a URL. No agent, no persistent session,
// no actions taken. Detections are stored against the user's account.
// =============================================================================

import { createClient } from "@/server/supabase/server";
import { api, jsonOk } from "@/server/api/handler";
import { requireUser } from "@/server/auth/guards";
import { parseOrThrow, scannerSchema } from "@/server/security/validation";
import { checkRateLimit } from "@/server/security/rate-limit";
import { validateTargetUrl } from "@/server/security/ssrf";
import { browserManager } from "@/server/browser/manager";
import { perceive } from "@/server/browser/perception";
import { classifyPage } from "@/server/detection/classifier";
import { MAX_VISIBLE_TEXT } from "@/server/browser/perception";
import {
  fetchPages,
  reachableFromCloud,
  tinyfishEnabled,
  type TinyFishCall,
} from "@/server/tinyfish/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req: Request) => {
  const user = await requireUser();
  checkRateLimit(user.id, "scanner");

  const body = parseOrThrow(scannerSchema, await req.json());
  const url = await validateTargetUrl(body.url);

  const scanId = `scan_${crypto.randomUUID()}`;
  const tinyfish: TinyFishCall[] = [];
  // TinyFish Fetch reads the same page as clean text while the browser loads it,
  // so traps hidden in text the visible page doesn't show still reach the detector.
  const fetched =
    tinyfishEnabled() && reachableFromCloud(url.toString())
      ? fetchPages([url.toString()], tinyfish).catch(() => [])
      : Promise.resolve([]);
  const browser = await browserManager.createSession(scanId, url.toString(), tinyfish);
  if (browser.via === "tinyfish") {
    tinyfish.push({ api: "browser", label: "Open the page in the cloud browser", ok: true, ms: 0, id: browser.cloudSessionId });
  }

  try {
    await browser.page.goto(url.toString(), { waitUntil: "domcontentloaded" });
    await browser.page.waitForTimeout(1200);

    const perception = await perceive(browser.page);
    const fetchedText = (await fetched).map((p) => p.text).join("\n").trim();
    if (fetchedText) {
      perception.visibleText = `${perception.visibleText}\n${fetchedText}`.slice(0, MAX_VISIBLE_TEXT * 2);
    }
    // Hand the preview a picture of the page we already have open.
    await browserManager.captureShot(browser.page, perception.url, url.toString());
    const result = await classifyPage(perception);

    // Persist read-only detections (nullable session_id) for the dashboard.
    if (result.detections.length > 0) {
      await (await createClient())
        .from("dark_pattern_detections")
        .insert(
          result.detections.map((d) => ({
            user_id: user.id,
            session_id: null,
            pattern_type: d.patternType,
            severity: d.severity,
            confidence: d.confidence,
            element_text: d.elementText ?? null,
            element_role: d.elementRole ?? null,
            explanation: d.explanation,
            source_url: perception.url,
            metadata: {},
          }))
        );
    }

    return jsonOk({
      url: perception.url,
      title: perception.title,
      overallRisk: result.overallRisk,
      patternsDetected: result.detections.length,
      browser: browser.via,
      tinyfish,
      detections: result.detections.map((d) => ({
        patternType: d.patternType,
        severity: d.severity,
        confidence: d.confidence,
        explanation: d.explanation,
        elementText: d.elementText ?? null,
        elementRole: d.elementRole ?? null,
      })),
    });
  } finally {
    await browserManager.destroySession(scanId, "scanner_done");
  }
});