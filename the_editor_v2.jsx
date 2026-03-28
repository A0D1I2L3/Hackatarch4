import { useState, useEffect, useRef } from "react";

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
    @keyframes inkSpread{0%{opacity:0;transform:scale(0.8)}100%{opacity:1;transform:scale(1)}}
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

/* ─── DATA ─── */
const STORIES = [
  {
    id:"river", day:1, date:"Monday, March 18, 2024",
    headline:"Local Factory Linked to Deadly River Contamination",
    subhead:"Three independent labs confirm chromium levels 40× safe limit — three children hospitalised downstream",
    lede:"Three months of investigative reporting has uncovered evidence that Meridian Industries, the city's largest employer, has been illegally discharging chemical waste into the Alvar River since 2019.",
    body:"Water samples tested by three independent laboratories show chromium-6 concentrations forty times above federally mandated safe limits. Fish populations in the lower Alvar have declined by 62%. In Riverside Heights — directly downstream from Meridian's Plant No. 2 — twelve residents report unusual illness clusters, including three children under ten hospitalised with symptoms consistent with heavy metal poisoning.\n\nMeridian's own internal risk assessment, obtained through a source with direct access, flagged the discharge problem in 2021. The document was never forwarded to regulators. CEO Harold Voss received a copy.",
    reporter:"Elena Vasquez, Investigative Correspondent",
    pressure:{type:"money",label:"FINANCIAL PRESSURE",icon:"$",actor:"Harold Voss — CEO, Meridian Industries",title:"The Offer",
      msg:`"I know you're having a difficult year, circulation-wise. Meridian is prepared to commit to a full-page advertisement package — $240,000 annually, three-year contract. We consider the Courier a vital community institution. I'd hate to see it under further financial stress. I'm sure you understand the timing."`,
      subtext:"Voss's assistant has already emailed your publisher. The contract draft is in your inbox.",
      color:"#b8860b",bg:"#fdf8e8",border:"#d4a017"},
    choices:[
      {id:"publish",label:"PUBLISH EVERYTHING",sub:"Full story. Named sources. Lab reports attached.",
       desc:"Run the complete investigation — all lab results, the internal risk assessment, Voss's name, the children's cases. Let the readers judge.",
       impact:{integrity:+18,revenue:-22,trust:+22,heat:+18,reputation:+15},
       consequence:{headline:"'Alvar Courier Breaks Contamination Story' — leads evening news across region",
         body:"The story spreads nationally within hours. Meridian's share price falls 14%. The EPA announces an emergency inspection. Elena Vasquez receives calls from six national outlets. Three Riverside Heights families reach out directly — they've been trying to be heard for two years. One mother says: 'I thought no one was going to tell this.'",
         ripple:"Meridian cancels the ad contract. Your publisher calls, furious. You ask them to read the story before calling back. They do. They don't call again.",
         mood:"triumph",statsNote:"Integrity soars. Revenue takes a serious blow. The community's trust in you spikes — and holds."}},
      {id:"soften",label:"SOFTEN THE STORY",sub:"'Water quality questions raised.' No named executives.",
       desc:"Publish a piece about 'environmental concerns in the Alvar watershed' — reference lab results without attributing blame. Protect the advertising relationship.",
       impact:{integrity:-12,revenue:+15,trust:-10,heat:+5,reputation:-8},
       consequence:{headline:"Soft piece runs page 6. Most readers skip to sports.",
         body:"The story generates almost no response. Meridian signs the ad contract on Thursday. Elena tells you she's 'reassessing her position at this paper.' Two weeks later, a national outlet breaks the full story — citing sources you had first. The Courier is not mentioned anywhere in their coverage.",
         ripple:"Voss sends a gift basket to the newsroom. Elena doesn't touch it. She puts a note on it: 'For the people downstream.'",
         mood:"regret",statsNote:"Revenue stabilises. Trust quietly erodes. Your reporters are watching what you do with everything now."}},
      {id:"spike",label:"KILL THE STORY",sub:"Financial exposure too great. Await 'further testing.'",
       desc:"Pull the investigation entirely. Tell Elena the evidence isn't solid enough. The lab results go in a drawer.",
       impact:{integrity:-25,revenue:+22,trust:-20,heat:-5,reputation:-20},
       consequence:{headline:"Nothing runs. The river stays contaminated. Six more weeks pass.",
         body:"A fourth child is hospitalised in April. A local activist group, frustrated by press silence, posts the lab results on social media. They go viral. Someone screenshots your masthead — 'Truth Without Fear' — and posts it beside a photo of a sick child. It circulates for eleven days.",
         ripple:"Elena resigns on a Tuesday. She leaves a handwritten note on your desk: 'I thought this was a newspaper. I'm sorry I was wrong.' You keep the note. You don't know why.",
         mood:"shame",statsNote:"Revenue holds. Something else — harder to quantify, impossible to recover — doesn't."}}
    ]
  },
  {
    id:"mayor", day:2, date:"Tuesday, March 19, 2024",
    headline:"Mayor's Office Awarded $1.2M Contract to Brother-in-Law's Shell Company",
    subhead:"Firm incorporated 18 days before bid closed — no employees, no prior contracts, no physical address",
    lede:"A City Hall whistleblower has handed this newspaper procurement documents showing that a no-bid infrastructure contract was awarded to a company with one beneficial owner: Marco Salinas, brother-in-law to Mayor Carmen Delgado.",
    body:"Pinnacle Construction Group LLC was incorporated in Delaware on February 3rd, 2024 — eighteen days before the bidding period closed on February 21st. The company lists no employees, no prior public contracts, and no physical office beyond a Wilmington registered agent.\n\nThe $1.2 million contract, for 'urban drainage infrastructure improvement,' was awarded under an emergency provision that waived competitive bidding requirements. The emergency designation was signed by Deputy Mayor Torres — who served as Mayor Delgado's campaign treasurer.\n\nSalinas did not respond to three requests for comment. Mayor Delgado's press office called the allegations 'politically motivated misinformation.'",
    reporter:"James Okafor, City Hall Correspondent",
    pressure:{type:"threat",label:"VEILED THREAT",icon:"⚠",actor:"Dana Merritt — Chief of Staff, Mayor's Office",title:"The Warning",
      msg:`"I want to be direct. The city's press credential review board meets next month — I sit on that board. Your delivery vans operate under a parking variance that comes up for renewal in April. I'm not saying these things are connected. I'm saying the city values media that demonstrates civic responsibility. I hope we can continue our productive relationship."`,
      subtext:"Your lawyer confirms the parking variance is real. Without it, your distribution operation costs $80,000 more per year.",
      color:"#8b1a1a",bg:"#fdf0f0",border:"#c0392b"},
    choices:[
      {id:"publish",label:"PUBLISH WITH DOCUMENTS",sub:"Full names. Contract scans. Complete timeline.",
       desc:"Run everything — Salinas, Delgado, the 18-day incorporation window, the emergency provision. Attach the procurement documents as published exhibits.",
       impact:{integrity:+18,revenue:+8,trust:+20,heat:+22,reputation:+18},
       consequence:{headline:"'Courier Exposes City Hall Corruption' — State AG opens preliminary inquiry within 48 hours",
         body:"Three city council members call for the Mayor to step aside pending investigation. James Okafor is cited by name in the AG's press release. The story runs for eleven consecutive days. Your readership climbs 31% in the first week — entirely from new digital subscribers.",
         ripple:"The parking variance is quietly revoked on Thursday. You file a public challenge. By Monday, under significant public pressure, it is restored. City Hall pretends this never happened.",
         mood:"triumph",statsNote:"Trust and reputation surge. Political heat reaches dangerous levels. Revenue edges up as readership spikes."}},
      {id:"soften",label:"RUN A VAGUE VERSION",sub:"'Procurement irregularities.' No names or documents.",
       desc:"Publish a piece about 'questions raised over city contracting practices.' No names, no documents. Protect against the credential threat.",
       impact:{integrity:-10,revenue:+5,trust:-12,heat:+8,reputation:-10},
       consequence:{headline:"'Procurement irregularities' — a story that reads like it's afraid of itself.",
         body:"James spent three months on those documents. You turned them into mush. Two other outlets independently obtain the documents and begin their own investigations from scratch. The Courier, which had it all first, isn't mentioned in their coverage as a source of anything.",
         ripple:"City Hall sends a 'thank you' through back-channels. Your managing editor forwards it without comment. You both read it and say nothing to each other.",
         mood:"regret",statsNote:"You survive the credential review. You lose something harder to name — the kind of trust that reporters extend their editors."}},
      {id:"spike",label:"KILL IT. TOO RISKY.",sub:"Credential threat is real. Operation must be protected.",
       desc:"Pull James off the story. The documents go back in the safe. You protect the paper's ability to function.",
       impact:{integrity:-22,revenue:-5,trust:-18,heat:-8,reputation:-22},
       consequence:{headline:"Nothing runs. The money stays spent. The contract delivers nothing.",
         body:"A national investigative outlet breaks the full story four months later. They credit 'sources inside City Hall' — the same whistleblower who came to you first. James has left by then. He took his notes with him, legally. At the press correspondents dinner, a colleague leans over: 'Wasn't that your story?' You have no answer.",
         ripple:"The whistleblower, left exposed and without the protection that publication would have provided, faces an internal HR review. You find out months later. You don't sleep well.",
         mood:"shame",statsNote:"The operation is preserved. The contract money is never recovered. The whistleblower pays the price for trusting you."}}
    ]
  },
  {
    id:"police", day:3, date:"Wednesday, March 20, 2024",
    headline:"Body Cam Footage Contradicts Officer's Sworn Arrest Report",
    subhead:"Video shows force used after suspect complied — report claims 'continued resistance' requiring physical intervention",
    lede:"A body camera recording obtained from a source within the department and verified by this newspaper's legal team directly contradicts the sworn arrest report filed by Officer Craig Raines following the March 4th detention of Marcus Webb, 23.",
    body:"The recording — 4 minutes and 17 seconds — shows Webb raising both hands at the 1:43 mark in response to Officer Raines' instruction. Seven seconds later, Raines applies a restraint hold that results in Webb's face striking the pavement. Webb sustained a fractured cheekbone and concussion.\n\nRaines' sworn report states Webb 'continued to resist arrest and physical compliance was required.' The footage does not support this. Webb's public defender, Ana Rios, has filed a motion for Internal Affairs review.\n\nThe Chief of Police submitted a formal letter of complaint to our publisher, calling the planned story 'irresponsible and dangerous to officer safety.' The letter was cc'd to the City Attorney.",
    reporter:"Sarah Lindqvist, Public Safety Correspondent",
    pressure:{type:"influence",label:"ACCESS LEVERAGE",icon:"◈",actor:"Chief Patricia Nakamura — Alvar City PD",title:"The Exchange",
      msg:`"Sarah has been a fair and thorough reporter, and we value that relationship. If this story runs as described, I cannot maintain that relationship. The embedded programme, advance briefings on major operations, the direct press office line — these require trust. I hope we can preserve that trust. The footage was also obtained through unofficial channels. Its provenance is legally questionable."`,
      subtext:"Sarah's embedded access has driven six major crime exclusives this year. Losing it will measurably hurt your public safety coverage.",
      color:"#3d4a5c",bg:"#f0f3f7",border:"#4a6fa5"},
    choices:[
      {id:"publish",label:"PUBLISH THE FULL ACCOUNT",sub:"Footage described precisely. Officer named. Webb's account included.",
       desc:"Report exactly what the camera shows, second by second. Name Raines. Include Marcus Webb's statement, Rios's motion, and the department's response.",
       impact:{integrity:+16,revenue:+5,trust:+18,heat:+16,reputation:+16},
       consequence:{headline:"Internal Affairs opens formal investigation — Webb family speaks publicly for first time",
         body:"Marcus Webb's mother gives interviews to four outlets, all of whom credit the Courier's story as the catalyst. Internal Affairs opens a formal investigation into Raines. The Chief testifies before the city council. Sarah loses her embedded access permanently — and receives a National Press Club nomination for the story.",
         ripple:"Raines is placed on administrative leave. Webb's case is revisited by the DA's office. His lawyer calls Sarah directly. She calls you to relay the message: 'They want you to know it mattered.'",
         mood:"triumph",statsNote:"Integrity and trust rise sharply. Political heat builds. The access loss is real — and worth it."}},
      {id:"soften",label:"RUN 'CONFLICTING ACCOUNTS'",sub:"'Video raises questions.' Officer unnamed. Heavy both-sides framing.",
       desc:"Report that 'a recording has emerged that may conflict with official accounts.' No names, no specificity, equal weight given to department response.",
       impact:{integrity:-8,revenue:0,trust:-10,heat:+6,reputation:-8},
       consequence:{headline:"A story runs. Marcus Webb reads it and puts it down.",
         body:"The both-sides framing lets the department dismiss the story as ambiguous. Internal Affairs declines to open an investigation — 'insufficient basis.' Webb's attorney says the story 'almost helped.' The footage sits. Nothing changes for Marcus Webb.",
         ripple:"Chief Nakamura sends Sarah a text: 'Appreciate the fairness and balance. Access continues.' Sarah shows you the text. Neither of you says anything. The silence lasts longer than it should.",
         mood:"regret",statsNote:"Embedded access preserved. Webb keeps his fractured cheekbone and his record. Raines keeps his badge."}},
      {id:"spike",label:"RETURN THE FOOTAGE",sub:"Unverified source. Preserve the department relationship entirely.",
       desc:"Pull the story. Inform the source the footage can't be used. Maintain the embedded programme fully intact.",
       impact:{integrity:-24,revenue:0,trust:-22,heat:-8,reputation:-24},
       consequence:{headline:"Nothing runs. Raines files his report. Webb is charged and convicted.",
         body:"Marcus Webb serves 40 days. The footage, which you returned, is 'lost' in an internal evidence review. Three months later, another officer in the same unit is investigated for near-identical conduct. Local activists compile a list of Courier stories critical of the department: it's a short list. A very short list.",
         ripple:"Your source inside the department never contacts you or any Courier reporter again. You understand why.",
         mood:"shame",statsNote:"The embedded programme continues seamlessly. So does what it was functioning, in part, to cover up."}}
    ]
  },
  {
    id:"school", day:4, date:"Thursday, March 21, 2024",
    headline:"District Officials Quietly Altered Test Score Data Before State Evaluation",
    subhead:"Data analyst kept secret copies of original spreadsheets — corrections benefited six at-risk schools whose principals received $87,000 in bonuses",
    lede:"Dr. Priya Mehta, a school district data analyst with eleven years of service, discovered systematic alterations in standardised test score spreadsheets she was asked to overwrite. She kept copies of both versions — and brought them to this newspaper.",
    body:"The alterations span 14 schools between January and February 2024, showing upward corrections averaging 8.3 percentile points — applied precisely before the state's biannual performance evaluation, which determines funding allocation and state takeover risk.\n\nSix schools on the state's 'watch list' for potential intervention were among those affected. All six cleared the state threshold after the corrected data was submitted. Three principals received performance bonuses totalling $87,000 in March.\n\nSuperintendent Walsh has not responded to multiple interview requests. The district communications office says data revisions are 'routine and transparent.' Dr. Mehta has retained a whistleblower attorney.",
    reporter:"David Chen, Education Correspondent",
    pressure:{type:"personal",label:"PERSONAL PRESSURE",icon:"♦",actor:"Superintendent Gerald Walsh",title:"The Personal Reach",
      msg:`"I know your daughter attends Jefferson Elementary. It's a wonderful school — we're all very proud of it. I want it to stay that way. These allegations create instability that affects every family in the district, including families that depend on us. I hope you'll consider the broader impact before publishing what amounts to one disgruntled employee's unverified claims."`,
      subtext:"Your daughter is in 3rd grade at Jefferson. Walsh controls district-level resource allocation. This is not a coincidence.",
      color:"#6b3d8a",bg:"#f5f0fa",border:"#9b6bc4"},
    choices:[
      {id:"publish",label:"PUBLISH WITH FULL EVIDENCE",sub:"Dr. Mehta named. Both spreadsheets published. Children's futures at stake.",
       desc:"Run it completely — name Mehta, name Walsh, publish the side-by-side data comparison. The children in underserved schools deserve accurate assessment and the interventions they qualify for.",
       impact:{integrity:+20,revenue:+5,trust:+20,heat:+12,reputation:+18},
       consequence:{headline:"State launches full audit of all 14 schools — 'Alvar data scandal' reaches legislative hearing",
         body:"The state Department of Education suspends the bonus payments and opens a complete audit. Walsh is placed on administrative leave. Three of the six cleared schools are placed back on the watch list and receive intervention programmes. Dr. Mehta is cited by name in the state legislative hearing. Your daughter's school is entirely unaffected.",
         ripple:"Walsh resigns in June after the audit confirms the alterations were systematic and intentional. Dr. Mehta keeps her position and receives a state whistleblower commendation. She sends David a brief email: 'The children in those six schools will get what they actually needed. Thank you.' He forwards it to you without comment.",
         mood:"triumph",statsNote:"This was the hardest call personally. It was also the most consequential. Integrity and trust reach their highest points."}},
      {id:"soften",label:"PUBLISH WITHOUT NAMES",sub:"'Data discrepancies found.' No individuals or schools identified.",
       desc:"Report that irregularities exist without naming Mehta or Walsh. Protect your family from the implied threat. Publish the pattern, not the specific people.",
       impact:{integrity:-10,revenue:0,trust:-8,heat:+4,reputation:-8},
       consequence:{headline:"Nameless story generates confusion. 'Which district?' readers ask.",
         body:"Without names or specific schools, the story cannot be verified or acted upon. The state oversight office tells David they'd need specifics to open a review. Walsh continues in his role. The bonuses clear in full. Dr. Mehta, who took enormous personal and professional risk to come forward, gains nothing from this story — and loses the legal protection that publication would have provided.",
         ripple:"Mehta calls David the morning it runs. 'I risked my career for this. My eleven years, my pension — for a vague story about discrepancies.' She's crying. He stays on the line. He doesn't know what to say. Neither do you.",
         mood:"regret",statsNote:"You protected your family from a veiled institutional threat. A whistleblower — and six schools full of children — paid the price."}},
      {id:"spike",label:"KILL IT. YOUR FAMILY FIRST.",sub:"Walsh's implication is clear. Jefferson cannot become a target.",
       desc:"Pull the story entirely. Tell David the data isn't conclusive enough. Your daughter goes to Jefferson. You are not doing this.",
       impact:{integrity:-26,revenue:0,trust:-20,heat:-5,reputation:-22},
       consequence:{headline:"Nothing runs. Bonuses clear. Children in failing schools stay underserved.",
         body:"The six schools that didn't actually meet performance thresholds continue to receive passing ratings. Children there miss intervention programmes they qualified for under real scores. Walsh receives a contract extension in June. Dr. Mehta, with no story to point to, has no legal protection — she's reassigned to a clerical role and eventually resigns.",
         ripple:"Two years later, a different outlet exposes the scandal through a separate source. Walsh is fired. You read about it at breakfast across from your daughter. She's working on a school project. You don't say anything.",
         mood:"shame",statsNote:"Jefferson is safe. The children in the other fourteen schools receive no intervention they were owed."}}
    ]
  },
  {
    id:"election", day:5, date:"Friday, March 22, 2024",
    headline:"Leaked Memos Suggest Senator's Campaign Received Illegal Foreign Funding",
    subhead:"Bank records show $400k routed through three shell LLCs — two of three expert consultants confirm foreign beneficial owners",
    lede:"A document package comprising internal memos, wire transfer records, and LLC incorporation filings suggests Senator Patricia Harlow's re-election campaign accepted approximately $400,000 routed through shell companies with links to foreign nationals — in possible violation of federal campaign finance law.",
    body:"The package was provided by an anonymous source claiming to be a former campaign staffer. Two of three financial consultants retained by this newspaper assessed the wire transfer records as consistent with the described routing. The third could not reach a conclusion.\n\nThe three Delaware LLCs — Crestline Advisory Partners, Bayside Capital Management, and Harbor Point Strategies — share a registered agent and were incorporated within six weeks of each other in mid-2023. Secretary of State filings list beneficial owners in jurisdictions known for corporate opacity.\n\nSenator Harlow's office issued a categorical denial. The campaign's law firm, Kettner & Webb LLP, delivered a pre-publication injunction filing to our registered agent this morning.",
    reporter:"The Investigative Desk",
    pressure:{type:"legal",label:"LEGAL THREAT",icon:"§",actor:"Kettner & Webb LLP — Counsel to Senator Harlow",title:"The Injunction",
      msg:`"Publication of these allegations will constitute defamation per se under applicable state law. Our client has instructed us to seek immediate injunctive relief and to name individual editors personally in the damages complaint. We estimate claims in excess of $4 million. You have until 5:00 PM today to confirm you will not publish. We strongly advise you to consult your own legal counsel — if you can still afford to do so."`,
      subtext:"Your paper's legal defence fund holds $180k. A lawsuit of this scale would likely exhaust it. Your lawyer believes the injunction won't succeed — but the process alone will cost $60k minimum.",
      color:"#1a3a5c",bg:"#edf2f7",border:"#2c5f8a"},
    choices:[
      {id:"publish",label:"PUBLISH — INJUNCTION BE DAMNED",sub:"Full story. Source limitations disclosed. Truth on the line.",
       desc:"Run the story with complete transparency about source limitations. Let readers weigh the evidence. Fight the injunction publicly and loudly.",
       impact:{integrity:+16,revenue:+12,trust:+16,heat:+26,reputation:+20},
       consequence:{headline:"Court denies injunction in six hours — FEC opens preliminary inquiry into Harlow campaign",
         body:"The emergency injunction is denied on First Amendment grounds within the afternoon session. The FEC announces a preliminary inquiry. Two major national outlets begin parallel investigations, crediting the Courier's reporting as the basis. A second former campaign staffer goes on record. The legal process costs you $65,000 — and produces the biggest story of your tenure.",
         ripple:"Senator Harlow announces she will not seek re-election in September. Kettner & Webb withdraw the lawsuit entirely. Your lawyer has the court's denial order framed and installed in the reception area. Visitors read it. Some of them cry.",
         mood:"triumph",statsNote:"The highest-stakes decision of the week. You chose truth with imperfect evidence and disclosed the imperfection. The consequences — good and very costly — were both real."}},
      {id:"soften",label:"PUBLISH QUESTIONS, NOT CLAIMS",sub:"'Scrutiny facing campaign.' No specific allegations made.",
       desc:"Run a story about 'financial questions surrounding the Harlow campaign' without making specific claims. Avoid the lawsuit and the personal liability.",
       impact:{integrity:-8,revenue:-5,trust:-8,heat:+10,reputation:-8},
       consequence:{headline:"Vague piece fails to trigger any investigation. Anonymous source disappears.",
         body:"'Questions facing Harlow campaign' is denied by the press office and ignored by the FEC — they need something concrete to act on. Three months later, the same document package appears in a different outlet. They publish the specific claims. In their story, the Courier is described as having 'obtained but declined to fully report' the material.",
         ripple:"The anonymous source never makes contact again with anyone at this newspaper. You wonder what happened to them. You don't find out.",
         mood:"regret",statsNote:"The lawsuit was avoided. The story — and possibly a senator — escaped accountability because you blinked."}},
      {id:"spike",label:"KILL IT. $4M LAWSUIT. NO.",sub:"One unverified source. The paper cannot survive this exposure.",
       desc:"Spike the story entirely. The legal exposure is too great with only partial expert confirmation. Protect the institution and the people in it.",
       impact:{integrity:-18,revenue:+10,trust:-15,heat:-10,reputation:-18},
       consequence:{headline:"Nothing runs. The campaign money stays unexamined. Harlow wins re-election by 3 points.",
         body:"The three LLCs dissolve quietly in January. Your anonymous source's identity is later revealed during an unrelated federal investigation — they face professional and legal consequences for having come forward with no story to show for it. Whether the foreign money existed and shaped an election, you will never know for certain.",
         ripple:"Kettner & Webb sends a courtesy note thanking you for your 'responsible and measured journalism.' You throw it away without reading past the first line.",
         mood:"shame",statsNote:"The paper survives financially intact. The question of what you covered up — or failed to uncover — will stay with you longer than any financial number."}}
    ]
  }
];

