"use client";

import { ArrowLeft, ArrowRight, RotateCw, Lock, X } from "lucide-react";

export function BrowserToolbar({
  url,
  onNavigate,
}: {
  url: string;
  onNavigate?: (url: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-zinc-50 px-3 py-2">
      <div className="flex items-center gap-0.5">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-40"
          aria-label="Back"
          disabled
        >
          <ArrowLeft className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-40"
          aria-label="Forward"
          disabled
        >
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
          aria-label="Reload"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5">
        <Lock className="h-3 w-3 shrink-0 text-emerald-500" />
        <input
          value={url}
          readOnly
          aria-label="Current page URL"
          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-zinc-600 focus:outline-none"
        />
        {url && (
          <button
            className="rounded p-0.5 text-zinc-400 hover:text-zinc-600"
            aria-label="Clear address"
            onClick={() => onNavigate?.("about:blank")}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <span className="hidden items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 sm:inline-flex">
        <Lock className="h-2.5 w-2.5" />
        Secure
      </span>
    </div>
  );
}