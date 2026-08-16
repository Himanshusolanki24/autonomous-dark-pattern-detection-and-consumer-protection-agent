import { ROADMAP } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";

export function Roadmap() {
  return (
    <section className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <SectionHeading
          eyebrow="Roadmap"
          title={
            <>
              Starting with cancellation.{" "}
              <span className="text-brand">Building toward control.</span>
            </>
          }
          sub="A focused first release, then an agent for consumer control."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {ROADMAP.map((phase, i) => (
            <Reveal key={phase.phase} delay={i * 0.08}>
              <div className="relative h-full rounded-2xl border border-border bg-surface p-6 shadow-sm">
                <span className="absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-brand" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  {phase.phase}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {phase.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-zinc-700"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}