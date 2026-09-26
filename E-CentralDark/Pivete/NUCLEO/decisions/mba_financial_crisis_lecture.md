# DECISAO - mba_financial_crisis_lecture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\mba_financial_crisis_lecture.js
**SHA:** 6afaf2bf6feb1e49
**Timestamp:** 2026-08-28T02:52:35.684910
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const rowYStart = tY + 0.4, rH2 = 0.4;

### Gaps
- const cardY = 2.15, cardH = 3.3, cardW = 2.95, gap = 0.15, startX = 0.5;
- const sY = 2.6, sH = 1.9, sW = 2.45, gap = 0.12, startX = 0.5;
- const cbY = 5.1, cbH = 0.5, cbW = 4.07, cbGap = 0.12;
- const fY = 2.15, fH = 1.0, fW = 1.58, fGap = 0.18, fStartX = 0.5;
- const cW = 4.07, cH = 2.1, cGap = 0.12, startX = 0.5, startY = 2.2;
- s.addText("Four legislative and institutional decisions built the gap:", {
- const iW = 4.07, iH = 3.4, iGap = 0.12, iY = 3.3;
- const cW = 4.07, cH = 4.1, cGap = 0.12, cY = 2.5;
- const lW = 4.07, lH = 3.5, lGap = 0.12, lY = 2.55;
- const qW = 6.2, qH = 1.95, qGap = 0.15, qStartX = 0.5, qStartY = 2.1;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreation of the 2008 Global Financial Crisis deck
// UNC Charlotte Belk College of Business - MBA Financial Crises Seminar
//
// Usage: node build.js
// Output: output.pptx in the current directory.
//
// Required assets (must be in ./assets/ relative to this script):
//   title_bg.jpg    - pre-composed title slide background (1920x1080)
//   content_bg.jpg  - pre-composed content slide header/background (1920x1080)
//   logo3.png       - Freddie Mac logo
//   logo4.png       - Fannie Mae logo
//   logo5.png       - AIG logo
//   logo6.svg       - Lehman Brothers logo
//   logo7.png       - Bear Stearns logo

const pptxgen = require("pptxgenjs");
const path = require("path");

const ASSETS = path.join(__dirname, "assets");

// =============================================================
// Palette (extracted from the source deck XML)
// =============================================================
const C = {
  green:       "005035",   // UNC Charlotte primary green
  greenBright: "00703C",   // accent green
  red:         "802F2D",   // brick/crimson
  redDark:     "A0411F",   // burnt red (shadow-banking bars)
  gold:        "A49665",   // Crown gold
  goldAlt:     "B9975B",
  olive:       "899064",   // moss/olive green
  ink:         "101820",   // near-black titles
  body:        "333333",   // body text
  bodyMuted:   "4C5258",
  label:       "79808A",   // small caps labels
  muted:       "A6ACB3",   // muted footer / axis
  lightGray:   "E8E8E8",   // card borders, horizontal rules
  cream:       "FAF5E0",   // light cream (callout boxes)
  creamDeep:   "EAE4D4",   // deeper cream (process flow boxes)
  creamSoft:   "DDD6C7",
  offWhite:    "FAFAF7",
  white:       "FFFFFF",
};

const F = {
  title: "Cambria",
  body:  "Calibri",
  label: "Arial Narrow",
};

// =============================================================
// Presentation setup
// =============================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";   // 13.333" x 7.5"
pres.title  = "2008 Global Financial Crisis";
pres.author = "MBA Financial Crises Seminar";

const W = 13.333;  // slide width
const H = 7.5;     // slide height

// ---- helpers ----
// Standard slide footer: "N / 13" left, "SPRING 2026 · CONFIDENTIAL" right,
// with a thin rule above.
function addFooter(slide, pageNum) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.5, y: 7.05, w: W - 1.0, h: 0,
    line: { color: C.lightGray, width: 0.5 },
  });
  slide.addText(`${pageNum} / 13`, {
    x: 0.5, y: 7.15, w: 2.0, h: 0.3,
    fontFace: F.label, fontSize: 9, color: C.muted, align: "left", margin: 0,
  });
  slide.addText("SPRING 2026  ·  CONFIDENTIAL", {
    x: W - 3.5, y: 7.15, w: 3.0, h: 0.3,
    fontFace: F.label, fontSize: 9, color: C.muted, align: "right",
    charSpacing: 2, margin: 0,
  });
}

// Slide title (Cambria bold serif). Returns nothing; positions below the header band.
function addTitle(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 0.85, w: W - 1.0, h: 0.9,
    fontFace: F.title, fontSize: 22, bold: true, color: C.ink,
    align: "left", valign: "top", margin: 0,
  });
}

// Source line (small italic gray) at the bottom above the footer rule.
function addSource(slide, text, y = 6.8) {
  slide.addText(text, {
    x: 0.5, y: y, w: W - 1.0, h: 0.25,
    fontFace: F.body, fontSize: 9, italic: true, color: C.muted,
    align: "left", margin: 0,
  });
}

// =============================================================
// SLIDE 1 — Title
// =============================================================
{
  const s = pres.addSlide();
  s.background = { path: path.join(ASSETS, "title_bg.jpg") };

  // Small eyebrow label
  s.addText("A  POST-MORTEM  ·  MBA FINANCIAL CRISES SEMINAR", {
    x: 0.9, y: 1.5, w: 10, h: 0.35,
    fontFace: F.label, fontSize: 12, color: C.gold,
    charSpacing: 4, bold: false, margin: 0,
  });

  // Main title (big serif)
  s.addText("2008 Global Financial Crisis", {
    x: 0.9, y: 2.6, w: 12, h: 1.3,
    fontFace: F.title, fontSize: 60, bold: true, color: C.white,
    align: "left", valign: "top", margin: 0,
  });

  // Subtitle italic
  s.addText("A causation-first post-mortem: why the system broke, and what remains unfixed seventeen years later.", {
    x: 0.9, y: 4.15, w: 11, h: 0.55,
    fontFace: F.body, fontSize: 18, italic: true, color: C.white,
    align: "left", valign: "top", margin: 0,
  });

  // Bottom-left block: course + affiliation + instructor
  s.addText("MBA FINANCIAL CRISES SEMINAR", {
    x: 0.9, y: 6.05, w: 7, h: 0.3,
    fontFace: F.label, fontSize: 11, color: C.white, bold: true,
    charSpacing: 4, margin: 0,
  });
  s.addText("The Belk College of Business  ·  UNC Charlotte", {
    x: 0.9, y: 6.42, w: 7, h: 0.3,
    fontFace: F.body, fontSize: 13, color: C.white, margin: 0,
  });
  s.addText("Professor’s Name    |    Spring 2026", {
    x: 0.9, y: 6.72, w: 7, h: 0.3,
    fontFace: F.body, fontSize: 12, color: C.white, margin: 0,
  });
}

// =========
```