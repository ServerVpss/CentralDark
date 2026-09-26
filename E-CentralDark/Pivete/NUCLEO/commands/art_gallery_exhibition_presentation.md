# COMANDO - art_gallery_exhibition_presentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\art_gallery_exhibition_presentation.js
**SHA:** 7738b620edd2491d
**Timestamp:** 2026-08-28T02:52:32.437414
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build.js   → produces picasso-greatest-hits.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// ====================================================================
// picasso-greatest-hits.pptx — generated from source PPTX
// Run: node build.js   → produces picasso-greatest-hits.pptx
// Requires: npm install pptxgenjs  (JSZip is a transitive dep)
// Image assets expected in ./assets/ (same filenames as source media)
// ====================================================================

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.author = "Upstream Gallery";
pres.title = "Picasso — A Life in Colors";

// Custom layout: 20" × 11.25" (matches source exactly)
pres.defineLayout({ name: "CUSTOM", width: 20, height: 11.25 });
pres.layout = "CUSTOM";

let slide;

// ════════════════════ Slide 1 ════════════════════
slide = pres.addSlide();
slide.background = { color: "0A0A0A" };
  // Shape 0  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 20, h: 11.25, fill: { color: "F2ECE0" }, line: { type: "none" } });
  // Shape 1  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.5833, h: 1.6071, fill: { color: "1E3A5F" }, line: { type: "none" } });
  // Shape 2  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 1.6071, w: 0.5833, h: 1.6073, fill: { color: "C9735E" }, line: { type: "none" } });
  // Shape 3  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 3.2144, w: 0.5833, h: 1.6071, fill: { color: "C9A063" }, line: { type: "none" } });
  // Shape 4  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.8215, w: 0.5833, h: 1.6073, fill: { color: "A23E2C" }, line: { type: "none" } });
  // Shape 5  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 6.4287, w: 0.5833, h: 1.6071, fill: { color: "3D5C3A" }, line: { type: "none" } });
  // Shape 6  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 8.0358, w: 0.5833, h: 1.6071, fill: { color: "0F0F0F" }, line: { type: "none" } });
  // Shape 7  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 9.6429, w: 0.5833, h: 1.6071, fill: { color: "0F2340" }, line: { type: "none" } });
  // Text 8  (text_or_shape)
  slide.addText([
    { text: "UPSTREAM GALLERY · PICASSO", options: { fontSize: 18, color: "6A6255", fontFace: "Arial", charSpacing: 3.96 } }
  ], { x: 1.1458, y: 0.4583, w: 5.3958, h: 0.3646, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 9  (text_or_shape)
  slide.addText([
    { text: "COVER", options: { fontSize: 18, color: "6A6255", fontFace: "Arial", charSpacing: 3.24 } }
  ], { x: 16.3368, y: 0.4792, w: 1.1974, h: 0.3229, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 10  (text_or_shape)
  slide.addText([
    { text: "01", options: { bold: true, fontSize: 18, color: "0F0F0F", fontFace: "Arial", charSpacing: 3.24 } }
  ], { x: 17.7425, y: 0.4583, w: 0.4834, h: 0.3646, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 11  (text_or_shape)
  slide.addText([
    { text: "/ 18", options: { fontSize: 18, color: "6A6255", transparency: 50, fontFace: "Arial", charSpacing: 3.24 } }
  ], { x: 18.1426, y: 0.4792, w: 0.7949, h: 0.3229, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 12  (text_or_shape)
  slide.addText([
    { text: "UPSTREAM GALLERY — WEEKEND EXHIBIT", options: { fontSize: 18, color: "6A6255", fontFace: "Arial", charSpacing: 7.2 } }
  ], { x: 1.4583, y: 3.2928, w: 17.9177, h: 0.3333, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 13  (text_or_shape)
  slide.addText([
    { text: "Picasso", options: { bold: true, italic: true, fontSize: 180, color: "0F0F0F", fontFace: "Georgia", charSpacing: -7.2 } }
  ], { x: 1.4583, y: 3.9178, w: 17.9177, h: 2.2415, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 14  (text_or_shape)
  slide.addText([
    { text: "A Life in Colors, a Century in Motion.", options: { fontSize: 42, color: "2A2723", fontFace: "Georgia" } }
  ], { x: 1.4583, y: 6.4093, w: 17.9177, h: 0.6833, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Text 15  (text_or_shape)
  slide.addText([
    { text: "1881 — 1973", options: { fontSize: 19.5, color: "6A6255", fontFace: "Arial", charSpacing: 1.56 } }
  ], { x: 1.4583, y: 7.6343, w: 1.9481, h: 0.3646, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Shape 16  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 3.6564, y: 7.7905, w: 0.8333, h: 0.0104, fill: { color: "C9BFA8" }, line: { type: "none" } });
  // Text 17  (text_or_shape)
  slide.addText([
    { text: "Málaga · Barcelona · Paris · Cannes", options: { fontSize: 19.5, color: "6A6255", fontFace: "Arial", charSpacing: 1.56 } }
  ], { x: 4.8231, y: 7.6343, w: 5.293, h: 0.3646, valign: "top", align: "left", isTextBox: true, margin: 2 });
  // Shape 18  (text_or_shape)
  slide.addShape(pres.shapes.RECTANGLE, { x: 10.2952, y: 7.7905, w: 0.8333, h: 0.0104, fill: { color: "C9BFA8" }, line: { type: "n
```