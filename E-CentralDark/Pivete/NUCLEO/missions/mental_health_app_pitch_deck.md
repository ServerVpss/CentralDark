# MISSAO - mental_health_app_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\mental_health_app_pitch_deck.js
**SHA:** 4991f51c4197ff93
**Timestamp:** 2026-08-28T02:52:35.726667
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node build_plan9.js   →  produces Plan_9.pptx

### Gaps
- const bw = 4.55, bgap = 0.05;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreates Plan_9.pptx — "Boost" seed-round pitch deck (9 slides) using pptxgenjs.
// Run:  node build_plan9.js   →  produces Plan_9.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// Original deck is 20" x 11.25" (16:9). Define a custom layout to match exactly.
pres.defineLayout({ name: "BOOST_WIDE", width: 20, height: 11.25 });
pres.layout = "BOOST_WIDE";
pres.author = "Boost";
pres.title = "Boost — Seed Round 2026";
pres.company = "Boost";

// ---------- Color palette ----------
const C = {
  bg:        "FDF5EB", // cream background
  orange:    "E85D2C", // primary brand orange
  orangeDk:  "C84A1F", // deeper orange
  peach:     "F5C77C", // big decorative circle
  peachLt:   "FCE4BD", // pale peach
  peachVLt:  "FCEFD9", // very pale peach for SOM/TAM rings
  ivory:     "FFF8EC", // phone mockup bg light
  inkDark:   "2A1F12", // headline / dark text
  ink:       "3A2E20", // body dark
  body:      "4A3F2E", // body
  muted:     "9C8770", // muted, footer, sources
  divider:   "D8C8B0", // divider lines
  pink:      "F4A3A3", // logo pink dot
  sage:      "A6BFA8", // friendly sage green
  sageDk:    "6F8F71",
  phoneDark: "1F1410", // dark phone background
  cardBg:    "FFFFFF", // privacy card background
  shadow:    "000000",
};

// ---------- Helpers ----------
function addBackground(slide) {
  slide.background = { color: C.bg };
}

function addLogoTopLeft(slide, x = 0.7, y = 0.6) {
  slide.addShape(pres.shapes.OVAL, {
    x: x, y: y, w: 0.32, h: 0.32,
    fill: { color: C.orange }, line: { color: C.orange, width: 0 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: x + 0.2, y: y, w: 0.32, h: 0.32,
    fill: { color: C.pink }, line: { color: C.pink, width: 0 },
  });
  slide.addText("boost", {
    x: x + 0.65, y: y - 0.04, w: 1.5, h: 0.42,
    fontSize: 20, fontFace: "Calibri", color: C.inkDark, valign: "middle", margin: 0,
  });
}

function addFooter(slide, num) {
  // mini logo bottom-left
  slide.addShape(pres.shapes.OVAL, {
    x: 0.7, y: 10.78, w: 0.18, h: 0.18,
    fill: { color: C.orange }, line: { color: C.orange, width: 0 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: 0.82, y: 10.78, w: 0.18, h: 0.18,
    fill: { color: C.pink }, line: { color: C.pink, width: 0 },
  });
  slide.addText("boost", {
    x: 1.05, y: 10.74, w: 1.5, h: 0.28,
    fontSize: 13, fontFace: "Calibri", color: C.inkDark, valign: "middle", margin: 0,
  });
  // center confidential text
  slide.addText("Boost  ·  Seed Round 2026  ·  Confidential", {
    x: 7, y: 10.74, w: 6, h: 0.28,
    fontSize: 13, fontFace: "Calibri", color: C.muted,
    align: "center", valign: "middle", margin: 0,
  });
  // page number
  const padded = num.toString().padStart(2, "0");
  slide.addText(`${padded} / 09`, {
    x: 17.6, y: 10.74, w: 1.7, h: 0.28,
    fontSize: 13, fontFace: "Calibri", color: C.muted,
    align: "right", valign: "middle", charSpacing: 1.5, margin: 0,
  });
}

function addSectionLabel(slide, text, x = 0.85, y = 1.05) {
  slide.addText(text, {
    x: x, y: y, w: 8, h: 0.45,
    fontSize: 16, fontFace: "Calibri", bold: true,
    color: C.orange, charSpacing: 4, margin: 0, valign: "middle",
  });
}

// ============================================================================
// SLIDE 1 — Title
// ============================================================================
{
  const s = pres.addSlide();
  addBackground(s);

  // Big peach decorative circle, bottom-left, extends off slide
  s.addShape(pres.shapes.OVAL, {
    x: -3.5, y: 2.5, w: 14.5, h: 14.5,
    fill: { color: C.peach }, line: { color: C.peach, width: 0 },
  });

  // Top-left logo
  addLogoTopLeft(s, 0.85, 0.85);

  // Section label
  s.addText("A MENTAL WELLNESS COMPANION", {
    x: 0.85, y: 2.85, w: 10, h: 0.5,
    fontSize: 17, fontFace: "Calibri", bold: true,
    color: C.orange, charSpacing: 5, margin: 0, valign: "middle",
  });

  // Big headline (mixed colors / italic) - explicit break after "you"
  s.addText([
    { text: "When the ", options: { color: C.inkDark } },
    { text: "scroll", options: { color: C.orange, italic: true } },
    { text: " gets heavy, we lift you", options: { color: C.inkDark, breakLine: true } },
    { text: "up.", options: { color: C.inkDark } },
  ], {
    x: 0.85, y: 3.6, w: 18.5, h: 3.2,
    fontSize: 84, fontFace: "Calibri", bold: false,
    valign: "top", margin: 0,
  });

  // Italic body subtitle
  s.addText(
    "Boost listens for the moments your feed turns dark — and answers with\nwarmth, from people who love you.",
    {
      x: 0.85, y: 7.0, w: 11, h: 1.2,
      fontSize: 22, fontFace: "Calibri", italic: true,
      color: C.body, valign: "top", margin: 0,
    }
  );

  // Bottom-right ask block
  s.addText("SEED ROUND  ·  APRIL 2026", {
    x: 13.5, y: 9.0, w: 6, h: 0.4,
    fontSize: 16, fontFace: "Calibri", bold: true, color: C.muted,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
  s.addText("Raising $3.5M  ·  Pre-seed completed Q4 2025", {
 
```