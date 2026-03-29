import React, { useEffect } from "react";

const TAG_COLORS = {
  Investigative: { bg: "#fef2f2", color: "#991b1b" },
  Politics: { bg: "#dbeafe", color: "#1e40af" },
  Crime: { bg: "#fef2f2", color: "#7f1d1d" },
  Culture: { bg: "#fdf4ff", color: "#7e22ce" },
  Health: { bg: "#f0fdf4", color: "#166534" },
  Business: { bg: "#f8fafc", color: "#334155" },
  Environment: { bg: "#ccfbf1", color: "#0f766e" },
  Technology: { bg: "#ede9fe", color: "#6d28d9" },
  Staff: { bg: "#fff7ed", color: "#c2410c" },
  default: { bg: "#f1f5f9", color: "#475569" },
};

export default function StoryModal({ story, onClose }) {
  if (!story) return null;
  const tag = TAG_COLORS[story.tag] || TAG_COLORS.default;

  // Close on Escape
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 12,
          maxWidth: 540,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "28px 28px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          animation: "slideUp 0.22s ease",
          position: "relative",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 14,
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Tag + register + explosive */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 4,
              background: tag.bg,
              color: tag.color,
            }}
          >
            {story.tag}
          </span>
          <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>
            {story.emotional_register}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 10, color: "#94a3b8" }}>
            {"●".repeat(story.explosive_rating || 0)}
            {"○".repeat(5 - (story.explosive_rating || 0))}
          </span>
        </div>

        {/* Headline */}
        <h2
          style={{
            fontFamily: "'Georgia', serif",
            fontSize: 25,
            fontWeight: 900,
            color: "#0f172a",
            lineHeight: 1.25,
            margin: "0 0 8px",
          }}
        >
          {story.headline}
        </h2>

        {/* Deck */}
        {story.deck && (
          <p
            style={{
              fontSize: 13,
              color: "#475569",
              fontStyle: "italic",
              lineHeight: 1.55,
              margin: "0 0 16px",
              paddingBottom: 16,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {story.deck}
          </p>
        )}

        {/* Summary / body */}
        <p
          style={{
            fontSize: 14,
            color: "#1e293b",
            lineHeight: 1.75,
            margin: 0,
            fontFamily: "'Georgia', serif",
          }}
        >
          {story.summary}
        </p>

        {/* Drag hint */}
        <div
          style={{
            marginTop: 20,
            padding: "10px 14px",
            background: "#f8fafc",
            borderRadius: 8,
            fontSize: 11,
            color: "#64748b",
            textAlign: "center",
          }}
        >
          Close and drag this card to place it on the front page
        </div>
      </div>
    </div>
  );
}
