import { SYSTEM_PROMPT } from "./constants.js";

// ─── API KEY ──────────────────────────────────────────────────────────────────
const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY || "";

// ─── DEV LOGGING ─────────────────────────────────────────────────────────────
const DEV = import.meta.env.DEV;
const log = (...args) => {
  if (DEV) console.log("[Editor]", ...args);
};

// ─── BUILD REQUEST PAYLOAD ────────────────────────────────────────────────────
function buildPayload(gameState) {
  const {
    day,
    scores,
    slots, // array of { story_id, headline, col, row, w, h, weight }
    factors, // [{ factor_id, name, type, pressure, description, player_response }]
    arcFlags, // string[]
  } = gameState;

  // grid_layout: array sorted by weight descending
  const gridLayout = [...slots]
    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))
    .map((it) => ({
      story_id: it.story_id,
      headline: it.headline,
      col: it.col,
      row: it.row,
      w: it.w,
      h: it.h,
      weight: it.weight ?? it.w * it.h,
      position_label:
        it.row <= 3 ? "above-fold" : it.row <= 6 ? "mid-fold" : "below-fold",
      sensitivity: it.sensitivity,
      explosive_rating: it.explosive_rating,
    }));

  const userContent = {
    day,
    current_scores: scores,
    grid_layout: gridLayout,
    external_factors_active: factors.map((f) => ({
      factor_id: f.factor_id,
      name: f.name,
      type: f.type,
      pressure: f.pressure,
      player_response: f.player_response || "ignored",
    })),
    arc_flags: arcFlags,
  };

  const storyCount = gridLayout.length;
  return {
    model: "llama-3.3-70b-versatile",
    max_tokens: 6000,
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content:
          `GAME STATE:
${JSON.stringify(userContent)}

` +
          `SCORING REMINDER: You must score ALL ${storyCount} stories from grid_layout — every placed story affects scores. ` +
          `Use each story weight as its multiplier. Body text in Part B MUST be minimum 80 words of prose. ` +
          `Output ONLY raw JSON starting with { — no markdown, no code fences, no prose before or after.`,
      },
    ],
  };
}

// ─── PROCESS EDITOR TURN ─────────────────────────────────────────────────────
export async function processEditorTurn(gameState) {
  if (!GROK_API_KEY) {
    throw new Error("NO_API_KEY");
  }

  log("Day", gameState.day, "→ Groq");
  log("Grid items:", gameState.slots);

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify(buildPayload(gameState)),
    },
  );

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Grok API ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Strip markdown fences if model wraps in ```json
  const clean = raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();

  let result;
  try {
    result = JSON.parse(clean);
  } catch {
    throw new Error(`Failed to parse Grok response: ${clean.slice(0, 300)}`);
  }

  log("Part A score deltas:", result.part_a?.score_updates);
  log(
    "Part B stories:",
    result.part_b?.stories?.length,
    "stories,",
    result.part_b?.external_factors?.length,
    "factors",
  );

  return {
    partA: result.part_a,
    partB: result.part_b,
  };
}

// ─── CLAMP SCORES ────────────────────────────────────────────────────────────
export function applyScoreUpdates(currentScores, scoreUpdates) {
  const next = { ...currentScores };
  Object.entries(scoreUpdates).forEach(([key, update]) => {
    next[key] = Math.max(0, Math.min(100, update.new ?? currentScores[key]));
  });
  return next;
}
