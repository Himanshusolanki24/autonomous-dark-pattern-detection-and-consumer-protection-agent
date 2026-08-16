import { PRIVACY_ITEMS } from "./constants";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

export function PrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeading
        eyebrow="Privacy"
        title={
          <>
            Your credentials stay <span className="text-brand">yours.</span>
          </>
        }
        sub={
          <>
            The agent works inside the session you already opened. It never asks
            for the keys to your accounts.
          </>
        }
      />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRIVACY_ITEMS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.07}>
            <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md">
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  item.tone
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}