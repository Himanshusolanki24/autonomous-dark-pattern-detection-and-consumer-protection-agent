import React from "react";
import { COLORS, FONTS } from "../lib/tokens";

interface BrowserChromeProps {
  url?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  secure?: boolean;
}

export function BrowserChrome({
  url = "https://example-subscription.com",
  children,
  style,
  secure = true,
}: BrowserChromeProps) {
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        background: COLORS.surface,
        ...style,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 44,
          background: "#f2f2f4",
          borderBottom: `1px solid ${COLORS.border}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 16,
          paddingRight: 16,
          gap: 8,
          flexShrink: 0,
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 6, marginRight: 8 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((color, i) => (
            <div
              key={i}
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: color,
              }}
            />
          ))}
        </div>

        {/* Nav buttons */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 11L5 7l4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: 0.4 }}>
          <path d="M5 11l4-4-4-4" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4 }}>
          <path d="M7 2v4l3 2" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7" cy="7" r="5" stroke="#9ca3af" strokeWidth="1.5"/>
        </svg>

        {/* URL bar */}
        <div
          style={{
            flex: 1,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 7,
            height: 28,
            display: "flex",
            alignItems: "center",
            paddingLeft: 10,
            paddingRight: 10,
            gap: 6,
            fontFamily: FONTS.mono,
            fontSize: 11,
            color: COLORS.muted,
            overflow: "hidden",
          }}
        >
          {secure && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="5" width="8" height="6" rx="1.5" stroke="#16a34a" strokeWidth="1.2"/>
              <path d="M4 5V3.5a2 2 0 014 0V5" stroke="#16a34a" strokeWidth="1.2"/>
            </svg>
          )}
          <span style={{ color: COLORS.foreground, fontSize: 11 }}>{url}</span>
        </div>
      </div>

      {/* Page content */}
      <div style={{ background: COLORS.surface }}>{children}</div>
    </div>
  );
}
