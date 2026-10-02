// =============================================================================
// lib/browser/perception.ts
// Extracts a bounded, sanitized snapshot of the live page (the PERCEIVE step).
// Visible text is capped so we never ship a whole page to the LLM.
// =============================================================================

import type { Page } from "playwright";
import type { InteractiveElement, PerceptionResult } from "@/types/agent";
import { evaluateTrusted } from "./security";

export const MAX_VISIBLE_TEXT = 12_000;

interface RawSnapshot {
  title: string;
  url: string;
  text: string;
  elements: {
    role: string;
    text: string;
    tagName: string;
    href: string | null;
    ariaLabel: string | null;
    visible: boolean;
    box: { x: number; y: number; width: number; height: number } | null;
  }[];
}

const SNAPSHOT_SCRIPT = () => {
  const text = (document.body?.innerText ?? "").replace(/\s+/g, " ").trim();
  const candidates = Array.from(
    document.querySelectorAll("button, a[href], input, select, textarea, [role='button']")
  );

  const elements = candidates
    .map((el) => {
      const rect = el.getBoundingClientRect();
      const isVisible =
        rect.width > 0 &&
        rect.height > 0 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth;
      const style = window.getComputedStyle(el);
      const text = (el as HTMLElement).innerText?.trim() ?? (el as HTMLInputElement).value ?? "";
      return {
        role: el.getAttribute("role") ?? el.tagName.toLowerCase(),
        text: text.slice(0, 200),
        tagName: el.tagName.toLowerCase(),
        href: (el as HTMLAnchorElement).getAttribute?.("href") ?? null,
        ariaLabel: el.getAttribute("aria-label"),
        visible: isVisible && style.visibility !== "hidden" && style.display !== "none",
        box: isVisible
          ? {
              x: rect.x / window.innerWidth,
              y: rect.y / window.innerHeight,
              width: rect.width,
              height: rect.height,
            }
          : null,
      };
    })
    .filter((e) => e.visible && (e.text || e.ariaLabel));

  return { title: document.title, url: window.location.href, text, elements };
};

export async function perceive(page: Page): Promise<PerceptionResult> {
  const raw = await evaluateTrusted<RawSnapshot>(page, SNAPSHOT_SCRIPT);

  const elements: InteractiveElement[] = raw.elements.slice(0, 80).map((e) => ({
    role: e.role,
    text: e.text.slice(0, 120),
    tagName: e.tagName,
    href: e.href ?? undefined,
    ariaLabel: e.ariaLabel ?? undefined,
    visible: e.visible,
    box: e.box ?? { x: 0, y: 0, width: 0, height: 0 },
  }));

  return {
    url: raw.url,
    title: raw.title.slice(0, 200),
    visibleText: raw.text.slice(0, MAX_VISIBLE_TEXT),
    elements,
    pageState: inferPageState(raw),
  };
}

/** Cheap page-state classifier driving the demo-target flow. */
function inferPageState(raw: RawSnapshot): PerceptionResult["pageState"] {
  const t = `${raw.title} ${raw.text}`.toLowerCase();
  if (t.includes("success") || t.includes("cancelled") || t.includes("your subscription is cancelled")) {
    return "success";
  }
  if (t.includes("confirm") || t.includes("are you sure") || t.includes("final step")) {
    return "confirmation";
  }
  if (t.includes("select a plan") || t.includes("what would you like")) {
    return "plan_selection";
  }
  return "unknown";
}