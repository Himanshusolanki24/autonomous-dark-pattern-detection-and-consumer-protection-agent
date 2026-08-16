import {
  Eye,
  ScanSearch,
  Map,
  MousePointerClick,
  BadgeCheck,
  ShieldCheck,
  Landmark,
  UserCheck,
  CameraOff,
  type LucideIcon,
} from "lucide-react";

export interface PipelineStage {
  id: string;
  index: number;
  label: string;
  icon: LucideIcon;
  summary: string;
  detail: string;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "perceive",
    index: 1,
    label: "Perceive",
    icon: Eye,
    summary: "Reads the current webpage.",
    detail:
      "Analyzes the live DOM structure and rendered interface inside the user's authenticated session.",
  },
  {
    id: "detect",
    index: 2,
    label: "Detect",
    icon: ScanSearch,
    summary: "Identifies manipulative UI patterns.",
    detail:
      "Checks interactive elements against a dark-pattern taxonomy — confirmshaming, roach motels, forced continuity and more.",
  },
  {
    id: "plan",
    index: 3,
    label: "Plan",
    icon: Map,
    summary: "Determines the next action required.",
    detail:
      "Given the user's goal, the agent plans the next step toward it — skipping the traps that would normally derail you.",
  },
  {
    id: "act",
    index: 4,
    label: "Act",
    icon: MousePointerClick,
    summary: "Navigates using browser automation.",
    detail:
      "Performs reversible actions like clicking, typing and navigating through the cancellation flow.",
  },
  {
    id: "verify",
    index: 5,
    label: "Verify",
    icon: BadgeCheck,
    summary: "Confirms the outcome actually happened.",
    detail:
      "Checks the resulting page state and produces evidence of the verified outcome.",
  },
];

export interface DetectionElement {
  id: string;
  label: string;
  risk: "high" | "medium";
  confidence: number;
  explanation: string;
  // Bounding box as % of the browser viewport
  box: { top: number; left: number; width: number; height: number };
}

export const DETECTION_ELEMENTS: DetectionElement[] = [
  {
    id: "confirmshaming",
    label: "Confirmshaming",
    risk: "high",
    confidence: 94,
    explanation:
      "The decline option uses guilt-inducing language to discourage you from continuing.",
    box: { top: 55, left: 14, width: 72, height: 9 },
  },
  {
    id: "roach-motel",
    label: "Roach Motel",
    risk: "high",
    confidence: 91,
    explanation:
      "Entry is straightforward while the exit path is deliberately difficult to locate.",
    box: { top: 72, left: 14, width: 72, height: 6 },
  },
  {
    id: "misdirection",
    label: "Misdirection",
    risk: "medium",
    confidence: 58,
    explanation:
      "The primary action is visually de-emphasised so the user misses it entirely.",
    box: { top: 84, left: 14, width: 72, height: 5 },
  },
];

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

export const TRAP_TAGS = [
  "Confirmshaming",
  "Roach Motel",
  "Forced Continuity",
  "Drip Pricing",
  "Basket Sneaking",
] as const;

export const CONSOLE_EVENTS = [
  { stage: "PERCEPTION", label: "Page structure analyzed", state: "done" },
  { stage: "DETECTION", label: "Roach Motel detected", state: "done" },
  { stage: "PLANNING", label: "Cancellation path identified", state: "done" },
  { stage: "ACTION", label: "Navigating to subscription settings", state: "active" },
  { stage: "DETECTION", label: "Retention offer detected", state: "todo" },
  { stage: "PLANNING", label: "Continuing toward cancellation", state: "todo" },
  { stage: "APPROVAL", label: "Final cancellation action", state: "todo" },
] as const;

export const PRIVACY_ITEMS = [
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

export const ROADMAP = [
  {
    phase: "Now",
    items: ["2–3 target applications", "Human-confirmed cancellation", "Live dark-pattern detection"],
  },
  {
    phase: "Next",
    items: ["Browser extension", "Trial-expiry alerts", "More platforms"],
  },
  {
    phase: "Later",
    items: ["Community pattern library", "Price negotiation", "B2B compliance monitoring"],
  },
] as const;

export const BRAND_TAGLINE =
  "The web is designed to trap you. Your AI agent fights back.";

export const LANDING_NAV = [
  { href: "#how-it-works", label: "How It Works" },
  { href: "#detection", label: "Detection" },
  { href: "#agent", label: "Agent" },
  { href: "#safety", label: "Safety" },
  { href: "/demo", label: "Demo" },
] as const;