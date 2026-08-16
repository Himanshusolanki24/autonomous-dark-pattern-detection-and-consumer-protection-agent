import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { BrowserChrome } from "../components/BrowserChrome";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp, fadeOut } from "../lib/anim";

// ─── Fake subscription page ────────────────────────────────────────────────────
function SubscriptionPage({ chaos, chaosStep }: { chaos: number; chaosStep: number }) {
  const bgColor = interpolate(chaos, [0, 1], ["#ffffff", "#fff8f0"]);

  return (
    <div
      style={{
        background: bgColor,
        minHeight: 480,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 48,
        paddingBottom: 48,
        paddingLeft: 60,
        paddingRight: 60,
        fontFamily: FONTS.sans,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 40,
          opacity: fadeIn(1, 0, 1),
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" fill="white"/>
          </svg>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1f1f2e" }}>Streamify</span>
      </div>

      {chaosStep === 0 && (
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              display: "inline-block",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 11,
              fontWeight: 600,
              color: "#16a34a",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            Current Plan
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#1f1f2e", margin: "0 0 8px" }}>
            Premium Membership
          </h1>
          <p style={{ fontSize: 28, fontWeight: 700, color: "#4f46e5", margin: "0 0 6px" }}>
            ₹999<span style={{ fontSize: 14, fontWeight: 400, color: "#6b7280" }}>/month</span>
          </p>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 32px" }}>
            Next billing on September 16, 2026
          </p>

          <button
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 12,
            }}
          >
            Keep My Premium Benefits
          </button>
          <button
            style={{
              width: "100%",
              padding: "10px 24px",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            No, I want to cancel
          </button>
        </div>
      )}

      {chaosStep === 1 && (
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤔</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#1f1f2e", margin: "0 0 10px" }}>
            Are you sure?
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 }}>
            You'll lose access to 4K Ultra HD, offline downloads,
            and all your saved watchlists.
          </p>
          <button
            style={{
              padding: "13px 32px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginRight: 10,
            }}
          >
            Keep My Plan
          </button>
          <button
            style={{
              padding: "13px 32px",
              background: "transparent",
              color: "#9ca3af",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Continue cancelling
          </button>
        </div>
      )}

      {chaosStep === 2 && (
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: 12,
              padding: "20px 24px",
              marginBottom: 24,
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>🎁</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#92400e", margin: "0 0 6px" }}>
              Wait! Don't lose your benefits.
            </h2>
            <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>
              Special offer — stay for <strong>50% off</strong> for 3 months
            </p>
          </div>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
            That's only ₹499/month instead of ₹999/month.
          </p>
          <button
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "#d97706",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 10,
            }}
          >
            Claim 50% Off Offer
          </button>
          <button
            style={{
              width: "100%",
              padding: "10px 24px",
              background: "transparent",
              color: "#9ca3af",
              border: "none",
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            No thanks, I understand I'm missing out
          </button>
        </div>
      )}

      {chaosStep === 3 && (
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😢</div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#dc2626",
              margin: "0 0 10px",
              letterSpacing: "-0.02em",
            }}
          >
            Are you REALLY sure?
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 8px" }}>
            You'll also lose access to:
          </p>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 24px",
              fontSize: 13,
              color: "#374151",
              textAlign: "left",
              display: "inline-block",
            }}
          >
            {["Exclusive original content", "Family sharing (5 screens)", "Download & watch offline", "Premium audio quality"].map(
              (item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: "#dc2626", fontSize: 14 }}>✗</span>
                  {item}
                </li>
              )
            )}
          </ul>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              style={{
                padding: "13px 28px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Keep Premium
            </button>
            <button
              style={{
                padding: "13px 28px",
                background: "transparent",
                color: "#dc2626",
                border: "1px solid #dc2626",
                borderRadius: 10,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              I still want to cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Scene1Hook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase 0: clean page (0–2s)
  // Phase 1: chaos starts (2–8s), cycling through steps
  const chaosStart = 2 * fps;
  const stepDuration = fps * 1.4;

  const chaosProgress = Math.max(0, frame - chaosStart);
  const chaosNorm = Math.min(1, chaosProgress / (fps * 0.4));
  const chaosStep = Math.min(3, Math.floor(chaosProgress / stepDuration));

  // Overlay text timing
  const overlayIn = Math.min(frame / (fps * 0.6), 1);
  const mazeTextFrame = 5.5 * fps;

  // Cursor position: moves toward cancel button, then page shifts
  const cursorX = interpolate(frame, [fps * 1, fps * 1.8], [720, 720], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneWrapper background={COLORS.bg}>
      {/* Main content area */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ width: "100%", maxWidth: 900 }}>
          {/* Scene label */}
          <div
            style={{
              opacity: fadeIn(frame, 0, 12),
              transform: `translateY(${slideUp(frame, 0)}px)`,
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: COLORS.muted,
                fontFamily: FONTS.sans,
              }}
            >
              The Problem
            </span>
          </div>

          <div
            style={{
              opacity: fadeIn(frame, 4, 16),
              transform: `translateY(${slideUp(frame, 4)}px)`,
            }}
          >
            <BrowserChrome url="https://example-subscription.com/account/subscription">
              <SubscriptionPage chaos={chaosNorm} chaosStep={chaosStep} />
            </BrowserChrome>
          </div>
        </div>
      </div>

      {/* Dark overlay for "designed to make leaving difficult" */}
      {chaosNorm > 0.3 && chaosStep >= 2 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(15,15,17,0.55)",
            opacity: interpolate(frame, [chaosStart + stepDuration * 2, chaosStart + stepDuration * 2 + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 16,
              fontWeight: 600,
              color: "#fbbf24",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: fadeIn(frame, chaosStart + stepDuration * 2 + 10, 20),
            }}
          >
            Designed to make leaving difficult.
          </p>
        </div>
      )}

      {/* "THE CANCELLATION MAZE" title card */}
      {frame >= mazeTextFrame && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#0f0f11",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            opacity: fadeIn(frame, mazeTextFrame, 18),
          }}
        >
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#71717a",
              marginBottom: 20,
              opacity: fadeIn(frame, mazeTextFrame + 6, 14),
            }}
          >
            Signing up takes seconds. Cancelling can take minutes.
          </p>
          <h1
            style={{
              fontFamily: FONTS.sans,
              fontSize: 80,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1,
              opacity: fadeIn(frame, mazeTextFrame + 10, 18),
              transform: `scale(${interpolate(frame, [mazeTextFrame + 10, mazeTextFrame + 28], [0.92, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })})`,
            }}
          >
            THE CANCELLATION
            <br />
            <span style={{ color: "#ef4444" }}>MAZE</span>
          </h1>
        </div>
      )}
    </SceneWrapper>
  );
}
