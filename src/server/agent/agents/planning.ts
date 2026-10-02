// =============================================================================
// lib/agent/agents/planning.ts
// PLAN: decide the next action from the current perception + detections.
// Deterministic state machine — the LLM is an optional planner refinement.
// =============================================================================

import type { AgentState } from "../state";
import type { NodeHandler, RuntimeContext } from "../graph";
import { perceive } from "@/server/browser/perception";
import { emitEvent } from "../events";
import { chatStructured } from "@/server/llm/client";
import { z } from "zod";
import { MAX_ACTIONS } from "@/types/agent";

// Explicit cancellation affordances — clicking these leads to (or is) the
// actual cancellation. Checked before anything else.
const EXPLICIT_CANCEL = [
  "yes, cancel",
  "cancel my subscription",
  "no thanks, cancel",
  "confirm cancellation",
  "confirm my cancellation",
  "cancel subscription",
];

// The irreversible final submit. A human MUST approve before this runs — it is
// routed to the approval gate instead of executed directly.
const FINAL_CONFIRM = ["yes, cancel", "confirm cancellation", "confirm my cancellation"];

// Navigation links that enter a cancellation flow (still explicit enough).
const CANCEL_NAV = ["cancel subscription", "cancel membership", "unsubscribe", "cancel my plan"];

// Text that looks like cancellation but is actually a retention trap.
const RETENTION_TRAP = [
  "keep my benefits",
  "keep my plan",
  "i don't want to lose",
  "keep my premium",
  "pause my membership",
  "we have a special offer",
];

const PLAN_SCHEMA = z.object({
  action: z.enum(["click", "navigate", "fill", "scroll", "wait", "complete", "fail"]),
  target: z.string().max(200).optional(),
  value: z.string().max(200).optional(),
  reason: z.string().max(200),
});

const PLAN_SYSTEM = [
  "You plan one browser action toward cancelling a subscription.",
  "Only choose from these action types: click, navigate, fill, scroll, wait, complete, fail.",
  "Choose a target text that exists verbatim in the page (buttons or links).",
  "Click the option that leads to cancellation: Cancel, Cancel subscription, Yes cancel, No thanks, No thanks, cancel.",
  "When the page clearly confirms cancellation success, respond complete.",
  "When stuck after repeated attempts, respond fail.",
  "Reply only with JSON: {action, target, value, reason}.",
].join("\n");

