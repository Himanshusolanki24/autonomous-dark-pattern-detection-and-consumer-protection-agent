import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn } from "../lib/anim";

const STAGES = [
  {
    label: "PERCEIVE",
    icon: "👁",
    color: "#2563eb",
    soft: "#eff4ff",
    desc: "DOM analyzed\n47 elements detected",
  },
  {
    label: "DETECT",
    icon: "⚠",
    color: "#dc2626",
    soft: "#fef2f2",
    desc: "Confirmshaming\nRoach Motel found",
  },
  {
    label: "PLAN",
    icon: "📋",
    color: "#7c3aed",
    soft: "#f5f3ff",
    desc: "6-step plan\nApproval gated",
  },
  {
    label: "ACT",
    icon: "⚡",
    color: "#d97706",
    soft: "#fffbeb",
    desc: "5 pages navigated\nRetention bypassed",
  },
  {
    label: "VERIFY",
    icon: "✓",
    color: "#16a34a",
    soft: "#f0fdf4",
    desc: "Cancellation confirmed\nProof generated",
  },
];

export function Scene10Pipeline() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each stage lights up 0.5s apart
  const stageDuration = fps * 0.6;

  const stageProgress = (i: number) => Math.max(0, frame - i * stageDuration) / fps;

  const titleOpacity = fadeIn(frame, 0, 18);
  const titleY = interpolate(frame, [0, 20], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneWrapper background={COLORS.dark}>
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <p
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#71717a",
            marginBottom: 10,
            fontFamily: FONTS.sans,
          }}
        >
          Complete Agent Pipeline
        </p>
        <h1
          style={{
            fontSize: 52,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            color: "#ffffff",
            margin: 0,
            fontFamily: FONTS.sans,
          }}
        >
          Perceive. Detect. Plan. Act. Verify.
        </h1>
      </div>

      {/* Pipeline row */}
      <div
        style={{
          position: "absolute",
          top: 240,
          left: 80,
          right: 80,
          display: "flex",
          alignItems: "flex-start",
          gap: 0,
        }}
      >
        {STAGES.map((stage, i) => {
          const progress = stageProgress(i);
          const visible = progress > 0;
          const opacity = Math.min(1, progress * fps * 0.5);
          const scale = visible ? Math.min(1, 0.7 + progress * 0.5) : 0;

          return (
            <React.Fragment key={i}>
              {/* Stage card */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  opacity,
                  transform: `scale(${scale}) translateY(${visible ? 0 : 20}px)`,
                }}
              >
                {/* Icon circle */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    boxShadow: `0 8px 28px ${stage.color}50`,
                  }}
                >
                  {stage.icon}
                </div>

                {/* Label */}
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: stage.color,
                    fontFamily: FONTS.sans,
                  }}
                >
                  {stage.label}
                </span>

                {/* Desc box */}
                <div
                  style={{
                    background: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: 10,
                    padding: "12px 16px",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {stage.desc.split("\n").map((line, j) => (
                    <p
                      key={j}
                      style={{
                        margin: j === 0 ? "0 0 3px" : 0,
                        fontSize: j === 0 ? 12 : 10,
                        fontWeight: j === 0 ? 600 : 400,
                        color: j === 0 ? "#e4e4e7" : "#71717a",
                        fontFamily: FONTS.sans,
                      }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>

              {/* Arrow connector */}
              {i < STAGES.length - 1 && (
                <div
                  style={{
                    width: 32,
                    display: "flex",
                    alignItems: "center",
                    marginTop: 30,
                    opacity: Math.min(1, stageProgress(i) * fps),
                    flexShrink: 0,
                  }}
                >
                  <svg width="32" height="14" viewBox="0 0 32 14" fill="none">
                    <path d="M2 7h24M20 2l6 5-6 5" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary row */}
      {frame >= fps * 4 && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            right: 80,
            display: "flex",
            justifyContent: "center",
            gap: 0,
            opacity: fadeIn(frame, fps * 4, 20),
          }}
        >
          {[
            "Dark pattern detected →",
            "Cancellation path found →",
            "Human approval →",
            "Cancellation completed →",
            "Result verified ✓",
          ].map((text, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                fontSize: 11,
                color: i === 4 ? "#4ade80" : "#71717a",
                fontWeight: i === 4 ? 700 : 400,
                fontFamily: FONTS.sans,
                lineHeight: 1.4,
                padding: "0 8px",
              }}
            >
              {text}
            </div>
          ))}
        </div>
      )}
    </SceneWrapper>
  );
}
