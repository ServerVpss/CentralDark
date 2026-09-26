# CONTRATO - energy_storage_vendor_assessment.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\energy_storage_vendor_assessment.js
**SHA:** 1da96bfd0ba62448
**Timestamp:** 2026-08-28T02:52:33.662446
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const colW = 2.9, colStart = 0.6, colGap = 0.2;
- const bsW = 2.93, bsStart = 0.6, bsGap = 0.15;

### Gaps
- const boxW = 2.1, boxH = 1.15, startX = 0.6, gap = 0.2;
- const colW = 2.9, colStart = 0.6, colGap = 0.2;
- const bsW = 2.93, bsStart = 0.6, bsGap = 0.15;
- const stepW = 1.68, stepGap = 0.15, stepsStartX = 0.6;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaLeaf } = require("react-icons/fa");

// ─── ICON HELPER ──────────────────────────────────────────────────────────────
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
const C = {
  darkGreen:   "1E3A2B",
  medGreen:    "2D5F3F",
  lightGreen:  "4A8C5E",
  accentGreen: "5B9A3C",
  textGreen:   "2C5F2D",
  bgCream:     "F0EFE9",
  white:       "FFFFFF",
  darkText:    "1E3A2B",
  bodyText:    "3D3D3D",
  mutedText:   "6B7B6E",
  lightGray:   "E8E8E3",
  tableStripe: "F5F5F0",
  teslaRed:    "CC1B33",
  fluenceBlue: "2563EB",
  bydGray:     "6B7280",
  gold:        "D4A843",
  footerGreen: "3A6B42",
};

const FONT_H = "Arial Black";
const FONT_B = "Arial";

// ─── HELPER: stat card (dark green bg) ────────────────────────────────────────
function addStatCard(slide, x, y, w, h, bigText, desc) {
  slide.addShape(slide._slideLayout ? "rect" : "rect", {});  // placeholder
  slide.addShape("rect", { x, y, w, h, fill: { color: C.darkGreen }, rectRadius: 0.05 });
  slide.addText([
    { text: bigText, options: { fontSize: 28, bold: true, color: C.accentGreen, breakLine: true, fontFace: FONT_H } },
    { text: desc, options: { fontSize: 11, color: C.white, fontFace: FONT_B } }
  ], { x, y, w, h, align: "center", valign: "middle", margin: 0 });
}
// Fixed version without invalid shape call
function statCard(slide, pres, x, y, w, h, bigText, desc) {
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.darkGreen } });
  slide.addText([
    { text: bigText, options: { fontSize: 26, bold: true, color: C.accentGreen, breakLine: true, fontFace: FONT_H } },
    { text: desc, options: { fontSize: 10.5, color: C.white, fontFace: FONT_B } }
  ], { x, y, w, h, align: "center", valign: "middle", margin: 4 });
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function buildPresentation() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Infrastructure Team";
  pres.title = "Grid Energy Storage System Evaluation";

  const leafWhite = await iconToBase64Png(FaLeaf, "#FFFFFF", 256);
  const leafGreen = await iconToBase64Png(FaLeaf, "#5B9A3C", 256);

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Title
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.darkGreen };
    // Bottom darker band
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.2, w: 10, h: 1.425, fill: { color: "2D5F3F", transparency: 40 } });
    // Leaf icon
    slide.addImage({ data: leafWhite, x: 0.8, y: 0.6, w: 0.7, h: 0.7 });
    // Title
    slide.addText("Grid Energy Storage\nSystem Evaluation", {
      x: 0.8, y: 1.5, w: 8.4, h: 2.0,
      fontSize: 42, fontFace: FONT_H, color: C.white, bold: true, lineSpacingMultiple: 1.1, margin: 0
    });
    // Subtitle
    slide.addText("50 MW Data Center — Technical Assessment & Recommendations", {
      x: 0.8, y: 3.4, w: 8.4, h: 0.4,
      fontSize: 15, fontFace: FONT_B, color: C.accentGreen, italic: true, margin: 0
    });
    // Footer
    slide.addText("Prepared for Management Review  |  April 2026", {
      x: 0.8, y: 4.5, w: 6, h: 0.35,
      fontSize: 12, fontFace: FONT_B, color: C.mutedText, margin: 0
    });
    slide.addText("CONFIDENTIAL", {
      x: 0.8, y: 4.95, w: 3, h: 0.35,
      fontSize: 12, fontFace: FONT_H, color: C.accentGreen, bold: true, margin: 0
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SLIDE 2 — Executive Summary
  // ═══════════════════════════════════════════════════════════════════════════
  {
    const slide = pres.addSlide();
    slide.background = { color: C.bgCream };
    // Title
    slide.addText("Executive Summary", {
      x: 0.6, y: 0.25, w: 9, h: 0.65,
      fontSize: 36, fontFace: FONT_H, color: C.darkGreen, bold: true, margin: 0
    });

    // Stat boxes
    const stats = [
      { val: "50 MW", label: "Data Center\nPower Requirement", accent: C.darkGreen },
      { val: "200 MWh", label: "Target Storage\nCapacity (4-hr)", accent: C.darkGreen },
      { val: "3", label: "Vendors\nEvaluated", accent: C.gold },
      { val: "93%+", label: "Round-Trip\nEfficiency (all)", accent: C.darkGreen },
    ];
    const boxW = 2.1, boxH = 1.15, startX = 0.6, gap
```