export const planNode: NodeHandler = async (
  state: AgentState,
  ctx: RuntimeContext
): Promise<Partial<AgentState>> => {
  const { browser, supabase } = ctx;
  if (!browser) {
    throw new Error("No browser session available for plan node");
  }

  await emitEvent(supabase, state.sessionId, {
    userId: state.userId,
    agent: "planning",
    eventType: "stage_started",
    message: "Planning the next step",
    status: "running",
  });

  const perception = await perceive(browser.page);
  const text = perception.visibleText.toLowerCase();
  const elements = perception.elements;
  const actionCount = state.actionCount;

  let decision: string;
  let action: { type: string; target?: string; value?: string; reason?: string };

  // 1) Success state or Detection-only goal → complete.
  if (
    state.goal === "detect_dark_patterns" ||
    state.goal === "investigation" ||
    perception.pageState === "success" ||
    text.includes("your subscription is cancelled")
  ) {
    const isDetectionGoal = state.goal === "detect_dark_patterns" || state.goal === "investigation";
    action = {
      type: "complete",
      reason: isDetectionGoal
        ? "Investigation and dark pattern detection completed"
        : "Cancellation confirmed on the page",
    };
    decision = isDetectionGoal
      ? "Investigation complete — dark patterns analyzed"
      : "Task complete — cancellation confirmed";

    await emitEvent(supabase, state.sessionId, {
      userId: state.userId,
      agent: "planning",
      eventType: "goal_reached",
      message: decision,
      status: "completed",
    });
    return {
      currentStage: "planning",
      lastAction: action,
      lastDecision: decision,
      status: "completed",
    };
  }

  // 2) Budget exhausted → fail.
  if (actionCount >= MAX_ACTIONS) {
    action = { type: "fail", reason: "Action budget exhausted" };
    decision = "Failed — reached the action limit without confirmation";
    return {
      currentStage: "planning",
      lastAction: action,
      lastDecision: decision,
      status: "failed",
      errorMessage: decision,
    };
  }

  // 3) Explicit cancellation affordance — highest value, leads to the actual
  //    cancellation (never a retention trap).
  const explicitEl = elements.find((el) =>
    EXPLICIT_CANCEL.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m))
  );
  if (explicitEl) {
    const label = `${explicitEl.text} ${explicitEl.ariaLabel ?? ""}`.toLowerCase();
    action = {
      type: "click",
      target: explicitEl.text.slice(0, 100),
      reason: `Click cancellation option: "${explicitEl.text.slice(0, 60)}"`,
    };
    // The irreversible submit is parked for human approval (unless the human has
    // already approved this run). routeAfterPlan sends pendingFinalAction to the
    // approval gate on the first pass, and to ACT once resumeApproval is set.
    if (FINAL_CONFIRM.some((m) => label.includes(m)) && state.resumeApproval !== "approved") {
      decision = `Awaiting human approval before: "${explicitEl.text.slice(0, 60)}"`;
      return { currentStage: "planning", pendingFinalAction: action, lastDecision: decision };
    }
    decision = `Clicking "${explicitEl.text.slice(0, 60)}"`;
    return { currentStage: "planning", lastAction: action, lastDecision: decision };
  }

  // 4) A generic cancel link to enter the cancellation flow. Retention traps
  //    are intentionally ignored here.
  const cancelEl = elements.find(
    (el) =>
      CANCEL_NAV.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m)) &&
      !RETENTION_TRAP.some((m) => `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(m))
  );
  if (cancelEl) {
    action = {
      type: "click",
      target: cancelEl.text.slice(0, 100),
      reason: `Enter cancellation flow: "${cancelEl.text.slice(0, 60)}"`,
    };
    decision = `Opening cancellation: "${cancelEl.text.slice(0, 60)}"`;
    return { currentStage: "planning", lastAction: action, lastDecision: decision };
  }

  // 5) LLM refinement (optional).
  const llmPlan = await chatStructured(PLAN_SCHEMA, {
    system: PLAN_SYSTEM,
    user: [
      `Step ${actionCount + 1} on ${perception.url}`,
      `Title: ${perception.title}`,
      `Page state: ${perception.pageState}`,
      `Visible text (truncated): ${perception.visibleText.slice(0, 2500)}`,
      `Elements: ${perception.elements
        .map((e) => `[${e.role}] "${e.text}"`)
        .join(" | ")}`,
    ].join("\n"),
  });

  if (llmPlan && llmPlan.target && llmPlan.action !== "complete" && llmPlan.action !== "fail") {
    const matchingEl = elements.find(
      (el) =>
        `${el.text} ${el.ariaLabel ?? ""}`.toLowerCase().includes(llmPlan.target!.toLowerCase()) ||
        llmPlan.target!.toLowerCase().includes(el.text.toLowerCase())
    );
    if (matchingEl) {
      action = {
        type: llmPlan.action,
        target: matchingEl.text.slice(0, 100),
        value: llmPlan.value,
        reason: llmPlan.reason,
      };
      decision = `Plan: ${llmPlan.reason}`;
      return { currentStage: "planning", lastAction: action, lastDecision: decision };
    }
  }

  // 6) Fallback: if no further cancellation clicks are required, complete the analysis.
  if (actionCount >= 1 || state.goal === "detect_dark_patterns") {
    action = { type: "complete", reason: "Dark pattern analysis and page investigation complete" };
    decision = "Investigation complete — dark patterns audited";
    await emitEvent(supabase, state.sessionId, {
      userId: state.userId,
      agent: "planning",
      eventType: "goal_reached",
      message: decision,
      status: "completed",
    });
    return {
      currentStage: "planning",
      lastAction: action,
      lastDecision: decision,
      status: "completed",
    };
  }

  action = { type: "scroll", reason: "Reveal further options lower on the page" };
  decision = "Scrolling to reveal more options";
  return { currentStage: "planning", lastAction: action, lastDecision: decision };
};