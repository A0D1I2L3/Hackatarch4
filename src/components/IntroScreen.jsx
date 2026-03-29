import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext.jsx";

const FACTS = [
  "In 2022, 67 journalists were killed worldwide for reporting the truth.",
  "A single front-page retraction drops reader trust by ~40% permanently.",
  "It takes 12 positive stories to offset one credibility failure.",
  "The press is mentioned once in the US Constitution. Twice in India's.",
  "Woodward & Bernstein burned 17 sources before printing a word on Watergate.",
  "The average Indian newspaper editor faces 3 advertiser pressure calls per week.",
];

const HOW_TO_PLAY = [
  {
    icon: "📰",
    title: "Read the Desk",
    body: "Each day, four stories land on your desk. One is a planted distraction. Learn to tell them apart.",
  },
  {
    icon: "⟺",
    title: "Build the Front Page",
    body: "Drag stories onto the grid. Resize to fill every column inch. White space is not an option — publish only when the page is full.",
  },
  {
    icon: "⚖",
    title: "Every Slot Is a Decision",
    body: "The lead story hits hardest. Bury truth and lose your team. Lead with a planted story and lose your soul.",
  },
  {
    icon: "◈",
    title: "Survive the Pressure",
    body: "Advertisers, politicians, and your own reporters will push back. Respond or ignore — both are choices with consequences.",
  },
];

const PARAMS_INTRO = [
  { symbol: "INT", label: "Editorial Conscience", color: "#4f8ef7", icon: "⚖" },
  { symbol: "REP", label: "City's Trust", color: "#a78bfa", icon: "★" },
  { symbol: "REV", label: "Newsroom Funds", color: "#34d399", icon: "Rs" },
  { symbol: "MOR", label: "Team Spirit", color: "#fb923c", icon: "◈" },
  {
    symbol: "POL",
    label: "Establishment Goodwill",
    color: "#f472b6",
    icon: "◉",
  },
];

