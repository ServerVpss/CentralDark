# COMANDO - biotech_series_b_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\biotech_series_b_pitch_deck.js
**SHA:** aa62de9cc818b5a4
**Timestamp:** 2026-08-28T02:52:32.588269
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardY = 1.25, cardW = 2.75, cardH = 1.45, gap = 0.15;
- const cardY = 1.15, cardH = 3.5, cardW = 2.95, gap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// build-mitorx.js
// Regenerates MitoRX.pptx — 15-slide Series B investor deck.
//
// Usage:
//   npm install pptxgenjs
//   node build-mitorx.js
//
// Requires: ./icons/image1.png … image8.png (ship these alongside this file)

const pptxgen = require("pptxgenjs");
const path = require("path");

const ICON_DIR = path.join(__dirname, "icons");
const ICONS = {
  target:      path.join(ICON_DIR, "image1.png"), // teal target/bullseye
  check:       path.join(ICON_DIR, "image2.png"), // teal check-circle
  heart:       path.join(ICON_DIR, "image3.png"), // teal heart
  star:        path.join(ICON_DIR, "image4.png"), // orange star
  arrow:       path.join(ICON_DIR, "image5.png"), // orange arrow-right
  chartLine:   path.join(ICON_DIR, "image6.png"), // white chart-line (used on teal circle)
  microscope:  path.join(ICON_DIR, "image7.png"), // white microscope
  flask:       path.join(ICON_DIR, "image8.png"), // white flask
};

// ---------- Color palette (all confirmed from source XML) ----------
const C = {
  navy:       "0A1628",
  darkTeal:   "0D9488", // header bar
  teal:       "14B8A6", // accent stripe, highlights
  tealDark:   "0B5563", // pipeline header row
  lightTeal:  "CCFBF1", // subtitle text on header
  cardBg:     "E8F3F1", // card fill
  cardBg2:    "F1F5F9", // alt row fill
  cardBorder: "D1D5DB",
  orange:     "F59E0B",
  orangeDk:   "D97706",
  white:      "FFFFFF",
  slate900:   "0F172A", // body text
  slate700:   "334155",
  slate500:   "64748B",
  slate400:   "94A3B8",
  slate300:   "CBD5E1",
  blue:       "3B82F6", // cardiovascular
  blueLt:     "60A5FA",
  purple:     "8B5CF6", // neurodegeneration
  purpleLt:   "A78BFA",
  red:        "DC2626",
};

const FONT_H = "Georgia";
const FONT_B = "Calibri";

// ---------- Presentation setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "MitoRx LLC";
pres.title  = "MitoRx Series B Investor Presentation";
const SW = 10, SH = 5.625;

// ---------- Reusable chrome ----------
// Teal header band on every content slide (slides 2-14)
function addHeader(slide, title, subtitle) {
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SW, h: 0.95, fill: { color: C.darkTeal }, line: { color: C.darkTeal },
  });
  slide.addText(title, {
    x: 0.5, y: 0.1, w: 9, h: 0.55, margin: 0,
    fontFace: FONT_H, fontSize: 28, bold: true, color: C.white, valign: "middle",
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5, y: 0.6, w: 9, h: 0.3, margin: 0,
      fontFace: FONT_B, fontSize: 13, color: C.lightTeal, valign: "middle",
    });
  }
}

// "KEY TAKEAWAY" dark-teal bar + italic footer ("MitoRx LLC | CONFIDENTIAL" + "N / 15")
function addFooter(slide, pageNum, takeaway) {
  // Takeaway bar
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 4.82, w: 9.2, h: 0.42,
    fill: { color: C.darkTeal }, line: { color: C.darkTeal },
  });
  slide.addText(
    [
      { text: "KEY TAKEAWAY:  ", options: { bold: true, color: C.orange, fontFace: FONT_B, fontSize: 12 } },
      { text: takeaway,          options: { color: C.white,  fontFace: FONT_B, fontSize: 12 } },
    ],
    { x: 0.55, y: 4.82, w: 8.9, h: 0.42, margin: 0, valign: "middle" }
  );
  // Page footer
  slide.addText("MitoRx LLC  |  CONFIDENTIAL", {
    x: 0.5, y: 5.32, w: 4, h: 0.25, margin: 0,
    fontFace: FONT_B, fontSize: 9, italic: true, color: C.slate500,
  });
  slide.addText(`${pageNum} / 15`, {
    x: 5.5, y: 5.32, w: 4, h: 0.25, margin: 0,
    fontFace: FONT_B, fontSize: 9, italic: true, color: C.slate500, align: "right",
  });
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navy };
  // Top teal stripe
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: SW, h: 0.06, fill: { color: C.teal }, line: { color: C.teal } });

  // "MitoRx" (white) + "LLC" (teal) — title
  s.addText("MitoRx", {
    x: 0.7, y: 1.15, w: 4.0, h: 0.7, margin: 0,
    fontFace: FONT_H, fontSize: 44, bold: true, color: C.white, valign: "middle",
  });
  s.addText("LLC", {
    x: 3.35, y: 1.15, w: 1.5, h: 0.7, margin: 0,
    fontFace: FONT_H, fontSize: 44, bold: true, color: C.teal, valign: "middle",
  });

  // Tagline
  s.addText("Mitochondria-Targeted Therapeutics for Unmet Medical Needs", {
    x: 0.7, y: 2.0, w: 7.0, h: 0.5, margin: 0,
    fontFace: FONT_B, fontSize: 18, color: C.lightTeal, valign: "middle",
  });

  // Orange accent line
  s.addShape(pres.shapes.LINE, {
    x: 0.7, y: 2.7, w: 3.0, h: 0,
    line: { color: C.orange, width: 2 },
  });

  // Subtitle
  s.addText("Series B Financing  |  Investor Presentation", {
    x: 0.7, y: 2.9, w: 7, h: 0.4, margin: 0,
    fontFace: FONT_B, fontSize: 15, color: C.slate300, valign: "middle",
  });

  // 4 stat callouts
  const stats = [
    { big: "$30M",  label: "FUNDRAISE"      },
    { big
```