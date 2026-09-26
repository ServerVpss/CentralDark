# CONTRATO - regional_airport_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\regional_airport_pitch_deck.js
**SHA:** 219d6fcf96dd5991
**Timestamp:** 2026-08-28T02:52:36.341137
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node manassas.js   →   produces manassas.pptx
- const rowStart = 3.75, rowH = 0.72;

### Gaps
- const cardW = 2.85, cardGap = 0.15;
- const colW = 3.90, colGap = 0.20;
- const statW = 4.0, statGap = 0.20, statStartX = 0.60;
- const colW = 2.85, colGap = 0.20, startX = 0.60;
- const blockW = 4.0, blockGap = 0.15, blockStartX = 0.60;

### Ouro Bruto (primeiros 5000 chars)
```
// manassas.js — Recreate "Manassas Regional · Operator Overview 2026" deck with pptxgenjs.
// Run: node manassas.js   →   produces manassas.pptx
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.author = "Manassas Regional Airport";
pres.title = "Manassas Regional · Operator Overview 2026";

// ---------- Design tokens ----------
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const COLOR = {
  navy:      "0E1B2B",
  navyDeep:  "08111C",
  cream:     "EFE8DC",
  creamAlt:  "EBE3D4",
  rust:      "C8732E",
  rustDeep:  "A85B20",
  inkNavy:   "132134",   // body text on cream
  mutedNavy: "4A5A6E",   // secondary text on cream
  mutedCream:"9AA3AF",   // secondary text on navy
  hairlineLight: "C9C2B4", // thin rules on cream
  hairlineDark:  "2A3647", // thin rules on navy
};

const FONT = {
  serif: "Georgia",      // display headlines (serif with weight)
  mono:  "Courier New",  // labels, metadata, page numbers
  body:  "Georgia",      // body copy
};

// ---------- Helper utilities ----------
function hairline(slide, x, y, w, color, opts = {}) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: opts.width || 0.5 },
  });
}

// Chrome = the top/bottom scaffolding that appears on every slide.
// onNavy flips colors for dark slides.
function addChrome({ slide, onNavy, sectionLabel, topRight, pageNum, footerRight, showDot = true }) {
  const labelColor = onNavy ? COLOR.cream : COLOR.inkNavy;
  const mutedColor = onNavy ? COLOR.mutedCream : COLOR.mutedNavy;
  const dotColor   = COLOR.rust;

  // Top-left: • section label
  if (showDot) {
    slide.addShape(pres.shapes.OVAL, {
      x: 0.60, y: 0.56, w: 0.12, h: 0.12,
      fill: { color: dotColor }, line: { type: "none" },
    });
  }
  slide.addText(sectionLabel, {
    x: 0.82, y: 0.45, w: 6, h: 0.35,
    fontFace: FONT.mono, fontSize: 11, color: labelColor,
    charSpacing: 4, bold: false, margin: 0, valign: "middle",
  });

  // Top-right: context tag
  slide.addText(topRight, {
    x: SLIDE_W - 6.6, y: 0.45, w: 6, h: 0.35,
    fontFace: FONT.mono, fontSize: 11, color: labelColor,
    charSpacing: 4, align: "right", margin: 0, valign: "middle",
  });

  // Bottom-left: page number in mono
  slide.addText(pageNum, {
    x: 0.60, y: SLIDE_H - 0.65, w: 3, h: 0.3,
    fontFace: FONT.mono, fontSize: 11, color: labelColor,
    charSpacing: 3, margin: 0, valign: "middle",
  });

  // Bottom-right: footer label in mono
  slide.addText(footerRight, {
    x: SLIDE_W - 6.6, y: SLIDE_H - 0.65, w: 6, h: 0.3,
    fontFace: FONT.mono, fontSize: 11, color: labelColor,
    charSpacing: 4, align: "right", margin: 0, valign: "middle",
  });
}

// ============================================================
// SLIDE 1 — Title / cover
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { color: COLOR.navy };

  addChrome({
    slide, onNavy: true,
    sectionLabel: "MANASSAS REGIONAL · HEF · KHEF",
    topRight: "38.7214° N  77.5153° W",
    pageNum: "01 / 10",
    footerRight: "MANASSAS REGIONAL AIRPORT",
  });

  // Orange kicker
  slide.addText("OPERATOR OVERVIEW · 2026", {
    x: 0.80, y: 3.00, w: 7, h: 0.35,
    fontFace: FONT.mono, fontSize: 13, color: COLOR.rust,
    charSpacing: 5, margin: 0, valign: "middle",
  });

  // Giant serif headline
  slide.addText("The quiet way\ninto Washington.", {
    x: 0.80, y: 3.45, w: 8.2, h: 2.4,
    fontFace: FONT.serif, fontSize: 60, color: COLOR.cream,
    bold: false, margin: 0, valign: "top", lineSpacingMultiple: 1.05,
  });

  // Meta strip
  slide.addText("RWY 16L/34R · 6,200 ft       FAR Part 139 · GA        VA · USA", {
    x: 0.80, y: 5.95, w: 8.5, h: 0.4,
    fontFace: FONT.mono, fontSize: 12, color: COLOR.cream,
    charSpacing: 2, margin: 0, valign: "middle",
  });

  // --- Compass rose decoration (right side) ---
  const cx = 10.60, cy = 3.75;   // center of compass
  const ringColor = COLOR.hairlineDark;
  // Three rings
  [2.30, 1.65, 1.00].forEach((d) => {
    slide.addShape(pres.shapes.OVAL, {
      x: cx - d / 2, y: cy - d / 2, w: d, h: d,
      fill: { type: "none" },
      line: { color: ringColor, width: 0.75 },
    });
  });
  // Cross hairs
  slide.addShape(pres.shapes.LINE, {
    x: cx - 1.40, y: cy, w: 2.80, h: 0,
    line: { color: ringColor, width: 0.75 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: cx, y: cy - 1.40, w: 0, h: 2.80,
    line: { color: ringColor, width: 0.75 },
  });
  // North-pointing triangle (filled wedge)
  slide.addShape(pres.shapes.ISOSCELES_TRIANGLE, {
    x: cx - 0.10, y: cy - 1.15, w: 0.20, h: 1.15,
    fill: { color: COLOR.navyDeep }, line: { color: ringColor, width: 0.75 },
  });
}

// ============================================================
// SLIDE 2 — At a glance (4 stat cards)
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { col
```