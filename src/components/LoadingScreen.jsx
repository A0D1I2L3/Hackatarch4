import React, { useState, useEffect } from "react";
import { useSettings } from "../context/SettingsContext.jsx";

const LINES = [
  "The paper goes to print…",
  "The presses are running…",
  "The city wakes to your edition…",
  "Phone lines lighting up across Halcyon…",
  "The story is doing what stories do…",
];

export default function LoadingScreen({ error, onRetry }) {
  const { theme, settings } = useSettings();
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(
      () => setLineIdx((i) => (i + 1) % LINES.length),
      1800,
    );
    return () => clearInterval(t);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgColor,
        backgroundImage: `radial-gradient(${theme.dotColor} 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.font,
        color: theme.textColor,
        gap: 28,
      }}
    >
      {error ? (
        <div style={{ textAlign: "center", maxWidth: 480 }}>
          <div
            style={{
              fontFamily: theme.font,
              fontSize: 48,
              fontWeight: 900,
              color: "#8b1a1a",
              marginBottom: 16,
              lineHeight: 1,
            }}
          >
            ⚠
          </div>
          <div
            style={{
              fontFamily: theme.font,
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Press Malfunction
          </div>
          <div
            style={{
              fontFamily: theme.mono,
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              padding: "14px 18px",
              fontSize: 11,
              color: "#8b1a1a",
              marginBottom: 20,
              textAlign: "left",
              lineHeight: 1.7,
            }}
          >
            {error}
          </div>
          {error.includes("NO_API_KEY") && (
            <div
              style={{
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderLeft: `3px solid ${theme.textColor}`,
                padding: "14px 18px",
                fontFamily: theme.mono,
                fontSize: 11,
                color: theme.subColor,
                marginBottom: 20,
                textAlign: "left",
                lineHeight: 1.8,
              }}
            >
              <strong style={{ color: theme.textColor }}>
                To add your Grok API key:
              </strong>
              <br />
              1. Create a file called <code>.env</code> in the project root
              <br />
              2. Add: <code>VITE_GROK_API_KEY=xai-your-key-here</code>
              <br />
              3. Restart the dev server (<code>npm run dev</code>)
            </div>
          )}
          <button
            onClick={onRetry}
            style={{
              background: theme.textColor,
              color: theme.bgColor,
              border: "none",
              padding: "12px 28px",
              fontFamily: theme.mono,
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Rotating press icon */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: theme.font,
                fontSize: 10,
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: theme.subColor,
                marginBottom: 14,
              }}
            >
              {settings.paperName}
            </div>
            <div
              style={{
                borderTop: `2px solid ${theme.textColor}`,
                borderBottom: `2px solid ${theme.textColor}`,
                padding: "14px 40px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  fontFamily: theme.font,
                  fontSize: 28,
                  fontWeight: 900,
                  color: theme.textColor,
                  letterSpacing: "-0.5px",
                }}
              >
                To Press.
              </div>
            </div>
          </div>

          <div
            style={{
              width: 36,
              height: 36,
              border: `2px solid ${theme.cardBorder}`,
              borderTop: `2px solid ${theme.textColor}`,
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          />

          <div
            style={{
              fontFamily: theme.font,
              fontSize: 14,
              color: theme.subColor,
              fontStyle: "italic",
              letterSpacing: "0.03em",
              animation: "fadeIn 0.4s ease",
            }}
          >
            {LINES[lineIdx]}
          </div>
        </>
      )}
    </div>
  );
}
