"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BrowserState, PatternType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DarkPatternHighlight } from "./DarkPatternHighlight";

/**
 * PagePreview — DEMO MODE ONLY
 * Shows a generic fictional service "StreamFlow" — not any real brand.
 * Real investigation flow uses backend Playwright screenshots.
 */

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[420px] flex-col bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5">
        <span className="text-sm font-bold tracking-tight">
          stream<span className="text-blue-600">flow</span>
        </span>
        <nav className="flex items-center gap-4 text-xs text-zinc-600">
          <span className="hidden sm:inline">Browse</span>
          <span className="hidden sm:inline">My List</span>
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-white">
            Account ▾
          </span>
        </nav>
      </header>
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}

function DemoButton({
  children,
  variant = "ghost",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "muted";
}) {
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cn(
        "pointer-events-none rounded-md text-sm font-medium",
        variant === "primary" && "bg-blue-600 px-4 py-2 text-white",
        variant === "ghost" && "border border-zinc-300 px-4 py-2 text-zinc-700",
        variant === "muted" && "px-2 py-1 text-xs text-zinc-400 underline decoration-dotted underline-offset-2"
      )}
    >
      {children}
    </button>
  );
}

function PlansPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h2 className="text-lg font-semibold">Choose a plan</h2>
      <p className="mt-1 text-sm text-zinc-500">Select the plan that works best for you.</p>
      <div className="mt-4 grid gap-3">
        {[
          ["Basic", "₹199", "1 screen · SD quality"],
          ["Standard", "₹349", "2 screens · Full HD"],
          ["Premium", "₹549", "4 screens · 4K + HDR"],
          ["Family", "₹699", "6 screens · 4K + Downloads"],
        ].map(([name, price, detail], i) => (
          <div
            key={name}
            className={cn(
              "flex items-center justify-between rounded-lg border bg-white p-3",
              i === 2 ? "border-blue-500 ring-1 ring-blue-500" : "border-zinc-200"
            )}
          >
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-zinc-500">{detail}</p>
            </div>
            <span className="text-sm font-semibold">{price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountPage({ onElementClick }: { onElementClick?: (p: PatternType) => void }) {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Account</h2>
      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Membership</p>
        <p className="mt-1 text-sm font-medium">Premium · 4K</p>
        <p className="text-xs text-zinc-500">₹549 / month · next charge 16 Sep</p>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Plan Details</p>
        <div className="mt-2 space-y-1 text-sm text-zinc-700">
          <p>Premium 4K + HDR</p>
          <p className="text-xs text-zinc-500">Subscription renews automatically each month.</p>
        </div>
        <div className="mt-3 flex gap-2">
          <DemoButton variant="ghost">Change plan</DemoButton>
          <DemoButton variant="ghost">Payment method</DemoButton>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700">Cancel Membership</p>
            <p className="text-xs text-zinc-500">Access continues until end of billing period.</p>
          </div>
          <DarkPatternHighlight patternType="roach-motel" confidence={91} label="Hard to find" onClick={onElementClick}>
            <DemoButton variant="muted">Cancel</DemoButton>
          </DarkPatternHighlight>
        </div>
      </div>
    </div>
  );
}

function CancelPage({ onElementClick }: { onElementClick?: (p: PatternType) => void }) {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Cancel Membership</h2>
      <p className="mt-1 text-sm text-zinc-500">We&apos;d hate to see you go.</p>
      <div className="mt-5 space-y-3">
        <div className="rounded-lg border-2 border-blue-500 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-800">Keep My Premium Benefits</p>
          <p className="mt-0.5 text-xs text-zinc-500">Continue watching in 4K on 4 screens, ad-free.</p>
        </div>
        <DarkPatternHighlight patternType="confirmshaming" confidence={94} label="Guilt language" onClick={onElementClick}>
          <button type="button" tabIndex={-1} className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left">
            <p className="text-sm font-medium text-zinc-400">No, I don&apos;t want to keep my benefits</p>
            <p className="mt-0.5 text-xs text-zinc-300">Continue to cancellation — you&apos;ll lose access.</p>
          </button>
        </DarkPatternHighlight>
      </div>
    </div>
  );
}

function RetentionPage() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Wait — don&apos;t go yet</h2>
      <p className="mt-1 text-sm text-zinc-500">We have an offer for you:</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-blue-500 bg-white p-4">
          <p className="text-sm font-semibold text-blue-600">Pause for 1 month</p>
          <p className="text-xs text-zinc-500">Keep your plan active, pay nothing this month.</p>
          <div className="mt-2"><DemoButton variant="primary">Accept offer</DemoButton></div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm font-medium">Continue cancelling</p>
          <p className="text-xs text-zinc-500">Proceed with cancellation.</p>
          <div className="mt-2"><DemoButton variant="ghost">Continue →</DemoButton></div>
        </div>
      </div>
    </div>
  );
}

function ConfirmPage() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Confirm Cancellation</h2>
      <p className="mt-1 text-sm text-zinc-500">Your Premium membership will end today.</p>
      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Summary</p>
        <div className="mt-2 space-y-1 text-sm text-zinc-700">
          <div className="flex justify-between"><span>Plan</span><span>Premium · 4K</span></div>
          <div className="flex justify-between"><span>Ends</span><span>Today</span></div>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-medium text-amber-700">This action may be irreversible</p>
        <p className="mt-0.5 text-xs text-amber-600/80">Access may end immediately in some regions.</p>
      </div>
      <div className="mt-4"><DemoButton variant="primary">Confirm Cancellation</DemoButton></div>
    </div>
  );
}

function SuccessPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold">Membership Cancelled</h2>
      <p className="mt-1 text-sm text-zinc-500">Your Premium membership has been cancelled.</p>
      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm">
        <div className="flex justify-between"><span className="text-zinc-500">Plan</span><span>Premium · 4K</span></div>
        <div className="mt-1 flex justify-between"><span className="text-zinc-500">Status</span><span className="font-medium text-emerald-600">Cancelled</span></div>
        <div className="mt-1 flex justify-between"><span className="text-zinc-500">Access until</span><span>16 Sep 2026</span></div>
      </div>
    </div>
  );
}

export function PagePreview({
  browser,
  onElementClick,
}: {
  browser: BrowserState;
  onElementClick?: (pattern: PatternType) => void;
}) {
  const screen = browser.screen;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={screen}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="min-h-[420px]"
      >
        <Shell>
          {screen === "plans" && <PlansPage />}
          {screen === "account" && <AccountPage onElementClick={onElementClick} />}
          {screen === "cancel" && <CancelPage onElementClick={onElementClick} />}
          {screen === "retention" && <RetentionPage />}
          {screen === "confirm" && <ConfirmPage />}
          {screen === "success" && <SuccessPage />}
          {(screen === "empty" || !screen) && (
            <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-zinc-400">
              <p className="text-sm">No page loaded in this session.</p>
            </div>
          )}
        </Shell>
      </motion.div>
    </AnimatePresence>
  );
}
