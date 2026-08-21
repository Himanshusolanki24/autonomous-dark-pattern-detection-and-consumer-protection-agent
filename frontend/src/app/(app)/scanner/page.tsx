"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Globe,
  Shield,
  Eye,
  ShieldOff,
  CircleAlert,
  Loader2,
  X,
  ExternalLink,
  Bot,
} from "lucide-react";
import { scanUrl, type ScanResult } from "@/lib/services/scannerService";
import { startCancellation } from "@/lib/services/taskService";
import { EvidenceDrawer } from "@/components/scanner/EvidenceDrawer";
import { AgentPipelineBottom } from "@/components/scanner/AgentPipelineBottom";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Button } from "@/components/ui/button";
import { PATTERN_LABELS } from "@/lib/constants";
import { cn, normalizeUrl, hostnameOf, severityTone } from "@/lib/utils";
import type { DarkPattern } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase = "idle" | "scanning" | "done" | "error";

const SCAN_STEPS = [
  { label: "Fetching page structure",         key: "fetch"   },
  { label: "Analyzing interactive elements",  key: "analyze" },
  { label: "Checking dark-pattern taxonomy",  key: "detect"  },
  { label: "Generating risk report",          key: "report"  },
] as const;

// ── URL input ─────────────────────────────────────────────────────────────────

