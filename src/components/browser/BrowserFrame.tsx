"use client";

import { useState } from "react";
import type { BrowserState, PatternType } from "@/lib/types";
import { BrowserToolbar } from "./BrowserToolbar";
import { PagePreview } from "./PagePreview";

function normalizeUrl(u: string): string {
  const t = u.trim();
  if (!t || t === "about:blank") return "about:blank";
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export function BrowserFrame({
  browser,
  onElementClick,
  header,
}: {
  browser: BrowserState;
  onElementClick?: (pattern: PatternType) => void;
  header?: React.ReactNode;
}) {
  // Paste-a-URL navigation: a local override wins only while the parent's url is the one it
  // was made on. When the agent moves to a new page, the override expires by itself.
  const [override, setOverride] = useState<{ on: string; url: string } | null>(null);
  const effUrl = override && override.on === browser.url ? override.url : browser.url;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {header}
      <BrowserToolbar key={effUrl} url={effUrl} onNavigate={(u) => setOverride({ on: browser.url, url: normalizeUrl(u) })} />
      <div className="max-h-[520px] overflow-y-auto">
        <PagePreview browser={{ ...browser, url: effUrl }} onElementClick={onElementClick} />
      </div>
    </div>
  );
}