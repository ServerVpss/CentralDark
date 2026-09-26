# COMANDO - healthcare_ma_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\healthcare_ma_pitch_deck.js
**SHA:** 6b23294084c9864f
**Timestamp:** 2026-08-28T02:52:34.905620
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.12;
- const cardGap = 0.12;
- const rowGap = 0.08;
- const mGap = 0.06;
- const barGap = 0.28;
- const sGap = 0.1;
- const rGap = 0.12;
- const cardGap = 0.15;
- const pGap = 0.15;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ── Resolve media directory (beside this script) ──
const MEDIA = path.join(__dirname, "media");
function img(name) { return path.join(MEDIA, name); }

// ── Color palette ──
const C = {
  navy:      "1E2A3A",
  navyDark:  "172231",
  gold:      "C5A55A",
  white:     "FFFFFF",
  offWhite:  "F7F8FA",
  lightGray: "E8EAED",
  midGray:   "9CA3AF",
  darkGray:  "4B5563",
  text:      "1F2937",
  textLight: "6B7280",
  cream:     "FDF6E3",
  red:       "C0392B",
  amber:     "D4A017",
  green:     "27AE60",
  blueGray:  "2D3E50",
};

// ── Presentation setup ──
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "Goldman Sachs";
pres.title  = "Project Helix - Tempus AI Acquisition";

// ── Helper: standard content slide header ──
function addContentHeader(slide, title, slideNum, totalSlides) {
  // White background is default
  // Title
  slide.addText(title, {
    x: 0.6, y: 0.3, w: 8.4, h: 0.7,
    fontSize: 18, fontFace: "Arial", bold: true, color: C.text,
    margin: 0,
  });
  // Tempus logo top-right
  slide.addImage({ path: img("image1.png"), x: 9.15, y: 0.3, w: 0.45, h: 0.45 });
  // Source/Note area and page number
  if (slideNum) {
    slide.addText(`${slideNum} / ${totalSlides}`, {
      x: 9.0, y: 5.15, w: 0.7, h: 0.3,
      fontSize: 9, color: C.midGray, align: "right", fontFace: "Arial",
    });
  }
}

function addSourceNote(slide, source, note) {
  let y = 4.85;
  if (source) {
    slide.addText(`Source: ${source}`, {
      x: 0.6, y: y, w: 8.0, h: 0.2,
      fontSize: 7, italic: true, color: C.midGray, fontFace: "Arial", margin: 0,
    });
    y += 0.18;
  }
  if (note) {
    slide.addText(`Note: ${note}`, {
      x: 0.6, y: y, w: 8.0, h: 0.2,
      fontSize: 7, italic: true, color: C.midGray, fontFace: "Arial", margin: 0,
    });
  }
}

// ═══════════════════════════════════════════════════════
// SLIDE 1 – Title Slide (Dark Navy Background)
// ═══════════════════════════════════════════════════════
(function slide1() {
  const s = pres.addSlide();
  s.background = { color: C.navyDark };

  // Gold top bar
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.gold } });

  // Logo + PROJECT HELIX
  s.addImage({ path: img("image1.png"), x: 0.7, y: 0.4, w: 0.5, h: 0.5 });
  s.addText("P R O J E C T   H E L I X", {
    x: 1.35, y: 0.45, w: 3.5, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.gold, charSpacing: 2, margin: 0,
  });

  // Company name
  s.addText("Tempus AI, Inc. (NASDAQ: TEM)", {
    x: 0.7, y: 1.1, w: 8.5, h: 0.65,
    fontSize: 32, fontFace: "Arial", bold: true, color: C.white, margin: 0,
  });

  // Subtitle italic gold
  s.addText("Potential Acquisition at $14-16B Enterprise Value", {
    x: 0.7, y: 1.8, w: 8, h: 0.45,
    fontSize: 18, fontFace: "Arial", italic: true, color: C.gold, margin: 0,
  });

  // Description
  s.addText("AI-Enabled Precision Medicine & Diagnostics Platform", {
    x: 0.7, y: 2.4, w: 8, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: C.midGray, margin: 0,
  });

  // Location/stats line
  s.addText("Chicago, IL  |  FY25 Revenue $1.27B (+83% YoY)  |  Market Cap ~$8.9B", {
    x: 0.7, y: 2.8, w: 8, h: 0.3,
    fontSize: 11, fontFace: "Arial", color: C.midGray, margin: 0,
  });

  // Horizontal rule
  s.addShape(pres.shapes.LINE, {
    x: 0.7, y: 3.25, w: 8.6, h: 0,
    line: { color: C.gold, width: 1 },
  });

  // KPI Cards
  const kpis = [
    { value: "$1.27B",  label: "FY25 Revenue" },
    { value: "+83%",    label: "YoY Growth" },
    { value: "3,000+",  label: "US Providers" },
    { value: "$330M",   label: "Est. Synergies" },
    { value: "$764M",   label: "Cash Position" },
  ];
  const cardW = 1.62;
  const gap = 0.12;
  const startX = 0.7;
  const cardY = 3.55;
  const cardH = 1.1;
  kpis.forEach((kpi, i) => {
    const cx = startX + i * (cardW + gap);
    s.addShape(pres.shapes.RECTANGLE, {
      x: cx, y: cardY, w: cardW, h: cardH,
      fill: { color: C.blueGray },
    });
    s.addText(kpi.value, {
      x: cx, y: cardY + 0.15, w: cardW, h: 0.5,
      fontSize: 22, fontFace: "Arial", bold: true, color: C.gold, align: "center", margin: 0,
    });
    s.addText(kpi.label, {
      x: cx, y: cardY + 0.65, w: cardW, h: 0.3,
      fontSize: 9, fontFace: "Arial", color: C.midGray, align: "center", margin: 0,
    });
  });

  // Footer
  s.addText("GOLDMAN SACHS  |  HEALTHCARE M&A  |  CONFIDENTIAL  |  April 2026", {
    x: 0, y: 5.1, w: 10, h: 0.35,
    fontSize: 8, fontFace: "Arial", color: C.midGray, align: "center", charSpacing: 1,
  });
})();

// ═══════════════════════════════════════════════════════
// SLIDE 2 – Executive Summary
// ═══════════════════════════════════════════════════════
(function slide2() {
  const s = pres.addSlide();
  addContentHeader(s, "We recommend pursuing Tempus AI at $14-16B EV via 60/40 cash/stock, creating $330M in synergies", 2, 14);

  // Tabl
```