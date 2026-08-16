"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  ScanSearch,
  ShieldCheck,
  ShieldAlert,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoSimulator } from "@/lib/services/simulator";
import { mockTasks, mockActivity } from "@/lib/data";
import { AGENT_LABELS, PATTERN_LABELS } from "@/lib/constants";
import { AgentPipeline } from "@/components/agent/AgentPipeline";
import { AgentEventStream } from "@/components/agent/AgentEventStream";
import { AgentDecision } from "@/components/agent/AgentDecision";
import { DetectionOverlay } from "@/components/scanner/DetectionOverlay";
import { BrowserFrame } from "@/components/browser/BrowserFrame";
import { ConfidenceBar } from "@/components/ui/confidence-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { cn, severityTone } from "@/lib/utils";

export default function OverviewPage() {
  const store = useAgentStore();
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [streamCollapsed, setStreamCollapsed] = useState(false);

  const startAgent = useCallback(() => {
    demoSimulator.start(mockTasks[0]);
  }, []);

  const pattern = store.patterns.find((p) => p.id === selectedPattern) ?? null;

  const activeStage = (Object.entries(store.stageStates).find(
    ([, s]) => s === "running"
  )?.[0] ?? null) as keyof typeof AGENT_LABELS | null;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface px-6 py-10 shadow-sm sm:px-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            background:
              "radial-gradient(600px 200px at 10% 0%, rgba(37,99,235,0.08), transparent), radial-gradient(500px 180px at 90% 0%, rgba(16,185,129,0.07), transparent)",
          }}
          aria-hidden="true"
        />
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">
            TrapKiller
          </p>
          <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Your subscriptions. <span className="text-zinc-400">Your control.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Detect manipulative interfaces and let your AI agent navigate
            cancellation flows for you — while keeping you in control of the
            final irreversible action.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={startAgent}>
              <Play className="h-4 w-4" />
              Start Agent
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/scanner">
                <ScanSearch className="h-4 w-4" />
                Scan a Page
              </Link>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <StatusDot className="bg-brand" /> Perceives
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot className="bg-amber-500" /> Detects dark patterns
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot className="bg-indigo-500" /> Plans actions
            </span>
            <span className="inline-flex items-center gap-1.5">
              <StatusDot className="bg-emerald-500" /> Verifies outcomes
            </span>
          </div>
        </motion.div>
      </section>

      {/* Metrics */}
      <section
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        aria-label="Summary metrics"
      >
        <MetricCard
          icon={ShieldCheck}
          label="Protected sessions"
          value={12}
          hint="this month"
          tone="brand"
          index={0}
        />
        <MetricCard
          icon={ShieldAlert}
          label="Dark patterns detected"
          value={47}
          hint="across 3 sites"
          tone="warning"
          index={1}
        />
        <MetricCard
          icon={BadgeCheck}
          label="Cancellations verified"
          value={8}
          hint="100% approval"
          tone="success"
          index={2}
        />
        <MetricCard
          icon={Clock}
          label="Awaiting approval"
          value={1}
          hint="action required"
          tone="danger"
          index={3}
        />
      </section>

      {/* Live agent panel */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Agent Activity</CardTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                <StatusDot className="bg-emerald-500 animate-dot-pulse" />
                ACTIVE
              </span>
            </CardHeader>
            <CardContent>
              <AgentPipeline />
              {activeStage && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Currently executing:{" "}
                  <span className="font-medium text-brand">
                    {AGENT_LABELS[activeStage]}
                  </span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Live page view</CardTitle>
              <p className="text-xs text-muted-foreground">
                The agent operates inside the user&apos;s authenticated browser session.
              </p>
            </CardHeader>
            <CardContent className="relative">
              <DetectionOverlay
                pattern={pattern}
                onClose={() => setSelectedPattern(null)}
              />
              <BrowserFrame
                browser={store.browser}
                onElementClick={(t) => {
                  const hit = store.patterns.find((p) => p.type === t);
                  if (hit) setSelectedPattern(hit.id);
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <AgentEventStream
                events={store.events}
                collapsed={streamCollapsed}
                onCollapse={() => setStreamCollapsed((v) => !v)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dark Pattern Detection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {store.patterns.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No dark patterns detected yet. Start the agent to scan the
                  current page.
                </p>
              ) : (
                store.patterns.map((p) => {
                  const tone = severityTone(p.severity);
                  return (
                    <div key={p.id} className="rounded-lg border border-border bg-zinc-50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">
                          {PATTERN_LABELS[p.type]}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                            tone.badge
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
                          {p.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-muted-foreground">{p.element}</p>
                      <ConfidenceBar confidence={p.confidence} className="mt-2" />
                      <p className="mt-2 text-xs text-zinc-600">{p.explanation}</p>
                    </div>
                  );
                })
              )}
              <div className="rounded-lg border border-brand/20 bg-brand-soft p-3 text-xs text-blue-700">
                <p className="font-medium">Why this matters</p>
                <p className="mt-1 leading-5 text-blue-700/80">
                  These patterns make leaving intentionally difficult. The agent
                  identifies them so the exit path stays visible and simple.
                </p>
              </div>
            </CardContent>
          </Card>

          <AgentDecision decision={store.decision} />
          <RecentActivity items={mockActivity} />
        </div>
      </section>
    </div>
  );
}