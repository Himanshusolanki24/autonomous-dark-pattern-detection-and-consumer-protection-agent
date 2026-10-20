"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Bot,
  Brain,
  Camera,
  Check,
  FileText,
  Globe,
  GripVertical,
  Hand,
  RotateCcw,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Owner = "TinyFish" | "TrapKiller AI" | "You";

interface MapNode {
  title: string;
  owner: Owner;
  line: string;
  sub: string;
  port: string;
  icon: LucideIcon;
}

// Left: what feeds the agent. Right: what the agent produces, in order.
const INPUTS: MapNode[] = [
  { title: "Search", owner: "TinyFish", line: "“StreamVault cancel”", sub: "Finds the account and cancel pages", port: "pages", icon: Search },
  { title: "Fetch", owner: "TinyFish", line: "Clean page text", sub: "JS rendered · 10 pages per call", port: "text", icon: FileText },
  { title: "Browser", owner: "TinyFish", line: "Cloud Chrome over CDP", sub: "Sees buttons the way you do", port: "browser", icon: Globe },
  { title: "AI detector", owner: "TrapKiller AI", line: "Neural model + rules", sub: "13 dark patterns · 94% held-out", port: "findings", icon: Brain },
];

const ROWS = ["Pages to check", "Page text", "Live browser", "Trap findings"];

const OUTPUTS: MapNode[] = [
  { title: "Verdict", owner: "TrapKiller AI", line: "High risk · 3 traps", sub: "Every finding quotes the page", port: "", icon: ShieldAlert },
  { title: "Web Agent", owner: "TinyFish", line: "Walks the cancel flow", sub: "Declines offers, stops before confirm", port: "", icon: Bot },
  { title: "Your approval", owner: "You", line: "Approve or Reject", sub: "Nothing irreversible without you", port: "", icon: Hand },
  { title: "Proof", owner: "TrapKiller AI", line: "Screenshot + run IDs", sub: "Saved for disputes and complaints", port: "", icon: Camera },
];

// One sentence per step, so anyone watching can follow along.
const NARRATION = [
  "You type a service name. TinyFish Search finds its account and cancellation pages.",
  "TinyFish Fetch reads each page as clean text, including text the screen hides.",
  "A TinyFish cloud browser opens the live page, so the agent sees real buttons and links.",
  "Our AI checks every sentence and button against 13 dark patterns and keeps the exact quote as evidence.",
  "You get a verdict you can check: how risky the page is, and the words that prove each trap.",
  "The TinyFish Web Agent walks the cancel flow, declines every retention offer, and stops before the final confirm.",
  "Nothing irreversible happens until you press Approve. Reject, and the subscription is left untouched.",
  "The result, a screenshot and the TinyFish run IDs are saved as proof.",
];

const STEPS = NARRATION.length;
const STEP_MS = 1700;

// Canvas geometry (px). Ports sit on card edges; wires are drawn between them.
const W = 1100;
const H = 560;
const CARD_W = 250;
const CARD_H = 112;
const COL_Y = [24, 158, 292, 426];
const LEFT_X = 24;
const CENTER = { x: 425, y: 118, w: 250 };
const ROW_Y = [194, 252, 310, 368];
const RIGHT_X = W - 24 - CARD_W;

function wire(x1: number, y1: number, x2: number, y2: number) {
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
}

const OWNER_TONE: Record<Owner, string> = {
  TinyFish: "bg-[#ff7a45]/15 text-[#ff9a6e]",
  "TrapKiller AI": "bg-marker/15 text-marker",
  You: "bg-emerald-400/15 text-emerald-300",
};

function OwnerChip({ owner }: { owner: Owner }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-[10.5px] font-semibold", OWNER_TONE[owner])}>{owner}</span>;
}

function Port({ x, y, on }: { x: number; y: number; on: boolean }) {
  return (
    <span
      className={cn(
        "absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors duration-500",
        on ? "border-marker bg-marker shadow-[0_0_12px_rgba(255,225,90,0.6)]" : "border-[#0e1220] bg-white/80"
      )}
      style={{ left: x, top: y }}
      aria-hidden="true"
    />
  );
}

