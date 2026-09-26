# COMANDO - youth_soccer_training_program.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\youth_soccer_training_program.js
**SHA:** 1c7a7a5b06702a6e
**Timestamp:** 2026-08-28T02:52:37.762825
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: `node build.js`  →  outputs ./Plan_5.pptx

### Gaps
- const cardW = 5.71, cardH = 2.89, gap = 0.19;
- const rowGap = 1.57;
- const contactGap = 0.92;

### Ouro Bruto (primeiros 5000 chars)
```
// Plan_5.pptx — Northside FC U10 Training Program
// A faithful pptxgenjs replica of the original dark-themed 10-slide deck.
// Run: `node build.js`  →  outputs ./Plan_5.pptx

const pptxgen = require("pptxgenjs");

// ---------- Design tokens ----------
const C = {
  bg:      "0B0F14",  // page background
  card:    "11161D",  // primary card fill
  card2:   "1A2028",  // secondary / header-row fill
  border:  "232A34",  // hairline divider
  border2: "2E3944",  // softer divider
  text:    "F4F6F8",  // primary text (near-white)
  muted:   "8893A2",  // secondary text (cool gray)
  lime:    "C6FF3D",  // accent
  orange:  "FF5A1F",  // secondary accent
  white:   "FFFFFF",
};

const FONT_H = "Arial";          // headers / titles
const FONT_B = "Calibri";        // body
const FONT_M = "Consolas";       // mono-ish labels (eyebrow / timecodes)

const W = 20;        // slide width  (in)
const H = 11.25;     // slide height (in)
const L = 1.25;      // left margin
const R = 18.75;     // right edge (content)
const CW = R - L;    // content width = 17.50

// ---------- Presentation setup ----------
const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM_20x11_25", width: W, height: H });
pres.layout = "CUSTOM_20x11_25";
pres.author = "Northside FC";
pres.title  = "U10 Training Program";

// ---------- Helpers ----------
function bg(slide) {
  slide.background = { color: C.bg };
}

function footer(slide, pageNum) {
  // Hairline above footer
  slide.addShape(pres.shapes.RECTANGLE, {
    x: L, y: 10.36, w: CW, h: 0.01,
    fill: { color: C.border }, line: { type: "none" },
  });
  slide.addText("U10 TRAINING PROGRAM", {
    x: L, y: 10.55, w: 6, h: 0.33,
    fontFace: FONT_M, fontSize: 11, color: C.muted,
    charSpacing: 4, bold: false, margin: 0,
  });
  slide.addText(`${String(pageNum).padStart(2, "0")} / 10`, {
    x: R - 2, y: 10.55, w: 2, h: 0.33,
    fontFace: FONT_M, fontSize: 11, color: C.muted,
    align: "right", charSpacing: 4, margin: 0,
  });
}

// Eyebrow + big H1 + intro paragraph (shared by content slides)
function pageHeader(slide, eyebrow, title, intro) {
  slide.addText(eyebrow, {
    x: L, y: 0.94, w: CW, h: 0.38,
    fontFace: FONT_M, fontSize: 13, color: C.lime,
    bold: true, charSpacing: 6, margin: 0,
  });
  slide.addText(title, {
    x: L, y: 1.56, w: CW, h: 0.93,
    fontFace: FONT_H, fontSize: 48, color: C.text,
    bold: true, charSpacing: -1, margin: 0,
  });
  if (intro) {
    slide.addText(intro, {
      x: L, y: 2.70, w: 11.80, h: 0.92,
      fontFace: FONT_B, fontSize: 16, color: C.muted,
      margin: 0,
    });
  }
}

// ====================================================================
// SLIDE 1 — Title / cover
// ====================================================================
function slide1() {
  const s = pres.addSlide();
  bg(s);

  // Vertical divider at ~55% of the slide
  s.addShape(pres.shapes.RECTANGLE, {
    x: 11.11, y: 0, w: 0.01, h: H,
    fill: { color: C.border }, line: { type: "none" },
  });

  // ---- Left column ----

  // Logo mark: diamond (rotated square) with lime star
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.25, y: 1.25, w: 0.53, h: 0.53,
    fill: { color: C.bg }, line: { color: C.lime, width: 1.5 },
    rotate: 45,
  });
  s.addText("★", {
    x: 1.38, y: 1.32, w: 0.35, h: 0.44,
    fontFace: FONT_H, fontSize: 19, color: C.lime,
    align: "center", valign: "middle", margin: 0, bold: true,
  });

  // Club tagline
  s.addText("NORTHSIDE FC · BOYS U10 TRAVEL", {
    x: 1.97, y: 1.30, w: 8.5, h: 0.47,
    fontFace: FONT_M, fontSize: 14, color: C.text,
    charSpacing: 6, valign: "middle", margin: 0, bold: true,
  });

  // Small eyebrow above the big title
  s.addText("2026 SPRING SEASON · PARENT INFO NIGHT", {
    x: 1.25, y: 2.34, w: 8.87, h: 0.38,
    fontFace: FONT_M, fontSize: 12, color: C.lime,
    charSpacing: 4, margin: 0,
  });

  // Huge title — each word on its own line so we stay inside the column
  s.addText("TRAINING", {
    x: 1.25, y: 2.75, w: 8.03, h: 1.95,
    fontFace: FONT_H, fontSize: 110, color: C.text,
    bold: true, charSpacing: -3, margin: 0,
  });
  s.addText("PROGRAM", {
    x: 1.25, y: 4.80, w: 8.87, h: 1.95,
    fontFace: FONT_H, fontSize: 110, color: C.lime,
    bold: true, charSpacing: -3, margin: 0,
  });

  // Description
  s.addText(
    "A weekly development plan built for 9- and 10-year-old competitive players — technical, intentional, and age-appropriate.",
    {
      x: 1.25, y: 7.00, w: 8.80, h: 1.48,
      fontFace: FONT_B, fontSize: 19, color: C.text,
      margin: 0,
    }
  );

  // Metadata row — HEAD COACH / SEASON / PLAYERS
  const meta = [
    { label: "HEAD COACH", value: "COACH RIVERA",   x: 1.25, wv: 2.32 },
    { label: "SEASON",     value: "MAR — JUN 2026", x: 4.16, wv: 2.70 },
    { label: "PLAYERS",    value: "14 ROSTER",      x: 7.44, wv: 1.76 },
  ];
  meta.forEach(m => {
    s.addText(m.label, {
      x: m.x, y: 9.35, w: 2.0, h: 0.32,
      fontFace: FONT_M, fontSize: 12, 
```