import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext.jsx";

export default function FactorIntroScreen({ dayNumber, dayTitle, atmosphere, factors, onDone }) {
  const { theme } = useSettings();
  const [step, setStep] = useState(0);

  // Auto-advance through title → atmosphere → factors → done
  useEffect(() => {
    const delays = [600, 1400, 2400, 2400 + factors.length * 700];
    const timers = delays.map((d, i) =>
      setTimeout(() => setStep(i + 1), d)
    );
    // After last factor, call onDone
    const doneTimer = setTimeout(onDone, 2400 + factors.length * 700 + 900);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [factors.length, onDone]);

  const pressureColor = (p) => ({
    low:      "#64748b",
    medium:   "#b45309",
    high:     "#c2410c",
    critical: "#8b1a1a",
  }[p] || "#64748b");

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: theme.bgColor,
        backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: theme.font,
        color: theme.textColor,
      }}
    >
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>

        {/* Day number pill */}
        {step >= 1 && (
          <div style={{
            display: "inline-block",
            fontFamily: theme.mono, fontSize: 9, letterSpacing: "0.25em",
            textTransform: "uppercase", color: theme.subColor,
            border: `1px solid ${theme.cardBorder}`,
            padding: "4px 14px", marginBottom: 18,
            animation: "fadeIn 0.4s ease",
          }}>
            Day {dayNumber}
          </div>
        )}

        {/* Day title */}
        {step >= 1 && (
          <div style={{
            fontSize: 32, fontWeight: 900, lineHeight: 1.15,
            marginBottom: 16, letterSpacing: "-0.5px",
            animation: "slideUp 0.4s ease",
          }}>
            {dayTitle}
          </div>
        )}

        {/* Atmosphere */}
        {step >= 2 && (
          <p style={{
            fontSize: 14, fontStyle: "italic", color: theme.subColor,
            lineHeight: 1.7, marginBottom: 32,
            animation: "fadeIn 0.5s ease",
          }}>
            {atmosphere}
          </p>
        )}

        {/* Factors */}
        {step >= 3 && factors.length > 0 && (
          <div style={{ textAlign: "left", marginBottom: 24 }}>
            <div style={{
              fontFamily: theme.mono, fontSize: 8, letterSpacing: "0.2em",
              textTransform: "uppercase", color: theme.subColor,
              marginBottom: 14, textAlign: "center",
            }}>
              New pressures on the newsroom
            </div>
            {factors.map((f, i) => (
              <div
                key={f.factor_id}
                style={{
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderLeft: `3px solid ${pressureColor(f.pressure)}`,
                  padding: "12px 16px",
                  marginBottom: 10,
                  animation: `fadeIn 0.4s ease ${i * 0.18}s both`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <span style={{
                    fontFamily: theme.mono, fontSize: 8, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: pressureColor(f.pressure),
                  }}>
                    {f.pressure}
                  </span>
                  <span style={{ fontFamily: theme.mono, fontSize: 8, color: theme.subColor }}>
                    · {f.type}
                  </span>
                  {f.caused_by_previous_choice && (
                    <span style={{
                      fontFamily: theme.mono, fontSize: 7, color: theme.subColor,
                      marginLeft: "auto", fontStyle: "italic",
                    }}>
                      ↩ caused by your last edition
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  {f.name}
                </div>
                <div style={{ fontSize: 11, color: theme.subColor, lineHeight: 1.55 }}>
                  {f.description}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skip hint */}
        {step >= 2 && (
          <button
            onClick={onDone}
            style={{
              marginTop: 8,
              background: "none", border: "none",
              fontFamily: theme.mono, fontSize: 9,
              color: theme.subColor, cursor: "pointer",
              letterSpacing: "0.12em", textTransform: "uppercase",
              opacity: 0.6,
              animation: "fadeIn 0.4s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}
          >
            Skip →
          </button>
        )}
      </div>
    </div>
  );
}
