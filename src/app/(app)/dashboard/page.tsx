"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Globe, ScanSearch } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoTargetUrl } from "@/lib/api";
import { AGENT_SHORT } from "@/lib/constants";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CountUp, Marker, Stat } from "@/components/ui/case";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const WATCHLIST = [
  { name: "Confirmshaming", plain: "Guilt-trip buttons like “No, I don’t want to save money”." },
  { name: "Roach motel", plain: "One click to join, a maze of screens to leave." },
  { name: "Forced continuity", plain: "A free trial that quietly becomes a paid plan." },
  { name: "False urgency", plain: "Fake countdowns and “only 2 left” pressure." },
];

const STATUS_COPY = {
  idle: "No case open. Scan a page or send the agent in.",
  running: "Working through the page now.",
  blocked: "Paused. It needs your approval to continue.",
  completed: "Finished the last case and saved proof.",
  failed: "Stopped before finishing. Check the case log.",
} as const;

const STATUS_CHIP = {
  idle: { label: "Idle", dot: "bg-zinc-400", tone: "border-border bg-zinc-50 text-zinc-600" },
  running: { label: "Working", dot: "bg-emerald-500 animate-dot-pulse", tone: "border-emerald-200 bg-success-soft text-emerald-700" },
  blocked: { label: "Approval needed", dot: "bg-amber-500 animate-dot-pulse", tone: "border-amber-200 bg-warning-soft text-amber-800" },
  completed: { label: "Case closed", dot: "bg-emerald-500", tone: "border-emerald-200 bg-success-soft text-emerald-700" },
  failed: { label: "Stopped", dot: "bg-red-500", tone: "border-red-200 bg-danger-soft text-red-700" },
} as const;

export default function OverviewPage() {
  const router = useRouter();
  const store = useAgentStore();
  const [url, setUrl] = useState("");
  const chip = STATUS_CHIP[store.status] ?? STATUS_CHIP.idle;

  const scan = (target: string) => router.push(`/scanner?url=${encodeURIComponent(target)}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = url.trim();
    if (t) scan(/^https?:\/\//i.test(t) ? t : `https://${t}`);
  };

  const stats = [
    { label: "cases this session", value: store.task ? 1 : 0, hint: "One case at a time" },
    { label: "traps caught", value: store.patterns.length, hint: "Each one quotes the page" },
    { label: "agent steps done", value: store.events.filter((e) => e.status === "success").length, hint: "Logged with a timestamp" },
    {
      label: "waiting for you",
      value: store.approvalRequired ? 1 : 0,
      hint: store.approvalRequired ? "Open the agent to decide" : "Nothing needs a decision",
      alert: store.approvalRequired,
    },
  ];
  const recent = [...store.events].reverse().slice(0, 6);

  return (
    <div className="space-y-10">
      {/* Hero: the question, and the place to answer it */}
      <section className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="eyebrow mb-4 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            Session overview
          </p>
          <h1 className="font-display max-w-[15ch] text-[44px] font-bold leading-[1.02] sm:text-[56px]">
            Which site is trying to <Marker delay={0.35}>trap you?</Marker>
          </h1>
          <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-zinc-500">
            Paste a subscription or checkout page. TrapKiller reads it like an investigator, marks every
            trick it finds, and only acts when you say so.
          </p>
          <form onSubmit={submit} className="mt-7 flex max-w-xl flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Page address</span>
              <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="netflix.com/account"
                className="h-12 w-full rounded-xl border border-border-strong bg-surface pl-11 pr-4 text-[15px] shadow-card placeholder:text-zinc-400 transition-shadow focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
              />
            </label>
            <Button type="submit" size="lg" className="h-12 px-6">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Scan page
            </Button>
          </form>
          <button
            type="button"
            onClick={() => scan(demoTargetUrl())}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none"
          >
            No page handy? Try the StreamVault test site
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <Link
          href="/agent"
          className="panel panel-hover group relative overflow-hidden p-5 focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/10 blur-2xl"
          />
          <div className="relative flex items-center justify-between gap-2">
            <span className="eyebrow">The agent</span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold", chip.tone)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", chip.dot)} aria-hidden="true" />
              {chip.label}
            </span>
          </div>
          <p className="font-display relative mt-4 text-[22px] font-bold leading-tight">
            {store.task ? store.task.domain : "Ready when you are"}
          </p>
          <p className="relative mt-1.5 text-[13px] leading-relaxed text-zinc-500">
            {STATUS_COPY[store.status] ?? STATUS_COPY.idle}
          </p>
          <div className="relative mt-4 flex items-center justify-between border-t border-border pt-3">
            <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-400">
              <Bot className="h-3 w-3" aria-hidden="true" />
              Live panel
            </span>
            <ArrowUpRight className="h-4 w-4 text-zinc-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>
        </Link>
      </section>

      {/* This session, in four numbers */}
      <Reveal>
        <section aria-label="This session" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <Stat
              key={s.label}
              label={s.label}
              value={<CountUp to={s.value} />}
              hint={s.hint}
              tone={s.alert ? "warning" : "ink"}
            />
          ))}
        </section>
      </Reveal>

      <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reveal>
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-display text-[17px] font-semibold">Latest from the agent</h2>
                <p className="mt-0.5 text-[12px] text-zinc-500">Newest first, with the time each step ran.</p>
              </div>
              <Link href="/activity" className="text-[12px] font-semibold text-brand hover:underline">
                Full log
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="m-5 rounded-xl border border-dashed border-border-strong bg-zinc-50/60 px-5 py-10 text-center text-[13.5px] text-zinc-500">
                Nothing yet. Every step the agent takes will be logged here, with a timestamp.
              </p>
            ) : (
              <ol className="divide-y divide-border">
                {recent.map((e, i) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-baseline gap-4 px-5 py-3"
                  >
                    <time className="w-16 shrink-0 font-mono text-[11.5px] text-zinc-400">{formatTime(e.timestamp)}</time>
                    <span
                      className={cn(
                        "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                        e.status === "success" ? "bg-emerald-500" : e.status === "error" ? "bg-red-500" : "bg-zinc-300"
                      )}
                      aria-hidden="true"
                    />
                    <p className="min-w-0 flex-1 text-[13.5px] leading-relaxed">
                      <span className="font-semibold">{AGENT_SHORT[e.agent]}</span>
                      <span className="text-zinc-600"> {e.message}</span>
                    </p>
                  </motion.li>
                ))}
              </ol>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="panel h-full p-5">
            <h2 className="font-display text-[17px] font-semibold">What it looks for</h2>
            <p className="mt-0.5 text-[12px] text-zinc-500">Four of the 13 patterns in the detector.</p>
            <Stagger className="mt-4 space-y-4">
              {WATCHLIST.map((p, i) => (
                <StaggerItem key={p.name}>
                  <div className="flex gap-3">
                    <span className="font-mono text-[10px] tabular-nums text-zinc-300">0{i + 1}</span>
                    <div>
                      <p className="text-[14px] font-semibold leading-tight">
                        <Marker delay={0.4 + i * 0.1}>{p.name}</Marker>
                      </p>
                      <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-500">{p.plain}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
