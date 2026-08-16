import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, scaleIn, slideUp } from "../lib/anim";

function ApprovalModal({
  opacity,
  scale,
  showApprove,
  frame,
  fps,
}: {
  opacity: number;
  scale: number;
  showApprove: boolean;
  frame: number;
  fps: number;
}) {
  // Cursor appears and clicks at ~7s
  const approveClickAt = fps * 8.5;
  const cursorVisible = frame > fps * 7;
  const clicked = frame >= approveClickAt;

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.06)",
        padding: "36px 40px",
        width: 520,
        opacity,
        transform: `scale(${scale})`,
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fffbeb",
            border: "1.5px solid #fde68a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M11 3L2 18h18L11 3z" fill="#d97706" fillOpacity="0.15" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M11 9v4" stroke="#d97706" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="11" cy="15.5" r="0.9" fill="#d97706"/>
          </svg>
        </div>
        <div>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#d97706",
              margin: "0 0 4px",
              fontFamily: FONTS.sans,
            }}
          >
            ⚠ Approval Required
          </p>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 800,
              color: COLORS.foreground,
              margin: 0,
              letterSpacing: "-0.02em",
              fontFamily: FONTS.sans,
            }}
          >
            Final cancellation action detected.
          </h2>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: COLORS.border, marginBottom: 24 }} />

      {/* Description */}
      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: COLORS.foreground,
          margin: "0 0 8px",
          fontFamily: FONTS.sans,
        }}
      >
        Cancel Premium Subscription?
      </h3>
      <p
        style={{
          fontSize: 13,
          color: COLORS.muted,
          margin: "0 0 20px",
          lineHeight: 1.6,
          fontFamily: FONTS.sans,
        }}
      >
        The agent is about to submit the final cancellation form on{" "}
        <code
          style={{
            fontFamily: FONTS.mono,
            fontSize: 12,
            background: COLORS.bg,
            padding: "1px 6px",
            borderRadius: 4,
            color: COLORS.foreground,
          }}
        >
          example-subscription.com
        </code>
        .
      </p>

      {/* Details card */}
      <div
        style={{
          background: COLORS.bg,
          borderRadius: 10,
          padding: "14px 16px",
          border: `1px solid ${COLORS.border}`,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {[
          { label: "Service", val: "Streamify Premium" },
          { label: "Action", val: "Submit cancellation form" },
          { label: "Reversible?", val: "No — this is irreversible" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: FONTS.sans }}>{row.label}</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: i === 2 ? 600 : 400,
                color: i === 2 ? COLORS.danger : COLORS.foreground,
                fontFamily: FONTS.sans,
              }}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button
          style={{
            flex: 1,
            padding: "13px 20px",
            background: COLORS.bg,
            color: COLORS.muted,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONTS.sans,
          }}
        >
          Cancel Action
        </button>
        <button
          style={{
            flex: 1,
            padding: "13px 20px",
            background: clicked ? COLORS.success : COLORS.brand,
            color: "white",
            border: "none",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: FONTS.sans,
            boxShadow: clicked
              ? "0 4px 14px rgba(22,163,74,0.4)"
              : "0 4px 14px rgba(37,99,235,0.35)",
            transform: clicked ? "scale(0.97)" : "scale(1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {clicked && (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3 4 7-8" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {clicked ? "Approved!" : "Approve Cancellation"}
        </button>
      </div>

      {/* Fake cursor */}
      {cursorVisible && !clicked && (
        <div
          style={{
            position: "absolute",
            // Move toward Approve button
            right: interpolate(frame, [fps * 7, fps * 8.2], [200, 80], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            bottom: interpolate(frame, [fps * 7, fps * 8.2], [140, 28], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            opacity: fadeIn(frame, fps * 7, 10),
            pointerEvents: "none",
          }}
        >
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path d="M2 2l16 8.5-7 1.5-4 7z" fill="white" stroke="#17181c" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
}

export function Scene8Approval() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background pulsing amber glow
  const glowPulse = Math.sin((frame / 40) * Math.PI) * 0.5 + 0.5;

  const modalIn = fps * 1.2;
  const modalOpacity = fadeIn(frame, modalIn, 22);
  const modalScale = scaleIn(frame, modalIn, fps);

  return (
    <SceneWrapper background="#fafafa">
      {/* Dimmed backdrop with amber tint */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(120, 53, 15, ${0.04 + glowPulse * 0.03})`,
          transition: "background 0.1s",
        }}
      />

      {/* Paused overlay at top */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          opacity: fadeIn(frame, 0, 18),
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 999,
            padding: "8px 20px",
            boxShadow: "0 2px 12px rgba(217,119,6,0.18)",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#d97706",
              opacity: 0.6 + glowPulse * 0.4,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#92400e",
              letterSpacing: "0.06em",
              fontFamily: FONTS.sans,
            }}
          >
            Agent paused — awaiting human approval
          </span>
        </div>
      </div>

      {/* Center: modal */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <ApprovalModal
            opacity={modalOpacity}
            scale={modalScale}
            showApprove={true}
            frame={frame}
            fps={fps}
          />

          {/* Caption below modal */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 15,
              color: COLORS.muted,
              textAlign: "center",
              opacity: fadeIn(frame, fps * 3, 18),
              transform: `translateY(${slideUp(frame, fps * 3)}px)`,
              maxWidth: 520,
              lineHeight: 1.6,
            }}
          >
            Autonomous doesn't mean{" "}
            <span style={{ color: COLORS.foreground, fontWeight: 600 }}>uncontrolled</span>.
          </p>
        </div>
      </div>
    </SceneWrapper>
  );
}
