"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ScanSearch,
  Bot,
  History,
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentEventStream } from "@/components/agent/AgentEventStream";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { Button } from "@/components/ui/button";
import { PATTERN_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
  tone,
  index,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  hint: string;
  tone: "brand" | "warning" | "success" | "danger" | "neutral";
  index: number;
}) {
  const toneMap = {
    brand:   { icon: "bg-brand-soft text-brand",        border: "border-brand/20" },
    warning: { icon: "bg-amber-50 text-amber-600",      border: "border-amber-100" },
    success: { icon: "bg-emerald-50 text-emerald-600",  border: "border-emerald-100" },
    danger:  { icon: "bg-red-50 text-red-600",          border: "border-red-100" },
    neutral: { icon: "bg-zinc-100 text-zinc-500",       border: "border-zinc-200" },
  };
  const t = toneMap[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cn("rounded-xl border bg-white p-4 shadow-sm", t.border)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-zinc-500">{label}</p>
        <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", t.icon)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-zinc-400">{hint}</p>
    </motion.div>
  );
}

// ── Quick action ──────────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  description,
  href,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl border p-4 transition-all hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
        accent
          ? "border-brand/20 bg-brand-soft hover:border-brand/40"
          : "border-zinc-200 bg-white hover:bg-zinc-50"
      )}
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
          accent ? "bg-brand text-white" : "bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200"
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-semibold", accent ? "text-brand" : "text-zinc-800")}>
          {label}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400">{description}</p>
      </div>
      <ArrowRight
        className={cn(
          "h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5",
          accent ? "text-brand" : "text-zinc-300"
        )}
        aria-hidden="true"
      />
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const store = useAgentStore();
  const isIdle = store.status === "idle";
  const isBlocked = store.status === "blocked";
  const isRunning = store.status === "running";

  // Real metrics from store
  const successEvents = store.events.filter((e) => e.status === "success").length;
  const pendingApproval = store.approvalRequired ? 1 : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

      {/* ── Hero header ──────────────────────────── */}
      <section
        className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white px-6 py-8 sm:px-8 sm:py-10"
        aria-labelledby="overview-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 800px 300px at 0% 0%, rgba(37,99,235,0.06), transparent), radial-gradient(ellipse 500px 250px at 100% 100%, rgba(16,185,129,0.04), transparent)",
          }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  TrapKiller
                </span>
                <span className="h-px w-5 bg-zinc-200" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-dot-pulse"
                    aria-hidden="true"
                  />
                  Protection active
                </span>
              </div>
              <h1
                id="overview-heading"
                className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl"
              >
                AI Consumer Protection Agent
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-500">
                TrapKiller detects potential deceptive patterns, explains the evidence,
                and helps you navigate the web with more control — keeping you in charge
                of every irreversible decision.
              </p>
            </div>

            {isBlocked && (
              <Link
                href="/agent"
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ShieldAlert className="h-4 w-4 animate-dot-pulse" aria-hidden="true" />
                Approval Required
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── Metrics ──────────────────────────────── */}
      <section
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
        aria-label="Summary metrics"
      >
        <MetricCard
          icon={Zap}
          label="Investigations"
          value={store.task ? 1 : 0}
          hint={store.task ? `Investigating ${store.task.domain}` : "this session"}
          tone="brand"
          index={0}
        />
        <MetricCard
          icon={AlertTriangle}
          label="Patterns Detected"
          value={store.patterns.length}
          hint="automated estimate"
          tone="warning"
          index={1}
        />
        <MetricCard
          icon={BadgeCheck}
          label="Actions Completed"
          value={successEvents}
          hint="this session"
          tone="success"
          index={2}
        />
        <MetricCard
          icon={Clock}
          label="Awaiting Approval"
          value={pendingApproval}
          hint={pendingApproval > 0 ? "action required" : "none pending"}
          tone={pendingApproval > 0 ? "danger" : "neutral"}
          index={3}
        />
      </section>

      {/* ── Main two-column ───────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-3">

        {/* Left: pipeline + events (2/3) */}
        <div className="space-y-4 xl:col-span-2">

          {/* Agent pipeline */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Agent Pipeline
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-zinc-900">
                  {isIdle
                    ? "Pipeline idle"
                    : isRunning
                    ? "Session in progress"
                    : isBlocked
                    ? "Waiting for approval"
                    : "Pipeline complete"}
                </h2>
              </div>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold",
                  isBlocked
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : isRunning
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-400"
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isBlocked
                      ? "bg-amber-500 animate-dot-pulse"
                      : isRunning
                      ? "bg-emerald-500 animate-dot-pulse"
                      : "bg-zinc-300"
                  )}
                  aria-hidden="true"
                />
                {isBlocked ? "Approval Required" : isRunning ? "Active" : "Idle"}
              </span>
            </div>
            <AgentPipeline />
          </div>

          {/* Event stream */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <AgentEventStream events={store.events} maxHeight="h-[260px]" />
          </div>
        </div>

        {/* Right: quick actions + patterns + decision (1/3) */}
        <div className="space-y-4">

          {/* Quick actions */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Quick Actions
            </p>
            <div className="space-y-2">
              <QuickAction
                icon={ScanSearch}
                label="Scan a Website"
                description="Analyze any URL for patterns"
                href="/scanner"
                accent
              />
              <QuickAction
                icon={Bot}
                label="Open Agent"
                description="Start a guided investigation"
                href="/agent"
              />
              <QuickAction
                icon={History}
                label="View Activity"
                description="Browse the audit log"
                href="/activity"
              />
            </div>
          </div>

          {/* Agent decision (only when present) */}
          {store.decision && <AgentDecision decision={store.decision} />}

          {/* Detected patterns */}
          {store.patterns.length > 0 && (
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Potential Patterns
                </p>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  {store.patterns.length}
                </span>
              </div>
              <div className="space-y-2">
                {store.patterns.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-2.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5"
                  >
                    <span
                      className={cn(
                        "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                        p.severity === "critical" || p.severity === "high"
                          ? "bg-red-500"
                          : p.severity === "medium"
                          ? "bg-amber-500"
                          : "bg-zinc-400"
                      )}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-zinc-800">
                        {PATTERN_LABELS[p.type] ?? p.type}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500 truncate">
                        {p.element}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] tabular-nums font-medium text-zinc-400">
                      {p.confidence <= 1
                        ? `${Math.round(p.confidence * 100)}%`
                        : `${Math.round(p.confidence)}%`}
                    </span>
                  </div>
                ))}
                {store.patterns.length > 3 && (
                  <Link
                    href="/agent"
                    className="block text-center text-[11px] font-medium text-brand hover:underline mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
                  >
                    +{store.patterns.length - 3} more →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Verification result */}
          {store.verification && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[13px] font-semibold text-emerald-800">
                    Outcome Verified
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-700">
                    {store.verification.status}
                  </p>
                  {store.verification.proofId && (
                    <p className="mt-1 font-mono text-[10px] text-emerald-600/70">
                      Proof: {store.verification.proofId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty state / onboarding */}
          {isIdle && store.patterns.length === 0 && (
            <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center">
              <ShieldCheck
                className="mx-auto h-8 w-8 text-zinc-300"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold text-zinc-700">
                No investigations yet
              </p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-400">
                Start your first investigation to see how TrapKiller analyzes a webpage
                for deceptive patterns.
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/scanner">
                  <ScanSearch className="h-3.5 w-3.5" aria-hidden="true" />
                  Scan a Website
                </Link>
              </Button>
            </div>
          )}

          {/* Session metadata when active */}
          {store.task && (
            <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Current Session
              </p>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Domain</span>
                  <span className="font-medium text-zinc-700">{store.task.domain}</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Session ID</span>
                  <span className="font-mono text-zinc-500">
                    {store.task.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-zinc-500">Events</span>
                  <span className="font-medium text-zinc-700">{store.events.length}</span>
                </div>
              </div>
              <Link
                href="/agent"
                className="mt-2.5 flex items-center gap-1.5 text-[11px] font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded"
              >
                <Activity className="h-3 w-3" aria-hidden="true" />
                View agent
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
