# MISSAO - bagel_shop_menu_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\bagel_shop_menu_pitch_deck.js
**SHA:** 6e3f941775077f02
**Timestamp:** 2026-08-28T02:52:32.368931
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const rowStart = 3.45;
- const sYStart = 4.1;

### Gaps
- const colGap = 0.3;
- const stepGap = 0.25;
- const cardW = 3.95, cardGap = 0.15;
- const bW = 3.95, bGap = 0.15, bX0 = 0.75, bY = 4.3, bH = 2.5;
- const iX0 = 0.75, iY0 = 5.0, iColW = 2.95, iColGap = 0.3, iRowH = 1.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Bagels & Schmear Co. — Spring 2026 Menu
// Replica of Bagels.pptx built with pptxgenjs
//
// Usage: node bagels.js
// Output: Bagels.pptx in the current working directory

const pptxgen = require("pptxgenjs");

// ---------- Design tokens ----------
const CREAM      = "F2EAD8"; // main light background
const DARK       = "1B1410"; // near-black, text + dark slides
const BROWN      = "3A2C22"; // body text on cream
const RED        = "C23A2A"; // italic accent / dot / callouts
const GOLD       = "C8871F"; // caramel accent on dark slides
const AMBER      = "E8C582"; // warm yellow circle
const OCHRE      = "9A6512"; // small labels / dark-amber
const TAN        = "E2D6B8"; // placeholder image blocks on cream
const TAN_DARK   = "D9C99A"; // slightly deeper tan
const CORAL_BG   = "FBE8E2"; // very light coral tint (unused footer backups)
const TOMATO     = "C23A2A";

// Slide layout (13.33 x 7.5 inches — LAYOUT_WIDE)
const W = 13.33;
const H = 7.5;

const FONT_HEAD = "Arial";
const FONT_BODY = "Arial";

// ---------- Build presentation ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Bagels & Schmear Co.";
pres.title  = "Bagels & Schmear Co. — Spring 2026 Menu";

// ---------- Helpers ----------
// Top header bar that appears on every slide.
// `onDark` flips the text color for the dark slides (3 and 10).
function addHeader(slide, sectionLabel, pageLabel, onDark = false) {
  const textColor = onDark ? CREAM : DARK;
  // little red dot
  slide.addShape(pres.shapes.OVAL, {
    x: 0.55, y: 0.46, w: 0.1, h: 0.1,
    fill: { color: RED }, line: { type: "none" },
  });
  // section label (left)
  slide.addText(sectionLabel, {
    x: 0.75, y: 0.35, w: 5, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 10, bold: false,
    color: textColor, charSpacing: 4, margin: 0,
  });
  // page number (right)
  slide.addText(pageLabel, {
    x: W - 2.2, y: 0.35, w: 1.7, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 10,
    color: textColor, charSpacing: 4,
    align: "right", margin: 0,
  });
}

// A grey/tan "placeholder image" block with caption text
function addPlaceholder(slide, x, y, w, h, caption, fill = TAN) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: fill }, line: { type: "none" },
  });
  slide.addText(caption, {
    x, y, w, h,
    fontFace: FONT_BODY, fontSize: 12, color: BROWN,
    align: "center", valign: "middle",
  });
}

// Thin horizontal rule
function addRule(slide, x, y, w, color = DARK, weight = 1) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: weight },
  });
}

// ===================================================================
// SLIDE 1 — Cover
// ===================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: CREAM };
  addHeader(slide, "EST. 2026  ·  LOWER EAST SIDE", "NO. 01 / 10");

  // Big amber circle on right, partially off-slide
  slide.addShape(pres.shapes.OVAL, {
    x: 9.0, y: 3.2, w: 5.8, h: 5.8,
    fill: { color: AMBER }, line: { type: "none" },
  });

  // Small eyebrow
  slide.addText("A NEIGHBORHOOD MENU  ·  SPRING 2026", {
    x: 0.75, y: 1.4, w: 8, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 12, color: DARK,
    charSpacing: 4, margin: 0,
  });

  // Mega title — split across two lines as separate text boxes
  // Line 1: "Bagels &"
  slide.addText([
    { text: "Bagels ", options: { color: DARK } },
    { text: "&",       options: { color: RED, italic: true } },
  ], {
    x: 0.7, y: 1.85, w: 12, h: 1.9,
    fontFace: FONT_HEAD, fontSize: 110, bold: false,
    color: DARK, margin: 0, valign: "top",
  });
  // Line 2: "Schmear Co."
  slide.addText([
    { text: "Schmear", options: { color: RED, italic: true } },
    { text: " Co.",    options: { color: DARK } },
  ], {
    x: 0.7, y: 3.55, w: 12, h: 1.9,
    fontFace: FONT_HEAD, fontSize: 110, bold: false,
    color: DARK, margin: 0, valign: "top",
  });

  // Short rule + tagline (left)
  slide.addShape(pres.shapes.LINE, {
    x: 0.75, y: 6.2, w: 1.0, h: 0,
    line: { color: DARK, width: 1 },
  });
  slide.addText("Hand-rolled, kettle-boiled, wood-floor oven. For the block.", {
    x: 0.75, y: 6.35, w: 4.6, h: 0.9,
    fontFace: FONT_BODY, fontSize: 16, italic: true,
    color: DARK, margin: 0,
  });

  // Right-side meta (three lines, right-aligned)
  slide.addText(
    "137 ESSEX ST  OPEN 6 AM\nDAILY  CASH OR CARD  ·  NO\nAPPS",
    {
      x: 6.5, y: 6.55, w: 5.6, h: 0.9,
      fontFace: FONT_HEAD, fontSize: 10, color: DARK,
      charSpacing: 4, align: "right", valign: "top", margin: 0,
    }
  );
}

// ===================================================================
// SLIDE 2 — About
// ===================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: CREAM };
  addHeader(slide, "ABOUT", "02 / 10");

  // Small eyebrow
  slide.addText("WHO WE ARE", {
    x: 0.75, y: 0.65, w: 5, h: 0.35,
  
```