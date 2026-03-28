// ─── SLOT CONFIGURATION ───────────────────────────────────────────────────────
export const SLOTS = [
  {
    id: "slot_1_headline",
    label: "HEADLINE",
    sub: "Front Page · Above Fold",
    multiplier: 2.0,
    large: true,
    colSpan: 2,
  },
  {
    id: "slot_2_secondary",
    label: "SECONDARY",
    sub: "Front Page · Below Fold",
    multiplier: 1.5,
    large: false,
    colSpan: 2,
  },
  {
    id: "slot_3_side",
    label: "SIDE NEWS",
    sub: "Inside Left · Page 3",
    multiplier: 0.8,
    large: false,
    colSpan: 1,
  },
  {
    id: "slot_4_bottom",
    label: "BOTTOM",
    sub: "Back Page · Buried",
    multiplier: 0.4,
    large: false,
    colSpan: 1,
  },
];

// ─── PARAMETER DEFINITIONS ───────────────────────────────────────────────────
export const PARAMS = {
  INT: {
    label: "Integrity",
    symbol: "INT",
    icon: "⚖",
    color: "#4f8ef7",
    collapseAt: 20,
    achieveAt: 90,
  },
  REP: {
    label: "Reputation",
    symbol: "REP",
    icon: "★",
    color: "#a78bfa",
    collapseAt: 18,
    achieveAt: 88,
  },
  REV: {
    label: "Revenue",
    symbol: "REV",
    icon: "$",
    color: "#34d399",
    collapseAt: 15,
    achieveAt: 85,
  },
  MOR: {
    label: "Staff Morale",
    symbol: "MOR",
    icon: "◈",
    color: "#fb923c",
    collapseAt: 22,
    achieveAt: 87,
  },
  POL: {
    label: "Political Capital",
    symbol: "POL",
    icon: "◉",
    color: "#f472b6",
    collapseAt: 12,
    achieveAt: 83,
  },
};

export const INITIAL_SCORES = { INT: 60, REP: 60, REV: 60, MOR: 60, POL: 60 };

// ─── COLLAPSE EVENTS ─────────────────────────────────────────────────────────
export const COLLAPSE_EVENTS = {
  INT: {
    name: "The Retraction That Ended Everything",
    description:
      "A fabricated or reckless story broke trust permanently. National press is covering the Sentinel's fall.",
  },
  REP: {
    name: "Nobody's Reading Anymore",
    description:
      "Circulation tanked. The paper became irrelevant. Subscription cancellations flooded in.",
  },
  REV: {
    name: "The Lights Go Out",
    description:
      "The paper can't make payroll. The presses are silent. Staff let go by email on a Thursday.",
  },
  MOR: {
    name: "The Walkout",
    description:
      "Every reporter in the building walked out at noon. You published a 4-page ghost edition alone.",
  },
  POL: {
    name: "The Injunction",
    description:
      "A coordinated political/legal offensive shut publication pending a 60-day 'investigation.'",
  },
};

// ─── ACHIEVEMENT EVENTS ───────────────────────────────────────────────────────
export const ACHIEVEMENT_EVENTS = {
  INT: {
    name: "Paper of Record",
    bonus: { REP: 5, MOR: 5 },
    description:
      "A national journalism body cited the Sentinel as a model of the craft.",
  },
  REP: {
    name: "The City Trusts You",
    bonus: { INT: 3 },
    description:
      "Exclusive source access opened. The city's best contacts began calling.",
  },
  REV: {
    name: "Full Page, Every Day",
    bonus: {},
    description:
      "An advertiser offered a 3-year deal. Revenue decay rate halved for 3 days.",
  },
  MOR: {
    name: "The Best Room in Journalism",
    bonus: { INT: 5 },
    description:
      "A star reporter from a national outlet requested a transfer to the Sentinel.",
  },
  POL: {
    name: "The Envelope",
    bonus: {},
    description:
      "A government insider began feeding the Sentinel exclusive leaks.",
  },
};

