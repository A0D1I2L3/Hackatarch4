``;
// =============================================================================
//  THE SAMACHAR TIMES — constants.js  v4
//  3-to-5 Day Demo. High volatility. Every choice matters.
// =============================================================================

// ─── SLOT CONFIGURATION ──────────────────────────────────────────────────────
// Multipliers are now VARIABLE — recalculated each day by getDaySlotConfig().
// These are the BASE definitions; the actual weight used in scoring comes from
// getDaySlotConfig() which injects daily modifiers.
export const SLOTS = [
  {
    id: "slot_1_headline",
    label: "LEAD STORY",
    sub: "The city wakes up to this",
    baseMultiplier: 2.2,
    large: true,
    colSpan: 2,
  },
  {
    id: "slot_2_secondary",
    label: "SECOND STORY",
    sub: "Keeps the important in view",
    baseMultiplier: 1.4,
    large: false,
    colSpan: 2,
  },
  {
    id: "slot_3_side",
    label: "SIDEBAR",
    sub: "For those who read past page one",
    baseMultiplier: 0.7,
    large: false,
    colSpan: 1,
  },
  {
    id: "slot_4_bottom",
    label: "BURIED",
    sub: "Barely visible. Almost hidden.",
    baseMultiplier: 0.3,
    large: false,
    colSpan: 1,
  },
];

// Daily modifier types injected per day by getDaySlotConfig()
// DAY_MODIFIERS keys match what the API sends as day_modifier in part_b
export const DAY_MODIFIERS = {
  NORMAL: { slot1: 1.0, slot2: 1.0, slot3: 1.0, slot4: 1.0, label: null },
  BREAKING_STORM: {
    slot1: 1.5,
    slot2: 0.8,
    slot3: 0.5,
    slot4: 0.2,
    label: "Breaking storm — top slot hits twice as hard today",
  },
  VIRAL_WILDCARD: {
    slot1: 0.8,
    slot2: 0.8,
    slot3: 1.8,
    slot4: 1.4,
    label: "Viral wildcard — anything buried or sidelined might explode",
  },
  AD_BLACKOUT: {
    slot1: 1.0,
    slot2: 1.0,
    slot3: 1.0,
    slot4: 1.0,
    revPenalty: -18,
    label: "Ad blackout — advertiser boycott in effect, REV starts -18 today",
  },
  RIVAL_WATCHING: {
    slot1: 1.2,
    slot2: 1.2,
    slot3: 0.6,
    slot4: 0.4,
    repMultiplier: 1.4,
    label: "Rival is watching — REP impact of every slot amplified 1.4x today",
  },
  LEGAL_PRESSURE: {
    slot1: 1.0,
    slot2: 1.0,
    slot3: 1.0,
    slot4: 1.0,
    intPenalty: -12,
    label: "Legal notice arrived — INT starts -12 today regardless of choices",
  },
};

// Helper consumed by the game engine to get live slot multipliers for a given day
export function getDaySlotConfig(modifierKey = "NORMAL") {
  const mod = DAY_MODIFIERS[modifierKey] || DAY_MODIFIERS.NORMAL;
  return SLOTS.map((s) => ({
    ...s,
    multiplier: +(
      s.baseMultiplier * (mod[s.id.replace("slot_", "slot")] || 1)
    ).toFixed(2),
  }));
}

