# COMANDO - africa_fmcg_value_chain_playbook.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\africa_fmcg_value_chain_playbook.js
**SHA:** 3950ad633e3bcb31
**Timestamp:** 2026-08-28T02:52:31.904724
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:   node trade_in_africa.js

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Trade in Africa — An Operator's Playbook
 * Replica built with pptxgenjs
 *
 * Run:   node trade_in_africa.js
 * Output: Trade_in_Africa.pptx
 */

const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();

// Slide size: 18288000 x 10287000 EMU => 20" x 11.25"
pptx.defineLayout({ name: "CUSTOM", width: 20, height: 11.25 });
pptx.layout = "CUSTOM";

// ---------------------------------------------------------------------------
// Palette (hex strings, no #)
// ---------------------------------------------------------------------------
const C = {
  cream:     "F5EFE6",  // primary light bg
  creamDeep: "EBE2D2",  // secondary cream bg
  band:      "DED2BD",  // muted band / body on dark
  ink:       "1A1613",  // near-black
  inkSoft:   "3A332D",  // muted text
  terracotta:"C8583A",  // primary accent
  rust:      "9C3F29",  // deeper rust (italic text on cream)
  peach:     "D98A5F",  // on-dark accent
  gold:      "D9A441",
  olive:     "3D4B32",
  olive2:    "5A6B4A",
};

const FONT = "Arial";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function addTop(slide, pageNum, eyebrowText, eyebrowColor, lineColor, numColor) {
  // Top divider line
  slide.addShape("rect", {
    x: 0.75, y: 1.04, w: 18.50, h: 0.01,
    fill: { color: lineColor }, line: { color: lineColor, width: 0 }
  });
  // Page number (top right)
  slide.addText(pageNum, {
    x: 18.00, y: 0.62, w: 1.40, h: 0.28,
    fontFace: FONT, fontSize: 15, color: numColor, align: "right",
    margin: 0
  });
  // Eyebrow (top left)
  if (eyebrowText) {
    slide.addText(eyebrowText, {
      x: 0.75, y: 0.62, w: 8.00, h: 0.34,
      fontFace: FONT, fontSize: 16.5, color: eyebrowColor, align: "left",
      charSpacing: 4, margin: 0
    });
  }
}

function addFooter(slide, text, color) {
  slide.addText(text, {
    x: 0.75, y: 10.47, w: 8.00, h: 0.26,
    fontFace: FONT, fontSize: 13.5, color: color, align: "left",
    charSpacing: 3, margin: 0
  });
}

// Text helper — tight, left-aligned, no margin
function addTxt(slide, text, opts) {
  const base = {
    fontFace: FONT,
    margin: 0,
    align: "left",
    valign: "top",
  };
  slide.addText(text, Object.assign(base, opts));
}

// ---------------------------------------------------------------------------
// SLIDE 1 — Cover
// ---------------------------------------------------------------------------
{
  const s = pptx.addSlide();
  s.background = { color: C.cream };

  // Big terracotta circle (top-right, clipped off-slide)
  s.addShape("ellipse", {
    x: 14.38, y: -1.88, w: 7.50, h: 7.50,
    fill: { color: C.terracotta }, line: { type: "none" }
  });
  // Thin-outline circle overlapping
  s.addShape("ellipse", {
    x: 12.26, y: 1.25, w: 5.45, h: 5.45,
    fill: { type: "none" }, line: { color: C.ink, width: 1.25 }
  });
  // Gold circle
  s.addShape("ellipse", {
    x: 8.12, y: 7.50, w: 1.88, h: 1.88,
    fill: { color: C.gold }, line: { type: "none" }
  });
  // Small olive dot
  s.addShape("ellipse", {
    x: 10.21, y: 9.33, w: 0.67, h: 0.67,
    fill: { color: C.olive }, line: { type: "none" }
  });

  // Masthead line & eyebrows
  addTop(s, "", "", C.ink, C.ink, C.ink);
  addTxt(s, "VOL. 01 · ISSUE 04", {
    x: 0.75, y: 0.62, w: 4.00, h: 0.28,
    fontSize: 15, color: C.ink, charSpacing: 4
  });
  addTxt(s, "SUB-SAHARAN AFRICA / 2026", {
    x: 14.27, y: 0.62, w: 5.10, h: 0.28,
    fontSize: 15, color: C.ink, charSpacing: 4, align: "right"
  });

  // Kicker
  addTxt(s, "AN OPERATOR'S PLAYBOOK", {
    x: 0.75, y: 2.92, w: 10.00, h: 0.34,
    fontSize: 16.5, color: C.rust, charSpacing: 4
  });

  // Big title — "Trade in" (normal) + "Africa." (italic rust)
  s.addText([
    { text: "Trade in ",  options: { color: C.ink,  italic: false, fontFace: FONT, fontSize: 165 } },
    { text: "Africa.",    options: { color: C.rust, italic: true,  fontFace: FONT, fontSize: 165, breakLine: false } },
  ], {
    x: 0.75, y: 3.25, w: 12.00, h: 4.80,
    valign: "top", align: "left", margin: 0, paraSpaceBefore: 0, paraSpaceAfter: 0
  });

  // SUBJECT block
  addTxt(s, "SUBJECT", {
    x: 0.75, y: 8.83, w: 6.65, h: 0.23,
    fontSize: 12, color: C.inkSoft, charSpacing: 4
  });
  addTxt(s, "The FMCG value chain and the allied services shaping how consumer goods move across the continent.", {
    x: 0.75, y: 9.17, w: 6.65, h: 1.29,
    fontSize: 24, color: C.ink
  });

  // FOR block (right)
  addTxt(s, "FOR", {
    x: 16.90, y: 9.67, w: 2.35, h: 0.23,
    fontSize: 12, color: C.inkSoft, charSpacing: 4, align: "right"
  });
  addTxt(s, "Board briefing", {
    x: 16.90, y: 10.01, w: 2.35, h: 0.45,
    fontSize: 24, color: C.ink, align: "right"
  });
}

// ---------------------------------------------------------------------------
// Generic helpers for content slides on cream
// ---------------------------------------------------------------------------
function topRu
```