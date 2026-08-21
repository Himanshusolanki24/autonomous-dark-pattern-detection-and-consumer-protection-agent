"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
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
import { cn } from "@/lib/utils";

// ── Section card ──────────────────────────────────────────────────────────────

function SettingsCard({
  title,
  description,
  icon: Icon,
  children,
  index = 0,
}: {
  title: string;
  description?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
      className="rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <div className="flex items-start gap-3 border-b border-zinc-100 px-5 py-4">
        {Icon && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-[12px] text-zinc-500">{description}</p>
          )}
        </div>
      </div>
      <div className="px-5 py-4">{children}</div>
    </motion.div>
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
        <p className={cn("text-[13px] font-medium", disabled ? "text-zinc-400" : "text-zinc-800")}>
          {title}
        </p>
        <p className="mt-0.5 text-[12px] leading-5 text-zinc-500">{description}</p>
        {disabled && disabledReason && (
          <p className="mt-0.5 text-[11px] text-zinc-400 italic">{disabledReason}</p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-label={title}
      />
    </div>
  );
}

// ── Save button states ────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function useSave() {
  const [state, setState] = useState<SaveState>("idle");

  const save = async () => {
    setState("saving");
    await new Promise((r) => setTimeout(r, 800));
    // In dev mode settings are local — always succeed
    setState("saved");
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
      className={cn(
        "transition-all",
        state === "saved" && "bg-emerald-600 hover:bg-emerald-700"
      )}
    >
      {state === "saving" ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Saving…
        </>
      ) : state === "saved" ? (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          Saved
        </>
      ) : state === "error" ? (
        <>
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          Error — Retry
        </>
      ) : (
        "Save changes"
      )}
    </Button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Profile
  const [displayName, setDisplayName] = useState("Demo User");
  const profileSave = useSave();

  // Agent preferences
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high">("high");
  const [pauseOnDetection, setPauseOnDetection] = useState(false);
  const agentSave = useSave();

  // Safety
  const [autoStopOnError, setAutoStopOnError] = useState(true);
  const safetySave = useSave();

  // Evidence
  const [proofRetention, setProofRetention] = useState(true);
  const evidenceSave = useSave();

  // Danger zone
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">

      {/* ── Header ───────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-zinc-500" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-zinc-900">Settings</h2>
        </div>
        <p className="mt-0.5 text-[12px] text-zinc-400">
          Configure how the agent behaves on your behalf.
        </p>
      </div>

      {/* ── Profile ──────────────────────────────── */}
      <SettingsCard
        title="Profile"
        description="Your display name and account information."
        icon={User}
        index={0}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg font-bold text-zinc-500"
            aria-label="Avatar initials"
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <label htmlFor="display-name" className="mb-1 block text-[11px] font-medium text-zinc-500">
              Display name
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand"
              placeholder="Your name"
            />
          </div>
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-[11px] font-medium text-zinc-500">
            Email
          </label>
          <div className="flex h-9 items-center rounded-lg border border-zinc-100 bg-zinc-50 px-3 text-sm text-zinc-400">
            demo@trapkiller.dev
            <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
              dev mode
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <SaveButton state={profileSave.state} onSave={() => void profileSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Agent Preferences ────────────────────── */}
      <SettingsCard
        title="Agent Preferences"
        description="How aggressively the agent detects and acts on dark patterns."
        icon={Bot}
        index={1}
      >
        {/* Sensitivity */}
        <div className="mb-4">
          <p className="mb-2 text-[12px] font-medium text-zinc-600">
            Detection sensitivity
          </p>
          <div className="flex gap-2" role="group" aria-label="Detection sensitivity">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSensitivity(level)}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-[12px] font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  sensitivity === level
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                )}
                aria-pressed={sensitivity === level}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-zinc-400">
            {sensitivity === "high" &&
              "Flag all patterns above 60% confidence, including subtle wording tactics."}
            {sensitivity === "medium" &&
              "Flag patterns above 75% confidence. Balance sensitivity and noise."}
            {sensitivity === "low" &&
              "Only flag clear, structurally obvious dark patterns."}
          </p>
        </div>

        <Separator />

        <ToggleRow
          title="Pause on dark pattern detection"
          description="Freeze the agent whenever a new dark pattern is detected mid-flow, giving you time to review before continuing."
          checked={pauseOnDetection}
          onChange={setPauseOnDetection}
        />

        <div className="mt-4 flex justify-end">
          <SaveButton state={agentSave.state} onSave={() => void agentSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Safety Controls ──────────────────────── */}
      <SettingsCard
        title="Safety Controls"
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
          disabledReason="This control is always on for your safety."
        />

        <Separator />

        <ToggleRow
          title="Auto-stop on error"
          description="If the agent encounters an unexpected error mid-flow, stop automatically rather than continuing."
          checked={autoStopOnError}
          onChange={setAutoStopOnError}
        />

        <div className="mt-4 flex justify-end">
          <SaveButton state={safetySave.state} onSave={() => void safetySave.save()} />
        </div>
      </SettingsCard>

      {/* ── Evidence ─────────────────────────────── */}
      <SettingsCard
        title="Evidence &amp; Proof"
        description="How proof screenshots are stored and retained."
        icon={Camera}
        index={3}
      >
        <ToggleRow
          title="Retain proof screenshots"
          description="Keep verification screenshots for the duration of your session. Screenshots are deleted automatically when the session ends."
          checked={proofRetention}
          onChange={setProofRetention}
        />

        <div className="mt-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
          <p className="text-[11px] leading-5 text-zinc-500">
            Proof files are written to{" "}
            <code className="rounded bg-zinc-200 px-1 font-mono text-[10px]">
              backend/.proofs/
            </code>{" "}
            and are only accessible server-side. They are never exposed publicly.
          </p>
        </div>

        <div className="mt-4 flex justify-end">
          <SaveButton state={evidenceSave.state} onSave={() => void evidenceSave.save()} />
        </div>
      </SettingsCard>

      {/* ── Demo Mode ────────────────────────────── */}
      <SettingsCard
        title="Demo Mode"
        description="Simulate the full cancellation journey for demonstrations."
        icon={Play}
        index={4}
      >
        <p className="text-[12px] leading-5 text-zinc-500">
          Demo mode runs a deterministic simulation of the agent pipeline using
          a fictional service (StreamFlow). It does not make any real requests
          to external websites.
        </p>
        <div className="mt-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/demo">
              Open Live Demo
              <ChevronRight className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </SettingsCard>

      {/* ── Danger Zone ──────────────────────────── */}
      <SettingsCard
        title="Danger Zone"
        description="Destructive actions that cannot be undone."
        icon={Trash2}
        index={5}
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-red-800">
                Reset all sessions
              </p>
              <p className="mt-0.5 text-[12px] text-red-700">
                Clears all active sessions, event history, and detected
                patterns from the in-memory store. This is permanent.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDangerConfirm((v) => !v)}
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100"
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
                  <p className="text-[12px] font-medium text-red-800">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={() => {
                        // In dev mode: just close the confirmation
                        setShowDangerConfirm(false);
                      }}
                    >
                      Yes, reset
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDangerConfirm(false)}
                    >
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