function NodeCard({ node, x, y, on, waiting }: { node: MapNode; x: number; y: number; on: boolean; waiting?: boolean }) {
  const Icon = node.icon;
  return (
    <div
      className={cn(
        "absolute rounded-2xl border bg-[#161b2b] p-4 transition-all duration-500",
        on ? "border-marker/50 opacity-100" : waiting ? "border-white/5 opacity-45" : "border-white/10 opacity-90"
      )}
      style={{ left: x, top: y, width: CARD_W, height: CARD_H }}
    >
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", on ? "text-marker" : "text-white/70")} aria-hidden="true" />
        <p className="whitespace-nowrap text-[14px] font-semibold text-white">{node.title}</p>
        <OwnerChip owner={node.owner} />
        <GripVertical className="ml-auto h-3.5 w-3.5 text-white/20" aria-hidden="true" />
      </div>
      <p className="mt-2 truncate font-mono text-[12px] text-white/85">{node.line}</p>
      <p className="mt-0.5 truncate text-[11.5px] text-white/45">{node.sub}</p>
      {node.port ? (
        <p className="absolute bottom-3 right-6 text-[11.5px] text-white/50">{node.port}</p>
      ) : (
        <p className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[11.5px] text-white/45">
          <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-marker" : "bg-white/30")} />
          {on ? "Done" : "Waiting for the agent"}
        </p>
      )}
    </div>
  );
}

