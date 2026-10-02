import { Scale, FileSearch } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";

export function RegulatorySection() {
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="Why now"
            title={
              <>
                This isn&apos;t just bad UX.{" "}
                <span className="text-brand">It&apos;s becoming a compliance problem.</span>
              </>
            }
            sub={
              <>
                Dark patterns are now formally recognised under India&apos;s
                consumer-protection framework — making automated detection
                increasingly relevant.
              </>
            }
          />

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                  <Scale className="h-5 w-5 text-zinc-600" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">India · 2023</p>
                  <p className="text-xs text-muted-foreground">Dark Pattern Guidelines</p>
                </div>
              </div>

              <div className="mt-6 flex items-end gap-2">
                <p className="text-5xl font-semibold tracking-tight text-foreground">13</p>
                <p className="pb-1.5 text-sm text-muted-foreground">
                  recognised deceptive design practices
                </p>
              </div>

              <div className="mt-6 grid gap-2">
                {[
                  "Confirmshaming",
                  "Roach Motel",
                  "Forced Action",
                  "Subscription Trap",
                  "Interface Interference",
                  "Nagging",
                  "Basket Sneaking",
                  "Urgency",
                  "Drip Pricing",
                  "Disguised Ads",
                  "Hidden Costs",
                  "Social Proof",
                  "Misdirection",
                ].map((practice) => (
                  <div
                    key={practice}
                    className="flex items-center justify-between rounded-lg border border-border bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700"
                  >
                    <span>{practice}</span>
                    <FileSearch className="h-3.5 w-3.5 text-zinc-400" />
                  </div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-zinc-500">
                Reference list shown for context. Detection taxonomy in the
                product maps to these recognised categories.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}