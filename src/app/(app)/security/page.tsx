"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck,
  KeyRound,
  Landmark,
  UserCheck,
  Camera,
  Bot,
  Globe,
  FileCheck,
  Timer,
  Lock,
  User,
  Eye,
  EyeOff,
  Check,
  X,
  ArrowRight,
  Activity,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/case";

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  children,
  index = 0,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  index?: number;
}) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      aria-labelledby={id}
    >
      <div className="mb-4 flex items-start gap-3">
        <span className="mt-1 font-mono text-[10px] tabular-nums text-zinc-300">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div>
          <h2 id={id} className="font-display text-[16px] font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{description}</p>
        </div>
      </div>
      {children}
    </motion.section>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  body,
  tone,
  index = 0,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  tone: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="panel flex gap-3.5 p-4"
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone)} aria-hidden="true">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-[12px] leading-5 text-zinc-500">{body}</p>
      </div>
    </motion.div>
  );
}

// ── Permission row ────────────────────────────────────────────────────────────

function PermissionRow({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <div className="flex items-start gap-2.5 border-b border-border/70 py-2 last:border-b-0">
      <span
        className={cn(
          "mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full",
          allowed ? "bg-success-soft text-emerald-600" : "bg-danger-soft text-red-500"
        )}
        aria-hidden="true"
      >
        {allowed ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <X className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      <p className="text-[12.5px] leading-5 text-zinc-600">{label}</p>
    </div>
  );
}

// ── Flow diagram node ────────────────────────────────────────────────────────

function FlowNode({
  icon: Icon,
  label,
  sub,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="flex w-[86px] flex-col items-center gap-1.5 text-center">
      <span
        className={cn("flex h-10 w-10 items-center justify-center rounded-xl border border-white/60 shadow-card", tone)}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-[11px] font-semibold leading-tight text-foreground">{label}</p>
      <p className="text-[9.5px] leading-tight text-zinc-400">{sub}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <PageHeader
        eyebrow="Trust boundary"
        title="Privacy & safety"
        lede="TrapKiller is built so the agent never needs your secrets. It works inside a Playwright-controlled browser session and only ever takes actions you explicitly approve."
      />

      {/* ── How the agent works ──────────────────── */}
      <Section
        title="How the agent operates"
        description="Your session is the boundary. The agent observes, proposes, and only acts with your permission."
        index={0}
      >
        <div className="panel relative overflow-hidden p-5">
          <div
            aria-hidden="true"
            className="lab-grid-faint pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_50%,black,transparent)]"
          />
          <div className="relative flex flex-wrap items-center justify-center gap-1.5 py-2">
            {[
              { icon: User, label: "You", sub: "Start request", tone: "bg-zinc-100 text-zinc-600" },
              null,
              { icon: Lock, label: "Backend", sub: "Server-side only", tone: "bg-blue-50 text-blue-600" },
              null,
              { icon: Bot, label: "Agent", sub: "Playwright session", tone: "bg-brand-soft text-brand" },
              null,
              { icon: Globe, label: "Website", sub: "Real navigation", tone: "bg-indigo-50 text-indigo-600" },
              null,
              { icon: FileCheck, label: "Verification", sub: "Proof screenshot", tone: "bg-success-soft text-emerald-600" },
              null,
              { icon: Timer, label: "Auto-delete", sub: "Temporary proof", tone: "bg-warning-soft text-amber-600" },
            ].map((node, i) =>
              node === null ? (
                <ArrowRight key={i} className="h-3.5 w-3.5 shrink-0 text-zinc-300" aria-hidden="true" />
              ) : (
                <FlowNode key={node.label} {...node} />
              )
            )}
          </div>
          <p className="relative mx-auto mt-4 max-w-md text-center text-[11.5px] leading-5 text-zinc-500">
            At no point does TrapKiller see your password, payment credentials, or the contents of other tabs.
          </p>
        </div>
      </Section>

      {/* ── Data handling ────────────────────────── */}
      <Section title="Data handling" description="What is stored, what is not, and for how long." index={1}>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: KeyRound,
              title: "No stored passwords",
              body: "The agent operates inside a server-side Playwright browser. Credentials never touch our servers — the agent navigates using the session you authenticate with.",
              tone: "bg-blue-50 text-blue-600",
            },
            {
              icon: Landmark,
              title: "No bank linking",
              body: "The MVP does not require financial-account access. Cancellation flows run entirely on the service's own website.",
              tone: "bg-indigo-50 text-indigo-600",
            },
            {
              icon: Camera,
              title: "Temporary screenshots",
              body: "Proof screenshots are retained only for the duration of your session, then deleted. They are written to backend/.proofs/ and only used as your evidence.",
              tone: "bg-zinc-100 text-zinc-600",
            },
            {
              icon: ClipboardList,
              title: "Audit log retained",
              body: "Agent events are persisted to the activity log for transparency and audit purposes. You can review the full event history in the Activity page.",
              tone: "bg-success-soft text-emerald-600",
            },
          ].map((card, i) => (
            <FeatureCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </Section>

      {/* ── Agent permissions ────────────────────── */}
      <Section title="Agent permissions" description="An explicit list of what the agent can and cannot do." index={2}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-4">
            <p className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Agent can
            </p>
            {[
              "Navigate pages inside a sandboxed Playwright browser",
              "Read visible page content and interactive elements",
              "Detect potential dark patterns using the classifier",
              "Click buttons you have explicitly approved",
              "Generate verification screenshots",
              "Record all actions in the audit log",
            ].map((item) => (
              <PermissionRow key={item} label={item} allowed />
            ))}
          </div>
          <div className="panel p-4">
            <p className="mb-1 flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-red-600">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
              Agent cannot
            </p>
            {[
              "Access your browser sessions or cookies",
              "Read other browser tabs",
              "Store or transmit your passwords",
              "Execute irreversible actions without explicit approval",
              "Access payment or bank account data",
              "Operate outside the investigation session",
            ].map((item) => (
              <PermissionRow key={item} label={item} allowed={false} />
            ))}
          </div>
        </div>
      </Section>

      {/* ── Human approval ───────────────────────── */}
      <Section
        title="Human approval gate"
        description="The single most important safety control in TrapKiller."
        index={3}
      >
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 bg-warning-soft p-5">
          <span
            aria-hidden="true"
            className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-marker/30 blur-2xl"
          />
          <div className="relative flex items-start gap-3.5">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-surface text-amber-700 shadow-card"
              aria-hidden="true"
            >
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-900">
                Always required before irreversible actions
              </p>
              <p className="mt-1 text-[12.5px] leading-5 text-amber-800">
                When the agent reaches the final cancellation step, it always pauses and presents you with a clear
                summary of what will happen. The action is only submitted if you click <strong>Approve</strong>.
                Clicking Reject stops the agent entirely.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "The approval dialog is a fixed overlay — you cannot miss it",
                  "The dialog explains exactly what will happen",
                  "Rejecting stops the agent without any action taken",
                  "Approvals are validated server-side — the frontend cannot fake them",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12px] leading-5 text-amber-800">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" strokeWidth={3} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Browser sessions ─────────────────────── */}
      <Section
        title="Browser sessions"
        description="How the agent's browser is isolated from your personal browser."
        index={4}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: Bot,
              title: "Playwright-controlled",
              body: "The agent uses a server-side Playwright browser. This runs entirely in the backend — completely separate from your personal browser.",
              tone: "bg-brand-soft text-brand",
            },
            {
              icon: Lock,
              title: "Session-isolated",
              body: "Each investigation gets a fresh browser context. Sessions cannot see each other's data, and no session data persists after completion.",
              tone: "bg-zinc-100 text-zinc-600",
            },
            {
              icon: Eye,
              title: "Screenshot evidence",
              body: "Screenshots are taken at verification to provide proof of outcome. They are stored temporarily in backend/.proofs/ and only visible to you.",
              tone: "bg-success-soft text-emerald-600",
            },
            {
              icon: EyeOff,
              title: "No cross-tab access",
              body: "The agent cannot access your personal browser sessions, history, bookmarks, or other open tabs at any point.",
              tone: "bg-zinc-100 text-zinc-600",
            },
          ].map((card, i) => (
            <FeatureCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </Section>

      {/* ── Evidence & Logs ──────────────────────── */}
      <Section title="Evidence & activity logs" description="What is recorded and for how long." index={5}>
        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureCard
            icon={FileCheck}
            title="Proof evidence"
            body="A proof chain (page state, screenshot, confirmation detection) is written to backend/.proofs/ at session completion. The proof ID is shown in the Agent view."
            tone="bg-success-soft text-emerald-600"
          />
          <FeatureCard
            icon={Activity}
            title="Activity log"
            body="Every agent event (perception, detection, planning, action, verification) is persisted to the audit log. View the complete timeline in the Activity page."
            tone="bg-blue-50 text-blue-600"
          />
        </div>
      </Section>

      {/* ── SSRF & Rate limits ───────────────────── */}
      <Section
        title="Security controls"
        description="Backend protections applied to all investigation requests."
        index={6}
      >
        <div className="panel p-4">
          <div className="grid gap-2.5 sm:grid-cols-2">
            {[
              { label: "SSRF protection", body: "Blocks private, loopback and reserved IPs, plus DNS-rebinding on scanner targets." },
              { label: "Rate limiting", body: "Per-user limits on scanner, agent-start and approval actions." },
              { label: "Idempotency keys", body: "Duplicate agent-start requests return the cached response." },
              { label: "Server-side approvals", body: "Approval transitions use the service-role client — never client-only." },
            ].map(({ label, body }) => (
              <div key={label} className="rounded-xl border border-border bg-zinc-50/70 p-3">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                  {label}
                </p>
                <p className="mt-1 text-[11.5px] leading-5 text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
