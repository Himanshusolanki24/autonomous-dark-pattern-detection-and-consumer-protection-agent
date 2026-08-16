import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { BrowserChrome } from "../components/BrowserChrome";
import { AgentConsole } from "../components/AgentConsole";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp, staggerDelay } from "../lib/anim";

// Fake subscription settings page with bounding box overlays
function PerceptionPage({ highlightProgress }: { highlightProgress: number }) {
  const boxes = [
    { x: 40, y: 50, w: 260, h: 44, label: "nav", color: "#2563eb" },
    { x: 320, y: 50, w: 140, h: 44, label: "nav", color: "#2563eb" },
    { x: 500, y: 50, w: 180, h: 44, label: "btn", color: "#7c3aed" },
    { x: 40, y: 160, w: 340, h: 80, label: "heading", color: "#2563eb" },
    { x: 40, y: 260, w: 280, h: 40, label: "form", color: "#16a34a" },
    { x: 40, y: 310, w: 280, h: 40, label: "form", color: "#16a34a" },
    { x: 40, y: 380, w: 180, h: 44, label: "btn-primary", color: "#7c3aed" },
    { x: 40, y: 434, w: 160, h: 36, label: "btn", color: "#d97706" },
    { x: 360, y: 160, w: 340, h: 260, label: "section", color: "#2563eb" },
  ];

  return (
    <div
      style={{
        position: "relative",
        background: "#fafafa",
        minHeight: 520,
        padding: "0",
        overflow: "hidden",
      }}
    >
      {/* Fake nav */}
      <div
        style={{
          height: 52,
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          paddingLeft: 40,
          paddingRight: 40,
          gap: 32,
          fontSize: 13,
          color: "#374151",
          fontFamily: FONTS.sans,
        }}
      >
        <span style={{ fontWeight: 700, color: "#4f46e5" }}>Streamify</span>
        <span>Home</span>
        <span>My Account</span>
        <span style={{ marginLeft: "auto" }}>
          <button
            style={{
              padding: "6px 14px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Profile ▾
          </button>
        </span>
      </div>

      {/* Body */}
      <div
        style={{
          padding: "36px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}
      >
        {/* Left: account settings */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1f1f2e", marginBottom: 6, fontFamily: FONTS.sans }}>
            Account Settings
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 28, fontFamily: FONTS.sans }}>
            Manage your subscription and preferences
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              readOnly
              value="aarav@example.com"
              style={{
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                background: "white",
                color: "#374151",
                fontFamily: FONTS.sans,
              }}
            />
            <input
              readOnly
              type="password"
              value="••••••••"
              style={{
                padding: "10px 14px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                background: "white",
                color: "#374151",
                fontFamily: FONTS.sans,
              }}
            />
            <button
              style={{
                padding: "10px 20px",
                background: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                width: "fit-content",
                fontFamily: FONTS.sans,
              }}
            >
              Save Changes
            </button>
            <button
              style={{
                padding: "8px 16px",
                background: "transparent",
                color: "#9ca3af",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
                width: "fit-content",
                fontFamily: FONTS.sans,
              }}
            >
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Right: plan info */}
        <div
          style={{
            background: "white",
            borderRadius: 12,
            border: "1px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 12, fontFamily: FONTS.sans }}>
            Current Plan
          </p>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1f1f2e", marginBottom: 4, fontFamily: FONTS.sans }}>
            Premium · 4K
          </h3>
          <p style={{ fontSize: 22, fontWeight: 700, color: "#4f46e5", marginBottom: 16, fontFamily: FONTS.sans }}>
            ₹999<span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af" }}>/month</span>
          </p>
          {["4K Ultra HD", "Offline Downloads", "5 Screens", "Family Sharing"].map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 12, color: "#374151", fontFamily: FONTS.sans }}>
              <span style={{ color: "#16a34a" }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Bounding box overlays */}
      {boxes.map((box, i) => {
        const delay = i * 3;
        const visible = Math.min(1, Math.max(0, (highlightProgress * 60 - delay) / 8));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: box.x,
              top: box.y + 52, // offset for nav
              width: box.w,
              height: box.h,
              border: `1.5px solid ${box.color}`,
              borderRadius: 4,
              background: `${box.color}10`,
              opacity: visible,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -16,
                left: 0,
                fontSize: 8,
                fontWeight: 700,
                background: box.color,
                color: "white",
                padding: "1px 5px",
                borderRadius: 3,
                fontFamily: FONTS.mono,
                letterSpacing: "0.04em",
                opacity: visible,
              }}
            >
              {box.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Scene4Perception() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Highlight boxes appear from 1.5s
  const hlStart = fps * 1.5;
  const hlProgress = Math.max(0, (frame - hlStart) / fps);

  // Console log entries appear staggered
  const consoleStart = fps * 0.8;
  const logEntries = [
    { icon: "check" as const, label: "Page loaded", sub: "DOM ready in 284ms" },
    { icon: "check" as const, label: "DOM analyzed", sub: "Structure mapped" },
    { icon: "check" as const, label: "Interactive elements identified", sub: "47 elements detected" },
    { icon: "check" as const, label: "Accessibility structure analyzed" },
    { icon: "info"  as const, label: "47 interactive elements detected", active: true },
  ];

  const visibleCount = Math.floor(Math.max(0, frame - consoleStart) / (fps * 0.5)) + 1;

  return (
    <SceneWrapper background={COLORS.bg}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          gap: 32,
          padding: "56px 72px",
        }}
      >
        {/* Left: browser */}
        <div
          style={{
            flex: "0 0 920px",
            opacity: fadeIn(frame, 0, 16),
            transform: `translateY(${slideUp(frame, 0)}px)`,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: COLORS.muted,
              marginBottom: 12,
              fontFamily: FONTS.sans,
            }}
          >
            Stage 1 · Perception
          </p>
          <BrowserChrome url="https://example-subscription.com/account/settings">
            <PerceptionPage highlightProgress={hlProgress} />
          </BrowserChrome>

          {/* Element count badge */}
          {hlProgress > 1.5 && (
            <div
              style={{
                marginTop: 16,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: COLORS.brandSoft,
                border: `1px solid #bfdbfe`,
                borderRadius: 999,
                padding: "6px 16px",
                opacity: fadeIn(frame, hlStart + fps * 1.5, 14),
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.brand, fontFamily: FONTS.sans }}>
                47 interactive elements detected
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
            opacity: fadeIn(frame, fps * 0.6, 16),
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
            Agent Activity
          </p>

          <AgentConsole
            title="Perception Agent"
            accentColor="#2563eb"
            logs={logEntries.slice(0, Math.min(visibleCount, logEntries.length)).map(
              (e, i) => ({
                ...e,
                active: i === Math.min(visibleCount - 1, logEntries.length - 1),
              })
            )}
          />

          {/* Scan summary */}
          {visibleCount >= 4 && (
            <div
              style={{
                background: COLORS.surface,
                borderRadius: 10,
                border: `1px solid ${COLORS.border}`,
                padding: "16px 18px",
                opacity: fadeIn(frame, consoleStart + fps * 2, 16),
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: 12, fontFamily: FONTS.sans }}>
                DOM Scan Summary
              </p>
              {[
                { type: "Buttons", count: 12, color: "#7c3aed" },
                { type: "Links", count: 18, color: "#2563eb" },
                { type: "Forms", count: 3, color: "#16a34a" },
                { type: "Nav elements", count: 14, color: "#d97706" },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    opacity: fadeIn(frame, consoleStart + fps * 2 + staggerDelay(i, 8), 12),
                  }}
                >
                  <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: FONTS.sans }}>{item.type}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 60,
                        height: 4,
                        borderRadius: 2,
                        background: COLORS.border,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(item.count / 18) * 100}%`,
                          height: "100%",
                          background: item.color,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.foreground, fontFamily: FONTS.sans }}>
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SceneWrapper>
  );
}
