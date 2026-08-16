import { cn } from "@/lib/utils";

interface ConfidenceBarProps {
  confidence: number;
  tone?: "warning" | "danger" | "brand" | "success";
  className?: string;
}

function ConfidenceBar({ confidence, tone = "warning", className }: ConfidenceBarProps) {
  const barClass =
    tone === "danger"
      ? "bg-red-600"
      : tone === "brand"
        ? "bg-brand"
        : tone === "success"
          ? "bg-emerald-500"
          : "bg-amber-500";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn("h-full rounded-full transition-all duration-700", barClass)}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums text-muted-foreground">
        {confidence}%
      </span>
    </div>
  );
}

export { ConfidenceBar };