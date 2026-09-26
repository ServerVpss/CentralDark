# OUTRO - real_estate_fund_investment_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\real_estate_fund_investment_briefing.js
**SHA:** 3c76288a35cf0b12
**Timestamp:** 2026-08-28T02:52:36.467367
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap  = 0.4;
- const barGap = 0.7;

### Ouro Bruto (primeiros 5000 chars)
```
// Hoboken Real Estate Projection - Mile Square Partners Fund IV LP Briefing
// Faithful recreation using pptxgenjs
//
// Usage:  node generate.js
// Outputs: Hoboken_Real_Este_Projection.pptx
//
// Requires the ./assets directory with the three embedded chart PNGs:
//   assets/image-5-1.png  (dotted cumulative-units overlay for slide 5)
//   assets/image-6-1.png  (slide 6 line chart)
//   assets/image-9-1.png  (slide 9 scenario-fan chart)
// These are extracted verbatim from the original deck.

const pptxgen = require("pptxgenjs");
const path    = require("path");

// --- Palette (pulled directly from the source slides) -----------------------
const C = {
  bg:       "F6F3EE", // warm cream background
  bgAlt:    "EDE8DF", // slightly darker cream (shaded cards)
  rule:     "D9D2C4", // hairline / divider tan
  ink:      "1C1A17", // near-black primary text
  body:     "4A453E", // warm dark grey body text
  mute:     "8A8378", // muted tan for eyebrows, captions, metadata
  dark:     "000000", // pure black (used sparingly)
  coral:    "C9572C", // orange/coral accent (from embedded chart art)
  coralTint:"F5E4D8", // tint used inside the scenario-fan band
};

const FONT_HEADING = "Helvetica Neue";
const FONT_BODY    = "Helvetica Neue";
const FONT_SERIF   = "Georgia"; // used for italic accents in giant titles

// --- Presentation setup -----------------------------------------------------
const pres = new pptxgen();
pres.author  = "Mile Square Partners";
pres.company = "Mile Square Partners";
pres.title   = "Hoboken Real Estate Projection - Fund IV LP Briefing";

// Custom slide size: 20" x 11.25" (matches original)
pres.defineLayout({ name: "MSP_CUSTOM", width: 20, height: 11.25 });
pres.layout = "MSP_CUSTOM";

const W = 20;    // slide width
const H = 11.25; // slide height

// --- Helpers ----------------------------------------------------------------
function bg(slide) {
  slide.background = { color: C.bg };
}

// Top header rule used on slides 2-9: small eyebrow left, meta right, thin rule
function addHeader(slide, leftEyebrow, rightEyebrow) {
  slide.addText(leftEyebrow, {
    x: 1.05, y: 0.78, w: 10, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: C.body,
    charSpacing: 6, bold: false, margin: 0,
  });
  slide.addText(rightEyebrow, {
    x: 9, y: 0.78, w: 9.95, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: C.body,
    charSpacing: 6, align: "right", margin: 0,
  });
  // Hairline rule under header
  slide.addShape(pres.shapes.LINE, {
    x: 1.05, y: 1.25, w: W - 2.1, h: 0,
    line: { color: C.rule, width: 0.5 },
  });
}

// Source/footer caption (slides 3,4,5,6,9,10)
function addFootnote(slide, text, y = 10.7) {
  slide.addText(text, {
    x: 1.05, y: y, w: W - 2.1, h: 0.3,
    fontFace: FONT_BODY, fontSize: 9, color: C.mute, margin: 0,
  });
}

// ============================================================================
// SLIDE 1 — Cover
// ============================================================================
{
  const s = pres.addSlide();
  bg(s);

  // Top-left: "Mile Square Partners" + tagline
  s.addText("Mile Square Partners", {
    x: 1.05, y: 1.1, w: 12, h: 0.55,
    fontFace: FONT_HEADING, fontSize: 20, bold: true, color: C.ink, margin: 0,
  });
  s.addText("REAL ESTATE CAPITAL \u00B7 EST. 2019", {
    x: 1.05, y: 1.6, w: 12, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10, color: C.mute, charSpacing: 6, margin: 0,
  });

  // Top-right: FUND IV LP BRIEFING
  s.addText("FUND IV LP", {
    x: 14, y: 1.1, w: 4.95, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: C.body, charSpacing: 6,
    align: "right", margin: 0,
  });
  s.addText("BRIEFING", {
    x: 14, y: 1.48, w: 4.95, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: C.body, charSpacing: 6,
    align: "right", margin: 0,
  });

  // Category line
  s.addText("HOBOKEN, NJ \u00B7 CONDO MARKET", {
    x: 1.05, y: 2.05, w: 12, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: C.body, charSpacing: 6, margin: 0,
  });

  // Giant headline (mixed weight: bold + italic serif for emphasis)
  s.addText([
    { text: "Five Years ", options: { bold: true, fontFace: FONT_HEADING, color: C.ink } },
    { text: "in a Mile ",  options: { italic: true, bold: true, fontFace: FONT_SERIF, color: C.ink } },
    { text: "Square.",     options: { italic: true, bold: true, fontFace: FONT_SERIF, color: C.ink } },
  ], {
    x: 0.95, y: 2.6, w: W - 1.6, h: 3.6,
    fontSize: 120, valign: "top", margin: 0,
  });

  // Subhead paragraph
  s.addText(
    "A 2026\u20132031 investment projection for Hoboken's for-sale condominium market \u2014 " +
    "where fundamentals, supply, and rates pull in three different directions.",
    {
      x: 1.05, y: 8.15, w: 8.5, h: 1.2,
      fontFace: FONT_BODY, fontSize: 15, color: C.body, lineSpacingMultiple: 1.25, margin: 0,
    }
  );

  // Four-column metadata strip
  const metaY = 9.9;
  const cols = [
    { label: "PREPARED",    value: "April 2026",            x: 1.05,  w: 3
```