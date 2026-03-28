import React from "react";
import { useSettings } from "../context/SettingsContext.jsx";

const TYPE_META = {
  political:  { symbol: "◉", label: "Political"  },
  commercial: { symbol: "$", label: "Commercial" },
  staff:      { symbol: "◈", label: "Staff"       },
  public:     { symbol: "★", label: "Public"      },
  personal:   { symbol: "♦", label: "Personal"    },
};

const PRESSURE_INK = {
  low:      "#2a6a2a",
  medium:   "#7a5c2e",
  high:     "#8b4a1a",
  critical: "#8b1a1a",
};

const RESPONSES = ["ignored", "acknowledged", "appeased"];
const RESPONSE_LABELS = { ignored: "Ignore", acknowledged: "Acknowledge", appeased: "Appease" };
const RESPONSE_DESC = {
  ignored:      "Full pressure applied. Brave Stand bonus if story is Slot 1.",
  acknowledged: "30% pressure reduction. No additional cost.",
  appeased:     "70% pressure reduction. BUT: −10 Integrity, −8 Morale.",
};

export default function ExternalFactorPanel({ factors, responses, onResponse, disabled }) {
  const { theme } = useSettings();

  return (
    <div>
      <div style={{
        fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.18em",
        textTransform: "uppercase", color: theme.subColor,
        marginBottom: 12, fontWeight: 700,
        paddingBottom: 8, borderBottom: `1px solid ${theme.cardBorder}`,
      }}>
        External Pressures
      </div>

      {factors.map((f) => {
        const tm = TYPE_META[f.type] || TYPE_META.political;
        const pressureColor = PRESSURE_INK[f.pressure] || PRESSURE_INK.medium;
        const response = responses[f.factor_id] || "ignored";

        return (
          <div
            key={f.factor_id}
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderLeft: `3px solid ${pressureColor}`,
              padding: "11px 13px",
              marginBottom: 10,
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: theme.mono, fontSize: 8, letterSpacing: "0.1em",
                textTransform: "uppercase", color: pressureColor,
                border: `1px solid ${pressureColor}33`,
                padding: "1px 5px",
              }}>
                {tm.symbol} {tm.label}
              </span>
              <span style={{
                fontFamily: theme.mono, fontSize: 8, letterSpacing: "0.06em",
                textTransform: "uppercase", color: pressureColor, opacity: 0.8,
              }}>
                {f.pressure} pressure
              </span>
            </div>

            <p style={{
              margin: "0 0 5px",
              fontFamily: theme.font,
              fontWeight: 700, fontSize: 12,
              color: theme.textColor, lineHeight: 1.3,
            }}>
              {f.name}
            </p>
            <p style={{
              margin: "0 0 10px",
              fontFamily: theme.font,
              fontSize: 10.5, color: theme.subColor,
              lineHeight: 1.55, fontStyle: "italic",
            }}>
              {f.description}
            </p>

            {/* Response buttons */}
            <div style={{ display: "flex", gap: 4 }}>
              {RESPONSES.map((r) => {
                const selected = response === r;
                return (
                  <button
                    key={r}
                    disabled={disabled}
                    onClick={() => !disabled && onResponse(f.factor_id, r)}
                    title={RESPONSE_DESC[r]}
                    style={{
                      flex: 1,
                      padding: "5px 4px",
                      fontFamily: theme.mono,
                      fontSize: 8,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      border: `1px solid ${selected ? theme.textColor : theme.cardBorder}`,
                      background: selected ? theme.textColor : "transparent",
                      color: selected ? theme.bgColor : theme.subColor,
                      cursor: disabled ? "not-allowed" : "pointer",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={e => {
                      if (!disabled && !selected) {
                        e.currentTarget.style.borderColor = theme.textColor;
                        e.currentTarget.style.color = theme.textColor;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected) {
                        e.currentTarget.style.borderColor = theme.cardBorder;
                        e.currentTarget.style.color = theme.subColor;
                      }
                    }}
                  >
                    {RESPONSE_LABELS[r]}
                  </button>
                );
              })}
            </div>

            {response === "appeased" && (
              <div style={{
                fontFamily: theme.mono, fontSize: 8,
                color: "#8b1a1a", marginTop: 5, fontStyle: "italic",
                letterSpacing: "0.04em",
              }}>
                ▲ Appeasement costs −10 INT, −8 MOR
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
