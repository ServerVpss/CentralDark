# COMANDO - finance_digital_asset_custody_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_digital_asset_custody_briefing.js
**SHA:** 4e152af1f7ef206c
**Timestamp:** 2026-08-28T02:52:33.649936
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build_deck.js   (requires: npm install pptxgenjs)
- const rowStart = 2.9;

### Riscos
- { label: "PATH 01", title: "Build",   desc: "In-house custody, licensing, vault infrastructure.",             time: "24–36 months", capex: "High",      control: "Full",   risk: "Concentrated", dark: f
- { label: "PATH 02", title: "Partner", desc: "Sub-custody with qualified provider; bank delivers prime layer.", time: "6–12 months",  capex: "Moderate",  control: "Shared", risk: "Mitigated",    dark: 
- { label: "PATH 03", title: "Buy",     desc: "Acquire a crypto-native custodian or trust charter.",            time: "12–24 months", capex: "Very high", control: "Full",   risk: "Integration",  dark: f

### Gaps
- const sqW = 0.22, sqGap = 0.08;
- const gap = 0.18;
- const gap = 0.12;
- const bxGap = 0.15;
- const rowGap = 0.5;
- const gap = 0.3;
- const colGap = (cardW - 0.7) / 2;
- const gap = 0.0; // meet flush

### Ouro Bruto (primeiros 5000 chars)
```
// Token Asset Custody — pptxgenjs replica
// Run: node build_deck.js   (requires: npm install pptxgenjs)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 inches
pres.title = "Digital Asset Custody & Prime Brokerage";
pres.author = "Global Markets · Digital Assets";

// ============== DESIGN TOKENS ==============
const W = 13.333;
const H = 7.5;

const C = {
  bg:        "F0ECE0", // page cream
  cardLight: "F7F3E8", // lighter cream card
  cardWarm:  "F2E5D0", // warm hot tier
  cardBeige: "E8E1CF", // warm tier
  ink:       "1A1A1A", // primary text / dark panel
  dark:      "0B0B0B", // near-black for panels
  body:      "2B2B2B",
  muted:     "8A8578", // muted brown/gray
  mutedSoft: "B5AFA0",
  rule:      "C8C0AE", // hairline
  accent:    "B8432A", // earthy orange-red
  accentBright: "C85332",
  onDark:    "EFE8D6",
  onDarkMuted: "9A9488",
};

const FONT = {
  serif: "Georgia",
  sans:  "Aptos",
  mono:  "Consolas",
};

// ------- helpers -------
function header(slide, num, leftLabel, rightLabel) {
  slide.addText(`${num}  ${leftLabel}`, {
    x: 0.55, y: 0.45, w: 6, h: 0.35,
    fontFace: FONT.sans, fontSize: 10, color: C.muted,
    charSpacing: 4, bold: false, margin: 0, valign: "middle",
  });
  slide.addText(rightLabel, {
    x: W - 6.55, y: 0.45, w: 6, h: 0.35,
    fontFace: FONT.sans, fontSize: 11, color: C.muted,
    align: "right", margin: 0, valign: "middle",
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.55, y: 0.9, w: W - 1.1, h: 0,
    line: { color: C.rule, width: 0.5 },
  });
}

function hairline(slide, x, y, w, color) {
  slide.addShape(pres.shapes.LINE, {
    x: x, y: y, w: w, h: 0,
    line: { color: color || C.rule, width: 0.5 },
  });
}

// ==========================================================
// SLIDE 1 — TITLE
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // top eyebrow
  s.addText("GLOBAL MARKETS · DIGITAL ASSETS", {
    x: 0.7, y: 0.55, w: 7, h: 0.35,
    fontFace: FONT.sans, fontSize: 11, color: C.muted,
    charSpacing: 6, margin: 0, valign: "middle",
  });
  s.addText("INSTITUTIONAL BRIEFING · 2026", {
    x: W - 7.7, y: 0.55, w: 7, h: 0.35,
    fontFace: FONT.sans, fontSize: 11, color: C.muted,
    charSpacing: 6, align: "right", margin: 0, valign: "middle",
  });

  // big headline (serif, mixed weight: italic amber for "Prime Brokerage")
  s.addText(
    [
      { text: "Digital Asset", options: { color: C.ink, breakLine: true } },
      { text: "Custody & ",   options: { color: C.ink } },
      { text: "Prime",        options: { color: C.accent, italic: true, breakLine: true } },
      { text: "Brokerage",    options: { color: C.accent, italic: true } },
    ],
    {
      x: 0.7, y: 1.1, w: W - 1.4, h: 4.5,
      fontFace: FONT.serif, fontSize: 64,
      valign: "top", margin: 0,
      paraSpaceAfter: 0, paraSpaceBefore: 0,
    }
  );

  // sub
  s.addText(
    "Mapping the institutional servicing opportunity — client demand, custody architecture, financing, and the commercial case for a hybrid build.",
    {
      x: 0.7, y: 5.75, w: 9.5, h: 0.9,
      fontFace: FONT.sans, fontSize: 14, color: C.body,
      valign: "top", margin: 0,
    }
  );

  // divider
  hairline(s, 0.7, 6.75, W - 1.4);

  // footer
  s.addText("Prepared for Institutional Clients", {
    x: 0.7, y: 6.9, w: 6, h: 0.35,
    fontFace: FONT.sans, fontSize: 11, color: C.body, margin: 0, valign: "middle",
  });
  s.addText("Confidential — Discussion Draft", {
    x: W - 6.7, y: 6.9, w: 6, h: 0.35,
    fontFace: FONT.sans, fontSize: 11, color: C.body,
    align: "right", margin: 0, valign: "middle",
  });
}

// ==========================================================
// SLIDE 2 — CONTEXT
// ==========================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  header(s, "01", "CONTEXT", "The Institutional Opening");

  // Left side: big serif headline with italic amber emphasis
  s.addText(
    [
      { text: "Digital assets have crossed from ", options: { color: C.ink } },
      { text: "alternative", options: { color: C.accent, italic: true } },
      { text: " to ", options: { color: C.ink } },
      { text: "allocatable", options: { color: C.accent, italic: true } },
      { text: ".", options: { color: C.ink } },
    ],
    {
      x: 0.7, y: 1.9, w: 6.0, h: 3.2,
      fontFace: FONT.serif, fontSize: 36,
      valign: "top", margin: 0,
    }
  );

  s.addText(
    [
      { text: "Spot ETF approvals, clearer capital treatment, and maturing market structure have moved the question from ", options: { color: C.body } },
      { text: "whether", options: { color: C.body, italic: true } },
      { text: " to hold crypto to ", options: { color: C.body } },
      { text: "how", options: { color: C.body, italic: true } },
      { text: " to service it.", options: { color: C.body } },
    ],
  
```