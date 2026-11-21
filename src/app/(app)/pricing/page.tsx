"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Zap,
  Clock,
  Building2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PageHeader } from "@/components/ui/case";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("daypass");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the 24-Hour Day Pass work?",
      a: "You pay a one-time fee of ₹49. Your account instantly receives full Pro AI agent capabilities for exactly 24 hours. When the 24 hours conclude, your pass ends automatically. There is zero recurring billing, zero auto-debit, and your card is never charged again.",
    },
    {
      q: "Can I cancel multiple services during the 24 hours?",
      a: "Yes! There are no limits on how many websites or subscription services you can navigate and cancel within your active 24-hour window.",
    },
    {
      q: "What payment methods are supported in India?",
      a: "All major Indian payment methods are supported, including UPI (GPay, PhonePe, Paytm), RuPay / Visa / Mastercard debit & credit cards, and Netbanking.",
    },
    {
      q: "Does the agent cancel services without my permission?",
      a: "Never. By architecture, TrapKiller halts at the final irreversible step and requests your explicit human approval with a live preview before clicking.",
    },
  ];

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 p-6 sm:p-8">
      <PageHeader
        title="Plans & Pricing"
        lede="Transparent INR rates designed for consumer freedom. Never trapped in a subscription to cancel subscriptions."
      />

      {/* Trust banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-300/60 bg-amber-500/[0.06] p-4 text-[13px] text-amber-950">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
            <Clock className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Looking for a quick, one-time cancellation?</p>
            <p className="text-zinc-600">The ₹49 24-Hour Day Pass gives you 1 day of unlimited agent cancels and never auto-renews.</p>
          </div>
        </div>
        <Button
          size="sm"
          className="bg-amber-500 text-white hover:bg-amber-600"
          onClick={() => setSelectedPlan("daypass")}
        >
          Select 24h Pass
        </Button>
      </div>

      {/* Compact Pricing Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Free */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-border-strong">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-zinc-500">Free</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-[30px] font-bold text-foreground">₹0</span>
            <span className="text-[12px] text-zinc-500">/ forever</span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-600">
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
            href="/scanner"
            className="mt-5 inline-flex h-9 w-full items-center justify-center rounded-lg border border-border bg-zinc-50 text-[12px] font-semibold text-foreground transition-colors hover:bg-zinc-100"
          >
            Current Plan
          </Link>
        </div>

        {/* 2. 24-Hour Day Pass */}
        <div
          className={`relative flex flex-col rounded-2xl border-2 p-5 transition-all ${
            selectedPlan === "daypass"
              ? "border-amber-500 bg-amber-500/[0.04] shadow-[0_4px_24px_-8px_rgba(245,158,11,0.3)]"
              : "border-amber-300/80 bg-surface shadow-card hover:border-amber-400"
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-white shadow-xs">
              <Clock className="h-2.5 w-2.5" />
              24-Hour Pass
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-amber-700">One-Time</span>
            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-bold text-amber-800">Auto-Expires</span>
          </div>

          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-[30px] font-bold text-foreground">₹49</span>
            <span className="text-[12px] text-zinc-500">/ 24 hours</span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-700 font-medium">
            Full access for 24 hours to cancel all trapped services. Zero renewals.
          </p>

          <ul className="mt-4 flex-1 space-y-2 border-t border-amber-200/60 pt-4 text-[12px] text-zinc-700">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="font-semibold text-foreground">Unlimited cancellations (24h)</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>TinyFish anti-bot browser</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>Human-in-the-loop approval</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span>Screenshot proof downloads</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 shrink-0 text-amber-600" />
              <span className="font-bold text-amber-800">Ends in 24 hours automatically</span>
            </li>
          </ul>

          <Button
            className="mt-5 w-full bg-amber-500 text-[12px] font-semibold text-white hover:bg-amber-600"
            onClick={() => setSelectedPlan("daypass")}
          >
            Activate 24h Pass (₹49)
          </Button>
        </div>

        {/* 3. Monthly Pro */}
        <div
          className={`flex flex-col rounded-2xl border p-5 transition-all ${
            selectedPlan === "pro"
              ? "border-brand bg-brand/[0.04] shadow-card"
              : "border-border bg-surface shadow-card hover:border-brand/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-brand">Monthly Pro</span>
            <span className="rounded bg-brand-soft px-1.5 py-0.5 text-[9.5px] font-bold text-brand">Subscription</span>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-[30px] font-bold text-foreground">₹249</span>
            <span className="text-[12px] text-zinc-500">/ month</span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-600">
            For continuous monthly subscription hygiene and monitoring.
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
              <span>Neo4j path memory insights</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span>Proof vault with cloud sync</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
              <span>1-click cancel at any time</span>
            </li>
          </ul>

          <Button
            variant="outline"
            className="mt-5 w-full text-[12px] font-semibold hover:border-brand hover:text-brand"
            onClick={() => setSelectedPlan("pro")}
          >
            Choose Pro (₹249/mo)
          </Button>
        </div>

        {/* 4. Enterprise */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:border-border-strong">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-zinc-500">B2B & API</span>
            <Building2 className="h-3.5 w-3.5 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="font-display text-[30px] font-bold text-foreground">₹2,499</span>
            <span className="text-[12px] text-zinc-500">/ month</span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-zinc-600">
            For fintechs, neobanks, and e-commerce compliance teams.
          </p>

          <ul className="mt-4 flex-1 space-y-2 border-t border-border/70 pt-4 text-[12px] text-zinc-600">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 shrink-0 text-success" />
              <span>White-label cancellation API</span>
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
              <span>Dedicated SLA &amp; legal report</span>
            </li>
          </ul>

          <Button
            variant="outline"
            className="mt-5 w-full text-[12px] font-semibold"
            onClick={() => setSelectedPlan("enterprise")}
          >
            Contact Sales
          </Button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="h-4 w-4 text-brand" />
          <h3 className="font-display text-[16px] font-bold text-foreground">Frequently Asked Questions</h3>
        </div>
        <div className="divide-y divide-border/60">
          {faqs.map((faq, i) => (
            <div key={i} className="py-3">
              <button
                className="flex w-full items-center justify-between text-left text-[13.5px] font-semibold text-foreground"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span>{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="h-4 w-4 text-zinc-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-400" />
                )}
              </button>
              {openFaq === i && (
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
