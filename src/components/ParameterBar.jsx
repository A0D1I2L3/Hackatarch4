import React from "react";
import { PARAMS } from "../engine/constants.js";
import { useSettings } from "../context/SettingsContext.jsx";

function clamp(v) { return Math.max(0, Math.min(100, v)); }

function BarStat({ paramKey, value, prevValue, theme }) {
  const p = PARAMS[paramKey];
  const delta = prevValue != null ? value - prevValue : 0;
  const pct = clamp(value);
  const danger = value <= p.collapseAt + 8;
  const great  = value >= p.achieveAt - 8;
  const barColor = danger ? "#8b1a1a" : great ? "#1a4a1a" : theme.accentGold;

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{
          fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.12em",
          textTransform: "uppercase", color: theme.subColor,
        }}>
          {p.label}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {delta !== 0 && (
            <span style={{
              fontFamily: theme.mono, fontSize: 10, fontWeight: 700,
              color: delta > 0 ? "#1a5a1a" : "#8b1a1a",
              animation: "fadeIn 0.4s ease",
            }}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
          <span style={{
            fontFamily: theme.font, fontSize: 13, fontWeight: 700,
            color: danger ? "#8b1a1a" : theme.textColor,
          }}>
            {Math.round(value)}
          </span>
        </div>
      </div>

      <div style={{ height: 4, background: theme.barBg, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: barColor,
          transition: "width 0.9s cubic-bezier(0.4,0,0.2,1), background 0.5s",
        }} />
      </div>

      {danger && (
        <div style={{
          fontFamily: theme.mono, fontSize: 7, color: "#8b1a1a",
          marginTop: 2, fontWeight: 700, letterSpacing: "0.08em",
          animation: "pulse-warn 1.2s ease infinite",
        }}>
          ▲ COLLAPSE RISK
        </div>
      )}
    </div>
  );
}

export default function ParameterBar({ scores, prevScores }) {
  const { theme } = useSettings();

  return (
    <div style={{
      background: theme.cardBg,
      border: `1px solid ${theme.cardBorder}`,
      borderTop: `2px solid ${theme.textColor}`,
      padding: "10px 16px",
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
    }}>
      <div style={{
        fontFamily: theme.mono, fontSize: 8, letterSpacing: "0.12em",
        textTransform: "uppercase", color: theme.subColor,
        whiteSpace: "nowrap", paddingTop: 2, lineHeight: 1.6,
        borderRight: `1px solid ${theme.cardBorder}`,
        paddingRight: 14,
      }}>
        Newsroom<br />Status
      </div>
      {Object.keys(PARAMS).map((key) => (
        <BarStat
          key={key}
          paramKey={key}
          value={scores[key]}
          prevValue={prevScores ? prevScores[key] : null}
          theme={theme}
        />
      ))}
    </div>
  );
}
