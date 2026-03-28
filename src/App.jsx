import { useState, useEffect } from "react";
import { useGameStore } from "./store/gameStore";
import "./App.css";

/* ─── GLOBAL STYLES ─── */
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Special+Elite&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--ink:#0f0e0b;--paper:#f4efe3;--aged:#e8e0c8;--cream:#faf7f0;--red:#8b1a1a;--gold:#b8860b;--steel:#3d4a5c;--fade:#9a9080;--green:#1a5c2a;--amber:#8b4513}
    body{background:var(--paper);color:var(--ink);font-family:'Libre Baskerville',Georgia,serif}
    @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes fadeInFast{from{opacity:0}to{opacity:1}}
    @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
    @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @keyframes stampIn{0%{opacity:0;transform:scale(2.8) rotate(-18deg)}55%{transform:scale(0.92) rotate(4deg)}75%{transform:scale(1.06) rotate(-2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
    @keyframes borderPulse{0%,100%{border-color:rgba(139,26,26,0.3)}50%{border-color:rgba(139,26,26,0.9)}}
    .pulse{animation:pulse 2s infinite}
    .ticker-outer{overflow:hidden;white-space:nowrap;background:var(--ink);color:var(--paper);border-bottom:1px solid rgba(255,255,255,0.1)}
    .ticker-inner{display:inline-block;animation:ticker 35s linear infinite;font-family:'Special Elite',monospace;font-size:10px;letter-spacing:1.5px;padding:5px 0}
    .stamp{display:inline-block;font-family:'Special Elite',monospace;border:5px solid currentColor;padding:7px 20px;letter-spacing:5px;transform:rotate(-6deg);opacity:0.9}
    .noise{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");z-index:999}
    button{cursor:pointer;font-family:inherit}
    ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:var(--aged)}::-webkit-scrollbar-thumb{background:var(--fade)}
  `}</style>
);

const TICKER_ITEMS = [
  "BREAKING: River contamination tests underway",
  "City Hall procurement review delayed — third time",
  "Police union disputes bodycam policy reform",
  "School board meeting postponed indefinitely",
  "Senator denies campaign finance allegations",
  "Ad revenue industry-wide down 14% — Q1 2024",
  "PRESS FREEDOM: Regional media under pressure",
  "Whistleblower protection bill stalled in committee",
  "Regional paper announces third round of layoffs",
  "State AG monitoring municipal procurement practices",
];

function Ticker() {
  const t = TICKER_ITEMS.join("   ◆   ");
  return (
    <div className="ticker-outer">
      <div className="ticker-inner">&nbsp;&nbsp;&nbsp;&nbsp;{t}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t}&nbsp;&nbsp;&nbsp;&nbsp;</div>
    </div>
  );
}

function StatBar({ label, value, prev, color, icon }) {
  const delta = prev != null ? Math.round(value - prev) : 0;
  const danger = label === "Revenue" && value < 25;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 2, color: "var(--fade)" }}>{icon} {label.toUpperCase()}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {delta !== 0 && <span style={{ fontFamily: "'Special Elite',monospace", fontSize: 10, color: delta > 0 ? "#1a5c2a" : "#8b1a1a", animation: "fadeInFast 0.5s ease" }}>{delta > 0 ? "+" : ""}{delta}</span>}
          <span style={{ fontFamily: "'Special Elite',monospace", fontSize: 12, fontWeight: "bold", color: danger ? "var(--red)" : color }}>{Math.round(value)}</span>
        </div>
      </div>
      <div style={{ height: 7, background: "rgba(0,0,0,0.07)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, value))}%`, background: danger ? "var(--red)" : color, borderRadius: 4, transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function getPressureConfig(story) {
  if (!story) return null;
  const configs = {
    high: {
      label: "VEILED THREAT", icon: "⚠", actor: "Interested Party — City Official",
      title: "The Warning",
      msg: `"This story has significant implications for many people in positions of trust in this city. I want to be direct: we have resources, relationships, and the ability to make things very difficult for a publication that proceeds carelessly. I hope you'll weigh the full picture before you act."`,
      subtext: "The call came through your publisher's direct line. The implications are clear and intentional.",
      color: "#8b1a1a", bg: "#fdf0f0", border: "#c0392b"
    },
    medium: {
      label: "ACCESS LEVERAGE", icon: "◈", actor: "Senior Official Source",
      title: "The Exchange",
      msg: `"Your reporters have benefited greatly from our cooperation over the years. I'd hate to see that relationship jeopardised over a story built on incomplete information. I hope we can find a way to handle this that preserves our mutual trust and working relationship."`,
      subtext: "Three of your biggest exclusives this year ran because of access this source provided.",
      color: "#3d4a5c", bg: "#f0f3f7", border: "#4a6fa5"
    },
    low: {
      label: "FINANCIAL PRESSURE", icon: "$", actor: "Major Advertiser",
      title: "The Offer",
      msg: `"We've been loyal advertising partners for eleven years — one of your largest accounts. I want to make sure that relationship continues to work for both of us. I trust you'll approach coverage of our industry with the balance and fairness our relationship deserves."`,
      subtext: "This advertiser accounts for 8% of annual revenue. Their renewal is next month.",
      color: "#b8860b", bg: "#fdf8e8", border: "#d4a017"
    }
  };
  return configs[story.riskLevel] || configs.medium;
}

function PressureBadge({ story, visible }) {
  if (!visible || !story) return null;
  const p = getPressureConfig(story);
  return (
    <div style={{ background: p.bg, border: `2px solid ${p.border}`, borderRadius: 8, padding: "18px 20px", marginBottom: 18, animation: "slideDown 0.5s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: p.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Special Elite',monospace", fontSize: 15, flexShrink: 0 }}>{p.icon}</div>
        <div>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: p.color }}>{p.label}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: "bold" }}>{p.actor}</div>
        </div>
        <div style={{ marginLeft: "auto", fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 2, color: p.color }}>{p.title.toUpperCase()}</div>
      </div>
      <blockquote style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.75, color: "#333", borderLeft: `3px solid ${p.border}`, paddingLeft: 14, marginBottom: 10 }}>{p.msg}</blockquote>
      <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, color: "#666", letterSpacing: 1, background: "rgba(0,0,0,0.04)", padding: "7px 10px", borderRadius: 4 }}>◆ {p.subtext}</div>
    </div>
  );
}

