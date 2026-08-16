"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, TriangleAlert, XCircle, Info } from "lucide-react";
import { useAgentStore } from "@/stores/agent-store";
import { demoSimulator } from "@/lib/services/simulator";
import { approveSession, stopSession } from "@/lib/services/agentService";
import { Button } from "@/components/ui/button";

export function ApprovalModal() {
  const approvalRequired = useAgentStore((s) => s.approvalRequired);
  const task = useAgentStore((s) => s.task);
  const setApprovalRequired = useAgentStore((s) => s.setApprovalRequired);
  const setStatus = useAgentStore((s) => s.setStatus);
  const [error, setError] = useState<string | null>(null);

  const sessionId = task?.id;

  const approve = async () => {
    setError(null);
    try {
      if (sessionId) {
        await approveSession(sessionId);
      }
      setApprovalRequired(false);
      setStatus("running");
    } catch {
      setError("Could not reach the backend. Is it running on port 3001?");
    }
  };

  const stop = async () => {
    setError(null);
    try {
      if (sessionId) {
        await stopSession(sessionId);
      }
      setApprovalRequired(false);
      demoSimulator.reset();
    } catch {
      setError("Could not reach the backend. Is it running on port 3001?");
    }
  };

  useEffect(() => {
    if (!approvalRequired) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [approvalRequired]);

  if (!approvalRequired) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-title"
      >
        <motion.div
          initial={{ scale: 0.96, y: 12, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.96, y: 12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-red-200 bg-surface shadow-2xl"
        >
          <div className="border-b border-red-100 bg-red-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <ShieldAlert className="h-4 w-4 text-red-600" />
              </span>
              <div>
                <h2 id="approval-title" className="text-base font-semibold text-red-900">
                  Your approval is required
                </h2>
                <p className="text-xs text-red-700/80">
                  The agent has navigated the cancellation flow.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Final action
            </p>
            <p className="mt-1 text-lg font-semibold text-foreground">
              Cancel {task?.service ?? "Premium"}{" "}
              <span className="font-normal text-zinc-500">
                {task?.plan ?? "Subscription"}
              </span>
            </p>

            <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-zinc-50 p-4">
              <p className="text-xs font-semibold text-zinc-500">What will happen</p>
              <ul className="space-y-2 text-sm text-zinc-700">
                <li className="flex items-start gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  Premium access will end according to the provider&apos;s policy.
                </li>
                <li className="flex items-start gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  The cancellation request will be submitted.
                </li>
                <li className="flex items-start gap-2 text-red-700">
                  <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  This action may not be reversible.
                </li>
              </ul>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <Button
                variant="destructive"
                size="lg"
                onClick={() => void approve()}
                autoFocus
              >
                Cancel Subscription
              </Button>
              <Button variant="outline" size="lg" onClick={() => void stop()}>
                <XCircle className="h-4 w-4" />
                Stop Agent
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              The agent is paused and will not submit anything until you approve.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}