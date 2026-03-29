# Samachar Times — The Editor's Burden

A browser-based newspaper editorial simulation game set in Bharatpur, India. You are **Arjun Mehta**, editor of the city's last independent paper. Every morning, five stories land on your desk. You place four. One gets buried. One might be planted. Your call which is which.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite 7 |
| Styling | Inline theme system (no CSS framework) |
| AI Narration | Grok API (xAI) |
| Persistence | `localStorage` (game state + settings) |

---

## Project Structure

```
src/
  App.jsx                        ← Root state machine + localStorage persistence
  App.css                        ← Global styles, keyframes, layout classes
  context/
    SettingsContext.jsx           ← Theme, font, dark mode — persisted to localStorage
  components/
    IntroScreen.jsx               ← Start screen
    NewspaperGrid.jsx             ← Drag-and-resize bento grid (10×10)
    StoryCard.jsx                 ← Story cards in the left pool
    StoryModal.jsx                ← Full story read popup
    ParameterBar.jsx              ← Five-metric bar (top of screen)
    ExternalFactorPanel.jsx       ← Right panel — respond/ignore pressure events
    FactorIntroScreen.jsx         ← Between-day factor briefing
    ConsequenceScreen.jsx         ← Post-publish consequence reveal
    EndingScreen.jsx              ← Final ending (win or collapse)
    LoadingScreen.jsx             ← Publishing animation
    SettingsDrawer.jsx            ← Customize paper name, font, theme
  engine/
    constants.js                  ← SLOTS, INITIAL_SCORES, DAY_1_SEED, system prompt
    grokApi.js                    ← Grok API calls (Part A scores + Part B next day)
    scoring.js                    ← Collapse checks, win conditions
```

---

## Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the project root:

```
VITE_GROK_API_KEY=your_grok_api_key_here
```

Get a Grok API key at [console.x.ai](https://console.x.ai).

---

## Deploying to Vercel

1. Push the repo to GitHub
2. Import it in [vercel.com/new](https://vercel.com/new)
3. Add your environment variable in **Settings → Environment Variables**:
   - `VITE_GROK_API_KEY` → your key
4. Deploy — no server config needed, it's a pure static build

> **Note on saves:** Game progress and settings persist via `localStorage` — per-browser, per-device. Refreshing resumes exactly where you left off. Starting a new game clears the save.

---

## Game Mechanics

### The Loop

Each day runs in four phases:

1. **Story Delivery** — Drag stories from the left pool onto the 10×10 newspaper grid. Fill every cell before publishing.
2. **External Factors** — Respond or ignore pressure events in the right panel (advertisers, politicians, sources).
3. **Consequence Screen** — The AI evaluates your layout and factor responses, then narrates the fallout.
4. **Factor Intro** — Preview tomorrow's atmosphere and incoming pressures before the next day begins.

### The Five Parameters

All parameters are clamped 0–100. Let any one collapse and the game ends.

| Code | Name | Collapse at |
|---|---|---|
| INT | Editorial Integrity | 0 |
| REP | City's Trust / Reputation | 0 |
| REV | Newsroom Revenue | 0 |
| MOR | Team Morale | 0 |
| POL | Political Goodwill | 0 or 100 |

### Slot Weights

Story placement determines impact. The same story in the lead slot hits ~7× harder than buried at the bottom.

| Slot | Base Multiplier |
|---|---|
| Lead Story | 2.2× |
| Second Story | 1.4× |
| Sidebar | 0.7× |
| Buried | 0.3× |

Daily modifiers (Breaking Storm, Viral Wildcard, etc.) can shift these multipliers further.

### AI Evaluation (Grok)

Each publish triggers two sequential API calls:

- **Part A** — Scores your layout decisions, returns `score_updates` for all five parameters
- **Part B** — Generates the next day's stories, atmosphere, and external factors

The game runs for up to **7 days**. Survive all seven with no collapses to win.

---

## Customisation

Players can customize via the **CUSTOMIZE** button (top right):

- Paper name and slogan
- Editor name
- Font (Playfair, Baskerville, Georgia, Garamond, Typewriter)
- Background paper tone (Newsprint, Ivory, Slate, Sepia, Mint)
- Dark mode

All settings persist across sessions via `localStorage`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_GROK_API_KEY` | Yes | xAI Grok API key for story generation and scoring |

---

## Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```
