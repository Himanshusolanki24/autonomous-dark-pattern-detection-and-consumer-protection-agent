export type AgentId =
  | "perception"
  | "detection"
  | "planning"
  | "action"
  | "verification";

export type AgentStatus = "idle" | "running" | "completed" | "blocked" | "failed";

export type StageState = "idle" | "running" | "completed" | "blocked" | "failed";

export type EventStatus = "running" | "success" | "warning" | "error";

export type Severity = "low" | "medium" | "high" | "critical";

export type TaskStatus =
  | "waiting"
  | "running"
  | "approval"
  | "completed"
  | "failed"
  | "blocked";

export type PatternType =
  | "confirmshaming"
  | "roach-motel"
  | "forced-continuity"
  | "drip-pricing"
  | "basket-sneaking"
  | "misdirection"
  | "hard-to-cancel";

export type BrowserScreen =
  | "plans"
  | "account"
  | "cancel"
  | "retention"
  | "confirm"
  | "success"
  | "empty";

export interface AgentEvent {
  id: string;
  timestamp: string;
  agent: AgentId;
  message: string;
  status: EventStatus;
  metadata?: Record<string, string | number | boolean>;
}

export interface DarkPattern {
  id: string;
  type: PatternType;
  severity: Severity;
  confidence: number;
  element: string;
  explanation: string;
  whyItMatters: string;
}

export interface CancellationTask {
  id: string;
  service: string;
  plan: string;
  price: string;
  domain: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
  patternCount: number;
}

export interface AgentDecision {
  goal: string;
  currentState: string;
  nextAction: string;
  reason: string;
  safe: boolean;
}

export interface BrowserState {
  url: string;
  title: string;
  screen: BrowserScreen;
}

export interface VerificationResult {
  service: string;
  plan: string;
  status: string;
  timestamp: string;
  method: string;
  proofId: string;
}

export interface ActivityRecord {
  id: string;
  timestamp: string;
  agent: AgentId;
  event: string;
  website: string;
  status: "success" | "warning" | "error" | "verified";
}

export interface RiskOverview {
  overall: Severity;
  totalPatterns: number;
  critical: number;
  warnings: number;
}