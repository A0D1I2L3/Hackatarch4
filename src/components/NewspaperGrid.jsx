import React, { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 10;
const MAX_HEADLINES = 4;
const DEFAULT_W = 2;
const DEFAULT_H = 2;
const MIN_W = 1;
const MIN_H = 1;

// ─────────────────────────────────────────────────────────────
//  CELL VALUE MATRIX  ← EDIT THIS to change per-cell weights
//
//  Shape: 10 rows × 10 cols  (CELL_VALUE_MATRIX[row][col])
//  Row 0 = top of the grid, Row 9 = bottom.
//  Values here graduate from 2.5 (top) down to 0.3 (bottom).
//  The weight of a placed headline = sum of all cell values it covers.
// ─────────────────────────────────────────────────────────────
export const CELL_VALUE_MATRIX = [
  // col: 0    1    2    3    4    5    6    7    8    9
  [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5], // row 0
  [2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2], // row 1
  [1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9], // row 2
  [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6], // row 3
  [1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35], // row 4
  [1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1], // row 5
  [0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85], // row 6
  [0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65], // row 7
  [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45], // row 8
  [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3], // row 9
];

/** Sum all cell values that a placed item covers */
function computeWeight(item) {
  let total = 0;
  for (let r = item.row; r < item.row + item.h; r++) {
    for (let c = item.col; c < item.col + item.w; c++) {
      const rowVals = CELL_VALUE_MATRIX[r];
      if (rowVals) total += rowVals[c] ?? 0;
    }
  }
  return Math.round(total * 100) / 100;
}

// ─────────────────────────────────────────────────────────────
//  TAG COLOURS
// ─────────────────────────────────────────────────────────────
const TAG_COLORS = {
  Investigative: { bg: "transparent", color: "#8b1a1a" },
  Politics: { bg: "transparent", color: "#1a3a8b" },
  Crime: { bg: "transparent", color: "#5a1a1a" },
  Culture: { bg: "transparent", color: "#4a1a6a" },
  Health: { bg: "transparent", color: "#1a5a2a" },
  Business: { bg: "transparent", color: "#3a3a1a" },
  Environment: { bg: "transparent", color: "#1a5a4a" },
  Technology: { bg: "transparent", color: "#1a2a7a" },
  Staff: { bg: "transparent", color: "#7a3a1a" },
  default: { bg: "transparent", color: "#5a5040" },
};

// ─────────────────────────────────────────────────────────────
//  COLLISION HELPERS
// ─────────────────────────────────────────────────────────────
function occupiedCells(items, excludeId = null) {
  const cells = new Set();
  items.forEach((item) => {
    if (item.id === excludeId) return;
    for (let c = item.col; c < item.col + item.w; c++)
      for (let r = item.row; r < item.row + item.h; r++) cells.add(`${c},${r}`);
  });
  return cells;
}

function canPlace(items, col, row, w, h, excludeId = null) {
  if (col < 0 || row < 0 || col + w > COLS || row + h > ROWS) return false;
  const taken = occupiedCells(items, excludeId);
  for (let c = col; c < col + w; c++)
    for (let r = row; r < row + h; r++)
      if (taken.has(`${c},${r}`)) return false;
  return true;
}

function findFreeOrigin(items) {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (canPlace(items, c, r, DEFAULT_W, DEFAULT_H))
        return { col: c, row: r };
  return null;
}

// ─────────────────────────────────────────────────────────────
//  RESIZE EDGE DETECTION  (pointer-based, no handle divs)
//
//  Returns the resize "edge" string (n/s/e/w/ne/nw/se/sw)
//  when the pointer is within EDGE_PX pixels of that edge,
//  or null if it's in the interior.
// ─────────────────────────────────────────────────────────────
const EDGE_PX = 10; // px from border that counts as "on edge"

function detectEdge(e, el) {
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const w = rect.width;
  const h = rect.height;

  const onN = y <= EDGE_PX;
  const onS = y >= h - EDGE_PX;
  const onW = x <= EDGE_PX;
  const onE = x >= w - EDGE_PX;

  if (onN && onW) return "nw";
  if (onN && onE) return "ne";
  if (onS && onW) return "sw";
  if (onS && onE) return "se";
  if (onN) return "n";
  if (onS) return "s";
  if (onW) return "w";
  if (onE) return "e";
  return null;
}

const EDGE_CURSORS = {
  n: "n-resize",
  s: "s-resize",
  e: "e-resize",
  w: "w-resize",
  ne: "ne-resize",
  nw: "nw-resize",
  se: "se-resize",
  sw: "sw-resize",
};

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────
// Default theme fallback so component still works standalone
const DEFAULT_THEME = {
  cardBg: "#fff",
  cardBorder: "#c8a96e88",
  barBg: "#f5f0e8",
  textColor: "#0f172a",
  subColor: "#475569",
  accentGold: "#c8a96e",
  font: "'Georgia', serif",
  mono: "'Courier New', monospace",
  darkMode: false,
};

export default function NewspaperGrid({
  draggedStory,
  onGridChange,
  published,
  theme: themeProp,
}) {
  const theme = themeProp || DEFAULT_THEME;
  const [items, setItems] = useState([]);
  const [hoverCell, setHoverCell] = useState(null);
  const [resizing, setResizing] = useState(null);
  // ghostRect: {col,row,w,h,valid} — shown while resizing
  const [ghostRect, setGhostRect] = useState(null);
  // hoverEdge: { id, edge } — tracks which edge cursor is near
  const [hoverEdge, setHoverEdge] = useState(null);

  const gridRef = useRef(null);

  useEffect(() => {
    onGridChange?.(items);
  }, [items, onGridChange]);

  // ── Cell dimensions ───────────────────────────────────────
  const cellSize = useCallback(() => {
    if (!gridRef.current) return { cw: 0, ch: 0 };
    const { width, height } = gridRef.current.getBoundingClientRect();
    return { cw: width / COLS, ch: height / ROWS };
  }, []);

  const pxToCell = useCallback(
    (clientX, clientY) => {
      if (!gridRef.current) return null;
      const rect = gridRef.current.getBoundingClientRect();
      const { cw, ch } = cellSize();
      const col = Math.floor((clientX - rect.left) / cw);
      const row = Math.floor((clientY - rect.top) / ch);
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
      return { col, row };
    },
    [cellSize],
  );

  // ── Drop from pool ────────────────────────────────────────
  const handleGridDragOver = useCallback(
    (e) => {
      e.preventDefault();
      setHoverCell(pxToCell(e.clientX, e.clientY));
    },
    [pxToCell],
  );

  const handleGridDragLeave = useCallback(() => setHoverCell(null), []);

  const handleGridDrop = useCallback(
    (e) => {
      e.preventDefault();
      setHoverCell(null);
      if (!draggedStory) return;
      if (items.length >= MAX_HEADLINES) return;
      if (items.some((it) => it.story.story_id === draggedStory.story_id))
        return;

      const cell = pxToCell(e.clientX, e.clientY);
      if (!cell) return;

      let { col, row } = cell;
      if (!canPlace(items, col, row, DEFAULT_W, DEFAULT_H)) {
        const free = findFreeOrigin(items);
        if (!free) return;
        col = free.col;
        row = free.row;
      }

      setItems((prev) => [
        ...prev,
        {
          id: draggedStory.story_id,
          story: draggedStory,
          col,
          row,
          w: DEFAULT_W,
          h: DEFAULT_H,
        },
      ]);
    },
    [draggedStory, items, pxToCell],
  );

  // ── Remove ────────────────────────────────────────────────
  const handleRemove = useCallback((id) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }, []);

  // ── Pointer-based resize ──────────────────────────────────
  //
  //  onPointerMove over an item card:
  //    → detect which edge the pointer is near
  //    → set cursor accordingly
  //
  //  onPointerDown on an item card:
  //    → if edge detected, start resizing (capture pointer)
  //
  //  Global pointermove / pointerup while resizing:
  //    → compute new col/row/w/h from delta
  //    → update ghostRect (preview)
  //    → on pointerup, commit if valid else snap back

  const handleCardPointerMove = useCallback(
    (e, id) => {
      if (resizing) return; // already resizing — handled globally
      const edge = detectEdge(e, e.currentTarget);
      if (edge) {
        e.currentTarget.style.cursor = EDGE_CURSORS[edge];
        setHoverEdge({ id, edge });
      } else {
        e.currentTarget.style.cursor = "default";
        setHoverEdge(null);
      }
    },
    [resizing],
  );

  const handleCardPointerLeave = useCallback(
    (e) => {
      if (resizing) return;
      e.currentTarget.style.cursor = "default";
      setHoverEdge(null);
    },
    [resizing],
  );

  const handleCardPointerDown = useCallback(
    (e, id) => {
      const edge = detectEdge(e, e.currentTarget);
      if (!edge) return; // interior — don't hijack (allow remove button etc.)
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);

      const item = items.find((it) => it.id === id);
      if (!item) return;

      setResizing({
        id,
        edge,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        origW: item.w,
        origH: item.h,
        origCol: item.col,
        origRow: item.row,
      });
      setGhostRect({
        col: item.col,
        row: item.row,
        w: item.w,
        h: item.h,
        valid: true,
      });
    },
    [items],
  );

  // Global pointer events during resize
  useEffect(() => {
    if (!resizing) return;

    const onMove = (e) => {
      const { cw, ch } = cellSize();
      if (!cw || !ch) return;

      const dx = Math.round((e.clientX - resizing.startX) / cw);
      const dy = Math.round((e.clientY - resizing.startY) / ch);

      let col = resizing.origCol,
        row = resizing.origRow;
      let w = resizing.origW,
        h = resizing.origH;

      const edge = resizing.edge;
      if (edge === "se") {
        w = Math.max(MIN_W, resizing.origW + dx);
        h = Math.max(MIN_H, resizing.origH + dy);
      }
      if (edge === "sw") {
        const dw = Math.min(resizing.origW - MIN_W, -dx);
        col += dw;
        w = resizing.origW - dw;
        h = Math.max(MIN_H, resizing.origH + dy);
      }
      if (edge === "ne") {
        const dh = Math.min(resizing.origH - MIN_H, -dy);
        row += dh;
        h = resizing.origH - dh;
        w = Math.max(MIN_W, resizing.origW + dx);
      }
      if (edge === "nw") {
        const dw = Math.min(resizing.origW - MIN_W, -dx);
        const dh = Math.min(resizing.origH - MIN_H, -dy);
        col += dw;
        row += dh;
        w = resizing.origW - dw;
        h = resizing.origH - dh;
      }
      if (edge === "e") {
        w = Math.max(MIN_W, resizing.origW + dx);
      }
      if (edge === "w") {
        const dw = Math.min(resizing.origW - MIN_W, -dx);
        col += dw;
        w = resizing.origW - dw;
      }
      if (edge === "s") {
        h = Math.max(MIN_H, resizing.origH + dy);
      }
      if (edge === "n") {
        const dh = Math.min(resizing.origH - MIN_H, -dy);
        row += dh;
        h = resizing.origH - dh;
      }

      col = Math.max(0, col);
      row = Math.max(0, row);
      w = Math.min(w, COLS - col);
      h = Math.min(h, ROWS - row);

      const others = items.filter((it) => it.id !== resizing.id);
      const valid = canPlace(others, col, row, w, h);
      setGhostRect({ col, row, w, h, valid });
    };

    const onUp = () => {
      if (ghostRect) {
        const { col, row, w, h, valid } = ghostRect;
        if (valid) {
          setItems((prev) =>
            prev.map((it) =>
              it.id === resizing.id ? { ...it, col, row, w, h } : it,
            ),
          );
        }
        // else snap back — no update needed (items unchanged)
      }
      setResizing(null);
      setGhostRect(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [resizing, ghostRect, cellSize, items]);

  // ── Drop ghost preview ────────────────────────────────────
  const dropPreview =
    hoverCell && draggedStory && items.length < MAX_HEADLINES
      ? canPlace(items, hoverCell.col, hoverCell.row, DEFAULT_W, DEFAULT_H)
        ? {
            col: hoverCell.col,
            row: hoverCell.row,
            w: DEFAULT_W,
            h: DEFAULT_H,
            valid: true,
          }
        : (() => {
            const f = findFreeOrigin(items);
            return f ? { ...f, w: DEFAULT_W, h: DEFAULT_H, valid: true } : null;
          })()
      : null;

  // ── Helper: absolute position from grid coords ────────────
  function absStyle(col, row, w, h, inset = 2) {
    return {
      position: "absolute",
      left: `calc(${col} * (100% / ${COLS}) + ${inset}px)`,
      top: `calc(${row} * (100% / ${ROWS}) + ${inset}px)`,
      width: `calc(${w}   * (100% / ${COLS}) - ${inset * 2}px)`,
      height: `calc(${h}   * (100% / ${ROWS}) - ${inset * 2}px)`,
    };
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      ref={gridRef}
      onDragOver={handleGridDragOver}
      onDragLeave={handleGridDragLeave}
      onDrop={handleGridDrop}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: 1,
        background: theme.darkMode ? "#2a241833" : "#c8a96e33",
        border: `1.5px solid ${theme.accentGold}`,
        borderRadius: 6,
        overflow: "hidden",
        userSelect: resizing ? "none" : "auto",
        cursor: resizing
          ? (EDGE_CURSORS[resizing.edge] ?? "default")
          : "default",
      }}
    >
      {/* Grid cell backgrounds — show value as faint tint */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: COLS }).map((_, c) => {
          const val = CELL_VALUE_MATRIX[r]?.[c] ?? 1;
          // Map 0.3–2.5 → opacity 0.04–0.18 for a subtle value heatmap
          const opacity = 0.04 + ((val - 0.3) / (2.5 - 0.3)) * 0.14;
          return (
            <div
              key={`${c}-${r}`}
              title={`cell (${c},${r}) value: ${val}`}
              style={{
                background: `rgba(200,169,110,${opacity})`,
                border: `0.5px solid ${theme.darkMode ? "#3a3020" : "#e2d5ba"}`,
                gridColumn: `${c + 1}`,
                gridRow: `${r + 1}`,
              }}
            />
          );
        }),
      )}

      {/* Drop ghost preview */}
      {dropPreview && (
        <div
          style={{
            ...absStyle(
              dropPreview.col,
              dropPreview.row,
              dropPreview.w,
              dropPreview.h,
              0,
            ),
            background: "#2d6a4f33",
            border: "2px dashed #2d6a4f",
            borderRadius: 4,
            zIndex: 5,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Resize ghost */}
      {resizing && ghostRect && (
        <div
          style={{
            ...absStyle(
              ghostRect.col,
              ghostRect.row,
              ghostRect.w,
              ghostRect.h,
              0,
            ),
            background: ghostRect.valid ? `${theme.textColor}18` : "#ef444422",
            border: `2px dashed ${ghostRect.valid ? theme.textColor : "#ef4444"}`,
            borderRadius: 4,
            zIndex: 6,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Placed headline cards */}
      {items.map((item) => {
        const tagStyle = TAG_COLORS[item.story.tag] || TAG_COLORS.default;
        const isResizingThis = resizing?.id === item.id;
        const w = computeWeight(item);

        // Visual edge hint strips (shown when hover edge detected for this item)
        const showEdge = hoverEdge?.id === item.id && !resizing;

        return (
          <div
            key={item.id}
            onPointerMove={(e) => handleCardPointerMove(e, item.id)}
            onPointerLeave={handleCardPointerLeave}
            onPointerDown={(e) => handleCardPointerDown(e, item.id)}
            style={{
              ...absStyle(item.col, item.row, item.w, item.h, 2),
              background: theme.cardBg,
              border: isResizingThis
                ? `2px solid ${theme.textColor}`
                : `1.5px solid ${showEdge ? theme.accentGold : theme.cardBorder}`,
              borderRadius: 4,
              padding: "6px 8px 20px",
              overflow: "hidden",
              zIndex: isResizingThis ? 10 : 7,
              display: "flex",
              flexDirection: "column",
              boxShadow: isResizingThis
                ? "0 4px 20px rgba(0,0,0,0.25)"
                : "0 2px 8px rgba(0,0,0,0.12)",
              transition: isResizingThis ? "none" : "box-shadow 0.15s",
              touchAction: "none",
            }}
          >
            {/* Edge highlight strips — visual affordance */}
            {showEdge && !published && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: "#c8a96e44",
                    borderRadius: "4px 4px 0 0",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    background: "#c8a96e44",
                    borderRadius: "0 0 4px 4px",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 6,
                    background: "#c8a96e44",
                    borderRadius: "4px 0 0 4px",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: 6,
                    background: "#c8a96e44",
                    borderRadius: "0 4px 4px 0",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}

            {/* Remove button */}
            {!published && (
              <button
                onPointerDown={(e) => e.stopPropagation()} // don't start resize
                onClick={() => handleRemove(item.id)}
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: theme.cardBorder,
                  border: "none",
                  borderRadius: "50%",
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  color: theme.textColor,
                  lineHeight: 1,
                  padding: 0,
                  zIndex: 12,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            )}

            {/* Weight badge — now shows weighted sum */}
            <div
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                background: theme.textColor,
                color: theme.bgColor,
                fontSize: 8,
                fontWeight: 700,
                padding: "2px 5px",
                borderRadius: 3,
                letterSpacing: "0.05em",
                zIndex: 12,
              }}
            >
              ◼ {w}
            </div>

            {/* Resize affordance hint label */}
            {!published && (
              <div
                style={{
                  position: "absolute",
                  bottom: 4,
                  left: 4,
                  fontSize: 7,
                  color: theme.accentGold + "99",
                  pointerEvents: "none",
                  letterSpacing: "0.04em",
                }}
              >
                ⟺ drag edges
              </div>
            )}

            {/* Tag + register */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                marginBottom: 4,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "1px 5px",
                  borderRadius: 2,
                  background: tagStyle.bg,
                  color: tagStyle.color,
                }}
              >
                {item.story.tag}
              </span>
              {item.story.emotional_register && (
                <span
                  style={{
                    fontSize: 7,
                    color: theme.subColor,
                    fontStyle: "italic",
                  }}
                >
                  {item.story.emotional_register}
                </span>
              )}
            </div>

            {/* Headline */}
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: Math.max(8, Math.min(14, item.w * item.h * 1.5)),
                color: theme.textColor,
                lineHeight: 1.2,
                fontFamily: theme.font,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: Math.max(2, item.h * 2),
                WebkitBoxOrient: "vertical",
                flexShrink: 1,
              }}
            >
              {item.story.headline}
            </p>

            {/* Deck — only when large enough */}
            {item.w >= 2 && item.h >= 3 && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: 8,
                  color: theme.subColor,
                  lineHeight: 1.4,
                  fontStyle: "italic",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: item.h,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.story.deck}
              </p>
            )}
          </div>
        );
      })}

      {/* Empty state */}
      {items.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            pointerEvents: "none",
          }}
        >
          <div style={{ fontSize: 22, opacity: 0.2 }}>📰</div>
          <p
            style={{
              color: theme.subColor,
              fontSize: 11,
              textAlign: "center",
              margin: 0,
            }}
          >
            Drag stories here to build your front page
          </p>
          <p
            style={{
              color: theme.subColor + "88",
              fontSize: 9,
              textAlign: "center",
              margin: 0,
            }}
          >
            Up to {MAX_HEADLINES} headlines · Drag edges to resize &amp; weight
          </p>
        </div>
      )}

      {/* Max banner */}
      {items.length >= MAX_HEADLINES && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: theme.textColor + "dd",
            color: theme.bgColor,
            fontSize: 9,
            textAlign: "center",
            padding: "4px 0",
            letterSpacing: "0.08em",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          MAX {MAX_HEADLINES} HEADLINES PLACED
        </div>
      )}
    </div>
  );
}