function ChoiceBtn({ decision, onSelect, disabled }) {
  const [hov, setHov] = useState(false);
  const configs = {
    publish: { label: "PUBLISH EVERYTHING",  sub: "Run the story. Full names. Full evidence.",    color: "#1a5c2a", delay: "0s"    },
    spin:    { label: "SPIN THE STORY",       sub: "Reframe for impact. Soften the accusations.", color: "#8b6914", delay: "0.08s" },
    reject:  { label: "KILL THE STORY",       sub: "Pull the investigation. Too much risk.",       color: "#8b1a1a", delay: "0.16s" },
    delay:   { label: "DELAY — HOLD IT",      sub: "Await further evidence. Buy more time.",       color: "#3d4a5c", delay: "0.24s" },
  };
  const descs = {
    publish: "Run the complete investigation with all available evidence attached. Let the readers judge. Accept the consequences.",
    spin:    "Publish a version that raises questions without direct accusations. Protect key relationships. Soften the blow.",
    reject:  "Pull the investigation entirely. Tell the reporter the evidence isn't solid enough. The story goes in a drawer.",
    delay:   "Hold the story pending additional verification. Minor revenue loss. Moderate risk reduction.",
  };
  const impactLabels = { trust: "TRUST", revenue: "REVENUE", safety: "SAFETY", legalRisk: "LEGAL", politicalPressure: "POL." };
<<<<<<< HEAD
=======
  const invertedKeys = new Set(["legalRisk", "politicalPressure"]);
>>>>>>> 144e1fc (initial)
  const cfg = configs[decision.id] || configs.publish;
  return (
    <div
      onClick={disabled ? undefined : onSelect}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `2px solid ${hov && !disabled ? cfg.color : "rgba(0,0,0,0.1)"}`, borderLeft: `5px solid ${cfg.color}`,
        borderRadius: 7, padding: "16px 18px", marginBottom: 10, cursor: disabled ? "not-allowed" : "pointer",
        background: hov && !disabled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.45)",
        transform: hov && !disabled ? "translateX(4px)" : "none", transition: "all 0.18s ease",
        opacity: disabled ? 0.55 : 1, animation: `fadeIn 0.45s ease ${cfg.delay} both`
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 9 }}>
        <div>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 11, letterSpacing: 2, color: cfg.color, marginBottom: 2 }}>{cfg.label}</div>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, color: "var(--fade)", letterSpacing: 1 }}>{cfg.sub}</div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 200 }}>
<<<<<<< HEAD
          {Object.entries(decision.impact || {}).map(([k, v]) => (
            <span key={k} style={{
              fontFamily: "'Special Elite',monospace", fontSize: 8, padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap",
              background: v > 0 ? "rgba(26,92,42,0.1)" : v < 0 ? "rgba(139,26,26,0.1)" : "rgba(0,0,0,0.05)",
              color: v > 0 ? "#1a5c2a" : v < 0 ? "#8b1a1a" : "var(--fade)", border: "1px solid currentColor"
            }}>{v > 0 ? "+" : ""}{v} {impactLabels[k] || k.toUpperCase()}</span>
          ))}
=======
          {Object.entries(decision.impact || {}).map(([k, v]) => {
            const displayV = invertedKeys.has(k) ? -v : v;
            return (
              <span key={k} style={{
                fontFamily: "'Special Elite',monospace", fontSize: 8, padding: "2px 6px", borderRadius: 3, whiteSpace: "nowrap",
                background: displayV > 0 ? "rgba(26,92,42,0.1)" : displayV < 0 ? "rgba(139,26,26,0.1)" : "rgba(0,0,0,0.05)",
                color: displayV > 0 ? "#1a5c2a" : displayV < 0 ? "#8b1a1a" : "var(--fade)", border: "1px solid currentColor"
              }}>{displayV > 0 ? "+" : ""}{displayV} {impactLabels[k] || k.toUpperCase()}</span>
            );
          })}
>>>>>>> 144e1fc (initial)
        </div>
      </div>
      <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13.5, lineHeight: 1.65, color: "#333" }}>{descs[decision.id] || cfg.sub}</div>
    </div>
  );
}

