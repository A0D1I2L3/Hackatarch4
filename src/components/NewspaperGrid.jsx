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
//  CELL VALUE MATRIX
// ─────────────────────────────────────────────────────────────
export const CELL_VALUE_MATRIX = [
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

function computeWeight(item) {
  let total = 0;
  for (let r = item.row; r < item.row + item.h; r++)
    for (let c = item.col; c < item.col + item.w; c++) {
      const rowVals = CELL_VALUE_MATRIX[r];
      if (rowVals) total += rowVals[c] ?? 0;
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
//  RESIZE EDGE DETECTION
// ─────────────────────────────────────────────────────────────
const EDGE_PX = 10;

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
//  DEFAULT THEME
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────────────────────
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
  const [ghostRect, setGhostRect] = useState(null);
  const [hoverEdge, setHoverEdge] = useState(null);
  // ── CHANGE 3: track if something is being dragged over delete zone
  const [deleteZoneActive, setDeleteZoneActive] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState(null);

  const gridRef = useRef(null);

  // ── CHANGE 4: compute whether grid is fully covered (no whitespace)
  const gridFull = useCallback((currentItems) => {
    const occupied = occupiedCells(currentItems);
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (!occupied.has(`${c},${r}`)) return false;
    return true;
  }, []);

  useEffect(() => {
    // Pass items AND fullness flag to parent
    onGridChange?.(items, gridFull(items));
  }, [items, onGridChange, gridFull]);

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
      // Ignore if this was a placed-card drag (handled by delete zone / card logic)
      if (!draggedStory) return;

      const cell = pxToCell(e.clientX, e.clientY);
      if (!cell) return;

      // Check if dropping onto an existing placed card — REPLACE it (before any other guards)
      const targetItem = items.find(
        (it) =>
          cell.col >= it.col &&
          cell.col < it.col + it.w &&
          cell.row >= it.row &&
          cell.row < it.row + it.h,
      );

      if (targetItem) {
        // Same story dropped on itself — no-op
        if (targetItem.story.story_id === draggedStory.story_id) return;
        // Swap story in place, keep position + size, clear any pre-expand memory
        setItems((prev) =>
          prev.map((it) =>
            it.id === targetItem.id
              ? {
                  ...it,
                  id: draggedStory.story_id,
                  story: draggedStory,
                  preExpandW: null,
                  preExpandH: null,
                }
              : it,
          ),
        );
        return;
      }

      // DROP INTO EMPTY SPACE
      // Guard: same story already placed somewhere else — no duplicate
      if (items.some((it) => it.story.story_id === draggedStory.story_id))
        return;
      if (items.length >= MAX_HEADLINES) return; // grid full, no free slot

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

  // ── Double-click: expand to fill available space; second click restores pre-expand size ──
  const handleDoubleClick = useCallback((e, id) => {
    e.stopPropagation();
    setItems((prev) => {
      const item = prev.find((it) => it.id === id);
      if (!item) return prev;
      const others = prev.filter((it) => it.id !== id);

      // If the item was previously expanded (preExpandW/H stored), restore those dims
      if (item.preExpandW != null && item.preExpandH != null) {
        const rw = item.preExpandW;
        const rh = item.preExpandH;
        // Verify the restore size still fits (others may have moved)
        const restoreOk = canPlace(others, item.col, item.row, rw, rh);
        return prev.map((it) =>
          it.id === id
            ? {
                ...it,
                w: restoreOk ? rw : DEFAULT_W,
                h: restoreOk ? rh : DEFAULT_H,
                preExpandW: null,
                preExpandH: null,
              }
            : it,
        );
      }

      // Greedy-expand: find the largest (w,h) that fits from this origin
      let bestW = item.w;
      let bestH = item.h;
      for (let w = item.w; w <= COLS - item.col; w++) {
        let rowBest = item.h;
        for (let h = item.h; h <= ROWS - item.row; h++) {
          if (canPlace(others, item.col, item.row, w, h)) rowBest = h;
          else break;
        }
        if (canPlace(others, item.col, item.row, w, rowBest)) {
          bestW = w;
          bestH = rowBest;
        } else break;
      }

      // Nothing to expand into — no-op
      if (bestW === item.w && bestH === item.h) return prev;

      // Store pre-expand size so second double-click can restore it
      return prev.map((it) =>
        it.id === id
          ? {
              ...it,
              w: bestW,
              h: bestH,
              preExpandW: item.w,
              preExpandH: item.h,
            }
          : it,
      );
    });
  }, []);

  // ── Pointer-based resize ──────────────────────────────────
  const handleCardPointerMove = useCallback(
    (e, id) => {
      if (resizing) return;
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
      if (!edge) return;
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
              // Clear preExpand memo when user manually resizes — new size is the baseline
              it.id === resizing.id
                ? { ...it, col, row, w, h, preExpandW: null, preExpandH: null }
                : it,
            ),
          );
        }
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

  function absStyle(col, row, w, h, inset = 2) {
    return {
      position: "absolute",
      left: `calc(${col} * (100% / ${COLS}) + ${inset}px)`,
      top: `calc(${row} * (100% / ${ROWS}) + ${inset}px)`,
      width: `calc(${w} * (100% / ${COLS}) - ${inset * 2}px)`,
      height: `calc(${h} * (100% / ${ROWS}) - ${inset * 2}px)`,
    };
  }

  // ── Auto font size: properly scales with card area and headline length ──
  function autoFontSize(item) {
    const area = item.w * item.h; // grid-cell area (1–100)
    const len = item.story.headline.length; // character count
    // Base grows with card area; shrinks for long headlines
    // Clamp: 7px minimum (tiny card) → 22px maximum (hero card)
    const base = 5 + area * 1.1;
    const scaled = base * (30 / Math.max(len, 20));
    return Math.max(7, Math.min(22, scaled));
  }

  // ── Auto deck (subheading) font size ─────────────────────────────────────
  // Deck is always visually subordinate to the headline but must scale with
  // the card so it reads legibly on large cards and stays quiet on small ones.
  function autoDeckFontSize(item) {
    const area = item.w * item.h;
    const headlinePx = autoFontSize(item); // deck is always < headline
    const len = (item.story.deck || "").length;
    // Scale from ~60% of headline size on small cards to ~75% on large ones
    const ratio = 0.6 + Math.min(area / 80, 0.15); // 0.60–0.75
    const base = headlinePx * ratio;
    // Nudge down for very long deck text so it still fits
    const lengthPenalty = Math.max(0, (len - 60) * 0.02);
    return Math.max(7, Math.min(14, base - lengthPenalty));
  }

  // ── Deck line clamp: how many deck lines to allow based on card height ────
  function deckLineClamp(item) {
    if (item.h <= 3) return 2;
    if (item.h <= 5) return 3;
    if (item.h <= 7) return 4;
    return 5;
  }

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
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
      {/* Grid cell backgrounds */}
      {Array.from({ length: ROWS }).map((_, r) =>
        Array.from({ length: COLS }).map((_, c) => {
          const val = CELL_VALUE_MATRIX[r]?.[c] ?? 1;
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
        const showEdge = hoverEdge?.id === item.id && !resizing;

        return (
          <div
            key={item.id}
            draggable={!published && !resizing}
            onDragStart={(e) => {
              if (published || resizing) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", item.id);
              setDraggingCardId(item.id);
            }}
            onDragEnd={() => setDraggingCardId(null)}
            onDragOver={(e) => {
              // Only accept drops from the pool (draggedStory set), not from other cards
              if (!published && draggedStory && !draggingCardId) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = "move";
              }
            }}
            onDrop={(e) => {
              if (!published && draggedStory && !draggingCardId) {
                e.preventDefault();
                e.stopPropagation();
                // Same story dropped on itself — no-op
                if (item.story.story_id === draggedStory.story_id) return;
                // Replace this card's story, keep its size + position
                setItems((prev) =>
                  prev.map((it) =>
                    it.id === item.id
                      ? {
                          ...it,
                          id: draggedStory.story_id,
                          story: draggedStory,
                          preExpandW: null,
                          preExpandH: null,
                        }
                      : it,
                  ),
                );
              }
            }}
            onPointerMove={(e) => handleCardPointerMove(e, item.id)}
            onPointerLeave={handleCardPointerLeave}
            onPointerDown={(e) => handleCardPointerDown(e, item.id)}
            onDoubleClick={(e) => !published && handleDoubleClick(e, item.id)}
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
                : draggingCardId === item.id
                  ? "0 8px 28px rgba(0,0,0,0.30)"
                  : "0 2px 8px rgba(0,0,0,0.12)",
              opacity: draggingCardId === item.id ? 0.45 : 1,
              transition: isResizingThis
                ? "none"
                : "box-shadow 0.15s, opacity 0.15s",
              touchAction: "none",
              cursor: resizing ? undefined : "grab",
            }}
          >
            {/* Edge highlight strips */}
            {showEdge && !published && (
              <>
                {["top", "bottom"].map((pos) => (
                  <div
                    key={pos}
                    style={{
                      position: "absolute",
                      [pos]: 0,
                      left: 0,
                      right: 0,
                      height: 6,
                      background: "#c8a96e44",
                      borderRadius:
                        pos === "top" ? "4px 4px 0 0" : "0 0 4px 4px",
                      pointerEvents: "none",
                    }}
                  />
                ))}
                {["left", "right"].map((pos) => (
                  <div
                    key={pos}
                    style={{
                      position: "absolute",
                      top: 0,
                      [pos]: 0,
                      bottom: 0,
                      width: 6,
                      background: "#c8a96e44",
                      borderRadius:
                        pos === "left" ? "4px 0 0 4px" : "0 4px 4px 0",
                      pointerEvents: "none",
                    }}
                  />
                ))}
              </>
            )}

            {/* Remove button */}
            {!published && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
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

            {/* Weight badge */}
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

            {/* Resize hint + double-click hint */}
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
                ⟺ drag edges · dbl-click to fill
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

            {/* Headline with proper auto font size */}
            <p
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: autoFontSize(item),
                color: theme.textColor,
                lineHeight: 1.15,
                fontFamily: theme.font,
                overflow: "hidden",
                display: "-webkit-box",
                // clamp lines based on card height & font size so text never overflows
                WebkitLineClamp: Math.max(2, Math.floor(item.h * 1.8)),
                WebkitBoxOrient: "vertical",
                flexShrink: 1,
                wordBreak: "break-word",
              }}
            >
              {item.story.headline}
            </p>

            {/* Deck — scales with card size */}
            {item.w >= 2 && item.h >= 3 && item.story.deck && (
              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: autoDeckFontSize(item),
                  color: theme.subColor,
                  lineHeight: 1.45,
                  fontStyle: "italic",
                  fontFamily: theme.font,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: deckLineClamp(item),
                  WebkitBoxOrient: "vertical",
                  flexShrink: 1,
                  wordBreak: "break-word",
                }}
              >
                {item.story.deck}
              </p>
            )}
          </div>
        );
      })}

      {/* CHANGE 3: Delete zone — bottom-left corner */}
      {!published && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (draggedStory || draggingCardId) setDeleteZoneActive(true);
          }}
          onDragLeave={() => setDeleteZoneActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDeleteZoneActive(false);
            // Handle drag from placed cards (draggingCardId) OR from pool (draggedStory)
            if (draggingCardId) {
              setItems((prev) => prev.filter((it) => it.id !== draggingCardId));
              setDraggingCardId(null);
            } else if (draggedStory) {
              setItems((prev) =>
                prev.filter(
                  (it) => it.story.story_id !== draggedStory.story_id,
                ),
              );
            }
          }}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 64,
            height: 64,
            background: deleteZoneActive
              ? "rgba(239,68,68,0.18)"
              : "rgba(239,68,68,0.07)",
            border: `1.5px dashed ${deleteZoneActive ? "#ef4444" : "#ef444488"}`,
            borderRadius: "0 8px 0 4px",
            zIndex: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            color: deleteZoneActive ? "#ef4444" : "#ef444488",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            flexDirection: "column",
            gap: 2,
            pointerEvents: "auto",
            transition: "background 0.15s, color 0.15s, border-color 0.15s",
          }}
        >
          <span style={{ fontSize: 14 }}>✕</span>
          <span>Remove</span>
        </div>
      )}

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
            Up to {MAX_HEADLINES} headlines · Drag edges to resize ·
            Double-click to auto-fill
          </p>
        </div>
      )}

      {/* Max banner */}
      {items.length >= MAX_HEADLINES && !gridFull(items) && (
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
          ALL STORIES PLACED — RESIZE TO FILL THE PAGE BEFORE SUBMITTING
        </div>
      )}

      {/* CHANGE 4: Full-grid achieved banner */}
      {gridFull(items) && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#2d6a4fdd",
            color: "#fff",
            fontSize: 9,
            textAlign: "center",
            padding: "4px 0",
            letterSpacing: "0.08em",
            pointerEvents: "none",
            zIndex: 20,
          }}
        >
          FRONT PAGE COMPLETE — READY TO PUBLISH
        </div>
      )}
    </div>
  );
}
