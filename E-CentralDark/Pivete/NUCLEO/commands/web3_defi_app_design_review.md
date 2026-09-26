# COMANDO - web3_defi_app_design_review.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\web3_defi_app_design_review.js
**SHA:** 6ce760bd930ca229
**Timestamp:** 2026-08-28T02:52:37.672479
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const colW = 5.6, colGap = 0.4, startX = 0.7;
- const cardY = 4.2, cardW = 5.9, cardH = 5.6, gap = 0.35;
- const dotY = 10.2, cx = 10, dotR = 0.1, dotGap = 0.35;
- const pY = 4.5, pW = 5.7, pH = 5.5, pGap = 0.6;
- const cW = 5.6, cGap = 0.4, cX0 = 0.7;

### Ouro Bruto (primeiros 5000 chars)
```
// Replica of defi.pptx — Zipped App Design Review
// Build: node defi.js  →  defi_replica.pptx
//
// Canvas: 20" x 11.25" (matches source 18288000 x 10287000 EMU, 16:9 widescreen)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "ZIPPED_WIDE", width: 20, height: 11.25 });
pres.layout = "ZIPPED_WIDE";
pres.author = "Zipped";
pres.title = "Zipped — App Design Review";

// ----- Palette -----
const BG       = "0A0A0F";
const SURFACE  = "12121A";
const SURFACE2 = "16161F";
const BORDER   = "24242E";
const BORDER2  = "2A2A36";
const MUTED    = "6B6B7B";
const MUTED2   = "8A8A9A";
const TEXT     = "F5F5F0";
const ACCENT   = "7C5CFF";
const ACCENT_D = "272359";       // muted dark navy-purple (big circle on slide 1)
const SUCCESS  = "00E5B0";

const SERIF = "Cambria";
const MONO  = "Consolas";

// ----- Helpers -----
// Header (top mono labels) + page counter — used on slides 2..9
function addHeader(slide, sectionNum, sectionName, pageNum) {
  slide.addText(`${sectionNum} / ${sectionName}`, {
    x: 0.7, y: 0.35, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 11, color: MUTED, charSpacing: 2, margin: 0,
  });
  slide.addText(`${pageNum} — 09`, {
    x: 11.3, y: 0.35, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 11, color: MUTED, charSpacing: 2, align: "right", margin: 0,
  });
}

// Section eyebrow with purple bullet dot (used on content slides)
function addEyebrow(slide, text, y = 1.35) {
  slide.addShape(pres.shapes.OVAL, {
    x: 0.72, y: y + 0.11, w: 0.11, h: 0.11,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
  });
  slide.addText(text, {
    x: 0.95, y: y, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 12, color: ACCENT, charSpacing: 2, bold: false, margin: 0,
  });
}

// Serif page title
function addTitle(slide, text, y = 2.1, w = 18, h = 0.9, fontSize = 40) {
  slide.addText(text, {
    x: 0.7, y, w, h,
    fontFace: SERIF, fontSize, color: TEXT, margin: 0,
  });
}

// ========================================================================
// SLIDE 1 — TITLE
// ========================================================================
{
  const s = pres.addSlide();
  s.background = { color: BG };

  // Top mono labels
  s.addText("ZIPPED // INTERNAL", {
    x: 0.7, y: 0.7, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 13, color: MUTED, charSpacing: 3, margin: 0,
  });
  s.addText("ETH MAINNET — V0.1", {
    x: 11.3, y: 0.7, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 13, color: MUTED, charSpacing: 3, align: "right", margin: 0,
  });

  // Big dark purple circle (right side)
  s.addShape(pres.shapes.OVAL, {
    x: 10.6, y: 1.2, w: 8.6, h: 8.6,
    fill: { color: ACCENT_D }, line: { color: ACCENT_D, width: 0 },
  });

  // Camera-reticle crop-marks logo (four L-shaped corners + small accent square)
  // Positioned at roughly x=1.0, y=5.35, 1.2" square
  const lx = 1.0, ly = 5.35, lsize = 1.0, stroke = 0.04, armLen = 0.25;
  // top-left
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly, w: armLen, h: stroke, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly, w: stroke, h: armLen, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  // top-right
  s.addShape(pres.shapes.RECTANGLE, { x: lx + lsize - armLen, y: ly, w: armLen, h: stroke, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lx + lsize - stroke, y: ly, w: stroke, h: armLen, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  // bottom-left
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly + lsize - armLen, w: stroke, h: armLen, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lx, y: ly + lsize - stroke, w: armLen, h: stroke, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  // bottom-right
  s.addShape(pres.shapes.RECTANGLE, { x: lx + lsize - armLen, y: ly + lsize - stroke, w: armLen, h: stroke, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: lx + lsize - stroke, y: ly + lsize - armLen, w: stroke, h: armLen, fill: { color: TEXT }, line: { color: TEXT, width: 0 } });
  // accent dot in center
  s.addShape(pres.shapes.RECTANGLE, {
    x: lx + lsize / 2 - 0.06, y: ly + lsize / 2 - 0.06, w: 0.12, h: 0.12,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 },
  });

  // "Zipped" big serif
  s.addText("Zipped", {
    x: 0.7, y: 6.85, w: 10, h: 1.7,
    fontFace: SERIF, fontSize: 110, color: TEXT, bold: false, margin: 0,
  });

  // Italic subtitle
  s.addText("A private lending protocol for Ethereum, shielded by zero-knowledge proofs.", {
    x: 0.7, y: 8.85, w: 9.5, h: 1.1,
    fontFace: SERIF, fontSize: 24, color: TEXT, italic: true, margin: 0,
  });

  // Bottom mono labels
  s.addText("APP DESIGN REVIEW", {
    x: 0.7, y: 10.35, w: 8, h: 0.4,
    fontFace: MONO, fontSize: 12, color: MUTED, charSpacing: 3, margin: 0,
  });
  s.addText("ENG + DESIGN", {
```