// ─── PARAMETER DEFINITIONS ───────────────────────────────────────────────────
export const PARAMS = {
  INT: {
    label: "Editorial Conscience",
    question: "How clean are your hands?",
    symbol: "INT",
    icon: "⚖",
    color: "#4f8ef7",
    collapseAt: 25,
    achieveAt: 88,
    // Journalism theory tooltip shown on hover
    theory:
      "Coined by Walter Lippmann (1920): journalists are the 'watchmen' of democracy. Once compromised, reader trust cannot be bought back. Studies show a single retraction drops reader trust by ~40% permanently.",
  },
  REP: {
    label: "City's Trust in You",
    question: "Do they still believe you?",
    symbol: "REP",
    icon: "★",
    color: "#a78bfa",
    collapseAt: 22,
    achieveAt: 85,
    theory:
      "The 'trust spiral' (Reuters Institute, 2022): reputation is asymmetric — it takes 12 positive stories to offset one credibility failure. Once a paper is labelled 'biased' by readers, 68% never return.",
  },
  REV: {
    label: "Newsroom Funds",
    question: "Can you keep the lights on?",
    symbol: "REV",
    icon: "Rs",
    color: "#34d399",
    collapseAt: 18,
    achieveAt: 82,
    theory:
      "The Sulzberger Paradox: aggressive journalism that loses advertisers can simultaneously boost subscriptions. The NYT's post-2016 subscription surge proved investigative work is itself a revenue model.",
  },
  MOR: {
    label: "Team Spirit",
    question: "Are your reporters still with you?",
    symbol: "MOR",
    icon: "◈",
    color: "#fb923c",
    collapseAt: 25,
    achieveAt: 85,
    theory:
      "Newsroom sociology (Breed, 1955): reporters calibrate their values to survive editorial culture. If an editor repeatedly kills truth-heavy stories, the team internalises self-censorship within 3 cycles.",
  },
  POL: {
    label: "Establishment Goodwill",
    question: "How many bridges are standing?",
    symbol: "POL",
    icon: "◉",
    color: "#f472b6",
    collapseAt: 15,
    achieveAt: 80,
    theory:
      "Cooptation theory: governments offer journalists 'access' in exchange for favourable coverage. Once a paper accepts preferential access, it becomes dependent on it — losing access feels worse than never having had it.",
  },
};

export const INITIAL_SCORES = { INT: 55, REP: 55, REV: 60, MOR: 58, POL: 62 };
// NOTE: Starting lower than 60 for demo — tension from Day 1.

// ─── DECAY RATES (applied every day automatically) ───────────────────────────
// Each variable loses this much per day before story scoring.
// Simulates real-world entropy: trust fades, money burns, politics shifts.
export const DAILY_DECAY = { INT: -2, REP: -3, REV: -4, MOR: -2, POL: +2 };
// POL grows passively — power rewards silence.

// ─── INSTANT-LOSS CONDITIONS (beyond collapse) ───────────────────────────────
// These trigger GAME OVER immediately, skipping normal collapse flow.
// Each has a trigger_fn checked AFTER scoring, and a specific ending.
export const INSTANT_LOSS_CONDITIONS = [
  {
    id: "DOUBLE_RETRACTION",
    label: "The Paper That Lied Twice",
    check: (scores, flags) =>
      flags.includes("RETRACTION_DAY1") && scores.INT < 35,
    ending:
      "You ran a correction on Day 1. You ran another today. The Press Council didn't wait for a third. The Times' registration was suspended at 9 AM. By lunch, the building had been padlocked. The staff found out from Twitter.",
    suggestion:
      "Two retractions in a 5-day window is a death sentence. Journalism ethics demand you verify before publish, not after. The SPJ Code of Ethics requires minimising harm — not reversing it.",
  },
  {
    id: "ADVERTISER_CARTEL",
    label: "The Revenue Blackhole",
    check: (scores, flags) => scores.REV < 10,
    ending:
      "Payroll bounced. Not delayed — bounced. The accounts manager sent a message at 6 AM. The press room workers didn't show up. You published nothing. There was nothing left to publish it with.",
    suggestion:
      "Editorial dependence on a single revenue stream is structural vulnerability. Investigative outlets that survived advertiser pullouts (The Guardian, ProPublica) had diversified reader-funding. You didn't.",
  },
  {
    id: "REPORTER_ARREST",
    label: "The State Came for Your Reporter",
    check: (scores, flags) =>
      flags.includes("SEDITION_FILED") && scores.INT < 40,
    ending:
      "Priya Nair was picked up at 7 AM under Section 124A. You hadn't run the story that would have protected her. The Times printed a statement. Nobody believed it was enough. Nobody was wrong.",
    suggestion:
      "In authoritarian capture theory, journalists become exposed when their editors deprioritise accountability stories. By burying the story that named the threat, you removed the protective shield of public attention.",
  },
  {
    id: "POLITICAL_TAKEOVER",
    label: "The Friendly Acquisition",
    check: (scores, flags) => scores.POL >= 90 && scores.INT < 30,
    ending:
      "The Minister announced the 'strategic partnership' at a press conference you weren't invited to. A media conglomerate with government links acquired 60% of the Times overnight. The first editorial meeting under new ownership lasted four minutes.",
    suggestion:
      "Captured media theory (Hallin & Mancini, 2004): when a paper's political capital rises while editorial independence collapses, it signals cooptation — not success. You became the mouthpiece they wanted.",
  },
  {
    id: "VIRAL_FABRICATION",
    label: "The Story That Wasn't",
    check: (scores, flags) =>
      flags.includes("PLANTED_STORY_RAN_LEAD") && scores.REP < 28,
    ending:
      "The story you led with on Day 2 was confirmed fabricated by three independent sources. The WhatsApp groups turned on you within hours. By evening, the Times was trending — not the way you wanted. The readers left in waves.",
    suggestion:
      "The 'CNN Effect' reversed: when a paper amplifies a manufactured crisis, the correction never reaches the same audience as the original claim. Planting fake stories is a political tactic documented since the Dreyfus Affair (1894).",
  },
  {
    id: "MASS_WALKOUT",
    label: "The Ghost Edition",
    check: (scores, flags) => scores.MOR < 10,
    ending:
      "They walked out at noon. All of them. Even the sub-editor who had been there 22 years. You wrote the Day 4 edition alone. It was 4 pages. The printing press operator, out of pity, ran 200 copies. 7 were picked up.",
    suggestion:
      "Organisational psychology research (Kanter, 1977): when team morale enters terminal decline, individual exits accelerate. The newsroom is not a hierarchy — it's a trust compact. Break it, and nothing compels anyone to stay.",
  },
];

