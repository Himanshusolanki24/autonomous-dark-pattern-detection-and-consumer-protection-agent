import { ScanSearch, MessageSquareText, Navigation, BadgeCheck } from "lucide-react";
import { TRAP_TAGS } from "./constants";

const STEPS = [
  { icon: ScanSearch, label: "Detect" },
  { icon: MessageSquareText, label: "Explain" },
  { icon: Navigation, label: "Navigate" },
  { icon: BadgeCheck, label: "Verify" },
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
          Built around India&apos;s Dark Pattern Guidelines · Human-in-the-loop ·
          Privacy-first architecture
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {STEPS.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <Icon className="h-4 w-4 text-brand" />
              {label}
              {i < STEPS.length - 1 && (
                <span className="ml-6 hidden text-zinc-300 sm:inline">→</span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {TRAP_TAGS.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-zinc-50 px-3 py-1 text-[11px] font-medium text-zinc-500"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}