import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  index = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "brand" | "warning" | "success" | "danger";
  index?: number;
}) {
  const tones = {
    default: "text-zinc-500 bg-zinc-100",
    brand: "text-blue-600 bg-blue-50",
    warning: "text-amber-600 bg-amber-50",
    success: "text-emerald-600 bg-emerald-50",
    danger: "text-red-600 bg-red-50",
  } as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          tones[tone]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xl font-semibold leading-tight tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">
          {label}
          {hint && <span className="ml-1 text-zinc-400">· {hint}</span>}
        </p>
      </div>
    </motion.div>
  );
}