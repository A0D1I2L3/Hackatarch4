import React, { useState, useEffect } from "react";
import { PARAMS } from "../engine/constants.js";
import { useSettings } from "../context/SettingsContext.jsx";

function ScoreLine({ paramKey, update, theme }) {
  const p = PARAMS[paramKey];
  const delta = update.delta;
  const col = delta > 0 ? "#1a5a1a" : delta < 0 ? "#8b1a1a" : theme.subColor;
  const symbol = delta > 0 ? "▲" : delta < 0 ? "▼" : "—";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "9px 0",
      borderBottom: `1px solid ${theme.cardBorder}`,
      animation: "fadeIn 0.5s ease",
    }}>
      <span style={{
        minWidth: 120, fontFamily: theme.font,
        fontSize: 12, fontWeight: 700, color: theme.textColor,
      }}>
        {p.icon} {p.label}
      </span>
      <span style={{ fontFamily: theme.mono, fontSize: 11, color: theme.subColor, minWidth: 80 }}>
        {update.previous} →{" "}
        <strong style={{ color: theme.textColor }}>{update.new}</strong>
      </span>
      <span style={{ fontFamily: theme.font, fontSize: 14, fontWeight: 800, color: col, minWidth: 50 }}>
        {delta > 0 ? "+" : ""}{delta} {symbol}
      </span>
      <span style={{ fontFamily: theme.font, fontSize: 11, color: theme.subColor, fontStyle: "italic", flex: 1 }}>
        {update.note}
      </span>
    </div>
  );
}

export default function ConsequenceScreen({ partA, onContinue, isGameOver, isVictory, dayNumber }) {
  const { theme, settings } = useSettings();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const { score_updates, consequences, achievement, collapse } = partA;

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
      padding: "40px 20px 60px",
    }}>
      <div style={{ maxWidth: 760, width: "100%" }}>

        {phase >= 1 && (
          <div style={{ animation: "fadeIn 0.5s ease", marginBottom: 8 }}>
            {/* Masthead */}
            <div style={{
              textAlign: "center", marginBottom: 28,
              borderTop: `3px double ${theme.textColor}`,
              borderBottom: `3px double ${theme.textColor}`,
              padding: "14px 0",
            }}>
              <div style={{
                fontFamily: theme.mono, fontSize: 10, letterSpacing: "0.3em",
                textTransform: "uppercase", color: theme.subColor, marginBottom: 6,
              }}>
                {settings.paperName}
              </div>
              <div style={{
                fontFamily: theme.font, fontSize: 36, fontWeight: 900,
                color: theme.textColor, letterSpacing: "-0.5px",
              }}>
                The Paper Lands.
              </div>
              <div style={{
                fontFamily: theme.font, fontSize: 11, fontStyle: "italic",
                color: theme.subColor, marginTop: 4,
              }}>
                Day {dayNumber} consequences — filed by the editors
              </div>
            </div>

            {/* Consequences */}
            {consequences.map((c, i) => (
              <div key={c.slot} style={{
                padding: "16px 0",
                borderBottom: `1px solid ${theme.cardBorder}`,
                animation: `fadeIn 0.5s ease ${i * 0.18}s both`,
              }}>
                <div style={{
                  fontFamily: theme.mono, fontSize: 8, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: theme.subColor, marginBottom: 6,
                }}>
                  Slot {c.slot} — {["Headline", "Secondary", "Side", "Bottom"][c.slot - 1] || ""}
                </div>
                <p style={{
                  margin: 0, fontFamily: theme.font,
                  fontSize: 14, lineHeight: 1.8,
                  color: theme.textColor, fontStyle: "italic",
                  borderLeft: `3px solid ${theme.cardBorder}`,
                  paddingLeft: 14,
                }}>
                  {c.narrative}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Score update */}
        {phase >= 2 && (
          <div style={{ marginTop: 32, animation: "fadeIn 0.6s ease" }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: theme.subColor, marginBottom: 12,
              borderBottom: `2px solid ${theme.textColor}`,
              paddingBottom: 8,
            }}>
              Newsroom Status — Day {dayNumber}
            </div>
            {Object.entries(score_updates).map(([key, update]) => (
              <ScoreLine key={key} paramKey={key} update={update} theme={theme} />
            ))}
          </div>
        )}

        {/* Achievement */}
        {phase >= 3 && achievement && (
          <div style={{
            marginTop: 24,
            background: theme.cardBg,
            border: `2px solid #1a5a1a`,
            borderLeft: `5px solid #1a5a1a`,
            padding: "16px 20px",
            animation: "fadeIn 0.6s ease",
          }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#1a5a1a", marginBottom: 6,
            }}>
              ◆ Achievement Unlocked
            </div>
            <div style={{ fontFamily: theme.font, fontSize: 17, fontWeight: 700, color: theme.textColor, marginBottom: 5 }}>
              {achievement.name}
            </div>
            <p style={{ margin: 0, fontFamily: theme.font, fontSize: 13, color: theme.subColor, lineHeight: 1.65, fontStyle: "italic" }}>
              {achievement.description}
            </p>
          </div>
        )}

        {/* Collapse event */}
        {phase >= 3 && collapse && (
          <div style={{
            marginTop: 24,
            background: theme.cardBg,
            border: `2px solid #8b1a1a`,
            borderLeft: `5px solid #8b1a1a`,
            padding: "16px 20px",
            animation: "fadeIn 0.6s ease",
          }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "#8b1a1a", marginBottom: 6,
            }}>
              ▼ Collapse Event
            </div>
            <div style={{ fontFamily: theme.font, fontSize: 17, fontWeight: 700, color: "#8b1a1a", marginBottom: 5 }}>
              {collapse.name}
            </div>
            <p style={{ margin: 0, fontFamily: theme.font, fontSize: 13, color: theme.subColor, lineHeight: 1.65, fontStyle: "italic" }}>
              {collapse.description}
            </p>
          </div>
        )}

        {/* Continue */}
        {phase >= 4 && (
          <button
            onClick={onContinue}
            style={{
              marginTop: 36, width: "100%",
              background: theme.textColor, color: theme.bgColor,
              border: "none", padding: "16px",
              fontFamily: theme.mono, fontSize: 11, fontWeight: 700,
              cursor: "pointer", letterSpacing: "0.18em",
              textTransform: "uppercase", animation: "fadeIn 0.5s ease",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.82"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            {isGameOver
              ? "▼ Read the Epilogue"
              : isVictory
                ? "◆ See Your Ending"
                : `◆ Day ${dayNumber + 1} Begins →`}
          </button>
        )}
      </div>
    </div>
  );
}
