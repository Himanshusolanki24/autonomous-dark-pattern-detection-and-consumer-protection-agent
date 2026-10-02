"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  RotateCcw,
  Square,
  ShieldAlert,
  Check,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Clock,
  Zap,
  Bot,
} from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import {
  startPolling,
  fetchSession,
  stopSession,
} from "@/lib/services/agentService";
import { startCancellation } from "@/lib/services/taskService";
import { BACKEND_URL } from "@/lib/api";
import { cn, nowIso, hostnameOf } from "@/lib/utils";
import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentEventStream } from "@/components/agent/AgentEventStream";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { DetectionOverlay } from "@/components/scanner/DetectionOverlay";
import { BrowserFrame } from "@/components/browser/BrowserFrame";
import { Button } from "@/components/ui/button";
import { PATTERN_LABELS } from "@/lib/constants";
import { severityTone } from "@/lib/utils";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import type { CancellationTask } from "@/lib/types";

const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  idle:      { label: "Idle — ready",        dot: "bg-zinc-300",                      pill: "border-zinc-200 bg-zinc-50 text-zinc-500" },
  running:   { label: "Running",             dot: "bg-emerald-500 animate-dot-pulse", pill: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  blocked:   { label: "Awaiting Approval",   dot: "bg-amber-500 animate-dot-pulse",   pill: "border-amber-200 bg-amber-50 text-amber-700" },
  completed: { label: "Session Complete",    dot: "bg-emerald-500",                   pill: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  failed:    { label: "Session Failed",      dot: "bg-red-500",                       pill: "border-red-200 bg-red-50 text-red-700" },
};

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
        </div>
      }
    >
      <AgentPageContent />
    </Suspense>
  );
}

/** Cancellation proof screenshot captured by the verification stage. */
function ProofShot({ sessionId }: { sessionId: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  const src = `${BACKEND_URL}/api/agent/${sessionId}/proof`;
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-zinc-200">
      <p className="border-b border-zinc-100 bg-zinc-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
        Cancellation Screenshot
      </p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Cancellation confirmation screenshot"
        className="w-full"
        onError={() => setOk(false)}
      />
    </div>
  );
}