export default function IntroScreen({ onStart }) {
  const { theme, settings } = useSettings();
  const [factIdx, setFactIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setCardVisible(true), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const t = setInterval(
      () => setFactIdx((i) => (i + 1) % FACTS.length),
      3800,
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgColor,
        backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        fontFamily: theme.font,
        color: theme.textColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "40px 20px 60px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        overflowY: "auto",
      }}
    >
      {/* ── MASTHEAD ── */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 36,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(-12px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontSize: 10,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: theme.subColor,
            marginBottom: 10,
          }}
        >
          Bharatpur, India · A Newspaper Simulation
        </div>

        {/* Big title rule */}
        <div
          style={{
            borderTop: `3px solid ${theme.textColor}`,
            borderBottom: `3px solid ${theme.textColor}`,
            padding: "18px 48px",
            marginBottom: 12,
            display: "inline-block",
          }}
        >
          <div
            style={{
              fontFamily: theme.font,
              fontSize: "clamp(32px, 6vw, 58px)",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              color: theme.textColor,
              lineHeight: 1,
            }}
          >
            The Samachar Times
          </div>
        </div>

        <div
          style={{
            fontFamily: theme.font,
            fontSize: 14,
            fontStyle: "italic",
            color: theme.subColor,
            maxWidth: 480,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          You are Arjun Mehta. Editor. Bharatpur's last independent newspaper is
          yours to run — or ruin.
        </div>
      </div>

      {/* ── ROLLING FACT ── */}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderLeft: `4px solid ${theme.textColor}`,
          padding: "12px 20px",
          maxWidth: 560,
          width: "100%",
          marginBottom: 36,
          fontFamily: theme.mono,
          fontSize: 11,
          color: theme.subColor,
          lineHeight: 1.7,
          opacity: cardVisible ? 1 : 0,
          transition: "opacity 0.5s ease 0.25s",
          minHeight: 48,
        }}
      >
        <span style={{ color: theme.textColor, fontWeight: 700 }}>
          PRESS FACT ·{" "}
        </span>
        <span key={factIdx} style={{ animation: "fadeIn 0.4s ease" }}>
          {FACTS[factIdx]}
        </span>
      </div>

      {/* ── WHAT ARE YOU MANAGING ── */}
      <div
        style={{
          maxWidth: 700,
          width: "100%",
          marginBottom: 36,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease 0.35s, transform 0.5s ease 0.35s",
        }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: theme.subColor,
            marginBottom: 14,
            borderBottom: `1px solid ${theme.cardBorder}`,
            paddingBottom: 8,
          }}
        >
          Five Variables. One Newspaper. No Easy Answers.
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {PARAMS_INTRO.map((p) => (
            <div
              key={p.symbol}
              style={{
                flex: "1 1 120px",
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderTop: `3px solid ${p.color}`,
                borderRadius: 4,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  marginBottom: 4,
                  lineHeight: 1,
                }}
              >
                {p.icon}
              </div>
              <div
                style={{
                  fontFamily: theme.mono,
                  fontSize: 11,
                  fontWeight: 700,
                  color: p.color,
                  letterSpacing: "0.08em",
                }}
              >
                {p.symbol}
              </div>
              <div
                style={{
                  fontFamily: theme.font,
                  fontSize: 10,
                  color: theme.subColor,
                  marginTop: 2,
                  lineHeight: 1.4,
                }}
              >
                {p.label}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            fontFamily: theme.font,
            fontSize: 11,
            color: theme.subColor,
            fontStyle: "italic",
            marginTop: 10,
            lineHeight: 1.6,
          }}
        >
          Let any variable collapse and the paper dies. Keep them all alive for
          5–7 days and you might just be remembered.
        </div>
      </div>

      {/* ── HOW TO PLAY ── */}
      <div
        style={{
          maxWidth: 700,
          width: "100%",
          marginBottom: 40,
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s",
        }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: theme.subColor,
            marginBottom: 14,
            borderBottom: `1px solid ${theme.cardBorder}`,
            paddingBottom: 8,
          }}
        >
          How to Play
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {HOW_TO_PLAY.map((item, i) => (
            <div
              key={i}
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 4,
                padding: "14px 16px",
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>
                {item.icon}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: theme.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: theme.textColor,
                    letterSpacing: "0.06em",
                    marginBottom: 5,
                    textTransform: "uppercase",
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontFamily: theme.font,
                    fontSize: 11,
                    color: theme.subColor,
                    lineHeight: 1.65,
                  }}
                >
                  {item.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── THE WARNING ── */}
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          marginBottom: 36,
          background: theme.darkMode ? "#2a1a1a" : "#fef9f0",
          border: `1px solid ${theme.cardBorder}`,
          borderLeft: `4px solid #c8a96e`,
          padding: "14px 20px",
          opacity: cardVisible ? 1 : 0,
          transition: "opacity 0.5s ease 0.65s",
        }}
      >
        <div
          style={{
            fontFamily: theme.mono,
            fontSize: 9,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#c8a96e",
            marginBottom: 6,
          }}
        >
          Editor's Note
        </div>
        <div
          style={{
            fontFamily: theme.font,
            fontSize: 12,
            color: theme.subColor,
            lineHeight: 1.7,
            fontStyle: "italic",
          }}
        >
          The distraction story arrives every day. Someone manufactured it.
          Someone wants you to run it. It looks real. It sounds important. It is
          neither. Finding it — and burying it — is the job.
        </div>
      </div>

      {/* ── START BUTTON ── */}
      <div
        style={{
          opacity: cardVisible ? 1 : 0,
          transform: cardVisible ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.5s ease 0.8s, transform 0.5s ease 0.8s",
          textAlign: "center",
        }}
      >
        <button
          onClick={onStart}
          style={{
            background: theme.darkMode ? "#e8e4db" : "#1a1a1a",
            color: theme.darkMode ? "#1a1a1a" : "#f5f1e8",
            border: "none",
            padding: "16px 52px",
            fontFamily: theme.mono,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 2,
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          ◆ Open the Newsroom — Day 1
        </button>
        <div
          style={{
            fontFamily: theme.mono,
            fontSize: 9,
            color: theme.subColor,
            letterSpacing: "0.12em",
            marginTop: 10,
            textTransform: "uppercase",
          }}
        >
          {settings.paperName} · Editor: {settings.editorName || "Arjun Mehta"}
        </div>
      </div>
    </div>
  );
}
