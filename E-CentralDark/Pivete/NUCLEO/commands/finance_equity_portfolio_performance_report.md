# COMANDO - finance_equity_portfolio_performance_report.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_equity_portfolio_performance_report.js
**SHA:** d95c7603e790fa34
**Timestamp:** 2026-08-28T02:52:33.500547
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardGap = (cardEndY - cardStartY - cards3.length * cardH) / (cards3.length - 1);
- // Card h=1.05, gap=(3.7-3.15)/2=0.275

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

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

// Generate a simple colored square PNG for legend use
async function colorSquarePng(hexColor, size = 64) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="6" fill="#${hexColor}"/></svg>`;
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const {
    FaChartLine, FaChartPie, FaShieldAlt, FaExchangeAlt, FaBalanceScale,
    FaGlobe, FaArrowUp, FaArrowDown, FaBullseye, FaCheckCircle,
    FaCalendarAlt, FaCogs, FaMicrochip, FaHeartbeat, FaShoppingCart,
    FaUniversity, FaIndustry, FaComments, FaAppleAlt, FaEllipsisH,
    FaLightbulb, FaRocket, FaStar
  } = require("react-icons/fa");

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Portfolio Management Team";
  pres.title = "Direct Equity Selection Strategy – Q1 2026 Investment Committee Report";

  // === COLOR PALETTE ===
  const C = {
    navy: "1A2744",
    darkNavy: "0F1B33",
    midBlue: "2B4B7E",
    accent: "3B82F6",
    accentLight: "60A5FA",
    accentDark: "2563EB",
    gold: "F59E0B",
    green: "10B981",
    red: "EF4444",
    white: "FFFFFF",
    offWhite: "F8FAFC",
    lightGray: "E2E8F0",
    medGray: "94A3B8",
    darkText: "1E293B",
    bodyText: "334155",
    subtleText: "64748B",
  };

  // Sector colors - consistent across slide 7
  const SECTOR_COLORS = {
    "Technology": C.accent,
    "Health Care": "10B981",
    "Cons. Disc.": "F59E0B",
    "Financials": C.midBlue,
    "Industrials": "8B5CF6",
    "Comm. Svc.": "EC4899",
    "Cons. Staples": "6366F1",
    "Other": C.medGray,
  };

  // Sector icons
  const SECTOR_ICONS = {
    "Technology": FaMicrochip,
    "Health Care": FaHeartbeat,
    "Cons. Disc.": FaShoppingCart,
    "Financials": FaUniversity,
    "Industrials": FaIndustry,
    "Comm. Svc.": FaComments,
    "Cons. Staples": FaAppleAlt,
    "Other": FaEllipsisH,
  };

  const makeShadow = () => ({ type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.12 });
  const FONT_H = "Georgia";
  const FONT_B = "Calibri";

  // Pre-render all sector icons
  const sectorIconData = {};
  for (const [name, icon] of Object.entries(SECTOR_ICONS)) {
    sectorIconData[name] = await iconToBase64Png(icon, "#" + SECTOR_COLORS[name], 256);
  }

  // Pre-render icons for slide 13 and 14
  const iconGlobe = await iconToBase64Png(FaGlobe, "#" + C.accentLight, 512);
  const iconRocket = await iconToBase64Png(FaRocket, "#" + C.accent, 256);
  const iconStar = await iconToBase64Png(FaStar, "#" + C.gold, 256);
  const iconShield = await iconToBase64Png(FaShieldAlt, "#" + C.green, 256);
  const iconBullseye = await iconToBase64Png(FaBullseye, "#" + C.accentLight, 256);
  const iconChart = await iconToBase64Png(FaChartLine, "#" + C.green, 256);
  const iconCheckCircle = await iconToBase64Png(FaCheckCircle, "#" + C.green, 256);

  // Helper: footer
  function addFooter(slide, text = "Confidential – For Investment Committee Use Only") {
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.15, w: 10, h: 0.475, fill: { color: C.navy } });
    slide.addText(text, { x: 0.5, y: 5.15, w: 9, h: 0.475, fontSize: 8, fontFace: FONT_B, color: C.medGray, valign: "middle" });
  }

  // Helper: top bar
  function addTopBar(slide, title) {
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: C.navy } });
    slide.addText(title, { x: 0.6, y: 0, w: 9, h: 0.9, fontSize: 22, fontFace: FONT_H, color: C.white, bold: true, valign: "middle", margin: 0 });
  }

  // =========================================
  // SLIDE 1: TITLE SLIDE (FIX #1 - more visually attractive)
  // =========================================
  let s1 = pres.addSlide();
  s1.background = { color: C.darkNavy };

  // Left accent bar
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.accent } });

  // Decorative geometric shapes on right side for visual interest
  s1.addShape(pres.shapes.RECTANGLE, { x: 7.5, y: -0.5, w: 3.5, h: 3.5, fill: { color: C.accent, transparency: 92 }, rotate: 25 });
  s1.addShape(pres.shapes.RECTANGLE, { x: 8.2, y: 0.3, w: 2.5, h: 2.5, fill: { color: C.accentLight, transparency: 88 }, rotate: 40 });
  s1.addShape(pres.shapes.RECTANGLE, { x: 7.0, y: 3.0, w: 4.0, h: 4.0, fill: { color: C.m
```