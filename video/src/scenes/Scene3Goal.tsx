import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { PipelineBar } from "../components/PipelineBar";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp } from "../lib/anim";

function TypedText({ text, frame, startFrame, fps }: { text: string; frame: number; startFrame: number; fps: number }) {
  const charsPerSecond = 18;
  const charsVisible = Math.max(0, Math.floor(((frame - startFrame) / fps) * charsPerSecond));
  const visible = text.slice(0, charsVisible);
  const showCursor = frame > startFrame && charsVisible < text.length + 8;
  return (
    <span>
      {visible}
      {showCursor && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: COLORS.brand,
            marginLeft: 2,
            opacity: Math.sin((frame / 8) * Math.PI) > 0 ? 1 : 0,
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  );
}

export function Scene3Goal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Typing starts at 0.5s
  const typingStart = Math.round(fps * 0.5);
  // Button appears at 2.5s
  const buttonIn = Math.round(fps * 2.5);
  // Pipeline animates from 4s
  const pipelineIn = Math.round(fps * 4);
  // Status changes at 5s
  const statusIn = Math.round(fps * 5);

  const pipelineProgress = Math.max(0, frame - pipelineIn) / fps;

  // Each stage lights up 0.4s apart
  const stages = [
    { label: "Perceive", state: pipelineProgress > 0.6 ? ("done" as const) : pipelineProgress > 0 ? ("active" as const) : ("idle" as const) },
    { label: "Detect",   state: pipelineProgress > 1.0 ? ("done" as const) : pipelineProgress > 0.6 ? ("active" as const) : ("idle" as const) },
    { label: "Plan",     state: pipelineProgress > 1.4 ? ("done" as const) : pipelineProgress > 1.0 ? ("active" as const) : ("idle" as const) },
    { label: "Act",      state: pipelineProgress > 1.8 ? ("done" as const) : pipelineProgress > 1.4 ? ("active" as const) : ("idle" as const) },
    { label: "Verify",   state: pipelineProgress > 2.2 ? ("done" as const) : pipelineProgress > 1.8 ? ("active" as const) : ("idle" as const) },
  ] as const;

  return (
    <SceneWrapper background={COLORS.bg}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 120px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 860 }}>

          {/* Scene label */}
          <div
            style={{
              opacity: fadeIn(frame, 0, 12),
              transform: `translateY(${slideUp(frame, 0)}px)`,
              marginBottom: 32,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: COLORS.muted }}>
              Step 1 · Give the Agent a Goal
            </span>
          </div>

          {/* Goal card */}
          <div
            style={{
              background: COLORS.surface,
              borderRadius: 16,
              border: `1px solid ${COLORS.border}`,
              padding: "32px 36px",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              opacity: fadeIn(frame, 4, 16),
              transform: `translateY(${slideUp(frame, 4)}px)`,
              marginBottom: 28,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 16, fontFamily: FONTS.sans }}>
              Your goal
            </p>
            <div
              style={{
                background: COLORS.bg,
                border: `1.5px solid ${COLORS.border}`,
                borderRadius: 10,
                padding: "14px 18px",
                fontSize: 20,
                fontWeight: 500,
                color: COLORS.foreground,
                fontFamily: FONTS.sans,
                marginBottom: 24,
                minHeight: 54,
                display: "flex",
                alignItems: "center",
              }}
            >
              <TypedText text="Cancel my Premium subscription." frame={frame} startFrame={typingStart} fps={fps} />
            </div>

            <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 6, fontFamily: FONTS.sans }}>
                  Target
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: COLORS.bg,
                    borderRadius: 8,
                    padding: "10px 14px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" stroke={COLORS.muted} strokeWidth="1.2"/>
                    <path d="M1 7h12M7 1c-2 2-3 4-3 6s1 4 3 6M7 1c2 2 3 4 3 6s-1 4-3 6" stroke={COLORS.muted} strokeWidth="1.2"/>
                  </svg>
                  <span style={{ fontSize: 12, color: COLORS.foreground, fontFamily: FONTS.mono }}>
                    example-subscription.com
                  </span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 6, fontFamily: FONTS.sans }}>
                  Goal
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: COLORS.bg,
                    borderRadius: 8,
                    padding: "10px 14px",
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 3h3.5l-2.8 2 1 3L7 7.5 3.8 9l1-3L2 4h3.5z" fill={COLORS.muted} fillOpacity="0.3" stroke={COLORS.muted} strokeWidth="1"/>
                  </svg>
                  <span style={{ fontSize: 12, color: COLORS.foreground, fontFamily: FONTS.sans }}>
                    Cancel subscription
                  </span>
                </div>
              </div>
            </div>

            {/* Button */}
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "13px 24px",
                background: COLORS.brand,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONTS.sans,
                opacity: fadeIn(frame, buttonIn, 16),
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              Start Agent
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Status badge */}
          {frame >= statusIn && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28,
                opacity: fadeIn(frame, statusIn, 14),
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: "#eff4ff",
                  border: "1px solid #bfdbfe",
                  fontSize: 12,
                  fontWeight: 600,
                  color: COLORS.brand,
                  fontFamily: FONTS.sans,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: COLORS.brand,
                    display: "inline-block",
                  }}
                />
                Agent starting…
              </span>
            </div>
          )}

          {/* Pipeline bar */}
          {frame >= pipelineIn && (
            <div
              style={{
                background: COLORS.surface,
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                padding: "20px 32px",
                opacity: fadeIn(frame, pipelineIn, 16),
              }}
            >
              <PipelineBar
                stages={stages.map(s => ({ ...s }))}
                style={{ justifyContent: "space-between" }}
              />
            </div>
          )}
        </div>
      </div>
    </SceneWrapper>
  );
}