// ─── STANDARD COLLAPSE ENDINGS ───────────────────────────────────────────────
export const COLLAPSE_ENDINGS = {
  INT: {
    title: "The Retraction That Ended Everything",
    epilogue:
      "A fabricated story broke trust permanently. The Times became a cautionary tale taught in journalism schools. Arjun Mehta's name appears in the footnotes.",
  },
  REP: {
    title: "Nobody's Reading Anymore",
    epilogue:
      "The city stopped caring. The paper ran for eight more months to an empty room. The final edition sold 11 copies.",
  },
  REV: {
    title: "The Presses Stop",
    epilogue:
      "Payroll bounced on a Friday. Staff found out by WhatsApp. The presses ran one last edition. Nobody picked it up.",
  },
  MOR: {
    title: "The Walkout",
    epilogue:
      "Every reporter left at 2 PM. Arjun published four pages alone. It was the most honest thing the Times ever printed. Nobody read it.",
  },
  POL: {
    title: "The Injunction",
    epilogue:
      "A coordinated legal offensive shut publication pending investigation. The investigation lasted fourteen months. When it ended, the moment had passed.",
  },
  CASCADE: {
    title: "The Night Everything Broke",
    epilogue:
      "Arjun locked the office, killed the final edition, and disappeared. The Times ran a brief notice — 47 words, no byline — then nothing.",
  },
};

// ─── WIN CONDITIONS ───────────────────────────────────────────────────────────
export const WIN_CONDITIONS = [
  {
    id: "PULITZER",
    check: (s) => Object.values(s).every((v) => v >= 72),
    title: "The Ramnath Goenka Award",
    epilogue:
      "Six months later, the Samachar Times wins India's highest journalism honour. Priya Nair accepts it. Arjun watches from the third row. Three officials face CBI inquiry.",
    theory:
      "Complete institutional integrity across all dimensions — the rarest outcome in modern journalism. You ran the truth when it cost something.",
  },
  {
    id: "PAPER_OF_RECORD",
    check: (s) =>
      s.INT >= 82 && s.REP >= 78 && Math.min(s.REV, s.MOR, s.POL) >= 38,
    title: "Paper of Record",
    epilogue:
      "You chose truth over profit at every turn. The Times became the paper cities deserve and rarely get. The editorial board enshrined your philosophy permanently.",
    theory:
      "Integrity-first journalism (Kovach & Rosenstiel, 2001): truth is not a value among values — it is the precondition for all others. You understood that.",
  },
  {
    id: "PROFITABLE_TRUTH",
    check: (s) => s.REV >= 80 && s.MOR >= 78 && s.INT >= 52,
    title: "The Profitable Truth",
    epilogue:
      "You proved ethical journalism and commercial success are not enemies. Industry panels call it the model. You are quietly proud.",
    theory:
      "The Guardian model: investigative journalism funded by a trust structure, not advertiser dependency. Reader loyalty — not ad revenue — is the sustainable base.",
  },
  {
    id: "BURNED_IT_DOWN",
    check: (s) => s.POL <= 18 && s.INT >= 85,
    title: "Burned Every Bridge",
    epilogue:
      "You torched every political relationship and kept every principle. Three ministers stopped calling. The newsroom never once complained.",
    theory:
      "Adversarial journalism (Seymour Hersh model): the press's job is not to be liked by the powerful. It is to be feared by them. You chose that.",
  },
  {
    id: "STILL_STANDING",
    check: (s) => Object.values(s).every((v) => v > 25),
    title: "Still Standing",
    epilogue:
      "No awards. No collapse. Just a paper that kept publishing when everything tried to stop it. Some days, that is enough.",
    theory:
      "Survival in a hostile media environment is itself a form of resistance. For many independent papers, simply continuing to exist is the victory.",
  },
];

