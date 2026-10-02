import {
  Eye,
  ScanSearch,
  FileText,
  Map,
  UserCheck,
  MousePointerClick,
  BadgeCheck,
  ShieldCheck,
  Landmark,
  CameraOff,
  type LucideIcon,
} from "lucide-react";

// ─── Navigation ──────────────────────────────────────────────────────────────

export const LANDING_NAV = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#detection", label: "Detection" },
  { href: "#human-control", label: "Human Control" },
  { href: "#security", label: "Security" },
] as const;

// ─── Agent Pipeline (7 stages) ────────────────────────────────────────────────

export interface PipelineStage {
  id: string;
  index: number;
  label: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
  visual: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "perceive",
    index: 1,
    label: "Perceive",
    icon: Eye,
    summary: "Observes the webpage.",
    detail:
      "Reads the live DOM structure, rendered text, and interface elements inside the authenticated session. Nothing is guessed.",
    visual: "page-scan",
  },
  {
    id: "detect",
    index: 2,
    label: "Detect",
    icon: ScanSearch,
    summary: "Identifies potential deceptive patterns.",
    detail:
      "Checks interactive elements against a dark-pattern taxonomy — confirmshaming, roach motels, forced continuity, drip pricing, basket sneaking and misdirection.",
    visual: "highlight",
  },
  {
    id: "explain",
    index: 3,
    label: "Explain",
    icon: FileText,
    summary: "Shows evidence and context.",
    detail:
      "For each detection, the agent explains what was found, why it may be deceptive, and an automated confidence estimate. You can read the evidence.",
    visual: "evidence",
  },
  {
    id: "plan",
    index: 4,
    label: "Plan",
    icon: Map,
    summary: "Determines a safer next step.",
    detail:
      "Given the user's stated goal, the agent plans the next action — bypassing the traps that would ordinarily derail the user.",
    visual: "path",
  },
  {
    id: "approve",
    index: 5,
    label: "Approve",
    icon: UserCheck,
    summary: "Asks the user before consequential actions.",
    detail:
      "Before any irreversible action, the agent pauses and surfaces a human approval dialog. Nothing destructive runs automatically.",
    visual: "approval",
  },
  {
    id: "act",
    index: 6,
    label: "Act",
    icon: MousePointerClick,
    summary: "Performs only approved actions.",
    detail:
      "Executes the planned steps — clicking, navigating, typing — using real browser automation. Only approved actions are taken.",
    visual: "action",
  },
  {
    id: "verify",
    index: 7,
    label: "Verify",
    icon: BadgeCheck,
    summary: "Confirms the intended outcome.",
    detail:
      "Checks the resulting page and account state to confirm the intended outcome was achieved. Evidence is captured for the record.",
    visual: "check",
  },
];

// ─── Dark Pattern Types ───────────────────────────────────────────────────────

export interface DarkPattern {
  id: string;
  label: string;
  icon: string;
  brief: string;
  explanation: string;
  example: string;
  impact: string;
  risk: "high" | "medium";
}

