# OUTRO - food_beverage_seed_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\food_beverage_seed_pitch_deck.js
**SHA:** 31dd5a205edba527
**Timestamp:** 2026-08-28T02:52:34.777808
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const colGap = 0.25;

### Ouro Bruto (primeiros 5000 chars)
```
// Harbor & Hearth — Investor Pitch Replica
// Built with pptxgenjs
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.author = "Harbor & Hearth";
pres.title = "Harbor & Hearth — Investor Pitch";

// ─── Palette ──────────────────────────────────────────────────────────────
const NAVY = "0F2A3A";        // primary dark background
const CREAM = "F0E3C7";       // primary light background / light text on dark
const AMBER = "D48A3A";       // accent
const DARK_MUTED = "6E8594";  // muted blue-gray body text on cream
const LIGHT_MUTED = "8FA3B0"; // muted text on navy
const LINE_DARK = "2B4050";   // subtle divider on navy
const LINE_LIGHT = "C9BFA3";  // subtle divider on cream

// ─── Layout constants ────────────────────────────────────────────────────
const SW = 13.333;
const SH = 7.5;
const MARGIN = 0.66;

// ─── Helpers ─────────────────────────────────────────────────────────────
function addLogoMark(slide, onDark) {
  const ringColor = onDark ? CREAM : NAVY;
  const dotColor = AMBER;
  const textColor = onDark ? CREAM : NAVY;
  // Ring
  slide.addShape(pres.shapes.OVAL, {
    x: MARGIN, y: 0.57, w: 0.3, h: 0.3,
    fill: { type: "solid", color: onDark ? NAVY : CREAM },
    line: { color: ringColor, width: 1.25 },
  });
  // Center dot
  slide.addShape(pres.shapes.OVAL, {
    x: MARGIN + 0.105, y: 0.675, w: 0.09, h: 0.09,
    fill: { color: dotColor }, line: { color: dotColor, width: 0 },
  });
  slide.addText("HARBOR & HEARTH", {
    x: MARGIN + 0.42, y: 0.55, w: 3, h: 0.35,
    fontFace: "Arial", fontSize: 10.5, bold: true, color: textColor,
    charSpacing: 3, valign: "middle", margin: 0,
  });
}

function addTopRight(slide, text, onDark) {
  slide.addText(text, {
    x: SW - MARGIN - 4.5, y: 0.55, w: 4.5, h: 0.35,
    fontFace: "Arial", fontSize: 10.5, color: onDark ? LIGHT_MUTED : DARK_MUTED,
    charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });
}

function addFooter(slide, rightLabel, onDark) {
  const color = onDark ? LIGHT_MUTED : DARK_MUTED;
  slide.addText("HARBOR & HEARTH", {
    x: MARGIN, y: SH - 0.62, w: 4, h: 0.3,
    fontFace: "Arial", fontSize: 10.5, color,
    charSpacing: 3, valign: "middle", margin: 0,
  });
  slide.addText(rightLabel, {
    x: SW - MARGIN - 5, y: SH - 0.62, w: 5, h: 0.3,
    fontFace: "Arial", fontSize: 10.5, color,
    charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });
}

// ═════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addLogoMark(s, true);
  addTopRight(s, "INVESTOR PITCH / SPRING 2026", true);

  // Small amber horizontal bar above title
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN, y: 3.24, w: 0.42, h: 0.035,
    fill: { color: AMBER }, line: { color: AMBER, width: 0 },
  });

  // Title
  s.addText("Harbor &\nHearth.", {
    x: MARGIN, y: 3.4, w: 8.5, h: 2.75,
    fontFace: "Georgia", fontSize: 84, color: CREAM,
    bold: false, valign: "top", margin: 0, lineSpacingMultiple: 1.0,
  });

  // Subtitle (italic)
  s.addText(
    "A market-to-table seafood experience for travelers in Boston's Seaport.",
    {
      x: MARGIN, y: 6.18, w: 7.5, h: 0.7,
      fontFace: "Georgia", fontSize: 16, italic: true, color: CREAM,
      valign: "top", margin: 0,
    }
  );

  // Bottom-right confidential stack
  s.addText(
    [
      { text: "BOSTON, MA SEAPORT", options: { breakLine: true } },
      { text: "DISTRICT SERIES SEED ·", options: { breakLine: true } },
      { text: "CONFIDENTIAL" },
    ],
    {
      x: SW - MARGIN - 3, y: 6.1, w: 3, h: 0.95,
      fontFace: "Arial", fontSize: 10.5, color: LIGHT_MUTED,
      charSpacing: 3, align: "right", valign: "top", margin: 0,
    }
  );
}

// ═════════════════════════════════════════════════════════════════════════
// SLIDE 2 — The Opportunity (cream bg, 2-col with stats)
// ═════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: CREAM };

  // Eyebrow top-left
  s.addText("01 / THE OPPORTUNITY", {
    x: MARGIN, y: 0.55, w: 5, h: 0.35,
    fontFace: "Arial", fontSize: 10.5, color: DARK_MUTED,
    charSpacing: 3, valign: "middle", margin: 0,
  });
  // Page number top-right
  s.addText("02 / 08", {
    x: SW - MARGIN - 2, y: 0.55, w: 2, h: 0.35,
    fontFace: "Arial", fontSize: 10.5, color: DARK_MUTED,
    charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });

  // Vertical divider
  s.addShape(pres.shapes.LINE, {
    x: 6.55, y: 1.3, w: 0, h: 5.4,
    line: { color: LINE_LIGHT, width: 0.75 },
  });

  // LEFT: headline with amber accent words
  s.addText(
    [
      { text: "Boston draws millions of visitors who crave ", options: { color: NAVY } },
      { text: "seafood and story", options: { color: AMBER } },
      { text: " —and are routi
```