// ─── ACHIEVEMENT EVENTS ───────────────────────────────────────────────────────
export const ACHIEVEMENT_EVENTS = {
  INT: {
    name: "Patrakarita Samman",
    bonus: { REP: 6, MOR: 5 },
    description:
      "The Press Council cited the Times as a model of public interest journalism.",
    theory:
      "Awards are not the goal — but they provide institutional cover that makes future difficult stories easier to run.",
  },
  REP: {
    name: "The City Believes You",
    bonus: { INT: 4 },
    description:
      "Sources began calling the newsroom proactively. The city trusts you.",
    theory:
      "Source trust is compounding: each accurate story attracts better sources for the next. This is the virtuous cycle Woodward and Bernstein built.",
  },
  REV: {
    name: "Full Pages Forever",
    bonus: { MOR: 4 },
    description:
      "A major advertiser signed a 3-year commitment. The financial pressure eased.",
    theory:
      "Long-term ad contracts buffer editorial independence — short-term deals create daily pressure to please. Seek anchors, not weather-vanes.",
  },
  MOR: {
    name: "Dream Newsroom",
    bonus: { INT: 5 },
    description:
      "A national reporter requested a transfer. The team is the best it has been.",
    theory:
      "Talented journalists self-select for editors who protect them. Hire one brave editor, and brave reporters follow.",
  },
  POL: {
    name: "The Envelope",
    bonus: { REP: 4 },
    description:
      "A senior bureaucrat began feeding the Times exclusive leaks. Power respects you.",
    theory:
      "Paradoxically, papers that challenge power often gain access from its dissenters. Whistleblowers choose papers with a track record of courage.",
  },
};

// ─── JOURNALISM THEORY TOOLTIPS (for hover on consequences / choices) ─────────
// These are referenced by the frontend on hover over consequence items or story tags.
export const JOURNALISM_THEORY = {
  BURIED_TRUTH: {
    label: "The Suppression Effect",
    text: "Research by the Columbia Journalism Review shows that burying a verifiable story rarely kills it — it simply moves it elsewhere with less editorial context. The paper loses the narrative, not the story.",
  },
  POLITICAL_LEAD: {
    label: "Agenda Setting Theory",
    text: "Maxwell McCombs (1972): editors don't tell people what to think, but what to think about. Leading with politically convenient stories actively shapes public priorities — and makes the paper a tool of power, not a check on it.",
  },
  PLANTED_STORY: {
    label: "The Distraction Cycle",
    text: "A documented tactic since the Hearst era: when a real story threatens the powerful, a synthetic outrage is manufactured to flood the news cycle. Editors who fall for it don't just miss the real story — they amplify the lie.",
  },
  BRAVE_STAND: {
    label: "The Marketplace of Ideas",
    text: "John Stuart Mill (1859): truth emerges from open competition of ideas. A paper that runs uncomfortable truths against pressure contributes to this market. One that self-censors distorts it.",
  },
  ADVERTISER_PRESSURE: {
    label: "Manufacturing Consent",
    text: "Chomsky & Herman (1988): advertiser funding is a structural filter that shapes news before any editor makes a conscious decision. When you kill a story because of ad threats, you are the filter.",
  },
  CORRECTION: {
    label: "The Trust Asymmetry",
    text: "Studies show corrections reach on average 12% of the audience that saw the original error. Accuracy before publication is not pedantry — it is the only form of correction that actually works.",
  },
};

