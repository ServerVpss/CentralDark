# REFERENCIA - real_estate_development_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\real_estate_development_pitch.js
**SHA:** ec979874e6cb2d7c
**Timestamp:** 2026-08-28T02:52:36.266475
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const colStart = fx + (fw - colsTotal) / 2;
- const pStart = (W - (pW*2 + pGap)) / 2;
- const cStart = (W - (cW * 4 + cGap * 3)) / 2;
- const gridStart = (W - (cW * 4 + cGapX * 3)) / 2;

### Gaps
- const gap   = 0.25;
- const pGap = 0.05;
- const colW = 0.75, colGap = 0.2;
- const pGap = 0.2;
- const gW = 1.95, gH = 2.0, gGap = 0.1;
- const cGap = 0.13;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Canyon Terra Pitch Deck
 * Recreated using pptxgenjs
 *
 * Usage:
 *   npm install pptxgenjs
 *   node canyon-terra-pitch-deck.js
 */

const pptxgen = require("pptxgenjs");

// ============================================================
// PALETTE (extracted from the source deck)
// ============================================================
const C = {
  ink:       "1F1A14", // near-black / dark umber (dark bg, primary text)
  inkSoft:   "3D352A", // deep brown (secondary text, borders on dark)
  cream:     "F4EEE4", // primary light background
  sand:      "EBE3D4", // secondary light background
  dune:      "D6CCBC", // warm sand (alt panels)
  taupe:     "A89680", // muted brown-gray (labels, dividers, rule lines)
  terracotta:"C8653E", // accent orange (italic highlights, accents)
  sunset:    "DB8A5E", // softer terracotta variant
  apricot:   "F4D9B4", // pale apricot (slide 7 "THE YEAR" card)
  sage:      "8A9B7F", // sage green (figures, accents)
  forest:    "5E6E55", // deep forest green (slide 7 bg)
  slate:     "3E5F6B", // blue-slate (slide 6 accent)
  khaki:     "7A6850", // warm khaki (slide 3 accent)
};

// Typography
const FONT_HEAD = "Georgia";
const FONT_BODY = "Calibri";
const FONT_MONO = "Consolas";

// ============================================================
// SETUP
// ============================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "Canyon Terra";
pres.title  = "Canyon Terra — Partner Review";

const W = 10;
const H = 5.625;

// ============================================================
// HELPERS
// ============================================================

// Eyebrow (top-left brand) + top-right section label
function addHeaderBar(slide, sectionLabel, onDark = false) {
  const brandColor = onDark ? C.cream : C.ink;
  const labelColor = onDark ? C.taupe : C.taupe;
  slide.addText("Canyon Terra", {
    x: 0.5, y: 0.33, w: 3, h: 0.3,
    fontFace: FONT_HEAD, fontSize: 11, italic: true, color: brandColor,
    margin: 0,
  });
  slide.addText(sectionLabel, {
    x: W - 4.5, y: 0.33, w: 4, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color: labelColor,
    align: "right", charSpacing: 3, margin: 0,
  });
}

// Thin horizontal rule
function addRule(slide, x, y, w, color = C.taupe, width = 0.75) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width, transparency: 40 },
  });
}

// Small-caps style label (fake small caps via upper case + spacing)
function smallCaps(text) { return String(text).toUpperCase(); }

// ============================================================
// SLIDE 1 — TITLE / WHAT'S NEXT (dark)
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };

  addHeaderBar(s, "WHAT'S NEXT · 09 / 09", true);

  // Eyebrow block (left)
  s.addText("PARTNER REVIEW · 2026", {
    x: 0.5, y: 1.15, w: 4.5, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9.5, color: C.taupe,
    charSpacing: 3, margin: 0,
  });

  // Main headline
  s.addText([
    { text: "Let's build a ",  options: { color: C.cream } },
    { text: "building ",       options: { color: C.cream, breakLine: true } },
    { text: "worth ",          options: { color: C.cream } },
    { text: "moving ",         options: { color: C.terracotta, italic: true } },
    { text: "for.",            options: { color: C.terracotta, italic: true } },
  ], {
    x: 0.5, y: 1.55, w: 4.8, h: 2.3,
    fontFace: FONT_HEAD, fontSize: 34, bold: false,
    margin: 0, lineSpacingMultiple: 1.05,
  });

  // Body paragraph
  s.addText(
    "We're raising the first partner round to complete site control, concept architecture, and operator selection. Financial model follows in Volume 02.",
    {
      x: 0.5, y: 4.0, w: 4.5, h: 1.0,
      fontFace: FONT_BODY, fontSize: 11, color: C.dune,
      paraSpaceAfter: 4, margin: 0,
    }
  );

  // Right column — roadmap list
  const rx = 5.6;          // left edge of right col
  const qCol = rx;         // quarter label column
  const tCol = rx + 1.05;  // description column
  const rowY = [1.55, 2.25, 2.95, 3.65];
  const quarters  = ["Q3", "Q4", "Q1 '27", "Q2 '27"];
  const items = [
    "Site control · Old Town parcel",
    "Concept architecture · interior partners",
    "Operator selection · brand build",
    "Capital stack · Volume 02 financials",
  ];

  // divider above the list
  addRule(s, rx, 1.4, 3.9, C.inkSoft, 1);

  quarters.forEach((q, i) => {
    s.addText(q, {
      x: qCol, y: rowY[i], w: 0.9, h: 0.35,
      fontFace: FONT_HEAD, fontSize: 15, italic: true, color: C.sunset,
      margin: 0, valign: "top",
    });
    s.addText(items[i], {
      x: tCol, y: rowY[i] + 0.04, w: 2.9, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11.5, color: C.cream,
      margin: 0, valign: "top",
    });
    // row divider
    addRule(s, rx, rowY[i] + 0.55, 3.9, C.inkSoft, 0.75);
  });

  // Footer
  addRule(s, 
```