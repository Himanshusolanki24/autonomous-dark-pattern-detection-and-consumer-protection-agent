"use client";

import type { BrowserState, PatternType } from "@/lib/types";
import { BrowserToolbar } from "./BrowserToolbar";
import { PagePreview } from "./PagePreview";

export function BrowserFrame({
  browser,
  onElementClick,
  header,
}: {
  browser: BrowserState;
  onElementClick?: (pattern: PatternType) => void;
  header?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      {header}
      <BrowserToolbar url={browser.url} />
      <div className="max-h-[520px] overflow-y-auto">
        <PagePreview browser={browser} onElementClick={onElementClick} />
      </div>
    </div>
  );
}