function UrlInput({
  onScan,
  busy,
}: {
  onScan: (url: string) => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a URL.");
      inputRef.current?.focus();
      return;
    }
    let url = trimmed;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      new URL(url);
    } catch {
      setError("That doesn't look like a valid URL.");
      inputRef.current?.focus();
      return;
    }
    onScan(url);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Globe
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(null); }}
            placeholder="https://example.com/account"
            disabled={busy}
            aria-label="Website URL to investigate"
            aria-describedby={error ? "url-error" : undefined}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:bg-zinc-50",
              error ? "border-red-300 focus:ring-red-400" : "border-zinc-200"
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={busy}
          className="h-11 shrink-0 px-5"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Scanning…
            </>
          ) : (
            <>
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Start Investigation
            </>
          )}
        </Button>
      </div>
      {error && (
        <p id="url-error" className="mt-1.5 text-[12px] text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

// ── Scan progress ────────────────────────────────────────────────────────────

function ScanProgress({ step }: { step: number }) {
  return (
    <div className="space-y-3 py-4">
      {SCAN_STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                done   ? "bg-emerald-100 text-emerald-600" :
                active ? "bg-brand-soft text-brand" :
                         "bg-zinc-100 text-zinc-300"
              )}
              aria-hidden="true"
            >
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
              )}
            </span>
            <p
              className={cn(
                "text-[13px]",
                done   ? "text-zinc-500 line-through decoration-zinc-300" :
                active ? "font-medium text-zinc-800" :
                         "text-zinc-400"
              )}
            >
              {s.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Risk badge ────────────────────────────────────────────────────────────────

function RiskBadge({ risk }: { risk: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    critical: { label: "Critical Risk",  cls: "border-red-300 bg-red-50 text-red-700" },
    high:     { label: "High Risk",      cls: "border-red-300 bg-red-50 text-red-700" },
    medium:   { label: "Medium Risk",    cls: "border-amber-300 bg-amber-50 text-amber-700" },
    low:      { label: "Low Risk",       cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  };
  const m = map[risk] ?? map.medium;
  return (
    <span className={cn("rounded-full border px-3 py-1 text-[12px] font-semibold", m.cls)}>
      {m.label}
    </span>
  );
}

// ── Pattern card ─────────────────────────────────────────────────────────────

function PatternCard({
  pattern,
  index,
  onEvidence,
}: {
  pattern: DarkPattern;
  index: number;
  onEvidence: (p: DarkPattern) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const tone = severityTone(pattern.severity);
  const confidencePct =
    pattern.confidence <= 1
      ? Math.round(pattern.confidence * 100)
      : Math.round(pattern.confidence);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.05 }}
      className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Severity dot */}
        <span
          className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", tone.dot)}
          aria-hidden="true"
        />

        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[14px] font-semibold text-zinc-900">
              {PATTERN_LABELS[pattern.type] ?? pattern.type}
            </p>
            <span className={cn("rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase", tone.badge)}>
              {pattern.severity}
            </span>
            <span className="ml-auto text-[12px] tabular-nums text-zinc-500 font-medium">
              {confidencePct}% confidence
            </span>
          </div>

          {/* Confidence bar */}
          <ConfidenceBar confidence={pattern.confidence} className="mt-2" />

          {/* Element */}
          <p className="mt-1.5 text-[11px] text-zinc-500">
            Affected:{" "}
            <span className="font-medium text-zinc-700">{pattern.element}</span>
          </p>

          {/* Expandable explanation */}
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <p className="mt-2 text-[12px] leading-5 text-zinc-600">
                  {pattern.explanation}
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-zinc-400">
                  {pattern.whyItMatters}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-[11px] font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              {expanded ? "Less detail" : "Explain this pattern"}
            </button>
            <span className="text-zinc-200" aria-hidden="true">·</span>
            <button
              onClick={() => onEvidence(pattern)}
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
            >
              View Evidence
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ScannerPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [evidencePattern, setEvidencePattern] = useState<DarkPattern | null>(null);
  const [startingAgent, setStartingAgent] = useState(false);

  const analyze = async (url: string) => {
    setPhase("scanning");
    setError(null);
    setResult(null);
    setScannedUrl(url);
    setScanStep(0);

    // Animate through steps
    const stepTimer = setInterval(() => {
      setScanStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1));
    }, 600);

    try {
      const scanRes = await scanUrl(url);
      clearInterval(stepTimer);
      setScanStep(SCAN_STEPS.length);
      setResult(scanRes);
      setPhase("done");
    } catch {
      clearInterval(stepTimer);
      setError(
        "The page could not be analyzed. Check the URL is accessible, then try again."
      );
      setPhase("error");
    }
  };

  const openAgent = async (url: string) => {
    setStartingAgent(true);
    try {
      const res = await startCancellation({
        goal: "detect_dark_patterns",
        targetUrl: url,
      });
      router.push(`/agent?session=${res.sessionId}`);
    } catch {
      // If backend unavailable, navigate to agent anyway (it'll show error)
      router.push("/agent");
    } finally {
      setStartingAgent(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Read-Only Analysis
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
            Dark Pattern Scanner
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            Investigate any webpage for deceptive interface patterns without taking any action.
          </p>
        </div>
      </div>

      {/* ── URL Input ────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <UrlInput onScan={(url) => void analyze(url)} busy={phase === "scanning"} />

        {/* Demo target hint */}
        <p className="mt-2 text-[11px] text-zinc-400">
          Try the demo:{" "}
          <button
            type="button"
            onClick={() => void analyze("http://localhost:3001/demo-target/account")}
            className="font-mono text-brand hover:underline focus-visible:outline-none"
            disabled={phase === "scanning"}
          >
            http://localhost:3001/demo-target/account
          </button>
        </p>
      </div>

      {/* ── Idle empty state ─────────────────────── */}
      {phase === "idle" && (
        <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-6 py-14 text-center">
          <span
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm"
            aria-hidden="true"
          >
            <ScanSearch className="h-7 w-7 text-zinc-300" />
          </span>
          <p className="mt-4 text-sm font-semibold text-zinc-700">
            Enter a URL to begin
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-zinc-400 max-w-xs mx-auto">
            The scanner reads the page structure and checks it against a dark-pattern
            taxonomy. No actions are taken.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              { label: "Roach Motel",        desc: "Easy in, hard to cancel" },
              { label: "Confirmshaming",     desc: "Guilt-tripping opt-outs" },
              { label: "Forced Continuity",  desc: "Auto-renewing trials" },
              { label: "Drip Pricing",       desc: "Hidden fees revealed late" },
            ].map(({ label, desc }) => (
              <div
                key={label}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left shadow-sm"
              >
                <p className="text-[12px] font-semibold text-zinc-700">{label}</p>
                <p className="text-[11px] text-zinc-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scanning state ───────────────────────── */}
      {phase === "scanning" && scannedUrl && (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">
              <Eye className="h-5 w-5 text-brand" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">Analyzing page…</p>
              <p className="text-[12px] text-zinc-500 font-mono truncate max-w-xs">
                {hostnameOf(scannedUrl)}
              </p>
            </div>
          </div>
          <ScanProgress step={scanStep} />
        </div>
      )}

      {/* ── Error state ──────────────────────────── */}
      {phase === "error" && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800">Scan failed</p>
            <p className="mt-0.5 text-[12px] text-red-700">{error}</p>
            <div className="mt-2 space-y-1 text-[11px] text-red-600">
              <p>• Ensure the URL is publicly accessible</p>
              <p>• Check that the backend is running on port 3001</p>
              <p>
                •{" "}
                <code className="rounded bg-red-100 px-1 font-mono text-[10px]">
                  cd backend &amp;&amp; npm run dev
                </code>
              </p>
            </div>
          </div>
          <button
            onClick={() => { setPhase("idle"); setError(null); }}
            className="shrink-0 rounded-lg p-1.5 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Results ──────────────────────────────── */}
      {phase === "done" && result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-5"
        >
          {/* Summary bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                <Globe className="h-5 w-5 text-zinc-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[12px] font-medium text-zinc-500">Scanned</p>
                <p className="text-[14px] font-semibold text-zinc-900 font-mono">
                  {hostnameOf(result.url)}
                </p>
              </div>
              <RiskBadge risk={result.risk.overall} />
              {result.patterns.length > 0 ? (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  {result.patterns.length} pattern{result.patterns.length !== 1 ? "s" : ""} detected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  No patterns detected
                </span>
              )}
            </div>

            {/* Open in Agent CTA */}
            {result.patterns.length > 0 && (
              <Button
                onClick={() => void openAgent(result.url)}
                disabled={startingAgent}
                className="shrink-0"
              >
                {startingAgent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Opening Agent…
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" aria-hidden="true" />
                    Open in Agent
                    <ArrowRight className="h-3.5 w-3.5 ml-1" aria-hidden="true" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Two-column layout */}
          <div className="grid gap-5 lg:grid-cols-2">

            {/* LEFT: Page perception */}
            <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-zinc-100 px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Page Analysis
                </p>
                <p className="mt-0.5 text-sm font-semibold text-zinc-900 truncate">
                  {result.perception.title || hostnameOf(result.url)}
                </p>
              </div>
              <div className="p-4 space-y-4">
                {/* Perception checklist */}
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    What was perceived
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Page loaded",                   done: true },
                      { label: "Visible text extracted",         done: result.perception.visibleText.length > 0 },
                      { label: "Interactive elements mapped",    done: result.perception.elements.length > 0 },
                      { label: "Dark-pattern taxonomy checked",  done: true },
                      { label: "Risk report generated",          done: true },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                            done ? "bg-emerald-100 text-emerald-600" : "bg-zinc-100 text-zinc-400"
                          )}
                          aria-hidden="true"
                        >
                          {done
                            ? <CheckCircle2 className="h-3 w-3" />
                            : <span className="h-1 w-1 rounded-full bg-zinc-300" />}
                        </span>
                        <span className={cn("text-[12px]", done ? "text-zinc-700" : "text-zinc-400")}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Elements found */}
                {result.perception.elements.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Interactive Elements ({result.perception.elements.length})
                    </p>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {result.perception.elements.slice(0, 12).map((el, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5"
                        >
                          <span className="text-[10px] uppercase text-zinc-400 font-medium w-12 shrink-0">
                            {el.role}
                          </span>
                          <span className="text-[12px] text-zinc-700 truncate">{el.text}</span>
                        </div>
                      ))}
                      {result.perception.elements.length > 12 && (
                        <p className="text-[11px] text-zinc-400 px-2.5">
                          +{result.perception.elements.length - 12} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Risk metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Total",    value: result.risk.totalPatterns, cls: "text-zinc-900" },
                    { label: "Critical", value: result.risk.critical,      cls: "text-red-700" },
                    { label: "Warnings", value: result.risk.warnings,      cls: "text-amber-700" },
                  ].map(({ label, value, cls }) => (
                    <div
                      key={label}
                      className="rounded-lg border border-zinc-100 bg-zinc-50 p-2 text-center"
                    >
                      <p className={cn("text-lg font-semibold tabular-nums", cls)}>{value}</p>
                      <p className="text-[10px] text-zinc-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Detections */}
            <div>
              {result.patterns.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 py-14 text-center">
                  <Shield
                    className="h-10 w-10 text-emerald-400"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">
                      No dark patterns detected
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-emerald-700 max-w-xs">
                      This page appears to present its options clearly. No
                      patterns were found above the detection threshold.
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-600/70">
                    Automated estimate — not a guarantee.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                      Detected Patterns
                    </p>
                    <span className="text-[11px] text-zinc-400">
                      Automated estimate
                    </span>
                  </div>
                  {result.patterns.map((p, i) => (
                    <PatternCard
                      key={p.id}
                      pattern={p}
                      index={i}
                      onEvidence={setEvidencePattern}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Agent pipeline bottom ─────────────── */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Agent Pipeline
              </p>
              <p className="text-[11px] text-zinc-400">
                Scanner completed the PERCEIVE → DETECT stages
              </p>
            </div>
            <AgentPipelineBottom compact={false} />
            {result.patterns.length > 0 && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-blue-200 bg-brand-soft px-4 py-3">
                <Bot className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                <p className="flex-1 text-[12px] text-blue-700">
                  To complete the full pipeline (Plan → Approve → Act → Verify),
                  open this session in the Agent.
                </p>
                <Button
                  onClick={() => void openAgent(result.url)}
                  disabled={startingAgent}
                  size="sm"
                >
                  {startingAgent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <>
                      Open Agent
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* ── Disclaimer ───────────────────────── */}
          <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
            <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Analysis is an automated estimate. No actions were taken on this page.
          </p>
        </motion.div>
      )}

      {/* ── Evidence drawer ──────────────────────── */}
      {evidencePattern && (
        <EvidenceDrawer
          isOpen={!!evidencePattern}
          onClose={() => setEvidencePattern(null)}
          pattern={evidencePattern}
          onViewEvidence={() => {}}
        />
      )}
    </div>
  );
}
