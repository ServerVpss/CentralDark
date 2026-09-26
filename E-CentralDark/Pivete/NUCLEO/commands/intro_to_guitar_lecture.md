# COMANDO - intro_to_guitar_lecture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\intro_to_guitar_lecture.js
**SHA:** f661fb5ddbfb8697
**Timestamp:** 2026-08-28T02:52:35.320847
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Pattern: [muted, played, played, muted, played, played, played, played]? Looking at slide image:
- const pattern = [

### Gaps
- const colGap = 0.2;
- const tabLineGap = 0.22;
- const chordGap = 0.18;
- const boxGap = 0.08;
- const blockGap = 0.1;
- const weekGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Intro_to_Guitar replica built with pptxgenjs
// Layout: LAYOUT_WIDE → 13.333 x 7.5 inches
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "An Introduction to Guitar";
pres.author = "Prof. R. Almeida";

// ---- Palette ----
const BG_CREAM   = "F2EFE6";   // warm off-white / bone
const BG_DARK    = "1C1A16";   // near-black warm
const INK        = "1C1A16";   // primary text
const INK_SOFT   = "2A2722";   // body on cream
const MUTED      = "8A857B";   // subdued labels/eyebrows
const DIV_LINE   = "C9C3B5";   // hairline divider
const PANEL      = "E8E2D1";   // slightly darker panel on cream
const PANEL_LINE = "D4CDB8";   // panel border
const CREAM_ON_DARK = "EFECE2";

// ---- Fonts ----
const F_TITLE = "Georgia";     // serif italic big titles
const F_BODY  = "Calibri";     // body
const F_SANS  = "Calibri";

// ---- Slide dimensions ----
const W = 13.333;
const H = 7.5;

// ---- Helpers ----
function addEyebrow(slide, leftText, rightText, color = MUTED) {
  slide.addText(leftText, {
    x: 0.6, y: 0.45, w: 7, h: 0.35,
    fontFace: F_SANS, fontSize: 11, color, charSpacing: 4, bold: false,
    margin: 0,
  });
  if (rightText) {
    slide.addText(rightText, {
      x: W - 7.6, y: 0.45, w: 7, h: 0.35,
      fontFace: F_SANS, fontSize: 11, color, charSpacing: 4, align: "right",
      margin: 0,
    });
  }
}

function addFooter(slide, pageStr, color = MUTED) {
  slide.addText("An Introduction to Guitar", {
    x: 0.6, y: H - 0.55, w: 5, h: 0.3,
    fontFace: F_SANS, fontSize: 11, color, margin: 0,
  });
  slide.addText(pageStr, {
    x: W - 1.6, y: H - 0.55, w: 1, h: 0.3,
    fontFace: F_SANS, fontSize: 11, color, align: "right", margin: 0,
  });
}

// ====================================================================
// SLIDE 1 – Title / Cover
// ====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_CREAM };

  // Dark right panel (roughly 37% of width)
  const panelX = 8.4;
  s.addShape(pres.shapes.RECTANGLE, {
    x: panelX, y: 0, w: W - panelX, h: H,
    fill: { color: BG_DARK }, line: { color: BG_DARK, width: 0 },
  });

  // Eyebrow top-left
  s.addText("MUS 101  ·  LECTURE 01  ·  PROF. R. ALMEIDA", {
    x: 0.6, y: 0.7, w: 7, h: 0.4,
    fontFace: F_SANS, fontSize: 12, color: MUTED, charSpacing: 4, margin: 0,
  });

  // Big italic title
  s.addText("an\nintroduction\nto guitar.", {
    x: 0.6, y: 1.3, w: 7.5, h: 3.8,
    fontFace: F_TITLE, fontSize: 82, italic: true, color: INK,
    lineSpacingMultiple: 1.0, margin: 0,
  });

  // Bottom-left meta: Course / Duration
  s.addText("Course", {
    x: 0.6, y: 6.15, w: 3, h: 0.3,
    fontFace: F_SANS, fontSize: 11, color: MUTED, margin: 0,
  });
  s.addText("Foundations of Popular Music", {
    x: 0.6, y: 6.45, w: 3.6, h: 0.3,
    fontFace: F_SANS, fontSize: 13, color: INK_SOFT, margin: 0,
  });
  s.addText("Duration", {
    x: 3.6, y: 6.15, w: 3, h: 0.3,
    fontFace: F_SANS, fontSize: 11, color: MUTED, margin: 0,
  });
  s.addText("10 slides  ·  50 minutes", {
    x: 3.6, y: 6.45, w: 3.6, h: 0.3,
    fontFace: F_SANS, fontSize: 13, color: INK_SOFT, margin: 0,
  });

  // Decorative staff lines on dark panel
  const staffX = panelX + 0.4;
  const staffW = W - panelX - 0.8;
  const staffY = 1.8;
  for (let i = 0; i < 4; i++) {
    s.addShape(pres.shapes.LINE, {
      x: staffX, y: staffY + i * 0.45, w: staffW, h: 0,
      line: { color: "5A544A", width: 0.75 },
    });
  }

  // Epigraph quote
  s.addText('"Six strings. Twelve notes.\nA lifetime of music."', {
    x: panelX + 0.4, y: 5.6, w: staffW, h: 1.1,
    fontFace: F_TITLE, fontSize: 22, italic: true, color: CREAM_ON_DARK,
    lineSpacingMultiple: 1.15, margin: 0,
  });
  s.addText("— LECTURE EPIGRAPH", {
    x: panelX + 0.4, y: 6.85, w: staffW, h: 0.3,
    fontFace: F_SANS, fontSize: 10, color: "8E887C", charSpacing: 4, margin: 0,
  });
}

// ====================================================================
// SLIDE 2 – Rationale: why guitar?
// ====================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG_CREAM };

  addEyebrow(s, "02  ·  RATIONALE", "WHY THIS INSTRUMENT?");

  s.addText("why guitar?", {
    x: 0.6, y: 0.95, w: 10, h: 1.2,
    fontFace: F_TITLE, fontSize: 60, italic: true, color: INK, margin: 0,
  });

  // Horizontal hairline across content below title
  s.addShape(pres.shapes.LINE, {
    x: 0.6, y: 2.45, w: W - 1.2, h: 0,
    line: { color: DIV_LINE, width: 0.75 },
  });

  // Three columns
  const colY = 2.7;
  const colH = 4.1;
  const colStartX = 0.6;
  const colGap = 0.2;
  const colW = (W - 1.2 - 2 * colGap) / 3;

  const items = [
    {
      num: "01",
      head: "Portable & accessible.",
      body: "Lightweight, affordable, and playable without amplification or accompaniment.",
    },
    {
      num: "02",
      head: "Harmonic & melodic.",
   
```