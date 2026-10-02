"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Globe, ScanSearch } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoTargetUrl } from "@/lib/api";
import { AGENT_SHORT } from "@/lib/constants";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CountUp, Marker } from "@/components/ui/case";

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

export default function OverviewPage() {
  const router = useRouter();
  const store = useAgentStore();
  const [url, setUrl] = useState("");

  const scan = (target: string) => router.push(`/scanner?url=${encodeURIComponent(target)}`);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = url.trim();
    if (t) scan(/^https?:\/\//i.test(t) ? t : `https://${t}`);
  };

  const stats = [
    { label: "cases this session", value: store.task ? 1 : 0 },
    { label: "traps caught", value: store.patterns.length },
    { label: "agent steps done", value: store.events.filter((e) => e.status === "success").length },
    { label: "waiting for you", value: store.approvalRequired ? 1 : 0, alert: store.approvalRequired },
  ];
  const recent = [...store.events].reverse().slice(0, 6);

  return (
    <div className="space-y-12">
      {/* Hero: the question, and the place to answer it */}
      <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <h1 className="max-w-[16ch] text-[44px] font-bold leading-[1.02] sm:text-[56px]">
            Which site is trying to <Marker delay={0.35}>trap you?</Marker>
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-zinc-500">
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
                className="h-12 w-full rounded-xl border border-border-strong bg-surface pl-11 pr-4 text-[15px] placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
              />
            </label>
            <Button type="submit" size="lg" className="h-12 rounded-xl px-6">
              <ScanSearch className="h-4 w-4" aria-hidden="true" />
              Scan page
            </Button>
          </form>
          <button
            type="button"
            onClick={() => scan(demoTargetUrl())}
            className="mt-3 text-[13px] font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            No page handy? Try the StreamVault test site
          </button>
        </div>

        <Link
          href="/agent"
          className="group rounded-2xl bg-foreground p-5 text-white transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <p className="flex items-center justify-between text-[13px] text-white/60">
            The agent
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </p>
          <p className="font-display mt-3 text-[22px] font-bold leading-tight">
            {store.task ? store.task.domain : "Ready when you are"}
          </p>
          <p className={cn("mt-1.5 text-[13.5px]", store.status === "blocked" ? "text-marker" : "text-white/70")}>
            {STATUS_COPY[store.status] ?? STATUS_COPY.idle}
          </p>
        </Link>
      </section>

      {/* One strip of numbers instead of a grid of identical cards */}
      <section aria-label="This session" className="grid grid-cols-2 border-y border-border sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className={cn("py-5", i > 0 && "sm:border-l sm:border-border sm:pl-6", i % 2 === 1 && "border-l border-border pl-6")}>
            <p className={cn("font-display text-[36px] font-bold leading-none tabular-nums", s.alert && "text-amber-600")}>
              <CountUp to={s.value} />
            </p>
            <p className="mt-1.5 text-[13px] text-zinc-500">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <h2 className="text-[22px] font-bold">Latest from the agent</h2>
          {recent.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border-strong px-5 py-10 text-center text-[14px] text-zinc-500">
              Nothing yet. Every step the agent takes will be logged here, with a timestamp.
            </p>
          ) : (
            <ol className="mt-4 divide-y divide-border">
              {recent.map((e, i) => (
                <motion.li
                  key={e.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-baseline gap-4 py-3"
                >
                  <time className="w-16 shrink-0 font-mono text-[12px] text-zinc-400">{formatTime(e.timestamp)}</time>
                  <p className="min-w-0 flex-1 text-[14px]">
                    <span className="font-semibold">{AGENT_SHORT[e.agent]}</span>
                    <span className="text-zinc-600"> {e.message}</span>
                  </p>
                </motion.li>
              ))}
            </ol>
          )}
        </div>

        <aside>
          <h2 className="text-[22px] font-bold">What it looks for</h2>
          <ul className="mt-4 space-y-4">
            {WATCHLIST.map((p, i) => (
              <li key={p.name}>
                <p className="text-[15px] font-semibold">
                  <Marker delay={0.6 + i * 0.12}>{p.name}</Marker>
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-500">{p.plain}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}
