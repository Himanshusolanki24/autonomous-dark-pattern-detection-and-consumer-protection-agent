import { ShieldCheck, Landmark, UserCheck, CameraOff } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const PRIVACY_ITEMS = [
  {
    icon: ShieldCheck,
    title: "No stored passwords",
    body: "The agent operates within the user's authenticated browser session. Credentials never touch our servers.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: Landmark,
    title: "No bank connection",
    body: "The MVP doesn't require financial-account access. Cancellation flows run entirely on the service's own website.",
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: UserCheck,
    title: "Human approval",
    body: "Irreversible cancellation always requires explicit confirmation. Nothing destructive runs automatically.",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: CameraOff,
    title: "Temporary proof",
    body: "Cancellation evidence can be retained only for a limited period, then deleted.",
    tone: "bg-emerald-50 text-emerald-600",
  },
] as const;

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
