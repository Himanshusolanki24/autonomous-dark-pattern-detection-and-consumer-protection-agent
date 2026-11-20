import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden rounded-lg bg-zinc-100", className)}
      {...props}
    >
      <span className="shimmer absolute inset-0" />
    </div>
  );
}

export { Skeleton };
