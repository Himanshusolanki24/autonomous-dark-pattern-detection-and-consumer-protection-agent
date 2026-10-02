import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { HeroCase } from "@/components/landing/HeroCase";
import { Marker } from "@/components/ui/case";

const REPO = "https://github.com/Himanshusolanki24/autonomous-dark-pattern-detection-and-consumer-protection-agent";

const EVIDENCE = [
  { figure: "75.7%", text: "of 642 subscription sites and apps used at least one dark pattern", source: "ICPEN global sweep, 2024" },
  { figure: "13", text: "dark patterns are now banned in India under the CCPA guidelines", source: "CCPA, Nov 2023" },
  { figure: "$2.5B", text: "paid by Amazon to settle FTC claims over hard-to-cancel Prime", source: "US FTC, 2025" },
];

const STEPS = [
  { title: "Scan the page", body: "Paste a subscription or checkout page. TrapKiller reads every button and line of text and marks each trick it recognises. Nothing is clicked." },
  { title: "Send the agent in", body: "The agent walks the cancel flow screen by screen, steps around retention offers, and logs every move it makes." },
  { title: "Approve the last click", body: "Before anything irreversible, it stops and asks you. After you approve, it checks the result and saves a screenshot as proof." },
];

const CATCHES = [
  { name: "Confirmshaming", quote: "“No thanks, I don’t want to save money”", plain: "Guilt written into the opt-out button." },
  { name: "Roach motel", quote: "One click to join, five screens to leave", plain: "The cancel link is hidden or buried." },
  { name: "Forced continuity", quote: "“Free trial” that renews at ₹649", plain: "A trial that quietly becomes a paid plan." },
  { name: "False urgency", quote: "“Offer ends in 09:59”", plain: "Countdowns and scarcity built to rush you." },
];

const PROMISES = [
  { title: "It never makes the final click alone", body: "The irreversible step is parked until you press approve. Reject, and the agent stops." },
  { title: "Page text is evidence, not instructions", body: "Words on a website can’t steer the agent. It only uses four safe actions: click, type, scroll, wait." },
  { title: "You can stop it at any moment", body: "Every step is checked against your stop button before it runs, and every step is logged." },
];

export default function LandingPage() {
  return (
    <div className="bg-background">
      <header className="mx-auto flex max-w-[1180px] items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-marker">
            <Shield className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="font-display text-[18px] font-bold">TrapKiller</span>
        </Link>
        <nav className="hidden items-center gap-7 text-[14px] text-zinc-600 md:flex" aria-label="Sections">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#catches" className="hover:text-foreground">What it catches</a>
          <a href="#safety" className="hover:text-foreground">Safety</a>
        </nav>
        <Link
          href="/dashboard"
          className="rounded-lg bg-foreground px-4 py-2 text-[14px] font-medium text-white transition-transform active:scale-[0.97]"
        >
          Open the app
        </Link>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto grid max-w-[1180px] items-center gap-14 px-5 pb-24 pt-10 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <div>
            <h1 className="text-[46px] font-bold leading-[1.02] sm:text-[64px]">
              Leaving should be as easy as joining.
            </h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-zinc-600">
              TrapKiller is an AI agent that spots dark patterns on subscription pages, walks you out past every
              retention trick, and asks you before the final click.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-brand px-6 text-[15px] font-medium text-white transition-transform hover:bg-blue-700 active:scale-[0.97]"
              >
                Try it on a test site <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how" className="inline-flex h-12 items-center rounded-xl px-5 text-[15px] font-medium text-foreground hover:bg-zinc-200/60">
                How it works
              </a>
            </div>
          </div>
          <HeroCase />
        </section>

        {/* Why now: the evidence */}
        <section className="bg-foreground text-white" aria-labelledby="why-now">
          <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
            <h2 id="why-now" className="max-w-2xl text-[34px] font-bold leading-tight sm:text-[40px]">
              Regulators already call these tricks illegal. Most sites still use them.
            </h2>
            <dl className="mt-12 grid gap-10 sm:grid-cols-3">
              {EVIDENCE.map((e) => (
                <div key={e.figure} className="border-t border-white/15 pt-5">
                  <dt className="font-display text-[56px] font-bold leading-none text-marker">{e.figure}</dt>
                  <dd className="mt-3 text-[15px] leading-relaxed text-white/80">{e.text}</dd>
                  <dd className="mt-2 text-[12.5px] text-white/45">{e.source}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* How it works: a real sequence, so it is numbered */}
        <section id="how" className="mx-auto max-w-[1180px] scroll-mt-8 px-5 py-24 sm:px-8">
          <h2 className="text-[34px] font-bold sm:text-[40px]">How it works</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-marker text-[18px] font-bold">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[20px] font-bold">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* What it catches */}
        <section id="catches" className="border-y border-border bg-surface">
          <div className="mx-auto max-w-[1180px] scroll-mt-8 px-5 py-24 sm:px-8">
            <h2 className="max-w-xl text-[34px] font-bold leading-tight sm:text-[40px]">What it catches</h2>
            <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {CATCHES.map((c) => (
                <li key={c.name} className="border-t border-border pt-5">
                  <p className="text-[22px] font-bold">
                    <Marker delay={0.2}>{c.name}</Marker>
                  </p>
                  <p className="mt-3 text-[16px] text-foreground">{c.quote}</p>
                  <p className="mt-1 text-[14.5px] text-zinc-500">{c.plain}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="mx-auto max-w-[1180px] scroll-mt-8 px-5 py-24 sm:px-8">
          <h2 className="max-w-xl text-[34px] font-bold leading-tight sm:text-[40px]">You stay in charge</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {PROMISES.map((p) => (
              <div key={p.title}>
                <h3 className="text-[18px] font-bold">{p.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-zinc-600">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="mx-auto max-w-[1180px] px-5 pb-24 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-marker px-8 py-12 sm:flex-row sm:items-center sm:px-12">
            <h2 className="max-w-lg text-[30px] font-bold leading-tight sm:text-[36px]">
              See it work on a page built to trap you.
            </h2>
            <Link
              href="/dashboard"
              className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-foreground px-6 text-[15px] font-medium text-white transition-transform active:scale-[0.97]"
            >
              Open TrapKiller <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-4 px-5 py-8 text-[13.5px] text-zinc-500 sm:px-8">
          <p>TrapKiller. Detections are automated estimates, not legal advice.</p>
          <a href={REPO} className="hover:text-foreground">Source on GitHub</a>
        </div>
      </footer>
    </div>
  );
}
