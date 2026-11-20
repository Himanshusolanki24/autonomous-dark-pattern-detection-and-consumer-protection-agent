"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bot,
  ShieldCheck,
  Camera,
  Play,
  Trash2,
  Check,
  Loader2,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/ui/case";
import { cn } from "@/lib/utils";

// ── Section card ──────────────────────────────────────────────────────────────

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  index = 0,
  tone = "default",
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  index?: number;
  tone?: "default" | "danger";
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05 }}
      className={cn("panel overflow-hidden", tone === "danger" && "border-red-200/80")}
    >
      <div
        className={cn(
          "flex items-start gap-3 border-b border-border px-5 py-4",
          tone === "danger" && "border-red-200/70 bg-danger-soft/50"
        )}
      >
        {Icon && (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              tone === "danger" ? "bg-red-100 text-red-600" : "bg-zinc-100 text-zinc-500"
            )}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h2 className="font-display text-[14.5px] font-semibold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{description}</p>}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.section>
  );
}

// ── Toggle row ────────────────────────────────────────────────────────────────

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
  disabledReason,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0 flex-1">
        <p className={cn("text-[13px] font-medium", disabled ? "text-zinc-400" : "text-foreground")}>{title}</p>
        <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{description}</p>
        {disabled && disabledReason && (
          <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-zinc-500">
            <ShieldCheck className="h-2.5 w-2.5" aria-hidden="true" />
            {disabledReason}
          </p>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={title} />
    </div>
  );
}

// ── Save button states ────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function useSave(onPersist?: () => void) {
  const [state, setState] = useState<SaveState>("idle");

  const save = async () => {
    setState("saving");
    await new Promise((r) => setTimeout(r, 400));
    try {
      onPersist?.();
      setState("saved");
    } catch {
      setState("error");
    }
    setTimeout(() => setState("idle"), 2000);
  };

  return { state, save };
}

function SaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <Button
      onClick={onSave}
      disabled={state === "saving"}
      size="sm"
      className={cn("min-w-[118px] transition-all", state === "saved" && "bg-emerald-600 hover:bg-emerald-600")}
    >
      {state === "saving" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Saving…
        </>
      ) : state === "saved" ? (
        <>
          <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />
          Saved
        </>
      ) : state === "error" ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Error — retry
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const SENSITIVITY = [
  { key: "low", label: "Low", hint: "Only flag clear, structurally obvious dark patterns." },
  { key: "medium", label: "Medium", hint: "Flag patterns above 75% confidence. Balance sensitivity and noise." },
  { key: "high", label: "High", hint: "Flag all patterns above 60% confidence, including subtle wording tactics." },
] as const;

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("Demo User");
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("high");
  const [pauseOnDetection, setPauseOnDetection] = useState(false);
  const [autoStopOnError, setAutoStopOnError] = useState(true);
  const [proofRetention, setProofRetention] = useState(true);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("trapkiller_settings");
      if (raw) {
        const s = JSON.parse(raw);
        if (s.displayName) setDisplayName(s.displayName);
        if (s.sensitivity) setSensitivity(s.sensitivity);
        if (s.pauseOnDetection !== undefined) setPauseOnDetection(s.pauseOnDetection);
        if (s.autoStopOnError !== undefined) setAutoStopOnError(s.autoStopOnError);
        if (s.proofRetention !== undefined) setProofRetention(s.proofRetention);
      }
    } catch {
      // ignore
    }
  }, []);

  const persistSettings = useCallback((updates: Record<string, unknown>) => {
    try {
      const current = JSON.parse(localStorage.getItem("trapkiller_settings") || "{}");
      localStorage.setItem("trapkiller_settings", JSON.stringify({ ...current, ...updates }));
    } catch {
      // ignore
    }
  }, []);

  const profileSave = useSave(() => persistSettings({ displayName }));
  const agentSave = useSave(() => persistSettings({ sensitivity, pauseOnDetection }));
  const safetySave = useSave(() => persistSettings({ autoStopOnError }));
  const evidenceSave = useSave(() => persistSettings({ proofRetention }));

  const activeSensitivity = SENSITIVITY.find((s) => s.key === sensitivity) ?? SENSITIVITY[2];

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        lede="Configure how the agent behaves on your behalf. In dev mode these preferences stay in this browser session."
      />

      {/* ── Profile ──────────────────────────────── */}
      <SettingsCard title="Profile" description="Your display name and account information." icon={User} index={0}>
        <div className="flex items-center gap-4">
          <div
            className="font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-brand-soft to-surface text-[20px] font-bold text-blue-700 shadow-card"
            aria-label="Avatar initials"
          >
            {displayName.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="display-name" className="eyebrow mb-1.5 block text-[9.5px]">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-10 w-full rounded-xl border border-border-strong bg-surface px-3 text-[14px] text-foreground shadow-card placeholder:text-zinc-400 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
              placeholder="Your name"
            />
          </div>
        </div>
        <div className="mt-3.5">
          <p className="eyebrow mb-1.5 text-[9.5px]">Email</p>
          <div className="flex h-10 items-center rounded-xl border border-border bg-zinc-50/70 px-3 font-mono text-[12.5px] text-zinc-500">
            demo@trapkiller.dev
            <span className="ml-2 rounded-md bg-zinc-200/70 px-1.5 py-0.5 font-sans text-[9.5px] font-semibold uppercase tracking-wide text-zinc-500">
              dev mode
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <SaveButton state={profileSave.state} onSave={() => void profileSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Agent Preferences ────────────────────── */}
      <SettingsCard
        title="Agent preferences"
        description="How aggressively the agent detects and acts on dark patterns."
        icon={Bot}
        index={1}
      >
        <div className="mb-4">
          <p className="eyebrow mb-2 text-[9.5px]">Detection sensitivity</p>
          <div className="flex gap-1.5 rounded-xl border border-border bg-zinc-50 p-1" role="group" aria-label="Detection sensitivity">
            {SENSITIVITY.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSensitivity(key)}
                className={cn(
                  "relative flex-1 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none",
                  sensitivity === key ? "text-blue-700" : "text-zinc-500 hover:text-foreground"
                )}
                aria-pressed={sensitivity === key}
              >
                {sensitivity === key && (
                  <motion.span
                    layoutId="sensitivity-pill"
                    className="absolute inset-0 rounded-lg border border-border bg-surface shadow-card"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11.5px] leading-5 text-zinc-500">{activeSensitivity.hint}</p>
        </div>

        <Separator />

        <ToggleRow
          title="Pause on dark pattern detection"
          description="Freeze the agent whenever a new dark pattern is detected mid-flow, giving you time to review before continuing."
          checked={pauseOnDetection}
          onChange={setPauseOnDetection}
        />

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <SaveButton state={agentSave.state} onSave={() => void agentSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Safety Controls ──────────────────────── */}
      <SettingsCard
        title="Safety controls"
        description="Controls that protect against unintended actions."
        icon={ShieldCheck}
        index={2}
      >
        <ToggleRow
          title="Require approval for final cancellation"
          description="The irreversible final step always requires explicit human confirmation. This cannot be disabled."
          checked
          onChange={() => undefined}
          disabled
          disabledReason="Always on for your safety"
        />

        <Separator />

        <ToggleRow
          title="Auto-stop on error"
          description="If the agent encounters an unexpected error mid-flow, stop automatically rather than continuing."
          checked={autoStopOnError}
          onChange={setAutoStopOnError}
        />

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <SaveButton state={safetySave.state} onSave={() => void safetySave.save()} />
        </div>
      </SettingsCard>

      {/* ── Evidence ─────────────────────────────── */}
      <SettingsCard
        title="Evidence & proof"
        description="How proof screenshots are stored and retained."
        icon={Camera}
        index={3}
      >
        <ToggleRow
          title="Retain proof screenshots"
          description="Keep verification screenshots according to the retention window (default 7 days). Older proofs are pruned automatically."
          checked={proofRetention}
          onChange={setProofRetention}
        />

        <div className="mt-3 rounded-xl border border-border bg-zinc-50/70 p-3">
          <p className="text-[11.5px] leading-5 text-zinc-500">
            Proof files are written to{" "}
            <code className="rounded bg-zinc-200/70 px-1 py-0.5 font-mono text-[10.5px] text-zinc-700">
              .proofs/
            </code>{" "}
            and are only accessible server-side. They are never exposed publicly.
          </p>
        </div>

        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <SaveButton state={evidenceSave.state} onSave={() => void evidenceSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Demo Mode ────────────────────────────── */}
      <SettingsCard
        title="Demo mode"
        description="Simulate the full cancellation journey for demonstrations."
        icon={Play}
        index={4}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-md text-[12px] leading-5 text-zinc-500">
            Demo mode runs a deterministic simulation of the agent pipeline using a fictional service
            (StreamFlow). It does not make any real requests to external websites.
          </p>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link href="/demo">
              Open live demo
              <ChevronRight className="ml-0.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </SettingsCard>

      {/* ── Danger Zone ──────────────────────────── */}
      <SettingsCard
        title="Danger zone"
        description="Destructive actions that cannot be undone."
        icon={Trash2}
        index={5}
        tone="danger"
      >
        <div className="rounded-xl border border-red-200 bg-danger-soft/60 p-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-red-800">Reset all sessions</p>
              <p className="mt-0.5 text-[12px] leading-5 text-red-700">
                Clears all active sessions, event history, and detected patterns from the in-memory store.
                This is permanent.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDangerConfirm((v) => !v)}
              className="shrink-0 border-red-300 bg-surface text-red-700 hover:bg-red-100"
            >
              Reset
            </Button>
          </div>

          <AnimatePresence>
            {showDangerConfirm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="mt-3 border-t border-red-200 pt-3">
                  <p className="text-[12px] font-medium text-red-800">Are you sure? This cannot be undone.</p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        try {
                          localStorage.removeItem("trapkiller_settings");
                        } catch {}
                        setDisplayName("Demo User");
                        setSensitivity("high");
                        setPauseOnDetection(false);
                        setAutoStopOnError(true);
                        setProofRetention(true);
                        setShowDangerConfirm(false);
                      }}
                    >
                      Yes, reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowDangerConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SettingsCard>
    </div>
  );
}
