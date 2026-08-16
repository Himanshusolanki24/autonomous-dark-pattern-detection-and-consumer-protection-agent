"use client";

import { motion } from "framer-motion";
import {
  KeyRound,
  Landmark,
  UserCheck,
  CameraOff,
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  Bot,
  Globe,
  FileCheck,
  Timer,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PRIVACY_CARDS = [
  {
    icon: KeyRound,
    title: "No Stored Passwords",
    body: "The agent operates inside the user's authenticated browser session. Credentials never touch our servers.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: Landmark,
    title: "No Bank Linking",
    body: "The MVP does not require financial-account access. Cancellation flows run entirely on the service's own website.",
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: UserCheck,
    title: "Human Approval",
    body: "The final irreversible cancellation action always requires explicit user confirmation. Nothing destructive runs automatically.",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: CameraOff,
    title: "Temporary Proof",
    body: "Screenshots are retained only for a limited period, then deleted. Proof evidence is generated for your confirmation only.",
    tone: "bg-emerald-50 text-emerald-600",
  },
];

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex w-40 flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center shadow-sm"
    >
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg", tone)}>
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold">{label}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </motion.div>
  );
}

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          Privacy by Design
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          TrapKiller is built so the agent never needs your secrets. It works
          inside your own authenticated session and only ever takes actions you
          explicitly approve.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">How the agent operates</CardTitle>
          <CardDescription>
            Your session is the boundary. The agent observes, proposes, and only
            acts with your permission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-center gap-3 py-4">
            <FlowNode icon={User} label="You" sub="Authenticated session" tone="bg-zinc-100 text-zinc-600" />
            <ArrowRight className="h-4 w-4 text-zinc-300" />
            <FlowNode icon={Lock} label="Your Browser" sub="Session stays local" tone="bg-blue-50 text-blue-600" />
            <ArrowRight className="h-4 w-4 text-zinc-300" />
            <FlowNode icon={Bot} label="TrapKiller Agent" sub="Reads the page" tone="bg-brand-soft text-brand" />
            <ArrowRight className="h-4 w-4 text-zinc-300" />
            <FlowNode icon={Globe} label="Service Website" sub="Navigates in your session" tone="bg-indigo-50 text-indigo-600" />
            <ArrowRight className="h-4 w-4 text-zinc-300" />
            <FlowNode icon={FileCheck} label="Verification" sub="Proof screenshot" tone="bg-emerald-50 text-emerald-600" />
            <ArrowRight className="h-4 w-4 text-zinc-300" />
            <FlowNode icon={Timer} label="Auto-delete" sub="Temporary retention" tone="bg-amber-50 text-amber-600" />
          </div>
          <p className="mx-auto max-w-xl text-center text-xs leading-5 text-muted-foreground">
            At no point does TrapKiller see your password, your payment
            credentials, or the contents of other tabs. The final cancellation
            click is always made by you.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {PRIVACY_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      card.tone
                    )}
                  >
                    <card.icon className="h-4.5 w-4.5" />
                  </span>
                  <CardTitle className="text-sm">{card.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{card.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}