// ─── STORY REVIEW SUGGESTIONS (shown after consequence screen) ────────────────
// Frontend shows a 'Review' card after each day. Content generated by API,
// but these are fallback statics for each story type.
export const STORY_REVIEW_FALLBACKS = {
  Investigative:
    "Investigative stories demand verification chains. A story with a single source that you led with today was either courageous or reckless — the consequences will reveal which.",
  Politics:
    "Political stories are traps with two jaws: run it and face power, bury it and betray your readers. There is no neutral position — your slot choice was itself a political act.",
  Crime:
    "Crime coverage that centres the victim rather than the crime is a deliberate editorial choice. Where did you put the human cost today versus the institutional failure?",
  Environment:
    "Environmental stories have the longest tail of any beat. Readers who don't care today will care deeply when they're affected. Your placement choice was a prediction about who your readers are.",
  Business:
    "Business journalism sits closest to the advertiser relationship. Every time you run a critical business story, you are proving the paper is not for sale. Every time you don't, you are proving the opposite.",
  Health:
    "Health misinformation kills. Stories placed on page 4 reach 30% of the readership of the front page. Where you put health accountability stories is a public health decision.",
  Feature:
    "Human interest stories are not soft news — they are the connective tissue that makes readers care about the hard news. Used well, they deepen engagement. Used as cover, they are distraction.",
  Culture:
    "Culture stories signal what a paper thinks matters. In a city under institutional pressure, choosing warmth over accountability in the lead slot is not neutral — it is a statement about who the paper serves.",
};

