"use client";

import { create } from "zustand";
import type {
  AgentDecision,
  AgentEvent,
  AgentId,
  AgentStatus,
  BrowserState,
  CancellationTask,
  DarkPattern,
  StageState,
  VerificationResult,
} from "@/lib/types";

export interface AgentSession {
  task: CancellationTask | null;
  status: AgentStatus;
  stageStates: Record<AgentId, StageState>;
  events: AgentEvent[];
  decision: AgentDecision | null;
  patterns: DarkPattern[];
  browser: BrowserState;
  approvalRequired: boolean;
  verification: VerificationResult | null;
  live: boolean;
}

const initialBrowser: BrowserState = {
  url: "https://www.netflix.com/browse",
  title: "Netflix",
  screen: "plans",
};

const initialStages: Record<AgentId, StageState> = {
  perception: "idle",
  detection: "idle",
  planning: "idle",
  action: "idle",
  verification: "idle",
};

interface AgentStore extends AgentSession {
  startSession: (task: CancellationTask) => void;
  resetSession: () => void;
  setStatus: (status: AgentStatus) => void;
  setStage: (agent: AgentId, state: StageState) => void;
  addEvent: (event: AgentEvent) => void;
  setDecision: (decision: AgentDecision | null) => void;
  setPatterns: (patterns: DarkPattern[]) => void;
  setBrowser: (browser: BrowserState) => void;
  setApprovalRequired: (required: boolean) => void;
  setVerification: (verification: VerificationResult | null) => void;
  setLive: (live: boolean) => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  task: null,
  status: "idle",
  stageStates: initialStages,
  events: [],
  decision: null,
  patterns: [],
  browser: initialBrowser,
  approvalRequired: false,
  verification: null,
  live: false,

  startSession: (task) =>
    set({
      task,
      status: "running",
      stageStates: initialStages,
      events: [],
      decision: null,
      patterns: [],
      browser: initialBrowser,
      approvalRequired: false,
      verification: null,
      live: false,
    }),

  resetSession: () =>
    set({
      task: null,
      status: "idle",
      stageStates: initialStages,
      events: [],
      decision: null,
      patterns: [],
      browser: initialBrowser,
      approvalRequired: false,
      verification: null,
      live: false,
    }),

  setStatus: (status) => set({ status }),
  setStage: (agent, state) =>
    set((s) => ({ stageStates: { ...s.stageStates, [agent]: state } })),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  setDecision: (decision) => set({ decision }),
  setPatterns: (patterns) => set({ patterns }),
  setBrowser: (browser) => set({ browser }),
  setApprovalRequired: (required) => set({ approvalRequired: required }),
  setVerification: (verification) => set({ verification }),
  setLive: (live) => set({ live }),
}));