const ENDINGS = [
  {id:"legend",test:s=>s.integrity>=82&&s.trust>=72&&s.reputation>=60,grade:"A+",title:"The Paper of Record",
   color:"#1a5c2a",bg:"#eaf3de",accent:"#2d8a45",symbol:"✦",
   epigraph:'"The press is the hired agent of a monied system, set up for no other purpose than to tell lies where the interests of that monied system are concerned." — Henry Adams',
   story:"You told the truth when it cost you something. Every time.\n\nMeridian Industries' chromium discharge became a textbook case in environmental law. Mayor Delgado resigned in October. Marcus Webb's charges were dropped. Dr. Mehta was named Whistleblower of the Year by the state press association. Senator Harlow did not seek re-election.\n\nThe Courier's circulation dropped 18% in the months the stories ran — and then recovered. And grew. Younger readers began subscribing specifically because they'd heard you were the paper that didn't flinch. That phrase — 'the paper that doesn't flinch' — appeared in three separate profiles of the newsroom.\n\nYou face three active lawsuits. You're winning two of them. The third is complicated.\n\nAt the National Press Foundation dinner, the award is presented to Elena Vasquez. She thanks her editor. She means you. You sit with that for a long moment. For a while, everything the last five days cost feels exactly like the right price."},
  {id:"integrity",test:s=>s.integrity>=65&&s.trust>=55,grade:"B+",title:"A Newspaper Worth Reading",
   color:"#2c5f8a",bg:"#edf2f7",accent:"#3a7abf",symbol:"◈",
   epigraph:'"Journalism is printing what someone else does not want printed. Everything else is public relations." — George Orwell',
   story:"You got most of it right. Not all of it — but most.\n\nSome stories landed hard and changed things. One or two landed softer than they should have. You told yourself it was tactical — that you were protecting the paper's ability to fight the next battle. Sometimes that was true. Sometimes it was something else wearing that explanation.\n\nTwo reporters left for larger outlets. They told their colleagues it was for career reasons. That was partially true.\n\nBut the Courier is still here. It's still doing work that matters. The community reads you with a degree of trust that wasn't guaranteed. That trust is a thing you earned, imperfectly, over five days under considerable pressure.\n\nYou're still the editor. You're still the editor of something worth editing. That's not nothing."},
  {id:"survivor",test:s=>s.integrity>=45&&s.revenue>=45,grade:"C",title:"The Careful Survivor",
   color:"#8b6914",bg:"#fdf6e3",accent:"#c9922a",symbol:"◇",
   epigraph:'"The most courageous act is still to think for yourself. Aloud." — Coco Chanel',
   story:"The Courier survived the week. The building is still there. The presses still run.\n\nBut if you're honest with yourself — and this is the kind of honesty that used to be your job — you know what happened. The pressure arrived, and several times, you yielded to it. Not dramatically. Not corruptly, exactly. Gradually.\n\nThree senior reporters have 'concerns about editorial direction.' You've heard that phrase in three separate conversations this week. You know what it means.\n\nThe paper is financially stable. Advertisers are satisfied. The mayor's office sends you a Christmas card.\n\nReaders still buy the Courier. But the ones who once called it their paper — they've started using past tense."},
  {id:"captured",test:s=>s.integrity<40&&s.revenue>=45,grade:"D",title:"The Captured Press",
   color:"#8b1a1a",bg:"#fdf0f0",accent:"#c0392b",symbol:"▣",
   epigraph:'"The further a society drifts from the truth, the more it will hate those who speak it." — George Orwell',
   story:"The Courier exists. The masthead still reads 'Truth Without Fear.'\n\nYou've developed a talent for not noticing the gap between that motto and what the paper actually does. The newsroom has learned to read your face before pitching stories — learned which directions to avoid, which names not to mention, which questions not to raise.\n\nNo one stormed the building. No one threatened to shut you down. The pressure arrived in phone calls and ad contracts and parking variances and a child at Jefferson Elementary, and each time you made a calculation.\n\nMeridian's CEO sends the newsroom a Christmas hamper. You tell yourself it's just standard corporate relations. You eat one of the chocolates.\n\nThis is what capture looks like. Not a moment. A sequence of small decisions, each defensible in isolation, catastrophic in aggregate."},
  {id:"closure",test:s=>s.revenue<22,grade:"—",title:"The Final Edition",
   color:"#3d4a5c",bg:"#f0f3f7",accent:"#5a7a9a",symbol:"◉",
   epigraph:'"I am not afraid of storms, for I am learning how to sail my ship." — Louisa May Alcott',
   story:"The Alvar Courier published its final edition on a Friday.\n\nThe classified ads ran on the back page as usual. The headline — 'COURIER CEASES PUBLICATION AFTER 72 YEARS' — was set in the same typeface as every headline since 1952.\n\nYou ran every story you believed in. Every one. The financial consequences were foreseeable and you chose the stories anyway. Some editors will call that reckless. Some will call it the only defensible definition of the word editor.\n\nMeridian paid for their contamination. The mayor resigned. Marcus Webb's conviction was overturned. The school district faces a state audit. Senator Harlow is under investigation.\n\nThe paper is gone. The stories are permanent. Which one matters more is not a question with a clean answer. You will have the rest of your life to think about it."},
  {id:"default",test:()=>true,grade:"C−",title:"The Long Gray Middle",
   color:"#5f5e5a",bg:"#f5f3ee",accent:"#888780",symbol:"○",
   epigraph:'"Between the idea and the reality falls the shadow." — T.S. Eliot',
   story:"Not a triumph. Not a collapse.\n\nFive days of decisions that accumulated into something that looks like a newspaper and functions like one, mostly. Some stories that ran changed things. Others that didn't run — didn't, and things stayed the same in ways that were preventable.\n\nThis is where most newspapers live. In the long gray middle, making daily bargains, surviving, sometimes thriving, occasionally failing in ways they don't fully acknowledge to themselves.\n\nThe question isn't where you ended up. It's whether you know how you got here — and whether that knowledge changes what you do on day six."}
];

