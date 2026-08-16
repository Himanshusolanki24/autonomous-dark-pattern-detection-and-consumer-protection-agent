import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { BrowserChrome } from "../components/BrowserChrome";
import { AgentConsole } from "../components/AgentConsole";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn } from "../lib/anim";

// The 5 nav steps the agent clicks through
const NAV_STEPS = [
  {
    path: "Settings",
    url: "example-subscription.com/settings",
    content: (
      <div style={{ padding: "28px 36px", fontFamily: FONTS.sans }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f1f2e", marginBottom: 16 }}>Settings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Account", "Notifications", "Privacy", "Subscription", "Billing"].map((item, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                background: i === 3 ? "#eff4ff" : "white",
                border: `1px solid ${i === 3 ? "#bfdbfe" : "#e5e7eb"}`,
                borderRadius: 8,
                fontSize: 13,
                color: i === 3 ? COLORS.brand : "#374151",
                fontWeight: i === 3 ? 600 : 400,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {item}
              <span style={{ opacity: 0.4 }}>›</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    path: "Subscription",
    url: "example-subscription.com/settings/subscription",
    content: (
      <div style={{ padding: "28px 36px", fontFamily: FONTS.sans }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f1f2e", marginBottom: 4 }}>Subscription</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Manage your plan</p>
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "20px 24px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, color: "#1f1f2e", margin: 0 }}>Premium · 4K</p>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>₹999/month · Next billing Sep 16</p>
            </div>
            <button style={{ padding: "8px 16px", background: "#4f46e5", color: "white", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600 }}>
              Manage Plan
            </button>
          </div>
        </div>
        <button style={{ fontSize: 12, color: "#dc2626", background: "transparent", border: "1px solid #fecaca", borderRadius: 7, padding: "8px 14px" }}>
          Cancel Subscription
        </button>
      </div>
    ),
  },
  {
    path: "Manage Plan",
    url: "example-subscription.com/settings/subscription/manage",
    content: (
      <div style={{ padding: "28px 36px", fontFamily: FONTS.sans }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f1f2e", marginBottom: 16 }}>Manage Plan</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ padding: "14px 18px", background: "#f8f9fa", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>Upgrade to Ultra Plan — ₹1,499/month</div>
          <div style={{ padding: "14px 18px", background: "#eff4ff", border: "1px solid #bfdbfe", borderRadius: 8, fontSize: 13, fontWeight: 600, color: COLORS.brand }}>Current: Premium 4K — ₹999/month</div>
          <div style={{ padding: "14px 18px", background: "#f8f9fa", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>Downgrade to Basic — ₹399/month</div>
        </div>
        <button style={{ marginTop: 20, fontSize: 12, color: "#dc2626", background: "transparent", border: "1px solid #fecaca", borderRadius: 7, padding: "10px 18px", fontWeight: 600 }}>
          Cancel Subscription
        </button>
      </div>
    ),
  },
  {
    path: "Cancel Subscription",
    url: "example-subscription.com/settings/subscription/cancel",
    content: (
      <div style={{ padding: "28px 36px", fontFamily: FONTS.sans, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🤔</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1f1f2e", marginBottom: 8 }}>Are you sure you want to cancel?</h2>
        <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.5 }}>
          You'll lose access to Premium features on September 16, 2026.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ padding: "11px 24px", background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Keep My Plan</button>
          <button style={{ padding: "11px 24px", background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}>Continue Cancelling</button>
        </div>
      </div>
    ),
  },
  {
    path: "Retention Offer",
    url: "example-subscription.com/settings/subscription/cancel/offer",
    content: (
      <div style={{ padding: "28px 36px", fontFamily: FONTS.sans, textAlign: "center" }}>
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "20px 24px", marginBottom: 20 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎁</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: "#92400e", margin: "0 0 6px" }}>Special Offer Just For You!</h3>
          <p style={{ fontSize: 13, color: "#78350f", margin: 0 }}>Stay for ₹499/month for 3 months (50% off)</p>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ padding: "11px 24px", background: "#d97706", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Accept Offer</button>
          <button style={{ padding: "11px 20px", background: "transparent", color: "#9ca3af", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }}>
            Continue Cancellation
          </button>
        </div>
      </div>
    ),
  },
];

export function Scene7Action() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stepDuration = fps * 1.6;
  const currentStep = Math.min(NAV_STEPS.length - 1, Math.floor(frame / stepDuration));
  const stepProgress = (frame % stepDuration) / stepDuration;

  const consoleEntries = [
    { icon: "check" as const, label: "Navigated to Settings" },
    { icon: "check" as const, label: "Opened Subscription" },
    { icon: "check" as const, label: "Clicked Manage Plan" },
    { icon: "check" as const, label: "Clicked Cancel Subscription" },
    { icon: "warn"  as const, label: "Retention offer detected", sub: "Dismissing…" },
    { icon: "dot"   as const, label: "Continuing cancellation flow…", active: true },
  ];
  const visibleConsole = Math.min(currentStep + 1, consoleEntries.length);

  // Breadcrumb path
  const breadcrumb = NAV_STEPS.slice(0, currentStep + 1).map(s => s.path).join(" › ");

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
        {/* Left: browser */}
        <div
          style={{
            flex: "0 0 900px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
              Stage 4 · Action
            </p>
            {/* Step indicator */}
            <div style={{ display: "flex", gap: 6 }}>
              {NAV_STEPS.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    opacity: i > currentStep ? 0.3 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      background: i < currentStep ? COLORS.success : i === currentStep ? COLORS.brand : COLORS.border,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: FONTS.sans,
                    }}
                  >
                    {i < currentStep ? "✓" : i + 1}
                  </div>
                  {i < NAV_STEPS.length - 1 && (
                    <div style={{ width: 16, height: 1.5, background: i < currentStep ? COLORS.success : COLORS.border }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <BrowserChrome url={`https://${NAV_STEPS[currentStep].url}`}>
            <div
              style={{
                opacity: interpolate(stepProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]),
              }}
            >
              {NAV_STEPS[currentStep].content}
            </div>
          </BrowserChrome>

          {/* Breadcrumb */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 14px",
              background: COLORS.surface,
              borderRadius: 8,
              border: `1px solid ${COLORS.border}`,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke={COLORS.muted} strokeWidth="1"/>
              <path d="M6 3v3l2 1" stroke={COLORS.muted} strokeWidth="1" strokeLinecap="round"/>
            </svg>
            <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: FONTS.mono }}>
              {breadcrumb}
            </span>
          </div>
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
            Action Agent
          </p>
          <AgentConsole
            title="Action Agent"
            accentColor="#16a34a"
            logs={consoleEntries.slice(0, visibleConsole)}
          />

          {/* Current action */}
          <div
            style={{
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: COLORS.muted, marginBottom: 8, fontFamily: FONTS.sans }}>
              Current Action
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: COLORS.brand,
                  flexShrink: 0,
                  opacity: Math.sin((frame / 10) * Math.PI) > 0 ? 1 : 0.3,
                }}
              />
              <span style={{ fontSize: 12, color: COLORS.foreground, fontFamily: FONTS.sans }}>
                {NAV_STEPS[currentStep].path}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SceneWrapper>
  );
}
