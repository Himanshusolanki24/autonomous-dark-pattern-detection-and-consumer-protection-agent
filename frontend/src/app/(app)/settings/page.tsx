"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function ToggleRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}

export default function SettingsPage() {
  const [sensitivity, setSensitivity] = useState("high");
  const [paused, setPaused] = useState(false);
  const [proofRetention, setProofRetention] = useState(true);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <SettingsIcon className="h-5 w-5 text-zinc-500" />
          Settings
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure how the agent behaves on your behalf.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Detection</CardTitle>
          <CardDescription>How aggressively dark patterns are flagged.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["low", "medium", "high"] as const).map((level) => (
              <button
                key={level}
                onClick={() => setSensitivity(level)}
                className={
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors " +
                  (sensitivity === level
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border-strong bg-surface text-zinc-600 hover:bg-zinc-50")
                }
                aria-pressed={sensitivity === level}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {sensitivity === "high" &&
              "Flag all patterns above 60% confidence, including subtle wording tactics."}
            {sensitivity === "medium" &&
              "Flag patterns above 75% confidence. Balance sensitivity and noise."}
            {sensitivity === "low" &&
              "Only flag clear, structurally obvious dark patterns."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Agent behaviour</CardTitle>
          <CardDescription>Safety controls for autonomous navigation.</CardDescription>
        </CardHeader>
        <CardContent>
          <ToggleRow
            title="Pause on dark patterns"
            description="Freeze the agent whenever a new dark pattern is detected mid-flow."
            checked={paused}
            onChange={setPaused}
          />
          <Separator />
          <ToggleRow
            title="Require approval for final cancellation"
            description="Keep the irreversible step behind explicit confirmation. Always on for safety."
            checked
            onChange={() => undefined}
            disabled
          />
          <Separator />
          <ToggleRow
            title="Retain proof screenshots temporarily"
            description="Keep verification screenshots for a limited period, then delete them."
            checked={proofRetention}
            onChange={setProofRetention}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Demo mode</CardTitle>
          <CardDescription>
            Simulate the full cancellation journey deterministically for
            demonstrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <a href="/demo">Open live demo</a>
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>
          {saved && <Check className="h-4 w-4" />}
          {saved ? "Saved" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}