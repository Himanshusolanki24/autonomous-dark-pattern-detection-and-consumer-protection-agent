"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BrowserState, PatternType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DarkPatternHighlight } from "./DarkPatternHighlight";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[420px] flex-col bg-zinc-50 text-zinc-900">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2.5">
        <span className="text-sm font-bold tracking-tight text-red-600">netflix</span>
        <nav className="flex items-center gap-4 text-xs text-zinc-600">
          <span className="hidden sm:inline">Home</span>
          <span className="hidden sm:inline">TV Shows</span>
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-white">
            Profile ▾
          </span>
        </nav>
      </header>
      <div className="flex-1 p-4 sm:p-6">{children}</div>
    </div>
  );
}

function BillingButton({
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
        variant === "primary" && "bg-red-600 px-4 py-2 text-white",
        variant === "ghost" && "border border-zinc-300 px-4 py-2 text-zinc-700",
        variant === "muted" &&
          "px-2 py-1 text-xs text-zinc-400 underline decoration-dotted underline-offset-2"
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
      <p className="mt-1 text-sm text-zinc-500">Pick the plan that fits your screen.</p>
      <div className="mt-4 grid gap-3">
        {[
          ["Mobile", "₹199", "1 screen"],
          ["Basic", "₹299", "1 screen · HD"],
          ["Standard", "₹499", "2 screens · Full HD"],
          ["Premium", "₹649", "4 screens · 4K"],
        ].map(([name, price, detail], i) => (
          <div
            key={name}
            className={cn(
              "flex items-center justify-between rounded-lg border bg-white p-3",
              i === 3 ? "border-red-600 ring-1 ring-red-600" : "border-zinc-200"
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
        <p className="text-xs text-zinc-500">₹649 / month · next charge 16 Sep</p>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Plan Details</p>
        <div className="mt-2 space-y-1 text-sm text-zinc-700">
          <p>Premium 4K + HDR</p>
          <p className="text-xs text-zinc-500">Your plan renews monthly.</p>
        </div>
        <div className="mt-3 flex gap-2">
          <BillingButton variant="ghost">Change plan</BillingButton>
          <BillingButton variant="ghost">Update payment method</BillingButton>
        </div>
      </div>
      <div className="mt-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-700">Cancel Membership</p>
            <p className="text-xs text-zinc-500">
              You&apos;ll keep access until the end of your billing period.
            </p>
          </div>
          <DarkPatternHighlight
            patternType="roach-motel"
            confidence={91}
            label="Hard to find"
            onClick={onElementClick}
          >
            <BillingButton variant="muted">Cancel</BillingButton>
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
      <p className="mt-1 text-sm text-zinc-500">We&apos;re sorry to see you go.</p>
      <div className="mt-5 space-y-3">
        <div className="rounded-lg border-2 border-red-500 bg-white p-4 shadow-sm">
          <p className="text-sm font-medium text-zinc-800">Keep My Premium Benefits</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Continue watching ad-free in 4K on 4 screens.
          </p>
        </div>
        <DarkPatternHighlight
          patternType="confirmshaming"
          confidence={94}
          label="Guilt language"
          onClick={onElementClick}
        >
          <button
            type="button"
            tabIndex={-1}
            className="w-full rounded-lg border border-zinc-200 bg-white p-4 text-left"
          >
            <p className="text-sm font-medium text-zinc-400">
              No, I don&apos;t want to keep my benefits
            </p>
            <p className="mt-0.5 text-xs text-zinc-300">
              Continue to cancellation — you&apos;ll lose access to everything.
            </p>
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
      <p className="mt-1 text-sm text-zinc-500">We&apos;d love to keep you. Choose an offer below:</p>
      <div className="mt-4 space-y-3">
        <div className="rounded-lg border border-red-500 bg-white p-4">
          <p className="text-sm font-semibold text-red-600">Pause for 1 month</p>
          <p className="text-xs text-zinc-500">Keep your plan, pay nothing this month.</p>
          <div className="mt-2">
            <BillingButton variant="primary">Keep me</BillingButton>
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm font-medium">Continue cancelling</p>
          <p className="text-xs text-zinc-500">
            Proceed with cancellation on your current plan.
          </p>
          <div className="mt-2">
            <BillingButton variant="ghost">Continue →</BillingButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmPage() {
  return (
    <div className="mx-auto max-w-md">
      <h2 className="text-lg font-semibold">Finish Cancellation</h2>
      <p className="mt-1 text-sm text-zinc-500">Your Premium membership will end today.</p>
      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-400">Summary</p>
        <div className="mt-2 space-y-1 text-sm text-zinc-700">
          <div className="flex justify-between">
            <span>Plan</span>
            <span>Premium · 4K</span>
          </div>
          <div className="flex justify-between">
            <span>Ends</span>
            <span>Today</span>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">This will cancel your membership</p>
        <p className="mt-0.5 text-xs text-red-600/80">You won&apos;t be able to watch after today.</p>
      </div>
      <div className="mt-4">
        <BillingButton variant="primary">Cancel Membership</BillingButton>
      </div>
    </div>
  );
}

function SuccessPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-emerald-600"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold">Membership Cancelled</h2>
      <p className="mt-1 text-sm text-zinc-500">Your Premium membership has been cancelled.</p>
      <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4 text-left text-sm">
        <div className="flex justify-between">
          <span className="text-zinc-500">Plan</span>
          <span>Premium · 4K</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-zinc-500">Status</span>
          <span className="font-medium text-emerald-600">Cancelled</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-zinc-500">Access until</span>
          <span>16 Sep 2026</span>
        </div>
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
        </Shell>
      </motion.div>
    </AnimatePresence>
  );
}