"use client";

import { useAgentStore } from "@/stores/agent-store";
import type {
  AgentEvent,
  AgentId,
  BrowserState,
  CancellationTask,
  DarkPattern,
  EventStatus,
  StageState,
} from "@/lib/types";
import { DEMO_SERVICE } from "@/lib/constants";
import { nowIso, uid } from "@/lib/utils";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function makeEvent(
  agent: AgentId,
  message: string,
  status: EventStatus,
  metadata?: AgentEvent["metadata"]
): AgentEvent {
  return { id: uid(), timestamp: nowIso(), agent, message, status, metadata };
}

const patterns: DarkPattern[] = [
  {
    id: "pat_roach",
    type: "roach-motel",
    severity: "high",
    confidence: 91,
    element: "Cancellation flow",
    explanation:
      "The user can enter the cancellation process easily, but the exit path is intentionally difficult to locate.",
    whyItMatters:
      "Roach motels make it trivial to get in but hard to leave. A subscription you cannot cancel is effectively not yours.",
  },
  {
    id: "pat_confirm",
    type: "confirmshaming",
    severity: "high",
    confidence: 94,
    element: "Cancellation option",
    explanation:
      "The cancellation option uses guilt-inducing language to discourage the user from declining the offer.",
    whyItMatters:
      "Confirmshaming uses shame to pressure you into a choice you didn't intend to make.",
  },
  {
    id: "pat_retention",
    type: "hard-to-cancel",
    severity: "medium",
    confidence: 87,
    element: "Retention offer step",
    explanation:
      "A forced retention offer interrupts the cancellation flow and attempts to reverse the user's decision.",
    whyItMatters:
      "Forced retention offers add friction designed to wear you down. The agent navigates them so you don't have to.",
  },
];

interface SimStep {
  delayMs: number;
  run: () => Promise<void> | void;
}

export class DemoSimulator {
  private steps: SimStep[] = [];
  private index = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private remaining = 0;
  private running = false;
  private paused = false;

  onFinish: (() => void) | null = null;

  isRunning() {
    return this.running;
  }
  isPaused() {
    return this.paused;
  }

  private store() {
    return useAgentStore.getState();
  }

  private stage(agent: AgentId, state: StageState) {
    this.store().setStage(agent, state);
  }

  private event(event: AgentEvent) {
    this.store().addEvent(event);
  }

  private browser(browser: BrowserState) {
    this.store().setBrowser(browser);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  start(task: CancellationTask) {
    this.stop();
    this.steps = this.buildSteps(task);
    this.index = 0;
    this.running = true;
    this.paused = false;
    this.store().startSession(task);
    this.scheduleNext();
  }

  pause() {
    if (!this.running || this.paused) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      this.remaining = Math.max(this.steps[this.index]?.delayMs ?? 0, 50);
    }
    this.paused = true;
  }

  resume() {
    if (!this.running || !this.paused) return;
    this.paused = false;
    this.scheduleNext();
  }

  stop() {
    this.clearTimer();
    this.running = false;
    this.paused = false;
    this.index = 0;
    this.remaining = 0;
  }

  reset() {
    this.stop();
    this.store().resetSession();
  }

  skipToApproval() {
    const idx = this.steps.findIndex((s) => s.delayMs < 0);
    if (idx === -1) return;
    this.clearTimer();
    this.index = idx;
    this.remaining = 0;
    this.paused = false;
    this.running = true;
    this.scheduleNext();
  }

  async approve() {
    const s = this.store();
    if (!s.approvalRequired) return;
    s.setApprovalRequired(false);
    s.setStatus("running");
    this.scheduleNext();
  }

  stopAgent() {
    this.stop();
    this.store().setStatus("failed");
    this.store().setStage("action", "failed");
    this.event(
      makeEvent("action", "Agent stopped by user — no action submitted", "error")
    );
  }

  private scheduleNext() {
    if (!this.running || this.paused) return;
    if (this.index >= this.steps.length) {
      this.running = false;
      this.onFinish?.();
      return;
    }
    const step = this.steps[this.index];
    this.index += 1;
    this.timer = setTimeout(async () => {
      this.timer = null;
      try {
        await step.run();
      } catch {
        /* step errors are swallowed; the run loop continues */
      }
      if (this.running && !this.paused) {
        this.scheduleNext();
      }
    }, this.remaining || step.delayMs);
    this.remaining = 0;
  }