export function SystemMap() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduced = useReducedMotion();
  const [played, setPlayed] = useState(0); // number of steps already lit
  // With reduced motion, show the finished picture and never animate.
  const step = reduced ? STEPS : played;

  // Plays once when scrolled into view, holds the finished picture, then loops.
  useEffect(() => {
    if (reduced || !inView) return;
    const t = setTimeout(() => setPlayed((s) => (s >= STEPS ? 0 : s + 1)), played >= STEPS ? STEP_MS * 3 : STEP_MS);
    return () => clearTimeout(t);
  }, [inView, played, reduced]);

  const filled = Math.min(step, 4);
  const current = Math.max(0, Math.min(step, STEPS) - 1);

  return (
    <section id="system" className="scroll-mt-8 bg-[#0e1220] text-white" aria-labelledby="system-title">
      <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8">
        <h2 id="system-title" className="max-w-2xl text-[34px] font-bold leading-tight sm:text-[40px]">
          How the system fits together
        </h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/65">
          TinyFish gives the agent the live web. TrapKiller&rsquo;s AI decides what is a trap. You make the final
          call.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-[12.5px] text-white/60">
          {(["TinyFish", "TrapKiller AI", "You"] as Owner[]).map((o) => (
            <span key={o} className="flex items-center gap-2">
              <OwnerChip owner={o} />
              {o === "TinyFish" ? "Search, Fetch, Browser, Web Agent" : o === "You" ? "The human in the loop" : "Our models and safety rules"}
            </span>
          ))}
        </div>

        <div ref={ref}>
          {/* Desktop: the node graph */}
          <div className="mt-10 hidden overflow-x-auto lg:block">
            <div
              className="relative mx-auto rounded-2xl border border-white/10"
              style={{
                width: W,
                height: H,
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "112px 134px",
              }}
            >
              <svg className="pointer-events-none absolute inset-0" width={W} height={H} aria-hidden="true">
                {INPUTS.map((_, i) => {
                  const d = wire(LEFT_X + CARD_W, COL_Y[i] + CARD_H - 22, CENTER.x, ROW_Y[i]);
                  return (
                    <g key={`in${i}`}>
                      <path d={d} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeDasharray="4 5" />
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#ffe15a"
                        strokeWidth={2.5}
                        initial={false}
                        animate={{ pathLength: step > i ? 1 : 0, opacity: step > i ? 1 : 0 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                      />
                    </g>
                  );
                })}
                {OUTPUTS.map((_, i) => {
                  const d = wire(CENTER.x + CENTER.w, ROW_Y[i], RIGHT_X, COL_Y[i] + 22);
                  const on = step > 4 + i;
                  return (
                    <g key={`out${i}`}>
                      <path d={d} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1.5} strokeDasharray="4 5" />
                      <motion.path
                        d={d}
                        fill="none"
                        stroke="#ffe15a"
                        strokeWidth={2.5}
                        initial={false}
                        animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
                        transition={{ duration: 0.7, ease: "easeInOut" }}
                      />
                    </g>
                  );
                })}
              </svg>

              {INPUTS.map((n, i) => (
                <NodeCard key={n.title} node={n} x={LEFT_X} y={COL_Y[i]} on={step > i} />
              ))}
              {OUTPUTS.map((n, i) => (
                <NodeCard key={n.title} node={n} x={RIGHT_X} y={COL_Y[i]} on={step > 4 + i} waiting={step <= 4 + i} />
              ))}

              {/* Centre: the agent, filling up as its inputs arrive */}
              <div
                className={cn(
                  "absolute rounded-2xl border bg-[#1b2133] p-2 transition-colors duration-500",
                  filled === 4 ? "border-marker/60" : "border-white/15"
                )}
                style={{ left: CENTER.x, top: CENTER.y, width: CENTER.w, height: 324 }}
              >
                <div className="flex items-center gap-2 px-3 pt-2">
                  <ShieldAlert className="h-4 w-4 text-marker" aria-hidden="true" />
                  <p className="text-[15px] font-bold">TrapKiller agent</p>
                  <span className="text-[11.5px] text-white/45">LangGraph</span>
                </div>
                <div className="mt-3 rounded-xl bg-[#0e1220]/70 py-1">
                  {ROWS.map((r, i) => (
                    <div key={r} className="flex h-[58px] items-center justify-between px-5 text-[14px]">
                      <span className={step > i ? "text-white" : "text-white/45"}>{r}</span>
                      {step > i && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
                          <Check className="h-4 w-4 text-marker" strokeWidth={3} aria-hidden="true" />
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-3 flex items-center gap-2 px-3 text-[12px] text-white/55">
                  <span className={cn("h-1.5 w-1.5 rounded-full", filled === 4 ? "bg-marker" : "bg-white/40")} />
                  {filled === 4 ? "All inputs ready · 4/4" : `Awaiting inputs · ${filled}/4`}
                </p>
              </div>

              {INPUTS.map((_, i) => (
                <Port key={`pi${i}`} x={LEFT_X + CARD_W} y={COL_Y[i] + CARD_H - 22} on={step > i} />
              ))}
              {ROWS.map((_, i) => (
                <Port key={`ci${i}`} x={CENTER.x} y={ROW_Y[i]} on={step > i} />
              ))}
              {ROWS.map((_, i) => (
                <Port key={`co${i}`} x={CENTER.x + CENTER.w} y={ROW_Y[i]} on={step > 4 + i} />
              ))}
              {OUTPUTS.map((_, i) => (
                <Port key={`po${i}`} x={RIGHT_X} y={COL_Y[i] + 22} on={step > 4 + i} />
              ))}
            </div>
          </div>

          {/* Phones and tablets: the same steps as a list */}
          <ol className="mt-10 space-y-3 lg:hidden">
            {[...INPUTS, ...OUTPUTS].map((n, i) => {
              const Icon = n.icon;
              return (
                <li key={n.title} className={cn("flex gap-3 rounded-2xl border p-4 transition-colors", step > i ? "border-marker/40 bg-[#161b2b]" : "border-white/10 bg-[#161b2b]/60")}>
                  <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", step > i ? "bg-marker text-[#0e1220]" : "bg-white/10 text-white/70")}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold">
                      {i + 1}. {n.title} <OwnerChip owner={n.owner} />
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-white/65">{NARRATION[i]}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Narration: one plain sentence for the step that just lit up */}
          <div className="mt-6 hidden items-start justify-between gap-6 lg:flex">
            <p className="max-w-3xl text-[16px] leading-relaxed text-white/85" aria-live="polite">
              <span className="mr-3 font-mono text-[13px] text-marker">
                {step === 0 ? "0" : Math.min(step, STEPS)}/{STEPS}
              </span>
              {step === 0 ? "Watch one scan and cancellation go through the system." : NARRATION[current]}
            </p>
            <button
              type="button"
              onClick={() => setPlayed(0)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[13px] text-white/75 hover:border-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Replay
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
