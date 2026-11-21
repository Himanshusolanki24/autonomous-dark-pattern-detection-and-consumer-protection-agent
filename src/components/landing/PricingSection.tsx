import Link from "next/link";
import { Check, Shield, Zap, Clock, ArrowRight, Sparkles, Building2 } from "lucide-react";

export function PricingSection() {
  return (
    <section id="pricing" className="relative border-t border-border bg-surface/40 py-12 sm:py-16">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* Compact Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-0.5 text-[11px] font-medium text-zinc-600 shadow-xs">
            <Sparkles className="h-3 w-3 text-brand" />
            Transparent Pricing in ₹ INR
          </span>
          <h2 className="font-display mt-3 text-[26px] font-bold tracking-tight text-foreground sm:text-[34px]">
            No hidden fees. <span className="text-brand">Never a trap</span> to cancel traps.
          </h2>
          <p className="mt-2 text-[14px] text-zinc-600">
            Choose what fits you best — including a one-time 24-hour pass so you can cancel all your subscriptions today with zero recurring commitment.
          </p>
        </div>

        {/* Compact 4-Column Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Free Starter */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-zinc-500">Free</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-[30px] font-bold text-foreground">₹0</span>
              <span className="text-[12px] text-zinc-500">/ forever</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-600">
              Read-only scanner to inspect any checkout or subscription page.
            </p>

            <ul className="mt-4 flex-1 space-y-2 border-t border-border/70 pt-4 text-[12px] text-zinc-600">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>Unlimited page scans</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>13 dark pattern classes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>StreamVault test site access</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>1 demo agent trial run</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-zinc-50 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-zinc-100"
            >
              Start Free
            </Link>
          </div>

          {/* 2. 24-Hour Day Pass (Special feature) */}
          <div className="relative flex flex-col rounded-2xl border-2 border-amber-400/80 bg-gradient-to-b from-amber-500/[0.04] to-surface p-5 shadow-[0_4px_24px_-8px_rgba(245,158,11,0.25)] transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
                <Clock className="h-2.5 w-2.5" />
                24-Hour Day Pass
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-amber-700">One-Time Freedom</span>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-800">No Renewal</span>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-[30px] font-bold text-foreground">₹149</span>
              <span className="text-[12px] text-zinc-500">/ 24 hours</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-700 font-medium">
              Cancel all your services in one day. Access automatically shuts off in 24 hours.
            </p>

            <ul className="mt-4 flex-1 space-y-2 border-t border-amber-200/60 pt-4 text-[12px] text-zinc-700">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="font-medium text-foreground">Unlimited cancellations for 24h</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>TinyFish anti-bot cloud browser</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>Human-approval safety gate</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span>Verified screenshot proof export</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                <span className="font-semibold text-amber-800">100% Zero recurring charge</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 text-[12.5px] font-semibold text-white shadow-xs transition-colors hover:bg-amber-600 active:scale-[0.98]"
            >
              Get 24h Pass (₹149)
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* 3. Monthly Pro */}
          <div className="flex flex-col rounded-2xl border border-brand/50 bg-gradient-to-b from-brand/[0.03] to-surface p-5 shadow-card transition-all hover:border-brand">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-brand">Monthly Pro</span>
              <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-bold text-brand">Subscription</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-[30px] font-bold text-foreground">₹249</span>
              <span className="text-[12px] text-zinc-500">/ month</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-600">
              Continuous protection and anytime cancellation for active digital users.
            </p>

            <ul className="mt-4 flex-1 space-y-2 border-t border-border/70 pt-4 text-[12px] text-zinc-600">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span className="font-medium text-foreground">Unlimited cancellations anytime</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span>Priority cloud browser queue</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span>Permanent proof archive vault</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span>Neo4j path memory insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                <span>1-click cancel with no questions</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-lg bg-brand text-[12.5px] font-semibold text-white shadow-xs transition-colors hover:bg-brand/90 active:scale-[0.98]"
            >
              Start Pro (₹249/mo)
            </Link>
          </div>

          {/* 4. Enterprise & API */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-border-strong">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-zinc-500">B2B & API</span>
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-[30px] font-bold text-foreground">₹2,499</span>
              <span className="text-[12px] text-zinc-500">/ month</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-zinc-600">
              For fintechs, neobanks, and e-commerce compliance teams.
            </p>

            <ul className="mt-4 flex-1 space-y-2 border-t border-border/70 pt-4 text-[12px] text-zinc-600">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>White-label &quot;Cancel for Me&quot; API</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>Checkout compliance scanner</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>Webhook &amp; SIEM audit logs</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-success" />
                <span>Dedicated SLA &amp; legal reporting</span>
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-zinc-50 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-zinc-100"
            >
              Contact Sales / API
            </Link>
          </div>
        </div>

        {/* Compact Trust Guarantee */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-center text-[12px] text-zinc-600 shadow-xs">
          <Shield className="h-4 w-4 text-brand shrink-0" />
          <span>
            <strong className="text-foreground">Strict Anti-Forced-Continuity Promise:</strong> The 24-Hour Day Pass terminates automatically after 24 hours. Your card is never auto-charged again.
          </span>
        </div>
      </div>
    </section>
  );
}
