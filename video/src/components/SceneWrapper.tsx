import React from "react";
import { FONTS } from "../lib/tokens";

interface SceneWrapperProps {
  children: React.ReactNode;
  background?: string;
  style?: React.CSSProperties;
}

export function SceneWrapper({ children, background = "#f7f7f8", style }: SceneWrapperProps) {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background,
        fontFamily: FONTS.sans,
        overflow: "hidden",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface TitleLockupProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  opacity?: number;
  translateY?: number;
  color?: string;
  align?: "left" | "center" | "right";
}

export function TitleLockup({
  eyebrow,
  title,
  subtitle,
  opacity = 1,
  translateY = 0,
  color = "#17181c",
  align = "left",
}: TitleLockupProps) {
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        textAlign: align,
      }}
    >
      {eyebrow && (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#2563eb",
            marginBottom: 10,
          }}
        >
          {eyebrow}
        </p>
      )}
      <h1
        style={{
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          color,
          margin: 0,
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 20,
            fontWeight: 400,
            color: "#71717a",
            marginTop: 14,
            lineHeight: 1.6,
            maxWidth: 600,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  style?: React.CSSProperties;
}

export function Badge({ label, color = "#2563eb", bg = "#eff4ff", style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 999,
        background: bg,
        color,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        fontFamily: FONTS.sans,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
