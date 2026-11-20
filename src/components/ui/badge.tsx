import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
  {
    variants: {
      variant: {
        default: "border-transparent bg-zinc-100 text-zinc-700",
        brand: "border-blue-100 bg-brand-soft text-blue-700",
        warning: "border-amber-200/60 bg-warning-soft text-amber-700",
        danger: "border-red-200/60 bg-danger-soft text-red-700",
        success: "border-emerald-200/60 bg-success-soft text-emerald-700",
        outline: "border-border-strong bg-surface text-muted-foreground",
        muted: "border-transparent bg-zinc-50 text-zinc-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
