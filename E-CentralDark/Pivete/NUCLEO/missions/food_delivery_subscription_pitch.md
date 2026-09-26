# MISSAO - food_delivery_subscription_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\food_delivery_subscription_pitch.js
**SHA:** b1227d5e86853156
**Timestamp:** 2026-08-28T02:52:34.633254
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let sawRun = false;
- sawRun = true;

### Gaps
- const colGap = 0.4;
- const gridGap = px(20);
- const gap = px(24);
- const colGap = px(60);
- const hoodH = px(32), hoodGap = px(8), rowGap = px(10);
- const gap = px(18);
- const gap = px(20);
- const colGap = px(60);
- const sGap = px(20);
- const gap = px(20);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * K-Bops Deck → PPTX (pptxgenjs)
 *
 * Recreates the 10-slide K-Bops kimbap subscription deck from K-Bops_Deck.html
 * as a native .pptx file. Canvas is 1920×1080 (design) mapped to a 19.20 × 10.80
 * inch custom PowerPoint layout — 1" = 100px. Every px/pt value in the HTML is
 * divided by 100 to get inches, and font-sizes are scaled px → pt via × 0.75.
 *
 * Fonts preserved exactly as authored: "Bricolage Grotesque", "DM Mono",
 * "Fraunces". The user confirmed they have these installed locally.
 *
 * Usage:  node kbops-deck.js  → writes K-Bops_Deck.pptx in cwd.
 */

const pptxgen = require("pptxgenjs");

// ── Palette ──────────────────────────────────────────────────────────────
// OKLCH values in the source resolved to sRGB hex:
const C = {
  paper:   "F5EFE4",
  ink:     "151413",
  inkSoft: "2A2724",
  kimchi:  "E24A3F",   // oklch(0.62 0.19 28)
  nori:    "137D41",   // oklch(0.52 0.13 152)
  dan:     "ECBF00",   // oklch(0.82 0.17 92)
  sky:     "43B2E1",   // oklch(0.72 0.12 230)
  // muted/tint backgrounds used by the photo placeholders
  photoBg: "E8DFCE",
  photoHot:   "F2D8C4",
  photoFresh: "D9E4CF",
  photoMild:  "F2E8C4",
  photoCool:  "D0DEE4",
  photoPink:  "E8D5DD",
  step2Bg:    "E8DFCE",
};

// ── Fonts (DO NOT CHANGE — user has these installed) ─────────────────────
const F = {
  sans:  "Bricolage Grotesque",
  mono:  "DM Mono",
  serif: "Fraunces",
};

// ── Geometry helpers: px → inches (1" = 96px, the CSS default) ──────────
// At 96 DPI: px → inches = px/96, and px → points = px × 0.75.
const px  = (v) => v / 96;
const pt  = (v) => v * 0.75;          // px → pt for font sizes

// Slide size
const W = 1920, H = 1080;
const SW = px(W), SH = px(H);

// Outer "frame" inset — most slides use inset:50px 60px 40px (top, R/L, bottom)
// except s-cover which uses inset:50px (all sides)
const FRAME = { top: px(50), side: px(60), bottom: px(40) };
const COVER_FRAME = { top: px(50), side: px(50), bottom: px(50) };

// ── Init ─────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.title  = "K-Bops — Lunch Subscription";
pres.author = "K-Bops";
pres.defineLayout({ name: "KBOPS_1920", width: SW, height: SH });
pres.layout = "KBOPS_1920";

// ── Tiny helpers for the repeated chrome ─────────────────────────────────

// Logo mark: rotated-ish circle with "K". We render a circle + letter.
// Author rotation is -6deg; pptxgen supports rotate on shapes via `rotate`.
function addLogoMark(slide, { x, y, d = 0.36, bg = C.kimchi, fg = C.paper }) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: d, h: d,
    fill: { color: bg }, line: { color: bg, width: 0 },
    rotate: -6,
  });
  slide.addText("K", {
    x, y, w: d, h: d,
    fontFace: F.sans, fontSize: pt(18), bold: true,
    color: fg, align: "center", valign: "middle",
    margin: 0, rotate: -6,
  });
}

// Horizontal divider line (1.5px weight in HTML → ~1pt)
function addHRule(slide, { x, y, w, color = C.ink }) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: 1.1 },
  });
}

// Vertical divider line
function addVRule(slide, { x, y, h, color = C.ink }) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w: 0, h,
    line: { color, width: 1.1 },
  });
}

// Thin rectangular border (1.5px) that contains nothing — used for cards.
function addBorderedRect(slide, opts) {
  const { x, y, w, h, fill = C.paper, stroke = C.ink } = opts;
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: stroke, width: 1.1 },
  });
}

// Diagonal-hatch photo placeholder: solid tinted fill + a bottom-left caption
// label + an optional top-right dark corner tag.
function addPhoto(slide, { x, y, w, h, bg = C.photoBg, label, corner, hasBorder = true, darkCaption = false }) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: bg },
    line: hasBorder ? { color: C.ink, width: 1.1 } : { type: "none" },
  });
  // Subtle diagonal "shot" texture, evoked by a thin diagonal line.
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h,
    line: { color: C.ink, width: 0.5, transparency: 90 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: x + w * 0.35, y, w: w * 0.65, h,
    line: { color: C.ink, width: 0.5, transparency: 92 },
  });
  if (label) {
    slide.addText(label, {
      x: x + 0.14, y: y + h - 0.34, w: w - 0.28, h: 0.28,
      fontFace: F.mono, fontSize: pt(13),
      color: darkCaption ? C.ink : C.ink, transparency: 30,
      charSpacing: 1.3,
      align: "left", valign: "middle", margin: 0,
    });
  }
  if (corner) {
    const cw = 0.28, ch = 0.22;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + w - cw - 0.14, y: y + 0.14, w: cw, h: ch,
      fill: { color: C.ink }, line: { color: C.ink, width: 0 },
    });
    slide.addText(corner, {
      x: x + w - cw - 0.14, y: y + 0.14, w: cw, h: ch,
      fontFace: F.mono, fontSize: pt(12), color: C.paper,
      align: "center", valign: "middle", margin: 0, charSp
```