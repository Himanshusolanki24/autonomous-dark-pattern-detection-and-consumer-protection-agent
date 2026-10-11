// =============================================================================
// types/agent.ts
// Domain types for the PERCEIVE → DETECT → PLAN → ACT → VERIFY pipeline.
// =============================================================================

import type { PatternType, Severity } from "./database";

export type AgentId = "perception" | "detection" | "planning" | "action" | "verification";

export type AgentGoal = "cancel_subscription";

/** A single interactive element extracted from the live page. */
export interface InteractiveElement {
  role: string;
  text: string;
  tagName: string;
  href?: string;
  ariaLabel?: string;
  visible: boolean;
  /** Position within the viewport (fractional 0..1) — used for overlays. */
  box: { x: number; y: number; width: number; height: number };
}

/** Output of the PERCEPTION agent. */
export interface PerceptionResult {
  url: string;
  title: string;
  /** Bounded, sanitized visible text. Never sent wholesale to the LLM. */
  visibleText: string;
  elements: InteractiveElement[];
  screenshotPath?: string;
  pageState: "initial" | "plan_selection" | "confirmation" | "success" | "unknown";
}

/** A single confirmed dark-pattern detection. */
export interface DarkPatternDetection {
  id?: number;
  patternType: PatternType;
  severity: Severity;
  /** 0..1 */
  confidence: number;
  elementText?: string;
  elementRole?: string;
  explanation: string;
}

/** Output of the DETECTION agent. */
export interface DetectionResult {
  detections: DarkPatternDetection[];
  overallRisk: Severity;
  /** What the knowledge graph contributed (absent when the graph is off). */
  graph?: { prior: number; related: string[] };
}

/** One step the agent may take. Only these tool types are executable. */
export interface AgentAction {
  type: "click" | "navigate" | "fill" | "scroll" | "wait" | "request_approval" | "complete" | "fail";
  target?: string;
  value?: string;
  /** Short decision summary — never internal chain-of-thought. */
  reason: string;
}

/** Output of the VERIFICATION agent. */
export interface VerificationResult {
  success: boolean;
  evidence: string;
  proofScreenshotPath?: string;
}

/** Runtime state persisted to agent_sessions.state so runs can resume. */
export interface AgentGraphState {
  sessionId: string;
  taskId?: string;
  userId: string;
  goal: AgentGoal;
  targetUrl: string;
  currentStage?: AgentId;
  status: "running" | "approval_required" | "completed" | "failed" | "cancelled";
  actionCount: number;
  lastUrl?: string;
  lastPerception?: PerceptionResult;
  lastDetections: DarkPatternDetection[];
  lastDecision?: string;
  lastAction?: AgentAction;
  pendingFinalAction?: AgentAction;
  approvalId?: string;
  errorMessage?: string;
  evidence?: string;
  /** Set on resume after a human approval. */
  resumeApproval?: string;
}

export const MAX_ACTIONS = 25;
export const APPROVAL_TTL_MS = 15 * 60 * 1000; // 15 minutes
export const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes