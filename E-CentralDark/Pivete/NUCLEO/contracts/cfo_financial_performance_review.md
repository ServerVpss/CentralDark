# CONTRATO - cfo_financial_performance_review.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\cfo_financial_performance_review.js
**SHA:** 4fcdda2c7fb06f6c
**Timestamp:** 2026-08-28T02:52:32.537231
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.18;
- const silosGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Polymera Industries · FY2025 Year-End Review
// Recreates Deliverable_12.pptx using pptxgenjs.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Polymera Industries · FY2025 Year-End Review";
pres.author = "Margaret Chen";

// ============================================================================
// PALETTE
// ============================================================================
const C = {
  bg: "F1EADD",        // warm cream background
  ink: "1A1A1A",       // near black for primary text
  inkSoft: "2B2B2B",
  muted: "8A8275",     // muted brown-gray (labels, footers)
  rule: "C9BFAE",      // subtle rule line
  blue: "3A7A9A",      // teal-blue
  blueDk: "2F6680",
  orange: "E76A1F",    // primary orange
  orangeDk: "C0561A",
  peach: "F2C39A",     // light peach
  peachLt: "F8DABE",
  green: "4F7F58",     // forest green
  greenDk: "3F6847",
  black: "111111",
  cardLt: "E8DFCE",    // slightly darker card on cream
  white: "FFFFFF",
};

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// Fonts
const FH = "Arial"; // headline font (substitute for sans display)
const FB = "Calibri"; // body font

// ============================================================================
// HELPERS
// ============================================================================
function addHeader(slide, sectionLabel) {
  // Black dot
  slide.addShape(pres.shapes.OVAL, {
    x: 0.55, y: 0.42, w: 0.22, h: 0.22,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  // Brand
  slide.addText("POLYMERA INDUSTRIES", {
    x: 0.85, y: 0.32, w: 4, h: 0.42,
    fontFace: FB, fontSize: 11, bold: true, color: C.ink,
    charSpacing: 4, valign: "middle", margin: 0,
  });
  // Section right
  slide.addText(sectionLabel, {
    x: SLIDE_W - 6.5, y: 0.32, w: 6, h: 0.42,
    fontFace: FB, fontSize: 11, bold: true, color: C.ink,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
}

function addFooter(slide, leftText, pageNum) {
  slide.addText(leftText, {
    x: 0.55, y: SLIDE_H - 0.55, w: 9, h: 0.32,
    fontFace: FB, fontSize: 10.5, color: C.muted,
    charSpacing: 3, valign: "middle", margin: 0,
  });
  slide.addText(`${String(pageNum).padStart(2, "0")} / 09`, {
    x: SLIDE_W - 2.0, y: SLIDE_H - 0.55, w: 1.5, h: 0.32,
    fontFace: FB, fontSize: 10.5, color: C.muted,
    charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });
}

// Cylinder drawing — draws a 3D-style cylinder at (x,y,w,h) in "inches"
// The body is the full height; we draw the back ellipse as a top oval and
// the bottom ellipse, plus the side rectangle and outline arcs.
function drawCylinder(slide, x, y, w, h, fill, dark) {
  const ellipseH = Math.min(0.5, h * 0.18);
  // Body rectangle (between top and bottom ellipse centers)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x, y: y + ellipseH / 2, w: w, h: h - ellipseH,
    fill: { color: fill }, line: { color: C.ink, width: 1.25 },
  });
  // Hide vertical lines from rectangle's left/right by overlaying thin fill strips
  // (the rectangle outline runs around all 4 sides, but the side lines visually become
  // the cylinder sides — this is fine).

  // Bottom ellipse — drawn on top of body bottom edge
  slide.addShape(pres.shapes.OVAL, {
    x: x, y: y + h - ellipseH, w: w, h: ellipseH,
    fill: { color: dark }, line: { color: C.ink, width: 1.25 },
  });
  // Top ellipse — solid lighter rim
  slide.addShape(pres.shapes.OVAL, {
    x: x, y: y, w: w, h: ellipseH,
    fill: { color: fill }, line: { color: C.ink, width: 1.25 },
  });
  // Cover the rectangle outline that crosses through top ellipse area
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + 0.01, y: y + ellipseH / 2 - 0.02, w: w - 0.02, h: 0.04,
    fill: { color: fill }, line: { color: fill, width: 0 },
  });
}

// ============================================================================
// SLIDE 1 — TITLE
// ============================================================================
function slide1() {
  const slide = pres.addSlide();
  slide.background = { color: C.bg };
  addHeader(slide, "FY2025 · CONFIDENTIAL");

  // Eyebrow
  slide.addText("FISCAL YEAR 2025 · YEAR-END REVIEW", {
    x: 0.85, y: 1.95, w: 8, h: 0.4,
    fontFace: FB, fontSize: 13, color: C.inkSoft,
    charSpacing: 4, valign: "middle", margin: 0,
  });

  // Headline
  slide.addText("A year of\nmeasured\nmomentum.", {
    x: 0.85, y: 2.45, w: 7.5, h: 3.7,
    fontFace: FH, fontSize: 72, bold: true, color: C.ink,
    valign: "top", margin: 0,
  });

  // Pill: "PRESENTED BY MARGARET CHEN, CFO"
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.85, y: 6.25, w: 4.0, h: 0.45,
    fill: { color: C.bg }, line: { color: C.ink, width: 1 },
    rectRadius: 0.22,
  });
  slide.addText("PRESENTED BY MARGARET CHEN, CFO", {
    x: 0.85, y: 6.25, w: 4.0, h: 0.45,
    fontFace: FB, fontSize: 10.5, bold: true, color: C.ink,
    charSpacing: 3, a
```