# PADRAO - interior_design_studio_portfolio.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\interior_design_studio_portfolio.js
**SHA:** b6b4efe6fdcd2924
**Timestamp:** 2026-08-28T02:52:35.230765
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Uses pptxgenjs. Run: node recreate.js
- const colStart = 0.7;

### Gaps
- const cellW = 4.75, cellH = 2.85, gap = 0.2;
- const cardGap = 0.15;
- const swatchY = 7.6, swatchW = 3.15, swatchH = 3.1, swatchGap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreation of 70_s.pptx — "Maison Solène" deck
// Uses pptxgenjs. Run: node recreate.js
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "MS_WIDE", width: 20, height: 11.25 });
pres.layout = "MS_WIDE";
pres.author = "Maison Solène";
pres.title = "Maison Solène — Vol. I";

// -------- Palette --------
const C = {
  sienna:     "D98656",
  siennaDeep: "C4653A",
  oxblood:    "5A1E10",
  brownDeep:  "3D2418",
  brownDark:  "2A1A10",
  espresso:   "25160C",
  cream:      "FDF2D5",
  creamLt:    "FFF8E6",
  sand:       "E8DCC2",
  paper:      "F1E7D3",
  gold:       "E8B866",
  goldLt:     "F6D89A",
  ochre:      "C8953A",
  wheat:      "D9A856",
  terra:      "A04A24",
  plum:       "5A2A3A",
  olive:      "6B7A3A",
  forest:     "3D4A1E",
  forestDk:   "191E0C",
  olive2:     "4A5A2A",
  brick:      "7E3A1C",
};

const FONT_SERIF = "Georgia";
const FONT_MONO = "Consolas";
const FONT_SANS = "Calibri";

// Slide dims
const W = 20;
const H = 11.25;

// -------- Helper: header bar (page no · title · M · S) --------
function addHeader(slide, pageNum, title, inkColor, lineColor) {
  slide.addText(`${pageNum} / 08`, {
    x: 0.7, y: 0.45, w: 2, h: 0.4,
    fontFace: FONT_MONO, fontSize: 11, color: inkColor, charSpacing: 3,
    margin: 0,
  });
  slide.addText(`— ${title} —`, {
    x: 7, y: 0.45, w: 6, h: 0.4,
    fontFace: FONT_MONO, fontSize: 11, color: inkColor, align: "center", charSpacing: 3,
    margin: 0,
  });
  slide.addText([
    { text: "M", options: { fontFace: FONT_SERIF, italic: false } },
    { text: "  ·  ", options: { fontFace: FONT_MONO } },
    { text: "S", options: { fontFace: FONT_SERIF } },
  ], {
    x: W - 2.7, y: 0.45, w: 2, h: 0.4,
    fontSize: 12, color: inkColor, align: "right", charSpacing: 2,
    margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 0.95, w: W - 1.4, h: 0,
    line: { color: lineColor, width: 0.5 },
  });
}

// Header monogram used on title/closing slides
function addMonogram(slide, x, y, color) {
  slide.addText([
    { text: "M", options: { fontFace: FONT_SERIF } },
    { text: "  ·  ", options: { fontFace: FONT_MONO } },
    { text: "S", options: { fontFace: FONT_SERIF } },
  ], {
    x, y, w: 2, h: 0.5,
    fontSize: 14, color, charSpacing: 3, margin: 0,
  });
}

// ============================================================
// SLIDE 1 — COVER
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.sienna };

  // Decorative circles (top-left big, bottom-right smaller)
  s.addShape(pres.shapes.OVAL, {
    x: -2.5, y: -2.5, w: 6.5, h: 6.5,
    fill: { color: C.goldLt, transparency: 75 },
    line: { type: "none" },
  });
  s.addShape(pres.shapes.OVAL, {
    x: W - 2.5, y: H - 4, w: 3.5, h: 3.5,
    fill: { color: C.goldLt, transparency: 80 },
    line: { type: "none" },
  });

  // Outer frame (thin cream rectangle border)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 0.4, w: W - 1.0, h: H - 0.8,
    fill: { type: "none" },
    line: { color: C.creamLt, width: 0.5, transparency: 40 },
  });

  // Dark footer band
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: H - 1.85, w: W, h: 1.85,
    fill: { color: C.brownDeep }, line: { type: "none" },
  });

  // Re-draw frame bottom over footer (thin line)
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: H - 0.4, w: W - 1.0, h: 0,
    line: { color: C.creamLt, width: 0.5, transparency: 40 },
  });

  // Top-left monogram
  addMonogram(s, 0.9, 0.75, C.creamLt);

  // Top-right tagline
  s.addText("A HOUSE OF INTERIORS  ·  EST. 2026", {
    x: W - 7.5, y: 0.8, w: 6.6, h: 0.4,
    fontFace: FONT_MONO, fontSize: 12, color: C.creamLt,
    align: "right", charSpacing: 4, margin: 0,
  });

  // Main title — "Maison Solène"
  s.addText([
    { text: "Maison ", options: { italic: false } },
    { text: "Solène", options: { italic: true } },
  ], {
    x: 0.7, y: 3.5, w: W - 1.4, h: 3.2,
    fontFace: FONT_SERIF, fontSize: 165, color: C.cream,
    align: "center", valign: "middle", margin: 0,
    shadow: { type: "outer", color: "000000", blur: 18, offset: 4, angle: 135, opacity: 0.2 },
  });

  // Thin lines left/right under title
  s.addShape(pres.shapes.LINE, {
    x: 1.0, y: 6.9, w: 1.0, h: 0,
    line: { color: C.creamLt, width: 1 },
  });
  s.addShape(pres.shapes.LINE, {
    x: W - 2.0, y: 6.9, w: 1.0, h: 0,
    line: { color: C.creamLt, width: 1 },
  });

  // Footer text (inside dark band)
  s.addText("VELVET  ·  TRAVERTINE  ·  BURNT SIENNA  ·  SUN", {
    x: 0.5, y: H - 1.55, w: W - 1.0, h: 0.6,
    fontFace: FONT_MONO, fontSize: 14, color: C.cream,
    align: "center", charSpacing: 6, margin: 0,
  });

  s.addText("VOL. I  —  MMXXVI", {
    x: 1.0, y: H - 0.85, w: 5, h: 0.4,
    fontFace: FONT_MONO, fontSize: 11, color: C.cream,
    align: "left", charSpacing: 3, margin: 0,
  });
  s.addText("LOS ANGELES  ·  MARRAKECH", {
    x: W - 6.0, y: H - 0.85, w: 5, h: 0.4,
    fontFace: FONT_MONO, fo
```