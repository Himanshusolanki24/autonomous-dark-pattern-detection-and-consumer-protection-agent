"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Lock, RotateCw, X } from "lucide-react";

export function BrowserToolbar({
  url,
  onNavigate,
}: {
  url: string;
  onNavigate?: (url: string) => void;
}) {
  // The parent keys this component by url, so a new page resets the field without an effect.
  const [inputValue, setInputValue] = useState(url || "");

  return (
    <div className="flex items-center gap-2 border-b border-border bg-zinc-50/80 px-3 py-2">
      <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
        <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
        <span className="h-2 w-2 rounded-full bg-[#28c840]" />
      </span>

      <div className="flex items-center gap-0.5">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 disabled:opacity-40"
          aria-label="Back"
          disabled
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700 disabled:opacity-40"
          aria-label="Forward"
          disabled
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200/70 hover:text-zinc-700"
          aria-label="Reload"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5">
        <Lock className="h-3 w-3 shrink-0 text-emerald-500" />
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onNavigate?.(inputValue);
            }
          }}
          aria-label="Current page URL"
          className="min-w-0 flex-1 bg-transparent font-mono text-[11.5px] text-zinc-600 focus:outline-none"
        />
        {inputValue && (
          <button
            className="rounded p-0.5 text-zinc-400 transition-colors hover:text-zinc-600"
            aria-label="Clear address"
            onClick={() => {
              setInputValue("");
              onNavigate?.("about:blank");
            }}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <span className="hidden items-center gap-1 rounded-full border border-emerald-200 bg-success-soft px-2 py-0.5 text-[9.5px] font-semibold text-emerald-700 sm:inline-flex">
        <Lock className="h-2.5 w-2.5" />
        Secure
      </span>
    </div>
  );
}
