# OUTRO - finance_cockroach_portfolio_strategy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_cockroach_portfolio_strategy.js
**SHA:** 1083bf9268048ea8
**Timestamp:** 2026-08-28T02:52:34.217609
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const topY = 1.7, rowGap = 1.15;
- const startY = 1.75, gap = 0.77;
- const topY = 1.75, rowH = 0.9, rowGap = 1.1;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * generate_deck.js
 *
 * Recreates "The Cockroach Portfolio" slide deck (12 slides, 16x9, dark theme)
 * using pptxgenjs. Coordinates, colors, fonts, and font sizes are extracted
 * from the original pptx's XML so this regenerates the deck byte-for-visual.
 *
 * Slide 6's waterfall chart is an embedded image in the original pptx.
 * This script references ./assets/image1.png for that slide. If the file is
 * missing, slide 6 renders without the chart (the right-hand callout card
 * is native and unaffected).
 *
 * Usage:
 *   npm install pptxgenjs
 *   node generate_deck.js
 *
 * Output: ./output/TheCockroachPortfolio.pptx
 */

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// -------------------------------------------------------------------------
// DESIGN TOKENS
// -------------------------------------------------------------------------
const C = {
  bg:         "000000",  // slide background
  card:       "111111",  // card / body-row background
  cardHead:   "1A1A1A",  // table-header / label-row background
  divider:    "333333",  // thin divider lines
  accent:     "4466FF",  // primary blue
  white:      "FFFFFF",
  textMute:   "999999",  // body gray
  textMute2:  "BBBBBB",  // slightly lighter gray (limitations slide)
  textFoot:   "666666",  // footer gray
  cellStrong: "7AC89A",  // matrix "Strong" cell fill
  cellStrongText: "0E2A3F",
  cellWeak:   "B5443D",  // matrix "Weak" cell fill
  cellMixed:  "111111",  // matrix "Mixed" cell fill
  sp500Bar:   "C8A96B",  // S&P 500 gold/tan series color
};

const F = {
  serif: "Source Serif Pro",
  sans:  "Source Sans Pro",
};

// -------------------------------------------------------------------------
// BOOTSTRAP
// -------------------------------------------------------------------------
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "Dylan Grice Framework";
pres.title  = "The Cockroach Portfolio";

// Reusable outer shadow (pptxgenjs mutates option objects — use a factory).
const makeShadow = () => ({
  type: "outer", color: "000000", blur: 8, offset: 3, angle: 135, opacity: 0.4,
});

// Footer that appears on slides 2..11 (and in modified form on 1 and 12).
function addStandardFooter(slide, pageNum) {
  slide.addText("CONFIDENTIAL", {
    x: 0.8, y: 5.25, w: 2.0, h: 0.25, margin: 0,
    fontFace: F.sans, fontSize: 9, color: C.textFoot,
    align: "left", valign: "middle",
  });
  slide.addText(`${pageNum} / 12`, {
    x: 9.0, y: 5.25, w: 0.7, h: 0.25, margin: 0,
    fontFace: F.sans, fontSize: 9, color: C.textFoot,
    align: "right", valign: "middle",
  });
}

// Eyebrow (e.g. "EXECUTIVE SUMMARY")
function addEyebrow(slide, text) {
  slide.addText(text, {
    x: 0.8, y: 0.45, w: 5.0, h: 0.3, margin: 0,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.accent,
    charSpacing: 3, align: "left", valign: "middle",
  });
}

// Slide headline (26pt Serif)
function addHeadline(slide, text) {
  slide.addText(text, {
    x: 0.8, y: 0.85, w: 8.4, h: 0.7, margin: 0,
    fontFace: F.serif, fontSize: 26, bold: true, color: C.white,
    align: "left", valign: "middle",
  });
}

// =========================================================================
// SLIDE 1 — COVER
// =========================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // Top thin blue bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.05, fill: { color: C.accent }, line: { color: C.accent },
  });

  // Bottom dark bar (subtle footer strip)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.3, w: 10, h: 0.325, fill: { color: C.card }, line: { color: C.card },
  });

  // Eyebrow
  s.addText("PORTFOLIO MANAGEMENT STRATEGY", {
    x: 0.8, y: 1.4, w: 5.544, h: 0.3, margin: 0,
    fontFace: F.sans, fontSize: 11, bold: true, color: C.accent,
    charSpacing: 3, align: "left", valign: "middle",
  });

  // Main title (50pt)
  s.addText([
    { text: "The Cockroach", options: { breakLine: true } },
    { text: "Portfolio" },
  ], {
    x: 0.8, y: 1.9, w: 8.0, h: 2.2, margin: 0,
    fontFace: F.serif, fontSize: 50, bold: true, color: C.white,
    align: "left", valign: "middle",
  });

  // Subtitle
  s.addText([
    { text: "A resilient, all-weather strategy for capital preservation", options: { breakLine: true } },
    { text: "and steady compounding across every economic regime." },
  ], {
    x: 0.8, y: 4.0, w: 6.0, h: 0.7, margin: 0,
    fontFace: F.sans, fontSize: 14, color: C.textMute,
    align: "left", valign: "middle", lineSpacingMultiple: 1.5,
  });

  // Footer tag line
  s.addText("DYLAN GRICE'S ORIGINAL FRAMEWORK  //  CONFIDENTIAL  //  2026", {
    x: 0.8, y: 5.32, w: 8.0, h: 0.28, margin: 0,
    fontFace: F.sans, fontSize: 9, color: C.textFoot,
    charSpacing: 3, align: "left", valign: "middle",
  });
}

// =========================================================================
// 
```