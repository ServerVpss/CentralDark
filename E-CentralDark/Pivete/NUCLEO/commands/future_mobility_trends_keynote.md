# COMANDO - future_mobility_trends_keynote.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\future_mobility_trends_keynote.js
**SHA:** 0c5b701ec5e13304
**Timestamp:** 2026-08-28T02:52:34.692885
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node future_of_mobility.js

### Gaps
- const gap    = 0.04;
- const gap  = 0.15;
- const gap = 0.1;
- const gap = 0.15;
- const gap = 0.15;
- const gap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The Future of Mobility — Keynote
 * Complete pptxgenjs replica of future_of_mobility.pptx
 *
 * Run:  node future_of_mobility.js
 * Deps: npm install pptxgenjs
 *
 * Image assets are expected in ./images/ :
 *   image-1-1.jpeg   (slide 1  — Mustang / hero)
 *   image-3-1.png    (slide 3  — inflection chart)
 *   image-6-1.png    (slide 6  — S-curve chart)
 *   image-12-1.png   (slide 12 — sunset/car backdrop)
 *   image-14-1.png   (slide 14 — eVTOL technical diagram)
 *   image-15-1.jpeg  (slide 15 — architecture / rooftop backdrop)
 */

const PptxGenJS = require("pptxgenjs");

const pres = new PptxGenJS();
pres.layout = "LAYOUT_WIDE";                // 13.333 × 7.5 in — same 16:9 ratio as original
pres.title   = "The Future of Mobility";
pres.author  = "Keynote · April 2026";

// ---------------------------------------------------------------------------
//  DESIGN TOKENS
// ---------------------------------------------------------------------------
const C = {
  cream      : "F4EFE6",      // canonical light background
  creamSoft  : "EFE8DB",      // slide 15 card row hint
  ink        : "0A0E0F",      // near-black
  inkMute    : "3A3E3F",      // body text
  inkFaint   : "8A8E8F",      // micro captions / dividers
  lime       : "E8FF3C",      // signature accent
  red        : "D84315",      // secondary accent (stats, alerts)
  white      : "FFFFFF",
};

const F = {
  display : "Helvetica Neue",
  body    : "Helvetica Neue",
  mono    : "Helvetica Neue",
};

// Slide dimensions (LAYOUT_WIDE)
const W = 13.333;
const H = 7.5;

// ---------------------------------------------------------------------------
//  SHARED HELPERS
// ---------------------------------------------------------------------------
/** Top utility bar: page tag on left, deck title on right */
function addTopBar(slide, leftText, rightText = "THE FUTURE OF MOBILITY", onDark = false) {
  const color = onDark ? C.cream : C.ink;
  slide.addText(leftText, {
    x: 0.5, y: 0.25, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 9, color, charSpacing: 2,
    align: "left", valign: "middle",
  });
  slide.addText(rightText, {
    x: W - 6.5, y: 0.25, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 9, color, charSpacing: 2,
    align: "right", valign: "middle",
  });
}

/** Bottom utility bar: page numerator on left, section on right */
function addBottomBar(slide, page, section, onDark = false) {
  const color = onDark ? C.cream : C.ink;
  slide.addText(`${String(page).padStart(2, "0")} / 18`, {
    x: 0.5, y: H - 0.45, w: 3, h: 0.3,
    fontFace: F.body, fontSize: 9, color,
    align: "left", valign: "middle",
  });
  slide.addText(section, {
    x: W - 6.5, y: H - 0.45, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 9, color, charSpacing: 2,
    align: "right", valign: "middle",
  });
}

/** Small section eyebrow — lime on dark sections when needed */
function addEyebrow(slide, text, x, y, w, color = C.ink) {
  slide.addText(text, {
    x, y, w, h: 0.28,
    fontFace: F.body, fontSize: 10, color, charSpacing: 3, bold: false,
    valign: "top",
  });
}

// ===========================================================================
//  SLIDE 1 — HERO / TITLE
// ===========================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.ink };

  // Hero image full-bleed
  s.addImage({ path: "./images/image-1-1.jpeg", x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });

  // Dark-ish tint for contrast (subtle overlay)
  s.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: W, h: H,
    fill: { color: C.ink, transparency: 55 }, line: { type: "none" },
  });

  // Top bar (on dark)
  s.addText("KEYNOTE · APRIL 2026", {
    x: 0.5, y: 0.25, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 9, color: C.cream, charSpacing: 2,
    align: "left", valign: "middle",
  });
  s.addText("THE FUTURE OF MOBILITY", {
    x: W - 6.5, y: 0.25, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 9, color: C.cream, charSpacing: 2,
    align: "right", valign: "middle",
  });

  // Eyebrow
  s.addText("A KEYNOTE IN THREE PARTS", {
    x: 0.7, y: 2.85, w: 6, h: 0.3,
    fontFace: F.body, fontSize: 11, color: C.lime, charSpacing: 3,
    align: "left", valign: "middle",
  });

  // Hero title — "The Future of" + italic "of" + "Mobility"
  s.addText(
    [
      { text: "The Future ", options: { color: C.cream } },
      { text: "of",           options: { color: C.cream, italic: true } },
      { text: "\nMobility",   options: { color: C.cream } },
    ],
    {
      x: 0.7, y: 3.2, w: 10.5, h: 2.6,
      fontFace: F.display, fontSize: 82, bold: false,
      align: "left", valign: "top", charSpacing: -2,
    }
  );

  // Three parts footer links
  const parts = [
    { x: 0.7,  label: "I ELECTRIFICATION" },
    { x: 3.4,  label: "II AUTONOMY" },
    { x: 5.7,  label: "III THE THIRD DIMENSION" },
  ];
  parts.forEach(p => {
    s.addText(p.label, {
      x: p.x, y: 6.4, w: 3.2, h: 0.3,
      fontFace: F.body
```