# DECISAO - paragliding_school_prospectus.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\paragliding_school_prospectus.js
**SHA:** b8cfd8976010ef91
**Timestamp:** 2026-08-28T02:52:36.198350
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node paragliding.js
- const rowStart = boxY + 1.1;
- const cardStart = 0.7;
- const pYStart = 6.5;

### Principios
- { num: "01", dur: "02 DAYS · GROUND",  title: "Ground", titleI: "handling.",
- { num: "02", dur: "03 DAYS · HILL",    title: "First", titleI: "flights.",
- { num: "03", dur: "04 DAYS · ALTITUDE", title: "High", titleI: "altitude.",
- { num: "04", dur: "03 DAYS · P2",       title: "Certification &", titleI: "beyond.",
- num: "01", title: "Discovery", titleI: "tandem.", dark: true,
- num: "02", title: "P2 solo", titleI: "certificate.", dark: true,
- num: "03", title: "Thermal", titleI: "clinic.", dark: false,

### Gaps
- const gap = 0.25;
- const cardGap = 0.35;

### Ouro Bruto (primeiros 5000 chars)
```
// paragliding.js — Recreates paragliding.pptx with pptxgenjs
// Run: node paragliding.js
const pptxgen = require("pptxgenjs");
const path = require("path");

const IMG_DIR = __dirname; // images alongside this script

// Color palette extracted from original
const CREAM = "F4EFE6";
const NAVY = "0B1E2E";
const NAVY2 = "1A2E40";
const NAVY3 = "22333B";
const AMBER = "D97706";
const GOLD = "E9B949";
const SLATE_BLUE = "3D6B8A";
const LIGHT_CREAM = "EBE3D3";
const BLACK = "000000";

// Font stack
const SERIF = "Georgia";
const SANS = "Helvetica Neue";
const MONO = "Consolas";

// Slide dimensions (custom, matching original: 20" x 11.25")
const SW = 20;
const SH = 11.25;

const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM", width: SW, height: SH });
pres.layout = "CUSTOM";
pres.author = "Thermal & Co.";
pres.title = "Thermal & Co. — Prospectus";

// ============================================================
// SHARED HELPERS
// ============================================================

// Page chrome shared across interior slides (slides 2-7)
function addTopChrome(slide, chapterRight, darkMode = false) {
  const c = darkMode ? CREAM : NAVY;
  slide.addText("THERMAL & CO.", {
    x: 0.7, y: 0.4, w: 6, h: 0.5,
    fontSize: 14, fontFace: SANS, color: c, charSpacing: 8,
    bold: false, margin: 0,
  });
  if (chapterRight) {
    slide.addText(chapterRight, {
      x: SW - 8.7, y: 0.4, w: 8, h: 0.5,
      fontSize: 14, fontFace: SANS, color: c, charSpacing: 8,
      align: "right", margin: 0,
    });
  }
}

function addBottomChrome(slide, chapterLeft, pageStr, darkMode = false) {
  const c = darkMode ? CREAM : NAVY;
  slide.addText(chapterLeft, {
    x: 0.7, y: SH - 0.7, w: 6, h: 0.4,
    fontSize: 13, fontFace: SANS, color: c, charSpacing: 8,
    margin: 0,
  });
  slide.addText(pageStr, {
    x: SW - 8.7, y: SH - 0.7, w: 8, h: 0.4,
    fontSize: 13, fontFace: SANS, color: c, charSpacing: 8,
    align: "right", margin: 0,
  });
}

// Section label (roman numeral + dot + name) in amber/gold
function addSectionLabel(slide, x, y, w, text, color = AMBER) {
  slide.addText(text, {
    x, y, w, h: 0.5,
    fontSize: 14, fontFace: SANS, color, charSpacing: 8,
    bold: false, margin: 0,
  });
}

// Large serif title with italic accent word support
// parts: array of { text, italic?: bool, color? }
function addSerifTitle(slide, x, y, w, h, parts, sizePt = 64, defaultColor = NAVY) {
  const runs = parts.map((p, i) => ({
    text: p.text,
    options: {
      italic: !!p.italic,
      color: p.color || defaultColor,
      fontSize: sizePt,
      fontFace: SERIF,
      breakLine: !!p.breakLine,
    },
  }));
  slide.addText(runs, {
    x, y, w, h,
    fontFace: SERIF, fontSize: sizePt, color: defaultColor,
    valign: "top", margin: 0, paraSpaceAfter: 0,
  });
}

// ============================================================
// SLIDE 1 — Title: "Above Interlaken."
// ============================================================
{
  const s = pres.addSlide();
  s.background = { path: path.join(IMG_DIR, "image-1-1.jpeg") };

  // Small circle corner markers
  const ring = () => ({ type: "outer", color: BLACK, blur: 0, offset: 0, angle: 0, opacity: 0 });
  s.addShape(pres.shapes.OVAL, { x: 0.45, y: 0.45, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: CREAM, width: 1 } });
  s.addShape(pres.shapes.OVAL, { x: SW - 0.67, y: 0.45, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: CREAM, width: 1 } });
  s.addShape(pres.shapes.OVAL, { x: 0.45, y: SH - 0.67, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: CREAM, width: 1 } });
  s.addShape(pres.shapes.OVAL, { x: SW - 0.67, y: SH - 0.67, w: 0.22, h: 0.22, fill: { type: "none" }, line: { color: CREAM, width: 1 } });

  // Top header row
  s.addText("Thermal & Co.", {
    x: 1.3, y: 0.55, w: 6, h: 0.5,
    fontSize: 20, fontFace: SERIF, color: CREAM, italic: false, margin: 0,
  });
  s.addText([
    { text: "46.6863°N", options: { charSpacing: 8 } },
    { text: "    ", options: {} },
    { text: "7.8632°E", options: { charSpacing: 8 } },
    { text: "    ", options: {} },
    { text: "INTERLAKEN, CH", options: { charSpacing: 8 } },
  ], {
    x: SW - 10, y: 0.6, w: 8.3, h: 0.4,
    fontSize: 12, fontFace: SANS, color: CREAM, align: "right", margin: 0,
  });

  // Horizon/altitude row marker (thin line across)
  s.addShape(pres.shapes.LINE, {
    x: 1.3, y: 3.7, w: SW - 2.6, h: 0,
    line: { color: CREAM, width: 0.5, transparency: 60 },
  });
  s.addText("HORIZON", {
    x: 1.3, y: 3.35, w: 2, h: 0.3,
    fontSize: 10, fontFace: SANS, color: CREAM, charSpacing: 6, margin: 0, transparency: 20,
  });
  s.addText("2,358 M", {
    x: 6.8, y: 3.35, w: 2, h: 0.3,
    fontSize: 10, fontFace: SANS, color: CREAM, charSpacing: 6, margin: 0, align: "center", transparency: 20,
  });
  s.addText("1,950 M", {
    x: 11.3, y: 3.35, w: 2, h: 0.3,
    fontSize: 10, fontFace: SANS, color: CREAM, charSpacing: 6, margin: 0, align: "center", transparency: 20,
  })
```