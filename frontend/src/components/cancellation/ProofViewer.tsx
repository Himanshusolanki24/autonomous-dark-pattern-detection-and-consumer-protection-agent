"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Camera, CheckCircle2, Copy } from "lucide-react";
import type { VerificationResult } from "@/lib/types";
import { formatTimestamp, shortId } from "@/lib/utils";

function ProofThumbnail() {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-zinc-100">
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-1 border-b border-zinc-200 bg-white px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="ml-1 h-1.5 w-1.5 rounded-full bg-zinc-300" />
          <span className="ml-2 flex-1 rounded bg-zinc-100 px-2 py-0.5 font-mono text-[8px] text-zinc-400">
            netflix.com/account
          </span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-white px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </span>
          <p className="mt-1.5 text-[10px] font-semibold">Membership Cancelled</p>
          <p className="mt-0.5 text-[8px] text-zinc-400">
            Premium · 4K · access until 16 Sep 2026
          </p>
        </div>
      </div>
      <span className="absolute bottom-1.5 right-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-medium text-white">
        <Camera className="h-2.5 w-2.5" />
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
      className="overflow-hidden rounded-2xl border border-emerald-200 bg-surface shadow-sm"
    >
      <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Cancellation Verified
          </p>
          <p className="text-xs text-emerald-700/70">{verification.service}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-5">
        <ProofThumbnail />
        <div>
          <h3 className="text-lg font-semibold text-emerald-700">Cancelled successfully</h3>
          <p className="mt-1 text-sm text-zinc-600">
            {verification.plan} · {formatTimestamp(verification.timestamp)}
          </p>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-muted-foreground">Status</dt>
              <dd className="truncate text-right font-medium text-emerald-600">{verification.status}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-muted-foreground">Verification method</dt>
              <dd className="truncate text-right text-zinc-700">{verification.method}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-2">
              <dt className="shrink-0 text-muted-foreground">Proof ID</dt>
              <dd className="flex items-center gap-1.5 overflow-hidden">
                <code className="truncate rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                  {shortId(verification.proofId)}
                </code>
                <button
                  onClick={() => {
                    void navigator.clipboard?.writeText(verification.proofId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="shrink-0 rounded p-1 text-zinc-400 transition-colors hover:text-zinc-600"
                  aria-label="Copy proof ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {copied && <span className="shrink-0 text-[11px] text-emerald-600">copied</span>}
              </dd>
            </div>
          </dl>

          <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 transition-colors hover:text-emerald-800">
            View Proof
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}