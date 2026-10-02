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
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      aria-labelledby={`section-${title.toLowerCase().replace(/\s/g, "-")}`}
    >
      <div className="mb-4">
        <h3
          id={`section-${title.toLowerCase().replace(/\s/g, "-")}`}
          className="text-sm font-semibold text-zinc-900"
        >
          {title}
        </h3>
        <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{description}</p>
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
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          tone
        )}
        aria-hidden="true"
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-zinc-800">{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{body}</p>
      </div>
    </motion.div>
  );
}

// ── Permission row ────────────────────────────────────────────────────────────

function PermissionRow({
  label,
  allowed,
}: {
  label: string;
  allowed: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          allowed
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-500"
        )}
        aria-hidden="true"
      >
        {allowed ? (
          <Check className="h-3 w-3" />
        ) : (
          <X className="h-3 w-3" />
        )}
      </span>
      <p className="text-[13px] text-zinc-700">{label}</p>
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
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl border-2 border-white shadow-sm",
          tone
        )}
        aria-hidden="true"
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="text-[11px] font-semibold text-zinc-700">{label}</p>
      <p className="text-[10px] text-zinc-400">{sub}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 p-4 sm:p-6 lg:p-8">

      {/* ── Page header ──────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Security &amp; Privacy
          </h2>
        </div>
        <p className="mt-1 max-w-xl text-[13px] leading-6 text-zinc-500">
          TrapKiller is built so the agent never needs your secrets. It works
          inside a Playwright-controlled browser session and only ever takes
          actions you explicitly approve.
        </p>
      </div>

      {/* ── How the agent works ──────────────────── */}
      <Section
        title="How the agent operates"
        description="Your session is the boundary. The agent observes, proposes, and only acts with your permission."
        index={0}
      >
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-center gap-2 py-2">
            {[
              { icon: User,      label: "You",           sub: "Start request",      tone: "bg-zinc-100 text-zinc-600" },
              null,
              { icon: Lock,      label: "Backend",       sub: "Server-side only",   tone: "bg-blue-50 text-blue-600" },
              null,
              { icon: Bot,       label: "Agent",         sub: "Playwright session", tone: "bg-brand-soft text-brand" },
              null,
              { icon: Globe,     label: "Website",       sub: "Real navigation",    tone: "bg-indigo-50 text-indigo-600" },
              null,
              { icon: FileCheck, label: "Verification",  sub: "Proof screenshot",   tone: "bg-emerald-50 text-emerald-600" },
              null,
              { icon: Timer,     label: "Auto-delete",   sub: "Temporary proof",    tone: "bg-amber-50 text-amber-600" },
            ].map((node, i) =>
              node === null ? (
                <ArrowRight
                  key={i}
                  className="h-4 w-4 shrink-0 text-zinc-200"
                  aria-hidden="true"
                />
              ) : (
                <FlowNode key={node.label} {...node} />
              )
            )}
          </div>
          <p className="mx-auto mt-4 max-w-md text-center text-[11px] leading-5 text-zinc-400">
            At no point does TrapKiller see your password, payment credentials,
            or the contents of other tabs.
          </p>
        </div>
      </Section>

      {/* ── Data handling ────────────────────────── */}
      <Section
        title="Data Handling"
        description="What is stored, what is not, and for how long."
        index={1}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: KeyRound,
              title: "No Stored Passwords",
              body: "The agent operates inside a server-side Playwright browser. Credentials never touch our servers — the agent navigates using the session you authenticate with.",
              tone: "bg-blue-50 text-blue-600",
            },
            {
              icon: Landmark,
              title: "No Bank Linking",
              body: "The MVP does not require financial-account access. Cancellation flows run entirely on the service's own website.",
              tone: "bg-indigo-50 text-indigo-600",
            },
            {
              icon: Camera,
              title: "Temporary Screenshots",
              body: "Proof screenshots are retained only for the duration of your session, then deleted. They are written to backend/.proofs/ and only used as your evidence.",
              tone: "bg-zinc-100 text-zinc-600",
            },
            {
              icon: ClipboardList,
              title: "Audit Log Retained",
              body: "Agent events are persisted to the activity log for transparency and audit purposes. You can review the full event history in the Activity page.",
              tone: "bg-emerald-50 text-emerald-600",
            },
          ].map((card, i) => (
            <FeatureCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </Section>

      {/* ── Agent permissions ────────────────────── */}
      <Section
        title="Agent Permissions"
        description="An explicit list of what the agent can and cannot do."
        index={2}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
              Agent CAN
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
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-red-500">
              Agent CANNOT
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
        title="Human Approval Gate"
        description="The single most important safety control in TrapKiller."
        index={3}
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"
              aria-hidden="true"
            >
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-amber-900">
                Always required before irreversible actions
              </p>
              <p className="mt-1 text-[12px] leading-5 text-amber-800">
                When the agent reaches the final cancellation step, it always
                pauses and presents you with a clear summary of what will
                happen. The action is only submitted if you click{" "}
                <strong>Approve</strong>. Clicking Reject stops the agent
                entirely.
              </p>
              <ul className="mt-3 space-y-1.5">
                {[
                  "The approval dialog is a fixed overlay — you cannot miss it",
                  "The dialog explains exactly what will happen",
                  "Rejecting stops the agent without any action taken",
                  "Approvals are validated server-side — the frontend cannot fake them",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[12px] text-amber-800"
                  >
                    <Check
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
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
        title="Browser Sessions"
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
              title: "Screenshot Evidence",
              body: "Screenshots are taken at verification to provide proof of outcome. They are stored temporarily in backend/.proofs/ and only visible to you.",
              tone: "bg-emerald-50 text-emerald-600",
            },
            {
              icon: EyeOff,
              title: "No Cross-Tab Access",
              body: "The agent cannot access your personal browser sessions, history, bookmarks, or other open tabs at any point.",
              tone: "bg-zinc-100 text-zinc-600",
            },
          ].map((card, i) => (
            <FeatureCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </Section>

      {/* ── Evidence & Logs ──────────────────────── */}
      <Section
        title="Evidence &amp; Activity Logs"
        description="What is recorded and for how long."
        index={5}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <FeatureCard
            icon={FileCheck}
            title="Proof Evidence"
            body="A proof chain (page state, screenshot, confirmation detection) is written to backend/.proofs/ at session completion. Proof ID is shown in the Agent view."
            tone="bg-emerald-50 text-emerald-600"
          />
          <FeatureCard
            icon={Activity}
            title="Activity Log"
            body="Every agent event (perception, detection, planning, action, verification) is persisted to the audit log. View the complete timeline in the Activity page."
            tone="bg-blue-50 text-blue-600"
          />
        </div>
      </Section>

      {/* ── SSRF & Rate limits ───────────────────── */}
      <Section
        title="Security Controls"
        description="Backend protections applied to all investigation requests."
        index={6}
      >
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "SSRF protection", body: "Blocks private/loopback/reserved IPs and DNS-rebinding on scanner targets" },
              { label: "Rate limiting", body: "Per-user limits on scanner, agent-start, and approval actions" },
              { label: "Idempotency keys", body: "Duplicate agent-start requests return the cached response" },
              { label: "Server-side approvals", body: "Approval transitions use the service-role client — never client-only" },
            ].map(({ label, body }) => (
              <div key={label} className="rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-[12px] font-semibold text-zinc-800">{label}</p>
                <p className="mt-0.5 text-[11px] leading-5 text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
