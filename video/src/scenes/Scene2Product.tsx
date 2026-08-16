import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp, scaleIn } from "../lib/anim";

function ShieldLogo({ opacity, scale }: { opacity: number; scale: number }) {
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
      }}
    >
      {/* Shield icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 32px rgba(37,99,235,0.35)",
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 4L6 10v12c0 8.4 5.9 16.3 14 18 8.1-1.7 14-9.6 14-18V10L20 4z"
            fill="white"
            fillOpacity="0.9"
          />
          <path
            d="M14 19l4 4 8-8"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Product name */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.2em",
            color: COLORS.brand,
            textTransform: "uppercase",
            marginBottom: 12,
            fontFamily: FONTS.sans,
          }}
        >
          Introducing
        </div>
        <h1
          style={{
            fontFamily: FONTS.sans,
            fontSize: 68,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 0.95,
            color: "#ffffff",
            margin: 0,
            textAlign: "center",
          }}
        >
          DARK PATTERN
          <br />
          <span
            style={{
              background: "linear-gradient(90deg, #2563eb, #7c3aed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TRAP KILLER
          </span>
        </h1>
      </div>
    </div>
  );
}

function DashboardPreview({ opacity, translateY }: { opacity: number; translateY: number }) {
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "#18181b",
        borderRadius: 14,
        border: "1px solid #27272a",
        overflow: "hidden",
        width: 760,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          height: 48,
          background: "#0f0f11",
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          paddingLeft: 20,
          paddingRight: 20,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 40 40" fill="none">
              <path d="M20 4L6 10v12c0 8.4 5.9 16.3 14 18 8.1-1.7 14-9.6 14-18V10L20 4z" fill="white"/>
            </svg>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#e4e4e7", fontFamily: FONTS.sans }}>
            TrapKiller
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            background: "#16a34a20",
            border: "1px solid #16a34a40",
            borderRadius: 999,
            padding: "3px 10px",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
          <span style={{ fontSize: 10, color: "#16a34a", fontWeight: 600, fontFamily: FONTS.sans }}>
            Agent Online
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 180,
            borderRight: "1px solid #27272a",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {["Overview", "Agent", "Dark Pattern Scanner", "Cancellation Tasks", "Activity"].map(
            (item, i) => (
              <div
                key={i}
                style={{
                  padding: "7px 10px",
                  borderRadius: 7,
                  background: i === 0 ? "#27272a" : "transparent",
                  color: i === 0 ? "#e4e4e7" : "#71717a",
                  fontSize: 11,
                  fontWeight: i === 0 ? 600 : 400,
                  fontFamily: FONTS.sans,
                }}
              >
                {item}
              </div>
            )
          )}
          <div style={{ flex: 1 }} />
          <div
            style={{
              padding: "7px 10px",
              borderRadius: 7,
              background: "#2563eb20",
              border: "1px solid #2563eb40",
              color: "#60a5fa",
              fontSize: 11,
              fontWeight: 600,
              fontFamily: FONTS.sans,
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 24,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="#60a5fa" strokeWidth="1.2"/>
              <path d="M6 4v4M4 6h4" stroke="#60a5fa" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Live Demo
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "20px 24px" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ color: "#e4e4e7", fontSize: 16, fontWeight: 700, margin: "0 0 4px", fontFamily: FONTS.sans }}>
              Ready to protect you
            </h2>
            <p style={{ color: "#71717a", fontSize: 11, margin: 0, fontFamily: FONTS.sans }}>
              AI agent that detects dark patterns and navigates cancellations
            </p>
          </div>

          {/* Big launch button */}
          <button
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONTS.sans,
              boxShadow: "0 4px 16px rgba(37,99,235,0.4)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Launch Agent
          </button>

          {/* Metrics row */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {[
              { label: "Patterns Blocked", val: "1,248", color: "#ef4444" },
              { label: "Cancellations", val: "89", color: "#16a34a" },
              { label: "Time Saved", val: "14 hrs", color: "#2563eb" },
            ].map((m, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: "#27272a",
                  borderRadius: 8,
                  padding: "10px 12px",
                  border: "1px solid #3f3f46",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, color: m.color, fontFamily: FONTS.sans }}>
                  {m.val}
                </div>
                <div style={{ fontSize: 9, color: "#71717a", marginTop: 2, fontFamily: FONTS.sans }}>
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Scene2Product() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 1: dark bg, logo appears (0–3s)
  // Phase 2: tagline appears (2–5s)
  // Phase 3: dashboard slides in (5–10s)

  const logoScale = scaleIn(frame, 0, fps);
  const logoOpacity = fadeIn(frame, 0, 20);

  const taglineOpacity = fadeIn(frame, fps * 2, 20);
  const taglineY = interpolate(frame, [fps * 2, fps * 2 + 20], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dashboardOpacity = fadeIn(frame, fps * 4.5, 25);
  const dashboardY = interpolate(frame, [fps * 4.5, fps * 4.5 + 30], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const showDashboard = frame > fps * 4;

  return (
    <SceneWrapper background={COLORS.dark}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {!showDashboard ? (
          <>
            <ShieldLogo opacity={logoOpacity} scale={logoScale} />

            <p
              style={{
                fontFamily: FONTS.sans,
                fontSize: 18,
                fontWeight: 400,
                color: "#a1a1aa",
                textAlign: "center",
                maxWidth: 580,
                lineHeight: 1.7,
                opacity: taglineOpacity,
                transform: `translateY(${taglineY}px)`,
                margin: 0,
              }}
            >
              An AI agent that{" "}
              <span style={{ color: "#e4e4e7", fontWeight: 600 }}>detects deceptive interfaces</span>,
              navigates cancellation flows,
              <br />
              and keeps the{" "}
              <span style={{ color: "#e4e4e7", fontWeight: 600 }}>final decision in your hands</span>.
            </p>
          </>
        ) : (
          <>
            <DashboardPreview opacity={dashboardOpacity} translateY={dashboardY} />
          </>
        )}
      </div>
    </SceneWrapper>
  );
}
