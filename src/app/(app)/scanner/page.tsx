"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, CircleAlert, Globe, Loader2, ScanSearch, ShieldCheck } from "lucide-react";
import { scanUrl, type ScanResult } from "@/lib/services/scannerService";
import { searchPages, tinyfishStatus, type SearchHit, type TinyFishCall } from "@/lib/services/tinyfishService";
import { TinyFishActivity } from "@/components/tinyfish/TinyFishActivity";
import { demoTargetUrl } from "@/lib/api";
import { PATTERN_LABELS } from "@/lib/constants";
import { cn, hostnameOf } from "@/lib/utils";
import type { DarkPattern } from "@/lib/types";
import { LiveShot } from "@/components/browser/PagePreview";
import { EvidenceDrawer } from "@/components/scanner/EvidenceDrawer";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Button } from "@/components/ui/button";
import { Marker, PageHeader, Window } from "@/components/ui/case";

type Phase = "idle" | "searching" | "picking" | "scanning" | "done" | "error";

/** Typed text with no dot and no scheme is a service name, not an address: search for it. */
function looksLikeName(raw: string): boolean {
  const t = raw.trim();
  return !!t && !t.includes(".") && !/^https?:\/\//i.test(t) && !/^localhost\b/i.test(t);
}

const STEPS = ["Opening the page", "Reading buttons and text", "Checking for known traps", "Writing up the verdict"];

const VERDICT: Record<string, { word: string; tone: string; line: string }> = {
  critical: { word: "Critical risk", tone: "text-red-600", line: "This page works hard to keep you paying." },
  high: { word: "High risk", tone: "text-red-600", line: "This page uses tricks to keep you subscribed." },
  medium: { word: "Some risk", tone: "text-amber-600", line: "A few patterns here deserve a second look." },
  low: { word: "Low risk", tone: "text-emerald-700", line: "Mostly straightforward, with minor nudges." },
};

const SEVERITY_TONE: Record<string, string> = {
  critical: "text-red-700 bg-red-50",
  high: "text-red-700 bg-red-50",
  medium: "text-amber-700 bg-amber-50",
  low: "text-zinc-600 bg-zinc-100",
};

function toUrl(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    return new URL(withScheme).toString();
  } catch {
    return null;
  }
}

