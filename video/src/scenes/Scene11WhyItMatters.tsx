import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { SceneWrapper } from "../components/SceneWrapper";
import { COLORS, FONTS } from "../lib/tokens";
import { fadeIn, slideUp } from "../lib/anim";

export function Scene11WhyItMatters() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headline1In = 0;
  const headline2In = fps * 1.5;
  const cardsIn = fps * 3;

  const cards = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9" stroke="#dc2626" strokeWidth="1.5"/>
          <path d="M7 11l3 3 5-5" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "DETECT",
      body: "Manipulative interfaces",
      color: "#dc2626",
      soft: "#fef2f2",
      border: "#fecaca",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2l2.5 5h5.5l-4.5 3.3 1.7 5.2L11 12.5l-5.2 3 1.7-5.2L3 7h5.5z" stroke="#2563eb" strokeWidth="1.4" strokeLinejoin="round"/>
        </svg>
      ),
      title: "NAVIGATE",
      body: "Complex cancellation flows",
      color: "#2563eb",
      soft: "#eff4ff",
      border: "#bfdbfe",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 2L3 6v7c0 5.5 3.5 10.3 8 11.3 4.5-1 8-5.8 8-11.3V6L11 2z" stroke="#16a34a" strokeWidth="1.4" strokeLinejoin="round"/>
          <path d="M7 11l3 3 5-5" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "PROTECT",
      body: "Keep users in control",
      color: "#16a34a",
      soft: "#f0fdf4",
      border: "#bbf7d0",
    },
  ];

  return (
    <SceneWrapper background={COLORS.dark}>
      {/* Subtle grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Center content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: "60px 120px",
        }}
      >
        {/* Headline */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontFamily: FONTS.sans,
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#ffffff",
              margin: 0,
              opacity: fadeIn(frame, headline1In, 22),
              transform: `translateY(${slideUp(frame, headline1In, 28)}px)`,
            }}
          >
            Your browser should work{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #2563eb, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              for you
            </span>
            .
          </h1>

          <h2
            style={{
              fontFamily: FONTS.sans,
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#71717a",
              margin: "8px 0 0",
              opacity: fadeIn(frame, headline2In, 22),
              transform: `translateY(${slideUp(frame, headline2In, 28)}px)`,
            }}
          >
            Not against you.
          </h2>
        </div>

        {/* Sub copy */}
        <p
          style={{
            fontFamily: FONTS.sans,
            fontSize: 17,
            fontWeight: 400,
            color: "#71717a",
            textAlign: "center",
            maxWidth: 600,
            lineHeight: 1.7,
            opacity: fadeIn(frame, fps * 2.5, 18),
            transform: `translateY(${slideUp(frame, fps * 2.5)}px)`,
          }}
        >
          Dark Pattern Trap Killer turns consumer protection into an agentic workflow.
        </p>

        {/* Cards */}
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 8,
          }}
        >
          {cards.map((card, i) => {
            const cardIn = cardsIn + i * 10;
            return (
              <div
                key={i}
                style={{
                  background: "#18181b",
                  border: `1px solid #27272a`,
                  borderRadius: 16,
                  padding: "24px 28px",
                  flex: 1,
                  minWidth: 240,
                  opacity: fadeIn(frame, cardIn, 18),
                  transform: `translateY(${slideUp(frame, cardIn)}px)`,
                  borderTop: `3px solid ${card.color}`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: card.soft + "20",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {card.icon}
                </div>
                <h3
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 14,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: card.color,
                    margin: "0 0 8px",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 14,
                    color: "#a1a1aa",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {card.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SceneWrapper>
  );
}