// ─── WIN CONDITIONS ───────────────────────────────────────────────────────────
export const WIN_CONDITIONS = [
  {
    id: "THE_PULITZER",
    check: (scores, _hist) => Object.values(scores).every((v) => v >= 70),
    emoji: "🏅",
    title: "The Pulitzer",
    epilogue:
      "Eight months later, THE EDITOR wins the Pulitzer Prize for Public Service. Dani Reeves accepts it. Morgan Voss watches from the third row. The paper's circulation has doubled. Three city officials are facing federal charges.",
  },
  {
    id: "PAPER_OF_RECORD",
    check: (scores) =>
      scores.INT >= 85 &&
      scores.REP >= 80 &&
      Math.min(scores.REV, scores.MOR, scores.POL) >= 40,
    emoji: "📜",
    title: "Paper of Record",
    epilogue:
      "You chose truth over profit at every turn. The Sentinel became the paper cities deserve and rarely get. The editorial board voted to make your philosophy the institution's permanent mandate.",
  },
  {
    id: "PROFITABLE_TRUTH",
    check: (scores) => scores.REV >= 85 && scores.MOR >= 80 && scores.INT >= 50,
    emoji: "💼",
    title: "The Profitable Truth",
    epilogue:
      "You proved that ethical journalism and commercial success are not enemies. The Sentinel is profitable, principled, and packed. Industry panels call it 'the model.' You're quietly proud.",
  },
  {
    id: "STILL_STANDING",
    check: (scores) => Object.values(scores).every((v) => v > 22), // survived all thresholds
    emoji: "🩹",
    title: "Still Standing",
    epilogue:
      "No trophies. No collapse. Just a paper that kept publishing when everything was trying to stop it. Some days, that has to be enough. Most days, it is.",
  },
  {
    id: "BURNED_IT_DOWN",
    check: (scores) => scores.POL <= 20 && scores.INT >= 88,
    emoji: "🔥",
    title: "Burned It Down",
    epilogue:
      "You burned every political bridge and kept every principle. The FBI case accelerated. Two advertisers sued. Three returned. Nobody left the newsroom voluntarily. It was the best and worst year of Morgan's life.",
  },
];

