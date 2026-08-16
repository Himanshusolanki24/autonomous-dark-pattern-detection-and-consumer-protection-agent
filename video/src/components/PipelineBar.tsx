import React from "react";
import { COLORS, FONTS } from "../lib/tokens";

export type StageState = "idle" | "active" | "done";

interface PipelineBarProps {
  stages: { label: string; state: StageState }[];
  style?: React.CSSProperties;
  size?: "sm" | "lg";
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function DotIcon({ color }: { color: string }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <circle cx="4" cy="4" r="3" fill={color}/>
    </svg>
  );
}

export function PipelineBar({ stages, style, size = "sm" }: PipelineBarProps) {
  const isLg = size === "lg";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        ...style,
      }}
    >
      {stages.map((stage, i) => {
        const isDone   = stage.state === "done";
        const isActive = stage.state === "active";
        const isIdle   = stage.state === "idle";

        return (
          <React.Fragment key={i}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: isLg ? 8 : 5,
              }}
            >
              {/* Circle */}
              <div
                style={{
                  width: isLg ? 36 : 24,
                  height: isLg ? 36 : 24,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isDone
                    ? COLORS.success
                    : isActive
                    ? COLORS.brand
                    : "#e4e4e7",
                  boxShadow: isActive
                    ? `0 0 0 4px ${COLORS.brandSoft}`
                    : "none",
                  transition: "all 0.3s",
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <CheckIcon />
                ) : isActive ? (
                  <DotIcon color="white" />
                ) : (
                  <DotIcon color="#a1a1aa" />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: isLg ? 11 : 9,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: isDone
                    ? COLORS.success
                    : isActive
                    ? COLORS.brand
                    : COLORS.muted,
                  whiteSpace: "nowrap",
                }}
              >
                {stage.label}
              </span>
            </div>

            {/* Connector line */}
            {i < stages.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: isDone ? COLORS.success : "#e4e4e7",
                  minWidth: isLg ? 40 : 24,
                  marginBottom: isLg ? 20 : 14,
                  alignSelf: "flex-start",
                  marginTop: isLg ? 17 : 11,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