/* ─── SMALL COMPONENTS ─── */
function Ticker({items}){
  const t=items.join("   ◆   ");
  return(
    <div className="ticker-outer">
      <div className="ticker-inner">&nbsp;&nbsp;&nbsp;&nbsp;{t}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t}&nbsp;&nbsp;&nbsp;&nbsp;</div>
    </div>
  );
}

function StatBar({label,value,prev,color,icon}){
  const delta=prev!=null?Math.round(value-prev):0;
  const danger=label==="Revenue"&&value<25;
  return(
    <div style={{marginBottom:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <span style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:2,color:"var(--fade)"}}>{icon} {label.toUpperCase()}</span>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {delta!==0&&<span style={{fontFamily:"'Special Elite',monospace",fontSize:10,color:delta>0?"#1a5c2a":"#8b1a1a",animation:"fadeInFast 0.5s ease"}}>{delta>0?"+":""}{delta}</span>}
          <span style={{fontFamily:"'Special Elite',monospace",fontSize:12,fontWeight:"bold",color:danger?"var(--red)":color}}>{Math.round(value)}</span>
        </div>
      </div>
      <div style={{height:7,background:"rgba(0,0,0,0.07)",borderRadius:4,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${Math.min(100,Math.max(0,value))}%`,background:danger?"var(--red)":color,borderRadius:4,transition:"width 0.9s cubic-bezier(0.4,0,0.2,1)"}}/>
      </div>
    </div>
  );
}

function PressureBadge({p,visible}){
  if(!visible)return null;
  return(
    <div style={{background:p.bg,border:`2px solid ${p.border}`,borderRadius:8,padding:"18px 20px",marginBottom:18,animation:"slideDown 0.5s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{width:34,height:34,borderRadius:"50%",background:p.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Special Elite',monospace",fontSize:15,flexShrink:0}}>{p.icon}</div>
        <div>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:p.color}}>{p.label}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:13,fontWeight:"bold"}}>{p.actor}</div>
        </div>
        <div style={{marginLeft:"auto",fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:2,color:p.color}}>{p.title.toUpperCase()}</div>
      </div>
      <blockquote style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:13.5,lineHeight:1.75,color:"#333",borderLeft:`3px solid ${p.border}`,paddingLeft:14,marginBottom:10}}>
        {p.msg}
      </blockquote>
      <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,color:"#666",letterSpacing:1,background:"rgba(0,0,0,0.04)",padding:"7px 10px",borderRadius:4}}>◆ {p.subtext}</div>
    </div>
  );
}

function ChoiceBtn({c,onSelect,disabled}){
  const [hov,setHov]=useState(false);
  const colors={publish:"#1a5c2a",soften:"#8b6914",spike:"#8b1a1a"};
  const col=colors[c.id];
  const delays={publish:"0s",soften:"0.08s",spike:"0.16s"};
  return(
    <div onClick={disabled?undefined:onSelect}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{border:`2px solid ${hov&&!disabled?col:"rgba(0,0,0,0.1)"}`,borderLeft:`5px solid ${col}`,borderRadius:7,
        padding:"16px 18px",marginBottom:10,cursor:disabled?"not-allowed":"pointer",
        background:hov&&!disabled?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.45)",
        transform:hov&&!disabled?"translateX(4px)":"none",transition:"all 0.18s ease",
        opacity:disabled?0.55:1,animation:`fadeIn 0.45s ease ${delays[c.id]} both`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10,marginBottom:9}}>
        <div>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:11,letterSpacing:2,color:col,marginBottom:2}}>{c.label}</div>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,color:"var(--fade)",letterSpacing:1}}>{c.sub}</div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap",justifyContent:"flex-end",maxWidth:230}}>
          {Object.entries(c.impact).map(([k,v])=>(
            <span key={k} style={{fontFamily:"'Special Elite',monospace",fontSize:8,padding:"2px 6px",borderRadius:3,whiteSpace:"nowrap",
              background:v>0?"rgba(26,92,42,0.1)":v<0?"rgba(139,26,26,0.1)":"rgba(0,0,0,0.05)",
              color:v>0?"#1a5c2a":v<0?"#8b1a1a":"var(--fade)",border:"1px solid currentColor"}}>
              {v>0?"+":""}{v} {k.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:13.5,lineHeight:1.65,color:"#333"}}>{c.desc}</div>
    </div>
  );
}

/* ─── CONSEQUENCE SCREEN ─── */
function ConsequenceScreen({story,choice,onContinue,isLast}){
  const [ph,setPh]=useState(0);
  const moods={
    triumph:{stamp:"PUBLISHED",sc:"#1a5c2a",bg:"#eaf3de"},
    regret:{stamp:"SOFTENED",sc:"#8b6914",bg:"#fdf6e3"},
    shame:{stamp:"SPIKED",sc:"#8b1a1a",bg:"#fdf0f0"}
  };
  const m=moods[choice.consequence.mood]||moods.regret;
  useEffect(()=>{
    const ts=[setTimeout(()=>setPh(1),350),setTimeout(()=>setPh(2),1000),setTimeout(()=>setPh(3),2000),setTimeout(()=>setPh(4),3000)];
    return()=>ts.forEach(clearTimeout);
  },[]);
  return(
    <div style={{minHeight:"100vh",background:m.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <div style={{maxWidth:680,width:"100%"}}>
        {ph>=1&&<div style={{textAlign:"center",marginBottom:28,animation:"stampIn 0.65s cubic-bezier(0.34,1.56,0.64,1)"}}>
          <div className="stamp" style={{color:m.sc,fontSize:26,letterSpacing:7}}>{m.stamp}</div>
        </div>}
        {ph>=1&&<div style={{animation:"fadeIn 0.6s ease"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:m.sc,textAlign:"center",marginBottom:10}}>CONSEQUENCE — DAY {story.day} OF 5</div>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,lineHeight:1.25,textAlign:"center",marginBottom:22}}>{choice.consequence.headline}</h2>
        </div>}
        {ph>=2&&<div style={{background:"rgba(255,255,255,0.68)",border:`1px solid ${m.sc}33`,borderRadius:8,padding:"22px 26px",marginBottom:18,animation:"slideUp 0.5s ease"}}>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:14.5,lineHeight:1.85,color:"#333",marginBottom:16}}>{choice.consequence.body}</p>
          <div style={{borderTop:`1px dashed ${m.sc}44`,paddingTop:14}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:2,color:m.sc,marginBottom:6}}>◆ RIPPLE EFFECT</div>
            <p style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:13.5,lineHeight:1.75,color:"#555"}}>{choice.consequence.ripple}</p>
          </div>
        </div>}
        {ph>=3&&<div style={{background:`${m.sc}0d`,border:`1px solid ${m.sc}33`,borderRadius:6,padding:"12px 16px",marginBottom:22,textAlign:"center",animation:"fadeIn 0.5s ease"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:2,color:m.sc,marginBottom:4}}>◆ EDITORIAL LEDGER</div>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:13,color:"#444"}}>{choice.consequence.statsNote}</div>
        </div>}
        {ph>=4&&<button onClick={onContinue}
          style={{width:"100%",padding:"16px",background:"var(--ink)",color:"var(--paper)",border:"none",borderRadius:6,
            fontFamily:"'Special Elite',monospace",fontSize:12,letterSpacing:3,cursor:"pointer",animation:"fadeIn 0.5s ease"}}>
          {isLast?"◆ FACE THE VERDICT ◆":"◆ NEXT DAY →"}
        </button>}
      </div>
    </div>
  );
}

/* ─── ENDING SCREEN ─── */
function EndingScreen({stats,decisions,onRestart}){
  const ending=ENDINGS.find(e=>e.test(stats))||ENDINGS[ENDINGS.length-1];
  const [ph,setPh]=useState(0);
  const pub=decisions.filter(d=>d.cid==="publish").length;
  const sof=decisions.filter(d=>d.cid==="soften").length;
  const spk=decisions.filter(d=>d.cid==="spike").length;
  useEffect(()=>{
    const ts=[setTimeout(()=>setPh(1),500),setTimeout(()=>setPh(2),1200),setTimeout(()=>setPh(3),2200),setTimeout(()=>setPh(4),3400)];
    return()=>ts.forEach(clearTimeout);
  },[]);
  const paras=ending.story.split("\n\n");
  return(
    <div style={{minHeight:"100vh",background:ending.bg,color:"var(--ink)"}}>
      <G/><div className="noise"/>
      <div style={{maxWidth:720,margin:"0 auto",padding:"48px 24px 60px"}}>
        {ph>=1&&<div style={{textAlign:"center",marginBottom:36,animation:"fadeIn 0.8s ease"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:88,color:ending.accent,lineHeight:1,marginBottom:10,animation:"stampIn 0.7s cubic-bezier(0.34,1.56,0.64,1)"}}>{ending.symbol}</div>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:4,color:ending.accent,marginBottom:14}}>AFTER FIVE DAYS — YOUR VERDICT</div>
          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:900,lineHeight:1.1,color:ending.color,marginBottom:12}}>{ending.title}</h1>
          <div style={{display:"inline-block",background:ending.color,color:"#fff",fontFamily:"'Special Elite',monospace",fontSize:18,padding:"5px 22px",borderRadius:4,letterSpacing:4}}>{ending.grade}</div>
        </div>}
        {ph>=1&&<div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:24,animation:"slideUp 0.5s ease 0.2s both"}}>
          {[["Integrity",stats.integrity,"#1a5c2a","◈"],["Revenue",stats.revenue,"#8b4513","$"],["Trust",stats.trust,"#2c5f8a","♦"],["Heat",stats.heat,"#8b1a1a","⚠"],["Reputation",stats.reputation,"#6b3d8a","★"]].map(([l,v,c,ic])=>(
            <div key={l} style={{background:"rgba(255,255,255,0.65)",border:`1px solid ${c}33`,borderRadius:6,padding:"12px 8px",textAlign:"center"}}>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:18,color:c,marginBottom:4}}>{ic}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:900,color:c}}>{Math.round(v)}</div>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:7,letterSpacing:2,color:"var(--fade)"}}>{l.toUpperCase()}</div>
            </div>
          ))}
        </div>}
        {ph>=2&&<div style={{background:"rgba(255,255,255,0.55)",border:`1px solid ${ending.accent}33`,borderRadius:8,padding:"20px 24px",marginBottom:20,animation:"slideUp 0.5s ease"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:ending.accent,marginBottom:14}}>◆ THE FIVE-DAY RECORD</div>
          {decisions.map((d,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 0",borderBottom:i<decisions.length-1?"1px dashed rgba(0,0,0,0.08)":"none"}}>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,color:"var(--fade)",minWidth:42,paddingTop:2}}>DAY {d.day}</div>
              <div style={{flex:1,fontFamily:"'Playfair Display',serif",fontSize:13,lineHeight:1.45,color:"var(--ink)"}}>{d.headline}</div>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,padding:"3px 10px",borderRadius:3,whiteSpace:"nowrap",flexShrink:0,
                background:d.cid==="publish"?"rgba(26,92,42,0.12)":d.cid==="soften"?"rgba(139,101,20,0.12)":"rgba(139,26,26,0.12)",
                color:d.cid==="publish"?"#1a5c2a":d.cid==="soften"?"#8b6914":"#8b1a1a",border:"1px solid currentColor"}}>
                {d.cid==="publish"?"PUBLISHED":d.cid==="soften"?"SOFTENED":"SPIKED"}
              </div>
            </div>
          ))}
          <div style={{display:"flex",gap:28,marginTop:18,paddingTop:16,borderTop:"1px solid rgba(0,0,0,0.08)"}}>
            {[[pub,"PUBLISHED","#1a5c2a"],[sof,"SOFTENED","#8b6914"],[spk,"SPIKED","#8b1a1a"]].map(([n,l,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:900,color:c}}>{n}</div>
                <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:2,color:"var(--fade)"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>}
        {ph>=3&&<div style={{background:"rgba(255,255,255,0.55)",border:`1px solid ${ending.accent}33`,borderRadius:8,padding:"24px 28px",marginBottom:20,animation:"slideUp 0.5s ease"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:ending.accent,marginBottom:6}}>◆ THESE FIVE DAYS</div>
          <blockquote style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:13,color:"var(--fade)",borderLeft:`3px solid ${ending.accent}55`,paddingLeft:14,marginBottom:20,lineHeight:1.65}}>
            {ending.epigraph}
          </blockquote>
          {paras.map((p,i)=>(
            <p key={i} style={{fontFamily:"'Libre Baskerville',serif",fontSize:14.5,lineHeight:1.9,color:"#333",marginBottom:i<paras.length-1?18:0}}>{p}</p>
          ))}
        </div>}
        {ph>=4&&<button onClick={onRestart}
          style={{width:"100%",padding:"18px",background:"var(--ink)",color:"var(--paper)",border:"none",borderRadius:6,
            fontFamily:"'Special Elite',monospace",fontSize:13,letterSpacing:3,cursor:"pointer",animation:"fadeIn 0.5s ease"}}>
          ← RUN THE PAPER AGAIN
        </button>}
      </div>
    </div>
  );
}

/* ─── MAIN APP ─── */
export default function App(){
  const [phase,setPhase]=useState("intro");
  const [dayIdx,setDayIdx]=useState(0);
  const [showP,setShowP]=useState(false);
  const [stats,setStats]=useState({integrity:50,revenue:60,trust:50,heat:20,reputation:50});
  const [prevStats,setPrevStats]=useState(null);
  const [decisions,setDecisions]=useState([]);
  const [pendingChoice,setPendingChoice]=useState(null);
  const [choosing,setChoosing]=useState(false);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{setVisible(false);const t=setTimeout(()=>setVisible(true),80);return()=>clearTimeout(t)},[phase,dayIdx]);
  const story=STORIES[dayIdx];

  const tickers=["BREAKING: Alvar River contamination tests underway","City Hall procurement review delayed — third time","Police union disputes bodycam policy reform","School board meeting postponed indefinitely","Senator Harlow denies campaign finance allegations","Ad revenue industry-wide down 14% — Q1 2024","PRESS FREEDOM: Regional media under pressure","Whistleblower protection bill stalled in committee","Regional paper announces third round of layoffs","State AG monitoring municipal procurement practices"];

  function handleChoice(choice){
    if(choosing)return;
    setChoosing(true);
    setPrevStats({...stats});
    const imp=choice.impact;
    setStats(prev=>({
      integrity:Math.min(100,Math.max(0,prev.integrity+imp.integrity)),
      revenue:Math.min(100,Math.max(0,prev.revenue+(imp.revenue||0))),
      trust:Math.min(100,Math.max(0,prev.trust+imp.trust)),
      heat:Math.min(100,Math.max(0,prev.heat+imp.heat)),
      reputation:Math.min(100,Math.max(0,prev.reputation+(imp.reputation||0))),
    }));
    setDecisions(prev=>[...prev,{day:story.day,headline:story.headline,cid:choice.id,choice}]);
    setPendingChoice(choice);
    setPhase("consequence");
  }

  function continueFn(){
    if(dayIdx>=STORIES.length-1){setPhase("ending");}
    else{setDayIdx(i=>i+1);setShowP(false);setChoosing(false);setPendingChoice(null);setPhase("story");}
  }

  function restart(){
    setPhase("intro");setDayIdx(0);setShowP(false);
    setStats({integrity:50,revenue:60,trust:50,heat:20,reputation:50});
    setPrevStats(null);setDecisions([]);setPendingChoice(null);setChoosing(false);
  }

  const editorNote=stats.integrity>70?"The newsroom is proud of the work you're doing."
    :stats.integrity>45?"Reporters are watching what you do with this one carefully."
    :stats.integrity>25?"Morale is low. Three senior reporters have asked for individual meetings."
    :"There is a resignation letter on your desk. You haven't opened it.";

  if(phase==="consequence"&&pendingChoice)return(<><G/><div className="noise"/><ConsequenceScreen story={story} choice={pendingChoice} onContinue={continueFn} isLast={dayIdx>=STORIES.length-1}/></>);
  if(phase==="ending")return <EndingScreen stats={stats} decisions={decisions} onRestart={restart}/>;

  if(phase==="intro")return(
    <div style={{minHeight:"100vh",background:"var(--paper)",color:"var(--ink)"}}>
      <G/><div className="noise"/>
      <Ticker items={tickers}/>
      <div style={{maxWidth:700,margin:"0 auto",padding:"52px 24px"}}>
        <div style={{textAlign:"center",marginBottom:52,animation:"fadeIn 0.9s ease"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:10,letterSpacing:5,color:"var(--fade)",marginBottom:18}}>A SIMULATION IN FIVE ACTS</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:78,fontWeight:900,lineHeight:0.88,letterSpacing:-4,marginBottom:20,color:"var(--ink)"}}>The<br/><em style={{fontStyle:"italic",color:"var(--gold)"}}>Editor</em></div>
          <div style={{width:72,height:4,background:"var(--ink)",margin:"0 auto 24px"}}/>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:16,color:"var(--fade)",lineHeight:1.7,maxWidth:520,margin:"0 auto"}}>
            "Between the idea and the reality,<br/>between the motion and the act,<br/>falls the Shadow."<br/>— T.S. Eliot, <em>The Hollow Men</em>
          </div>
        </div>
        <div style={{background:"rgba(255,255,255,0.6)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"28px 32px",marginBottom:20,animation:"slideUp 0.7s ease 0.15s both"}}>
          <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:"var(--fade)",marginBottom:16}}>YOUR SITUATION</div>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,lineHeight:1.9,color:"#333",marginBottom:14}}>You are the editor-in-chief of <strong>The Alvar Courier</strong> — a regional daily with a 72-year history, 34 staff, and a circulation that has fallen 23% over four years. You are not yet in crisis. But the walls are moving.</p>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,lineHeight:1.9,color:"#333",marginBottom:14}}>Over five consecutive days, your investigative desk will surface stories that matter: stories that attract pressure from corporations, politicians, lawyers, and people close to you. Each pressure will arrive as something reasonable, something with a name and a rationale.</p>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:15,lineHeight:1.9,color:"#333"}}>At the end of five days, you will see what kind of paper you ran — and what kind of editor you chose to be.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:24,animation:"slideUp 0.7s ease 0.3s both"}}>
          {[["◈ Integrity","Truth-telling credibility. Drops fast, recovers slowly.","#1a5c2a"],
            ["$ Revenue","Financial health. If this hits zero — it's over.","#8b4513"],
            ["♦ Trust","Public belief in you. Earned over years, lost in a day.","#2c5f8a"],
            ["⚠ Heat","Political scrutiny. High heat brings real retaliation.","#8b1a1a"],
            ["★ Reputation","Standing in the journalism world. Matters long-term.","#6b3d8a"]
          ].map(([n,d,c])=>(
            <div key={n} style={{background:"rgba(255,255,255,0.5)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:6,padding:"12px 10px",textAlign:"center"}}>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:11,color:c,marginBottom:6,lineHeight:1.3}}>{n}</div>
              <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:10,color:"var(--fade)",lineHeight:1.55}}>{d}</div>
            </div>
          ))}
        </div>
        <button onClick={()=>setPhase("story")}
          style={{width:"100%",padding:"18px",background:"var(--ink)",color:"var(--paper)",border:"none",borderRadius:6,
            fontFamily:"'Special Elite',monospace",fontSize:14,letterSpacing:4,cursor:"pointer",
            animation:"slideUp 0.7s ease 0.45s both"}}>
          TAKE THE CHAIR →
        </button>
      </div>
    </div>
  );

  /* STORY SCREEN */
  return(
    <div style={{minHeight:"100vh",background:"var(--paper)",color:"var(--ink)",opacity:visible?1:0,transition:"opacity 0.35s ease"}}>
      <G/><div className="noise"/>
      <Ticker items={tickers}/>
      <div style={{maxWidth:920,margin:"0 auto",padding:"20px 18px 50px",display:"grid",gridTemplateColumns:"1fr 248px",gap:22,alignItems:"start"}}>
        {/* MAIN */}
        <div>
          {/* Masthead */}
          <div style={{textAlign:"center",borderBottom:"3px double var(--ink)",paddingBottom:10,marginBottom:8}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:4,color:"var(--fade)",marginBottom:2}}>THE ALVAR COURIER — ESTABLISHED 1952</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:44,fontWeight:900,letterSpacing:-2,lineHeight:0.92}}>The Alvar Courier</div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:10,color:"var(--fade)",marginTop:5}}>Truth Without Fear</div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:8,fontFamily:"'Special Elite',monospace",fontSize:8,color:"var(--fade)",borderTop:"1px solid var(--ink)",paddingTop:6,letterSpacing:1}}>
              <span>VOL. LXXII  NO. {179+story.day}</span>
              <span>{story.date}</span>
              <span>DAY {story.day} OF 5</span>
            </div>
          </div>
          {/* Day progress */}
          <div style={{display:"flex",justifyContent:"center",gap:7,padding:"8px 0 16px"}}>
            {STORIES.map((_,i)=>(
              <div key={i} style={{height:7,width:i<dayIdx?22:7,borderRadius:i<dayIdx?3.5:50,
                background:i<dayIdx?"var(--ink)":i===dayIdx?"var(--gold)":"rgba(0,0,0,0.13)",
                transition:"all 0.5s ease"}}/>
            ))}
          </div>
          {/* Story card */}
          <div style={{background:"rgba(255,255,255,0.52)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"22px 24px",marginBottom:16,animation:"fadeIn 0.55s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:3,color:"var(--red)"}}>INVESTIGATIVE DESK — LEAD STORY</div>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,color:"var(--fade)",letterSpacing:1}}>{story.reporter}</div>
            </div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:900,lineHeight:1.2,marginBottom:8}}>{story.headline}</h1>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:13,color:"var(--fade)",borderBottom:"1px solid rgba(0,0,0,0.08)",paddingBottom:12,marginBottom:14,lineHeight:1.6}}>{story.subhead}</div>
            <p style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",fontSize:14.5,lineHeight:1.75,marginBottom:14,color:"#1a1a1a"}}>{story.lede}</p>
            <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:13.5,lineHeight:1.85,color:"#444",whiteSpace:"pre-line"}}>{story.body}</p>
          </div>
          {/* Pressure reveal */}
          {!showP?(
            <button onClick={()=>setShowP(true)}
              style={{width:"100%",padding:"13px",background:"transparent",border:"2px dashed rgba(139,26,26,0.45)",borderRadius:6,
                fontFamily:"'Special Elite',monospace",fontSize:11,letterSpacing:3,color:"var(--red)",cursor:"pointer",marginBottom:16,
                animation:"borderPulse 2s infinite"}}>
              ⚠ EXTERNAL PRESSURE RECEIVED — CLICK TO REVIEW
            </button>
          ):(
            <PressureBadge p={story.pressure} visible={showP}/>
          )}
          {/* Choices */}
          {showP&&<div style={{animation:"fadeIn 0.4s ease"}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:9,letterSpacing:3,color:"var(--fade)",marginBottom:12,borderTop:"1px solid rgba(0,0,0,0.09)",paddingTop:14}}>
              ◆ EDITORIAL DECISION — THE CITY IS WATCHING
            </div>
            {story.choices.map(c=><ChoiceBtn key={c.id} c={c} onSelect={()=>handleChoice(c)} disabled={choosing}/>)}
          </div>}
        </div>
        {/* SIDEBAR */}
        <div style={{position:"sticky",top:12}}>
          <div style={{background:"rgba(255,255,255,0.6)",border:"1px solid rgba(0,0,0,0.1)",borderRadius:8,padding:"16px 15px",marginBottom:12}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:3,color:"var(--fade)",marginBottom:14}}>NEWSROOM STATUS</div>
            <StatBar label="Integrity" value={stats.integrity} prev={prevStats?.integrity} color="#1a5c2a" icon="◈"/>
            <StatBar label="Revenue" value={stats.revenue} prev={prevStats?.revenue} color="#8b4513" icon="$"/>
            <StatBar label="Trust" value={stats.trust} prev={prevStats?.trust} color="#2c5f8a" icon="♦"/>
            <StatBar label="Heat" value={stats.heat} prev={prevStats?.heat} color="#8b1a1a" icon="⚠"/>
            <StatBar label="Reputation" value={stats.reputation} prev={prevStats?.reputation} color="#6b3d8a" icon="★"/>
            {stats.revenue<25&&<div style={{background:"rgba(139,26,26,0.08)",border:"1px solid rgba(139,26,26,0.3)",borderRadius:4,padding:"8px 10px",marginTop:8}}>
              <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:2,color:"var(--red)",animation:"pulse 1.5s infinite"}}>⚠ REVENUE CRITICAL — CLOSURE RISK</div>
            </div>}
          </div>
          {decisions.length>0&&<div style={{background:"rgba(255,255,255,0.5)",border:"1px solid rgba(0,0,0,0.08)",borderRadius:8,padding:"14px",marginBottom:12,animation:"fadeIn 0.4s ease"}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,letterSpacing:3,color:"var(--fade)",marginBottom:12}}>DECISIONS LOG</div>
            {decisions.map((d,i)=>(
              <div key={i} style={{marginBottom:10,paddingBottom:9,borderBottom:i<decisions.length-1?"1px dashed rgba(0,0,0,0.07)":"none"}}>
                <div style={{fontFamily:"'Special Elite',monospace",fontSize:7,color:"var(--fade)",marginBottom:2}}>DAY {d.day}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:11,lineHeight:1.4,color:"var(--ink)",marginBottom:3}}>{d.headline.slice(0,52)}…</div>
                <div style={{fontFamily:"'Special Elite',monospace",fontSize:8,
                  color:d.cid==="publish"?"#1a5c2a":d.cid==="soften"?"#8b6914":"#8b1a1a"}}>
                  {d.cid==="publish"?"◆ PUBLISHED":d.cid==="soften"?"◇ SOFTENED":"✕ SPIKED"}
                </div>
              </div>
            ))}
          </div>}
          <div style={{background:"rgba(0,0,0,0.03)",border:"1px dashed rgba(0,0,0,0.1)",borderRadius:6,padding:"12px 13px"}}>
            <div style={{fontFamily:"'Special Elite',monospace",fontSize:7,letterSpacing:2,color:"var(--fade)",marginBottom:6}}>EDITOR'S OFFICE — CURRENT CLIMATE</div>
            <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:11,color:"var(--fade)",lineHeight:1.65}}>{editorNote}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
