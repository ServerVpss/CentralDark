# OUTRO - retail_bookstore_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\retail_bookstore_profile.js
**SHA:** 25c840b609c2aaa1
**Timestamp:** 2026-08-28T02:52:36.766548
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build.js

### Gaps
- const colW = 1.55, gap = 0.30;
- const colW = 1.85, gap = 0.20;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreate "Book_Shop__6_.pptx" — The Reading Room
// Run: node build.js
// Requires: npm install pptxgenjs
// The "images/" folder must contain image-1-1.png ... image-7-1.png
// (the seven illustrations extracted from the original deck).

const pptxgen = require("pptxgenjs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";          // 13.333" x 7.5" (16:9)
pres.title  = "The Reading Room";
pres.author = "The Reading Room";

// =============================================================
// Color palette (sampled from the original deck)
// =============================================================
const BG       = "F4ECE2";   // warm cream background
const INK      = "1F1A17";   // near-black title color
const ACCENT   = "C97B6E";   // dusty terracotta / coral
const ACCENT_D = "B25A4D";   // deeper terracotta
const MUTED    = "8C5A4A";   // brown body text
const SUBTLE   = "C8A99E";   // very muted brown for fine rules
const CARD_BG  = "EFE0D2";   // slightly darker cream for the card on slide 8

// Common geometry helpers
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const IMG = (n) => path.join(__dirname, "images", `image-${n}-1.png`);

// =============================================================
// Repeated chrome — header bar + footer with RR monogram
// =============================================================
function addHeader(slide, opts) {
  const left = opts.left || "THE READING ROOM";
  const right = opts.right || "";
  const showLeftBullet = opts.showLeftBullet !== false;

  // Top-left bullet dot
  if (showLeftBullet) {
    slide.addShape(pres.shapes.OVAL, {
      x: 0.83, y: 0.45, w: 0.07, h: 0.07,
      fill: { color: ACCENT }, line: { type: "none" }
    });
  }

  // Left header text
  slide.addText(left, {
    x: 0.99, y: 0.39, w: 3.5, h: 0.23,
    fontFace: "Inter", fontSize: 11, bold: false,
    color: MUTED, charSpacing: 4, margin: 0,
    valign: "middle"
  });

  // Right header text
  if (right) {
    slide.addText(right, {
      x: SLIDE_W - 5.0 - 0.6, y: 0.39, w: 5.0, h: 0.23,
      fontFace: "Inter", fontSize: 11,
      color: MUTED, charSpacing: 4, align: "right", margin: 0,
      valign: "middle"
    });
  }
}

function addFooter(slide, opts) {
  const left = opts.left || "";
  const pageRoman = opts.pageRoman; // e.g. "I. OF VIII"

  const yLine = 6.93;

  // Footer left text
  if (left) {
    slide.addText(left, {
      x: 0.83, y: 6.85, w: 3.5, h: 0.25,
      fontFace: "Inter", fontSize: 10,
      color: MUTED, charSpacing: 4, margin: 0, valign: "middle"
    });
  }

  // Center: small horizontal rule | (RR) | small horizontal rule
  const cxC = SLIDE_W / 2;
  // Left short rule
  slide.addShape(pres.shapes.LINE, {
    x: cxC - 1.10, y: yRule(yLine), w: 0.85, h: 0,
    line: { color: SUBTLE, width: 0.6 }
  });
  // Right short rule
  slide.addShape(pres.shapes.LINE, {
    x: cxC + 0.25, y: yRule(yLine), w: 0.85, h: 0,
    line: { color: SUBTLE, width: 0.6 }
  });
  // Monogram circle
  slide.addShape(pres.shapes.OVAL, {
    x: cxC - 0.21, y: yLine - 0.21, w: 0.42, h: 0.42,
    fill: { color: BG }, line: { color: SUBTLE, width: 0.75 }
  });
  // RR text inside
  slide.addText("RR", {
    x: cxC - 0.21, y: yLine - 0.21, w: 0.42, h: 0.42,
    fontFace: "Georgia", italic: true, fontSize: 11,
    color: MUTED, align: "center", valign: "middle", margin: 0
  });

  // Footer right text (page roman numeral)
  if (pageRoman) {
    slide.addText(pageRoman, {
      x: SLIDE_W - 4.0 - 0.6, y: 6.85, w: 4.0, h: 0.25,
      fontFace: "Inter", fontSize: 10,
      color: MUTED, charSpacing: 4, align: "right", margin: 0,
      valign: "middle"
    });
  }
}

// helper: y for a horizontal line at the *vertical center* of footer monogram
function yRule(yLine) { return yLine; }

// =============================================================
// Reusable: small "section eyebrow" — horizontal bar + label
// e.g. "—— THE CURATION", "—— FOR SCHOOLS"
// =============================================================
function addEyebrow(slide, x, y, label, opts) {
  opts = opts || {};
  const barW = opts.barW || 0.55;
  const barColor = opts.barColor || ACCENT;
  // Short bar
  slide.addShape(pres.shapes.LINE, {
    x: x, y: y + 0.115, w: barW, h: 0,
    line: { color: barColor, width: 1.25 }
  });
  // Label
  slide.addText(label, {
    x: x + barW + 0.18, y: y, w: 6, h: 0.27,
    fontFace: "Inter", fontSize: 12, bold: false,
    color: ACCENT, charSpacing: 5, margin: 0, valign: "middle"
  });
}

// =============================================================
// SLIDE 1 — Cover
// =============================================================
function buildSlide1() {
  const s = pres.addSlide();
  s.background = { color: BG };

  addHeader(s, {
    left: "THE READING ROOM",
    right: "MANHATTAN  ·  NYC"
  });

  // Top-center "№ I"
  s.addText("№ I", {
    x: SLIDE_W / 2 - 1, y: 0.39, w: 2, h: 0.23,
    fontFace: "Georgia", italic: true, fontSize: 11
```