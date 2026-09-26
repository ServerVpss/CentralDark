# COMANDO - finance_quant_trading_desk_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_quant_trading_desk_proposal.js
**SHA:** 29d230698a4837c7
**Timestamp:** 2026-08-28T02:52:33.967478
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- { num: "04", text: "12-month performance gate: 13%+ return on capital, Sharpe >1.5. Success triggers $30M expansion to NFL, MLB, and international sports markets." }

### Riscos
- risk: "Regulatory\nUncertainty", impact: "HIGH", impactColor: "FFFFFF", impactBg: ACCENT, impactBorder: ACCENT,
- risk: "Market Making\nMargin Compression", impact: "MED", impactColor: "FFFFFF", impactBg: "6C6C6C", impactBorder: "6C6C6C",
- risk: "Liquidity &\nCounterparty Risk", impact: "MED", impactColor: "FFFFFF", impactBg: "6C6C6C", impactBorder: "6C6C6C",
- risk: "Model Risk &\nBlack Swan Events", impact: "LOW", impactColor: "6C6C6C", impactBg: "F8F8F8", impactBorder: "C8C8C8",

### Gaps
- const statGap = 0.25;
- const gridGap = 0.15;
- const s4cardGap = 0.15;
- const ecgap = 0.35;
- const pgap = 0.30;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaChartLine, FaExchangeAlt, FaBasketballBall, FaUsers,
  FaDollarSign, FaBolt, FaChessKnight, FaRocket, FaShieldAlt,
  FaArrowRight, FaCrosshairs, FaDatabase, FaBalanceScale
} = require("react-icons/fa");

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

// ============================================================
// JUMP TRADING PALETTE - HYBRID LIGHT/DARK
// Source: brandfetch.com/jumptrading.com
//   Pomegranate #EE322F | Alabaster #F8F8F8 | Cod Gray #080808
// Dark bookends (slides 1, 10), light content (slides 2-9).
// ONE accent (red). Everything else grayscale.
// ============================================================

// Dark theme (title + closing slides)
const D_BG       = "080808";
const D_PANEL    = "141414";
const D_CARD     = "1A1A1A";
const D_TEXT     = "F8F8F8";
const D_LIGHT    = "C8C8C8";
const D_MUTED    = "808080";
const D_DIM      = "5A5A5A";
const D_RULE     = "2A2A2A";

// Light theme (content slides)
const L_BG       = "F8F8F8";  // Alabaster - Jump's actual site bg
const L_PANEL    = "FFFFFF";  // pure white for raised panels
const L_CARD     = "FFFFFF";  // cards pop off the alabaster bg
const L_TEXT     = "080808";  // Cod Gray - primary text
const L_SUBTEXT  = "333333";  // dense body
const L_MUTED    = "6C6C6C";  // captions
const L_DIM      = "A0A0A0";  // tertiary / chart secondary
const L_RULE     = "D8D8D8";
const L_BORDER   = "E5E5E5";  // light card outline

// Accent - consistent across both themes
const ACCENT     = "EE322F";  // Pomegranate - THE accent
const ACCENT_DIM = "B02522";  // lower-intensity red for chart gradient

// Typography
const HFONT = "Arial Black";
const SFONT = "Arial";
const BFONT = "Arial";

const SW = 13.3;
const SH = 7.5;
const ML = 0.6;
const MR = 0.6;
const CW = SW - ML - MR;

let PRES;

// ------------ Helpers ------------
// Each helper takes a theme object so the same function works in light and dark.

const THEME_DARK = {
  bg: D_BG, panel: D_PANEL, card: D_CARD,
  text: D_TEXT, subtext: D_LIGHT, muted: D_MUTED, dim: D_DIM,
  rule: D_RULE, border: D_RULE
};
const THEME_LIGHT = {
  bg: L_BG, panel: L_PANEL, card: L_CARD,
  text: L_TEXT, subtext: L_SUBTEXT, muted: L_MUTED, dim: L_DIM,
  rule: L_RULE, border: L_BORDER
};

function addRule(slide, x, y, w, color) {
  slide.addShape(PRES.shapes.RECTANGLE, {
    x: x, y: y, w: w, h: 0.015, fill: { color: color }, line: { type: "none" }
  });
}

function addSlideHeader(slide, T, sectionLabel, subtitle, opts = {}) {
  const startY = opts.startY || 0.3;
  slide.addText(sectionLabel, {
    x: ML, y: startY, w: CW, h: 0.25,
    fontSize: 10, fontFace: SFONT, bold: true, color: ACCENT, charSpacing: 3, align: "left", margin: 0
  });
  if (typeof subtitle === "string") {
    slide.addText(subtitle, {
      x: ML, y: startY + 0.25, w: CW, h: 0.7,
      fontSize: 22, fontFace: HFONT, color: T.text, align: "left", margin: 0, lineSpacingMultiple: 1.1
    });
  } else {
    slide.addText(subtitle, {
      x: ML, y: startY + 0.25, w: CW, h: 0.7,
      align: "left", margin: 0, lineSpacingMultiple: 1.1
    });
  }
  addRule(slide, ML, startY + 1.0, CW, T.rule);
}

function addKeyTakeaway(slide, T, text, y) {
  const ty = y || 6.55;
  slide.addShape(PRES.shapes.RECTANGLE, {
    x: ML, y: ty, w: CW, h: 0.5, fill: { color: T.card }, line: { type: "none" }
  });
  slide.addShape(PRES.shapes.RECTANGLE, {
    x: ML, y: ty, w: 0.05, h: 0.5, fill: { color: ACCENT }, line: { type: "none" }
  });
  slide.addText([
    { text: "KEY TAKEAWAY  ", options: { bold: true, fontSize: 9, fontFace: SFONT, color: ACCENT, charSpacing: 2 } },
    { text: text, options: { fontSize: 9.5, fontFace: BFONT, color: T.subtext } }
  ], {
    x: ML + 0.2, y: ty, w: CW - 0.3, h: 0.5, align: "left", valign: "middle", margin: 0
  });
}

function addSource(slide, T, text, pageNum) {
  slide.addText(text, {
    x: ML, y: 7.15, w: CW - 0.5, h: 0.25,
    fontSize: 7.5, fontFace: BFONT, italic: true, color: T.muted, align: "left", margin: 0
  });
  slide.addText(String(pageNum).padStart(2, "0"), {
    x: SW - ML - 0.4, y: 7.15, w: 0.4, h: 0.25,
    fontSize: 8, fontFace: SFONT, bold: true, color: ACCENT, align: "right", margin: 0
  });
}

// Canonical stat callout - big number, muted label, red bar left.
function addStatCallout(slide, T, x, y, w, h, value, label) {
  slide.addShape(PRES.shapes.RECTANGLE, {
    x: x, y: y, w: 0.05, h: h, fill: { color: ACCENT }, line: { type: "none" }
  })
```