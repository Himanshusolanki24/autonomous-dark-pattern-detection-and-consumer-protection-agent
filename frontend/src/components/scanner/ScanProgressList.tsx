"use client";

import { motion } from "framer-motion";
import type { ScanProgress } from "@/lib/services/scannerService";
import { cn } from "@/lib/utils";

export function ScanProgressList({ steps }: { steps: ScanProgress[] }) {
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => {
        const done = step.status === "done";
        const running = step.status === "running";
        return (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
                done && "bg-emerald-100 text-emerald-600",
                running && "bg-brand-soft text-brand animate-dot-pulse",
                step.status === "pending" &&
                  "border border-border-strong text-zinc-300"
              )}
            >
              {done ? "✓" : running ? "●" : "○"}
            </span>
            <span
              className={cn(
                "text-sm",
                done && "text-zinc-600",
                running && "font-medium text-brand",
                step.status === "pending" && "text-zinc-400"
              )}
            >
              {step.label}
            </span>
            {running && (
              <motion.span
                className="ml-auto text-xs text-zinc-400"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                in progress
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}