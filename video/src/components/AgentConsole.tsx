import React from "react";
import { COLORS, FONTS } from "../lib/tokens";

export type LogEntry = {
  icon: "check" | "dot" | "warn" | "info" | "error";
  label: string;
  sub?: string;
  active?: boolean;
};

interface AgentConsoleProps {
  title: string;
  logs: LogEntry[];
  style?: React.CSSProperties;
  accentColor?: string;
}

const ICONS: Record<LogEntry["icon"], React.ReactNode> = {
  check: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="6" fill="#16a34a" fillOpacity="0.15"/>
      <path d="M3.5 6.5l2 2 3.5-3.5" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  dot: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="3" fill="#2563eb"/>
    </svg>
  ),
  warn: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M6.5 2L12 11H1L6.5 2z" fill="#d97706" fillOpacity="0.15" stroke="#d97706" strokeWidth="1.2"/>
      <path d="M6.5 6v2" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="6.5" cy="9.5" r="0.6" fill="#d97706"/>
    </svg>
  ),
  info: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" stroke="#2563eb" strokeWidth="1.2"/>
      <path d="M6.5 6v3" stroke="#2563eb" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="6.5" cy="4" r="0.7" fill="#2563eb"/>
    </svg>
  ),
  error: (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <circle cx="6.5" cy="6.5" r="5.5" fill="#dc2626" fillOpacity="0.12" stroke="#dc2626" strokeWidth="1.2"/>
      <path d="M4.5 4.5l4 4M8.5 4.5l-4 4" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

export function AgentConsole({ title, logs, style, accentColor = COLORS.brand }: AgentConsoleProps) {
  return (
    <div
      style={{
        background: "#0f0f11",
        borderRadius: 10,
        border: "1px solid #27272a",
        overflow: "hidden",
        fontFamily: FONTS.mono,
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 36,
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          paddingLeft: 14,
          paddingRight: 14,
          gap: 8,
          background: "#18181b",
        }}
      >
        <div style={{ display: "flex", gap: 5 }}>
          {["#3f3f46", "#3f3f46", "#3f3f46"].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: accentColor,
            marginLeft: 4,
          }}
        >
          {title}
        </span>
      </div>

      {/* Log entries */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 6 }}>
        {logs.map((entry, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              opacity: entry.active === false ? 0.35 : 1,
            }}
          >
            <div style={{ marginTop: 1, flexShrink: 0 }}>{ICONS[entry.icon]}</div>
            <div>
              <div
                style={{
                  fontSize: 11.5,
                  color: entry.icon === "warn" ? "#fbbf24" : entry.icon === "error" ? "#f87171" : entry.active !== false ? "#e4e4e7" : "#71717a",
                  fontWeight: entry.active ? 600 : 400,
                  lineHeight: 1.4,
                }}
              >
                {entry.label}
              </div>
              {entry.sub && (
                <div style={{ fontSize: 10, color: "#52525b", marginTop: 1 }}>
                  {entry.sub}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