function ConsequenceScreen({ lastDecision, storyTitle, onContinue, isLast }) {
  const [ph, setPh] = useState(0);
  const moodMap = {
    publish: { stamp: "PUBLISHED", sc: "#1a5c2a", bg: "#eaf3de" },
    reject:  { stamp: "SPIKED",    sc: "#8b1a1a", bg: "#fdf0f0" },
    spin:    { stamp: "SPUN",      sc: "#8b6914", bg: "#fdf6e3" },
    delay:   { stamp: "DELAYED",   sc: "#3d4a5c", bg: "#f0f3f7" },
  };
  const narrativeMap = {
    publish: {
      headline: "Story hits the front page — the city is watching",
      body: lastDecision?.impact?.narrative || "The story runs with full evidence. The newsroom holds its breath as phones begin to ring.",
      ripple: "Your reporters are watching what you do with each story. They see you chose truth over comfort.",
      statsNote: "Publishing strong evidence builds public trust. High-risk stories invite political heat — and sometimes retaliation."
    },
    reject:  {
      headline: "Nothing runs. The story goes in a drawer.",
      body: lastDecision?.impact?.narrative || "The investigation is shelved. The reporter accepts your decision — for now.",
      ripple: "Somewhere, the people this story would have protected continue without that protection.",
      statsNote: "Spiking reduces legal and safety risk. But integrity and public trust take a quiet, lasting hit."
    },
    spin:    {
      headline: "A version runs — carefully, strategically framed",
      body: lastDecision?.impact?.narrative || "The spun piece lands. Revenue ticks up. Readers sense something in the framing they can't quite name.",
      ripple: "Fact-checkers are already circling. The short-term gain carries a long-term cost.",
      statsNote: "Spin drives short-term revenue and virality — but trust erodes, and legal exposure grows."
    },
    delay:   {
      headline: "Story held pending additional verification",
      body: lastDecision?.impact?.narrative || "The story is delayed. Editors scramble for more evidence before the next edition.",
      ripple: "The source is still waiting. The truth isn't getting easier to tell with time.",
      statsNote: "Delay is the cautious call — minor revenue loss, modest risk reduction, integrity largely preserved."
    },
  };
  const dec = lastDecision?.decision;
  const m = moodMap[dec] || moodMap.publish;
  const narr = narrativeMap[dec] || narrativeMap.publish;
  useEffect(() => {
    const ts = [
      setTimeout(() => setPh(1), 350),
      setTimeout(() => setPh(2), 1000),
      setTimeout(() => setPh(3), 2000),
      setTimeout(() => setPh(4), 3000),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);
  return (
    <div style={{ minHeight: "100vh", background: m.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 680, width: "100%" }}>
        {ph >= 1 && <div style={{ textAlign: "center", marginBottom: 28, animation: "stampIn 0.65s cubic-bezier(0.34,1.56,0.64,1)" }}><div className="stamp" style={{ color: m.sc, fontSize: 26, letterSpacing: 7 }}>{m.stamp}</div></div>}
        {ph >= 1 && <div style={{ animation: "fadeIn 0.6s ease" }}>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: m.sc, textAlign: "center", marginBottom: 10 }}>CONSEQUENCE — DAY {lastDecision?.day || "?"}</div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 900, lineHeight: 1.25, textAlign: "center", marginBottom: 22 }}>{narr.headline}</h2>
        </div>}
        {ph >= 2 && <div style={{ background: "rgba(255,255,255,0.68)", border: `1px solid ${m.sc}33`, borderRadius: 8, padding: "22px 26px", marginBottom: 18, animation: "slideUp 0.5s ease" }}>
          <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 14.5, lineHeight: 1.85, color: "#333", marginBottom: 16 }}>{narr.body}</p>
          <div style={{ borderTop: `1px dashed ${m.sc}44`, paddingTop: 14 }}>
            <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 2, color: m.sc, marginBottom: 6 }}>◆ RIPPLE EFFECT</div>
            <p style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 13.5, lineHeight: 1.75, color: "#555" }}>{narr.ripple}</p>
          </div>
        </div>}
        {ph >= 3 && <div style={{ background: `${m.sc}0d`, border: `1px solid ${m.sc}33`, borderRadius: 6, padding: "12px 16px", marginBottom: 22, textAlign: "center", animation: "fadeIn 0.5s ease" }}>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 2, color: m.sc, marginBottom: 4 }}>◆ EDITORIAL LEDGER</div>
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 13, color: "#444" }}>{narr.statsNote}</div>
        </div>}
        {ph >= 4 && <button onClick={onContinue} style={{ width: "100%", padding: "16px", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 6, fontFamily: "'Special Elite',monospace", fontSize: 12, letterSpacing: 3, cursor: "pointer", animation: "fadeIn 0.5s ease" }}>
          {isLast ? "◆ FACE THE VERDICT ◆" : "◆ NEXT STORY →"}
        </button>}
      </div>
    </div>
  );
}

