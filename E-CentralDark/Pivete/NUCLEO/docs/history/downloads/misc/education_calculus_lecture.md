# OUTRO - education_calculus_lecture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_calculus_lecture.js
**SHA:** 4952357c6397d0cb
**Timestamp:** 2026-08-28T02:52:33.616086
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: node calculus.js

### Gaps
- const gap = 6;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Calculus.pptx — Replica via pptxgenjs
 * Replicates the original 8-slide "Introduction to Calculus" deck.
 * Layout: 13.33" x 7.5" (LAYOUT_WIDE)
 *
 * Run: node calculus.js
 */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaRegClock,
  FaChartBar,
  FaChartLine,
  FaChartArea,
  FaBook,
} = require("react-icons/fa");

// ---------------------------------------------------------------------------
// Color palette (sampled from the original)
// ---------------------------------------------------------------------------
const COLORS = {
  navy:        "0F1B2D", // dark slide background
  cream:       "F4EFE6", // light slide background
  ink:         "16263D", // primary dark text on cream
  bone:        "F4EFE6", // primary light text on navy
  coral:       "E8624D", // accent (orange/red)
  sage:        "8AAE8E", // accent (green)
  mutedDark:   "5C6470", // muted text on cream
  mutedLight:  "8590A0", // muted text on navy
  rule:        "C9C0B2", // hairline rule on cream
  ruleDark:    "2A3548", // hairline rule on navy
  gold:        "D9A441",
};

// ---------------------------------------------------------------------------
// Slide dimensions
// ---------------------------------------------------------------------------
const W = 13.333;
const H = 7.5;

// ---------------------------------------------------------------------------
// Icon helper — react-icons → SVG → PNG (base64)
// ---------------------------------------------------------------------------
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// Custom inline-SVG icons (rasterised) for unique vignettes.
async function svgToBase64Png(svgString, width = 512) {
  const png = await sharp(Buffer.from(svgString), { density: 300 })
    .resize({ width })
    .png()
    .toBuffer();
  return "image/png;base64," + png.toString("base64");
}

// ---------------------------------------------------------------------------
// Header / footer chrome shared by content slides
// ---------------------------------------------------------------------------
function addContentChrome(slide, opts) {
  const isDark = !!opts.dark;
  const muted = isDark ? COLORS.mutedLight : COLORS.mutedDark;
  const rule  = isDark ? COLORS.ruleDark   : COLORS.rule;

  // Top-left eyebrow (e.g., "02 · WHAT IT IS")
  slide.addText(opts.eyebrow, {
    x: 0.6, y: 0.45, w: 8, h: 0.4,
    fontFace: "Calibri", fontSize: 11, color: muted,
    charSpacing: 6, bold: false, margin: 0,
  });

  // Top-right pagination (e.g., "02 / 08")
  slide.addText(opts.page, {
    x: W - 2.0, y: 0.45, w: 1.4, h: 0.4,
    fontFace: "Calibri", fontSize: 11, color: muted,
    charSpacing: 6, align: "right", margin: 0,
  });

  // Bottom hairline rule
  slide.addShape("line", {
    x: 0.6, y: H - 0.85, w: W - 1.2, h: 0,
    line: { color: rule, width: 0.75 },
  });

  // Bottom-left footer
  slide.addText(opts.footerLeft, {
    x: 0.6, y: H - 0.6, w: 6, h: 0.35,
    fontFace: "Calibri", fontSize: 10, color: muted,
    charSpacing: 6, margin: 0,
  });

  // Bottom-right footer
  slide.addText(opts.footerRight, {
    x: W - 6.6, y: H - 0.6, w: 6, h: 0.35,
    fontFace: "Calibri", fontSize: 10, color: muted,
    charSpacing: 6, align: "right", margin: 0,
  });
}

// ---------------------------------------------------------------------------
// Build the deck
// ---------------------------------------------------------------------------
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pres.title = "Introduction to Calculus";
  pres.author = "Mr. Avery";

  // Pre-render icons we'll reuse
  const iconClock     = await iconToBase64Png(FaRegClock,  "#" + COLORS.ink, 256);
  const iconClockNavy = await iconToBase64Png(FaRegClock,  "#" + COLORS.ink, 256);
  const iconBars      = await iconToBase64Png(FaChartBar,  "#" + COLORS.ink, 256);
  const iconLine      = await iconToBase64Png(FaChartLine, "#" + COLORS.ink, 256);
  const iconArea      = await iconToBase64Png(FaChartArea, "#" + COLORS.sage, 256);
  const iconBook      = await iconToBase64Png(FaBook,      "#" + COLORS.sage, 256);
  const iconBars2     = await iconToBase64Png(FaChartBar,  "#" + COLORS.sage, 256);

  // -------------------------------------------------------------------------
  // SLIDE 1 — Title
  // -------------------------------------------------------------------------
  {
    const s = pres.addSlide();
    s.background = { color: COLORS.navy };

    // Eyebrows
    s.addText("UNIT 01 · LECTURE 01", {
      x: 0.6, y: 0.55, w: 5, h: 0.4,
      fontFace: "Calibri", fontSize: 11, color: COLORS.mutedLight,
   
```