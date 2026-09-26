# OUTRO - italy_travel_destination_guide.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\italy_travel_destination_guide.js
**SHA:** d6752f82f409b2ca
**Timestamp:** 2026-08-28T02:52:35.365333
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node italy.js  ->  italy.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// italy.js — Recreate "La Bella Italia" travel-edit deck with pptxgenjs
// Run: node italy.js  ->  italy.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "La Bella Italia";
pres.author = "A Travel Edit";

const W = 13.333;
const H = 7.5;

// ---------- Palette ----------
const CREAM       = "EDE0CA";   // primary cream
const CREAM_DEEP  = "E5D6BC";   // shaded cream
const INK         = "1B1310";   // near-black
const INK_SOFT    = "3A2E26";   // brown ink
const RED         = "9F3A28";   // accent terracotta-red
const GOLD        = "E8A53A";   // accent gold (Eternal)
const SKY_TOP     = "F2C58A";   // sky upper
const SKY_MID     = "E89A56";   // sky mid
const SKY_LOW     = "C56F35";   // sky lower
const HILL_FAR    = "7A4326";   // distant hill
const HILL_MID    = "5A2E1C";   // mid hill
const HILL_NEAR   = "3F1F12";   // near hill
const SUN         = "F7E2A8";   // pale sun
const SUN_RING    = "FBE8B8";   // sun glow
const TREE        = "2A1108";   // cypress dark
const ROOF        = "3F1F12";   // little house roof
const NAVY        = "1F4860";   // venezia base
const NAVY_DEEP   = "133247";   // venezia deeper
const NAVY_DARK   = "0E2536";   // venezia silhouette
const MOON        = "EFE6CE";   // venezia moon
const ESPRESSO    = "1F1207";   // roma chocolate bg
const ESPRESSO_2  = "281710";   // roma slight shade
const ESPRESSO_HL = "EFE3CB";   // roma title cream
const MAP_LAND    = "D9B879";   // italy map landmass
const MAP_WATER   = "E5D2A6";   // map sea wash
const MAP_LINE    = "8C6B3A";   // map outline / wave
const SEA         = "2C5F73";   // amalfi sea

// ---------- Helpers ----------
const SERIF = "Georgia";
const SANS  = "Helvetica";
// monospace-ish for labels (uses platform default for monospace)
const MONO  = "Courier New";

function chapterHeader(slide, opts) {
  // Top row: chapter left, center label, right meta
  const { left, center, right, color = INK_SOFT } = opts;
  if (left)  slide.addText(left,  { x: 0.55, y: 0.30, w: 5.5, h: 0.30, fontFace: MONO, fontSize: 9,  color, charSpacing: 4, margin: 0 });
  if (center) slide.addText(center, { x: (W-4)/2, y: 0.30, w: 4, h: 0.30, fontFace: MONO, fontSize: 9, color, charSpacing: 4, align: "center", margin: 0 });
  if (right) slide.addText(right, { x: W-6.05, y: 0.30, w: 5.5, h: 0.30, fontFace: MONO, fontSize: 9, color, charSpacing: 4, align: "right", margin: 0 });
}

function footer(slide, opts) {
  // Roman numeral, center caption, page number, with a thin horizontal rule between
  const { roman, caption, page, color = INK_SOFT, lineColor } = opts;
  const lc = lineColor || color;
  const y = H - 0.45;
  slide.addText(roman, { x: 0.55, y, w: 0.7, h: 0.3, fontFace: MONO, fontSize: 9, color, charSpacing: 3, margin: 0 });
  // line left
  slide.addShape(pres.shapes.LINE, { x: 1.25, y: y + 0.16, w: 4.6, h: 0, line: { color: lc, width: 0.5 } });
  // caption
  slide.addText(caption, { x: 5.85, y, w: 4.0, h: 0.3, fontFace: MONO, fontSize: 9, color, charSpacing: 4, align: "center", margin: 0 });
  // line right
  slide.addShape(pres.shapes.LINE, { x: 9.85, y: y + 0.16, w: 2.65, h: 0, line: { color: lc, width: 0.5 } });
  // page
  slide.addText(page, { x: W - 1.6, y, w: 1.1, h: 0.3, fontFace: MONO, fontSize: 9, color, charSpacing: 3, align: "right", margin: 0 });
}

function smallLabel(slide, text, x, y, w, opts = {}) {
  slide.addText(text, {
    x, y, w, h: 0.28,
    fontFace: MONO, fontSize: 9, color: opts.color || INK_SOFT,
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 4,
    align: opts.align || "left", margin: 0,
    bold: opts.bold || false,
  });
}

// Diamond marker (rotated square)
function diamond(slide, cx, cy, size, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: cx - size/2, y: cy - size/2, w: size, h: size,
    fill: { color }, line: { type: "none" }, rotate: 45,
  });
}

// ===================================================================
// SLIDE 1 — COVER
// ===================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: CREAM };

  // Right-side illustrated panel (sunset over Tuscan hills)
  const panelX = 7.7;
  const panelW = W - panelX;

  // Sky bands (faux gradient via stacked rectangles)
  const skyBands = [
    [0.00, 1.40, "F4D29A"],
    [1.40, 1.20, "F0BC78"],
    [2.60, 1.00, "EB9F50"],
    [3.60, 0.80, "DD8038"],
  ];
  skyBands.forEach(([y, h, c]) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: panelX, y, w: panelW, h,
      fill: { color: c }, line: { type: "none" },
    });
  });

  // Sun glow + sun
  s.addShape(pres.shapes.OVAL, {
    x: panelX + 2.3, y: 1.6, w: 2.6, h: 2.6,
    fill: { color: SUN_RING }, line: { type: "none" },
  });
  s.addShape(pres.shapes.OVAL, {
    x: panelX + 2.7, y: 2.0, w: 1.8, h: 1.8,
    fill: { color: SUN }, line: { type: "none" },
  });

  // Bird marks (small ~ shapes via tiny lines)
 
```