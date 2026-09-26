# COMANDO - crypto_series_a_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\crypto_series_a_pitch_deck.js
**SHA:** c12903895c63e0b4
**Timestamp:** 2026-08-28T02:52:33.171153
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: `node build-tron.js`  → produces Tron.pptx
- const fStart = 3.5, fEnd = SLIDE_H - 1.3;

### Padroes
- // Cell pattern: 0=empty(very dim), 1=teal-dim, 2=teal-bright, 3=magenta
- const pattern = [

### Gaps
- const cardH = 1.45, cardGap = 0.25;
- const gap = 0.05;
- const mc = 6, mr = 3, mgap = 0.06;
- const cellGap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * NEONGRID — Tron-themed Series A pitch deck
 * Complete rewrite faithful to the reference. Standalone pptxgenjs script.
 * Run: `node build-tron.js`  → produces Tron.pptx
 *
 * Reference canvas: 20.0" × 11.25" (custom 16:9 wide, NOT pptxgenjs LAYOUT_WIDE)
 */

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// PALETTE (extracted from reference deck XML)
// ---------------------------------------------------------------------------
const C = {
  bg:        "05070D",   // deep navy near-black
  bgPanel:   "0A111A",   // slightly lighter (cards on slide 5/8)
  cyan:      "00F0FF",   // neon cyan (primary accent)
  cyanGlow:  "00F0FF",   // for glow color
  cyanDim:   "1A8A8E",   // dim cyan for radar lines
  cyanDeep:  "0A2A30",   // very dark teal (grid empty cells)
  cyanFill:  "0E7C84",   // mid teal (active grid cells)
  magenta:   "FF2BD6",   // neon magenta accent
  magentaDim:"7A2050",
  white:     "E8F6FF",   // soft white
  pureWhite: "FFFFFF",
  fgDim:     "6B7A92",   // muted slate (chrome / footers)
  fgFaint:   "3A4555",   // very muted
  fgMid:     "9AAAB8",
};

const FONT = "Arial";
// Subheading font — Cascadia Code (regular weight). Quirkier monospace look
// than Arial Bold for tags/eyebrows/section labels. PowerPoint and modern
// Windows ship this; falls back gracefully on systems without it.
const SUBFONT = "Cascadia Code";

// 20.0" × 11.25" canvas
const SLIDE_W = 20.0;
const SLIDE_H = 11.25;

// ---------------------------------------------------------------------------
// NEON SHADOW FACTORIES
// The reference deck uses tightly-blurred outerShdw on virtually every shape:
//   blurRad=57150 EMU = 4.5 pt, dist=50800 EMU = 4 pt, dir=270° (upward),
//   alpha 100% — color = the shape's own color.
// pptxgenjs mutates option objects in place, so each shape needs a fresh one.
// ---------------------------------------------------------------------------
const shadowSpec = (color, opts) => {
  opts = opts || {};
  return {
    type: "outer",
    color: color,
    blur: opts.blur != null ? opts.blur : 4.5,   // pt
    offset: opts.offset != null ? opts.offset : 4, // pt (must be non-negative)
    angle: 270,                                   // shadow falls upward
    opacity: opts.opacity != null ? opts.opacity : 1.0,
  };
};
const cyanShadow    = (opts) => shadowSpec(C.cyan,    opts);
const magentaShadow = (opts) => shadowSpec(C.magenta, opts);
const whiteShadow   = (opts) => shadowSpec(C.cyan,    opts); // white text glows cyan in this deck

const pres = new pptxgen();
pres.defineLayout({ name: "TRON", width: SLIDE_W, height: SLIDE_H });
pres.layout = "TRON";
pres.title = "NeonGrid — Series A";
pres.author = "Gridline Ventures";

// ---------------------------------------------------------------------------
// CHROME — top/bottom L-brackets, top tags, footer, page number.
// Reference: brackets are drawn as two short LINEs in the top/bottom corners
// at exact 0.4" inset.
// ---------------------------------------------------------------------------
function addChrome(slide, opts) {
  opts = opts || {};
  slide.background = { color: C.bg };

  const inset = 0.45;
  const armLen = 0.30;

  // Top-left
  slide.addShape(pres.shapes.LINE, {
    x: inset, y: inset, w: armLen, h: 0,
    line: { color: C.fgDim, width: 1.0 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: inset, y: inset, w: 0, h: armLen,
    line: { color: C.fgDim, width: 1.0 },
  });
  // Top-right
  slide.addShape(pres.shapes.LINE, {
    x: SLIDE_W - inset - armLen, y: inset, w: armLen, h: 0,
    line: { color: C.fgDim, width: 1.0 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: SLIDE_W - inset, y: inset, w: 0, h: armLen,
    line: { color: C.fgDim, width: 1.0 },
  });
  // Bottom-left
  slide.addShape(pres.shapes.LINE, {
    x: inset, y: SLIDE_H - inset, w: armLen, h: 0,
    line: { color: C.fgDim, width: 1.0 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: inset, y: SLIDE_H - inset - armLen, w: 0, h: armLen,
    line: { color: C.fgDim, width: 1.0 },
  });
  // Bottom-right
  slide.addShape(pres.shapes.LINE, {
    x: SLIDE_W - inset - armLen, y: SLIDE_H - inset, w: armLen, h: 0,
    line: { color: C.fgDim, width: 1.0 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: SLIDE_W - inset, y: SLIDE_H - inset - armLen, w: 0, h: armLen,
    line: { color: C.fgDim, width: 1.0 },
  });

  // Top-left tag
  if (opts.tagL) {
    slide.addText(opts.tagL, {
      x: 0.95, y: 0.32, w: 9, h: 0.4,
      fontFace: FONT, fontSize: 11, color: C.fgDim,
      charSpacing: 6, align: "left", valign: "middle", margin: 0,
    });
  }
  // Top-right tag
  if (opts.tagR) {
    slide.addText(opts.tagR, {
      x: SLIDE_W - 9.95, y: 0.32, w: 9, h: 0.4,
      fontFace: FONT, fontSize: 11, color: C.fgDim,
      charSpacing: 6, align: "right", valign: "middle", margin: 0,
    });
  }
  // Bottom-left footer
  if (opts.footL) {
    slide.addText(opts.footL, {
      x: 0.95, y
```