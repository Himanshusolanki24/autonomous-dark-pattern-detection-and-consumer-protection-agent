import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  FileCheck2,
  Hand,
  Minus,
  ScanSearch,
  Shield,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { HeroCase } from "@/components/landing/HeroCase";
import { SystemMap } from "@/components/landing/SystemMap";
import { PricingSection } from "@/components/landing/PricingSection";
import { Marker } from "@/components/ui/case";
import { DrawLine, Marquee, Reveal, Stagger, StaggerItem } from "@/components/ui/motion";

const REPO = "https://github.com/Himanshusolanki24/autonomous-dark-pattern-detection-and-consumer-protection-agent";

const EVIDENCE = [
  { figure: "75.7%", text: "of 642 subscription sites and apps used at least one dark pattern", source: "ICPEN global sweep, 2024" },
  { figure: "13", text: "dark patterns are now banned in India under the CCPA guidelines", source: "CCPA, Nov 2023" },
  { figure: "$2.5B", text: "paid by Amazon to settle FTC claims over hard-to-cancel Prime", source: "US FTC, 2025" },
];

const PATTERNS = [
  "Confirmshaming",
  "Roach motel",
  "Forced continuity",
  "False urgency",
  "Hidden costs",
  "Bait and switch",
  "Drip pricing",
  "Nagging",
  "Obstruction",
  "Sneaking",
  "Social proof",
  "Scarcity",
  "Disguised ads",
];

const STEPS: { title: string; body: string; note: string; icon: LucideIcon }[] = [
  {
    title: "Scan the page",
    body: "Paste a subscription or checkout page. TrapKiller reads every button and line of text and marks each trick it recognises. Nothing is clicked.",
    note: "Read-only",
    icon: ScanSearch,
  },
  {
    title: "Send the agent in",
    body: "The agent walks the cancel flow screen by screen, steps around retention offers, and logs every move it makes.",
    note: "Four safe actions",
    icon: Bot,
  },
  {
    title: "Approve the last click",
    body: "Before anything irreversible, it stops and asks you. After you approve, it checks the result and saves a screenshot as proof.",
    note: "You stay in control",
    icon: UserCheck,
  },
];

const CATCHES = [
  { name: "Confirmshaming", quote: "“No thanks, I don’t want to save money”", plain: "Guilt written into the opt-out button." },
  { name: "Roach motel", quote: "One click to join, five screens to leave", plain: "The cancel link is hidden or buried." },
  { name: "Forced continuity", quote: "“Free trial” that renews at ₹649", plain: "A trial that quietly becomes a paid plan." },
  { name: "False urgency", quote: "“Offer ends in 09:59”", plain: "Countdowns and scarcity built to rush you." },
];

const PROMISES: { title: string; body: string; icon: LucideIcon }[] = [
  {
    title: "It never makes the final click alone",
    body: "The irreversible step is parked until you press approve. Reject, and the agent stops.",
    icon: Hand,
  },
  {
    title: "Page text is evidence, not instructions",
    body: "Words on a website can’t steer the agent. It only uses four safe actions: click, type, scroll, wait.",
    icon: FileCheck2,
  },
  {
    title: "You can stop it at any moment",
    body: "Every step is checked against your stop button before it runs, and every step is logged.",
    icon: Shield,
  },
];

// How TrapKiller differs from the usual ways people deal with subscriptions.
// "Other" columns describe typical tools in general, not any one product.
type Mark = "yes" | "no" | "partly";
const COMPARE_COLUMNS = ["Doing it yourself", "Subscription tracker apps", "Asking an AI chatbot"];
const COMPARE: { feature: string; others: [Mark, string][]; ours: string }[] = [
  {
    feature: "Spots dark patterns on the page",
    others: [["no", "You have to notice them"], ["no", "Tracks bills, not pages"], ["partly", "Only if you paste the page in"]],
    ours: "Checks every page against 13 known tricks",
  },
  {
    feature: "Proves each finding with the exact words",
    others: [["no", "No record"], ["no", "No"], ["no", "Can make things up"]],
    ours: "No quote from the page, no finding",
  },
  {
    feature: "Walks the cancel steps for you",
    others: [["no", "Every click is yours"], ["partly", "Some do, often by request"], ["no", "It can only advise"]],
    ours: "An agent works through the flow in a real browser",
  },
  {
    feature: "Asks before the irreversible click",
    others: [["partly", "You decide, with no warning"], ["partly", "Varies"], ["no", "Does not act"]],
    ours: "Always stops for your approval",
  },
  {
    feature: "Remembers sites and learns from you",
    others: [["no", "No"], ["no", "No"], ["no", "Forgets after the chat"]],
    ours: "A knowledge graph of sites, tricks and routes",
  },
  {
    feature: "Scores how hard a site is to leave",
    others: [["no", "No"], ["no", "No"], ["no", "No"]],
    ours: "A trap score from 0 to 100",
  },
  {
    feature: "Keeps proof of what happened",
    others: [["partly", "If you take screenshots"], ["partly", "Varies"], ["no", "No"]],
    ours: "Step-by-step log and a proof screenshot",
  },
];

