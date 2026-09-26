# OUTRO - fitness_personal_training_keynote.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\fitness_personal_training_keynote.js
**SHA:** 7123c8cdb70506a4
**Timestamp:** 2026-08-28T02:52:34.477402
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node flex_presentation.js

### Gaps
- const colGap = 0.4;
- const gap    = 0.22;

### Ouro Bruto (primeiros 5000 chars)
```
// FLEX — Personal Training Conference Keynote Deck
// Generates a replica of the 8-slide keynote using pptxgenjs.
//
// Run:  node flex_presentation.js
// Outputs: flex_personal_training.pptx

const pptxgen = require("pptxgenjs");

// ---------- Design tokens ----------
const COLOR_BG      = "0A0A0A"; // near-black slide background
const COLOR_TEXT    = "F0EDE4"; // warm off-white (primary text)
const COLOR_MUTED   = "6B6B6B"; // muted gray (labels / metadata)
const COLOR_MUTED_2 = "8A8A8A"; // slightly brighter muted gray
const COLOR_ACCENT  = "C5F000"; // signature lime / chartreuse
const COLOR_STRIKE  = "6B6B6B"; // strike-through "LOSE WEIGHT FAST"
const COLOR_DIV     = "2A2A2A"; // thin divider lines
const COLOR_BLACK   = "0A0A0A"; // text on lime background

const FONT_HEAD = "Arial";   // big display type
const FONT_BODY = "Calibri"; // body copy

// ---------- Layout ----------
// LAYOUT_WIDE is 13.333" x 7.5" (16:9 at higher px)
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN  = 0.6;  // outer page margin

// ---------- Reusable chrome (top bar / footer) ----------
// The top bar is where the "FLEX" wordmark lives.  On the original render
// the box was too narrow and the word wrapped ("FL" on one line, "EX" on
// the next).  We give it a generous width here so "FLEX" always fits on
// one line, regardless of character spacing.
function addTopBar(slide, sectionLabel) {
  // FLEX wordmark (top-left) — wide box, no wrap, no internal margin so it
  // aligns flush with the left page margin.
  slide.addText("FLEX", {
    x: MARGIN, y: 0.45, w: 3.0, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 14, bold: true,
    color: COLOR_TEXT, charSpacing: 4,
    align: "left", valign: "middle", margin: 0,
    wrap: false,
  });

  // Section label (top-right) — e.g. "02 / 08 — ORIGIN"
  if (sectionLabel) {
    slide.addText(sectionLabel, {
      x: SLIDE_W - MARGIN - 4.0, y: 0.45, w: 4.0, h: 0.45,
      fontFace: FONT_HEAD, fontSize: 11,
      color: COLOR_MUTED_2, charSpacing: 3,
      align: "right", valign: "middle", margin: 0,
    });
  }
}

function addFooter(slide, leftText) {
  if (leftText) {
    slide.addText(leftText, {
      x: MARGIN, y: SLIDE_H - 0.75, w: 8.0, h: 0.35,
      fontFace: FONT_HEAD, fontSize: 10,
      color: COLOR_MUTED, charSpacing: 3,
      align: "left", valign: "middle", margin: 0,
    });
  }
  slide.addText("FLEX / 2026", {
    x: SLIDE_W - MARGIN - 3.0, y: SLIDE_H - 0.75, w: 3.0, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 10,
    color: COLOR_MUTED, charSpacing: 3,
    align: "right", valign: "middle", margin: 0,
  });
}

// ============================================================
// Build presentation
// ============================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "FLEX — Personal Training";
pres.author = "FLEX";

// ------------------------------------------------------------
// SLIDE 1 — Cover
// ------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: COLOR_BG };

  // Top bar (custom — different from the chrome on 2-8)
  s.addText("FLEX — PERSONAL TRAINING", {
    x: MARGIN, y: 0.45, w: 6.0, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 13,
    color: COLOR_TEXT, charSpacing: 4,
    align: "left", valign: "middle", margin: 0,
    wrap: false,
  });
  s.addText("TAMPA, FL  ·  WORLDWIDE", {
    x: SLIDE_W - MARGIN - 5.0, y: 0.45, w: 5.0, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 13,
    color: COLOR_TEXT, charSpacing: 4,
    align: "right", valign: "middle", margin: 0,
  });

  // Tagline (left)
  s.addText("BODY RECOMPOSITION", {
    x: MARGIN, y: 1.85, w: 6.0, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 15, bold: true,
    color: COLOR_ACCENT, charSpacing: 4,
    align: "left", valign: "middle", margin: 0,
  });

  // Stats (right column)
  const statsX = SLIDE_W - MARGIN - 4.5;
  s.addText([
    { text: "200+ ", options: { bold: true, color: COLOR_TEXT } },
    { text: "CLIENTS",    options: { color: COLOR_MUTED_2 } },
  ], {
    x: statsX, y: 1.85, w: 4.5, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 14, charSpacing: 3,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "60 ", options: { bold: true, color: COLOR_TEXT } },
    { text: "COUNTRIES", options: { color: COLOR_MUTED_2 } },
  ], {
    x: statsX, y: 2.35, w: 4.5, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 14, charSpacing: 3,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText([
    { text: "1 ", options: { bold: true, color: COLOR_TEXT } },
    { text: "COACH",    options: { color: COLOR_MUTED_2 } },
  ], {
    x: statsX, y: 2.85, w: 4.5, h: 0.45,
    fontFace: FONT_HEAD, fontSize: 14, charSpacing: 3,
    align: "right", valign: "middle", margin: 0,
  });

  // Big FLEX. wordmark — the period is rendered in accent lime as a
  // rich-text run so it scales and positions with the rest of the word
  // (no need for a hand-placed acc
```