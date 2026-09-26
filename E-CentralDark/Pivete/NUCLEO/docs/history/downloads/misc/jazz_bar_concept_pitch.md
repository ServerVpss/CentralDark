# OUTRO - jazz_bar_concept_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\jazz_bar_concept_pitch.js
**SHA:** 215608f6d1c12b51
**Timestamp:** 2026-08-28T02:52:35.454208
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const colGap = 0.5;
- const gap = 0.45;
- const colGap = 0.55;
- const gap = 0.18;
- const colGap = 0.55;
- const gap = 0.5;

### Ouro Bruto (primeiros 5000 chars)
```
// Cool Breeze — A Jazz Bar in New York
// PPTX recreation of Cool_Breeze.html using pptxgenjs

const pptxgen = require("pptxgenjs");

// ===== SETUP =====
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"  (matches 1920x1080 aspect 16:9)
pres.title = "Cool Breeze — A Jazz Bar in New York";
pres.author = "Cool Breeze NYC";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ===== COLORS (from CSS variables) =====
const C = {
  ink:        "0B0907",
  ink2:       "110D0A",
  ink3:       "1A1410",
  cream:      "F0E6D2",
  creamDim:   "C9BFA9",
  creamLow:   "6E6553",
  brass:      "C9A35C",
  brassDeep:  "8E6F33",
  ember:      "D8693A",
};

// ===== FONTS =====
// Use exact CSS font-family names; user has these installed.
const FONT = {
  display: "Limelight",                  // headings
  serif:   "Cormorant Garamond",         // body
  mono:    "JetBrains Mono",             // accent labels
};

// ===== LAYOUT METRICS =====
// Scale: HTML uses 80px top/bottom, 96px left/right at ~1920x1080.
// pad inset = 80px/96px → with 13.333" wide slide: 96px/1920 * 13.333 ≈ 0.667"
//   80px/1080 * 7.5  ≈ 0.556"
const PAD_X = 0.667;       // left/right inset for content
const PAD_Y = 0.556;       // top/bottom inset for content
const CHROME_TOP = 0.389;  // 56px from top → 56/1080*7.5
const CHROME_BOT = SLIDE_H - 0.389;
const MARK_TOP = 0.264;    // 38px → 38/1080*7.5
const MARK_BOT = SLIDE_H - 0.264;
const CHROME_LEFT = 0.667;
const CHROME_RIGHT = SLIDE_W - 0.667;

// ===== HELPERS =====
function addBackground(slide) {
  slide.background = { color: C.ink };
}

// Top + bottom thin brass rules (chrome).
// HTML uses linear-gradient transparent→brassDeep→transparent with very thin (1px) line.
// We approximate with a thin solid line; gradient tips would barely render.
function addChrome(slide) {
  // Top rule
  slide.addShape(pres.shapes.LINE, {
    x: CHROME_LEFT,
    y: CHROME_TOP,
    w: CHROME_RIGHT - CHROME_LEFT,
    h: 0,
    line: { color: C.brassDeep, width: 0.5 },
  });
  // Bottom rule
  slide.addShape(pres.shapes.LINE, {
    x: CHROME_LEFT,
    y: CHROME_BOT,
    w: CHROME_RIGHT - CHROME_LEFT,
    h: 0,
    line: { color: C.brassDeep, width: 0.5 },
  });
}

// 4 corner mono-sm marks
function addMarks(slide, tl, tr, bl, br) {
  const baseProps = {
    fontFace: FONT.mono,
    fontSize: 8,
    charSpacing: 4,        // ≈ 0.18em letter-spacing
    color: C.creamLow,
    h: 0.25,
    margin: 0,
  };
  const baseW = 4.0;
  // top-left
  slide.addText(tl, {
    ...baseProps, x: PAD_X, y: MARK_TOP - 0.07, w: baseW, align: "left",
  });
  // top-right (brass color per CSS)
  slide.addText(tr, {
    ...baseProps, color: C.brass, x: SLIDE_W - PAD_X - baseW, y: MARK_TOP - 0.07, w: baseW, align: "right",
  });
  // bottom-left
  slide.addText(bl, {
    ...baseProps, x: PAD_X, y: MARK_BOT - 0.18, w: baseW, align: "left",
  });
  // bottom-right
  slide.addText(br, {
    ...baseProps, x: SLIDE_W - PAD_X - baseW, y: MARK_BOT - 0.18, w: baseW, align: "right",
  });
}

// Photo block with subtle brass border (replicates .placeholder.photo)
function addPhoto(slide, imgPath, x, y, w, h) {
  // Border frame (very subtle, brass at low alpha — solid thin line approximates it)
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.ink },
    line: { color: C.brassDeep, width: 0.5 },
  });
  slide.addImage({
    path: imgPath,
    x: x + 0.02, y: y + 0.02, w: w - 0.04, h: h - 0.04,
    sizing: { type: "cover", w: w - 0.04, h: h - 0.04 },
  });
}

// ============================================================
// SLIDE 1 — COVER
// ============================================================
function buildCover() {
  const s = pres.addSlide();
  addBackground(s);
  addChrome(s);
  addMarks(s, "EST · MMXXVI", "NEW YORK CITY", "A LISTENING ROOM", "№ 01 / 09");

  // Eyebrow "A J A Z Z B A R" — wide tracking
  s.addText("A   J A Z Z   B A R", {
    x: 0, y: 1.7, w: SLIDE_W, h: 0.35,
    fontFace: FONT.mono, fontSize: 11, color: C.brass,
    charSpacing: 12,
    align: "center",
    margin: 0,
  });

  // COOL  (line 1)
  s.addText("COOL", {
    x: 0, y: 2.15, w: SLIDE_W, h: 1.3,
    fontFace: FONT.display, fontSize: 110, color: C.cream,
    align: "center", valign: "middle",
    charSpacing: 2,
    margin: 0,
  });

  // & ampersand (line 2) — brass, italic Cormorant
  s.addText("&", {
    x: 0, y: 3.4, w: SLIDE_W, h: 1.0,
    fontFace: FONT.serif, fontSize: 90, color: C.brass,
    italic: true,
    align: "center", valign: "middle",
    margin: 0,
  });

  // BREEZE (line 3)
  s.addText("BREEZE", {
    x: 0, y: 4.25, w: SLIDE_W, h: 1.3,
    fontFace: FONT.display, fontSize: 110, color: C.cream,
    align: "center", valign: "middle",
    charSpacing: 2,
    margin: 0,
  });

  // Brass rule under title
  s.addShape(pres.shapes.LINE, {
    x: SLIDE_W/2 - 1.0, y: 5.75, w: 2.0, h: 0,
    line: { color: C.brass, width: 0.75 },
  });

  // Tagline
  s.addText("Saxophone, six strings, & somethi
```