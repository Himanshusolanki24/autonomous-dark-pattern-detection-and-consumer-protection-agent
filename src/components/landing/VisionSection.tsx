import Link from "next/link";
import { ArrowRight, User, Building2, Check } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";

const CONSUMER = [
  "Detect dark patterns",
  "Navigate cancellation flows",
  "Monitor subscription traps",
  "Keep control of your accounts",
];

const BUSINESS = [
  "Scan interfaces",
  "Detect compliance risks",
  "Monitor UI changes",
  "Generate audit evidence",
];

function Panel({
  icon: Icon,
  title,
  blurb,
  items,
  ctaLabel,
  href,
  tone,
  badge,
}: {
  icon: React.ElementType;
  title: string;
  blurb: string;
  items: string[];
  ctaLabel: string;
  href: string;
  tone: "consumer" | "business";
  badge?: string;
}) {
  const dark = tone === "business";
  return (
    <div
      className={
        "flex h-full flex-col rounded-3xl border p-8 transition-shadow hover:shadow-xl " +
        (dark
          ? "border-zinc-700 bg-zinc-900 text-white"
          : "border-border bg-surface text-foreground")
      }
    >
      {badge && (
        <span
          className={
            "mb-4 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest " +
            (dark ? "bg-white/10 text-zinc-300" : "bg-brand-soft text-brand")
          }
        >
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={
            "flex h-10 w-10 items-center justify-center rounded-lg " +
            (dark ? "bg-white/10" : "bg-zinc-100")
          }
        >
          <Icon className={"h-5 w-5 " + (dark ? "text-zinc-200" : "text-zinc-600")} />
        </span>
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      </div>
      <p className={"mt-3 text-sm leading-6 " + (dark ? "text-zinc-400" : "text-muted-foreground")}>
        {blurb}
      </p>
      <ul className="mt-6 flex-1 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm">
            <Check
              className={
                "h-4 w-4 shrink-0 " + (dark ? "text-emerald-400" : "text-emerald-600")
              }
            />
            <span className={dark ? "text-zinc-200" : "text-zinc-700"}>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={
          "group mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-[0.98] " +
          (dark
            ? "bg-white text-zinc-900 hover:bg-zinc-200"
            : "bg-foreground text-white hover:bg-zinc-800")
        }
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function VisionSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeading
        eyebrow="The vision"
        title={
          <>
            One agent. <span className="text-brand">Two sides of the problem.</span>
          </>
        }
        sub="The same detection engine that protects a consumer can help a business find traps before regulators do."
      />

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Panel
            icon={User}
            title="For consumers"
            blurb="Fight the traps. An agent that works for you, not for the page."
            items={CONSUMER}
            ctaLabel="Protect Me"
            href="/demo"
            tone="consumer"
            badge="Consumer"
          />
        </Reveal>
        <Reveal delay={0.12}>
          <Panel
            icon={Building2}
            title="For businesses"
            blurb="Find the traps before regulators do. Scan your own interface for risk."
            items={BUSINESS}
            ctaLabel="Explore Compliance"
            href="/scanner"
            tone="business"
            badge="B2B · Roadmap"
          />
        </Reveal>
      </div>
    </section>
  );
}