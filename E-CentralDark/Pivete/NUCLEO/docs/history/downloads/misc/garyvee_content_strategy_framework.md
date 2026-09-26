# OUTRO - garyvee_content_strategy_framework.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\garyvee_content_strategy_framework.js
**SHA:** 45a1619662039f67
**Timestamp:** 2026-08-28T02:52:34.871420
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const pW1 = 4.0, pH = 0.85, gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "Gary Vaynerchuk's Content Model";

  const C = {
    charcoal: "2D3436",
    slate: "636E72",
    teal: "0984E3",
    lightTeal: "74B9FF",
    paleBlue: "DFE6E9",
    white: "FFFFFF",
    offWhite: "F5F6FA",
    lightGray: "B2BEC3",
  };
  const H = "Arial Black";
  const B = "Arial";
  const ms = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.08 });

  // ===================== SLIDE 1: TITLE =====================
  let s1 = pres.addSlide();
  s1.background = { color: C.charcoal };
  s1.addText("GARYVEE'S\nCONTENT\nMODEL", {
    x: 0.8, y: 0.4, w: 5.5, h: 3.8, fontFace: H, fontSize: 52, color: C.white, bold: true, lineSpacingMultiple: 0.85, margin: 0,
  });
  s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.3, w: 1.5, h: 0.04, fill: { color: C.teal } });
  s1.addText("The Reverse Pyramid", {
    x: 0.8, y: 4.5, w: 5, h: 0.4, fontFace: B, fontSize: 14, color: C.lightTeal, margin: 0,
  });
  s1.addText("A MECE Framework for Creators", {
    x: 0.8, y: 4.95, w: 5, h: 0.35, fontFace: B, fontSize: 11, color: C.lightGray, margin: 0,
  });
  // Right side large "01" watermark
  s1.addText("GV", {
    x: 6.5, y: 0.5, w: 3.5, h: 4.5, fontFace: H, fontSize: 160, color: C.teal, bold: true, align: "right", valign: "middle", margin: 0,
    transparency: 85,
  });

  // ===================== SECTION 01 =====================
  let sec1 = pres.addSlide();
  sec1.background = { color: C.offWhite };
  sec1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.1, h: 5.625, fill: { color: C.teal } });
  sec1.addText("01", { x: 0.7, y: 0.5, w: 2, h: 1.0, fontFace: H, fontSize: 64, color: C.teal, bold: true, margin: 0 });
  sec1.addText("THE MODEL\nOVERVIEW", { x: 0.7, y: 1.7, w: 9, h: 2.4, fontFace: H, fontSize: 48, color: C.charcoal, bold: true, margin: 0, lineSpacingMultiple: 0.95 });
  sec1.addText("How the GaryVee Content Model works and why creators use it", { x: 0.7, y: 4.2, w: 8, h: 0.6, fontFace: B, fontSize: 14, color: C.slate, margin: 0 });

  // ===================== CONTENT 1: REVERSE PYRAMID =====================
  let c1 = pres.addSlide();
  c1.background = { color: C.white };
  c1.addText("One pillar piece becomes a range of distributed assets", { x: 0.7, y: 0.35, w: 9, h: 0.6, fontFace: H, fontSize: 20, color: C.charcoal, bold: true, margin: 0 });

  // LEFT HALF: Pyramid + Y-axis
  // Pyramid centered at x=3.0, compact sizing
  const pxC = 3.1;
  const pW1 = 4.0, pH = 0.85, gap = 0.18;
  const pY1 = 1.35;

  // Level 1: PILLAR (widest)
  c1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: pxC - pW1/2, y: pY1, w: pW1, h: pH, fill: { color: C.charcoal }, rectRadius: 0.06, shadow: ms() });
  c1.addText("PILLAR CONTENT", { x: pxC - pW1/2, y: pY1, w: pW1, h: pH, fontFace: H, fontSize: 12, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

  // Level 2: MICRO (medium)
  const pW2 = 2.8;
  const pY2 = pY1 + pH + gap;
  c1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: pxC - pW2/2, y: pY2, w: pW2, h: pH, fill: { color: C.teal }, rectRadius: 0.06, shadow: ms() });
  c1.addText("MICRO CONTENT", { x: pxC - pW2/2, y: pY2, w: pW2, h: pH, fontFace: H, fontSize: 12, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

  // Level 3: DISTRIBUTE (narrowest)
  const pW3 = 1.6;
  const pY3 = pY2 + pH + gap;
  c1.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: pxC - pW3/2, y: pY3, w: pW3, h: pH, fill: { color: C.paleBlue }, rectRadius: 0.06, shadow: ms() });
  c1.addText("DISTRIBUTE", { x: pxC - pW3/2, y: pY3, w: pW3, h: pH, fontFace: H, fontSize: 11, color: C.charcoal, bold: true, align: "center", valign: "middle", margin: 0 });

  // RIGHT HALF: Explanation text
  const rX = 5.5;
  const rW = 4.2;

  // "1 to 100+" concept header
  c1.addText("1", { x: rX, y: 1.25, w: 0.35, h: 0.4, fontFace: H, fontSize: 24, color: C.teal, bold: true, margin: 0 });
  c1.addShape(pres.shapes.RECTANGLE, { x: rX + 0.4, y: 1.42, w: 0.4, h: 0.03, fill: { color: C.lightTeal } });
  c1.addText("100+", { x: rX + 0.85, y: 1.25, w: 1.0, h: 0.4, fontFace: H, fontSize: 24, color: C.teal, bold: true, margin: 0 });
  c1.addText("PIECES OF CONTENT", { x: rX + 2.0, y: 1.28, w: 2.2, h: 0.35, fontFace: H, fontSize: 8, color: C.slate, bold: true, margin: 0, charSpacing: 2 });

  // Explanation blocks — dot aligned to center of bold title
  c1.addShape(pres.shapes.OVAL, { x: rX, y: 1.98, w: 0.1, h: 0.1, fill: { color: C.teal } });
  c1.addText("Record one keynote, podcast, or vlog", {
    x: rX + 0.3, y: 1.88, w: rW - 0.3, h: 0.3, fontFace: H, fontSize: 12, color: C.charcoal, bold: true, margin: 0,
  });
  c1.addText("That single recording is your pillar. Everything else comes from it.", {
    x: rX + 0.3, y: 2.2, w: rW - 0.3, h: 0.4, fontFace: B, fontSize: 11, color: C.slate, margin: 0,
  });

  c1.addShape(pres.shapes.OVAL, { x: rX, y: 2.83, w: 0.1, 
```