"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Play, RotateCcw, Square } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { fetchSession, startPolling, stopSession } from "@/lib/services/agentService";
import { startCancellation } from "@/lib/services/taskService";
import { ApiError, BACKEND_URL, demoTargetUrl } from "@/lib/api";
import { AGENT_SHORT, PATTERN_LABELS, PIPELINE_ORDER } from "@/lib/constants";
import { cn, formatTime, hostnameOf, nowIso } from "@/lib/utils";
import type { AgentId, CancellationTask, StageState } from "@/lib/types";
import { BrowserFrame } from "@/components/browser/BrowserFrame";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { Button } from "@/components/ui/button";
import { Marker, PageHeader, Stamp } from "@/components/ui/case";
import { TinyFishAgentPanel } from "@/components/tinyfish/TinyFishAgentPanel";

const STAGE_VERB: Record<AgentId, string> = {
  perception: "Look",
  detection: "Spot traps",
  planning: "Plan",
  action: "Act",
  verification: "Verify",
};

const EVENT_DOT: Record<string, string> = {
  running: "bg-brand",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
};

/** Horizontal case track. The bar fills as stages finish; the current stage is marked. */
function CaseTrack({ stages, blocked }: { stages: Record<AgentId, StageState>; blocked: boolean }) {
  const done = PIPELINE_ORDER.filter((a) => stages[a] === "completed").length;
  const active = PIPELINE_ORDER.some((a) => stages[a] === "running" || stages[a] === "blocked");
  const progress = Math.min(1, (done + (active ? 0.5 : 0)) / PIPELINE_ORDER.length);

  return (
    <div>
      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-200">
        <motion.div
          className={cn("absolute inset-y-0 left-0 w-full origin-left rounded-full", blocked ? "bg-amber-500" : "bg-foreground")}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </div>
      <ol className="mt-3 grid grid-cols-5 gap-2">
        {PIPELINE_ORDER.map((a) => {
          const st = stages[a];
          return (
            <li key={a} className="text-[13px]">
              <span
                className={cn(
                  "flex items-center gap-1.5 font-medium",
                  st === "completed" && "text-foreground",
                  st === "running" && "text-brand",
                  st === "blocked" && "text-amber-700",
                  st === "failed" && "text-red-600",
                  st === "idle" && "text-zinc-400"
                )}
              >
                {st === "completed" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {st === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                {STAGE_VERB[a]}
              </span>
              {st === "blocked" && <span className="text-[12px] text-amber-700">waiting for you</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** The built-in test site runs on this app's own host; call it by its name. */
function serviceName(domain: string): string {
  return domain === "localhost" || domain === "127.0.0.1" ? "StreamVault" : domain;
}

/** Proof screenshot captured by the verification stage. */
function ProofShot({ sessionId }: { sessionId: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BACKEND_URL}/api/agent/${sessionId}/proof`}
      alt="Screenshot of the cancellation confirmation"
      className="mt-5 max-h-[340px] w-full max-w-xl rounded-xl border border-border object-cover object-top"
      onError={() => setOk(false)}
    />
  );
}

function AgentConsole() {
  const store = useAgentStore();
  const router = useRouter();
  const params = useSearchParams();
  // Resuming ?session=… starts in the loading state rather than flipping it inside the mount effect.
  const [starting, setStarting] = useState(
    () => !!(params.get("session") || params.get("url") || params.get("targetUrl")) && useAgentStore.getState().status === "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(() => params.get("url") || params.get("targetUrl") || demoTargetUrl());
  const pollRef = useRef<{ cancel: () => void } | null>(null);

  const isIdle = store.status === "idle";
  const isBlocked = store.status === "blocked";
  const isDone = store.status === "completed";
  const isFailed = store.status === "failed";

  const follow = useCallback(
    (sessionId: string) => {
      pollRef.current?.cancel();
      pollRef.current = startPolling(sessionId, () => {
        pollRef.current = null;
      });
    },
    []
  );

  /** Starts a run. Only touches React state after the network call, so it is safe to call from an effect. */
  const launch = useCallback(
    async (url: string) => {
      // Cancellation flows get the full agent; anything else is a look-only investigation.
      const goal = url.includes("demo-target") || url.includes("cancel") ? "cancel_subscription" : "detect_dark_patterns";
      try {
        const res = await startCancellation({ goal, targetUrl: url });
        const domain = hostnameOf(url);
        const task: CancellationTask = {
          id: res.sessionId,
          service: serviceName(domain),
          plan: goal === "cancel_subscription" ? "Cancellation" : "Investigation",
          price: "—",
          domain,
          status: "running",
          createdAt: nowIso(),
          patternCount: 0,
        };
        store.startSession(task);
        store.setLive(true);
        router.replace(`/agent?session=${res.sessionId}`);
        follow(res.sessionId);
      } catch (e) {
        // Status 0 means the server could not be reached; anything else is the server's own reason.
        setError(
          e instanceof ApiError && e.status !== 0
            ? `The agent couldn’t start: ${e.message}`
            : "The agent couldn’t start. Make sure the app server is running (npm run dev) and try again."
        );
      } finally {
        setStarting(false);
      }
    },
    [store, router, follow]
  );

  const startAgent = (customUrl?: string) => {
    setError(null);
    setStarting(true);
    void launch((customUrl ?? urlInput).trim() || demoTargetUrl());
  };

  // Resume a session from ?session=…, or auto-start from ?url=… (scanner hand-off).
  useEffect(() => {
    const sessionId = params.get("session");
    const passedUrl = params.get("url") || params.get("targetUrl");
    if (sessionId && isIdle) {
      fetchSession(sessionId)
        .then((session) => {
          const domain = hostnameOf(session.targetUrl ?? "");
          store.startSession({
            id: sessionId,
            service: serviceName(domain),
            plan: session.goal ?? "Investigation",
            price: "—",
            domain,
            status: "running",
            createdAt: session.startedAt ?? nowIso(),
            patternCount: 0,
          });
          store.setLive(true);
          follow(sessionId);
        })
        .catch(() => setError("That case couldn’t be loaded. It may have expired; start a new one."))
        .finally(() => setStarting(false));
    } else if (passedUrl && isIdle) {
      // launch() only sets state after awaiting the API call; the rule can't see past the await.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void launch(passedUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = useCallback(async () => {
    if (store.task?.id && store.live && !isDone && !isFailed) {
      try {
        await stopSession(store.task.id);
      } catch {
        /* the session may already be gone */
      }
    }
    pollRef.current?.cancel();
    pollRef.current = null;
    store.resetSession();
    router.replace("/agent");
  }, [store, router, isDone, isFailed]);

  useEffect(() => () => pollRef.current?.cancel(), []);

  const log = [...store.events].reverse();

  if (isIdle) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Send the agent in"
          lede="Give it a cancellation page. It reads each screen, steps around the traps, and asks you before anything that can’t be undone."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            startAgent();
          }}
          className="max-w-2xl rounded-2xl border border-border bg-surface p-6"
        >
          <label htmlFor="agent-url" className="text-[14px] font-semibold">
            Where should it start?
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="agent-url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="h-12 flex-1 rounded-xl border border-border-strong bg-background px-4 font-mono text-[13.5px] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
            <Button type="submit" size="lg" disabled={starting} className="h-12 rounded-xl px-6">
              {starting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {starting ? "Starting…" : "Start the agent"}
            </Button>
          </div>
          <p className="mt-3 text-[13px] text-zinc-500">
            Pre-filled with the StreamVault test site, which has real retention traps to get past.
          </p>
          {error && (
            <p role="alert" className="mt-3 text-[13.5px] text-red-600">
              {error}
            </p>
          )}
        </form>
        <ol className="grid max-w-3xl gap-6 sm:grid-cols-3">
          {[
            ["It looks", "Reads every button and line of text on the page, like you would."],
            ["It steps around traps", "Ignores “Keep my benefits” and “pause instead” offers."],
            ["You decide", "The final irreversible click waits for your approval."],
          ].map(([t, d], i) => (
            <li key={t}>
              <p className="font-display text-[15px] font-bold">
                <span className="mr-2 text-zinc-400">{i + 1}</span>
                {t}
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-500">{d}</p>
            </li>
          ))}
        </ol>
        <TinyFishAgentPanel />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={store.task?.service ?? "Live case"}
        lede={
          isDone
            ? "Case closed. The outcome was checked on the page and a screenshot was saved."
            : isFailed
              ? "The agent stopped before finishing. The case log shows the last step it took."
              : isBlocked
                ? "The agent reached the final, irreversible step and is waiting for your approval."
                : "The agent is working through the page. Every step lands in the case log."
        }
      >
        {isDone || isFailed ? (
          <Button variant="outline" onClick={() => void reset()}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> New case
          </Button>
        ) : (
          <Button variant="outline" onClick={() => void reset()}>
            <Square className="h-4 w-4" aria-hidden="true" /> Stop agent
          </Button>
        )}
      </PageHeader>

      <CaseTrack stages={store.stageStates} blocked={isBlocked} />

      <AnimatePresence>
        {isDone && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-display text-[24px] font-bold">Cancellation confirmed</p>
                <ul className="mt-3 space-y-1.5 text-[14px] text-emerald-900">
                  {["Reached the confirmation page", "Found the cancellation message", "Saved a screenshot as proof"].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                {store.verification?.proofId && (
                  <p className="mt-3 font-mono text-[12px] text-emerald-800/70">proof {store.verification.proofId}</p>
                )}
              </div>
              <Stamp>Verified</Stamp>
            </div>
            {store.task?.id && store.live && <ProofShot sessionId={store.task.id} />}
          </motion.section>
        )}
      </AnimatePresence>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          <BrowserFrame browser={store.browser} />
          {store.patterns.length > 0 && (
            <div>
              <h2 className="text-[15px] font-semibold">Traps it caught on the way</h2>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                {store.patterns.map((p, i) => (
                  <li key={p.id} className="text-[14px]">
                    <Marker delay={0.2 + i * 0.12}>{PATTERN_LABELS[p.type] ?? p.type}</Marker>
                  </li>
                ))}
              </ul>
              {(isDone || isFailed) && (
                <p className="mt-4 text-[13px] text-zinc-600">
                  Did it get these right?{" "}
                  <Link href="/learning" className="font-medium text-brand underline underline-offset-2 hover:text-blue-700">
                    Review the findings
                  </Link>{" "}
                  so the agent learns from this case.
                </p>
              )}
            </div>
          )}
        </div>

        <aside aria-label="Case log">
          <h2 className="flex items-baseline justify-between text-[15px] font-semibold">
            Case log
            <span className="text-[12px] font-normal text-zinc-500">{store.events.length} entries</span>
          </h2>
          {store.decision && (
            <div className="mt-3">
              <AgentDecision decision={store.decision} />
            </div>
          )}
          <ol className="mt-3 max-h-[560px] space-y-0 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {log.map((e) => (
                // New entries spring in at the top; older ones slide down to make room.
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, y: -14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="relative border-l border-border py-2.5 pl-5"
                >
                  <span className={cn("absolute -left-[5px] top-4 h-2.5 w-2.5 rounded-full ring-4 ring-background", EVENT_DOT[e.status])} aria-hidden="true" />
                  <p className="text-[12px] text-zinc-400">
                    <span className="font-medium text-zinc-600">{AGENT_SHORT[e.agent]}</span> · {formatTime(e.timestamp)}
                  </p>
                  <p className="mt-0.5 text-[13.5px] leading-snug">{e.message}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </aside>
      </div>
    </div>
  );
}

export default function AgentPage() {
  return (
    <Suspense>
      <AgentConsole />
    </Suspense>
  );
}