export const DARK_PATTERNS: DarkPattern[] = [
  {
    id: "confirmshaming",
    label: "Confirmshaming",
    icon: "😔",
    brief: "Guilt-inducing decline copy",
    explanation:
      "The decline option is written to make you feel bad about refusing. Instead of a neutral 'No thanks', you see 'No, I want to lose my benefits.'",
    example: '"No, I want to remain uninformed"',
    impact:
      "Pressures users into accepting an offer they did not want, using emotional manipulation rather than genuine value.",
    risk: "high",
  },
  {
    id: "forced-continuity",
    label: "Forced Continuity",
    icon: "🔄",
    brief: "Charges start without warning",
    explanation:
      'A free trial converts to a paid subscription automatically. The recurring charge may be disclosed in fine print, making it easy to miss.',
    example: '"Your free trial ends. Subscription continues at $12/mo."',
    impact:
      "Users are charged for a service they no longer want, with no clear reminder before the billing date.",
    risk: "high",
  },
  {
    id: "hidden-costs",
    label: "Hidden Costs",
    icon: "💸",
    brief: "Fees revealed only at checkout",
    explanation:
      "A low price is advertised, but service fees, platform charges, and taxes appear only at the final checkout step — after the user has invested time.",
    example: '"$9.99 + $4.50 service fee + $1.20 tax = $15.69"',
    impact:
      "Creates false price expectations, leading users to spend more than they intended or planned for.",
    risk: "medium",
  },
  {
    id: "interface-interference",
    label: "Interface Interference",
    icon: "🎭",
    brief: "Visual hierarchy guides wrong action",
    explanation:
      "Design deliberately makes the intended user action (e.g., declining) visually inconspicuous — low contrast, small font, no clear button — while the service's preferred action is prominent.",
    example: "A gray tiny link labeled 'cancel' next to a bright 'Upgrade Now' button.",
    impact:
      "Causes users to take the wrong action or miss the intended one entirely, not because they chose to, but because the design directed them.",
    risk: "high",
  },
  {
    id: "roach-motel",
    label: "Roach Motel",
    icon: "🪤",
    brief: "Easy in, hard out",
    explanation:
      "Signing up is frictionless — one click. Cancelling requires navigating multiple pages, a phone call, or a chat with retention agents.",
    example: '"Sign up in 30 seconds. Cancel by calling 1-800-xxx-xxxx during business hours."',
    impact:
      "Exploits inertia and frustration. Many users give up before completing cancellation, continuing to pay for a service they want to leave.",
    risk: "high",
  },
  {
    id: "false-urgency",
    label: "False Urgency",
    icon: "⏰",
    brief: "Artificial time pressure",
    explanation:
      "Countdown timers and 'limited time' labels are shown even when no real deadline exists. The goal is to prevent the user from taking time to think.",
    example: '"Offer expires in 09:47. Only 3 left!"',
    impact:
      "Bypasses deliberate decision-making, leading users to make hasty purchases they may later regret.",
    risk: "medium",
  },
];

// ─── Detection Elements ───────────────────────────────────────────────────────

export interface DetectionElement {
  id: string;
  label: string;
  risk: "high" | "medium";
  confidence: number;
  explanation: string;
  whyItMatters: string;
  affectedElement: string;
  box: { top: number; left: number; width: number; height: number };
}

export const DETECTION_ELEMENTS: DetectionElement[] = [
  {
    id: "confirmshaming",
    label: "Confirmshaming",
    risk: "high",
    confidence: 94,
    explanation:
      "The decline option uses guilt-inducing language designed to discourage the user from proceeding with cancellation.",
    whyItMatters:
      "The interface may make refusing feel like a personal failure rather than a neutral choice.",
    affectedElement: '"No, I want to lose my benefits"',
    box: { top: 55, left: 14, width: 72, height: 9 },
  },
  {
    id: "roach-motel",
    label: "Roach Motel",
    risk: "high",
    confidence: 91,
    explanation:
      "The cancellation path is deliberately difficult to locate, requiring multiple steps from the main account page.",
    whyItMatters:
      "The asymmetry between easy sign-up and hard cancellation creates friction that discourages exit.",
    affectedElement: '"Cancel membership" (tiny, underlined, low contrast)',
    box: { top: 72, left: 14, width: 72, height: 6 },
  },
  {
    id: "misdirection",
    label: "Misdirection",
    risk: "medium",
    confidence: 58,
    explanation:
      "The primary action ('Keep My Premium Benefits') is visually dominant, drawing attention away from the cancellation option.",
    whyItMatters:
      "Visual hierarchy may cause the user to click the retention option without fully considering the alternative.",
    affectedElement: '"Keep My Premium Benefits" (dark, full-width button)',
    box: { top: 84, left: 14, width: 72, height: 5 },
  },
];

// ─── Trust Strip Categories ───────────────────────────────────────────────────

export const TRUST_CATEGORIES = [
  { label: "Subscriptions", icon: "📦" },
  { label: "Free Trials", icon: "🎁" },
  { label: "Checkout", icon: "🛒" },
  { label: "Privacy Choices", icon: "🔒" },
  { label: "Account Settings", icon: "⚙️" },
  { label: "Cookie Choices", icon: "🍪" },
] as const;