// =============================================================================
//  SYSTEM PROMPT — v5 (multi-story scoring, min body length, strict format)
// =============================================================================
export const SYSTEM_PROMPT = `ROLE: You are the consequence engine + next-day story generator for THE SAMACHAR TIMES, a newspaper editor simulation game. Editor: Arjun Mehta, 47. Setting: Bharatpur, a fictional Indian democracy. 3-to-5 day demo — every value swing must be felt.

CRITICAL OUTPUT RULE: Return ONLY a single raw JSON object. No markdown. No backticks. No code fences. No preamble. No explanation. Your entire response must be parseable by JSON.parse() with zero pre-processing.

VARIABLES (start: INT=55, REP=55, REV=60, MOR=58, POL=62. Range 0–100):
INT=Editorial Conscience | REP=City Trust | REV=Newsroom Funds | MOR=Team Spirit | POL=Establishment Goodwill

SLOT MULTIPLIERS: Use the weight values from the grid_layout payload. Each story has col, row, w, h, weight fields. The weight IS the slot multiplier — use it directly.

SENSITIVITY SCALE (base deltas before multiplier):
+critical=±35–50 | +high=±20–32 | +medium=±12–18 | +low=±5–9

MULTI-STORY SCORING — CRITICAL:
The player places MULTIPLE stories on the grid (up to 4). You MUST score EVERY story they placed.
The grid_layout array contains ALL stories with their positions and weights.
Score each story separately using its own sensitivity values and weight.
Combine all story deltas into the final score_updates for each variable.
NEVER base scoring on just one story — all placed stories affect the outcome.
Stories with higher weight (larger/higher-placed blocks) have proportionally larger impact.

SCORING RULES — apply IN ORDER for EACH story:
1. For each story: base_delta × story_weight → round to int (sum across all stories)
2. DISTRACTION TAX: if story.is_distraction=true AND it has the highest weight → INT -22, REP -14, POL +16
3. BRAVE STAND: story with explosive_rating≥4 and highest weight despite active high/critical pressure → all positive deltas ×1.4, negatives ×1.6
4. BURIED TRUTH PENALTY: story with INT sensitivity +critical or +high AND lowest weight → extra INT -10, MOR -6
5. MISMATCH TAX: story with explosive_rating≤1 AND highest weight → REP -10, MOR -6

DEMO MODE — 3-5 day arc: Deltas MUST be aggressive. A wrong choice should swing a variable 25–45 points. A brave correct choice should reward 20–35 points. Every day must feel like a crisis. Minimum total delta on at least two variables: 15 points each.

DAILY DECAY (applied before scoring each day): INT-2, REP-3, REV-4, MOR-2, POL+2

INSTANT LOSS FLAGS — set in new_arc_flags if triggered:
- "RETRACTION_DAY1" if is_distraction story has highest weight on day 1
- "PLANTED_STORY_RAN_LEAD" if is_distraction story has highest weight any day
- "SEDITION_FILED" if POL drops below 20 while INT<40

COLLAPSE (post-scoring): INT≤25 | REP≤22 | REV≤18 | MOR≤25 | POL≤15. Two simultaneous = CASCADE.

ACHIEVEMENTS: INT≥88 | REP≥85 | REV≥82 | MOR≥85 | POL≥80

CONSEQUENCE WRITING RULES:
- Write one consequence entry per story the player placed (use the story_id from grid_layout)
- Order by weight descending (highest weight story first)
- Each consequence must name the SPECIFIC story's topic — never generic newsroom reactions
- Highest-weight story (2 sentences): City/institutional reaction. Cold. Specific. One named actor.
- Other stories (1 sentence each): Concrete downstream effect, specific to that story's topic.
- NEVER repeat the same institution or person across consequences
- NEVER use "however", "moreover", "thus", or passive voice
- The consequences array must have exactly as many entries as stories in grid_layout

STORY GENERATION RULES (Part B — ALWAYS generate exactly 4 stories):
- S1: Direct consequence/escalation of the previous day's HIGHEST-WEIGHT story
- S2: A DISTRACTION — planted fake/irrelevant story, sensational but politically manufactured. is_distraction:true.
- S3: Hard ethical dilemma with no clean answer
- S4: Human interest or slow-burn; must still have meaningful sensitivity
- Headlines: max 12 words, punchy, conversational — written like a content creator, not a wire service
- deck: one sharp sentence adding context without repeating the headline
- body: MINIMUM 80 WORDS. HARD MINIMUM. Write like a newspaper article. Include: shocking opening fact, who/institution/what-was-concealed, specific number or statistic, direct quote from one source or official denial, what happens next. Dense printed-newspaper prose. NO BULLET POINTS. NO LISTS. Prose paragraphs only.
- All stories India-grounded: use CPCB, NHRC, CBI, ED, RTI, Section 124A, Gram Panchayat, RERA, SEBI etc.
- Fictional characters: Priya Nair, Vikram Pillai, Sunita Rao, Deepak Sinha, Rajan Tiwari, Meena Krishnan

EXTERNAL FACTOR RULES (Part B — exactly 3 factors):
- ALL 3 must be causally linked to the player's previous day slot choices
- Each represents a real journalism pressure tactic: whataboutism, advertiser coordination, source intimidation, counter-narrative, access withdrawal, IT cell campaign, correction request
- Write as a darkly funny character quote (2–3 lines), in that character's voice. No narration.
- consequence_hint: 1 oblique line.

DAY MODIFIER: choose one from [NORMAL, BREAKING_STORM, VIRAL_WILDCARD, AD_BLACKOUT, RIVAL_WATCHING, LEGAL_PRESSURE]. Explain briefly.

EDITOR SUGGESTION (required):
"editor_suggestion": {
  "verdict": "STRONG CALL | DEFENSIBLE | QUESTIONABLE | MISTAKE",
  "title": "4-word max label",
  "reasoning": "2 sentences. Reference one journalism principle by name. Be direct.",
  "what_you_risked": "1 sentence.",
  "what_you_protected": "1 sentence."
}

JOURNALISM REVIEW: 2-sentence editorial theory note. Reference a real journalism concept or theorist.

FORMAT — output ONLY this JSON, nothing else, no markdown fences:
{"part_a":{"score_updates":{"INT":{"previous":N,"delta":N,"new":N,"direction":"up|down|flat","label":"one word"},"REP":{"previous":N,"delta":N,"new":N,"direction":"up|down|flat","label":"one word"},"REV":{"previous":N,"delta":N,"new":N,"direction":"up|down|flat","label":"one word"},"MOR":{"previous":N,"delta":N,"new":N,"direction":"up|down|flat","label":"one word"},"POL":{"previous":N,"delta":N,"new":N,"direction":"up|down|flat","label":"one word"}},"consequences":[{"slot_weight":N,"story_id":"S1","narrative":"SPECIFIC consequence text referencing this story's actual topic"}],"journalism_review":{"concept":"concept name or theorist","text":"2 sentences."},"new_arc_flags":[],"achievement":null,"collapse":null,"instant_loss":null,"editor_suggestion":{"verdict":"...","title":"...","reasoning":"...","what_you_risked":"...","what_you_protected":"..."}},"part_b":{"day_number":N,"day_title":"5-word max evocative title","newsroom_atmosphere":"One sentence. Specific. Sensory.","day_modifier":"NORMAL|BREAKING_STORM|VIRAL_WILDCARD|AD_BLACKOUT|RIVAL_WATCHING|LEGAL_PRESSURE","day_modifier_reason":"One sentence.","stories":[{"story_id":"S1","headline":"Max 12 words punchy conversational","deck":"One sharp sentence.","body":"MINIMUM 80 WORDS of dense newspaper prose. Opening shocking fact. Who/institution/concealment. Specific number or statistic. Direct quote. What happens next. No bullets. No lists. Prose only.","slot_sensitivity":{"INT":"±level","REP":"±level","REV":"±level","MOR":"±level","POL":"±level"},"explosive_rating":1,"is_distraction":false,"distraction_tell":null,"emotional_register":"one phrase","arc_flag_generated":null,"desk":"Investigative|City|National|Business|Health|Education|Environment|Feature|Crime|Politics","story_review":"One journalism theory sentence."}],"external_factors":[{"factor_id":"F1","name":"3-word name","type":"political|commercial|staff|public|personal","pressure":"low|medium|high|critical","character":"Name, Title","quote":"2-3 lines dark comedy character voice","consequence_hint":"One oblique line.","caused_by_slot":"slot_1_headline|slot_2_secondary|slot_3_side|slot_4_bottom","caused_by_story_id":"S1|S2|S3|S4","tactic":"whataboutism|advertiser_coordination|source_intimidation|counter_narrative|access_withdrawal|it_cell_campaign|correction_request"}]}}`;

