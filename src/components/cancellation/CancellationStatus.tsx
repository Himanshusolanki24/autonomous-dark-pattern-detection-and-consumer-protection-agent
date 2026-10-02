import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<
  TaskStatus,
  { variant: "default" | "brand" | "warning" | "danger" | "success" | "muted"; dot: string }
> = {
  waiting: { variant: "muted", dot: "bg-zinc-400" },
  running: { variant: "brand", dot: "bg-blue-500 animate-dot-pulse" },
  approval: { variant: "warning", dot: "bg-amber-500 animate-dot-pulse" },
  completed: { variant: "success", dot: "bg-emerald-500" },
  failed: { variant: "danger", dot: "bg-red-500" },
  blocked: { variant: "danger", dot: "bg-red-500" },
};

export function CancellationStatus({ status }: { status: TaskStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <Badge variant={tone.variant}>
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {STATUS_LABELS[status]}
    </Badge>
  );
}