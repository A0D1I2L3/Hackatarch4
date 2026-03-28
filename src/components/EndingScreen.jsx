import React, { useState, useEffect } from "react";
import { PARAMS, COLLAPSE_ENDINGS, WIN_CONDITIONS } from "../engine/constants.js";
import { useSettings } from "../context/SettingsContext.jsx";

const FALLBACK_ENDING = {
  emoji: "⚖",
  title: "Uneasy Peace",
  epilogue: "The story ran — partially. The investigation continues — slowly. The acquisition happened — conditionally. Morgan still sits in the same chair. The coffee is still bad. The phones still ring. Nobody won. Nobody lost. The city still has a paper. For now, that has to be enough. Some days, Morgan believes it. Most days are not some days.",
};

export default function EndingScreen({ scores, collapseKey, dayNumber, arcFlags, onRestart }) {
  const { theme, settings } = useSettings();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2800),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  let ending;
  if (collapseKey) {
    ending = COLLAPSE_ENDINGS[collapseKey] || COLLAPSE_ENDINGS.CASCADE;
  } else {
    const win = WIN_CONDITIONS.find((w) => w.check(scores));
    ending = win ? { emoji: win.emoji, title: win.title, epilogue: win.epilogue } : FALLBACK_ENDING;
  }

  const isCollapse = !!collapseKey;
  const accentColor = isCollapse ? "#8b1a1a" : "#1a4a1a";

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bgColor,
      backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
      backgroundSize: "20px 20px",
      fontFamily: theme.font,
      color: theme.textColor,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px 64px",
    }}>
      <div style={{ maxWidth: 680, width: "100%" }}>

        {/* Masthead */}
        {phase >= 1 && (
          <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeIn 0.8s ease" }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.3em",
              textTransform: "uppercase", color: theme.subColor, marginBottom: 10,
            }}>
              {settings.paperName} · Final Edition
            </div>
            <div style={{
              borderTop: `3px double ${accentColor}`,
              borderBottom: `3px double ${accentColor}`,
              padding: "18px 0 14px",
              marginBottom: 0,
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.2em",
                textTransform: "uppercase", color: accentColor, marginBottom: 8,
              }}>
                After {dayNumber} {dayNumber === 1 ? "day" : "days"} — your verdict
              </div>
              <h1 style={{
                fontFamily: theme.font,
                fontSize: 42, fontWeight: 900,
                color: isCollapse ? "#8b1a1a" : theme.textColor,
                margin: 0, lineHeight: 1.05,
                letterSpacing: "-0.5px",
              }}>
                {ending.title}
              </h1>
            </div>
          </div>
        )}

        {/* Final scores grid */}
        {phase >= 2 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 0,
            marginBottom: 32,
            animation: "fadeIn 0.6s ease",
            border: `1px solid ${theme.cardBorder}`,
          }}>
            {Object.entries(PARAMS).map(([key, p], i) => {
              const v = scores[key] ?? 0;
              const danger = v <= p.collapseAt + 8;
              const great  = v >= p.achieveAt - 8;
              return (
                <div key={key} style={{
                  background: theme.cardBg,
                  borderRight: i < 4 ? `1px solid ${theme.cardBorder}` : "none",
                  padding: "14px 8px",
                  textAlign: "center",
                }}>
                  <div style={{
                    fontFamily: theme.mono, fontSize: 8, letterSpacing: "0.1em",
                    textTransform: "uppercase", color: theme.subColor, marginBottom: 6,
                  }}>
                    {p.symbol}
                  </div>
                  <div style={{
                    fontFamily: theme.font,
                    fontSize: 28, fontWeight: 900,
                    color: danger ? "#8b1a1a" : great ? "#1a4a1a" : theme.textColor,
                    lineHeight: 1,
                  }}>
                    {Math.round(v)}
                  </div>
                  <div style={{
                    fontFamily: theme.mono, fontSize: 7, letterSpacing: "0.06em",
                    color: danger ? "#8b1a1a" : theme.subColor,
                    marginTop: 4, textTransform: "uppercase",
                  }}>
                    {danger ? "▼ critical" : great ? "▲ achieved" : p.label}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Epilogue */}
        {phase >= 3 && (
          <div style={{ animation: "fadeIn 0.8s ease" }}>
            <div style={{
              borderTop: `1px solid ${theme.cardBorder}`,
              paddingTop: 24, marginBottom: 20,
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase", color: theme.subColor, marginBottom: 16,
              }}>
                Epilogue
              </div>
              {ending.epilogue.split("\n\n").map((para, i) => (
                <p key={i} style={{
                  fontFamily: theme.font,
                  fontSize: 15, lineHeight: 1.9,
                  color: theme.textColor, marginBottom: 16,
                  fontStyle: "italic",
                  opacity: 0.85,
                }}>
                  {para}
                </p>
              ))}
            </div>

            {arcFlags && arcFlags.length > 0 && (
              <div style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                padding: "10px 14px",
                marginBottom: 24,
                fontFamily: theme.mono,
                fontSize: 9, color: theme.subColor,
                letterSpacing: "0.06em",
              }}>
                <span style={{ color: theme.textColor, fontWeight: 700 }}>ARC FLAGS: </span>
                {arcFlags.join(" · ")}
              </div>
            )}

            <button
              onClick={onRestart}
              style={{
                width: "100%",
                background: theme.textColor,
                color: theme.bgColor,
                border: "none",
                padding: "16px",
                fontFamily: theme.mono,
                fontSize: 11, fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                marginTop: 8,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              ← Run the Paper Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
