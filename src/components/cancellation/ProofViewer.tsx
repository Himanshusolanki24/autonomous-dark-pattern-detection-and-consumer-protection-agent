"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, CheckCircle2, Copy, ShieldCheck } from "lucide-react";
import type { VerificationResult } from "@/lib/types";
import { formatTimestamp, shortId } from "@/lib/utils";
import { Stamp } from "@/components/ui/case";

function ProofThumbnail() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-zinc-100">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5f57]" />
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#febc2e]" />
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 flex-1 truncate rounded bg-zinc-100 px-2 py-0.5 font-mono text-[8px] text-zinc-400">
            netflix.com/account
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-surface px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success-soft">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="font-display mt-1.5 text-[10px] font-semibold">Membership Cancelled</p>
          <p className="mt-0.5 text-[8px] text-zinc-400">Premium · 4K · access until 16 Sep 2026</p>
        </div>
      </div>
      <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded bg-foreground/70 px-1.5 py-0.5 text-[8px] font-medium text-white">
        <Camera className="h-2.5 w-2.5" aria-hidden="true" />
        captured
      </span>
    </div>
  );
}

export function ProofViewer({ verification }: { verification: VerificationResult }) {
  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-surface shadow-card"
    >
      <span aria-hidden="true" className="block h-1 w-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400" />

      <div className="flex items-center gap-2.5 border-b border-emerald-100 bg-success-soft/60 px-5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-emerald-600 shadow-card">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-700">Cancellation verified</p>
          <p className="truncate text-[12px] text-emerald-800/70">{verification.service}</p>
        </div>
        <span className="ml-auto shrink-0">
          <Stamp>Verified</Stamp>
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <ProofThumbnail />
        <div>
          <h3 className="font-display text-[17px] font-bold text-emerald-700">Cancelled successfully</h3>
          <p className="mt-1 text-[12px] text-zinc-500">
            {verification.plan} · {formatTimestamp(verification.timestamp)}
          </p>

          <dl className="mt-4 divide-y divide-border/70 border-y border-border/70">
            <div className="flex items-baseline justify-between gap-2 py-2">
              <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-zinc-400">Status</dt>
              <dd className="truncate text-right text-[12.5px] font-semibold text-emerald-600">{verification.status}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2 py-2">
              <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-zinc-400">Method</dt>
              <dd className="truncate text-right text-[12.5px] text-zinc-700">{verification.method}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2 py-2">
              <dt className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.1em] text-zinc-400">Proof ID</dt>
              <dd className="flex min-w-0 items-center gap-1.5">
                <code className="truncate rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700">
                  {shortId(verification.proofId)}
                </code>
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(verification.proofId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:text-zinc-600 focus-visible:outline-none"
                  aria-label="Copy proof ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && <span className="shrink-0 text-[10.5px] text-emerald-600">copied</span>}
              </dd>
            </div>
          </dl>

          <button className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700 transition-colors hover:text-emerald-800 focus-visible:outline-none">
            View proof
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
