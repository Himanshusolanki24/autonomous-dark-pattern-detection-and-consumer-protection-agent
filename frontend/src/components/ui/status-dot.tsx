import * as React from "react";
import { cn } from "@/lib/utils";

interface StatusDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  pulse?: boolean;
}

function StatusDot({ className, pulse = false, ...props }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        pulse && "animate-dot-pulse",
        className
      )}
      {...props}
    />
  );
}

export { StatusDot };