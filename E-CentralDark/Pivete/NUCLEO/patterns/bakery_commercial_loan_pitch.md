# PADRAO - bakery_commercial_loan_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\bakery_commercial_loan_pitch.js
**SHA:** 6992ce0e2aef472a
**Timestamp:** 2026-08-28T02:52:32.345566
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const fGap = 1.02;

### Ouro Bruto (primeiros 5000 chars)
```
// Comfort Bakery — Storefront Concept Pitch
// Replica of Plan_2.pptx built with pptxgenjs
//
// Usage:
//   npm install pptxgenjs
//   node build.js
//
// Output: Plan_2.pptx in the current directory.

const pptxgen = require("pptxgenjs");

// -----------------------------------------------------------------------------
// Design tokens (extracted from the original deck)
// -----------------------------------------------------------------------------
const C = {
  bgCream:    "F6F1E8", // main slide background
  bgWarm:     "EEE6D6", // slide 6 background / image placeholder tone
  divider:    "D9CEB8", // subtle tan divider
  muted:      "8A8176", // olive-gray for labels/sources
  medium:     "333331", // secondary dark
  dark:       "1A1A1A", // primary dark text
  black:      "000000",

  // Dark slide (#10) palette
  darkBg:     "1A1A1A",
  darkAlt:    "333333",
  darkMuted:  "888888",
  darkAccent: "C9A783", // warm tan accent
  darkCream:  "D8CFBF", // cream text on dark
  darkCream2: "F6F1E8",
};

const FONT = "Arial";

// Slide size: 20" x 11.25" (matches the original 18288000 × 10287000 EMU)
const SLIDE_W = 20;
const SLIDE_H = 11.25;

// Shared layout landmarks
const MARGIN_L = 1.04;
const MARGIN_R = 1.04;
const CONTENT_W = SLIDE_W - MARGIN_L - MARGIN_R; // 17.92"
const HEADER_Y  = 0.83;   // top header text baseline
const HEADER_DIV_Y = 1.30;  // top divider line
const FOOTER_DIV_Y = 9.92;  // bottom divider line
const FOOTER_Y  = 10.13;  // footer text

// -----------------------------------------------------------------------------
// Build the deck
// -----------------------------------------------------------------------------
const pres = new pptxgen();
pres.defineLayout({ name: "COMFORT", width: SLIDE_W, height: SLIDE_H });
pres.layout = "COMFORT";
pres.title  = "Comfort Bakery — Storefront Concept Pitch";
pres.author = "Comfort Bakery";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

// Horizontal divider line drawn as a thin rectangle (renders crisply at any zoom)
function hDivider(slide, x, y, w, color = C.divider) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.01,
    fill: { color }, line: { type: "none" },
  });
}

// Vertical divider
function vDivider(slide, x, y, h, color = C.divider) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.01, h,
    fill: { color }, line: { type: "none" },
  });
}

// Common header bar used on slides 2-9 (and a variant on 1 & 10)
function addHeader(slide, sectionLabel, pageLabel, opts = {}) {
  const textColor   = opts.textColor   || C.muted;
  const divColor    = opts.divColor    || C.divider;

  slide.addText(sectionLabel, {
    x: MARGIN_L, y: HEADER_Y, w: 10, h: 0.33,
    fontFace: FONT, fontSize: 18, color: textColor,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  slide.addText(pageLabel, {
    x: SLIDE_W - MARGIN_R - 2.5, y: HEADER_Y, w: 2.5, h: 0.33,
    fontFace: FONT, fontSize: 18, color: textColor,
    charSpacing: 4, margin: 0, align: "right", valign: "middle",
  });
  hDivider(slide, MARGIN_L, HEADER_DIV_Y, CONTENT_W, divColor);
}

function addFooter(slide, leftLabel, rightLabel, opts = {}) {
  const textColor = opts.textColor || C.muted;
  const divColor  = opts.divColor  || C.divider;
  const rightW    = opts.rightW    || 10;

  hDivider(slide, MARGIN_L, FOOTER_DIV_Y, CONTENT_W, divColor);
  slide.addText(leftLabel, {
    x: MARGIN_L, y: FOOTER_Y, w: 10, h: 0.33,
    fontFace: FONT, fontSize: 18, color: textColor,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  slide.addText(rightLabel, {
    x: SLIDE_W - MARGIN_R - rightW, y: FOOTER_Y, w: rightW, h: 0.33,
    fontFace: FONT, fontSize: 18, color: textColor,
    charSpacing: 4, margin: 0, align: "right", valign: "middle",
  });
}

// A rectangular image placeholder (warm cream tone) with a small caption chip
function imagePlaceholder(slide, x, y, w, h, caption, opts = {}) {
  const bg      = opts.bg      || C.bgWarm;
  const border  = opts.border  || C.divider;
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: bg },
    line: { color: border, width: 0.75 },
  });
  if (caption) {
    // Caption chip bottom-left of the placeholder
    const capW = Math.min(w - 0.4, 5.05);
    const capH = 0.51;
    const capX = x + 0.25;
    const capY = y + h - capH - 0.25;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: capX, y: capY, w: capW, h: capH,
      fill: { color: C.bgCream },
      line: { color: border, width: 0.5 },
    });
    slide.addText(caption, {
      x: capX, y: capY, w: capW, h: capH,
      fontFace: FONT, fontSize: 18, color: C.dark,
      align: "center", valign: "middle", margin: 0,
    });
  }
}

// =============================================================================
// SLIDE 1 — Title / Cover
// =============================================================================

```