  private buildSteps(task: CancellationTask): SimStep[] {
    const { url } = DEMO_SERVICE;
    return [
      // 1. Start — perception begins
      { delayMs: 400, run: () => this.stage("perception", "running") },

      {
        delayMs: 1600,
        run: () => {
          this.stage("perception", "completed");
          this.event(
            makeEvent("perception", "Connected to authenticated session", "success", {
              session: "secure",
            })
          );
          this.event(makeEvent("perception", "Analyzed current webpage", "success", { url }));
        },
      },

      // 2. Detection
      {
        delayMs: 700,
        run: () => {
          this.stage("detection", "running");
          this.event(makeEvent("detection", "Scanning for dark patterns", "running"));
        },
      },

      {
        delayMs: 1800,
        run: () => {
          this.store().setPatterns([patterns[0]]);
          this.stage("detection", "completed");
          this.event(
            makeEvent("detection", "Detected ROACH MOTEL", "warning", {
              confidence: 91,
              severity: "high",
            })
          );
          this.event(
            makeEvent("detection", "Detected CONFIRMSHAMING", "warning", {
              confidence: 94,
              severity: "high",
            })
          );
        },
      },

      // 3. Planning
      {
        delayMs: 800,
        run: () => {
          this.stage("planning", "running");
          this.event(makeEvent("planning", "Determined next action", "running"));
        },
      },

      {
        delayMs: 1800,
        run: () => {
          this.stage("planning", "completed");
          this.store().setDecision({
            goal: "Cancel subscription",
            currentState: "Account settings reached",
            nextAction: "Open Manage Subscription",
            reason:
              "The account settings page contains the cancellation entry point required to proceed.",
            safe: true,
          });
          this.event(makeEvent("planning", "Next action: Open Account Settings", "success"));
        },
      },

      // 4. Action — navigate
      {
        delayMs: 700,
        run: () => {
          this.stage("action", "running");
          this.browser({
            url: "https://www.netflix.com/account",
            title: "Account",
            screen: "account",
          });
          this.event(
            makeEvent("action", "Opened Account Settings", "success", {
              url: "netflix.com/account",
            })
          );
        },
      },

      {
        delayMs: 1600,
        run: () => {
          this.browser({
            url: "https://www.netflix.com/account",
            title: "Cancel Membership",
            screen: "cancel",
          });
          this.event(makeEvent("action", 'Clicked "Manage Subscription"', "success"));
          this.event(makeEvent("action", "Located cancellation entry point", "success"));
        },
      },

      // 5. Retention trap
      {
        delayMs: 1400,
        run: () => {
          this.store().setPatterns([...patterns]);
          this.browser({
            url: "https://www.netflix.com/account",
            title: "Wait, keep your membership",
            screen: "retention",
          });
          this.event(makeEvent("detection", "Detected retention offer", "warning", { confidence: 87 }));
        },
      },

      {
        delayMs: 1600,
        run: () => {
          this.stage("detection", "completed");
          this.stage("planning", "completed");
          this.store().setDecision({
            goal: "Cancel subscription",
            currentState: "Retention offer displayed",
            nextAction: "Select cancellation option",
            reason:
              "The current page contains a retention step and the cancellation path remains available.",
            safe: true,
          });
          this.event(makeEvent("planning", "Continuing cancellation flow", "success"));
        },
      },

      // 6. Reach final confirmation
      {
        delayMs: 1400,
        run: () => {
          this.browser({
            url: "https://www.netflix.com/account",
            title: "Cancel Membership",
            screen: "confirm",
          });
          this.event(makeEvent("action", "Navigated to final confirmation", "success"));
          this.event(
            makeEvent("planning", "Marked next action irreversible", "warning", {
              reversible: false,
            })
          );
        },
      },

      // 7. Approval required (delayMs < 0 marks the approval gate)
      {
        delayMs: -1,
        run: () => {
          this.store().setStatus("blocked");
          this.store().setApprovalRequired(true);
          this.event(makeEvent("verification", "Awaiting human approval", "warning"));
        },
      },

      // 8. Post-approval: execute + verify
      {
        delayMs: 700,
        run: () => {
          this.stage("action", "completed");
          this.stage("verification", "running");
          this.event(makeEvent("action", "Submitted cancellation request", "success"));
        },
      },

      {
        delayMs: 2000,
        run: () => {
          this.stage("verification", "completed");
          this.browser({
            url: "https://www.netflix.com/account",
            title: "Membership Cancelled",
            screen: "success",
          });
          this.store().setVerification({
            service: task.service,
            plan: task.plan,
            status: "Cancellation verified",
            timestamp: nowIso(),
            method: "Cancellation confirmation page + email header check",
            proofId: "proof_7f3a9c21",
          });
          this.store().setStatus("completed");
          this.event(
            makeEvent("verification", "Cancellation verified", "success", {
              method: "confirmation page",
            })
          );
          this.event(
            makeEvent("verification", "Proof screenshot captured", "success", {
              proof: "proof_7f3a9c21",
            })
          );
        },
      },
    ];
  }
}

export const demoSimulator = new DemoSimulator();
export { delay };