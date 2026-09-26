# OUTRO - luxury_eyewear_retail_seed_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\luxury_eyewear_retail_seed_pitch.js
**SHA:** 92a31850e5daa062
**Timestamp:** 2026-08-28T02:52:35.685910
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const lensW = 1.15, lensH = 0.8, gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
// EYEMIE Concept Pitch — recreates glasses_store__1_.pptx using pptxgenjs
// Fixes applied:
//   1) Slide 7: bottom of house-collection panels was overlapping the footer text.
//      Panels shortened so their bottom edge sits above the footer baseline.
//   2) Slide 3: removed extra space before the comma in
//      "A house of frames , a clinic of eyes." → "A house of frames, a clinic of eyes."

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// Custom 20" x 11.25" layout (matches original 18288000 x 10287000 EMU)
pres.defineLayout({ name: "EYEMIE_WIDE", width: 20, height: 11.25 });
pres.layout = "EYEMIE_WIDE";
pres.author = "EYEMIE";
pres.title  = "EYEMIE — Concept Pitch";

// ─── Palette ───────────────────────────────────────────────────────────────
const CREAM     = "F2ECE0";
const CREAM_LT  = "FFF0E1";
const SAND      = "E4D8C3";
const DIV       = "D9CDB8";  // thin divider line
const MOSS      = "6B5E50";  // muted label text
const INK       = "1A140F";  // headline near-black
const CHARCOAL  = "2B2018";  // dark panels / dark body
const NIGHT     = "0A0705";
const TERRACOTTA= "B5613E";  // accent (italic)
const CLAY      = "C46A47";
const WARM_WHT  = "F6F0E4";
const DEEP_BRN  = "3A2A1F";
const BLACK_BG  = "1A140F";

// ─── Fonts ─────────────────────────────────────────────────────────────────
const FONT_HEAD = "Arial";
const FONT_BODY = "Calibri";

// Helper: common text-box options — zero margin so coords align with shapes
const tx = (opts) => Object.assign({ margin: 0, fontFace: FONT_HEAD }, opts);

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1 — COVER
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: CREAM };

  // Top header
  s.addText("EYEMIE · EYEWEAR & OPTICAL · EST. 2026", tx({
    x: 1.042, y: 0.729, w: 6.222, h: 0.276,
    fontSize: 11, charSpacing: 3.3, color: MOSS
  }));
  s.addText("PHOENIX, AZ", tx({
    x: 17.146, y: 0.729, w: 1.896, h: 0.276,
    fontSize: 11, charSpacing: 3.3, color: MOSS
  }));

  // Kicker
  s.addText("CONCEPT PITCH · SERIES SEED", tx({
    x: 1.042, y: 2.962, w: 9.458, h: 0.276,
    fontSize: 11, charSpacing: 3.3, color: TERRACOTTA
  }));

  // Giant headline
  s.addText([
    { text: "A store for the ", options: { color: INK } },
    { text: "desert's ",        options: { color: TERRACOTTA, italic: true } },
    { text: "light.",           options: { color: INK } }
  ], tx({
    x: 1.042, y: 3.488, w: 9.458, h: 2.733,
    fontSize: 76, charSpacing: -3, fontFace: FONT_HEAD
  }));

  // Supporting paragraph
  s.addText(
    "EYEMIE is a luxury eyewear house and in-clinic optical boutique on the Camelback Corridor — " +
    "curating premium frames from the world, and designing a house collection shaped by Phoenix.",
    tx({
      x: 1.042, y: 6.554, w: 7.296, h: 1.854,
      fontSize: 18, color: MOSS, fontFace: FONT_BODY
    })
  );

  // Right-side editorial "photo" plate (dark rectangle standing in for image)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 10.974, y: 1.214, w: 7.984, h: 8.922,
    fill: { color: CHARCOAL }, line: { color: CHARCOAL, width: 0 }
  });
  // Cream strip along bottom of plate holding the caption
  s.addShape(pres.shapes.RECTANGLE, {
    x: 11.13, y: 9.495, w: 7.093, h: 0.484,
    fill: { color: CREAM }, line: { color: CREAM, width: 0 }
  });
  s.addText("EDITORIAL · MODEL IN ACETATE FRAMES · CAMELBACK AT 4PM", tx({
    x: 11.297, y: 9.641, w: 6.973, h: 0.234,
    fontSize: 9, charSpacing: 2.16, color: CHARCOAL
  }));

  // Bottom footers
  s.addText("INVESTOR CONFIDENTIAL", tx({
    x: 1.042, y: 10.365, w: 3.346, h: 0.26,
    fontSize: 10, charSpacing: 2.97, color: MOSS
  }));
  s.addText("APRIL 2026 · 01 / 08", tx({
    x: 16.389, y: 10.365, w: 2.653, h: 0.26,
    fontSize: 10, charSpacing: 2.97, color: MOSS, align: "right"
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// Shared helpers for content slides
// ═══════════════════════════════════════════════════════════════════════════
function addBrandHeader(s, sectionLabel, labelColor) {
  s.addText("EYEMIE", tx({
    x: 1.042, y: 0.729, w: 1.5, h: 0.396,
    fontSize: 16, italic: true, charSpacing: 0.42, color: labelColor || INK
  }));
  s.addText(sectionLabel, tx({
    x: 15.0, y: 0.789, w: 4.041, h: 0.276,
    fontSize: 11, charSpacing: 2.7, color: labelColor || MOSS, align: "right"
  }));
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2 — OPPORTUNITY (stat row)
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: CREAM };

  addBrandHeader(s, "02 · OPPORTUNITY", MOSS);

  s.addText("THE OPENING", tx({
    x: 1.042, y: 1.708, w: 18.454, h: 0.276,
    fontSize: 11, charSpacing: 3.3, color: TERRACOTTA
  }));
  s.addText("Phoenix is ready for an optical boutique it doe
```