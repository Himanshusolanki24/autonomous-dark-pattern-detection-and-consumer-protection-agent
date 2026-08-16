"use client";

import { useState } from "react";
import { ScanLine, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeUrl } from "@/lib/utils";

export function ScannerInput({
  onAnalyze,
  busy,
}: {
  onAnalyze: (url: string) => void;
  busy?: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim() && !busy) onAnalyze(normalizeUrl(value));
      }}
      className="flex flex-col gap-2 sm:flex-row"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border-strong bg-surface px-3 shadow-sm">
        <ScanLine className="h-4 w-4 shrink-0 text-zinc-400" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://example.com"
          aria-label="URL to analyze"
          className="border-0 bg-transparent px-0 shadow-none focus-visible:outline-none"
          type="url"
        />
      </div>
      <Button type="submit" disabled={busy || !value.trim()} className="sm:w-44">
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          "Analyze Page"
        )}
      </Button>
    </form>
  );
}