function AgentPageContent() {
  const store = useAgentStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPatternId, setSelectedPatternId] = useState<string | null>(null);
  const [eventCollapsed, setEventCollapsed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [targetUrlInput, setTargetUrlInput] = useState<string>(
    searchParams.get("url") || searchParams.get("targetUrl") || "http://localhost:3001/demo-target/account"
  );
  const pollRef = useRef<{ cancel: () => void } | null>(null);

  const pattern = store.patterns.find((p) => p.id === selectedPatternId) ?? null;
  const isIdle = store.status === "idle";
  const isBlocked = store.status === "blocked";
  const isCompleted = store.status === "completed";
  const isFailed = store.status === "failed";
  const isActive = store.status === "running" || isBlocked;
  const statusCfg = STATUS_CONFIG[store.status] ?? STATUS_CONFIG.idle;

  const startAgent = useCallback(async (customUrl?: string) => {
    const urlToRun = (customUrl ?? targetUrlInput).trim() || "http://localhost:3001/demo-target/account";
    setStartError(null);
    setStarting(true);
    const goal = urlToRun.includes("demo-target") || urlToRun.includes("cancel")
      ? "cancel_subscription"
      : "detect_dark_patterns";
    try {
      const res = await startCancellation({
        goal,
        targetUrl: urlToRun,
      });
      const domain = hostnameOf(urlToRun);
      const task: CancellationTask = {
        id: res.sessionId,
        service: domain === "localhost" ? "Demo Target" : domain,
        plan: "Investigation",
        price: "—",
        domain: domain,
        status: "running",
        createdAt: nowIso(),
        patternCount: 0,
      };
      store.startSession(task);
      store.setLive(true);
      router.replace(`/agent?session=${res.sessionId}`);
      pollRef.current?.cancel();
      pollRef.current = startPolling(res.sessionId, () => { pollRef.current = null; });
    } catch (err) {
      setStartError(
        "Could not start the agent. Ensure the backend is running on port 3001."
      );
    } finally {
      setStarting(false);
    }
  }, [targetUrlInput, store, router]);

  // Load session from URL param on mount, or auto-start if url param passed
  useEffect(() => {
    const sessionId = searchParams.get("session");
    const passedUrl = searchParams.get("url") || searchParams.get("targetUrl");

    if (sessionId && isIdle) {
      setStarting(true);
      fetchSession(sessionId)
        .then((session) => {
          const task: CancellationTask = {
            id: sessionId,
            service: hostnameOf(session.targetUrl ?? ""),
            plan: session.goal ?? "Investigation",
            price: "—",
            domain: hostnameOf(session.targetUrl ?? ""),
            status: "running",
            createdAt: session.startedAt ?? nowIso(),
            patternCount: 0,
          };
          store.startSession(task);
          store.setLive(true);
          pollRef.current?.cancel();
          pollRef.current = startPolling(sessionId, () => { pollRef.current = null; });
        })
        .catch(() => setStartError("Could not load session. The backend may be unavailable."))
        .finally(() => setStarting(false));
    } else if (passedUrl && isIdle && !sessionId) {
      void startAgent(passedUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopAgent = useCallback(async () => {
    if (store.task?.id && store.live) {
      try { await stopSession(store.task.id); } catch { /* ignore */ }
    }
    pollRef.current?.cancel();
    pollRef.current = null;
    store.resetSession();
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/agent");
    }
    router.replace("/agent");
  }, [store, router]);

  useEffect(() => () => { pollRef.current?.cancel(); }, []);

  // Format confidence as percentage
  const fmtConfidence = (c: number) =>
    c <= 1 ? `${Math.round(c * 100)}%` : `${Math.round(c)}%`;

  return (
    <div className="flex flex-col gap-5 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Page header ───────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              {store.task ? "Active Investigation" : "AI Investigation Center"}
            </span>
            {store.task && (
              <>
                <span className="h-px w-4 bg-zinc-200" aria-hidden="true" />
                <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Globe className="h-3 w-3" aria-hidden="true" />
                  {store.task.domain}
                </span>
              </>
            )}
          </div>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-zinc-900">
            {store.task
              ? `Investigating ${store.task.domain}`
              : "Agent Control Center"}
          </h2>
          <p className="mt-0.5 text-[12px] text-zinc-400">
            {store.task
              ? `Session ${store.task.id.slice(0, 8).toUpperCase()} · ${store.task.plan}`
              : "Perceive → Detect → Plan → Human Approval → Act → Verify"}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Single authoritative status pill */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold",
              statusCfg.pill
            )}
            role="status"
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full shrink-0", statusCfg.dot)}
              aria-hidden="true"
            />
            {statusCfg.label}
          </span>

          {isIdle ? (
            <Button
              onClick={() => void startAgent()}
              disabled={starting || !targetUrlInput.trim()}
              size="sm"
            >
              {starting ? (
                <>
                  <span
                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden="true"
                  />
                  Starting…
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  Start Agent
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => void stopAgent()}
              size="sm"
            >
              <Square className="h-3.5 w-3.5" aria-hidden="true" />
              Stop
            </Button>
          )}

          {(isCompleted || isFailed) && (
            <Button
              variant="ghost"
              onClick={() => void stopAgent()}
              size="sm"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* ── Target URL Input & Quick Presets (when idle) ────────────────── */}
      {isIdle && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="target-url-input" className="text-xs font-semibold text-zinc-700 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              Enter Target URL to Run Autonomous Agent
            </label>
            <span className="text-[10px] text-zinc-400">Agent runs live in backend pipeline</span>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void startAgent();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                id="target-url-input"
                type="url"
                value={targetUrlInput}
                onChange={(e) => setTargetUrlInput(e.target.value)}
                placeholder="https://example.com/account/subscription"
                className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3.5 py-2 text-xs font-mono text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={starting || !targetUrlInput.trim()}
              size="sm"
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {starting ? "Launching..." : "Launch Agent Pipeline"}
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Quick Presets:</span>
            {[
              { name: "AcmeCloud Demo Target", url: "http://localhost:3001/demo-target/account" },
              { name: "Coursera", url: "https://www.coursera.org" },
              { name: "Udemy", url: "https://www.udemy.com" },
            ].map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => {
                  setTargetUrlInput(preset.url);
                  void startAgent(preset.url);
                }}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Error banner ────────────────────────── */}
      {startError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">{startError}</p>
          <p className="mt-0.5 text-[12px] text-red-600/80">
            Start the backend:{" "}
            <code className="rounded bg-red-100 px-1 text-[11px]">
              cd backend &amp;&amp; npm run dev
            </code>
          </p>
        </div>
      )}

      {/* ── Approval banner ─────────────────────── */}
      <AnimatePresence>
        {isBlocked && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3"
            role="alert"
          >
            <ShieldAlert
              className="h-5 w-5 shrink-0 text-amber-600 animate-dot-pulse"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                Human approval required
              </p>
              <p className="text-[12px] text-amber-700">
                The agent has paused before an irreversible action. Review and
                approve in the dialog.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Completion banner ────────────────────── */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"
            role="status"
          >
            <Check
              className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-emerald-800">
                Session complete
              </p>
              {store.verification ? (
                <div className="mt-2 space-y-1.5">
                  {[
                    "Expected page state detected",
                    "Confirmation message detected",
                    "Outcome verified",
                  ].map((item) => (
                    <p
                      key={item}
                      className="flex items-center gap-2 text-[12px] text-emerald-700"
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-emerald-500"
                        aria-hidden="true"
                      />
                      {item}
                    </p>
                  ))}
                  {store.verification.proofId && (
                    <p className="mt-1 text-[11px] text-emerald-600/70">
                      Proof ID:{" "}
                      <span className="font-mono">{store.verification.proofId}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="mt-0.5 text-[12px] text-emerald-700">
                  Outcome verified.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pipeline ─────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Agent Pipeline
            </p>
            <h3 className="mt-0.5 text-sm font-semibold text-zinc-900">
              {isIdle
                ? "Pipeline idle"
                : isCompleted
                ? "Pipeline complete"
                : "Pipeline active"}
            </h3>
          </div>
          <span className="hidden text-[10px] text-zinc-300 sm:block" aria-hidden="true">
            PERCEIVE → DETECT → PLAN → APPROVE → ACT → VERIFY
          </span>
        </div>
        <AgentPipeline />
      </div>

      {/* ── Two-column workspace ─────────────────── */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* LEFT: Browser preview */}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Live Page View
              </p>
              <p className="mt-0.5 text-[12px] text-zinc-600 font-medium truncate max-w-xs">
                {store.browser?.url
                  ? store.browser.url
                  : isIdle
                  ? "No active session"
                  : "Connecting to browser…"}
              </p>
            </div>
            {isActive && (
              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-dot-pulse"
                  aria-hidden="true"
                />
                Live
              </span>
            )}
          </div>
          <div className="relative min-h-[300px]">
            <DetectionOverlay
              pattern={pattern}
              onClose={() => setSelectedPatternId(null)}
            />
            <BrowserFrame
              browser={store.browser}
              onElementClick={(t) => {
                const hit = store.patterns.find((p) => p.type === t);
                if (hit) setSelectedPatternId(hit.id);
              }}
            />
          </div>
        </div>

        {/* RIGHT: Events + decision + patterns */}
        <div className="space-y-4">

          {/* Metrics row — only when active */}
          {!isIdle && (
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  icon: Zap,
                  label: "Events",
                  value: store.events.length,
                  tone: "text-brand bg-brand-soft",
                },
                {
                  icon: AlertTriangle,
                  label: "Patterns",
                  value: store.patterns.length,
                  tone: "text-amber-600 bg-amber-50",
                },
                {
                  icon: Bot,
                  label: "Stage",
                  value: (() => {
                    const active = (
                      ["perception", "detection", "planning", "action", "verification"] as const
                    ).find(
                      (s) =>
                        store.stageStates[s] === "running" ||
                        store.stageStates[s] === "blocked"
                    );
                    return active
                      ? active.slice(0, 4).toUpperCase()
                      : isCompleted
                      ? "DONE"
                      : "—";
                  })(),
                  tone: "text-zinc-600 bg-zinc-100",
                },
              ].map(({ icon: Icon, label, value, tone }) => (
                <div
                  key={label}
                  className="rounded-lg border border-zinc-100 bg-white p-3 shadow-sm"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md",
                        tone
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400">
                      {label}
                    </span>
                  </div>
                  <p className="mt-1.5 text-lg font-semibold tabular-nums text-zinc-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Event stream */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <AgentEventStream
              events={store.events}
              maxHeight="h-[240px]"
              collapsed={eventCollapsed}
              onCollapse={() => setEventCollapsed((v) => !v)}
            />
          </div>

          {/* Agent decision */}
          {store.decision && <AgentDecision decision={store.decision} />}

          {/* Detected patterns */}
          {store.patterns.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Detected Patterns
                </p>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                  {store.patterns.length}
                </span>
              </div>
              <p className="mb-3 text-[11px] text-zinc-400">
                Automated estimate — not legal advice.
              </p>
              <div className="space-y-3">
                {store.patterns.map((p) => {
                  const tone = severityTone(p.severity);
                  const isSelected = selectedPatternId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setSelectedPatternId(isSelected ? null : p.id)
                      }
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                        isSelected
                          ? "border-zinc-300 bg-zinc-50 shadow-sm"
                          : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-zinc-800">
                          {PATTERN_LABELS[p.type] ?? p.type}
                        </p>
                        <span
                          className={cn(
                            "rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase",
                            tone.badge
                          )}
                        >
                          {p.severity}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        {p.element}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <ConfidenceBar
                          confidence={p.confidence}
                          className="flex-1"
                        />
                        <span className="shrink-0 text-[10px] tabular-nums text-zinc-400">
                          {fmtConfidence(p.confidence)}
                        </span>
                      </div>
                      {isSelected && (
                        <p className="mt-2 text-[11px] leading-5 text-zinc-600">
                          {p.explanation}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Idle empty state */}
          {isIdle && store.patterns.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
              <span
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm"
                aria-hidden="true"
              >
                <Bot className="h-6 w-6 text-zinc-300" />
              </span>
              <p className="mt-4 text-sm font-semibold text-zinc-700">
                No active investigation
              </p>
              <p className="mt-1.5 text-[12px] leading-5 text-zinc-400">
                Start the agent to begin a live investigation. The pipeline will
                activate and stream events in real time as each stage runs.
              </p>
              <Button
                onClick={() => void startAgent()}
                disabled={starting}
                size="sm"
                className="mt-4"
              >
                {starting ? (
                  <>
                    <span
                      className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                      aria-hidden="true"
                    />
                    Starting…
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    Start Agent
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Session failed state */}
          {isFailed && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-red-500"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-semibold text-red-800">
                      Session failed
                    </p>
                    <p className="mt-0.5 text-[12px] text-red-700">
                      The previous session encountered an error or was aborted. Click Reset to start a clean new investigation.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void stopAgent()}
                  className="shrink-0 border-red-300 bg-white text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {/* Verification details when complete */}
          {isCompleted && store.verification && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Verification Result
              </p>
              <div className="space-y-2">
                {[
                  { label: "Service", value: store.verification.service },
                  { label: "Plan", value: store.verification.plan },
                  { label: "Status", value: store.verification.status },
                  { label: "Method", value: store.verification.method },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-2 text-[12px]"
                  >
                    <span className="text-zinc-400">{label}</span>
                    <span className="font-medium text-zinc-700">{value}</span>
                  </div>
                ))}
                {store.verification.proofId && (
                  <div className="mt-2 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                    <p className="text-[10px] text-zinc-400">Proof ID</p>
                    <p className="mt-0.5 font-mono text-[11px] text-zinc-700">
                      {store.verification.proofId}
                    </p>
                  </div>
                )}
                {store.task && <ProofShot sessionId={store.task.id} />}
              </div>
            </div>
          )}

          {/* Session metadata */}
          {store.task && (
            <div className="flex items-center gap-4 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-2.5 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" aria-hidden="true" />
                Started{" "}
                {new Date(store.task.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-3 w-3" aria-hidden="true" />
                {store.task.domain}
              </span>
              <span className="ml-auto font-mono">
                {store.task.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
