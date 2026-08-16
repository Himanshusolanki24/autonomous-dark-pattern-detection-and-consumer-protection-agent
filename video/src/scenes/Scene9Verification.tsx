import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { BrowserChrome } from "../components/BrowserChrome";
import { AgentConsole } from "../components/AgentConsole";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp, scalePop } from "../lib/anim";

function CancelledPage({ opacity }: { opacity: number }) {
  return (
    <div
      style={{
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        fontFamily: FONTS.sans,
        opacity,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#f0fdf4",
          border: "2px solid #bbf7d0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M6 14l5 5 11-11" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: "#1f1f2e",
          marginBottom: 8,
        }}
      >
        Membership Cancelled
      </h1>
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        Your Premium membership has been cancelled.
      </p>

      {/* Details table */}
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "16px 24px",
          width: "100%",
          maxWidth: 400,
          textAlign: "left",
        }}
      >
        {[
          { label: "Plan", val: "Premium · 4K" },
          { label: "Status", val: "Cancelled", highlight: true },
          { label: "Access until", val: "16 Sep 2026" },
        ].map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: i > 0 ? 10 : 0,
              paddingBottom: i < 2 ? 10 : 0,
              borderBottom: i < 2 ? "1px solid #e5e7eb" : "none",
              fontSize: 13,
            }}
          >
            <span style={{ color: "#6b7280" }}>{row.label}</span>
            <span
              style={{
                fontWeight: row.highlight ? 600 : 400,
                color: row.highlight ? "#16a34a" : "#1f1f2e",
              }}
            >
              {row.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofCard({
  opacity,
  scale,
  translateY,
}: {
  opacity: number;
  scale: number;
  translateY: number;
}) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        border: "1.5px solid #bbf7d0",
        boxShadow: "0 4px 20px rgba(22,163,74,0.12)",
        overflow: "hidden",
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#f0fdf4",
          borderBottom: "1px solid #bbf7d0",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "#dcfce7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 1.5L2 5v6c0 4.2 3 8.2 7 9 4-0.8 7-4.8 7-9V5L9 1.5z" fill="#16a34a" fillOpacity="0.2" stroke="#16a34a" strokeWidth="1.3"/>
            <path d="M6 9l2 2 4-4" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#16a34a", margin: 0, fontFamily: FONTS.sans }}>
            Cancellation Verified
          </p>
          <p style={{ fontSize: 12, color: "#4ade80", margin: "2px 0 0", fontFamily: FONTS.sans }}>
            Streamify Premium
          </p>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.successText, margin: 0, fontFamily: FONTS.sans }}>
          Cancelled successfully
        </h3>
        <p style={{ fontSize: 12, color: COLORS.muted, margin: 0, fontFamily: FONTS.sans }}>
          Premium · 4K · Aug 2026, 23:02
        </p>

        {/* Proof details */}
        {[
          { label: "Status", val: "Cancellation verified", color: COLORS.successText },
          { label: "Verification method", val: "DOM confirmation" },
          { label: "Proof ID", val: "PROOF-A3F7-BC91" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
            <span style={{ color: COLORS.muted, fontFamily: FONTS.sans }}>{row.label}</span>
            <span style={{ fontWeight: row.color ? 600 : 400, color: row.color ?? COLORS.foreground, fontFamily: row.label === "Proof ID" ? FONTS.mono : FONTS.sans, fontSize: row.label === "Proof ID" ? 11 : 12 }}>
              {row.val}
            </span>
          </div>
        ))}

        <button
          style={{
            marginTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: COLORS.successText,
            background: "transparent",
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONTS.sans,
          }}
        >
          View Full Proof →
        </button>
      </div>
    </div>
  );
}

export function Scene9Verification() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const browserIn = fps * 0.5;
  const proofIn = fps * 3;
  const verifiedBadgeIn = fps * 5;

  const browserOpacity = fadeIn(frame, browserIn, 20);
  const cancelledPageOpacity = fadeIn(frame, fps * 1.5, 20);

  const proofOpacity = fadeIn(frame, proofIn, 20);
  const proofScale = scalePop(frame, proofIn, fps);
  const proofY = slideUp(frame, proofIn);

  const consoleEntries = [
    { icon: "check" as const, label: "Final cancellation submitted" },
    { icon: "dot"   as const, label: "Checking subscription status…", active: true },
    { icon: "check" as const, label: "Cancellation confirmed", sub: "DOM state verified" },
    { icon: "check" as const, label: "Proof screenshot captured" },
    { icon: "check" as const, label: "Evidence chain written", active: true },
  ];
  const visibleConsole = Math.min(
    Math.floor(Math.max(0, frame - fps * 0.3) / (fps * 0.7)) + 1,
    consoleEntries.length
  );

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
        {/* Left: browser + proof */}
        <div style={{ flex: "0 0 780px", display: "flex", flexDirection: "column", gap: 16 }}>
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
            Stage 5 · Verification
          </p>

          <div style={{ opacity: browserOpacity }}>
            <BrowserChrome url="https://example-subscription.com/account">
              <CancelledPage opacity={cancelledPageOpacity} />
            </BrowserChrome>
          </div>

          {/* Proof card */}
          {frame >= proofIn && (
            <ProofCard opacity={proofOpacity} scale={proofScale} translateY={proofY} />
          )}

          {/* VERIFIED badge */}
          {frame >= verifiedBadgeIn && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                background: COLORS.successSoft,
                border: `1.5px solid #86efac`,
                borderRadius: 999,
                opacity: fadeIn(frame, verifiedBadgeIn, 16),
                transform: `scale(${scalePop(frame, verifiedBadgeIn, fps)})`,
                alignSelf: "flex-start",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-6" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.successText, fontFamily: FONTS.sans }}>
                VERIFIED
              </span>
            </div>
          )}
        </div>

        {/* Right: console */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: fadeIn(frame, 0, 16),
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
            Verification Agent
          </p>
          <AgentConsole
            title="Verification Agent"
            accentColor="#16a34a"
            logs={consoleEntries.slice(0, visibleConsole)}
          />
        </div>
      </div>
    </SceneWrapper>
  );
}
