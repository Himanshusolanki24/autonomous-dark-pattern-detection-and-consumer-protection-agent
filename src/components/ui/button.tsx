"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[color,background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.975] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_8px_20px_-10px_rgba(79,70,229,0.7)] hover:from-blue-500 hover:to-blue-700 hover:shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_12px_26px_-10px_rgba(79,70,229,0.8)]",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline:
          "border border-border-strong bg-surface text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-zinc-400 hover:bg-zinc-50",
        ghost: "text-foreground hover:bg-zinc-100",
        secondary: "bg-zinc-100 text-foreground hover:bg-zinc-200",
        success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
        soft: "bg-brand-soft text-blue-700 hover:bg-blue-100",
        marker: "bg-marker text-foreground shadow-[0_1px_0_rgba(255,255,255,0.4)_inset] hover:bg-[#ffcf2e]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-[15px]",
        icon: "h-10 w-10",
        iconSm: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
