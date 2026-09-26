# OUTRO - mobile_pet_grooming_service_overview.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\mobile_pet_grooming_service_overview.js
**SHA:** d6c5198eaba99cec
**Timestamp:** 2026-08-28T02:52:36.104891
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build.js   →   output: Mobile_K9_Salon.pptx

### Padroes
- // pattern: 0 = blank, 1 = filled
- const pattern = [

### Gaps
- const cardW = 3.0, gap = 0.1, startX = 0.55, topY = 3.15;
- const gw = 2.37, gh = 1.74, ggap = 0.08;
- const cardW = 4.1, cardH = 4.0, cardGap = 0.1, startX = 0.55, startY = 2.7;
- const gw = 2.9, gh = 2.02, gap = 0.08;

### Ouro Bruto (primeiros 5000 chars)
```
// K9 Cuts — Mobile Pet Salon
// Full 9-slide services overview deck recreated with pptxgenjs
// Run: node build.js   →   output: Mobile_K9_Salon.pptx

const pptxgen = require("pptxgenjs");

// -----------------------------------------------------------------------------
// Palette
// -----------------------------------------------------------------------------
const C = {
  cream:     "F3ECE1", // main light background
  creamAlt:  "FBF7EF", // card fill on light slides
  creamDk:   "EBE2D2", // slight darker cream for cards on slide 7
  ink:       "1B1915", // near-black (text + dark slide bg)
  text:      "3A342C", // primary body text
  textMute:  "7A7163", // muted captions / meta
  textSoft:  "A89D88", // softer muted text
  terra:     "BF5A3C", // terracotta accent (primary)
  terraDk:   "9C4328", // darker terracotta
  tan:       "E4CDB1", // tan / illustration bg
  tanDk:     "D9CFBE", // slightly darker warm neutral
  sage:      "8A9B7A", // sage green
  sageDk:    "5F7253", // deep sage
  sagePale:  "E8ECDF", // very pale sage (illustration bg)
};

const F_SANS = "Arial"; // header + body (deck uses Arial throughout)

// -----------------------------------------------------------------------------
// Layout setup
// -----------------------------------------------------------------------------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";        // 13.333 x 7.5 inches
pres.title  = "K9 Cuts — Mobile Pet Salon";
pres.author = "K9 Cuts";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// -----------------------------------------------------------------------------
// Shared chrome (logo, header meta, footer)
// -----------------------------------------------------------------------------
function addHeader(slide, sectionLabel, opts = {}) {
  const onDark = !!opts.onDark;
  const lightText = onDark ? C.cream : C.text;
  const muted     = onDark ? C.textSoft : C.textMute;

  // Logo dot (terracotta circle with tiny smile)
  slide.addShape(pres.shapes.OVAL, {
    x: 0.55, y: 0.3, w: 0.32, h: 0.32,
    fill: { color: C.terra }, line: { type: "none" },
  });
  // little smile inside logo (thin arc approximated with a small dark rectangle base)
  slide.addShape(pres.shapes.OVAL, {
    x: 0.64, y: 0.44, w: 0.14, h: 0.08,
    fill: { color: C.ink }, line: { type: "none" },
  });

  // "K9 CUTS"
  slide.addText("K9 CUTS", {
    x: 0.95, y: 0.26, w: 2.5, h: 0.4,
    fontFace: F_SANS, fontSize: 13, bold: true,
    color: lightText, charSpacing: 4, valign: "middle", margin: 0,
  });

  // Right-side section meta
  slide.addText(sectionLabel, {
    x: SLIDE_W - 6.5, y: 0.26, w: 6, h: 0.4,
    fontFace: F_SANS, fontSize: 11,
    color: muted, charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });
}

function addFooter(slide, pageNum, opts = {}) {
  const onDark = !!opts.onDark;
  const muted  = onDark ? C.textSoft : C.textMute;

  slide.addText("K9 Cuts — Mobile Pet Salon", {
    x: 0.55, y: SLIDE_H - 0.55, w: 5, h: 0.35,
    fontFace: F_SANS, fontSize: 11, color: muted,
    valign: "middle", margin: 0,
  });

  slide.addText(`${String(pageNum).padStart(2, "0")} / 09`, {
    x: SLIDE_W - 2, y: SLIDE_H - 0.55, w: 1.45, h: 0.35,
    fontFace: F_SANS, fontSize: 11, color: muted,
    align: "right", valign: "middle", margin: 0,
  });
}

// =============================================================================
// SLIDE 1 — COVER
// =============================================================================
function buildSlide1() {
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, "MOBILE PET SALON  ·  CHARLOTTE, NC");

  // --- Large stacked title ---
  s.addText([
    { text: "Grooming\n",  options: { color: C.ink } },
    { text: "that comes\n", options: { color: C.ink } },
    { text: "to you.",     options: { color: C.terra, italic: true } },
  ], {
    x: 0.55, y: 1.5, w: 7.5, h: 4.2,
    fontFace: F_SANS, fontSize: 80, bold: false,
    valign: "top", margin: 0, lineSpacingMultiple: 1.0,
  });

  // --- Illustration frame: bichon-style dog on tan gradient background ---
  const ix = 8.9, iy = 1.4, iw = 3.9, ih = 3.9;
  // outer tan square
  s.addShape(pres.shapes.RECTANGLE, {
    x: ix, y: iy, w: iw, h: ih,
    fill: { color: C.tan }, line: { type: "none" },
  });
  // radial glow (lighter oval in center behind the dog)
  s.addShape(pres.shapes.OVAL, {
    x: ix + 0.4, y: iy + 0.3, w: iw - 0.8, h: ih - 0.8,
    fill: { color: "EBD8B9" }, line: { type: "none" },
  });
  // Dog body (rounded mass at bottom)
  s.addShape(pres.shapes.OVAL, {
    x: ix + 0.65, y: iy + 2.25, w: 2.6, h: 1.5,
    fill: { color: C.creamAlt }, line: { color: C.ink, width: 0.75 },
  });
  // Dog head (large round)
  s.addShape(pres.shapes.OVAL, {
    x: ix + 0.95, y: iy + 0.75, w: 2.0, h: 2.0,
    fill: { color: C.creamAlt }, line: { color: C.ink, width: 0.75 },
  });
  // Muzzle
  s.addShape(pres.shapes.OVAL, {
    x: ix + 1.45, y: iy + 1.9, w: 1.0, h: 0.7,
    fill: { color: C.
```