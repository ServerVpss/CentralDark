# PADRAO - flower_shop_company_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\flower_shop_company_profile.js
**SHA:** 6c7fe8ec5886be66
**Timestamp:** 2026-08-28T02:52:34.330832
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: npm install pptxgenjs && node generate.js

### Ouro Bruto (primeiros 5000 chars)
```
// Rosen & Roses - reverse-engineered pptxgenjs source
// Run: npm install pptxgenjs && node generate.js
const PptxGenJS = require('pptxgenjs');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';  // overridden below to exact dimensions
pptx.defineLayout({ name: 'CUSTOM', width: 20, height: 11.25 });
pptx.layout = 'CUSTOM';

// ===== Slide 1 =====
{
  const slide = pptx.addSlide();
  slide.addShape(pptx.ShapeType.rect, { x: 0.0, y: 0.0, w: 20.0, h: 11.25, fill: { color: "FFF5DE" }, line: { type: "none" } });
  slide.addShape(pptx.ShapeType.rect, { x: 0.4167, y: 0.4167, w: 19.1667, h: 10.4167, fill: { type: "none" }, line: { color: "1F1914", width: 0.75, transparency: 80.0 } });
  slide.addImage({ path: "./image-1-1.png", x: 0.6458, y: 0.6458, w: 0.7292, h: 0.7292 });
  slide.addImage({ path: "./image-1-2.png", x: 18.625, y: 0.6458, w: 0.7292, h: 0.7292, rotate: 180.0 });
  slide.addImage({ path: "./image-1-3.png", x: 0.6458, y: 9.875, w: 0.7292, h: 0.7292 });
  slide.addImage({ path: "./image-1-4.png", x: 18.625, y: 9.875, w: 0.7292, h: 0.7292, rotate: 180.0 });
  slide.addImage({ path: "./image-1-5.png", x: -0.8333, y: -0.4167, w: 7.5, h: 8.5417 });
  slide.addImage({ path: "./image-1-6.png", x: 12.7083, y: 3.3333, w: 8.125, h: 8.75 });
  slide.addText([
    { text: "VOLUME NO. I", options: { fontSize: 10.5, color: "8A2838", fontFace: "DM Mono", charSpacing: 5.25, align: "center" } },
  ], { x: 5.9837, y: 1.0, w: 2.0085, h: 0.2292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "✦", options: { fontSize: 10.5, color: "8A2838", transparency: 50.0, fontFace: "DM Mono", charSpacing: 5.25, align: "center" } },
  ], { x: 8.236, y: 0.9896, w: 0.2754, h: 0.2396, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "SPRING MMXXVI", options: { fontSize: 10.5, color: "8A2838", fontFace: "DM Mono", charSpacing: 5.25, align: "center" } },
  ], { x: 8.7552, y: 1.0, w: 2.1688, h: 0.2292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "✦", options: { fontSize: 10.5, color: "8A2838", transparency: 50.0, fontFace: "DM Mono", charSpacing: 5.25, align: "center" } },
  ], { x: 11.1678, y: 0.9896, w: 0.2754, h: 0.2396, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "NO. 123 MARKET", options: { fontSize: 10.5, color: "8A2838", fontFace: "DM Mono", charSpacing: 5.25, align: "center" } },
  ], { x: 11.687, y: 1.0, w: 2.3293, h: 0.2292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "Rosen", options: { fontSize: 225.0, italic: true, color: "1F1914", fontFace: "Cormorant Garamond", charSpacing: -5.62, align: "center", lineSpacingMultiple: 0.86 } },
  ], { x: 5.1075, y: 1.6042, w: 9.785, h: 2.7292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "&", options: { fontSize: 135.0, italic: true, color: "8A2838", fontFace: "Cormorant Garamond", charSpacing: -5.62, align: "center", lineSpacingMultiple: 0.9 } },
  ], { x: 5.1075, y: 4.4167, w: 9.785, h: 1.7292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "ROSES", options: { fontSize: 225.0, color: "1F1914", fontFace: "Cormorant Garamond", charSpacing: 4.5, align: "center", lineSpacingMultiple: 0.86 } },
  ], { x: 5.1075, y: 6.2292, w: 9.785, h: 2.7292, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addShape(pptx.ShapeType.rect, { x: 8.2396, y: 9.3802, w: 1.4583, h: 0.0104, fill: { color: "8A2838", transparency: 50.0 }, line: { type: "none" } });
  slide.addImage({ path: "./image-1-7.png", x: 9.9062, y: 9.2917, w: 0.1875, h: 0.1875 });
  slide.addShape(pptx.ShapeType.rect, { x: 10.3021, y: 9.3802, w: 1.4583, h: 0.0104, fill: { color: "8A2838", transparency: 50.0 }, line: { type: "none" } });
  slide.addText([
    { text: "a little flower shop, newly opened on the corner.", options: { fontSize: 27.0, italic: true, color: "554535", fontFace: "Cormorant Garamond", charSpacing: 0.54, align: "center" } },
  ], { x: 6.5724, y: 9.8125, w: 6.8553, h: 0.4896, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "FRESH CUT · GROWN NEARBY", options: { fontSize: 9.75, color: "8A7660", fontFace: "DM Mono", charSpacing: 2.93, align: "left" } },
  ], { x: 1.4583, y: 10.3438, w: 3.0129, h: 0.2188, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
  slide.addText([
    { text: "TUES — SUN · CLOSED MON", options: { fontSize: 9.75, color: "8A7660", fontFace: "DM Mono", charSpacing: 2.93, align: "left" } },
  ], { x: 15.7384, y: 10.3438, w: 2.8873, h: 0.2188, margin: [2.0, 2.0, 2.0, 2.0], valign: "top", fit: "shrink" });
}

// ===== Slide 2 =====
{
  const slide = pptx.addSlide();
  slide.background = { color: "F3EAD8" };
  slide.addShape(pptx.ShapeType.rect, { x: 1.4583, y: 1.4948, w: 1.25, h: 0.0104, fill: { colo
```