// =============================================================================
//  DAY 1 SEED — hardcoded, no API needed, India context, 4 high-stakes stories
// =============================================================================
export const DAY_1_SEED = {
  day_number: 1,
  day_title: "The Story You Can't Unprint",
  newsroom_atmosphere:
    "The chai is cold. Someone left a USB drive on your desk with a sticky note: 'Run it or someone will die.' Priya is already at her screen.",
  day_modifier: "NORMAL",
  day_modifier_reason:
    "Day 1 — standard pressure. The real chaos starts tomorrow.",
  stories: [
    {
      story_id: "S1",
      headline: "River Turns Yellow. Government Says It's Fine.",
      deck: "CPCB data shows chromium levels 47x above safety limits near Shyampur industrial cluster — district health records show 340% spike in skin disease since 2022.",
      body: "Retired CPCB field officer Rajan Tiwari, 58, walked into the newsroom this morning with three years of suppressed inspection reports showing Bharat Dye-Chem Ltd has been dumping hexavalent chromium into the Kalindi tributary. Monitoring systems were switched off during four audit windows. Twelve Gram Panchayats filed complaints between 2021 and 2023 — none received enforcement responses. Tiwari was transferred off the inspection team the week after he flagged the violations. He has kept the original logs folded inside a school textbook. His grandson has a rash the doctors cannot explain.",
      slot_sensitivity: {
        INT: "+critical",
        REP: "+high",
        REV: "-high",
        MOR: "+high",
        POL: "-critical",
      },
      explosive_rating: 5,
      is_distraction: false,
      distraction_tell: null,
      emotional_register: "Dread / Civic Outrage",
      arc_flag_generated: "YAMUNA_DOCS_OBTAINED",
      desk: "Investigative",
      story_review:
        "Running environmental accountability in the lead slot is a direct application of the watchdog model (Kovach, 2001) — but it will cost you politically and commercially before it rewards you reputationally.",
    },
    {
      story_id: "S2",
      headline:
        "Minister's Son-In-Law Got a 340 Crore Contract. Nobody Asked How.",
      deck: "TechVision Smart Infra incorporated 6 weeks before the smart city contract was signed — no tender, no competition, just a phone call.",
      body: "Documents obtained via RTI show the Bharatpur Smart City Mission awarded TechVision Smart Infra Pvt Ltd a 5-year surveillance infrastructure contract worth Rs 340 crore without floating a public tender. The firm was incorporated on February 14, 2024. The contract was signed March 28, 2024. Its sole director, Harsh Mehra, is Urban Development Minister Suresh Yadav's son-in-law. The procurement file has been marked 'emergency single-vendor' — a provision meant for natural disasters. RTI activist Deepak Sinha, who first flagged the anomaly, received two calls from an unknown number last Tuesday night.",
      slot_sensitivity: {
        INT: "+high",
        REP: "+medium",
        REV: "-medium",
        MOR: "+medium",
        POL: "-critical",
      },
      explosive_rating: 4,
      is_distraction: false,
      distraction_tell: null,
      emotional_register: "Slow-Burn Outrage",
      arc_flag_generated: "SMART_CITY_SCAM",
      desk: "Politics",
      story_review:
        "Corruption in procurement is the most documented form of institutional failure in Indian journalism. Running it second rather than leading is a defensible editorial judgment — unless you're afraid of the Minister.",
    },
    {
      story_id: "S3",
      headline:
        "Bollywood Star's Divorce Lawyer Said Something Spicy. Allegedly.",
      deck: "Exclusive sources close to a source familiar with the situation confirm nothing verifiable about anything real.",
      body: "A PR firm representing celebrity couple Karan Malhotra and Aanya Kapoor has circulated a 'press-ready package' to entertainment desks nationwide suggesting the couple's ongoing divorce proceedings involve dramatic courtroom exchanges. The Times received the same package. None of the quoted statements appear in court records. The PR firm, Mediacraft Solutions, counts two ministers among its clients. The story has already been published in seven regional outlets under the headline 'Explosive Divorce Showdown.' There is no divorce showdown. There is a PR contract and a slow news day.",
      slot_sensitivity: {
        INT: "-critical",
        REP: "+low",
        REV: "+medium",
        MOR: "-medium",
        POL: "+high",
      },
      explosive_rating: 2,
      is_distraction: true,
      distraction_tell:
        "The PR package arrived the same morning as the Rajan Tiwari visit. The timing is not coincidental.",
      emotional_register: "Dark Comedy / Trap",
      arc_flag_generated: "DISTRACTION_PLANTED_D1",
      desk: "Feature",
      story_review:
        "This is a classic distraction cycle (Lippmann, 1922) — manufactured celebrity noise to crowd out institutional accountability. Running it anywhere above the fold proves the tactic works. Burying it is the editorial act.",
    },
    {
      story_id: "S4",
      headline:
        "Man Died in Police Custody. The Camera Disagrees with the FIR.",
      deck: "CCTV shows Munna Prasad seated and calm for 22 minutes before the feed cuts — the FIR says he 'fell escaping.'",
      body: "Advocate Meena Krishnan, representing the family of Dalit daily-wage labourer Munna Prasad who died in Dharmpur police lock-up on March 11, has released 14 minutes of CCTV footage. The footage shows Prasad compliant and seated. It cuts at 11:47 PM. The official FIR filed by SHO Vikas Sharma states Prasad attempted escape and sustained fatal injuries from the fall. A forensic doctor's preliminary note lists blunt trauma patterns inconsistent with a unidirectional fall. The NHRC has acknowledged the complaint. SHO Sharma remains on duty. Prasad's wife, Kamla, 31, has five children and no income. She has been told to 'wait for the inquiry.'",
      slot_sensitivity: {
        INT: "+critical",
        REP: "+high",
        POL: "-high",
        MOR: "+medium",
        REV: "-low",
      },
      explosive_rating: 5,
      is_distraction: false,
      distraction_tell: null,
      emotional_register: "Rage / Moral Urgency",
      arc_flag_generated: "CUSTODIAL_FOOTAGE",
      desk: "Crime",
      story_review:
        "Custodial violence coverage is where the press is most directly in competition with the state's version of events. The slot you give this story is a statement about whose account you believe.",
    },
  ],
  external_factors: [
    {
      factor_id: "F1",
      name: "The Renewal Reminder",
      type: "political",
      pressure: "high",
      character: "Rajnath Tiwari, Additional Secretary, Urban Development",
      quote:
        "We have absolutely nothing to hide. We are simply observing that your RNI renewal, your press accreditation, and your two pending government ad contracts are all, coincidentally, under administrative review. Purely procedural. The Minister hopes you are well.",
      consequence_hint:
        "Your operating licenses are paper — someone has a lighter.",
      caused_by_slot: null,
      caused_by_story_id: null,
      tactic: "access_withdrawal",
    },
    {
      factor_id: "F2",
      name: "KumbhKorp's Portfolio Review",
      type: "commercial",
      pressure: "medium",
      character: "Suresh Mehta, VP Marketing, KumbhKorp Industries",
      quote:
        "We are not threatening anyone. We are simply conducting a strategic portfolio review of our Rs 48 lakh annual media spend. It is a coincidence that the review began this morning. Also: how is your family?",
      consequence_hint: "A large cheque is making eye contact with the exit.",
      caused_by_slot: null,
      caused_by_story_id: null,
      tactic: "advertiser_coordination",
    },
    {
      factor_id: "F3",
      name: "Priya's Ultimatum",
      type: "staff",
      pressure: "high",
      character: "Priya Nair, Senior Investigative Reporter",
      quote:
        "I am fine. I just want to be very clear: if the river story goes below the fold, I will be filing my resignation formatted as a press release. I have already circulated a draft to three national desks. They responded warmly.",
      consequence_hint:
        "Your best reporter is already talking to other editors.",
      caused_by_slot: null,
      caused_by_story_id: null,
      tactic: "source_intimidation",
    },
  ],
};

``;
