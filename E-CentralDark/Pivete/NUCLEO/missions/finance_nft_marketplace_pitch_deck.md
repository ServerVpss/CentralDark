# MISSAO - finance_nft_marketplace_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_nft_marketplace_pitch_deck.js
**SHA:** 4a7dd142cfa2c569
**Timestamp:** 2026-08-28T02:52:33.929654
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: npm install pptxgenjs && node generate.js
- const trStart = tY + 1.0;

### Gaps
- const gap = (SW - 2 * M - 4 * cardW) / 3;
- const grid = { x: M, y: 4.0, colW: (SW - 2 * M) / 2 - 0.3, rowH: 3.0, colGap: 0.6, rowGap: 0.5 };

### Ouro Bruto (primeiros 5000 chars)
```
// Curio Exchange — Buterin Fund investor memo (12 slides, 20" x 11.25")
// Run: npm install pptxgenjs && node generate.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.author = "Buterin Fund";
pres.title = "Curio Exchange — Buterin Fund";

// Custom 20" x 11.25" layout (matches source 18288000 x 10287000 EMU)
pres.defineLayout({ name: "CURIO", width: 20, height: 11.25 });
pres.layout = "CURIO";

// -------- Palette --------
const C = {
  bg: "0A0907",        // near-black page background
  panel: "14110D",     // slightly lighter panel fill
  card: "2C2620",      // card background
  border: "4A3F33",    // subtle border
  mute: "85796A",      // muted tan (labels, metadata)
  text: "C7BDA9",      // secondary body text
  gold: "C9A961",      // gold accent
  cream: "F4EBDC",     // primary body / title text
};

// Fonts
const F_HEAD = "Georgia";
const F_BODY = "Segoe UI";
const F_MONO = "Consolas";

// Slide dimensions shorthand
const SW = 20;
const SH = 11.25;
const M = 1.04;                // left/right page margin (~1.04")
const TOP_LABEL_Y = 0.7;        // y for section eyebrow
const BOTTOM_Y = 10.6;          // y for footer row
const RULE_Y = 0.85;            // horizontal rule under eyebrow

// -------- Helpers --------
function addPageFrame(slide, num, sectionLabel) {
  slide.background = { color: C.bg };
  // section eyebrow: "NN  SECTION NAME"  + thin rule to right edge
  slide.addText(
    [
      { text: String(num).padStart(2, "0") + "  ", options: { color: C.mute, fontFace: F_MONO, fontSize: 11, charSpacing: 3 } },
      { text: sectionLabel, options: { color: C.gold, fontFace: F_MONO, fontSize: 11, charSpacing: 3, bold: true } },
    ],
    { x: M, y: TOP_LABEL_Y, w: 6, h: 0.3, margin: 0, valign: "middle" }
  );
  // rule: starts just after label text, runs to page right margin
  slide.addShape(pres.shapes.LINE, {
    x: M + 3.5, y: RULE_Y, w: SW - M - (M + 3.5), h: 0,
    line: { color: C.border, width: 0.75 },
  });

  // footer
  slide.addText("CURIO EXCHANGE · BUTERIN FUND", {
    x: M, y: BOTTOM_Y, w: 6, h: 0.3, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 10, charSpacing: 3,
  });
  slide.addText(sectionLabel, {
    x: SW / 2 - 2, y: BOTTOM_Y, w: 4, h: 0.3, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 10, charSpacing: 3, align: "center",
  });
  slide.addText(String(num).padStart(2, "0") + " / 12", {
    x: SW - M - 3, y: BOTTOM_Y, w: 3, h: 0.3, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 10, charSpacing: 3, align: "right",
  });
}

// Decorative corner-bracket frame around an area (4 L-shaped brackets)
function addCornerBrackets(slide, x, y, w, h, color = C.border, size = 0.22, stroke = 1) {
  const s = size;
  // top-left
  slide.addShape(pres.shapes.LINE, { x, y, w: s, h: 0, line: { color, width: stroke } });
  slide.addShape(pres.shapes.LINE, { x, y, w: 0, h: s, line: { color, width: stroke } });
  // top-right
  slide.addShape(pres.shapes.LINE, { x: x + w - s, y, w: s, h: 0, line: { color, width: stroke } });
  slide.addShape(pres.shapes.LINE, { x: x + w, y, w: 0, h: s, line: { color, width: stroke } });
  // bottom-left
  slide.addShape(pres.shapes.LINE, { x, y: y + h - s, w: 0, h: s, line: { color, width: stroke } });
  slide.addShape(pres.shapes.LINE, { x, y: y + h, w: s, h: 0, line: { color, width: stroke } });
  // bottom-right
  slide.addShape(pres.shapes.LINE, { x: x + w, y: y + h - s, w: 0, h: s, line: { color, width: stroke } });
  slide.addShape(pres.shapes.LINE, { x: x + w - s, y: y + h, w: s, h: 0, line: { color, width: stroke } });
}

// =====================================================================
// SLIDE 1 — COVER
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: "2C2620" };  // warmer dark cover

  // Top meta row
  s.addText("BUTERIN FUND — DIGITAL ASSETS", {
    x: M, y: 0.6, w: 5.5, h: 0.35, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 12, charSpacing: 3,
  });
  s.addText("CONFIDENTIAL · FAMILY OFFICE BRIEFING", {
    x: SW / 2 - 3, y: 0.6, w: 6, h: 0.35, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 12, charSpacing: 3, align: "center",
  });
  s.addText("APRIL 2026", {
    x: SW - M - 4, y: 0.6, w: 4, h: 0.35, margin: 0,
    color: C.mute, fontFace: F_MONO, fontSize: 12, charSpacing: 3, align: "right",
  });

  // Eyebrow gold
  s.addText("INVESTMENT MEMORANDUM / LOT NO. 001", {
    x: M, y: 1.95, w: 10, h: 0.4, margin: 0,
    color: C.gold, fontFace: F_MONO, fontSize: 15, charSpacing: 4, bold: true,
  });

  // Big serif title — "Curio Exchange" with italic gold "Exchange"
  s.addText(
    [
      { text: "Curio ", options: { color: C.cream, italic: false } },
      { text: "Exchange", options: { color: C.gold, italic: true } },
    ],
    {
      x: M, y: 2.4, w: 17, h: 2.2, margin: 0,
      fontFace: F_HEAD, fontSize: 130,
    }
  );

  // Rule under title block
  s.addShape(pres
```