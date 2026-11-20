"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Ban, Check, Info, ShieldAlert, TriangleAlert, UserCheck, X } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoSimulator } from "@/lib/services/simulator";
import { approveSession, rejectSession } from "@/lib/services/agentService";
import { Button } from "@/components/ui/button";

export function ApprovalModal() {
  const approvalRequired = useAgentStore((s) => s.approvalRequired);
  const task = useAgentStore((s) => s.task);
  const live = useAgentStore((s) => s.live);
  const setApprovalRequired = useAgentStore((s) => s.setApprovalRequired);
  const setStatus = useAgentStore((s) => s.setStatus);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const sessionId = task?.id;

  const approve = async () => {
    setError(null);
    setLoading("approve");
    try {
      if (live && sessionId) {
        await approveSession(sessionId);
        setApprovalRequired(false);
        setStatus("running");
      } else {
        demoSimulator.approve();
      }
    } catch {
      setError("Could not approve — the backend is not reachable. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const reject = async () => {
    setError(null);
    setLoading("reject");
    try {
      if (live && sessionId) {
        await rejectSession(sessionId);
        setApprovalRequired(false);
        setStatus("failed");
      } else {
        demoSimulator.stopAgent();
      }
    } catch {
      setError("Could not reject the action — the backend may be unreachable.");
    } finally {
      setLoading(null);
    }
  };

  // Trap focus
  useEffect(() => {
    if (!approvalRequired) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [approvalRequired]);

  // The condition lives inside AnimatePresence so the exit animation can actually play.
  return (
    <AnimatePresence>
      {approvalRequired && (
        <motion.div
          key="approval"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="approval-title"
          aria-describedby="approval-desc"
        >
          <motion.div
            initial={{ scale: 0.94, y: 22, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 8, opacity: 0, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-lift"
          >
            {/* Amber marker strip: this is the one moment the run stops for you. */}
            <span aria-hidden="true" className="block h-1 w-full bg-gradient-to-r from-amber-400 via-marker to-amber-400" />

            {/* Header */}
            <div className="flex items-start gap-4 border-b border-border bg-zinc-50/70 px-6 py-5">
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-foreground shadow-[0_10px_20px_-12px_rgba(11,18,32,0.8)]">
                <UserCheck className="h-5 w-5 text-marker" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-[9.5px]">Your approval is needed</p>
                <h2 id="approval-title" className="font-display mt-0.5 text-[19px] font-bold text-foreground">
                  Confirm this action
                </h2>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-warning-soft px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-dot-pulse" aria-hidden="true" />
                Paused
              </span>
            </div>

            <div className="px-6 py-5">
              {/* Action summary */}
              <p id="approval-desc" className="eyebrow text-[9.5px]">
                Pending action
              </p>
              <p className="font-display mt-1.5 text-[19px] font-semibold leading-snug text-foreground">
                Cancel <span className="font-normal text-zinc-500">{task?.service ?? "Subscription"}</span>
                <span className="mt-0.5 block font-mono text-[11px] font-normal uppercase tracking-[0.1em] text-zinc-400">
                  {task?.plan ?? "Plan"}
                </span>
              </p>

              {/* What will happen */}
              <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-zinc-50/70 p-4">
                <p className="eyebrow text-[9.5px]">What will happen</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2.5 text-[12.5px] leading-5 text-zinc-600">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
                    The cancellation request will be submitted to {task?.service ?? "the service"}.
                  </li>
                  <li className="flex items-start gap-2.5 text-[12.5px] leading-5 text-zinc-600">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" aria-hidden="true" />
                    Access may end according to the service&apos;s cancellation policy.
                  </li>
                  <li className="flex items-start gap-2.5 text-[12.5px] font-medium leading-5 text-amber-800">
                    <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                    This action may not be reversible.
                  </li>
                </ul>
              </div>

              {/* Reassurance note */}
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-100 bg-brand-soft px-3 py-2.5">
                <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-[11px] leading-5 text-blue-700">
                  The agent is paused and will not submit anything until you explicitly approve.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-danger-soft px-3 py-2.5">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" aria-hidden="true" />
                  <p className="text-[12px] leading-5 text-red-700">{error}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex flex-col gap-2.5">
                <Button
                  onClick={() => void approve()}
                  disabled={loading !== null}
                  className="h-11 w-full"
                  autoFocus
                >
                  {loading === "approve" ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                      Approving…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                      Approve — cancel subscription
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void reject()}
                  disabled={loading !== null}
                  className="h-11 w-full"
                >
                  {loading === "reject" ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600"
                        aria-hidden="true"
                      />
                      Rejecting…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Ban className="h-4 w-4" aria-hidden="true" />
                      Reject — decline this action
                    </span>
                  )}
                </Button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-5 text-zinc-400">
                You are the final decision-maker. The agent cannot proceed without your approval.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