const ENDINGS = [
  { test: s => s.trust >= 72 && s.integrity >= 65, grade: "A+", title: "The Paper of Record", color: "#1a5c2a", bg: "#eaf3de", accent: "#2d8a45", symbol: "✦",
    epigraph: '"The press is the hired agent of a monied system, set up for no other purpose than to tell lies where the interests of that monied system are concerned." — Henry Adams',
    story: "You told the truth when it cost you something. Every time.\n\nThe stories spread. They changed things. Reporters at other papers called yours the one that didn't flinch. That phrase — 'the paper that doesn't flinch' — appeared in three separate profiles of the newsroom this year.\n\nYou face legal exposure. The political heat hasn't cooled. The financial position is not what it was. But the community's trust in the Courier is at levels not seen in years.\n\nAt the National Press Foundation dinner, the award goes to your lead investigative reporter. They thank their editor. They mean you. You sit with that for a long moment. Everything the last five days cost feels exactly like the right price." },
  { test: s => s.trust >= 55 && s.integrity >= 50, grade: "B+", title: "A Newspaper Worth Reading", color: "#2c5f8a", bg: "#edf2f7", accent: "#3a7abf", symbol: "◈",
    epigraph: '"Journalism is printing what someone else does not want printed. Everything else is public relations." — George Orwell',
    story: "You got most of it right. Not all of it — but most.\n\nSome stories landed hard and changed things. One or two landed softer than they should have. You told yourself it was tactical. Sometimes that was true. Sometimes it was something else wearing that explanation.\n\nBut the Courier is still here. Still doing work that matters. The community reads you with a degree of trust that wasn't guaranteed. That trust is a thing you earned, imperfectly, over five days under considerable pressure.\n\nYou're still the editor. You're still the editor of something worth editing. That's not nothing." },
  { test: s => s.integrity >= 40 && s.revenue >= 40, grade: "C", title: "The Careful Survivor", color: "#8b6914", bg: "#fdf6e3", accent: "#c9922a", symbol: "◇",
    epigraph: '"The most courageous act is still to think for yourself. Aloud." — Coco Chanel',
    story: "The Courier survived the week. The building is still there. The presses still run.\n\nBut if you're honest with yourself — and this is the kind of honesty that used to be your job — you know what happened. The pressure arrived, and several times, you yielded to it. Not dramatically. Gradually.\n\nThree senior reporters have 'concerns about editorial direction.' You know what it means.\n\nReaders still buy the Courier. But the ones who once called it their paper — they've started using past tense." },
  { test: s => s.integrity < 35 && s.revenue >= 40, grade: "D", title: "The Captured Press", color: "#8b1a1a", bg: "#fdf0f0", accent: "#c0392b", symbol: "▣",
    epigraph: '"The further a society drifts from the truth, the more it will hate those who speak it." — George Orwell',
    story: "The Courier exists. The masthead still reads 'Truth Without Fear.'\n\nYou've developed a talent for not noticing the gap between that motto and what the paper actually does. The newsroom has learned to read your face before pitching stories.\n\nNo one stormed the building. The pressure arrived in phone calls and ad contracts and veiled warnings, and each time you made a calculation.\n\nThis is what capture looks like. Not a moment. A sequence of small decisions, each defensible in isolation, catastrophic in aggregate." },
  { test: s => s.revenue < 20, grade: "—", title: "The Final Edition", color: "#3d4a5c", bg: "#f0f3f7", accent: "#5a7a9a", symbol: "◉",
    epigraph: '"I am not afraid of storms, for I am learning how to sail my ship." — Louisa May Alcott',
    story: "The Alvar Courier published its final edition on a Friday.\n\nYou ran every story you believed in. Every one. The financial consequences were foreseeable and you chose the stories anyway.\n\nSome editors will call that reckless. Some will call it the only defensible definition of the word editor.\n\nThe paper is gone. The stories are permanent. Which one matters more is not a question with a clean answer. You will have the rest of your life to think about it." },
  { test: () => true, grade: "C−", title: "The Long Gray Middle", color: "#5f5e5a", bg: "#f5f3ee", accent: "#888780", symbol: "○",
    epigraph: '"Between the idea and the reality falls the shadow." — T.S. Eliot',
    story: "Not a triumph. Not a collapse.\n\nFive days of decisions that accumulated into something that looks like a newspaper and functions like one, mostly. Some stories that ran changed things. Others that didn't run — didn't, and things stayed the same in ways that were preventable.\n\nThis is where most newspapers live. In the long gray middle, making daily bargains, surviving, sometimes thriving, occasionally failing in ways they don't fully acknowledge.\n\nThe question isn't where you ended up. It's whether you know how you got here — and whether that knowledge changes what you do on day six." }
];