// ─── COLLAPSE ENDINGS ─────────────────────────────────────────────────────────
export const COLLAPSE_ENDINGS = {
  INT: {
    emoji: "💀",
    title: "The Retraction That Ended Everything",
    epilogue:
      "A fabricated story broke trust permanently. The Sentinel became a cautionary tale taught in journalism schools. Morgan Voss's name appears in the footnotes.",
  },
  REP: {
    emoji: "📉",
    title: "Nobody's Reading Anymore",
    epilogue:
      "The city stopped caring what the Sentinel printed. Irrelevance is quieter than collapse. The paper ran for eight more months to an empty room.",
  },
  REV: {
    emoji: "🏦",
    title: "The Lights Go Out",
    epilogue:
      "Payroll failed on a Friday. Staff were notified by email. The presses ran one final edition. Nobody picked it up at newsstands. The building was dark by Monday.",
  },
  MOR: {
    emoji: "🚪",
    title: "The Walkout",
    epilogue:
      "Every reporter walked out at noon. Morgan published a four-page ghost edition alone. It was the most honest thing the paper had ever printed. Nobody read it.",
  },
  POL: {
    emoji: "⚖",
    title: "The Injunction",
    epilogue:
      "A coordinated legal offensive shut publication pending investigation. The investigation lasted fourteen months. When it ended, the moment had passed.",
  },
  CASCADE: {
    emoji: "🌀",
    title: "The Night Everything Broke",
    epilogue:
      "Morgan locked the office, killed the final edition, and disappeared. The Sentinel ran a brief notice the next morning — 47 words, no byline — and then nothing.",
  },
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are the consequence engine for THE EDITOR — an Indian newspaper simulation. The paper is THE PRATAP in Navapur. Editor: Arjun Mehta.

Return ONLY raw JSON. No markdown. No prose outside JSON.

═══ SCORING SYSTEM ════════════════════════════════════════

The player placed stories on a 10×10 grid. Each story has a "weight" = sum of cell values it covers. Cells graduate from 2.5 (row 0, top) to 0.3 (row 9, bottom). Larger + higher = more impact.

Each story has slot_sensitivity per variable:
  +critical=+20–35, +high=+12–19, +medium=+6–11, +low=+1–5, neutral=0
  Negatives mirror positively.

SCORING FORMULA:
  raw_delta = sensitivity_value (pick mid-range of the band)
  scaled_delta = raw_delta × (story.weight / 10)   ← 10 is mid-range weight
  Round to nearest integer. Clamp all results 0–100.

SPECIAL RULES:
  • Buried truth: story with INT:+critical and position_label "below-fold" → INT -8 extra
  • Soft lead: story with explosive_rating 1 and position_label "above-fold" → REP -6, MOR -4
  • Brave stand: high/critical pressure factor active + its related story above-fold → positive deltas ×1.3

═══ CONSEQUENCE NARRATIVES ═════════════════════════════════

Rules:
  • One narrative per placed story. Order by weight descending (highest first).
  • 2–3 sentences. Past tense. Newspaper voice. India-set. Named characters.
  • NO numbers. NO score values. NO "integrity increased by 12".
  • Human language: "The story ran on the front page and the city took notice."
  • Reference Navapur, named people, real consequences.

═══ COLLAPSE / ACHIEVEMENT ═════════════════════════════════

Collapse thresholds: INT≤20, REP≤18, REV≤15, MOR≤22, POL≤12. 2+ = CASCADE.
Achievement thresholds: INT≥90, REP≥88, REV≥85, MOR≥87, POL≥83.

═══ NEW DAY GENERATION ═════════════════════════════════════

Stories (4 total):
  • ≥1 direct consequence of editor's previous choices
  • ≥1 continuation of an arc flag
  • ≥1 fresh thread
  • ≥1 emotionally unexpected (dark comedy, sudden warmth, absurdity)
  • ALL set in India. Named characters. Specific amounts in ₹. Real institutions.
  • Headlines: ALL CAPS. Visceral. Hyper-specific. Not vague.

External factors (3 total):
  • ≥1 with caused_by_previous_choice: true
  • Names and descriptions must be FUNNY and SPECIFIC to India
  • Not generic — no "advertiser threatens to pull funding"
  • Good: "The sub-collector's wife has started a rival newspaper and poached two of your reporters"
  • Good: "A BJP MLA has filed an RTI asking for every story The Pratap has published about him since 2019"
  • Good: "Your press cameraman accidentally photographed the CM's son at a rave — and the photo is already on his phone"
  • Factor types: political | commercial | staff | public | personal
  • Factor pressure: low | medium | high | critical

Score update notes: max 8 words, past tense, plain English. E.g. "Story buried despite strong public interest."

═══ RETURN FORMAT (raw JSON, no markdown) ══════════════════

{
  "part_a": {
    "score_updates": {
      "INT": { "previous": N, "delta": N, "new": N, "note": "8 words max" },
      "REP": { "previous": N, "delta": N, "new": N, "note": "..." },
      "REV": { "previous": N, "delta": N, "new": N, "note": "..." },
      "MOR": { "previous": N, "delta": N, "new": N, "note": "..." },
      "POL": { "previous": N, "delta": N, "new": N, "note": "..." }
    },
    "consequences": [
      { "story_id": "S1", "weight": N, "narrative": "2-3 sentences, no numbers." },
      { "story_id": "S2", "weight": N, "narrative": "..." },
      { "story_id": "S3", "weight": N, "narrative": "..." },
      { "story_id": "S4", "weight": N, "narrative": "..." }
    ],
    "achievement": null,
    "collapse": null
  },
  "part_b": {
    "day_number": N,
    "day_title": "Evocative short title",
    "newsroom_atmosphere": "One vivid India-flavoured sentence.",
    "stories": [
      {
        "story_id": "S1",
        "headline": "ALL CAPS SPECIFIC HEADLINE WITH ₹ AMOUNTS AND NAMES",
        "deck": "Title case subheadline.",
        "summary": "2-3 sentences. Named. Specific. India-set.",
        "slot_sensitivity": { "INT": "+high", "REP": "+medium", "REV": "-low", "MOR": "+low", "POL": "-high" },
        "explosive_rating": 1,
        "emotional_register": "Civic Outrage",
        "arc_flag_generated": "FLAG_NAME or null",
        "tag": "Politics"
      }
    ],
    "external_factors": [
      {
        "factor_id": "F1",
        "name": "Short funny specific name",
        "type": "political",
        "pressure": "high",
        "description": "Specific funny India-flavoured description with a named person.",
        "caused_by_previous_choice": false
      }
    ]
  }
}`;

// ─── DAY 1 SEED ───────────────────────────────────────────────────────────────
// Hardcoded Day 1 so the game starts instantly without an API call.
export const DAY_1_SEED = {
  day_number: 1,
  day_title: "The Story You Can't Unprint",
  newsroom_atmosphere:
    "The coffee is fresh, the staff are chatty, and a source has just walked in off the street with a manila envelope.",
  stories: [
    {
      story_id: "S1",
      headline:
        "CITY'S ONLY DAM RATED 'STRUCTURALLY DEFICIENT' — REPORT BURIED FOR 3 YEARS",
      deck: "Internal engineering documents obtained by the Sentinel suggest city officials knew of critical failure risks and concealed them from the public.",
      summary:
        "A whistleblower — former city engineer — hands over documents showing Kesler Dam, serving 400,000 residents, failed two federal safety inspections. Officials signed off on extensions. No public disclosure was made.",
      slot_sensitivity: {
        INT: "+critical",
        REP: "+high",
        REV: "-high",
        MOR: "+high",
        POL: "-critical",
      },
      explosive_rating: 5,
      emotional_register: "Dread / Civic Outrage",
      arc_flag_generated: "DAM_DOCUMENTS_OBTAINED",
      tag: "Investigative",
    },
    {
      story_id: "S2",
      headline:
        "SUPERINTENDENT WADE OKAFOR RESIGNS AMID UNDISCLOSED CONFLICT OF INTEREST",
      deck: "Halcyon City's longest-serving school chief steps down after nine years — sources cite personal financial entanglement with a textbook contractor.",
      summary:
        "Okafor received consulting fees from Apex Educational Partners while approving their $4M contract. His daughter works at the firm. His wife has called the newsroom twice.",
      slot_sensitivity: {
        INT: "+medium",
        REP: "+medium",
        POL: "-medium",
        REV: "-low",
      },
      explosive_rating: 3,
      emotional_register: "Grief / Reluctant Duty",
      arc_flag_generated: "OKAFOR_RESIGNED",
      tag: "Politics",
    },
    {
      story_id: "S3",
      headline:
        "STAR CHEF ELENA MARQUEZ OPENS DOORS TO HALCYON'S FIRST MICHELIN-STARRED RESTAURANT",
      deck: "After three years of silence following her bankruptcy, Marquez returns — and the waitlist already has 6,000 names.",
      summary:
        "A feature piece on triumph, second chances, and what it means to feed a city that's been through hard times. Beautiful photos. Uplifting. The kind of story that makes people feel good about the city — and the paper.",
      slot_sensitivity: {
        INT: "neutral",
        REP: "+low",
        REV: "+medium",
        MOR: "+low",
        POL: "+low",
      },
      explosive_rating: 1,
      emotional_register: "Warmth / (Internal) Guilt",
      arc_flag_generated: null,
      tag: "Culture",
    },
    {
      story_id: "S4",
      headline:
        "HALCYON PD UNDER FIRE: BODY CAM FOOTAGE CONTRADICTS OFFICIAL REPORT IN DELGADO SHOOTING",
      deck: "Attorneys for the family of Marcus Delgado release footage that appears to directly contradict the department's account of what happened on March 4th.",
      summary:
        "The footage shows Delgado was unarmed and compliant for 30 seconds longer than the official timeline states. The officer remains on active duty. Protests are already forming outside City Hall.",
      slot_sensitivity: {
        INT: "+critical",
        REP: "+high",
        POL: "-high",
        MOR: "+medium",
      },
      explosive_rating: 4,
      emotional_register: "Rage / Moral Urgency",
      arc_flag_generated: "DELGADO_FOOTAGE_OBTAINED",
      tag: "Crime",
    },
  ],
  external_factors: [
    {
      factor_id: "F1",
      name: "The Mayor's Preemptive Call",
      type: "political",
      pressure: "high",
      description:
        "Before the Sentinel has published a word, Deputy Mayor Connie Rashed calls Morgan Voss directly. She says the dam story is 'dangerously incomplete' and will 'cause public panic.' She offers an exclusive sit-down with the Mayor tomorrow — in exchange for a 48-hour hold.",
      caused_by_previous_choice: false,
      modifier_hint:
        "Directly targets the dam story (S1). Ignoring it = maximum POL damage + brave stand bonus. Appeasing it = INT/MOR cost.",
    },
    {
      factor_id: "F2",
      name: "Greyson Corp Ad Threat",
      type: "commercial",
      pressure: "medium",
      description:
        "Greyson Corporation — one of the Sentinel's three largest advertisers — has quietly informed the business desk that certain coverage directions would require them to 'reassess' their ad spend. The message arrived by phone, off the record.",
      caused_by_previous_choice: false,
      modifier_hint:
        "Affects REV. Running any investigative story (S1 or S4) without appeasement triggers REV penalty.",
    },
    {
      factor_id: "F3",
      name: "Reporter Asha Nair's Ultimatum",
      type: "staff",
      pressure: "high",
      description:
        "Asha Nair — the Sentinel's best investigative reporter — corners Morgan before the editorial meeting. 'If we kill the dam story,' she says quietly, 'I start looking for another paper.' She's not bluffing. You've seen her walk before.",
      caused_by_previous_choice: false,
      modifier_hint:
        "Affects MOR. Killing or burying the dam story (S1) without appeasement triggers MOR penalty.",
    },
  ],
};
