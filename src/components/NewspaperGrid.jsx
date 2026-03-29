import React, { useState, useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
//  NEWSPAPER GRID  —  BSP autotiler (zero external deps)
//
//  Bugs fixed vs previous version:
//    1. insertLeaf now computes the ACTUAL depth of the target
//       leaf before splitting — no more wrong direction / silent
//       no-ops that swallowed every story after the first.
//    2. onDrop reads tree & focusId from refs (always current),
//       eliminating stale-closure misses.
//    3. "already in grid" guard uses object-reference identity
//       (l.story === draggedStory) not a fragile string hash.
//    4. Internal pane drags stamp "ng-pane-id" on dataTransfer
//       so external-drop handler ignores them correctly.
//    5. Grid uses 3:4 aspect ratio — more vertical real estate.
//    6. MAX_HEADLINES bumped to 6.
//
//  Controls (unchanged):
//    • Drag story onto empty grid        → place first pane
//    • Drag story onto grid (not full)   → splits focused pane
//    • Drag story onto grid (full)       → replace pane under cursor
//    • Drag pane onto another pane       → swap stories
//    • Drag pane to DELETE ZONE          → remove it
//    • LMB drag on divider bar           → resize split
//    • RMB drag on pane                  → resize parent split
//    • × button on pane                  → remove
// ─────────────────────────────────────────────────────────────

const MAX_HEADLINES = 6;

export const CELL_VALUE_MATRIX = [
  [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
  [2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2, 2.2],
  [1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9],
  [1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6, 1.6],
  [1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35, 1.35],
  [1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1],
  [0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85, 0.85],
  [0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65, 0.65],
  [0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
  [0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3],
];

function computePaneWeight(x, y, w, h, totalW, totalH) {
  const R = CELL_VALUE_MATRIX.length,
    C = CELL_VALUE_MATRIX[0].length;
  const pts = [
    [x + w * 0.1, y + h * 0.1],
    [x + w * 0.9, y + h * 0.1],
    [x + w * 0.1, y + h * 0.9],
    [x + w * 0.9, y + h * 0.9],
    [x + w * 0.5, y + h * 0.5],
  ];
  let t = 0;
  for (const [px, py] of pts)
    t +=
      CELL_VALUE_MATRIX[Math.min(R - 1, Math.floor((py / totalH) * R))][
        Math.min(C - 1, Math.floor((px / totalW) * C))
      ];
  return Math.round((t / 5) * ((w * h) / (totalW * totalH)) * 1000) / 10;
}

const TAG_COLORS = {
  Investigative: "#8b1a1a",
  Politics: "#1a3a8b",
  Crime: "#5a1a1a",
  Culture: "#4a1a6a",
  Health: "#1a5a2a",
  Business: "#3a3a1a",
  Environment: "#1a5a4a",
  Technology: "#1a2a7a",
  Staff: "#7a3a1a",
  default: "#5a5040",
};

const DEFAULT_THEME = {
  cardBg: "#fff",
  cardBorder: "#c8a96e88",
  textColor: "#0f172a",
  subColor: "#475569",
  accentGold: "#c8a96e",
  bgColor: "#f5f1e8",
  font: "'Georgia', serif",
  mono: "'Courier New', monospace",
  darkMode: false,
};

const ANIM_CSS = `
@keyframes ngIn    { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
@keyframes ngSwap  { 0%{opacity:1;transform:scale(1)} 40%{opacity:0;transform:scale(.86)}
                     60%{opacity:0;transform:scale(.86)} 100%{opacity:1;transform:scale(1)} }
@keyframes ngGhost { 0%,100%{opacity:.45} 50%{opacity:.9} }
@keyframes ngGlow  { 0%,100%{opacity:.3}  50%{opacity:.9} }
@keyframes ngDeletePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
`;

// ─────────────────────────────────────────────────────────────
//  BSP HELPERS
// ─────────────────────────────────────────────────────────────
function getLeaves(node) {
  if (!node) return [];
  if (node.type === "leaf") return [node];
  return [...getLeaves(node.left), ...getLeaves(node.right)];
}

// FIX 1: Compute the actual depth of a specific leaf in the tree.
// This is used to choose the correct split direction (v / h).
function getLeafDepth(root, targetId, depth = 0) {
  if (!root) return -1;
  if (root.type === "leaf") return root.id === targetId ? depth : -1;
  const l = getLeafDepth(root.left, targetId, depth + 1);
  if (l !== -1) return l;
  return getLeafDepth(root.right, targetId, depth + 1);
}

// Split the leaf whose id === targetId, inserting newLeaf beside it.
// Direction alternates based on the leaf's ACTUAL depth in the tree.
function insertLeaf(root, targetId, newLeaf) {
  const depth = root ? getLeafDepth(root, targetId) : 0;
  return _insert(root, targetId, newLeaf, depth);
}

function _insert(node, targetId, newLeaf, splitDepth) {
  if (!node) return newLeaf;
  if (node.type === "leaf") {
    if (node.id !== targetId) return node; // wrong leaf, leave alone
    const dir = splitDepth % 2 === 0 ? "v" : "h"; // even depth → vertical
    return { type: "split", dir, ratio: 0.5, left: node, right: newLeaf };
  }
  // Route into exactly one subtree — never recurse both sides
  const inLeft = getLeaves(node.left).some((l) => l.id === targetId);
  if (inLeft)
    return { ...node, left: _insert(node.left, targetId, newLeaf, splitDepth) };
  const inRight = getLeaves(node.right).some((l) => l.id === targetId);
  if (inRight)
    return {
      ...node,
      right: _insert(node.right, targetId, newLeaf, splitDepth),
    };
  return node; // targetId not in this subtree
}

function removeLeaf(root, id) {
  if (!root) return null;
  if (root.type === "leaf") return root.id === id ? null : root;
  const l = removeLeaf(root.left, id);
  const r = removeLeaf(root.right, id);
  if (!l) return r;
  if (!r) return l;
  return { ...root, left: l, right: r };
}

function replaceLeafStory(root, id, story) {
  if (!root) return null;
  if (root.type === "leaf") return root.id === id ? { ...root, story } : root;
  return {
    ...root,
    left: replaceLeafStory(root.left, id, story),
    right: replaceLeafStory(root.right, id, story),
  };
}

function swapLeafStories(root, idA, idB) {
  const leaves = getLeaves(root);
  const sA = leaves.find((l) => l.id === idA)?.story;
  const sB = leaves.find((l) => l.id === idB)?.story;
  if (!sA || !sB) return root;
  return replaceLeafStory(replaceLeafStory(root, idA, sB), idB, sA);
}

function updateNodeRatio(root, target, ratio) {
  if (!root) return root;
  if (root === target) return { ...root, ratio };
  if (root.type === "leaf") return root;
  return {
    ...root,
    left: updateNodeRatio(root.left, target, ratio),
    right: updateNodeRatio(root.right, target, ratio),
  };
}

// ─────────────────────────────────────────────────────────────
//  LAYOUT
// ─────────────────────────────────────────────────────────────
function layoutTree(node, x, y, w, h) {
  if (!node) return [];
  if (node.type === "leaf")
    return [{ id: node.id, story: node.story, x, y, w, h }];
  const r = node.ratio ?? 0.5;
  if (node.dir === "v") {
    const lw = w * r;
    return [
      ...layoutTree(node.left, x, y, lw, h),
      ...layoutTree(node.right, x + lw, y, w - lw, h),
    ];
  }
  const lh = h * r;
  return [
    ...layoutTree(node.left, x, y, w, lh),
    ...layoutTree(node.right, x, y + lh, w, h - lh),
  ];
}

function collectSplits(node, x, y, w, h) {
  if (!node || node.type === "leaf") return [];
  const r = node.ratio ?? 0.5;
  if (node.dir === "v") {
    const lw = w * r;
    return [
      { node, x: x + lw, y, w, h, dir: "v" },
      ...collectSplits(node.left, x, y, lw, h),
      ...collectSplits(node.right, x + lw, y, w - lw, h),
    ];
  }
  const lh = h * r;
  return [
    { node, x, y: y + lh, w, h, dir: "h" },
    ...collectSplits(node.left, x, y, w, lh),
    ...collectSplits(node.right, x, y + lh, w, h - lh),
  ];
}

// ─────────────────────────────────────────────────────────────
//  FONT SCALING
// ─────────────────────────────────────────────────────────────
const headlineSize = (w, h) =>
  Math.round(Math.max(9, Math.min(38, Math.sqrt(w * h * 0.7) * 0.12)));
const deckSize = (w, h) =>
  Math.round(Math.max(8, Math.min(15, Math.sqrt(w * h * 0.7) * 0.055)));
const tagSize = (s) => Math.round(Math.max(7, Math.min(11, s * 0.55)));

function findParentSplit(root, leafId) {
  if (!root || root.type === "leaf") return null;
  const inLeft = getLeaves(root.left).some((l) => l.id === leafId);
  const inRight = getLeaves(root.right).some((l) => l.id === leafId);
  if (inLeft || inRight) return root;
  return (
    findParentSplit(root.left, leafId) || findParentSplit(root.right, leafId)
  );
}

let _seq = 0;
const newLeafId = () => `pane_${++_seq}_${Date.now()}`;

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

  const [tree, setTree] = useState(null);
  const [focusId, setFocusId] = useState(null);

  // FIX 2: Refs that are always current — used inside drag callbacks
  // to avoid stale closures from React's synthetic event batching.
  const treeRef = useRef(null);
  const focusRef = useRef(null);
  // FIX 6: Keep draggedStory prop in a ref so onDrop always sees the
  // current value even if the callback closure hasn't been recreated yet.
  const draggedStoryRef = useRef(draggedStory);
  useEffect(() => {
    draggedStoryRef.current = draggedStory;
  }, [draggedStory]);

  // Wrapper: keeps ref in sync whenever tree changes
  const updateTree = useCallback((updaterOrValue) => {
    setTree((prev) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(prev)
          : updaterOrValue;
      treeRef.current = next;
      return next;
    });
  }, []);

  const updateFocus = useCallback((id) => {
    focusRef.current = id;
    setFocusId(id);
  }, []);

  // External drag counters / state
  const [extOver, setExtOver] = useState(false);
  const [extGhostId, setExtGhostId] = useState(null);
  const dragCounter = useRef(0);

  // Internal pane drag
  const [intDragId, setIntDragId] = useState(null);
  const [intGhostId, setIntGhostId] = useState(null);
  const intDragRef = useRef(null); // FIX 2 (same pattern)

  // Delete zone
  const [deleteHover, setDeleteHover] = useState(false);
  const [anyDragging, setAnyDragging] = useState(false);

  // Animations
  const [animIn, setAnimIn] = useState(() => new Set());
  const [animSwap, setAnimSwap] = useState(() => new Set());

  const containerRef = useRef(null);
  const divDragRef = useRef(null);
  const scaleDragRef = useRef(null);
  const [dim, setDim] = useState({ W: 600, H: 800 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0) setDim({ W: width, H: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById("ng-css")) return;
    const s = document.createElement("style");
    s.id = "ng-css";
    s.textContent = ANIM_CSS;
    document.head.appendChild(s);
  }, []);

  const { W, H } = dim;

  // Publish grid state upward
  useEffect(() => {
    if (!onGridChange) return;
    const panes = layoutTree(treeRef.current, 0, 0, W, H);
    onGridChange(
      panes.map((p) => ({
        id: p.id,
        story: p.story,
        col: Math.round((p.x / W) * 10),
        row: Math.round((p.y / H) * 10),
        w: Math.max(1, Math.round((p.w / W) * 10)),
        h: Math.max(1, Math.round((p.h / H) * 10)),
        weight: computePaneWeight(p.x, p.y, p.w, p.h, W, H),
      })),
    );
  }, [tree, W, H, onGridChange]);

  const fireAnim = (setter, id, ms) => {
    setter((p) => new Set([...p, id]));
    setTimeout(
      () =>
        setter((p) => {
          const s = new Set(p);
          s.delete(id);
          return s;
        }),
      ms,
    );
  };

  const relPos = (e) => {
    const r = containerRef.current?.getBoundingClientRect();
    return r
      ? { px: e.clientX - r.left, py: e.clientY - r.top }
      : { px: 0, py: 0 };
  };

  const hitPane = (panes, px, py) =>
    panes.find(
      (p) => px >= p.x && px < p.x + p.w && py >= p.y && py < p.y + p.h,
    ) ?? null;

  // ─────────────────────────────────────────────────────────
  //  EXTERNAL DROP
  // ─────────────────────────────────────────────────────────
  const onDragEnter = useCallback((e) => {
    e.preventDefault();
    dragCounter.current++;
    setExtOver(true);
  }, []);

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
      const currentTree = treeRef.current;
      const leaves = getLeaves(currentTree);
      if (leaves.length >= MAX_HEADLINES) {
        const panes = layoutTree(currentTree, 0, 0, W, H);
        const { px, py } = relPos(e);
        setExtGhostId(hitPane(panes, px, py)?.id ?? null);
      } else {
        setExtGhostId(null);
      }
    },
    [W, H],
  );

  const onDragLeave = useCallback((e) => {
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setExtOver(false);
      setExtGhostId(null);
    }
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      dragCounter.current = 0;
      setExtOver(false);
      setExtGhostId(null);

      // FIX 4: Internal pane drags mark themselves — bail so we don't
      // treat a pane-swap as an external story drop.
      if (e.dataTransfer.getData("ng-pane-id")) return;

      // FIX 6: Read draggedStory from the always-current ref.
      const draggedStory = draggedStoryRef.current;
      if (!draggedStory) return;

      // FIX 2: Read always-current values from refs, not stale closure state.
      const currentTree = treeRef.current;
      const currentFocus = focusRef.current;

      const leaves = getLeaves(currentTree);
      const panes = layoutTree(currentTree, 0, 0, W, H);
      const { px, py } = relPos(e);
      const hit = hitPane(panes, px, py);

      // ── Case 1: grid empty ──────────────────────────────────
      if (!currentTree) {
        const id = newLeafId();
        const leaf = { type: "leaf", id, story: draggedStory };
        updateTree(leaf);
        updateFocus(id);
        fireAnim(setAnimIn, id, 360);
        return;
      }

      // ── Case 2: grid full → replace pane under cursor ───────
      if (leaves.length >= MAX_HEADLINES) {
        const target =
          hit ?? panes.find((p) => p.id === currentFocus) ?? panes[0];
        fireAnim(setAnimSwap, target.id, 430);
        updateTree((prev) => replaceLeafStory(prev, target.id, draggedStory));
        updateFocus(target.id);
        return;
      }

      // ── Case 3: same story object already placed → update ───
      // FIX 3: reference identity, not fragile string hash
      const existing = leaves.find((l) => l.story === draggedStory);
      if (existing) {
        fireAnim(setAnimSwap, existing.id, 430);
        updateTree((prev) => replaceLeafStory(prev, existing.id, draggedStory));
        return;
      }

      // ── Case 4: room available → split focused pane and add ─
      const splitId = currentFocus ?? leaves[leaves.length - 1].id;
      const id = newLeafId();
      const leaf = { type: "leaf", id, story: draggedStory };
      updateTree((prev) => insertLeaf(prev, splitId, leaf));
      updateFocus(id);
      fireAnim(setAnimIn, id, 360);
    },
    [W, H, updateTree, updateFocus],
  );

  // ─────────────────────────────────────────────────────────
  //  REMOVE
  // ─────────────────────────────────────────────────────────
  const doRemove = useCallback(
    (id) => {
      updateTree((prev) => {
        const next = removeLeaf(prev, id);
        const remaining = getLeaves(next);
        const nf =
          focusRef.current !== id
            ? focusRef.current
            : (remaining[0]?.id ?? null);
        focusRef.current = nf;
        setFocusId(nf);
        return next;
      });
    },
    [updateTree],
  );

  // ─────────────────────────────────────────────────────────
  //  DIVIDER DRAG
  // ─────────────────────────────────────────────────────────
  const onDividerDown = useCallback((e, s) => {
    e.preventDefault();
    e.stopPropagation();
    divDragRef.current = {
      s,
      sx: e.clientX,
      sy: e.clientY,
      r0: s.node.ratio ?? 0.5,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onDividerMove = useCallback(
    (e) => {
      const d = divDragRef.current;
      if (!d) return;
      const { s, sx, sy, r0 } = d;
      const nr =
        s.node.dir === "v"
          ? Math.max(0.06, Math.min(0.94, r0 + (e.clientX - sx) / s.w))
          : Math.max(0.06, Math.min(0.94, r0 + (e.clientY - sy) / s.h));
      updateTree((prev) => updateNodeRatio(prev, s.node, nr));
    },
    [updateTree],
  );

  const onDividerUp = useCallback(() => {
    divDragRef.current = null;
  }, []);

  // ─────────────────────────────────────────────────────────
  //  SCALE DRAG (RMB → resize parent split)
  // ─────────────────────────────────────────────────────────
  const onPaneRMB = useCallback(
    (e, id) => {
      if (e.button !== 2 || published) return;
      e.preventDefault();
      e.stopPropagation();
      const parent = findParentSplit(treeRef.current, id);
      if (!parent) return;
      const isLeft = getLeaves(parent.left).some((l) => l.id === id);
      scaleDragRef.current = {
        parent,
        isLeft,
        sx: e.clientX,
        sy: e.clientY,
        r0: parent.ratio ?? 0.5,
        dir: parent.dir,
      };
      const move = (ev) => {
        const d = scaleDragRef.current;
        if (!d) return;
        const delta =
          d.dir === "v" ? (ev.clientX - d.sx) / W : (ev.clientY - d.sy) / H;
        const nr = Math.max(
          0.06,
          Math.min(0.94, d.r0 + (d.isLeft ? 1 : -1) * delta),
        );
        updateTree((prev) => updateNodeRatio(prev, d.parent, nr));
      };
      const up = () => {
        scaleDragRef.current = null;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [published, W, H, updateTree],
  );

  // ─────────────────────────────────────────────────────────
  //  INTERNAL PANE DRAG (swap)
  // ─────────────────────────────────────────────────────────
  const onPaneDragStart = useCallback(
    (e, id) => {
      if (published) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("ng-pane-id", id); // FIX 4: mark as internal
      intDragRef.current = id;
      setIntDragId(id);
      setAnyDragging(true);
    },
    [published],
  );

  const onPaneDragOver = useCallback((e, targetId) => {
    if (!intDragRef.current || intDragRef.current === targetId) return;
    e.preventDefault();
    e.stopPropagation();
    setIntGhostId(targetId);
  }, []);

  const onPaneDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      e.stopPropagation();
      const srcId = intDragRef.current;
      if (!srcId || srcId === targetId) {
        intDragRef.current = null;
        setIntDragId(null);
        setIntGhostId(null);
        setAnyDragging(false);
        return;
      }
      fireAnim(setAnimSwap, srcId, 430);
      fireAnim(setAnimSwap, targetId, 430);
      updateTree((prev) => swapLeafStories(prev, srcId, targetId));
      intDragRef.current = null;
      setIntDragId(null);
      setIntGhostId(null);
      setAnyDragging(false);
    },
    [updateTree],
  );

  const onPaneDragEnd = useCallback(() => {
    intDragRef.current = null;
    setIntDragId(null);
    setIntGhostId(null);
    setAnyDragging(false);
  }, []);

  const onDeleteDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDeleteHover(true);
  }, []);
  const onDeleteDragLeave = useCallback(() => setDeleteHover(false), []);
  const onDeleteDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDeleteHover(false);
      const id = e.dataTransfer.getData("ng-pane-id") || intDragRef.current;
      if (id) doRemove(id);
      intDragRef.current = null;
      setIntDragId(null);
      setIntGhostId(null);
      setAnyDragging(false);
    },
    [doRemove],
  );

  // ─────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────
  const panes = layoutTree(tree, 0, 0, W, H);
  const splits = published ? [] : collectSplits(tree, 0, 0, W, H);
  const totalLeaves = getLeaves(tree).length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        width: "100%",
      }}
    >
      {/* ══ GRID ══════════════════════════════════════════════ */}
      <div
        ref={containerRef}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/4", // taller = more real estate
          background: theme.darkMode ? "#1a160f" : "#c8a96e11",
          border: `1.5px solid ${extOver ? "#2d6a4f" : theme.accentGold}`,
          borderRadius: 6,
          overflow: "hidden",
          transition: "border-color 0.2s",
          userSelect: "none",
        }}
      >
        {/* Pane cards */}
        {panes.map(({ id, story, x, y, w, h }) => {
          const isFocused = focusId === id;
          const isExtGhost = extGhostId === id;
          const isIntGhost = intGhostId === id;
          const isGhost = isExtGhost || isIntGhost;
          const isDragging = intDragId === id;
          const hSize = headlineSize(w, h);
          const dSize = deckSize(w, h);
          const tSize = tagSize(hSize);
          const weight = computePaneWeight(x, y, w, h, W, H);
          const frac = (w * h) / (W * H);
          const showDeck = frac > 0.08 && story?.deck;
          const showTag = hSize >= 9 && story?.tag;
          const pad = Math.max(6, Math.round(hSize * 0.5));
          const tagClr = TAG_COLORS[story?.tag] || TAG_COLORS.default;
          const maxL = Math.max(2, Math.floor(h / (hSize * 1.38)));

          let anim = {};
          if (animIn.has(id))
            anim = { animation: "ngIn .34s cubic-bezier(.22,1,.36,1) both" };
          else if (animSwap.has(id))
            anim = { animation: "ngSwap .42s cubic-bezier(.22,1,.36,1) both" };

          return (
            <div
              key={id}
              draggable={!published}
              onDragStart={(e) => onPaneDragStart(e, id)}
              onDragOver={(e) => onPaneDragOver(e, id)}
              onDrop={(e) => onPaneDrop(e, id)}
              onDragEnd={onPaneDragEnd}
              onClick={() => !isDragging && updateFocus(id)}
              onMouseDown={(e) => onPaneRMB(e, id)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                position: "absolute",
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                width: `${(w / W) * 100}%`,
                height: `${(h / H) * 100}%`,
                boxSizing: "border-box",
                padding: pad,
                paddingBottom: pad + 16,
                background: isGhost
                  ? "transparent"
                  : isDragging
                    ? `${theme.cardBg}88`
                    : theme.cardBg,
                border: isGhost
                  ? `2px dashed ${theme.accentGold}`
                  : isFocused
                    ? `2px solid ${theme.accentGold}`
                    : `1px solid ${theme.cardBorder}`,
                borderRadius: 2,
                overflow: "hidden",
                cursor: published
                  ? "default"
                  : isDragging
                    ? "grabbing"
                    : "grab",
                display: "flex",
                flexDirection: "column",
                gap: Math.max(2, Math.round(hSize * 0.2)),
                zIndex: 2,
                opacity: isDragging ? 0.35 : 1,
                transition: "border-color .15s, opacity .18s, background .18s",
                ...anim,
              }}
            >
              {/* Ghost overlay */}
              {isGhost && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `${theme.accentGold}18`,
                    animation: "ngGhost 1s ease-in-out infinite",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 50,
                  }}
                >
                  <span
                    style={{
                      fontSize: 9,
                      color: theme.accentGold,
                      fontFamily: theme.mono,
                      letterSpacing: ".1em",
                      background: `${theme.cardBg}f2`,
                      padding: "3px 9px",
                      borderRadius: 3,
                      border: `1px dashed ${theme.accentGold}`,
                    }}
                  >
                    {isIntGhost ? "↔ SWAP" : "⬇ REPLACE"}
                  </span>
                </div>
              )}

              {/* Remove × */}
              {!published && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    doRemove(id);
                  }}
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    background: theme.cardBorder,
                    border: "none",
                    borderRadius: "50%",
                    width: 16,
                    height: 16,
                    cursor: "pointer",
                    fontSize: 10,
                    color: theme.textColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 10,
                    padding: 0,
                    transition: "background .12s, transform .1s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#e74c3c";
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.transform = "scale(1.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.cardBorder;
                    e.currentTarget.style.color = theme.textColor;
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  ×
                </button>
              )}

              {/* Weight */}
              <div
                style={{
                  position: "absolute",
                  bottom: 3,
                  right: 3,
                  background: theme.textColor,
                  color: theme.bgColor ?? "#f5f1e8",
                  fontSize: 7,
                  fontWeight: 700,
                  padding: "1px 4px",
                  borderRadius: 2,
                  letterSpacing: ".04em",
                  zIndex: 10,
                }}
              >
                ◼ {weight}
              </div>

              {/* Focus dot */}
              {isFocused && !published && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 3,
                    left: 4,
                    fontSize: 6,
                    color: theme.accentGold,
                    fontFamily: theme.mono,
                    letterSpacing: ".06em",
                  }}
                >
                  ● FOCUS
                </div>
              )}

              {/* RMB hint */}
              {isFocused && !published && totalLeaves > 1 && (
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 4,
                    fontSize: 6,
                    color: `${theme.accentGold}99`,
                    fontFamily: theme.mono,
                    pointerEvents: "none",
                  }}
                >
                  RMB·SCALE
                </div>
              )}

              {/* Tag */}
              {showTag && !isGhost && (
                <span
                  style={{
                    fontSize: tSize,
                    fontWeight: 700,
                    letterSpacing: ".07em",
                    textTransform: "uppercase",
                    color: tagClr,
                    fontFamily: theme.mono,
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {story.tag}
                </span>
              )}

              {/* Headline */}
              {!isGhost && (
                <p
                  style={{
                    margin: 0,
                    fontSize: hSize,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    color: theme.textColor,
                    fontFamily: theme.font,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: maxL,
                    WebkitBoxOrient: "vertical",
                    flexShrink: 1,
                  }}
                >
                  {story?.headline}
                </p>
              )}

              {/* Deck */}
              {showDeck && !isGhost && (
                <p
                  style={{
                    margin: 0,
                    fontSize: dSize,
                    color: theme.subColor,
                    lineHeight: 1.45,
                    fontStyle: "italic",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: Math.max(1, Math.floor(h / (dSize * 2.7))),
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {story.deck}
                </p>
              )}
            </div>
          );
        })}

        {/* Divider handles */}
        {splits.map((s, i) => {
          const T = 9,
            v = s.dir === "v";
          return (
            <div
              key={i}
              onPointerDown={(e) => onDividerDown(e, s)}
              onPointerMove={onDividerMove}
              onPointerUp={onDividerUp}
              style={{
                position: "absolute",
                left: v
                  ? `calc(${(s.x / W) * 100}% - ${T / 2}px)`
                  : `${(s.x / W) * 100}%`,
                top: v
                  ? `${(s.y / H) * 100}%`
                  : `calc(${(s.y / H) * 100}% - ${T / 2}px)`,
                width: v ? T : `${(s.w / W) * 100}%`,
                height: v ? `${(s.h / H) * 100}%` : T,
                cursor: v ? "col-resize" : "row-resize",
                zIndex: 20,
                background: "transparent",
                backgroundImage: v
                  ? `linear-gradient(to right,transparent 35%,${theme.accentGold}99 35%,${theme.accentGold}99 65%,transparent 65%)`
                  : `linear-gradient(to bottom,transparent 35%,${theme.accentGold}99 35%,${theme.accentGold}99 65%,transparent 65%)`,
                animation: "ngGlow 2.2s ease-in-out infinite",
              }}
            />
          );
        })}

        {/* Empty state */}
        {totalLeaves === 0 && !extOver && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 26, opacity: 0.15 }}>📰</div>
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
                color: `${theme.subColor}77`,
                fontSize: 9,
                textAlign: "center",
                margin: 0,
              }}
            >
              Up to {MAX_HEADLINES} headlines · LMB drag dividers · RMB drag
              pane to scale
            </p>
          </div>
        )}

        {/* Drop hint bar */}
        {extOver && totalLeaves < MAX_HEADLINES && !extGhostId && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 30,
              pointerEvents: "none",
              background: "#2d6a4fcc",
              padding: "5px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#fff",
                fontFamily: DEFAULT_THEME.mono,
                letterSpacing: ".1em",
              }}
            >
              {totalLeaves === 0
                ? "DROP TO PLACE"
                : `SPLITS FOCUSED PANE · ${totalLeaves + 1}/${MAX_HEADLINES}`}
            </span>
          </div>
        )}

        {/* Full banner */}
        {totalLeaves >= MAX_HEADLINES && !anyDragging && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: `${theme.textColor}cc`,
              color: theme.bgColor ?? "#f5f1e8",
              fontSize: 9,
              textAlign: "center",
              padding: "4px 0",
              letterSpacing: ".08em",
              pointerEvents: "none",
              zIndex: 40,
            }}
          >
            FULL · DRAG PANES TO SWAP · DROP STORY TO REPLACE
          </div>
        )}
      </div>

      {/* Delete zone */}
      {anyDragging && !published && (
        <div
          onDragOver={onDeleteDragOver}
          onDragLeave={onDeleteDragLeave}
          onDrop={onDeleteDrop}
          style={{
            width: "100%",
            height: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            borderRadius: 6,
            background: deleteHover ? "#e74c3c22" : "#00000008",
            border: `2px dashed ${deleteHover ? "#e74c3c" : "#c0a07088"}`,
            transition: "background .15s, border-color .15s",
            cursor: "copy",
            animation: deleteHover
              ? "ngDeletePulse .6s ease-in-out infinite"
              : "none",
          }}
        >
          <span
            style={{
              fontSize: 18,
              lineHeight: 1,
              filter: deleteHover ? "none" : "grayscale(1) opacity(0.5)",
              transition: "filter .15s",
            }}
          >
            🗑️
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: DEFAULT_THEME.mono,
              letterSpacing: ".1em",
              color: deleteHover ? "#e74c3c" : theme.subColor,
              transition: "color .15s",
            }}
          >
            {deleteHover ? "RELEASE TO REMOVE" : "DRAG HERE TO REMOVE"}
          </span>
        </div>
      )}
    </div>
  );
}
