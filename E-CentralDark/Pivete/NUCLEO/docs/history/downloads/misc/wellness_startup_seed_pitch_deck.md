# OUTRO - wellness_startup_seed_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\wellness_startup_seed_pitch_deck.js
**SHA:** 64bc5e7b0748eddd
**Timestamp:** 2026-08-28T02:52:37.857666
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node create_exact.js

### Ouro Bruto (primeiros 5000 chars)
```
// ============================================================
// THERMAL CAFE — Exact Reconstruction from manually edited PPTX
// Reverse-engineered from uploaded_deck.pptx via XML analysis
//
// IMAGE FILES REQUIRED (place in same directory as this script):
//   uploaded_img/photo_hotsprings.png  — hot springs photo (cover + slide 7 left)
//   uploaded_img/south_end_map.png     — South End map (slide 3)
//   uploaded_img/floor_plan.png        — floor plan (slide 6)
//   uploaded_img/photo_infrared.png    — infrared cycling photo (slide 7 right)
//   uploaded_img/photo_yoga.png        — yoga/pilates photo (slide 8 left)
//   uploaded_img/photo_strength.png    — strength floor photo (slide 8 right)
//   uploaded_img/photo_cafe.png        — cafe photo (slide 9)
//
// Run: node create_exact.js
// Output: Thermal_Cafe_Dark_Premium.pptx
// ============================================================

const pptxgen = require("pptxgenjs");
const path    = require("path");
const fs      = require("fs");

const p = new pptxgen();
p.layout  = "LAYOUT_WIDE"; // 13.333" × 7.5"
p.author  = "Thermal Cafe";
p.title   = "Thermal Cafe — Investor Presentation";

// ─────────────────────────────────────────────────────────────
// EXACT COLOR PALETTE (from XML srgbClr values)
// ─────────────────────────────────────────────────────────────
const C = {
  bg:         "0D1B2A",  // slide background — all slides
  bgMid:      "112236",  // table header fill, ask banner sub-text bg
  bgCard:     "16293F",  // card surface / table odd rows
  bgCardAlt:  "1A3050",  // table even rows
  gold:       "C9A84C",  // primary accent — eyebrows, stats, pips, bullets
  teal:       "4EC9B0",  // pillar 2 accent
  salmon:     "FF7E79",  // pillar 3 accent (manually changed in deck)
  white:      "F0EDE6",  // warm white — headlines
  body:       "B8C4D0",  // body text / timeline detail
  muted:      "6B8299",  // captions, sources, footer, kpi labels
  ruleBright: "2D4F6B",  // visible rules / axis / dividers
  ruleSubtle: "1E3A52",  // footer rule
  ruleFaint:  "2D4F6B",  // kpi row rules (same as ruleBright)
};

// ─────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS (all measured in inches from XML EMU values)
// ─────────────────────────────────────────────────────────────
const PW   = 13.333;
const PH   = 7.5;
const M    = 0.55;        // left margin
const CW   = 12.233;      // content width (PW - 2*M)
const FONT = "Calibri";

// Title block positions (shared across all content slides)
const PIP_X      = 0.55;   // gold left pip x
const PIP_Y      = 0.40;   // gold pip y
const PIP_W      = 0.038;  // gold pip width
const PIP_H      = 1.25;   // gold pip height
const EYEBROW_X  = 0.67;
const EYEBROW_Y  = 0.40;
const EYEBROW_W  = 12.113;
const EYEBROW_H  = 0.26;
const TITLE_X    = 0.67;
const TITLE_Y    = 0.68;
const TITLE_H    = 0.88;
const DIVIDER_Y  = 1.65;
const SOURCE_Y   = 6.92;
const FRULE_Y    = 7.14;   // footer rule y
const FOOT_Y     = 7.20;

const R = (f) => path.resolve(__dirname, f);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// Shadow — fresh object each call (pptxgenjs mutates in-place)
const mkShadow = () => ({ type: "outer", blur: 16, offset: 3, angle: 135, color: "000000", opacity: 0.40 });

// Standard title block used on every content slide (slides 2–14)
function titleBlock(s, eyebrow, headline, headlineW) {
  // Gold left pip
  s.addShape(p.shapes.RECTANGLE, {
    x: PIP_X, y: PIP_Y, w: PIP_W, h: PIP_H,
    fill: { color: C.gold }, line: { type: "none" },
  });
  // Eyebrow
  s.addText(eyebrow, {
    x: EYEBROW_X, y: EYEBROW_Y, w: headlineW || EYEBROW_W, h: EYEBROW_H,
    fontSize: 11, bold: true, color: C.gold, fontFace: FONT, charSpacing: 3.5, margin: 0,
  });
  // Headline
  s.addText(headline, {
    x: TITLE_X, y: TITLE_Y, w: headlineW || 12.4567, h: TITLE_H,
    fontSize: 22, bold: true, color: C.white, fontFace: FONT,
    valign: "top", lineSpacingMultiple: 1.18, margin: 0,
  });
  // Divider rule
  s.addShape(p.shapes.RECTANGLE, {
    x: M, y: DIVIDER_Y, w: CW, h: 0.018,
    fill: { color: C.ruleBright }, line: { type: "none" },
  });
}

// Footer: source line + footer rule + confidential + page number
function footer(s, source, pageNum) {
  if (source) {
    s.addText("Source: " + source, {
      x: M, y: SOURCE_Y, w: 8.8078, h: 0.22,
      fontSize: 9, italic: true, color: C.muted, fontFace: FONT, margin: 0,
    });
  }
  s.addShape(p.shapes.RECTANGLE, {
    x: M, y: FRULE_Y, w: CW, h: 0.012,
    fill: { color: C.ruleSubtle }, line: { type: "none" },
  });
  s.addText("Thermal Cafe  |  Confidential", {
    x: M, y: FOOT_Y, w: 5.0, h: 0.20,
    fontSize: 8, color: C.muted, fontFace: FONT, margin: 0,
  });
  s.addText(pageNum + " / 14", {
    x: 11.283, y: FOOT_Y, w: 1.5, h: 0.20,
    fontSize: 8, color: C.muted, fontFace: FONT, align: "right", margin: 0,
  });
}

// Dark raised car
```