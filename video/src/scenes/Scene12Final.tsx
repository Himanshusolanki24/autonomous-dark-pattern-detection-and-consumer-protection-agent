import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp, scalePop } from "../lib/anim";

function DashboardFinalState({ opacity, translateY }: { opacity: number; translateY: number }) {
  return (
    <div
      style={{
        background: "#18181b",
        borderRadius: 16,
        border: "1px solid #27272a",
        overflow: "hidden",
        width: 800,
        boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Topbar */}
      <div
        style={{
          height: 52,
          background: "#0f0f11",
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          paddingRight: 20,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L6 10v12c0 8.4 5.9 16.3 14 18 8.1-1.7 14-9.6 14-18V10L20 4z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#e4e4e7", fontFamily: FONTS.sans }}>
            TrapKiller
          </span>
        </div>

        <div style={{ flex: 1 }} />

        {/* Status badges */}
        {["Agent Completed", "Protected"].map((label, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: "#16a34a20",
              border: "1px solid #16a34a40",
              borderRadius: 999,
              padding: "4px 12px",
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
            <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, fontFamily: FONTS.sans }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "24px 28px" }}>
        {/* Completed task banner */}
        <div
          style={{
            background: "#16a34a15",
            border: "1px solid #16a34a40",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "#16a34a25",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 1.5L2 5v6c0 4.2 3 8.2 7 9 4-0.8 7-4.8 7-9V5L9 1.5z" stroke="#16a34a" strokeWidth="1.3" fill="#16a34a10"/>
              <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: FONTS.sans, fontSize: 14, fontWeight: 700, color: "#4ade80", margin: "0 0 2px" }}>
              Mission completed
            </p>
            <p style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#71717a", margin: 0 }}>
              Streamify Premium · Cancelled successfully · Aug 16, 2026
            </p>
          </div>
        </div>

        {/* Completion checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {[
            { label: "Agent completed", sub: "All 5 pipeline stages finished" },
            { label: "Cancellation verified", sub: "DOM state confirmed" },
            { label: "Proof generated", sub: "PROOF-A3F7-BC91" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: "#27272a",
                borderRadius: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" fill="#16a34a" fillOpacity="0.2"/>
                <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#e4e4e7", fontFamily: FONTS.sans }}>
                  ✓ {item.label}
                </span>
                <span style={{ fontSize: 10, color: "#71717a", fontFamily: FONTS.sans, marginLeft: 8 }}>
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          style={{
            width: "100%",
            padding: "16px 28px",
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: FONTS.sans,
            letterSpacing: "0.04em",
            boxShadow: "0 6px 24px rgba(37,99,235,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          LAUNCH THE AGENT
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Scene12Final() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dashboardIn = fps * 0.8;
  const taglineIn = fps * 4;
  const builderIn = fps * 6;
  const holdStart = fps * 8;

  const dashboardOpacity = fadeIn(frame, dashboardIn, 22);
  const dashboardY = slideUp(frame, dashboardIn, 30);

  const taglineOpacity = fadeIn(frame, taglineIn, 20);
  const taglineY = slideUp(frame, taglineIn);

  const builderOpacity = fadeIn(frame, builderIn, 20);

  // Final fade to black hold
  const fadeToBlack = interpolate(frame, [holdStart, holdStart + fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrapper background={COLORS.dark}>
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
        }}
      >
        <DashboardFinalState opacity={dashboardOpacity} translateY={dashboardY} />

        {/* Tagline */}
        <div
          style={{
            textAlign: "center",
            opacity: taglineOpacity,
            transform: `translateY(${taglineY}px)`,
          }}
        >
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 22,
              fontWeight: 600,
              color: "#a1a1aa",
              margin: "0 0 6px",
            }}
          >
            AI that works{" "}
            <span style={{ color: "#ffffff", fontWeight: 800 }}>for the user.</span>
          </p>
        </div>

        {/* Builder credit */}
        <div
          style={{
            opacity: builderOpacity,
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: 999,
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              }}
            />
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: 13,
                color: "#71717a",
                fontWeight: 500,
              }}
            >
              DARK PATTERN TRAP KILLER ·{" "}
              <span style={{ color: "#a1a1aa", fontWeight: 600 }}>
                Built for Ascendant Agents 2026
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Fade to black */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000000",
          opacity: fadeToBlack,
          pointerEvents: "none",
        }}
      />
    </SceneWrapper>
  );
}
