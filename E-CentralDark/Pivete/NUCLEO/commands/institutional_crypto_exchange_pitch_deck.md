# COMANDO - institutional_crypto_exchange_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\institutional_crypto_exchange_pitch_deck.js
**SHA:** ff43051844b6fd14
**Timestamp:** 2026-08-28T02:52:35.260082
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap  = 0.25;
- const gap = 0.2;
- const cgap = (candleAreaW - nC * cw) / (nC - 1);
- const sx = 0.6, gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * ApeX Series B Investor Deck — replica generator
 *
 * Recreates the 12-slide ApeX-_2.pptx using pptxgenjs.
 * Body and chrome fonts use Arial (a single OOXML typeface — CSS-style
 * fallback chains like "Arial, Helvetica, sans-serif" trigger PowerPoint's
 * Repair prompt because that attribute must hold a single family name).
 * Figures (small caps labels, ticker data, citations, page numbers) use Consolas.
 * Both ship with PowerPoint, so the export renders without font substitution.
 *
 * Usage:
 *   npm install pptxgenjs   # (or: npm install -g pptxgenjs)
 *   node recreate-apex.js
 *
 * Output: ApeX-_2.pptx in the working directory.
 */

const pptxgen = require("pptxgenjs");

// ---------- Theme ----------
const FONT_SANS = "Arial";
const FONT_MONO = "Consolas";

const COLOR = {
  bg:        "0B1220",  // deep navy slide background
  bgPanel:   "111A2E",  // slightly lighter card / panel
  bgPanel2:  "0F1A30",  // alt card
  border:    "1E2A44",  // panel border
  borderSoft:"1A2540",
  white:     "FFFFFF",
  text:      "E5ECF6",  // primary body
  textMute:  "8FA0BD",  // muted body
  textDim:   "5C6E8E",  // dimmer (small caps mono)
  textDimmer:"3F4F6E",
  blue:      "4F8CFF",  // primary accent (ApeX blue)
  blueSoft:  "6C9CFF",
  blueDeep:  "1F3A78",
  blueMid:   "2E4F8F",
  green:     "22C55E",
  greenDim:  "13703A",
  red:       "EF4444",
  redDim:    "5A1E20",
  amber:     "F2B650",
  pillGreenBg: "0F3A24",
  pillGreenTx: "4ADE80",
  pillRedBg:   "3A1518",
  pillRedTx:   "F87171",
  pillAmberBg: "3A2A12",
  pillAmberTx: "F2B650",
};

// ---------- Presentation ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5 inches
const SW = 13.3;
const SH = 7.5;
pres.title = "ApeX — Series B Investor Presentation";
pres.author = "ApeX Markets Ltd.";

// ---------- Helpers ----------
function bg(slide) {
  slide.background = { color: COLOR.bg };
}

function footerChrome(slide, pageNum, totalPages = 12) {
  // Logo diamond
  slide.addShape(pres.shapes.DIAMOND, {
    x: 0.55, y: 7.05, w: 0.22, h: 0.22,
    fill: { type: "none" },
    line: { color: COLOR.textDim, width: 1 },
  });
  // APEX wordmark
  slide.addText("APEX", {
    x: 0.85, y: 6.97, w: 1.2, h: 0.36,
    fontFace: FONT_MONO, fontSize: 9, color: COLOR.textDim,
    charSpacing: 4, valign: "middle", margin: 0,
  });
  // Page number
  slide.addText(
    `${String(pageNum).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`,
    {
      x: SW - 1.6, y: 6.97, w: 1.1, h: 0.36,
      fontFace: FONT_MONO, fontSize: 9, color: COLOR.textDim,
      charSpacing: 3, align: "right", valign: "middle", margin: 0,
    }
  );
}

function eyebrow(slide, text, x = 0.6, y = 0.55, w = 6, color = COLOR.blue) {
  slide.addText(text, {
    x, y, w, h: 0.32,
    fontFace: FONT_MONO, fontSize: 10, color,
    charSpacing: 4, valign: "middle", margin: 0,
  });
}

function bigTitle(slide, text, x = 0.6, y = 0.95, w = 11.5, h = 1.3) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT_SANS, fontSize: 32, bold: true, color: COLOR.white,
    valign: "top", margin: 0,
  });
}

function sectionLabel(slide, text, x, y, w, color = COLOR.textDim) {
  slide.addText(text, {
    x, y, w, h: 0.3,
    fontFace: FONT_MONO, fontSize: 9, color,
    charSpacing: 3, valign: "middle", margin: 0,
  });
}

function hLine(slide, x, y, w, color = COLOR.border, width = 0.75) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width },
  });
}

// Draws a line segment from (x1,y1) to (x2,y2) using only NON-NEGATIVE width/height
// (negative cy in OOXML is invalid and triggers PowerPoint's Repair prompt).
// When the segment goes "up" (y2 < y1), we anchor at the lower y and flipV so the
// rendered direction is preserved.
function segLine(slide, x1, y1, x2, y2, lineOpts) {
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  // The default LINE shape goes from top-left -> bottom-right of its bounding box.
  // If exactly one of the two axes is reversed (going up-right OR down-left),
  // we need flipV so the visible diagonal connects the correct corners.
  const needsFlipV = (x2 >= x1 && y2 < y1) || (x2 < x1 && y2 >= y1);
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h,
    flipV: needsFlipV,
    line: lineOpts,
  });
}

// ============================================================
// SLIDE 1 — TITLE
// ============================================================
function slide1() {
  const s = pres.addSlide();
  bg(s);

  // Top chrome
  s.addText("APEX // CONFIDENTIAL", {
    x: 0.6, y: 0.45, w: 4, h: 0.32,
    fontFace: FONT_MONO, fontSize: 10, color: COLOR.textDim,
    charSpacing: 4, valign: "middle", margin: 0,
  });
  s.addText("SERIES B \u00B7 Q2 2026", {
    x: SW - 4.6, y: 0.45, w: 4, h: 0.32,
    fontFace: FONT_MONO, fontSize: 10, color: COLOR.textDim,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });

  // Eyebrow
  s
```