// ─── Security Mechanisms ──────────────────────────────────────────────────────

export interface SecurityItem {
  icon: LucideIcon;
  title: string;
  body: string;
  tone: string;
}

export const SECURITY_ITEMS: SecurityItem[] = [
  {
    icon: UserCheck,
    title: "Human approval gate",
    body: "Every irreversible action is gated behind an explicit user confirmation. The agent cannot cancel, delete, or modify account state without a direct approval.",
    tone: "bg-blue-50 text-blue-600",
  },
  {
    icon: ShieldCheck,
    title: "Action boundaries",
    body: "The agent operates within a defined set of permitted actions. Navigating, reading, and clicking within the target site. It cannot access other sites or applications.",
    tone: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Landmark,
    title: "No credential storage",
    body: "The agent works within the user's already-authenticated browser session. Passwords never touch the TrapKiller backend.",
    tone: "bg-violet-50 text-violet-600",
  },
  {
    icon: CameraOff,
    title: "Evidence trail",
    body: "Every agent action is logged to an auditable event stream. Page state and screenshots are captured as evidence of what was done.",
    tone: "bg-amber-50 text-amber-600",
  },
  {
    icon: ShieldCheck,
    title: "SSRF protection",
    body: "The backend blocks requests to private, loopback, and reserved IP ranges to prevent server-side request forgery attacks.",
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ShieldCheck,
    title: "Rate limiting",
    body: "Per-user limits on scanner, agent-start, and approval actions prevent abuse of the automation pipeline.",
    tone: "bg-rose-50 text-rose-600",
  },
];

// ─── Verification Steps ───────────────────────────────────────────────────────

export const VERIFICATION_STEPS = [
  {
    id: "action",
    label: "Action",
    description: "Agent performs the approved action inside the real browser session.",
    icon: MousePointerClick,
    state: "action",
  },
  {
    id: "verify",
    label: "Verify",
    description: "Checks page and account state against the expected outcome.",
    icon: ScanSearch,
    state: "verify",
  },
  {
    id: "confirmed",
    label: "Confirmed",
    description: "Expected outcome detected. Evidence captured for the record.",
    icon: BadgeCheck,
    state: "confirmed",
  },
] as const;

export const VERIFICATION_EVIDENCE = [
  "Confirmation page detected",
  "Expected account state found",
  "Evidence screenshot captured",
  "Audit log entry created",
] as const;

// ─── Maze Steps ───────────────────────────────────────────────────────────────

export interface MazeStep {
  label: string;
  trap?: { label: string; tone: "amber" | "red" };
}

export const MAZE_STEPS: MazeStep[] = [
  { label: "Account" },
  { label: "Settings" },
  { label: "Subscription" },
  { label: "Manage Plan" },
  { label: "Are you sure?" },
  { label: "Special offer", trap: { label: "Retention", tone: "amber" } },
  { label: "Are you REALLY sure?" },
  { label: "Retention offer", trap: { label: "Confirmshaming", tone: "red" } },
  { label: "Final confirmation" },
];

// ─── Console Events ───────────────────────────────────────────────────────────

export const CONSOLE_EVENTS = [
  { stage: "PERCEIVE", label: "Page structure analyzed", state: "done" },
  { stage: "DETECT", label: "Roach Motel detected", state: "done" },
  { stage: "DETECT", label: "Confirmshaming detected", state: "done" },
  { stage: "EXPLAIN", label: "Evidence assembled", state: "done" },
  { stage: "PLAN", label: "Cancellation path identified", state: "active" },
  { stage: "APPROVE", label: "Awaiting user approval", state: "todo" },
  { stage: "ACT", label: "Final cancellation action", state: "todo" },
  { stage: "VERIFY", label: "Outcome verification", state: "todo" },
] as const;

// ─── Brand ────────────────────────────────────────────────────────────────────

export const BRAND_NAME = "TrapKiller";
export const BRAND_TAGLINE = "Don't Let the Interface Decide for You.";
export const BRAND_DESCRIPTOR = "AI Consumer Protection Agent";
