# OUTRO - youtube_channel_media_kit.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\youtube_channel_media_kit.js
**SHA:** 39c4feff5745428a
**Timestamp:** 2026-08-28T02:52:38.056417
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const barStart = cardsTop + 160;
- const recStart = rightY + 90;

### Gaps
- const gap      = 32;
- const gap = 22;
- const boxGap = 22;
- const gap = 18;
- const gap = 28;
- const mGap = 20;
- const chipW = 220, chipH = 38, chipGap = 14;

### Ouro Bruto (primeiros 5000 chars)
```
// build.js
// Recreates Fun_Bite_Advertising_Deck.html as a .pptx using pptxgenjs.
// Slide canvas in the source HTML is 1920 x 1080 px. We use LAYOUT_WIDE
// (13.333" x 7.5") and convert all pixel coords via PX().

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Fun Bite · Advertising Opportunities 2026";
pres.author = "Fun Bite";

// ---- Conversion helper: 1920 px -> 13.333 in ----
const SCALE = 13.333 / 1920; // ~0.006944
const PX = (v) => +(v * SCALE).toFixed(4);

// ---- Palette (from CSS variables) ----
const C = {
  paper:    "F6F1E6",
  paper2:   "EFE7D3",
  ink:      "141210",
  inkSoft:  "2A2722",
  muted:    "6B6358",
  red:      "EF3B2C",
  redInk:   "B8281C",
  butter:   "F4C430",
  mint:     "8FE3B4",
  sky:      "B8D8F2",
  paperDim: "9A9186", // the #9A9186 muted-on-dark color used in the deck
  paperLt:  "C8C0B2", // #C8C0B2 used on dark tiles
  paperE7:  "E7E0D3",
};

// ---- Font families used in the original deck ----
const F = {
  display: "Boldonse",      // display / headlines
  body:    "Inter",         // body copy
  mono:    "JetBrains Mono",// labels, eyebrows, meta
};

// ===================================================================
// Helper builders shared across slides
// ===================================================================

// Top bar: brand mark + meta text — matches .topbar markup in HTML
// Uses absolute pixel coords from the .frame (inset 70px 90px) rules.
function addTopBar(slide, metaText, opts = {}) {
  const leftPx  = 90;
  const rightPx = 90;
  const topPx   = 70;
  const brandSize = 30; // the .sq square size
  const brandY    = topPx;

  // Red square logo mark
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: PX(leftPx),
    y: PX(brandY),
    w: PX(brandSize),
    h: PX(brandSize),
    fill:   { color: opts.squareFill || C.red },
    line:   { color: opts.squareFill || C.red, width: 0 },
    rectRadius: 0.06,
  });
  // Little triangle cut-out (▶ play arrow) inside the square.
  // We approximate the clip-path polygon(0 0, 100% 50%, 0 100%) by a
  // rotated rectangle is fiddly — instead we add a filled triangle via freeform.
  slide.addShape(pres.shapes.RIGHT_TRIANGLE, {
    x: PX(leftPx + 10),
    y: PX(brandY + 8),
    w: PX(14),
    h: PX(14),
    fill: { color: opts.triFill || C.paper },
    line: { color: opts.triFill || C.paper, width: 0 },
    rotate: 90,
  });

  // Brand wordmark
  slide.addText("Fun Bite", {
    x: PX(leftPx + brandSize + 14),
    y: PX(brandY - 4),
    w: PX(300),
    h: PX(40),
    fontFace: F.display,
    fontSize: 18,
    color: opts.brandColor || C.ink,
    margin: 0,
    valign: "middle",
  });

  // Meta text on the right
  slide.addText(metaText, {
    x: PX(1920 - rightPx - 800),
    y: PX(brandY + 6),
    w: PX(800),
    h: PX(28),
    fontFace: F.mono,
    fontSize: 11,
    color: opts.metaColor || C.muted,
    charSpacing: 1.2,
    align: "right",
    valign: "middle",
    margin: 0,
  });

  // Horizontal divider under the top bar (1.5px solid --ink)
  slide.addShape(pres.shapes.LINE, {
    x: PX(leftPx),
    y: PX(topPx + 54),
    w: PX(1920 - leftPx - rightPx),
    h: 0,
    line: { color: opts.lineColor || C.ink, width: 1.5 },
  });
}

// Footer marks used on content slides (left footmark + right page number)
function addFoot(slide, footText, pageText, opts = {}) {
  slide.addText(footText, {
    x: PX(90),
    y: PX(1080 - 66),
    w: PX(1000),
    h: PX(22),
    fontFace: F.mono,
    fontSize: 10,
    color: opts.color || C.muted,
    charSpacing: 1.2,
    valign: "middle",
    margin: 0,
  });
  slide.addText(pageText, {
    x: PX(1920 - 90 - 200),
    y: PX(1080 - 66),
    w: PX(200),
    h: PX(22),
    fontFace: F.mono,
    fontSize: 10,
    color: opts.color || C.muted,
    charSpacing: 1.2,
    align: "right",
    valign: "middle",
    margin: 0,
  });
}

// "Eyebrow": tiny uppercase mono label
function addEyebrow(slide, x, y, w, text, color = C.muted) {
  slide.addText(text.toUpperCase(), {
    x: PX(x), y: PX(y), w: PX(w), h: PX(24),
    fontFace: F.mono,
    fontSize: 11,
    color,
    charSpacing: 2.5,
    margin: 0,
    valign: "middle",
  });
}

// ===================================================================
// SLIDE 1 — COVER
// ===================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: C.ink };

  // Radial-gradient hotspots (approximated with big transparent ovals)
  s.addShape(pres.shapes.OVAL, {
    x: PX(1920 * 0.85 - 600), y: PX(1080 * 1.1 - 400),
    w: PX(1200), h: PX(800),
    fill: { color: C.red, transparency: 72 },
    line: { color: C.red, width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: PX(1920 * 0.10 - 400), y: PX(-300),
    w: PX(800), h: PX(600),
    fill: { color: C.butter, transparency: 88 },
    line: { color: C.butter, width: 0 },
  });

  // ---- Top bar (cover variant: light t
```