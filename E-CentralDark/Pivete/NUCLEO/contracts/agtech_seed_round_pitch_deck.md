# CONTRATO - agtech_seed_round_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\agtech_seed_round_pitch_deck.js
**SHA:** 83ad20bde2a4c450
**Timestamp:** 2026-08-28T02:52:31.884128
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardW = 5.7, cardH = 5.2, cardY = 4.3, cardGap = 0.3, cardStartX = 1.0;
- const engineW = 5.7, engineY = 3.8, engineGap = 0.3, engineStartX = 1.0;
- const stepW = 4.3, stepY = 4.5, stepGap = 0.2, stepStartX = 1.0;
- const plotW = 3.55, plotH = 1.2, plotGap = 0.15;
- const statCardY = 9.3, statCardH = 1.6, statCardW = 4.0, statCardGap = 0.4;
- const credW = 6.2, credH = 1.25, credGap = 0.4;
- const allocW = 5.6, allocY = 6.3, allocStartX = 1.0, allocGap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
// Terracoat Seed Round Pitch Deck - pptxgenjs replica
// Custom dimensions: 20" x 11.25" (matches source deck)
//
// Usage:
//   npm install pptxgenjs
//   node generate.js
// Produces: terracoat.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "TERRACOAT", width: 20, height: 11.25 });
pres.layout = "TERRACOAT";
pres.title = "Terracoat - Seed Round 2026";
pres.author = "Terracoat";

// ----- Palette -----
const C = {
  green:    "15301F",  // dark forest (dark-slide bg)
  greenAlt: "1A3A26",  // slightly lighter for inset banner
  cream:    "F2ECDD",  // cream (light-slide bg)
  creamCard:"F8F3E6",  // lighter cream for cards
  orange:   "C85A2E",  // terracotta accent
  orangeAlt:"B85027",  // deeper terracotta
  peach:    "F0A57E",  // peach/soft pink (italic accents on dark bg)
  dark:     "1A1A1A",  // near-black body text on cream
  muted:    "6B6B6B",  // muted gray
  mutedLt:  "8B8B8B",  // lighter muted
  sage:     "7A8B5C",  // sage green
  rule:     "D4CEBF",  // thin rule on cream
  ruleDk:   "2A4A33",  // thin rule on dark
  tan:      "D9B88C",  // tan placeholder circles
  outerRing:"E8DFC8",  // outermost TAM circle on slide 7
};

const FONT = "Arial";

// Recurring header: orange dot + "TERRACOAT · NN" left, section title right, divider below
function addHeader(slide, slideNum, sectionTitle, isDark = false) {
  const textColor = isDark ? C.cream : C.dark;
  const mutedColor = isDark ? C.mutedLt : C.muted;
  const ruleColor = isDark ? C.ruleDk : C.rule;

  slide.addShape(pres.shapes.OVAL, {
    x: 1.0, y: 0.85, w: 0.22, h: 0.22,
    fill: { color: C.orange }, line: { color: C.orange, width: 0 },
  });
  slide.addText(`TERRACOAT · ${String(slideNum).padStart(2, "0")}`, {
    x: 1.35, y: 0.72, w: 6, h: 0.5,
    fontFace: FONT, fontSize: 14, bold: true, color: textColor,
    charSpacing: 4, align: "left", valign: "middle", margin: 0,
  });
  slide.addText(sectionTitle, {
    x: 12, y: 0.72, w: 7, h: 0.5,
    fontFace: FONT, fontSize: 14, color: mutedColor,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
  slide.addShape(pres.shapes.LINE, {
    x: 1.0, y: 1.45, w: 18.0, h: 0,
    line: { color: ruleColor, width: 0.75 },
  });
}

// ===============================================================
// SLIDE 1 - Title
// ===============================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: C.green };

  // Concentric circles bottom-right motif
  s.addShape(pres.shapes.OVAL, {
    x: 11.5, y: 3.0, w: 10.2, h: 10.2,
    fill: { color: C.peach, transparency: 88 },
    line: { color: C.peach, transparency: 75, width: 0.75 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 12.6, y: 4.1, w: 8.0, h: 8.0,
    fill: { color: C.orange, transparency: 80 },
    line: { color: "000000", width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 13.8, y: 5.3, w: 5.6, h: 5.6,
    fill: { color: C.orangeAlt, transparency: 30 },
    line: { color: "000000", width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 14.9, y: 6.4, w: 3.4, h: 3.4,
    fill: { color: C.orange }, line: { color: "000000", width: 0 },
  });
  s.addShape(pres.shapes.OVAL, {
    x: 15.8, y: 7.3, w: 1.6, h: 1.6,
    fill: { color: C.peach }, line: { color: "000000", width: 0 },
  });

  // Top-left brand
  s.addShape(pres.shapes.OVAL, {
    x: 1.2, y: 0.95, w: 0.3, h: 0.3,
    fill: { color: C.orange }, line: { color: C.orange, width: 0 },
  });
  s.addText("Terracoat", {
    x: 1.65, y: 0.8, w: 4, h: 0.6,
    fontFace: FONT, fontSize: 20, color: C.cream,
    align: "left", valign: "middle", margin: 0,
  });

  // Top-right
  s.addText("SEED ROUND · 2026", {
    x: 13, y: 0.8, w: 6, h: 0.6,
    fontFace: FONT, fontSize: 15, color: C.mutedLt, charSpacing: 6,
    align: "right", valign: "middle", margin: 0,
  });

  // Headline "Seeds that know their soil."
  s.addText([
    { text: "Seeds that\nknow their ", options: { color: C.cream } },
    { text: "soil.", options: { color: C.peach, italic: true } },
  ], {
    x: 1.1, y: 1.8, w: 14, h: 5.4,
    fontFace: FONT, fontSize: 108,
    align: "left", valign: "top", margin: 0,
  });

  // Subhead
  s.addText(
    "Custom microbial coatings, matched to every field's biology — engineered strain-by-strain, delivered seed-by-seed.",
    {
      x: 1.1, y: 8.2, w: 9.2, h: 1.5,
      fontFace: FONT, fontSize: 16, color: C.cream,
      align: "left", valign: "top", margin: 0,
    }
  );

  // Bottom-left
  s.addText("CONFIDENTIAL / INVESTOR PREVIEW", {
    x: 1.1, y: 10.3, w: 8, h: 0.4,
    fontFace: FONT, fontSize: 11, color: C.mutedLt, charSpacing: 6,
    align: "left", valign: "middle", margin: 0,
  });

  // Bottom-right RAISING / $2,000,000
  s.addText("RAISING", {
    x: 14, y: 9.9, w: 5, h: 0.4,
    fontFace: FONT, fontSize: 11, color: C.mutedLt, charSpacing: 6,
    align: "right", valign: "middle", margin: 0,
  });
  s.addText("$2,000,000", {
    x: 14, y: 10.3, 
```