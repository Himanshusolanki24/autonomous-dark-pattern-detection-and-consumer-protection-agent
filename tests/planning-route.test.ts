import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AgentState } from "@/server/agent/state";
import type { RuntimeContext } from "@/server/agent/graph";

// A page whose only button matches none of the planner's keyword rules, so the
// decision can only come from the path map.
const el = (text: string) => ({ role: "button", text, tagName: "button", visible: true, box: { x: 0, y: 0, width: 10, height: 10 } });
const route = vi.hoisted(() => ({ current: null as { clicks: string[]; steps: number } | null }));

vi.mock("@/server/browser/perception", () => ({
  perceive: async () => ({
    url: "https://shop.test/leave",
    title: "Leave",
    visibleText: "Finish to end your plan.",
    elements: [el("Finish"), el("Stay with us")],
    pageState: "confirmation",
  }),
}));
vi.mock("@/server/graph/neo4j", () => ({
  LEARNED_THRESHOLD: 0.4,
  learnedSteps: async () => new Map<string, number>(),
  routeToSuccess: async () => route.current,
}));
vi.mock("@/server/agent/events", () => ({ emitEvent: async () => {} }));
vi.mock("@/server/llm/client", () => ({ chatStructured: async () => null }));

import { planNode } from "@/server/agent/agents/planning";

const state = (over: Partial<AgentState> = {}) =>
  ({ sessionId: "s", userId: "u", goal: "cancel_subscription", targetUrl: "https://shop.test/leave", status: "running", actionCount: 1, ...over }) as AgentState;
const ctx = { browser: { page: {} }, supabase: {} } as unknown as RuntimeContext;

describe("planNode with the path map", () => {
  beforeEach(() => {
    route.current = null;
  });

  it("asks for approval when the next click lands on the cancelled page", async () => {
    route.current = { clicks: ["finish"], steps: 1 };
    const out = await planNode(state(), ctx);
    expect(out.pendingFinalAction?.target).toBe("Finish");
    expect(out.lastAction).toBeUndefined();
  });

  it("clicks straight away once a human has approved", async () => {
    route.current = { clicks: ["finish"], steps: 1 };
    const out = await planNode(state({ resumeApproval: "approved" }), ctx);
    expect(out.lastAction?.target).toBe("Finish");
    expect(out.pendingFinalAction).toBeUndefined();
  });

  it("follows the route without approval while the cancelled page is further away", async () => {
    route.current = { clicks: ["finish", "confirm"], steps: 2 };
    const out = await planNode(state(), ctx);
    expect(out.lastAction?.target).toBe("Finish");
    expect(out.pendingFinalAction).toBeUndefined();
  });

  it("does not click anything when the map has no route", async () => {
    const out = await planNode(state(), ctx);
    expect(out.lastAction?.type).not.toBe("click");
    expect(out.pendingFinalAction).toBeUndefined();
  });
});
