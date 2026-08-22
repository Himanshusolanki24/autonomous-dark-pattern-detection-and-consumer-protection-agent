"use client";

import { useEffect, useState } from "react";
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
  // Paste-a-URL navigation: local override wins until the parent (agent poll /
  // new session) pushes a fresh browser.url, which resets it.
  const [override, setOverride] = useState<string | null>(null);
  useEffect(() => setOverride(null), [browser.url]);
  const effUrl = override ?? browser.url;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {header}
      <BrowserToolbar url={effUrl} onNavigate={(u) => setOverride(normalizeUrl(u))} />
      <div className="max-h-[520px] overflow-y-auto">
        <PagePreview browser={{ ...browser, url: effUrl }} onElementClick={onElementClick} />
      </div>
    </div>
  );
}