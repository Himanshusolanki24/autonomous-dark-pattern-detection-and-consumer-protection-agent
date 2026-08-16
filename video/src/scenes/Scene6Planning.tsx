import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { AgentConsole } from "../components/AgentConsole";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp } from "../lib/anim";

function DecisionCard({ opacity, translateY }: { opacity: number; translateY: number }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "24px 28px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#eff4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z" stroke="#2563eb" strokeWidth="1.3"/>
            <path d="M8 5v4l2.5 1.5" stroke="#2563eb" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: COLORS.foreground, margin: 0, fontFamily: FONTS.sans }}>
            Agent Decision
          </h4>
          <p style={{ fontSize: 10, color: COLORS.muted, margin: 0, fontFamily: FONTS.sans }}>
            Decision summary · not raw reasoning
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0, borderTop: `1px solid ${COLORS.border}` }}>
        {[
          { label: "GOAL", value: "Cancel Premium subscription", highlight: false },
          { label: "CURRENT STATE", value: "Retention offer detected", highlight: false },
          { label: "DECISION", value: "Continue toward cancellation", highlight: false },
          { label: "NEXT ACTION", value: "Open subscription settings →", highlight: true },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 20,
              padding: "12px 0",
              borderBottom: i < 3 ? `1px solid ${COLORS.border}` : "none",
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: COLORS.muted,
                flexShrink: 0,
                fontFamily: FONTS.sans,
                marginTop: 2,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontSize: 13,
                fontWeight: row.highlight ? 600 : 400,
                color: row.highlight ? COLORS.brand : COLORS.foreground,
                textAlign: "right",
                fontFamily: FONTS.sans,
              }}
            >
              {row.value}
            </span>
          </div>
        ))}

        {/* Safety note */}
        <div
          style={{
            marginTop: 12,
            background: COLORS.successSoft,
            borderRadius: 8,
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1.5L2 4v5c0 2.8 2 5.4 5 6 3-0.6 5-3.2 5-6V4L7 1.5z" fill="#16a34a" fillOpacity="0.2" stroke="#16a34a" strokeWidth="1.2"/>
            <path d="M4.5 7l2 2 3-3" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 11, color: COLORS.successText, fontWeight: 500, fontFamily: FONTS.sans }}>
            Next action is reversible and safe to execute.
          </span>
        </div>
      </div>
    </div>
  );
}

function ActionPlan({ opacity, translateY }: { opacity: number; translateY: number }) {
  const steps = [
    { step: "1", action: "Navigate to Account Settings", status: "ready" },
    { step: "2", action: "Locate Subscription section", status: "ready" },
    { step: "3", action: "Click 'Manage Plan'", status: "ready" },
    { step: "4", action: "Click 'Cancel Subscription'", status: "ready" },
    { step: "5", action: "Handle retention offer", status: "ready" },
    { step: "6", action: "Confirm cancellation", status: "approval-required" },
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "20px 24px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 16, fontFamily: FONTS.sans }}>
        Execution Plan
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {steps.map((step, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: step.status === "approval-required" ? "#fef3c7" : "#eff4ff",
                border: `1px solid ${step.status === "approval-required" ? "#fbbf24" : "#bfdbfe"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 9,
                fontWeight: 700,
                color: step.status === "approval-required" ? "#d97706" : COLORS.brand,
                fontFamily: FONTS.sans,
              }}
            >
              {step.step}
            </div>
            <span style={{ fontSize: 12, color: COLORS.foreground, fontFamily: FONTS.sans }}>
              {step.action}
            </span>
            {step.status === "approval-required" && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#d97706",
                  background: "#fef3c7",
                  border: "1px solid #fbbf24",
                  borderRadius: 999,
                  padding: "2px 7px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontFamily: FONTS.sans,
                }}
              >
                Approval Required
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Scene6Planning() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1In = fps * 0.4;
  const card2In = fps * 2;
  const consoleIn = fps * 0.3;

  const card1Opacity = fadeIn(frame, card1In, 18);
  const card1Y = slideUp(frame, card1In);
  const card2Opacity = fadeIn(frame, card2In, 18);
  const card2Y = slideUp(frame, card2In);

  const consoleEntries = [
    { icon: "check" as const, label: "Dark patterns catalogued", sub: "2 patterns, high risk" },
    { icon: "check" as const, label: "Cancellation path identified" },
    { icon: "check" as const, label: "Action plan generated", sub: "6 steps" },
    { icon: "info"  as const, label: "Navigating to subscription settings…", active: true },
  ];
  const visibleConsole = Math.min(Math.floor(Math.max(0, frame - consoleIn) / (fps * 0.7)) + 1, consoleEntries.length);

  return (
    <SceneWrapper background={COLORS.bg}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          gap: 32,
          padding: "52px 72px",
        }}
      >
        {/* Left: cards */}
        <div style={{ flex: "0 0 820px", display: "flex", flexDirection: "column", gap: 20 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.muted,
              fontFamily: FONTS.sans,
              opacity: fadeIn(frame, 0, 12),
            }}
          >
            Stage 3 · Planning
          </p>
          <DecisionCard opacity={card1Opacity} translateY={card1Y} />
          <ActionPlan opacity={card2Opacity} translateY={card2Y} />
        </div>

        {/* Right: console */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: fadeIn(frame, consoleIn, 16),
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.muted,
              fontFamily: FONTS.sans,
            }}
          >
            Planning Agent
          </p>
          <AgentConsole
            title="Planning Agent"
            accentColor="#7c3aed"
            logs={consoleEntries.slice(0, visibleConsole)}
          />
        </div>
      </div>
    </SceneWrapper>
  );
}
