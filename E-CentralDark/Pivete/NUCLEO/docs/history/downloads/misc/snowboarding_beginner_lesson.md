# OUTRO - snowboarding_beginner_lesson.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\snowboarding_beginner_lesson.js
**SHA:** 0e9ce798bf3c01c9
**Timestamp:** 2026-08-28T02:52:36.968320
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardW = 2.05, cardH = 2.6, gap = 0.18;
- const cardY = 2.0, cardH = 2.5, cardW = 4.35, gap = 0.3;
- const colW = 2.9, gap = 0.15;
- const cardY = 2.1, cardH = 2.85, cardW = 4.35, gap = 0.3;
- const colW = 2.9, gap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
// Snowboarding presentation — pptxgenjs replica
// Color palette pulled from the original deck:
//   Navy (background, dark text):        0F1B2D
//   Light gray (light bg):               F4F6FA
//   Body text on light:                  1F2A3D
//   Muted (footer/caption):              6B7280 / 8B95A6
//   Sky blue (accent / icon detail):     4FA9D6
//   Amber (signature accent):            E8B544
//   Card border on light bg:             E2E6EE
//   Card border on dark bg:              1E2C44

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const NAVY = "0F1B2D";
const NAVY_DARKER = "0A1320";
const LIGHT = "F4F6FA";
const TEXT_DARK = "1F2A3D";
const MUTED_DARK = "6B7280";   // muted text on light background
const MUTED_LIGHT = "8B95A6";  // muted text on dark background
const SKY = "4FA9D6";
const AMBER = "E8B544";
const CARD_BORDER_LIGHT = "E2E6EE";
const CARD_BORDER_DARK = "1E2C44";
const RULE_LIGHT = "D9DEE7";
const RULE_DARK = "26344F";

const HEADER_FONT = "Calibri";
const BODY_FONT = "Calibri";

// ---------- helpers ----------
function pageNum(slide, num, onDark) {
  slide.addText(`0${num} / 08`, {
    x: 0.5, y: 0.3, w: 2, h: 0.3,
    fontFace: BODY_FONT, fontSize: 11,
    color: onDark ? MUTED_LIGHT : MUTED_DARK,
    charSpacing: 4, margin: 0,
  });
}

function eyebrow(slide, text, color, y = 0.65) {
  slide.addText(text, {
    x: 0.5, y, w: 5, h: 0.3,
    fontFace: BODY_FONT, fontSize: 11, bold: true,
    color, charSpacing: 4, margin: 0,
  });
}

function footer(slide, leftText, rightText, onDark) {
  const color = onDark ? MUTED_LIGHT : MUTED_DARK;
  slide.addText(leftText, {
    x: 0.5, y: 5.18, w: 5, h: 0.3,
    fontFace: BODY_FONT, fontSize: 10,
    color, charSpacing: 3, margin: 0,
  });
  slide.addText(rightText, {
    x: 4.5, y: 5.18, w: 5, h: 0.3,
    fontFace: BODY_FONT, fontSize: 10,
    color, charSpacing: 3, align: "right", margin: 0,
  });
}

// ---------- inline SVG illustrations (rasterized to PNG) ----------
async function svgToBase64(svgString) {
  const buffer = await sharp(Buffer.from(svgString)).png().toBuffer();
  return "image/png;base64," + buffer.toString("base64");
}

// Snowboard (top-down) — used on slide 2 (large) and as gear icon on slide 3
function snowboardSvg({ width = 600, height = 220, board = NAVY, edge = SKY, strap = AMBER }) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 600 220">
      <rect x="20" y="60" width="560" height="100" rx="50" ry="50" fill="#${board}" />
      <rect x="36" y="76" width="528" height="68" rx="34" ry="34" fill="none" stroke="#${edge}" stroke-width="3" />
      <rect x="180" y="50" width="80" height="120" rx="6" fill="#${strap}" />
      <rect x="340" y="50" width="80" height="120" rx="6" fill="#${strap}" />
    </svg>`;
}

// Bindings icon
function bindingsSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
      <rect x="20" y="50" width="200" height="80" rx="10" fill="#${NAVY}" />
      <rect x="50" y="65" width="40" height="30" rx="3" fill="#${AMBER}" />
      <rect x="150" y="65" width="40" height="30" rx="3" fill="#${AMBER}" />
      <rect x="20" y="105" width="200" height="25" rx="4" fill="#${SKY}" />
    </svg>`;
}

// Boots icon
function bootsSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="180" viewBox="0 0 200 180">
      <path d="PLACEHOLDER" fill="#${NAVY}" />
      <rect x="65" y="55" width="70" height="18" rx="3" fill="#${AMBER}" />
      <rect x="40" y="115" width="120" height="20" rx="3" fill="#${SKY}" />
    </svg>`;
}

// Helmet & goggles icon
function helmetSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
      <path d="M40 100 Q40 40 120 40 Q200 40 200 100 L200 110 L40 110 Z" fill="#${NAVY}" />
      <rect x="40" y="105" width="160" height="18" rx="3" fill="#${SKY}" />
    </svg>`;
}

// Snowboard from the side (heel-side / toe-side brake illustrations)
function heelSideSvg() {
  // Looking from the side: deck on top, heel edge dug into snow on the right (down)
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160">
      <line x1="20" y1="110" x2="300" y2="110" stroke="#${RULE_DARK}" stroke-width="1.5" />
      <!-- board tilted: heel edge (left) raised -->
      <polygon points="40,82 280,72 280,92 40,92" fill="#FFFFFF" />
      <polygon points="280,72 295,82 295,98 280,92" fill="#1B5775" />
      <polygon points="40,92 280,92 270,108 50,108" fill="#1B5775" />
    </svg>`;
}

function toeSideSvg() {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160">
      <line x1="20" y1="110" x2="300" y2="110" stroke="#0E3A52" stroke-width="1.5" />
      <!-- board tilted: toe edge (right side / front) raised -->
  
```