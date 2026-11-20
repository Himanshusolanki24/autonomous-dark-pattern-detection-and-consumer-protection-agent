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
  critical: "border-red-200 bg-danger-soft text-red-700",
  high: "border-red-200 bg-danger-soft text-red-700",
  medium: "border-amber-200 bg-warning-soft text-amber-700",
  low: "border-border bg-zinc-50 text-zinc-600",
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
      className="py-5 first:pt-4 last:pb-4"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-[16px] font-semibold">
          <Marker delay={delay}>{PATTERN_LABELS[pattern.type] ?? pattern.type}</Marker>
        </h3>
        <span className={cn("shrink-0 rounded-full border px-2.5 py-0.5 text-[10.5px] font-semibold capitalize tracking-wide", SEVERITY_TONE[pattern.severity])}>
          {pattern.severity}
        </span>
      </div>
      {/* The scanner reports "Detected element" when the trap is in page text rather than one element. */}
      <p className="mt-2 text-[12.5px] text-zinc-500">
        {pattern.element && pattern.element !== "Detected element" ? (
          <>
            Found on: <span className="font-medium text-foreground">“{pattern.element}”</span>
          </>
        ) : (
          "Found in the page wording"
        )}
      </p>
      <ConfidenceBar confidence={pattern.confidence} tone="brand" className="mt-3" />
      <div className="mt-3 flex gap-4 text-[12.5px] font-medium">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-brand focus-visible:outline-none"
        >
          Why it’s a trap
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onEvidence}
          className="text-zinc-500 transition-colors hover:text-foreground focus-visible:outline-none"
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
            className="overflow-hidden text-[13px] leading-relaxed text-zinc-600"
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
  const busy = phase === "scanning" || phase === "searching";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Read-only scan"
        title="Scan a page"
        lede="Read-only: TrapKiller looks at the page and reports what it finds. It never clicks anything here."
      />

      {/* Scan console */}
      <div className="panel relative overflow-hidden p-4 sm:p-5">
        <span
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-40 w-40 rounded-full bg-brand/10 blur-3xl"
        />
        <div className="relative mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="eyebrow">Scan console</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-50 px-2.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-500">
            <ShieldCheck className="h-3 w-3 text-emerald-600" aria-hidden="true" />
            Nothing is clicked
          </span>
        </div>
        <form onSubmit={submit} noValidate className="relative flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Page address</span>
            <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError(null);
              }}
              disabled={busy}
              placeholder="https://example.com/account, or just a name like StreamVault"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "scan-error" : undefined}
              className={cn(
                "h-12 w-full rounded-xl border bg-surface pl-11 pr-4 font-mono text-[13.5px] shadow-[0_1px_2px_rgba(16,24,40,0.03)] placeholder:font-sans placeholder:text-zinc-400 focus:outline-none focus:ring-4 disabled:opacity-60",
                inputError ? "border-red-400 focus:ring-red-200" : "border-border-strong focus:border-brand focus:ring-brand/15"
              )}
            />
          </label>
          <Button type="submit" size="lg" disabled={busy} className="h-12 px-6">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ScanSearch className="h-4 w-4" aria-hidden="true" />}
            {phase === "scanning" ? "Scanning…" : phase === "searching" ? "Searching…" : looksLikeName(input) ? "Find pages" : "Scan page"}
          </Button>
        </form>
        {inputError && (
          <p id="scan-error" role="alert" className="relative mt-2 text-[12.5px] text-red-600">
            {inputError}
          </p>
        )}
        <p className="relative mt-2.5 text-[11.5px] text-zinc-400">
          Paste an address, or type a service name and TinyFish Search will find its cancel page.
        </p>
      </div>

      {phase === "idle" && (
        <div className="panel relative overflow-hidden px-6 py-14 text-center">
          <div aria-hidden="true" className="lab-grid-faint absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_40%,black,transparent)]" />
          <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <ScanSearch className="h-5 w-5" aria-hidden="true" />
            <span className="absolute inset-0 rounded-2xl border border-brand/20 animate-stage-pulse" />
          </div>
          <p className="font-display relative mt-4 text-[22px] font-bold">Nothing scanned yet</p>
          <p className="relative mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-zinc-500">
            Try it on our StreamVault test site. It is built with the same tricks real subscription pages use.
          </p>
          <Button variant="outline" className="relative mt-5" onClick={() => void analyze(testSite ?? demoTargetUrl())}>
            Scan the test site
          </Button>
        </div>
      )}

      {phase === "searching" && (
        <div className="panel flex items-center gap-3 p-5 text-[13.5px] text-zinc-600">
          <Loader2 className="h-4 w-4 animate-spin text-brand" aria-hidden="true" />
          <span>
            TinyFish Search is looking for <span className="font-mono text-foreground">“{input.trim()}”</span>…
          </span>
        </div>
      )}

      {phase === "picking" && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div>
            <h2 className="font-display text-[17px] font-semibold">Which page should we scan?</h2>
            <p className="mt-1 text-[12.5px] text-zinc-500">Top results from TinyFish Search. Nothing is scanned until you pick one.</p>
            {hits.length === 0 ? (
              <p className="mt-4 text-[13.5px] text-zinc-600">No pages found. Try another name, or paste the address.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {hits.map((h, i) => (
                  <motion.li
                    key={h.url}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => void analyze(h.url)}
                      className="panel panel-hover group w-full p-4 text-left focus-visible:outline-none"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">{h.site}</p>
                        <span className="text-[10.5px] font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100">
                          Scan this →
                        </span>
                      </div>
                      <p className="mt-1 text-[14px] font-semibold">{h.title}</p>
                      <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-zinc-600">{h.snippet}</p>
                      <p className="mt-1.5 truncate font-mono text-[11px] text-brand">{h.url}</p>
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
          <TinyFishActivity calls={searchCalls} />
        </div>
      )}

      {phase === "error" && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-danger-soft p-5">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold text-red-800">{errorText ? "The search didn’t work" : "The page couldn’t be scanned"}</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-red-700">
              {errorText ?? "Check the address opens in your browser, then try again. Pages behind a login can’t be scanned yet."}
            </p>
          </div>
        </div>
      )}

      {(phase === "scanning" || phase === "done") && target && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* The evidence: the real page, rendered by the agent's browser */}
          <div>
            <Window
              url={target}
              right={
                phase === "scanning" ? (
                  <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin text-brand" aria-hidden="true" /> live
                  </span>
                ) : null
              }
            >
              <div className="max-h-[620px] overflow-y-auto">
                <LiveShot url={target} isScanning={phase === "scanning"} />
              </div>
            </Window>
            <p className="mt-2 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
              <span className={cn("h-1.5 w-1.5 rounded-full", phase === "done" ? "bg-emerald-500" : "bg-brand animate-dot-pulse")} />
              {phase === "done" ? "Page rendered · read only" : "Agent browser at work"}
            </p>
          </div>

          {/* The verdict */}
          <div aria-live="polite">
            {phase === "scanning" ? (
              <div className="panel p-5">
                <div className="flex items-center justify-between">
                  <p className="eyebrow">Reading the page</p>
                  <span className="font-mono text-[10px] tabular-nums text-zinc-400">
                    {step + 1}/{STEPS.length}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                  <motion.div
                    className="h-full origin-left rounded-full bg-gradient-to-r from-brand to-signal"
                    initial={false}
                    animate={{ scaleX: (step + 1) / STEPS.length }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                    style={{ width: "100%" }}
                  />
                </div>
                <ol className="mt-5 space-y-4">
                  {STEPS.map((label, i) => (
                    <li key={label} className={cn("flex items-center gap-3 text-[13.5px]", i > step ? "text-zinc-400" : "text-foreground")}>
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold",
                          i < step ? "bg-foreground text-white" : i === step ? "bg-marker text-foreground" : "bg-zinc-100 text-zinc-500"
                        )}
                      >
                        {i + 1}
                      </span>
                      {label}
                      {i === step && <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" aria-hidden="true" />}
                    </li>
                  ))}
                </ol>
              </div>
            ) : (
              result &&
              verdict && (
                <>
                  <div className="panel relative overflow-hidden p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="eyebrow">Verdict</p>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-50 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-wide text-zinc-500">
                        {result.patterns.length} found
                      </span>
                    </div>
                    <p className="mt-3 truncate font-mono text-[11px] text-zinc-400">
                      {result.perception.title || hostnameOf(result.url)}
                    </p>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      className={cn("font-display mt-1 text-[42px] font-bold leading-none tracking-tight", verdict.tone)}
                    >
                      {result.patterns.length === 0 ? "Looks clean" : verdict.word}
                    </motion.p>
                    <p className="mt-3 text-[13.5px] leading-relaxed text-zinc-600">
                      {result.patterns.length === 0
                        ? "No traps above our detection threshold. This is an automated estimate, not a guarantee."
                        : `${result.patterns.length} trap${result.patterns.length === 1 ? "" : "s"} found. ${verdict.line}`}
                    </p>
                  </div>

                  <TinyFishActivity calls={[...searchCalls, ...result.tinyfish]} className="mt-4" />

                  {result.patterns.length > 0 ? (
                    <>
                      <div className="panel mt-4 overflow-hidden">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                          <h3 className="font-display text-[15px] font-semibold">Findings</h3>
                          <span className="font-mono text-[10px] uppercase tracking-wide text-zinc-400">Quoted from the page</span>
                        </div>
                        <ul className="divide-y divide-border px-5">
                          {result.patterns.map((p, i) => (
                            <Finding key={p.id} pattern={p} index={i} onEvidence={() => setEvidence(p)} />
                          ))}
                        </ul>
                      </div>
                      <div className="relative mt-4 overflow-hidden rounded-2xl bg-foreground p-5 text-white">
                        <div aria-hidden="true" className="lab-grid-dark absolute inset-0 opacity-50" />
                        <div className="relative">
                          <p className="font-display text-[16px] font-semibold">Want out of this subscription?</p>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-white/65">
                            The agent walks the cancel flow, skips the retention offers, and stops for your OK before the final click.
                          </p>
                          <Button
                            onClick={() => router.push(`/agent?url=${encodeURIComponent(result.url)}`)}
                            className="mt-4 w-full"
                            variant="marker"
                          >
                            <Bot className="h-4 w-4" aria-hidden="true" />
                            Hand it to the agent
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-success-soft px-4 py-3 text-[13px] text-emerald-700">
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