function MarkIcon({ mark }: { mark: Mark }) {
  const Icon = mark === "yes" ? Check : mark === "no" ? X : Minus;
  return (
    <span
      className={
        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full " +
        (mark === "yes"
          ? "bg-brand text-white"
          : mark === "no"
            ? "bg-zinc-100 text-zinc-400"
            : "bg-warning-soft text-amber-700")
      }
    >
      <Icon className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
      <span className="sr-only">{mark === "yes" ? "Yes:" : mark === "no" ? "No:" : "Partly:"}</span>
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="glass sticky top-0 z-40 border-b border-border/70">
        <div className="mx-auto flex h-[62px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5" aria-label="TrapKiller home">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_8px_16px_-8px_rgba(79,70,229,0.9)]">
              <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-white bg-marker" />
            </span>
            <span className="font-display text-[17px] font-bold tracking-tight">TrapKiller</span>
          </Link>

          <nav className="hidden items-center gap-7 text-[13.5px] text-zinc-600 md:flex" aria-label="Sections">
            <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#system" className="transition-colors hover:text-foreground">The system</a>
            <a href="#catches" className="transition-colors hover:text-foreground">What it catches</a>
            <a href="#compare" className="transition-colors hover:text-foreground">Why TrapKiller</a>
            <a href="#safety" className="transition-colors hover:text-foreground">Safety</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          </nav>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 text-[13px] font-semibold text-white shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)] transition-transform active:scale-[0.97]"
          >
            Open the app
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="lab-grid-faint pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
          />
          <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:pb-28 lg:pt-20">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 py-1 pl-1.5 pr-3 text-[11.5px] font-medium text-zinc-600 shadow-card">
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-blue-700">
                    AI agent
                  </span>
                  Consumer protection, on the record
                </span>
              </Reveal>

              <Reveal delay={0.06}>
                <h1 className="font-display mt-6 text-[46px] font-bold leading-[1.01] tracking-[-0.035em] sm:text-[64px]">
                  Leaving should be <Marker delay={0.5}>as easy as joining</Marker>.
                </h1>
              </Reveal>

              <Reveal delay={0.12}>
                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-zinc-600">
                  TrapKiller is an AI agent that spots dark patterns on subscription pages, walks you out past every
                  retention trick, and asks you before the final click.
                </p>
              </Reveal>

              <Reveal delay={0.18}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 px-6 text-[15px] font-semibold text-white shadow-[0_2px_0_rgba(255,255,255,0.16)_inset,0_14px_30px_-12px_rgba(79,70,229,0.8)] transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Try it on a test site
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <a
                    href="#how"
                    className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-5 text-[15px] font-medium text-foreground shadow-card transition-colors hover:border-border-strong hover:bg-zinc-50"
                  >
                    How it works
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.24}>
                <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-border pt-5">
                  {[
                    ["13", "dark patterns in the detector"],
                    ["94%", "held-out detection accuracy"],
                    ["100%", "of final clicks need you"],
                  ].map(([value, label]) => (
                    <div key={label}>
                      <dt className="font-display text-[22px] font-bold leading-none tabular-nums">{value}</dt>
                      <dd className="mt-1 text-[11.5px] leading-snug text-zinc-500">{label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal delay={0.15} y={26}>
              <HeroCase />
            </Reveal>
          </div>
        </section>

        {/* Pattern ticker */}
        <section className="border-y border-border bg-surface/60" aria-label="Dark patterns the detector knows">
          <div className="mx-auto flex max-w-[1180px] items-center gap-4 px-5 py-4 sm:px-8">
            <span className="shrink-0 font-mono text-[9.5px] uppercase tracking-[0.16em] text-zinc-400">
              Watchlist
            </span>
            <Marquee className="min-w-0 flex-1 [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]" duration={48}>
              {PATTERNS.map((p) => (
                <span
                  key={p}
                  className="whitespace-nowrap rounded-full border border-border bg-surface px-3 py-1 text-[11.5px] font-medium text-zinc-600"
                >
                  {p}
                </span>
              ))}
            </Marquee>
          </div>
        </section>

        {/* Why now: the evidence */}
        <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-24" aria-labelledby="why-now">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal>
              <div className="max-w-2xl">
                <p className="eyebrow">The record</p>
                <h2 id="why-now" className="font-display mt-3 text-[32px] font-bold leading-tight sm:text-[40px]">
                  Regulators already call these tricks illegal. Most sites still use them.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-xs text-[13px] leading-relaxed text-zinc-500">
                Three data points that explain why leaving is harder than joining.
              </p>
            </Reveal>
          </div>

          <Stagger className="mt-10 grid gap-4 sm:grid-cols-3">
            {EVIDENCE.map((e) => (
              <StaggerItem key={e.figure}>
                <div className="panel panel-hover relative h-full overflow-hidden p-6">
                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-5 h-8 w-8 rounded-full border border-dashed border-border-strong/70"
                  />
                  <p className="font-display text-[46px] font-bold leading-none tracking-tight text-foreground sm:text-[54px]">
                    {e.figure}
                  </p>
                  <p className="mt-4 text-[14px] leading-relaxed text-zinc-600">{e.text}</p>
                  <p className="mt-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-400">
                    {e.source}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-t border-border bg-surface">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                  <p className="eyebrow">The run</p>
                  <h2 className="font-display mt-3 text-[32px] font-bold sm:text-[40px]">How it works</h2>
                </div>
                <p className="max-w-sm text-[13.5px] leading-relaxed text-zinc-500">
                  Three steps, in order. The agent does the walking; you keep the final say.
                </p>
              </div>
            </Reveal>

            <DrawLine className="mt-8" />

            <Stagger className="mt-10 grid gap-8 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <StaggerItem key={s.title}>
                  <div className="group relative">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] tabular-nums text-zinc-400">
                        0{i + 1}
                      </span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-brand-soft text-brand">
                        <s.icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="h-px flex-1 bg-border" />
                    </div>
                    <h3 className="font-display mt-5 text-[20px] font-semibold">{s.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-zinc-600">{s.body}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-zinc-50 px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-500">
                      <span className="h-1 w-1 rounded-full bg-brand" aria-hidden="true" />
                      {s.note}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        <SystemMap />

        {/* What it catches */}
        <section id="catches" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-24">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-xl">
                  <p className="eyebrow">In the detector</p>
                  <h2 className="font-display mt-3 text-[32px] font-bold leading-tight sm:text-[40px]">What it catches</h2>
                </div>
                <p className="max-w-sm text-[13.5px] leading-relaxed text-zinc-500">
                  Every finding keeps the exact sentence that proves it. Here are four of the 13 patterns.
                </p>
              </div>
            </Reveal>

            <Stagger className="mt-10 grid gap-4 sm:grid-cols-2">
              {CATCHES.map((c) => (
                <StaggerItem key={c.name}>
                  <div className="panel panel-hover relative h-full overflow-hidden p-6">
                    <span
                      aria-hidden="true"
                      className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-marker/15 blur-xl"
                    />
                    <p className="font-display text-[22px] font-semibold">
                      <Marker delay={0.15}>{c.name}</Marker>
                    </p>
                    <p className="mt-4 border-l-2 border-marker pl-3 text-[15px] leading-snug text-foreground">
                      {c.quote}
                    </p>
                    <p className="mt-2 pl-4 text-[13.5px] text-zinc-500">{c.plain}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Comparison */}
        <section id="compare" className="mx-auto max-w-[1180px] scroll-mt-20 px-5 py-20 sm:px-8 lg:py-24">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow">The difference</p>
              <h2 className="font-display mt-3 text-[32px] font-bold leading-tight sm:text-[40px]">
                What you get here that you <Marker delay={0.2}>don&rsquo;t get elsewhere</Marker>
              </h2>
              <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-zinc-600">
                Most tools either track what you pay or give advice. TrapKiller finds the trick, shows the proof, and
                does the work with you in control.
              </p>
            </div>
          </Reveal>

          {/* Phones get one card per row, so the TrapKiller answer is never scrolled out of view. */}
          <ul className="mt-8 space-y-3 md:hidden">
            {COMPARE.map((row) => (
              <li key={row.feature} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
                <h3 className="px-4 pt-4 text-[16px] font-semibold leading-snug">{row.feature}</h3>
                <p className="mx-4 mt-3 flex gap-2 rounded-xl bg-brand-soft px-3 py-2.5 text-[14px] font-medium leading-5">
                  <MarkIcon mark="yes" />
                  <span>
                    <span className="block font-mono text-[9.5px] uppercase tracking-[0.12em] text-zinc-500">TrapKiller</span>
                    {row.ours}
                  </span>
                </p>
                <dl className="space-y-2 px-4 pb-4 pt-3">
                  {row.others.map(([mark, note], i) => (
                    <div key={i} className="flex gap-2 text-[13.5px] leading-5 text-zinc-600">
                      <MarkIcon mark={mark} />
                      <span>
                        <dt className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-zinc-500">
                          {COMPARE_COLUMNS[i]}
                        </dt>
                        <dd>{note}</dd>
                      </span>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>

          <div className="mt-10 hidden overflow-hidden rounded-2xl border border-border bg-surface shadow-card md:block">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead>
                <tr className="border-b border-border bg-zinc-50/70">
                  <th scope="col" className="w-[23%] px-5 py-4 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                    What matters
                  </th>
                  {COMPARE_COLUMNS.map((c) => (
                    <th key={c} scope="col" className="w-[18%] px-4 py-4 text-[12.5px] font-semibold text-zinc-600">
                      {c}
                    </th>
                  ))}
                  <th scope="col" className="w-[23%] border-x border-blue-100 bg-brand-soft px-5 py-4">
                    <span className="font-display text-[15px] font-bold text-blue-700">TrapKiller</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.feature} className="border-b border-border last:border-b-0">
                    <th scope="row" className="px-5 py-4 align-top text-[14.5px] font-semibold text-foreground">
                      {row.feature}
                    </th>
                    {row.others.map(([mark, note], i) => (
                      <td key={i} className="px-4 py-4 align-top">
                        <span className="flex gap-2 leading-5 text-zinc-600">
                          <MarkIcon mark={mark} />
                          {note}
                        </span>
                      </td>
                    ))}
                    <td className="border-x border-blue-100/70 bg-brand-soft/60 px-5 py-4 align-top">
                      <span className="flex gap-2 font-medium leading-5 text-foreground">
                        <MarkIcon mark="yes" />
                        {row.ours}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-[12px] leading-5 text-zinc-500">
            The other columns describe typical tools in general, not any one product. Today TrapKiller&rsquo;s full
            cancellation runs on its built-in demo site; on real sites it scans public pages.
          </p>
        </section>

        {/* Safety */}
        <section id="safety" className="scroll-mt-20 border-y border-border bg-surface">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-24">
            <Reveal>
              <div className="max-w-xl">
                <p className="eyebrow">Guardrails</p>
                <h2 className="font-display mt-3 text-[32px] font-bold leading-tight sm:text-[40px]">You stay in charge</h2>
              </div>
            </Reveal>

            <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
              {PROMISES.map((p) => (
                <StaggerItem key={p.title}>
                  <div className="panel h-full p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-marker">
                      <p.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <h3 className="font-display mt-5 text-[17px] font-semibold leading-snug">{p.title}</h3>
                    <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-600">{p.body}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* Pricing */}
        <PricingSection />

        {/* Call to action */}
        <section className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-12 text-white sm:px-12 sm:py-14">
              <div aria-hidden="true" className="lab-grid-dark absolute inset-0 opacity-60" />
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-marker/15 blur-3xl"
              />
              <div className="relative flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">Open a case</p>
                  <h2 className="font-display mt-3 max-w-lg text-[30px] font-bold leading-tight sm:text-[38px]">
                    See it work on a page built to trap you.
                  </h2>
                  <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/60">
                    The demo site is safe to cancel. Nothing touches a real subscription.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2.5">
                  <Link
                    href="/dashboard"
                    className="inline-flex h-12 items-center gap-2 rounded-xl bg-marker px-6 text-[15px] font-semibold text-foreground transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Open TrapKiller
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/demo"
                    className="inline-flex h-12 items-center rounded-xl border border-white/20 px-5 text-[14px] font-medium text-white/90 transition-colors hover:border-white/40 hover:text-white"
                  >
                    Watch a demo run
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-border bg-surface/60">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-[12.5px] text-zinc-500 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-foreground text-marker">
              <Shield className="h-3 w-3" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <p>TrapKiller. Detections are automated estimates, not legal advice.</p>
          </div>
          <a href={REPO} className="font-medium transition-colors hover:text-foreground">
            Source on GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
