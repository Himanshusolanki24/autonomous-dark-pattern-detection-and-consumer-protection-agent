"use client";

import { useState } from "react";
import { ScanSearch, Loader2, CircleAlert } from "lucide-react";
import { ScannerInput } from "@/components/scanner/ScannerInput";
import { ScanProgressList } from "@/components/scanner/ScanProgressList";
import { RiskOverview } from "@/components/scanner/RiskOverview";
import { PatternCard } from "@/components/scanner/PatternCard";
import { scanUrl, type ScanResult } from "@/lib/services/scannerService";
import { Card, CardContent } from "@/components/ui/card";
import { mockScannerHistory } from "@/lib/data";
import { cn, severityTone } from "@/lib/utils";

type Phase = "idle" | "loading" | "done" | "error";

export default function ScannerPage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (url: string) => {
    setPhase("loading");
    setError(null);
    setResult(null);
    try {
      const res = await scanUrl(url);
      setResult(res);
      setPhase("done");
    } catch {
      setError("The page could not be analyzed. Please check the URL and try again.");
      setPhase("error");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dark Pattern Scanner</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyze a webpage for manipulative interface patterns.
        </p>
      </div>

      <ScannerInput onAnalyze={analyze} busy={phase === "loading"} />

      {phase === "idle" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft">
              <ScanSearch className="h-6 w-6 text-brand" />
            </span>
            <div>
              <p className="text-sm font-medium">Enter a URL to begin</p>
              <p className="mt-1 text-xs text-muted-foreground">
                The scanner reads the page structure and checks it against a
                dark-pattern taxonomy.
              </p>
            </div>
            <div className="mt-2 w-full max-w-md rounded-lg border border-border bg-zinc-50 p-3 text-left">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Recent scans
              </p>
              <ul className="mt-1.5 space-y-1">
                {mockScannerHistory.map((s) => (
                  <li
                    key={s.url}
                    className="flex items-center justify-between text-xs text-zinc-600"
                  >
                    <span className="font-mono">{s.url}</span>
                    <span className="text-zinc-400">
                      {s.patterns} patterns ·{" "}
                      <span className={cn("font-medium", severityTone(s.risk).text)}>
                        {s.risk}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "loading" && (
        <Card>
          <CardContent className="py-10">
            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-brand">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing webpage…
            </p>
            <ScanProgressList
              steps={[
                { label: "Reading page structure", status: "done" },
                { label: "Analyzing interactive elements", status: "done" },
                { label: "Checking dark-pattern taxonomy", status: "running" },
                { label: "Generating risk report", status: "pending" },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {phase === "error" && (
        <Card className="border-red-200">
          <CardContent className="flex items-center gap-3 py-8">
            <CircleAlert className="h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-medium text-red-700">Scan failed</p>
              <p className="text-xs text-red-600/80">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "done" && result && (
        <>
          <RiskOverview risk={result.risk} />

          {result.patterns.length === 0 ? (
            <Card>
              <CardContent className="py-14 text-center">
                <p className="text-sm font-medium">No dark patterns detected</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  This page appears to present its options plainly and honestly.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {result.patterns.map((p, i) => (
                <PatternCard key={p.id} pattern={p} index={i} />
              ))}
            </div>
          )}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleAlert className="h-3.5 w-3.5" />
            Analysis is an automated estimate and does not expose raw model output.
          </p>
        </>
      )}
    </div>
  );
}