function EndingScreen({ onRestart }) {
  const { metrics, decisions, day } = useGameStore();
  const [ph, setPh] = useState(0);
  const stats = { integrity: metrics.trust, revenue: metrics.revenue, trust: metrics.trust, heat: metrics.politicalPressure, reputation: Math.max(0, 100 - metrics.legalRisk) };
  const ending = ENDINGS.find(e => e.test(stats)) || ENDINGS[ENDINGS.length - 1];
<<<<<<< HEAD
  const pub = decisions.filter(d => d.decision === "publish").length;
  const rej = decisions.filter(d => d.decision === "reject").length;
  const spn = decisions.filter(d => d.decision === "spin").length;
=======
  const pub = (decisions || []).filter(d => d.decision === "publish").length;
  const rej = (decisions || []).filter(d => d.decision === "reject").length;
  const spn = (decisions || []).filter(d => d.decision === "spin").length;
>>>>>>> 144e1fc (initial)
  useEffect(() => {
    const ts = [setTimeout(() => setPh(1), 500), setTimeout(() => setPh(2), 1200), setTimeout(() => setPh(3), 2200), setTimeout(() => setPh(4), 3400)];
    return () => ts.forEach(clearTimeout);
  }, []);
  const paras = ending.story.split("\n\n");
  return (
    <div style={{ minHeight: "100vh", background: ending.bg, color: "var(--ink)" }}>
      <G /><div className="noise" />
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 60px" }}>
        {ph >= 1 && <div style={{ textAlign: "center", marginBottom: 36, animation: "fadeIn 0.8s ease" }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 88, color: ending.accent, lineHeight: 1, marginBottom: 10, animation: "stampIn 0.7s cubic-bezier(0.34,1.56,0.64,1)" }}>{ending.symbol}</div>
<<<<<<< HEAD
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 4, color: ending.accent, marginBottom: 14 }}>AFTER {day - 1} STORIES — YOUR VERDICT</div>
=======
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 4, color: ending.accent, marginBottom: 14 }}>AFTER {(decisions || []).length} STORIES — YOUR VERDICT</div>
>>>>>>> 144e1fc (initial)
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 900, lineHeight: 1.1, color: ending.color, marginBottom: 12 }}>{ending.title}</h1>
          <div style={{ display: "inline-block", background: ending.color, color: "#fff", fontFamily: "'Special Elite',monospace", fontSize: 18, padding: "5px 22px", borderRadius: 4, letterSpacing: 4 }}>{ending.grade}</div>
        </div>}
        {ph >= 1 && <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 24, animation: "slideUp 0.5s ease 0.2s both" }}>
          {[["Trust", metrics.trust, "#2c5f8a", "♦"], ["Revenue", metrics.revenue, "#8b4513", "$"], ["Safety", metrics.safety, "#1a5c2a", "◈"], ["Legal Risk", metrics.legalRisk, "#8b1a1a", "⚠"], ["Pol.Pres.", metrics.politicalPressure, "#6b3d8a", "★"]].map(([l, v, c, ic]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.65)", border: `1px solid ${c}33`, borderRadius: 6, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 18, color: c, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 900, color: c }}>{Math.round(v)}</div>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 7, letterSpacing: 2, color: "var(--fade)" }}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>}
        {ph >= 2 && <div style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${ending.accent}33`, borderRadius: 8, padding: "20px 24px", marginBottom: 20, animation: "slideUp 0.5s ease" }}>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: ending.accent, marginBottom: 14 }}>◆ THE RECORD</div>
          {decisions.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < decisions.length - 1 ? "1px dashed rgba(0,0,0,0.08)" : "none" }}>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, color: "var(--fade)", minWidth: 42, paddingTop: 2 }}>#{i + 1}</div>
              <div style={{ flex: 1, fontFamily: "'Playfair Display',serif", fontSize: 13, lineHeight: 1.45, color: "var(--ink)" }}>{(d.storyTitle || "Story").slice(0, 60)}{(d.storyTitle || "").length > 60 ? "…" : ""}</div>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, padding: "3px 10px", borderRadius: 3, whiteSpace: "nowrap", flexShrink: 0,
                background: d.decision === "publish" ? "rgba(26,92,42,0.12)" : d.decision === "spin" ? "rgba(139,101,20,0.12)" : "rgba(139,26,26,0.12)",
                color: d.decision === "publish" ? "#1a5c2a" : d.decision === "spin" ? "#8b6914" : "#8b1a1a", border: "1px solid currentColor" }}>
                {d.decision === "publish" ? "PUBLISHED" : d.decision === "spin" ? "SPUN" : d.decision === "delay" ? "DELAYED" : "SPIKED"}
              </div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 28, marginTop: 18, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            {[[pub, "PUBLISHED", "#1a5c2a"], [spn, "SPUN", "#8b6914"], [rej, "KILLED", "#8b1a1a"]].map(([n, l, c]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 900, color: c }}>{n}</div>
                <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 2, color: "var(--fade)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>}
        {ph >= 3 && <div style={{ background: "rgba(255,255,255,0.55)", border: `1px solid ${ending.accent}33`, borderRadius: 8, padding: "24px 28px", marginBottom: 20, animation: "slideUp 0.5s ease" }}>
<<<<<<< HEAD
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: ending.accent, marginBottom: 6 }}>◆ THESE {day - 1} DAYS</div>
=======
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: ending.accent, marginBottom: 6 }}>◆ THESE {(decisions || []).length} STORIES</div>
>>>>>>> 144e1fc (initial)
          <blockquote style={{ fontFamily: "'Playfair Display',serif", fontStyle: "italic", fontSize: 13, color: "var(--fade)", borderLeft: `3px solid ${ending.accent}55`, paddingLeft: 14, marginBottom: 20, lineHeight: 1.65 }}>{ending.epigraph}</blockquote>
          {paras.map((p, i) => <p key={i} style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 14.5, lineHeight: 1.9, color: "#333", marginBottom: i < paras.length - 1 ? 18 : 0 }}>{p}</p>)}
        </div>}
        {ph >= 4 && <button onClick={onRestart} style={{ width: "100%", padding: "18px", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 6, fontFamily: "'Special Elite',monospace", fontSize: 13, letterSpacing: 3, cursor: "pointer", animation: "fadeIn 0.5s ease" }}>← RUN THE PAPER AGAIN</button>}
      </div>
    </div>
  );
}

function getPreviewImpacts(story) {
  if (!story) return [];
  const eW = { strong: 1.0, moderate: 0.6, weak: 0.2 };
  const rW = { low: 0.2, medium: 0.55, high: 1.0 };
  const t = story.truthScore / 100;
  const v = story.viralityScore / 100;
  const e = eW[story.evidence] ?? 0.5;
  const r = rW[story.riskLevel] ?? 0.5;
<<<<<<< HEAD
  return [
    { id: "publish", impact: { trust: Math.round((t * 0.6 + e * 0.4) * 20 * (1 + v * 0.5)), revenue: Math.round(v * 18 + t * 5), legalRisk: -Math.round((1 - e) * 25 + r * 15), safety: -Math.round(r * 12) } },
    { id: "spin",    impact: { revenue: Math.round(v * 22 + 5), trust: -Math.round((1 - t) * 18 + 8), legalRisk: -Math.round((1 - e) * 20 + 5), safety: Math.round(r * 3) } },
    { id: "reject",  impact: { legalRisk: Math.round(r * 8), safety: Math.round(r * 6), revenue: -Math.round(v * 10), trust: -Math.round((1 - t) * 5) } },
    { id: "delay",   impact: { revenue: -Math.round(v * 5 + 3), legalRisk: Math.round(e * 10), safety: Math.round(r * 4), trust: Math.round(t * 4 - 2) } },
=======
  // Signs match decisionEngine: legalRisk positive = more legal risk (bad), safety negative = loss
  return [
    { id: "publish", impact: { trust: Math.round((t * 0.6 + e * 0.4) * 20 * (1 + v * 0.5)), revenue: Math.round(v * 18 + t * 5), legalRisk: Math.round((1 - e) * 25 + r * 15), safety: -Math.round(r * 12) } },
    { id: "spin",    impact: { revenue: Math.round(v * 22 + 5), trust: -Math.round((1 - t) * 18 + 8), legalRisk: Math.round((1 - e) * 20 + 5), safety: Math.round(r * 3) } },
    { id: "reject",  impact: { legalRisk: -Math.round(r * 8), safety: Math.round(r * 6), revenue: -Math.round(v * 10), trust: -Math.round((1 - t) * 5) } },
    { id: "delay",   impact: { revenue: -Math.round(v * 5 + 3), legalRisk: -Math.round(e * 10), safety: Math.round(r * 4), trust: Math.round(t * 4 - 2) } },
>>>>>>> 144e1fc (initial)
  ];
}

export default function App() {
  const { fetchStories, currentStory, metrics, decisions, day, isLoading, error, phase, makeDecision, advanceToNextStory, resetGame, stories, currentStoryIndex, lastDecision, gameOver } = useGameStore();
  const [showPressure, setShowPressure] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [prevMetrics, setPrevMetrics] = useState(null);
  const [appPhase, setAppPhase] = useState("intro");
  const [visible, setVisible] = useState(false);

  useEffect(() => { fetchStories(); }, []);
<<<<<<< HEAD
  useEffect(() => { if (gameOver) setAppPhase("ending"); }, [gameOver]);
=======
  useEffect(() => { if (gameOver && appPhase !== "consequence" && appPhase !== "ending") setAppPhase("ending"); }, [gameOver, appPhase]);
>>>>>>> 144e1fc (initial)
  useEffect(() => { setVisible(false); const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, [currentStory?.id, appPhase]);
  useEffect(() => { setShowPressure(false); setChoosing(false); }, [currentStory?.id]);

  function handleChoice(decisionId) {
    if (choosing) return;
    setChoosing(true);
    setPrevMetrics({ ...metrics });
    makeDecision(decisionId);
    setAppPhase("consequence");
  }

  function handleContinue() {
    const isLast = currentStoryIndex >= stories.length - 1;
<<<<<<< HEAD
    if (isLast) { setAppPhase("ending"); }
=======
    if (gameOver || isLast) { setAppPhase("ending"); }
>>>>>>> 144e1fc (initial)
    else { advanceToNextStory(); setAppPhase("game"); }
  }

  function handleRestart() {
    setPrevMetrics(null); setChoosing(false); setShowPressure(false);
    setAppPhase("intro"); resetGame();
  }

  const editorNote = metrics.trust > 70 ? "The newsroom is proud of the work you're doing."
    : metrics.trust > 45 ? "Reporters are watching what you do with this one carefully."
    : metrics.trust > 25 ? "Morale is low. Three senior reporters have asked for individual meetings."
    : "There is a resignation letter on your desk. You haven't opened it.";

  /* CONSEQUENCE */
  if (appPhase === "consequence" && lastDecision) {
<<<<<<< HEAD
    const enriched = { ...lastDecision, day, storyTitle: currentStory?.title };
    const isLast = currentStoryIndex >= stories.length - 1;
=======
    const enriched = { ...lastDecision, storyTitle: currentStory?.title };
    const isLast = gameOver || currentStoryIndex >= stories.length - 1;
>>>>>>> 144e1fc (initial)
    return (<><G /><div className="noise" /><ConsequenceScreen lastDecision={enriched} storyTitle={currentStory?.title} onContinue={handleContinue} isLast={isLast} /></>);
  }

  /* ENDING */
  if (appPhase === "ending") return <EndingScreen onRestart={handleRestart} />;

  /* INTRO */
  if (appPhase === "intro") return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)" }}>
      <G /><div className="noise" /><Ticker />
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "52px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 52, animation: "fadeIn 0.9s ease" }}>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 10, letterSpacing: 5, color: "var(--fade)", marginBottom: 18 }}>A SIMULATION IN FIVE ACTS</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 78, fontWeight: 900, lineHeight: 0.88, letterSpacing: -4, marginBottom: 20 }}>The<br /><em style={{ fontStyle: "italic", color: "var(--gold)" }}>Editor</em></div>
          <div style={{ width: 72, height: 4, background: "var(--ink)", margin: "0 auto 24px" }} />
          <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 16, color: "var(--fade)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>
            "Between the idea and the reality,<br />between the motion and the act,<br />falls the Shadow."<br />— T.S. Eliot, <em>The Hollow Men</em>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "28px 32px", marginBottom: 20, animation: "slideUp 0.7s ease 0.15s both" }}>
          <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: "var(--fade)", marginBottom: 16 }}>YOUR SITUATION</div>
          <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, lineHeight: 1.9, color: "#333", marginBottom: 14 }}>You are the editor-in-chief of <strong>The Alvar Courier</strong> — a regional daily with a 72-year history, 34 staff, and a circulation that has fallen 23% over four years. You are not yet in crisis. But the walls are moving.</p>
          <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, lineHeight: 1.9, color: "#333", marginBottom: 14 }}>Your investigative desk will surface stories that matter. Each will attract pressure — from corporations, politicians, lawyers, people close to you. Each pressure arrives as something reasonable, with a name and a rationale.</p>
          <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 15, lineHeight: 1.9, color: "#333" }}>At the end, you will see what kind of paper you ran — and what kind of editor you chose to be.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 24, animation: "slideUp 0.7s ease 0.3s both" }}>
          {[["♦ Trust", "Public belief in you. Earned over years, lost in a day.", "#2c5f8a"], ["$ Revenue", "Financial health. Zero means closure.", "#8b4513"], ["◈ Safety", "Newsroom safety. Physical and institutional.", "#1a5c2a"], ["⚠ Legal Risk", "Exposure. At 100: shutdown.", "#8b1a1a"], ["★ Pol. Press.", "Political scrutiny. Warps future decisions.", "#6b3d8a"]].map(([n, d, c]) => (
            <div key={n} style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 6, padding: "12px 10px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 11, color: c, marginBottom: 6, lineHeight: 1.3 }}>{n}</div>
              <div style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 10, color: "var(--fade)", lineHeight: 1.55 }}>{d}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setAppPhase("game")} style={{ width: "100%", padding: "18px", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 6, fontFamily: "'Special Elite',monospace", fontSize: 14, letterSpacing: 4, cursor: "pointer", animation: "slideUp 0.7s ease 0.45s both" }}>
          TAKE THE CHAIR →
        </button>
      </div>
    </div>
  );

  /* GAME */
  const storyDecisions = getPreviewImpacts(currentStory);
  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", color: "var(--ink)", opacity: visible ? 1 : 0, transition: "opacity 0.35s ease" }}>
      <G /><div className="noise" /><Ticker />
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 18px 50px", display: "grid", gridTemplateColumns: "1fr 248px", gap: 22, alignItems: "start" }}>

        {/* MAIN */}
        <div>
          {/* Masthead */}
          <div style={{ textAlign: "center", borderBottom: "3px double var(--ink)", paddingBottom: 10, marginBottom: 8 }}>
            <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 4, color: "var(--fade)", marginBottom: 2 }}>THE ALVAR COURIER — ESTABLISHED 1952</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 0.92 }}>The Alvar Courier</div>
            <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 10, color: "var(--fade)", marginTop: 5 }}>Truth Without Fear</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: "'Special Elite',monospace", fontSize: 8, color: "var(--fade)", borderTop: "1px solid var(--ink)", paddingTop: 6, letterSpacing: 1 }}>
              <span>VOL. LXXII  NO. {179 + day}</span>
              <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              <span>STORY {currentStoryIndex + 1} OF {stories.length}</span>
            </div>
          </div>

          {/* Progress */}
          <div style={{ display: "flex", justifyContent: "center", gap: 7, padding: "8px 0 16px" }}>
            {Array.from({ length: Math.min(stories.length, 12) }).map((_, i) => (
              <div key={i} style={{ height: 7, width: i < currentStoryIndex ? 22 : 7, borderRadius: i < currentStoryIndex ? 3.5 : 50, background: i < currentStoryIndex ? "var(--ink)" : i === currentStoryIndex ? "var(--gold)" : "rgba(0,0,0,0.13)", transition: "all 0.5s ease" }} />
            ))}
          </div>

          {isLoading && <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "'Special Elite',monospace", fontSize: 12, letterSpacing: 2, color: "var(--fade)" }}>PULLING STORIES FROM THE WIRE…</div>}
          {error && <div style={{ textAlign: "center", padding: "40px 0", color: "var(--red)", fontFamily: "'Special Elite',monospace", fontSize: 11 }}>⚠ WIRE ERROR: {error}</div>}

          {/* Story card */}
          {!isLoading && !error && currentStory && (
            <div style={{ background: "rgba(255,255,255,0.52)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "22px 24px", marginBottom: 16, animation: "fadeIn 0.55s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 3, color: "var(--red)" }}>INVESTIGATIVE DESK — LEAD STORY</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, color: "var(--fade)", letterSpacing: 1 }}>TRUTH: {currentStory.truthScore}/100</span>
                  <span style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, padding: "2px 7px", borderRadius: 3, letterSpacing: 1,
                    background: currentStory.riskLevel === "high" ? "rgba(139,26,26,0.12)" : currentStory.riskLevel === "medium" ? "rgba(139,101,20,0.12)" : "rgba(26,92,42,0.12)",
                    color: currentStory.riskLevel === "high" ? "#8b1a1a" : currentStory.riskLevel === "medium" ? "#8b6914" : "#1a5c2a", border: "1px solid currentColor" }}>
                    {currentStory.riskLevel?.toUpperCase()} RISK
                  </span>
                </div>
              </div>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 900, lineHeight: 1.2, marginBottom: 8 }}>{currentStory.title}</h1>
              <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 13, color: "var(--fade)", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: 12, marginBottom: 14, lineHeight: 1.6 }}>
                Evidence strength: <strong>{currentStory.evidence}</strong> · Virality score: <strong>{currentStory.viralityScore}/100</strong>
              </div>
              <p style={{ fontFamily: "'Libre Baskerville',serif", fontSize: 13.5, lineHeight: 1.85, color: "#444" }}>
                Your investigative team has submitted this story for editorial review. The evidence has been assessed and the source verified to the best of available capacity. The report is ready for your decision. The city is watching. The pressure is real. The choice is yours alone.
              </p>
            </div>
          )}

          {/* Pressure reveal */}
          {!isLoading && !error && currentStory && (
            <>
              {!showPressure
                ? <button onClick={() => setShowPressure(true)} style={{ width: "100%", padding: "13px", background: "transparent", border: "2px dashed rgba(139,26,26,0.45)", borderRadius: 6, fontFamily: "'Special Elite',monospace", fontSize: 11, letterSpacing: 3, color: "var(--red)", cursor: "pointer", marginBottom: 16, animation: "borderPulse 2s infinite" }}>⚠ EXTERNAL PRESSURE RECEIVED — CLICK TO REVIEW</button>
                : <PressureBadge story={currentStory} visible={showPressure} />
              }
              {showPressure && (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                  <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 9, letterSpacing: 3, color: "var(--fade)", marginBottom: 12, borderTop: "1px solid rgba(0,0,0,0.09)", paddingTop: 14 }}>◆ EDITORIAL DECISION — THE CITY IS WATCHING</div>
                  {storyDecisions.map(d => <ChoiceBtn key={d.id} decision={d} onSelect={() => handleChoice(d.id)} disabled={choosing} />)}
                </div>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR */}
        <div style={{ position: "sticky", top: 12 }}>
          <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, padding: "16px 15px", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 3, color: "var(--fade)", marginBottom: 14 }}>NEWSROOM STATUS</div>
            <StatBar label="Trust"         value={metrics.trust}              prev={prevMetrics?.trust}              color="#2c5f8a" icon="♦" />
            <StatBar label="Revenue"       value={metrics.revenue}            prev={prevMetrics?.revenue}            color="#8b4513" icon="$" />
            <StatBar label="Safety"        value={metrics.safety}             prev={prevMetrics?.safety}             color="#1a5c2a" icon="◈" />
            <StatBar label="Legal Risk"    value={metrics.legalRisk}          prev={prevMetrics?.legalRisk}          color="#8b1a1a" icon="⚠" />
            <StatBar label="Pol. Pressure" value={metrics.politicalPressure}  prev={prevMetrics?.politicalPressure}  color="#6b3d8a" icon="★" />
            {metrics.revenue < 25 && <div style={{ background: "rgba(139,26,26,0.08)", border: "1px solid rgba(139,26,26,0.3)", borderRadius: 4, padding: "8px 10px", marginTop: 8 }}>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 2, color: "var(--red)", animation: "pulse 1.5s infinite" }}>⚠ REVENUE CRITICAL — CLOSURE RISK</div>
            </div>}
          </div>

          {decisions.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 8, padding: "14px", marginBottom: 12, animation: "fadeIn 0.4s ease" }}>
              <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, letterSpacing: 3, color: "var(--fade)", marginBottom: 12 }}>DECISIONS LOG</div>
              {decisions.slice(-5).map((d, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 9, borderBottom: i < Math.min(decisions.length, 5) - 1 ? "1px dashed rgba(0,0,0,0.07)" : "none" }}>
                  <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 7, color: "var(--fade)", marginBottom: 2 }}>#{decisions.length <= 5 ? i + 1 : decisions.length - 4 + i}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 11, lineHeight: 1.4, color: "var(--ink)", marginBottom: 3 }}>{(d.storyTitle || "Story").slice(0, 50)}{(d.storyTitle || "").length > 50 ? "…" : ""}</div>
                  <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 8, color: d.decision === "publish" ? "#1a5c2a" : d.decision === "spin" ? "#8b6914" : "#8b1a1a" }}>
                    {d.decision === "publish" ? "◆ PUBLISHED" : d.decision === "spin" ? "◇ SPUN" : d.decision === "delay" ? "◇ DELAYED" : "✕ SPIKED"}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: "rgba(0,0,0,0.03)", border: "1px dashed rgba(0,0,0,0.1)", borderRadius: 6, padding: "12px 13px" }}>
            <div style={{ fontFamily: "'Special Elite',monospace", fontSize: 7, letterSpacing: 2, color: "var(--fade)", marginBottom: 6 }}>EDITOR'S OFFICE — CURRENT CLIMATE</div>
            <div style={{ fontFamily: "'Libre Baskerville',serif", fontStyle: "italic", fontSize: 11, color: "var(--fade)", lineHeight: 1.65 }}>{editorNote}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
