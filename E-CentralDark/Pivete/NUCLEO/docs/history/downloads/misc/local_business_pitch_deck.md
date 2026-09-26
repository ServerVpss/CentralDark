# OUTRO - local_business_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\local_business_pitch_deck.js
**SHA:** e0be9465836bab52
**Timestamp:** 2026-08-28T02:52:35.533072
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node hope_valley_dreamery.js

### Gaps
- const cardW = 3.95, cardH = 3.4, gap = 0.15, startX = 0.6, startY = 3.3;
- const smallX = 9.95, smallY = 1.75, smallW = 1.45, smallH = 2.25, smallGap = 0.12;
- const startX = 4.25, startY = 1.0, cardW = 4.3, cardH = 2.85, gap = 0.15;
- const sx = 0.6, sy = 3.75, cardW = 3.0, cardH = 3.5, gap = 0.15;
- const sx = 0.6, sy = 4.15, colW = 3.0, gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreates "Hope Valley Dreamery" pitch deck using pptxgenjs
// Run: node hope_valley_dreamery.js
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Hope Valley Dreamery";
pres.author = "Hope Valley Dreamery";

// --- Palette (extracted from original) ---
const C = {
  cream:     "FBF6EE", // main background
  pinkBg:    "FADDDD", // slide 1 bg, card
  pinkCard:  "F5C6C6", // pink card fill
  mint:      "D9EFE5", // slide 6 left panel, mint card
  mintDeep:  "BEE3D4", // mint card
  yellow:    "FBECC2", // yellow card
  yellowAcc: "F5DFA1", // bright accent circle
  blue:      "C9DDEB", // blue card
  sand:      "F3EADB", // sand card
  brownDark: "3D2E26", // main dark text
  brownMid:  "6B5849", // body text muted
  red:       "B85C5C", // accent red
  white:     "FFFFFF",
};

const FONT_HEAD = "Arial";
const FONT_BODY = "Arial";

// Slide dims
const W = 13.333;
const H = 7.5;

// ----- Header / Footer helpers -----
function addHeader(slide, sectionLabel) {
  slide.addText("HOPE VALLEY DREAMERY", {
    x: 0.6, y: 0.3, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 10, bold: true,
    color: C.brownMid, charSpacing: 4, margin: 0,
  });
  slide.addText(sectionLabel, {
    x: W - 6 - 0.6, y: 0.3, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 10, bold: true,
    color: C.brownMid, charSpacing: 4, align: "right", margin: 0,
  });
}

// =================================================================
// SLIDE 1 — Title
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.pinkBg };

  // Three small dots + brand name
  s.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.57, w: 0.13, h: 0.13, fill: { color: C.pinkCard }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: 0.78, y: 0.57, w: 0.13, h: 0.13, fill: { color: C.mintDeep }, line: { type: "none" } });
  s.addShape(pres.shapes.OVAL, { x: 0.96, y: 0.57, w: 0.13, h: 0.13, fill: { color: C.yellowAcc }, line: { type: "none" } });
  s.addText("Hope Valley Dreamery", {
    x: 1.2, y: 0.45, w: 5, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.brownDark, margin: 0,
  });

  // Eyebrow
  s.addText("A NEIGHBORHOOD ICE CREAM SHOP", {
    x: 0.6, y: 1.45, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.red, charSpacing: 6, margin: 0,
  });

  // Big title
  s.addText("Hope Valley\nDreamery.", {
    x: 0.6, y: 1.9, w: 6.5, h: 2.5,
    fontFace: FONT_HEAD, fontSize: 64, bold: true, color: C.brownDark, margin: 0,
  });

  // Subtitle
  s.addText("A small, warm place for our corner of Durham — built by neighbors, for neighbors.", {
    x: 0.6, y: 4.65, w: 4.2, h: 1.3,
    fontFace: FONT_BODY, fontSize: 15, color: C.brownMid, margin: 0,
  });

  // Footer line
  s.addText("Friends & family preview · Spring 2026", {
    x: 0.6, y: 6.85, w: 6, h: 0.35,
    fontFace: FONT_BODY, fontSize: 12, color: C.brownMid, margin: 0,
  });

  // Hero photo placeholder (right side, mint rounded rect)
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7.1, y: 0.55, w: 5.6, h: 6.4,
    fill: { color: C.mint }, line: { color: C.mintDeep, width: 1 }, rectRadius: 0.1,
  });
  s.addText("HERO PHOTO", {
    x: 7.1, y: 3.5, w: 5.6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.brownMid, align: "center", charSpacing: 4, margin: 0,
  });
  s.addText("waffle cone, kids on the sidewalk, golden-hour light", {
    x: 7.1, y: 3.9, w: 5.6, h: 0.35,
    fontFace: FONT_BODY, fontSize: 13, color: C.brownMid, align: "center", margin: 0,
  });

  // Yellow "opening on Garrett Rd" circle (top-right of photo)
  s.addShape(pres.shapes.OVAL, {
    x: 11.5, y: 0.15, w: 1.7, h: 1.7,
    fill: { color: C.yellowAcc }, line: { type: "none" },
    shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 90, opacity: 0.12 },
  });
  s.addText("opening\non Garrett Rd", {
    x: 11.5, y: 0.55, w: 1.7, h: 0.95,
    fontFace: FONT_BODY, fontSize: 13, color: C.brownDark, align: "center", valign: "middle", margin: 0,
  });
}

// =================================================================
// SLIDE 2 — The Idea
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  addHeader(s, "02 · THE CONCEPT");

  s.addText("THE IDEA", {
    x: 0.6, y: 1.35, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true, color: C.red, charSpacing: 6, margin: 0,
  });
  s.addText("A neighborhood ice cream shop — and not much more than that.", {
    x: 0.6, y: 1.8, w: 6.5, h: 2.9,
    fontFace: FONT_HEAD, fontSize: 42, bold: true, color: C.brownDark, margin: 0,
  });
  s.addText("A small counter, a short menu done really well, a few tables inside, benches out front. The kind of place a ten-year-old can walk to on a Friday night.", {
    x: 0.6, y: 4.75, w: 5.5, h: 1.7,
    fontFace: FONT_BODY, fontSize: 16, colo
```