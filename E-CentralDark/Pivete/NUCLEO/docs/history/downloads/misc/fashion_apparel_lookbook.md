# OUTRO - fashion_apparel_lookbook.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\fashion_apparel_lookbook.js
**SHA:** 3fb390c79738f882
**Timestamp:** 2026-08-28T02:52:34.028834
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Slide size: 20" x 11.25" (custom). Run: node generate_clothes.js

### Ouro Bruto (primeiros 5000 chars)
```
// generate_clothes.js
// Replicates Clothes.pptx using pptxgenjs.
// Slide size: 20" x 11.25" (custom). Run: node generate_clothes.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// Custom 20" × 11.25" layout (matches the original 18288000 × 10287000 EMU)
pres.defineLayout({ name: "CUSTOM_20x11", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11";
pres.title = "Clothes Lookbook";

// ----- Palette -----
const C_BG = "F2EFE8";          // cream paper
const C_INK = "0E0E10";         // near-black ink
const C_RED = "E63946";         // siren red accent
const C_BROWN = "7A5C3A";       // field brown
const C_BLUE = "1F3A8A";        // cobalt
const C_ACID = "C8FF3E";        // acid yellow-green
const C_BONE = "F2EFE8";        // bone (= bg)
const C_BAND = "EDE7D4";        // table alt-row

// ----- Fonts -----
const F_MONO = "Courier New";
const F_DISP = "Impact";
const F_SERIF = "Georgia";

// Convenience: footer for content slides
function addContentFooter(slide, pageNum) {
  // top horizontal rule
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0417, y: 1.2865, w: 17.9167, h: 0.0312,
    fill: { color: C_INK }, line: { color: C_INK, width: 0 },
  });
  // bottom horizontal rule
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 1.0417, y: 10.4688, w: 17.9167, h: 0.0208,
    fill: { color: C_INK }, line: { color: C_INK, width: 0 },
  });
  slide.addText("CUT & SEW · S/S 26", {
    x: 1.0417, y: 10.5938, w: 2.7838, h: 0.3229,
    fontFace: F_MONO, fontSize: 18, color: C_INK, align: "left",
    margin: 0, valign: "top",
  });
  slide.addText(`${pageNum} / 10`, {
    x: 17.9081, y: 10.5938, w: 1.1335, h: 0.3229,
    fontFace: F_MONO, fontSize: 18, color: C_INK, align: "left",
    margin: 0, valign: "top",
  });
}

function addSlideHeader(slide, leftLabel, rightLabel) {
  slide.addText(leftLabel, {
    x: 1.0417, y: 0.8333, w: 8, h: 0.349,
    fontFace: F_MONO, fontSize: 19.5, color: C_INK, align: "left",
    margin: 0, valign: "top",
  });
  slide.addText(rightLabel, {
    x: 11.04, y: 0.8333, w: 7.92, h: 0.349,
    fontFace: F_MONO, fontSize: 19.5, color: C_INK, align: "right",
    margin: 0, valign: "top",
  });
}

// ===========================================================================
// SLIDE 1 — Cover
// ===========================================================================
{
  const s = pres.addSlide();
  s.background = { color: C_BG };

  // Dark backdrop covering full slide (ink with cream 30% overlay = warm dark)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 20, h: 11.25,
    fill: { color: C_INK }, line: { color: C_INK, width: 0 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 20, h: 11.25,
    fill: { color: C_BG, transparency: 70 }, line: { color: C_INK, width: 0 },
  });

  // Top-left strapline
  s.addText("CUT & SEW STUDIO · EST. 2021 · BROOKLYN NY", {
    x: 1.0417, y: 0.6875, w: 6.7064, h: 0.3229,
    fontFace: F_MONO, fontSize: 18, color: C_INK, charSpacing: 1.8,
    align: "left", margin: 0, valign: "top",
  });

  // Top-right boxed lockup
  s.addShape(pres.shapes.RECTANGLE, {
    x: 13.1075, y: 0.625, w: 5.8508, h: 0.4062,
    fill: { type: "none" }, line: { color: C_INK, width: 1.5 },
  });
  s.addText("LOOKBOOK · VOL. 06 · SPRING 2026", {
    x: 13.2325, y: 0.6875, w: 5.7764, h: 0.3229,
    fontFace: F_MONO, fontSize: 18, color: C_INK, charSpacing: 9,
    align: "left", margin: 0, valign: "top",
  });

  // Massive title — "CUT &" / "SEW."
  s.addText("CUT &", {
    x: 1.0417, y: 1.5, w: 13.7333, h: 3.4,
    fontFace: F_DISP, fontSize: 200, color: C_INK, charSpacing: 10,
    align: "left", margin: 0, valign: "top",
  });
  s.addText("SEW.", {
    x: 1.0417, y: 4.65, w: 13.7333, h: 3.4,
    fontFace: F_DISP, fontSize: 200, color: C_RED, charSpacing: 10,
    align: "left", margin: 0, valign: "top",
  });

  // Red badge (rotated -12°) — "6 NEW HOODIES" — single line each, wider boxes
  s.addShape(pres.shapes.OVAL, {
    x: 17.0833, y: 2.7083, w: 1.875, h: 1.875,
    fill: { color: C_RED }, line: { color: C_RED, width: 0 },
    rotate: -12,
  });
  s.addText("6", {
    x: 17.1, y: 2.85, w: 1.85, h: 0.55,
    fontFace: F_DISP, fontSize: 28, color: C_BG, align: "center", margin: 0,
    rotate: -12,
  });
  s.addText("NEW", {
    x: 17.1, y: 3.32, w: 1.85, h: 0.5,
    fontFace: F_DISP, fontSize: 22, color: C_BG, align: "center", margin: 0,
    rotate: -12,
  });
  s.addText("HOODIES", {
    x: 17.1, y: 3.78, w: 1.85, h: 0.55,
    fontFace: F_DISP, fontSize: 22, color: C_BG, align: "center", margin: 0,
    rotate: -12,
  });

  // Tagline (italic)
  s.addText(
    "A small-batch hoodie label printing zine-grade graphics on heavyweight fleece — six drops, one season, no restocks.",
    {
      x: 1.0417, y: 8.5, w: 9.0125, h: 1.15,
      fontFace: F_SERIF, fontSize: 22, italic: true, color: C_INK,
      align: "left", margin: 0, valign: "top",
    }
  );

  // Right-side credits
  s.addText("PRESENTED BY", {
    x: 14.5, y: 8.5
```