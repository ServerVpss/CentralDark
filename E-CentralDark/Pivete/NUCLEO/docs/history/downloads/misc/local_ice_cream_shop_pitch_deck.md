# OUTRO - local_ice_cream_shop_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\local_ice_cream_shop_pitch_deck.js
**SHA:** 5e5cde5547f1ca4c
**Timestamp:** 2026-08-28T02:52:35.616982
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.15;
- const cardGap = 0.22;

### Ouro Bruto (primeiros 5000 chars)
```
// Maple & Main Ice Cream – recreation using pptxgenjs
// Palette (from original PPTX):
//   Cream bg:     F3EAD8
//   Dark brown:   2A1B10
//   Sec. brown:   4A3422
//   Terracotta:   B85528
//   Amber:        C78A2C  (used on dark slides)
//   Card cream:   EBDFC6
//
// All coords are inches. Slide = 13.333" × 7.5" (LAYOUT_WIDE).

const pptxgen = require("pptxgenjs");

// ---- Colors ----
const CREAM   = "F3EAD8";
const DARK    = "2A1B10";
const DARK2   = "4A3422";
const TERRA   = "B85528";
const AMBER   = "C78A2C";
const CARD    = "EBDFC6";

// ---- Layout constants ----
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const MARGIN_L = 0.6;
const MARGIN_R = 0.6;
const HEADER_Y = 0.45;
const FOOTER_Y = 7.08;

const FONT_BODY = "Arial";

// ---- Helpers ----------------------------------------------------------------

// Draw the heart-with-two-scoops logo as a group of shapes.
// Anchor (x,y) is the top-left of the bounding box of size (w,h).
// The logo is two circles sitting above an inverted-V (the cone), drawn with
// stroked outlines only — matches the wireframe look in the original.
function drawLogo(slide, pres, x, y, w, h, color, strokeW) {
  // Scoop (circle) radius: each circle ~ 40% of width, overlapping slightly.
  const r = w * 0.28;              // circle radius
  const cy1 = y + r;                // circle vertical center
  const cx1 = x + r;                // left circle center x
  const cx2 = x + w - r;            // right circle center x

  // Left scoop
  slide.addShape(pres.shapes.OVAL, {
    x: cx1 - r, y: cy1 - r, w: r * 2, h: r * 2,
    fill: { type: "none" },
    line: { color, width: strokeW },
  });
  // Right scoop
  slide.addShape(pres.shapes.OVAL, {
    x: cx2 - r, y: cy1 - r, w: r * 2, h: r * 2,
    fill: { type: "none" },
    line: { color, width: strokeW },
  });

  // The cone: an inverted V that starts at the outer edges of the two
  // scoops (at cy1 level) and converges at a point near the bottom-center.
  const tipX = x + w / 2;
  const tipY = y + h;
  const leftAnchorX  = x;
  const rightAnchorX = x + w;
  const anchorY      = cy1;

  // Left cone stroke
  slide.addShape(pres.shapes.LINE, {
    x: leftAnchorX, y: anchorY,
    w: tipX - leftAnchorX, h: tipY - anchorY,
    line: { color, width: strokeW },
    flipV: false,
  });
  // Right cone stroke
  slide.addShape(pres.shapes.LINE, {
    x: tipX, y: anchorY,
    w: rightAnchorX - tipX, h: tipY - anchorY,
    line: { color, width: strokeW },
    flipV: true,
  });
}

// Small version of the logo for the header (stroke-only heart silhouette).
// Matches the tiny mark preceding the "MAPLE & MAIN · ICE CREAM" wordmark.
function drawSmallLogo(slide, pres, x, y, size, color) {
  drawLogo(slide, pres, x, y, size, size, color, 1.25);
}

// Standard header: small logo + brand mark (left) and coordinates (right).
function addHeader(slide, pres, { onDark = false } = {}) {
  const fg = onDark ? CREAM : DARK;
  const logoSize = 0.28;
  drawSmallLogo(slide, pres, MARGIN_L, HEADER_Y - 0.02, logoSize, fg);

  slide.addText("MAPLE & MAIN  ·  ICE CREAM", {
    x: MARGIN_L + logoSize + 0.18, y: HEADER_Y - 0.05, w: 5, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10, bold: true,
    color: fg, charSpacing: 4, margin: 0, valign: "middle",
  });

  slide.addText("00.0000° N  ·  00.0000° W", {
    x: SLIDE_W - MARGIN_R - 4, y: HEADER_Y - 0.05, w: 4, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10, bold: true,
    color: fg, charSpacing: 4, margin: 0, valign: "middle", align: "right",
  });
}

// Standard footer: city label (left) and page N / total (right).
function addFooter(slide, page, total, { onDark = false } = {}) {
  const fg = onDark ? CREAM : DARK;
  slide.addText("ANN ARBOR, MICHIGAN", {
    x: MARGIN_L, y: FOOTER_Y, w: 5, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, bold: true,
    color: fg, charSpacing: 4, margin: 0, valign: "middle",
  });
  slide.addText(`${String(page).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: SLIDE_W - MARGIN_R - 3, y: FOOTER_Y, w: 3, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, bold: true,
    color: fg, charSpacing: 4, margin: 0, valign: "middle", align: "right",
  });
}

function addEyebrow(slide, text, x, y, color) {
  slide.addText(text, {
    x, y, w: 8, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, bold: true,
    color, charSpacing: 6, margin: 0, valign: "middle",
  });
}

// ---- Presentation -----------------------------------------------------------

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Maple & Main Ice Cream";
pres.author = "Maple & Main";

const TOTAL = 9;

// ---------------------------------------------------------------------------
// SLIDE 1 — Cover
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: CREAM };
  addHeader(s, pres);
  addFooter(s, 1, TOTAL);

  // Big decorative logo bleeding off the right edge
  drawLogo(s, pres, 8.5, 1.9, 5.8, 4.7, D
```