import React, { useState } from "react";

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

const SLOT_ACCENT = {
  slot_1_headline: "#ef4444",
  slot_2_secondary: "#f97316",
  slot_3_side: "#3b82f6",
  slot_4_bottom: "#94a3b8",
};

export default function BentoSlot({
  slotConfig,
  story,
  onDrop,
  onRemove,
  published,
}) {
  const [dragOver, setDragOver] = useState(false);
  const accent = SLOT_ACCENT[slotConfig.id] || "#64748b";

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    onDrop(e);
  };

  const tagStyle = story ? TAG_COLORS[story.tag] || TAG_COLORS.default : {};
  const minH = slotConfig.large ? 160 : 130;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        minHeight: minH,
        borderTop: `3px solid ${accent}`,
        borderRight: dragOver
          ? `2px dashed ${accent}`
          : story
            ? `1.5px solid ${accent}44`
            : `2px dashed #c8d5c8`,
        borderBottom: dragOver
          ? `2px dashed ${accent}`
          : story
            ? `1.5px solid ${accent}44`
            : `2px dashed #c8d5c8`,
        borderLeft: dragOver
          ? `2px dashed ${accent}`
          : story
            ? `1.5px solid ${accent}44`
            : `2px dashed #c8d5c8`,
        borderRadius: "0 0 6px 6px",
        background: dragOver ? `${accent}08` : story ? "#fff" : "#f9fafb",
        padding: story ? "10px 12px 12px" : "10px",
        position: "relative",
        transition: "all 0.15s",
        display: "flex",
        flexDirection: "column",
        justifyContent: story ? "flex-start" : "center",
        alignItems: story ? "flex-start" : "center",
      }}
    >
      {/* Slot label badge */}
      <div
        style={{
          position: "absolute",
          top: -1,
          left: 10,
          background: accent,
          color: "#fff",
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "2px 7px",
          borderRadius: "0 0 4px 4px",
        }}
      >
        {slotConfig.label} ×{slotConfig.multiplier}
      </div>

      {story ? (
        <>
          {!published && (
            <button
              onClick={onRemove}
              title="Remove from layout"
              style={{
                position: "absolute",
                top: 7,
                right: 7,
                background: "#fee2e2",
                border: "none",
                borderRadius: "50%",
                width: 20,
                height: 20,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: "#b91c1c",
                lineHeight: 1,
                padding: 0,
              }}
            >
              ×
            </button>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                padding: "2px 6px",
                borderRadius: 3,
                background: tagStyle.bg,
                color: tagStyle.color,
              }}
            >
              {story.tag}
            </span>
            <span
              style={{ fontSize: 9, color: "#94a3b8", fontStyle: "italic" }}
            >
              {story.emotional_register}
            </span>
          </div>

          <p
            style={{
              margin: "0 0 5px",
              fontWeight: 800,
              fontSize: slotConfig.large ? 15 : 12,
              color: "#0f172a",
              lineHeight: 1.2,
              fontFamily: "'Georgia', serif",
            }}
          >
            {story.headline}
          </p>

          <p
            style={{
              margin: 0,
              fontSize: slotConfig.large ? 20 : 10,
              color: "#475569",
              lineHeight: 1.5,
              fontStyle: "italic",
            }}
          >
            {story.deck}
          </p>
        </>
      ) : (
        <p
          style={{
            color: "#94a3b8",
            fontSize: 12,
            textAlign: "center",
            margin: 0,
            pointerEvents: "none",
          }}
        >
          Drop story here
        </p>
      )}
    </div>
  );
}
