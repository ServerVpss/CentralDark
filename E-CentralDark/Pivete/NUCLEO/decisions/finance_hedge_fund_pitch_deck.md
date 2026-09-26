# DECISAO - finance_hedge_fund_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_hedge_fund_pitch_deck.js
**SHA:** 0a50ffa3b51050d9
**Timestamp:** 2026-08-28T02:52:33.846666
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node bridgewater.js  (requires `npm install -g pptxgenjs` or local install)

### Ouro Bruto (primeiros 5000 chars)
```
// Bridgewater_edited.pptx generator (pptxgenjs)
// Recreates the 13-slide deck exactly: dark navy theme, gold accent, Georgia headings, Calibri body.
//
// Run: node bridgewater.js  (requires `npm install -g pptxgenjs` or local install)

const pptxgen = require("pptxgenjs");

// ---------- palette / typography constants ----------
const BG        = "040406";  // page background
const CARD      = "0C1526";  // primary card fill
const CARD2     = "111D33";  // secondary card (slide 7 AIA Labs, slide 10 peer AUM)
const STRIPE    = "040406";  // alternating row fill (matches bg)
const GOLD      = "C49B2A";  // primary gold
const GOLD2     = "DEBC5E";  // lighter gold (AIA Labs accent)
const WHITE     = "F0F0F2";  // primary text
const MUTED     = "636B7E";  // muted body text
const FOOTER    = "6A7082";  // footer text
const RULE      = "2E3340";  // divider line on slide 10
const TEAL      = "3A8DA3";  // S&P 500 bar (slide 8)
const DONUT_A   = "C49B2A";  // donut slice 1 - Bonds
const DONUT_B   = "3A5A7A";  // donut slice 2 - Equities
const DONUT_C   = "636B7E";  // donut slice 3 - Cash
const DONUT_D   = "F9F9F9";  // donut slice 4 outline (Other is near-white)

const F_HEAD    = "Georgia";
const F_BODY    = "Calibri";

// Default opts for every text box: zero internal padding (matches source lIns=tIns=rIns=bIns=0).
const TB = { margin: 0 };

// ---------- setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author  = "Bridgewater Associates";
pres.title   = "Bridgewater Associates - Hedge Fund Products";

// ---------- helpers ----------
// Header (small gold eyebrow + big white title + footer + page number) shared by slides 2-12
function addHeader(slide, eyebrow, title, pageNum) {
  slide.addText(eyebrow, {
    ...TB, x: 0.6, y: 0.35, w: 5.0, h: 0.2,
    fontSize: 8, charSpacing: 3, color: GOLD, fontFace: F_BODY, valign: "middle",
  });
  slide.addText(title, {
    ...TB, x: 0.6, y: 0.6, w: 8.8, h: 0.45,
    fontSize: 25, bold: true, color: WHITE, fontFace: F_HEAD, valign: "middle",
  });
  slide.addText("BRIDGEWATER ASSOCIATES", {
    ...TB, x: 0.6, y: 5.35, w: 4.0, h: 0.2,
    fontSize: 6.5, charSpacing: 2, color: FOOTER, fontFace: F_BODY, valign: "middle",
  });
  slide.addText(`${pageNum} / 13`, {
    ...TB, x: 8.5, y: 5.35, w: 0.9, h: 0.2,
    fontSize: 6.5, color: FOOTER, fontFace: F_BODY, align: "right", valign: "middle",
  });
}

function rect(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h, fill: { color }, line: { color, width: 0 },
  });
}
function oval(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w, h, fill: { color }, line: { color, width: 0 },
  });
}

// ----------------------------------------------------------
// SLIDE 1 — Title
// ----------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: BG };

  s.addText("Bridgewater", {
    ...TB, x: 0.6, y: 1.4, w: 9.0, h: 1.5,
    fontSize: 72, bold: true, color: WHITE, fontFace: F_HEAD, valign: "middle",
  });
  s.addText("Associates, LP", {
    ...TB, x: 0.6, y: 2.8, w: 9.0, h: 1.15,
    fontSize: 44, color: GOLD, fontFace: F_HEAD, valign: "middle",
  });
  s.addText("Hedge Fund Products", {
    ...TB, x: 0.6, y: 4.1, w: 7.0, h: 0.6,
    fontSize: 26, color: MUTED, fontFace: F_BODY, valign: "middle",
  });
  s.addText("APRIL 2026  |  CONFIDENTIAL", {
    ...TB, x: 0.6, y: 5.2, w: 4.0, h: 0.2,
    fontSize: 9, color: FOOTER, fontFace: F_BODY, valign: "middle",
  });
}

// ----------------------------------------------------------
// SLIDE 2 — Executive Summary (3 cards: Platform / Market / Edge)
// ----------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: BG };
  addHeader(s, "EXECUTIVE SUMMARY", "Record 2025 across a $92B platform", "02");

  // 3 cards with top-gold-accent bar
  const cards = [
    { x: 0.475, title: "THE PLATFORM", body: [
      "Six strategies on platform.",
      "Pure Alpha +34% in 2025.",
      "All Weather delivered +20%.",
      "ALLW ETF crossed $1B.",
    ]},
    { x: 3.575, title: "THE MARKET", body: [
      "Global HF AUM passed $5T.",
      "Double-digit returns streak.",
      "64% raising HF exposure.",
      "Two-decade inflow high.",
    ]},
    { x: 6.675, title: "THE EDGE", body: [
      "Systematic macro process.",
      "AUM capped for returns.",
      "60%+ employee owned.",
      "AIA Labs raised $5B.",
    ]},
  ];
  cards.forEach(c => {
    rect(s, c.x, 1.8071, 2.85, 2.4429, CARD);
    rect(s, c.x, 1.8071, 2.85, 0.025, GOLD); // top gold bar
    s.addText(c.title, {
      ...TB, x: c.x + 0.2, y: 2.0571, w: 2.45, h: 0.3,
      fontSize: 20, bold: true, charSpacing: 2, color: GOLD, fontFace: F_BODY, valign: "middle",
    });
    s.addText(
      c.body.map((t, i) => ({ text: t, options: { breakLine: i < c.body.length - 1 } })),
      {
        ...TB, x: c.x + 0.2, y: 2.5571, w: 2.45, h: 2
```