# COMANDO - us_history_student_presentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\us_history_student_presentation.js
**SHA:** b93b19f9a5acc755
**Timestamp:** 2026-08-28T02:52:37.515192
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const axisStart = 1.5;
- const rowStart = (SLIDE_W - rowTotalW) / 2;

### Gaps
- const gap = 0.3;
- const cellGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Rebuild "Forging a Nation" presentation with pptxgenjs
// Faithful reproduction of Deliverable_7.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// Original slide size: 20" x 11.25" (custom, 16:9 extra-wide)
pres.defineLayout({ name: "CUSTOM_20x11", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11";
pres.title = "Forging a Nation";
pres.author = "The Student";

// ============================================================
// Design tokens — palette, fonts, helpers
// ============================================================

const C = {
  bg: "F2EAD8",        // cream paper
  panel: "EBE0C7",     // darker cream (plate panels)
  tan: "A89778",       // tan (plate borders, accents)
  ink: "1C1A15",       // near-black (titles)
  text: "3A332A",      // body text
  muted: "6B6253",     // secondary/label text
  red: "8A2A1F",       // oxblood accent
  gold: "8A6D2E",      // muted gold (rare)
  white: "FFFFFF",
};

const F = {
  sans: "Inter",              // body / headings (fallback: system sans)
  serif: "Cormorant Garamond", // italic display accents
  serifBody: "EB Garamond",
  mono: "IBM Plex Mono",       // (declared in original, not heavily used)
};

const SLIDE_W = 20;
const SLIDE_H = 11.25;

// -----------------------------------------------------------------
// Reusable chrome: outer frame + footer + page number
// -----------------------------------------------------------------
function addFrame(slide) {
  // outer thin rectangular border (inset from edges)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.6, y: 0.6, w: SLIDE_W - 1.2, h: SLIDE_H - 1.2,
    fill: { type: "solid", color: C.bg },
    line: { color: C.tan, width: 0.5 },
  });
}

function addFooter(slide, { brand = "FORGING A NATION", section = "", page = "" } = {}) {
  // Footer text row — three non-overlapping regions across slide width
  slide.addText(brand, {
    x: 1.2, y: SLIDE_H - 0.45, w: 5, h: 0.4,
    fontFace: F.sans, fontSize: 15, color: C.muted,
    charSpacing: 6, bold: false, align: "left", valign: "middle",
    margin: 0,
  });
  slide.addText(section, {
    x: 6.4, y: SLIDE_H - 0.45, w: 7.2, h: 0.4,
    fontFace: F.sans, fontSize: 15, color: C.muted,
    charSpacing: 6, align: "center", valign: "middle",
    margin: 0,
  });
  slide.addText(page, {
    x: 13.8, y: SLIDE_H - 0.45, w: 5, h: 0.4,
    fontFace: F.sans, fontSize: 15, color: C.muted,
    charSpacing: 6, align: "right", valign: "middle",
    margin: 0,
  });
}

// Small decorative divider: thin line – diamond – thin line
function addDivider(slide, x, y, width = 2.2) {
  const half = (width - 0.2) / 2;
  slide.addShape(pres.shapes.LINE, {
    x: x, y: y, w: half, h: 0,
    line: { color: C.tan, width: 0.75 },
  });
  // diamond (rotated small square)
  slide.addShape(pres.shapes.DIAMOND, {
    x: x + half + 0.03, y: y - 0.07, w: 0.14, h: 0.14,
    fill: { color: C.tan }, line: { color: C.tan, width: 0 },
  });
  slide.addShape(pres.shapes.LINE, {
    x: x + half + 0.2, y: y, w: half, h: 0,
    line: { color: C.tan, width: 0.75 },
  });
}

// "Plate" panel (beige filled rectangle with muted label top-left / bottom-left)
function addPlate(slide, { x, y, w, h, label = "PLATE", caption = "" }) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.panel },
    line: { color: C.tan, width: 0.75 },
  });
  slide.addText(label, {
    x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.4,
    fontFace: F.sans, fontSize: 15, color: C.muted,
    charSpacing: 6, margin: 0, valign: "top",
  });
  if (caption) {
    slide.addText(caption, {
      x: x + 0.25, y: y + h - 0.7, w: w - 0.5, h: 0.5,
      fontFace: F.sans, fontSize: 15, color: C.muted,
      charSpacing: 6, margin: 0, valign: "bottom",
    });
  }
}

// ================================================================
// SLIDE 1 — Cover
// ================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };
  addFrame(s);

  // Left vertical accent line (thin tan line)
  s.addShape(pres.shapes.LINE, {
    x: 1.9, y: 1.5, w: 0, h: SLIDE_H - 3,
    line: { color: C.tan, width: 0.75 },
  });

  // Eyebrow: AN UNDERGRADUATE LECTURE · MMXXVI
  s.addText("AN UNDERGRADUATE LECTURE  ·  MMXXVI", {
    x: 2.4, y: 1.85, w: 11, h: 0.5,
    fontFace: F.sans, fontSize: 20, color: C.red,
    charSpacing: 10, bold: false, margin: 0,
  });

  // Big title — Forging a Nation (with italic "a" in red)
  s.addText(
    [
      { text: "Forging ", options: { color: C.ink, bold: false } },
      { text: "a", options: { color: C.red, italic: true } },
      { text: "\nNation", options: { color: C.ink, bold: false, breakLine: false } },
    ],
    {
      x: 2.4, y: 2.4, w: 10, h: 3.2,
      fontFace: F.sans, fontSize: 120, bold: false, margin: 0,
      paraSpaceAfter: 0, lineSpacingMultiple: 0.95,
    }
  );

  // Divider
  addDivider(s, 2.4, 6.1, 2.8);

  // Subtitle — italic
  s.addText("The Creation of the United
```