function Finding({ pattern, index, onEvidence }: { pattern: DarkPattern; index: number; onEvidence: () => void }) {
  const [open, setOpen] = useState(false);
  const delay = 0.35 + index * 0.15;
  return (
    <motion.li
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 26, delay: delay - 0.2 }}
      className="border-t border-border py-5 first:border-t-0 first:pt-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[17px] font-semibold">
          <Marker delay={delay}>{PATTERN_LABELS[pattern.type] ?? pattern.type}</Marker>
        </h3>
        <span className={cn("shrink-0 rounded-md px-2 py-0.5 text-[12px] font-medium capitalize", SEVERITY_TONE[pattern.severity])}>
          {pattern.severity}
        </span>
      </div>
      {/* The scanner reports "Detected element" when the trap is in page text rather than one element. */}
      <p className="mt-2 text-[13.5px] text-zinc-500">
        {pattern.element && pattern.element !== "Detected element" ? (
          <>
            Found on: <span className="font-medium text-foreground">“{pattern.element}”</span>
          </>
        ) : (
          "Found in the page wording"
        )}
      </p>
      <ConfidenceBar confidence={pattern.confidence} tone="brand" className="mt-3" />
      <div className="mt-3 flex gap-4 text-[13px] font-medium">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Why it’s a trap
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEvidence}
          className="text-zinc-500 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          See evidence
        </button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden text-[13.5px] leading-relaxed text-zinc-600"
          >
            <span className="block pt-3">{pattern.explanation}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Scanner() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [evidence, setEvidence] = useState<DarkPattern | null>(null);
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searchCalls, setSearchCalls] = useState<TinyFishCall[]>([]);
  const [errorText, setErrorText] = useState<string | null>(null);
  // With TinyFish on, the test site is the public deploy: its cloud can't open localhost.
  const [testSite, setTestSite] = useState<string | null>(null);
  useEffect(() => {
    tinyfishStatus()
      .then((s) => setTestSite(s.enabled ? s.demoUrl : null))
      .catch(() => {});
  }, []);
  const started = useRef(false);

  const analyze = async (url: string) => {
    setPhase("scanning");
    setTarget(url);
    setInput(url);
    setResult(null);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    try {
      setResult(await scanUrl(url));
      setPhase("done");
    } catch {
      setErrorText(null);
      setPhase("error");
    } finally {
      clearInterval(timer);
    }
  };

  // Deep link from the overview: /scanner?url=… starts straight away.
  useEffect(() => {
    const url = params.get("url");
    if (url && !started.current) {
      started.current = true;
      void analyze(url);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const findPages = async (name: string) => {
    setPhase("searching");
    setResult(null);
    setHits([]);
    setSearchCalls([]);
    try {
      const res = await searchPages(name);
      setHits(res.results);
      setSearchCalls(res.tinyfish);
      setPhase("picking");
    } catch (err) {
      setErrorText((err as Error).message);
      setPhase("error");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (looksLikeName(input)) {
      setInputError(null);
      void findPages(input.trim());
      return;
    }
    const url = toUrl(input);
    if (!url) {
      setInputError(input.trim() ? "That doesn’t look like a web address." : "Paste a page address first.");
      return;
    }
    setInputError(null);
    void analyze(url);
  };

  const verdict = result ? VERDICT[result.risk.overall] ?? VERDICT.medium : null;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Scan a page"
        lede="Read-only: TrapKiller looks at the page and reports what it finds. It never clicks anything here."
      />

      <form onSubmit={submit} noValidate className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Page address</span>
          <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setInputError(null);
            }}
            disabled={phase === "scanning" || phase === "searching"}
            placeholder="https://example.com/account, or just a name like StreamVault"
            aria-invalid={!!inputError}
            aria-describedby={inputError ? "scan-error" : undefined}
            className={cn(
              "h-12 w-full rounded-xl border bg-surface pl-11 pr-4 font-mono text-[14px] placeholder:font-sans placeholder:text-zinc-400 focus:outline-none focus:ring-4 disabled:opacity-60",
              inputError ? "border-red-400 focus:ring-red-200" : "border-border-strong focus:border-brand focus:ring-brand/15"
            )}
          />
        </label>
        <Button type="submit" size="lg" disabled={phase === "scanning" || phase === "searching"} className="h-12 rounded-xl px-6">
          {phase === "scanning" || phase === "searching" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ScanSearch className="h-4 w-4" aria-hidden="true" />}
          {phase === "scanning" ? "Scanning…" : phase === "searching" ? "Searching…" : looksLikeName(input) ? "Find pages" : "Scan page"}
        </Button>
      </form>
      {inputError && (
        <p id="scan-error" role="alert" className="-mt-6 text-[13px] text-red-600">
          {inputError}
        </p>
      )}

      {phase === "idle" && (
        <div className="rounded-2xl border border-dashed border-border-strong px-6 py-14 text-center">
          <p className="font-display text-[22px] font-bold">Nothing scanned yet</p>
          <p className="mx-auto mt-2 max-w-md text-[14px] text-zinc-500">
            Try it on our StreamVault test site. It is built with the same tricks real subscription pages use.
          </p>
          <Button variant="outline" className="mt-5" onClick={() => void analyze(testSite ?? demoTargetUrl())}>
            Scan the test site
          </Button>
        </div>
      )}

      {phase === "searching" && (
        <p className="flex items-center gap-2 text-[14px] text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> TinyFish Search is looking for “{input.trim()}”…
        </p>
      )}

      {phase === "picking" && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <h2 className="text-[15px] font-semibold">Which page should we scan?</h2>
            <p className="mt-1 text-[13.5px] text-zinc-500">Top results from TinyFish Search. Nothing is scanned until you pick one.</p>
            {hits.length === 0 ? (
              <p className="mt-4 text-[14px] text-zinc-600">No pages found. Try another name, or paste the address.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {hits.map((h) => (
                  <li key={h.url}>
                    <button
                      type="button"
                      onClick={() => void analyze(h.url)}
                      className="w-full rounded-xl border border-border bg-surface p-4 text-left transition hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <p className="text-[12px] text-zinc-500">{h.site}</p>
                      <p className="mt-0.5 font-semibold">{h.title}</p>
                      <p className="mt-1 line-clamp-2 text-[13px] text-zinc-600">{h.snippet}</p>
                      <p className="mt-1 truncate font-mono text-[11.5px] text-brand">{h.url}</p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <TinyFishActivity calls={searchCalls} />
        </div>
      )}

      {phase === "error" && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-800">{errorText ? "The search didn’t work" : "The page couldn’t be scanned"}</p>
            <p className="mt-1 text-[14px] text-red-700">
              {errorText ?? "Check the address opens in your browser, then try again. Pages behind a login can’t be scanned yet."}
            </p>
          </div>
        </div>
      )}

      {(phase === "scanning" || phase === "done") && target && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* The evidence: the real page, rendered by the agent's browser */}
          <Window
            url={target}
            right={
              phase === "scanning" ? (
                <span className="flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> live
                </span>
              ) : null
            }
          >
            <div className="max-h-[620px] overflow-y-auto">
              <LiveShot url={target} isScanning={phase === "scanning"} />
            </div>
          </Window>

          {/* The verdict */}
          <div aria-live="polite">
            {phase === "scanning" ? (
              <ol className="space-y-4 pt-2">
                {STEPS.map((label, i) => (
                  <li key={label} className={cn("flex items-center gap-3 text-[15px]", i > step ? "text-zinc-400" : "text-foreground")}>
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold",
                        i < step ? "bg-foreground text-white" : i === step ? "bg-marker text-foreground" : "bg-zinc-100"
                      )}
                    >
                      {i + 1}
                    </span>
                    {label}
                    {i === step && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            ) : (
              result &&
              verdict && (
                <>
                  <p className="text-[13px] text-zinc-500">{result.perception.title || hostnameOf(result.url)}</p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={cn("font-display mt-1 text-[44px] font-bold leading-none", verdict.tone)}
                  >
                    {result.patterns.length === 0 ? "Looks clean" : verdict.word}
                  </motion.p>
                  <p className="mt-3 text-[15px] text-zinc-600">
                    {result.patterns.length === 0
                      ? "No traps above our detection threshold. This is an automated estimate, not a guarantee."
                      : `${result.patterns.length} trap${result.patterns.length === 1 ? "" : "s"} found. ${verdict.line}`}
                  </p>

                  <TinyFishActivity calls={[...searchCalls, ...result.tinyfish]} className="mt-6" />

                  {result.patterns.length > 0 ? (
                    <>
                      <ul className="mt-7">
                        {result.patterns.map((p, i) => (
                          <Finding key={p.id} pattern={p} index={i} onEvidence={() => setEvidence(p)} />
                        ))}
                      </ul>
                      <div className="mt-6 rounded-2xl bg-foreground p-5 text-white">
                        <p className="font-semibold">Want out of this subscription?</p>
                        <p className="mt-1 text-[13.5px] text-white/70">
                          The agent walks the cancel flow, skips the retention offers, and stops for your OK before the final click.
                        </p>
                        <Button
                          onClick={() => router.push(`/agent?url=${encodeURIComponent(result.url)}`)}
                          className="mt-4 w-full bg-marker text-foreground hover:bg-marker/90"
                        >
                          <Bot className="h-4 w-4" aria-hidden="true" />
                          Hand it to the agent
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="mt-6 flex items-center gap-2 text-[14px] text-emerald-700">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Nothing to cancel around here.
                    </p>
                  )}
                </>
              )
            )}
          </div>
        </div>
      )}

      <EvidenceDrawer isOpen={!!evidence} pattern={evidence} onClose={() => setEvidence(null)} />
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense>
      <Scanner />
    </Suspense>
  );
}
