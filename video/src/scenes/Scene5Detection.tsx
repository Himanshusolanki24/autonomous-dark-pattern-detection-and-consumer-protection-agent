import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { AgentConsole } from "../components/AgentConsole";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp } from "../lib/anim";

function PatternCard({
  type,
  severity,
  confidence,
  description,
  opacity,
  translateY,
  borderColor,
  bgColor,
  textColor,
}: {
  type: string;
  severity: string;
  confidence: number;
  description: string;
  opacity: number;
  translateY: number;
  borderColor: string;
  bgColor: string;
  textColor: string;
}) {
  return (
    <div
      style={{
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding: "18px 20px",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: textColor, marginBottom: 4, fontFamily: FONTS.sans }}>
            Dark Pattern Detected
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: textColor, margin: 0, letterSpacing: "-0.02em", fontFamily: FONTS.sans }}>
            {type}
          </h3>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "4px 10px",
            borderRadius: 999,
            background: borderColor + "25",
            border: `1px solid ${borderColor}`,
            fontSize: 10,
            fontWeight: 700,
            color: textColor,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: FONTS.sans,
          }}
        >
          {severity}
        </span>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: textColor + "99", fontFamily: FONTS.sans }}>Confidence</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: textColor, fontFamily: FONTS.sans }}>{confidence}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: borderColor + "30", overflow: "hidden" }}>
          <div
            style={{
              width: `${confidence}%`,
              height: "100%",
              background: borderColor,
              borderRadius: 2,
            }}
          />
        </div>
      </div>

      <p style={{ fontSize: 12, color: textColor + "cc", lineHeight: 1.5, margin: 0, fontFamily: FONTS.sans }}>
        {description}
      </p>
    </div>
  );
}

function DetectedOverlayPage() {
  return (
    <div
      style={{
        background: "#fafafa",
        minHeight: 420,
        padding: "36px 40px",
        fontFamily: FONTS.sans,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 40,
          right: 40,
          background: "white",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: "24px 28px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 8 }}>😢</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1f1f2e", margin: "0 0 8px" }}>
          Are you <em>really</em> sure you want to cancel?
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.5 }}>
          You'll lose everything you've built up — your watchlists, your recommendations, your downloads…
        </p>
        <button
          style={{
            padding: "12px 28px",
            background: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 9,
            fontSize: 13,
            fontWeight: 700,
            marginRight: 10,
          }}
        >
          Stay — I Love Streamify!
        </button>
        <button
          style={{
            padding: "12px 20px",
            background: "transparent",
            color: "#c4b5fd",
            border: "none",
            fontSize: 10,
          }}
        >
          I don't love saving money
        </button>
      </div>

      {/* Highlight boxes */}
      <div
        style={{
          position: "absolute",
          top: 88,
          left: 40,
          right: 40,
          height: 50,
          border: "2px solid #dc2626",
          borderRadius: 8,
          background: "#dc262610",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 232,
          left: 250,
          width: 180,
          height: 38,
          border: "2px solid #d97706",
          borderRadius: 8,
          background: "#d9770610",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function Scene5Detection() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card1In = fps * 0.5;
  const card2In = fps * 2.5;
  const consoleIn = fps * 0.3;

  const card1Opacity = fadeIn(frame, card1In, 18);
  const card1Y = interpolate(frame, [card1In, card1In + 20], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const card2Opacity = fadeIn(frame, card2In, 18);
  const card2Y = interpolate(frame, [card2In, card2In + 20], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const showBrowser = frame >= fps * 4;

  const consoleEntries = [
    { icon: "error" as const, label: "Confirmshaming detected", sub: "Confidence: 94%", active: false },
    { icon: "error" as const, label: "Roach Motel detected", sub: "HIGH RISK", active: false },
    { icon: "warn"  as const, label: "Retention pressure detected", sub: "3 manipulation vectors", active: false },
    { icon: "info"  as const, label: "Report generated", active: true },
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
        {/* Left column */}
        <div style={{ flex: "0 0 780px", display: "flex", flexDirection: "column", gap: 20 }}>
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
            Stage 2 · Detection
          </p>

          <PatternCard
            type="CONFIRMSHAMING"
            severity="Medium Risk"
            confidence={94}
            description="The interface uses guilt-inducing language to discourage cancellation. Buttons are labelled with emotionally manipulative copy."
            opacity={card1Opacity}
            translateY={card1Y}
            borderColor="#dc2626"
            bgColor="#fef2f2"
            textColor="#991b1b"
          />

          <PatternCard
            type="ROACH MOTEL"
            severity="High Risk"
            confidence={88}
            description="Easy to enter, difficult to leave. Cancellation is buried behind multiple confirmation screens and emotional friction."
            opacity={card2Opacity}
            translateY={card2Y}
            borderColor="#d97706"
            bgColor="#fffbeb"
            textColor="#92400e"
          />

          {/* Browser with highlighted element */}
          {showBrowser && (
            <div
              style={{
                opacity: fadeIn(frame, fps * 4, 18),
                transform: `translateY(${slideUp(frame, fps * 4)}px)`,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COLORS.muted, marginBottom: 8, fontFamily: FONTS.sans }}>
                Flagged Element
              </p>
              <div
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1.5px solid #dc2626`,
                  boxShadow: "0 0 0 4px #dc262615",
                }}
              >
                <DetectedOverlayPage />
              </div>
            </div>
          )}
        </div>

        {/* Right column: console */}
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
            Detection Agent
          </p>
          <AgentConsole
            title="Detection Agent"
            accentColor="#ef4444"
            logs={consoleEntries.slice(0, visibleConsole)}
          />

          {/* Summary card */}
          {visibleConsole >= 3 && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                padding: "16px 18px",
                opacity: fadeIn(frame, consoleIn + fps * 2, 16),
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#991b1b", marginBottom: 10, fontFamily: FONTS.sans }}>
                Risk Summary
              </p>
              {[
                { label: "Manipulation vectors", val: "3", color: "#dc2626" },
                { label: "Severity", val: "HIGH", color: "#d97706" },
                { label: "Blocked flows", val: "2", color: "#dc2626" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                    opacity: fadeIn(frame, consoleIn + fps * 2 + i * 8, 12),
                  }}
                >
                  <span style={{ fontSize: 11, color: "#991b1b99", fontFamily: FONTS.sans }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: item.color, fontFamily: FONTS.sans }}>{item.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SceneWrapper>
  );
}
