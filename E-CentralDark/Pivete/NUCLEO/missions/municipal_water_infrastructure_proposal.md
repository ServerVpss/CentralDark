# MISSAO - municipal_water_infrastructure_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\municipal_water_infrastructure_proposal.js
**SHA:** b710482ea2eda2b9
**Timestamp:** 2026-08-28T02:52:35.821400
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- "Target Phase 1 construction start: Q4 2026",

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// ── Color Palette ──
const C = {
  navy:      "1B3A5C",
  navyDark:  "152E4A",
  gold:      "D4A843",
  white:     "FFFFFF",
  offWhite:  "F5F6F8",
  lightGray: "E8ECF0",
  midGray:   "8C9AAE",
  darkText:  "1E2D3D",
  bodyText:  "333333",
  blue:      "2E75B6",
  lightBlue: "5B9BD5",
  teal:      "0D9488",
  green:     "4CAF50",
  orange:    "E8913A",
  red:       "C0392B",
  chartBlue: "2E75B6",
  chartGreen:"27AE60",
  chartOrange:"E67E22",
  chartTeal: "16A085",
  chartRed:  "E74C3C",
};

const FONT_HEADER = "Trebuchet MS";
const FONT_BODY   = "Calibri";

// ── Icon rendering helpers ──
async function iconToBase64Png(IconComponent, color = "#000000", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── Helper: add standard navy header bar ──
function addHeaderBar(slide, pres, title) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.75,
    fill: { color: C.navy },
  });
  slide.addText(title, {
    x: 0.5, y: 0, w: 9, h: 0.75,
    fontSize: 18, fontFace: FONT_HEADER, color: C.white,
    bold: true, valign: "middle", margin: 0,
    charSpacing: 2,
  });
}

// ── Helper: spec table ──
function addSpecTable(slide, specs, x, y, w) {
  const rows = specs.map(([label, value]) => [
    { text: label, options: { fontSize: 9, fontFace: FONT_BODY, bold: true, color: C.darkText, fill: { color: C.offWhite }, border: [{ pt: 0.5, color: C.lightGray }], valign: "middle", margin: [2, 4, 2, 4] } },
    { text: value, options: { fontSize: 9, fontFace: FONT_BODY, color: C.bodyText, fill: { color: C.white }, border: [{ pt: 0.5, color: C.lightGray }], valign: "middle", margin: [2, 4, 2, 4] } },
  ]);
  slide.addTable(rows, { x, y, w, colW: [w * 0.32, w * 0.68], rowH: 0.28 });
}

// ── Helper: gold left accent stripe ──
function addGoldStripe(slide, pres) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.08, h: 5.625,
    fill: { color: C.gold },
  });
}

// ── Helper: shadow factory ──
const makeShadow = () => ({ type: "outer", color: "000000", blur: 4, offset: 2, angle: 135, opacity: 0.1 });

async function buildPresentation() {
  // Load icons
  const { FaSeedling, FaTint, FaFlask, FaCheckCircle, FaChartLine, FaShieldAlt, FaClock, FaDollarSign } = require("react-icons/fa");

  // Load city seal
  const sealPath = path.join(__dirname, "hanford_seal.png");
  const sealBase64 = "image/png;base64," + fs.readFileSync(sealPath).toString("base64");

  // Pre-render icons
  const iconSeedling = await iconToBase64Png(FaSeedling, "#4CAF50", 256);
  const iconTint     = await iconToBase64Png(FaTint, "#2E75B6", 256);
  const iconFlask    = await iconToBase64Png(FaFlask, "#4CAF50", 256);
  const iconCheck    = await iconToBase64Png(FaCheckCircle, "#FFFFFF", 256);
  const iconChart    = await iconToBase64Png(FaChartLine, "#FFFFFF", 256);
  const iconShield   = await iconToBase64Png(FaShieldAlt, "#FFFFFF", 256);
  const iconClock    = await iconToBase64Png(FaClock, "#FFFFFF", 256);
  const iconDollar   = await iconToBase64Png(FaDollarSign, "#FFFFFF", 256);

  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "City of Hanford Water Division";
  pres.title  = "Drinking Water Quality Improvement Solutions";

  // ═══════════════════════════════════════════
  // SLIDE 1: TITLE
  // ═══════════════════════════════════════════
  {
    let slide = pres.addSlide();
    slide.background = { color: C.navy };
    addGoldStripe(slide, pres);

    // Title text
    slide.addText([
      { text: "DRINKING WATER", options: { fontSize: 36, bold: true, breakLine: true, charSpacing: 3 } },
      { text: "QUALITY IMPROVEMENT", options: { fontSize: 36, bold: true, breakLine: true, charSpacing: 3 } },
      { text: "SOLUTIONS", options: { fontSize: 36, bold: true, charSpacing: 3 } },
    ], {
      x: 0.6, y: 0.8, w: 5.8, h: 2.5,
      fontFace: FONT_HEADER, color: C.white, valign: "top", margin: 0,
    });

    // Subtitle
    slide.addText("CITY OF HANFORD, CALIFORNIA", {
      x: 0.6, y: 3.3, w: 5.8, h: 0.5,
      fontSize: 14, fontFace: FONT_BODY, color: C.gold,
      bold: true, charSpacing: 2, margin: 0,
    });

    // City seal
    slide.addImage({
      data: sealBase64,
      x: 7.2, y: 0.7, w: 2.3, h: 2.3,
    });

    // Footer line
    slide.addShape(pres.shapes.LINE, {
      x: 0.6, y: 4.8, w: 8.8, h: 0,
      line: { color: C.gold, width: 1 },
    });
    slide.addText("Prepared for City Council  •  Water Division  •  April 2026", {
      x: 0.6, y: 4.9, w: 8.8, h: 0.4,
      fontSize: 11, fontFace: FONT_BODY, color: C.midGray, margin: 0,
    });
  }

  
```