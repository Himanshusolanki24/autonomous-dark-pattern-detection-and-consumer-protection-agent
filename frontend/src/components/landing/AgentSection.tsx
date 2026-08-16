import { MessageSquareText, Bot, ArrowDown } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { PIPELINE_STAGES } from "./constants";

export function AgentSection() {
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          eyebrow="Meet your agent"
          title={
            <>
              Don&apos;t fight the cancellation maze{" "}
              <span className="text-brand">yourself.</span>
            </>
          }
          sub={
            <>
              Give the agent a goal. It figures out the path — and shows its
              work at every step.
            </>
          }
        />

        <div className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-3">
          <Reveal className="w-full">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100">
                <MessageSquareText className="h-5 w-5 text-zinc-600" />
              </span>
              <p className="text-base font-medium text-zinc-800">
                &ldquo;Cancel my subscription.&rdquo;
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <ArrowDown className="h-5 w-5 text-zinc-300" />
          </Reveal>

          <Reveal delay={0.2} className="w-full">
            <div className="rounded-2xl border border-brand/25 bg-gradient-to-br from-brand-soft to-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand">
                  <Bot className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">Your AI agent</p>
                  <p className="text-xs text-zinc-500">on it — navigating, not guessing</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                {PIPELINE_STAGES.map((stage, i) => (
                  <div key={stage.id} className="flex items-center gap-2">
                    {i > 0 && <span className="text-zinc-300">→</span>}
                    <span className="rounded-full border border-brand/30 bg-white px-3 py-1 text-xs font-semibold text-blue-700">
                      {stage.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}