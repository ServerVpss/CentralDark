# OUTRO - bakery_concept_vision_board.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\bakery_concept_vision_board.js
**SHA:** be8c5a6505ccbc5d
**Timestamp:** 2026-08-28T02:52:32.492732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node pastry_ann_arbor.js

### Ouro Bruto (primeiros 5000 chars)
```
// pastry_ann_arbor.js
// Recreates "pastry_ann_arbor.pptx" using pptxgenjs.
// Run:  node pastry_ann_arbor.js
// Requires: npm install pptxgenjs   (or:  npm install -g pptxgenjs)

const pptxgen = require("pptxgenjs");

// ---------- Setup ----------
const pres = new pptxgen();
pres.title = "Pastry, plainly. — Ann Arbor";
pres.defineLayout({ name: "CUSTOM_20x1125", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x1125";

// ---------- Palette ----------
const C = {
  cream:        "F9EFD4",
  cream2:       "F4EAD8",
  cream3:       "FAF3E2",
  cream4:       "FFF4D4",
  butter:       "F7E9BF",
  butterDk:     "E8DCC0",
  ochre:        "D49A4A",
  ochreCard:    "ECDFC6",
  brand:        "C0392B",   // red accent
  rust:         "C34A35",
  brown:        "2B1D12",
  brownDk:      "3A2615",
  brownDk2:     "5A3A20",
  brownMid:     "4A3220",
  caramel:      "8A4A18",
  caramel2:     "D8A050",
  caramel3:     "F0D090",
  caramel4:     "D8A86C",
  cocoa:        "3A2615",
  butterPat:    "E8D4A8",
  marble:       "ECEAD8",
  sage:         "4A5734",
  sage2:        "5A6A3A",
  sageLite:     "7A8A4E",
  creamHi:      "FAECC8",
  creamHi2:     "FAEBC8",
  paleSand:     "F0E2C2",
  pendBulb:     "FFE9A8",
  pendShadow:   "28190A",
  ceilingTrim:  "8A5A30",
  floor:        "5A3A20",
  goldGlow:     "E8C878",
  cream5:       "FAF3E2",
  windowSill:   "B8A878",
  windowSill2:  "8A7A4A",
  benchBrown:   "4A2E18",
};

// Convert XML "spc" (1/100 of a point) to pptxgenjs "charSpacing" (points).
const spc = (v) => v / 100;
// Convert XML "sz" (1/100 of a point) to pptxgenjs "fontSize" (points).
const sz = (v) => v / 100;

const FONT = "Arial";

// ============================================================
//  SLIDE 1 — Cover
// ============================================================
function slide1() {
  const s = pres.addSlide();
  // Left cream panel
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 20, h: 11.25, fill: { color: C.cream }, line: { color: C.cream }
  });
  // Right ochre panel
  s.addShape(pres.shapes.RECTANGLE, {
    x: 10, y: 0, w: 10, h: 11.25, fill: { color: C.ochre }, line: { color: C.ochre }
  });

  // Top-left mark — small red dot + tiny eyebrow
  s.addShape(pres.shapes.OVAL, {
    x: 1.146, y: 1.195, w: 0.104, h: 0.104,
    fill: { color: C.brand }, line: { color: C.brand }
  });
  s.addText("A VISION BOARD", {
    x: 1.438, y: 1.146, w: 2.098, h: 0.245, margin: 0,
    fontFace: FONT, fontSize: sz(1200), color: C.brownMid, charSpacing: spc(336), align: "left"
  });
  s.addText("/", {
    x: 3.64, y: 1.146, w: 0.176, h: 0.245, margin: 0,
    fontFace: FONT, fontSize: sz(1200), color: C.brownMid, charSpacing: spc(336), align: "left"
  });
  s.addText("ANN ARBOR, MI", {
    x: 3.921, y: 1.146, w: 1.959, h: 0.245, margin: 0,
    fontFace: FONT, fontSize: sz(1200), color: C.brownMid, charSpacing: spc(336), align: "left"
  });

  // Big headline "Daily & good." with red ampersand
  s.addText([
    { text: "Daily ",  options: { italic: true, color: C.brown,  fontFace: FONT, fontSize: sz(16500), charSpacing: spc(-660) } },
    { text: "& ",      options: { italic: true, color: C.brand,  fontFace: FONT, fontSize: sz(16500), charSpacing: spc(-660) } },
    { text: "good.",   options: { italic: true, color: C.brown,  fontFace: FONT, fontSize: sz(16500), charSpacing: spc(-660) } },
  ], { x: 1.146, y: 3.304, w: 9.12, h: 4.075, margin: 0, align: "left", valign: "top" });

  // Body line bottom-left
  s.addText("A neighborhood pastry shop. Baked every morning. Honest prices. No theatrics.", {
    x: 1.146, y: 9.537, w: 3.862, h: 0.608, margin: 0,
    fontFace: FONT, fontSize: sz(1200), color: C.brownMid, charSpacing: spc(48), align: "left"
  });
  // Eyebrow on left, bottom-right
  s.addText("VOL. 01 SPRING 2026 MOOD & DIRECTION", {
    x: 7.274, y: 9.292, w: 1.893, h: 0.854, margin: 0,
    fontFace: FONT, fontSize: sz(975), color: C.brownMid, charSpacing: spc(215), align: "right"
  });

  // Right panel — concentric circles
  s.addShape(pres.shapes.OVAL, {
    x: 12.594, y: 3.219, w: 4.812, h: 4.812,
    fill: { color: C.ochre }, line: { color: C.creamHi2, width: 0.75 }
  });
  s.addShape(pres.shapes.OVAL, {
    x: 12.698, y: 3.323, w: 4.604, h: 4.604,
    fill: { color: C.ochre }, line: { color: C.creamHi2, width: 0.75 }
  });
  // Inner stamp text
  s.addText("— Est. 2026 —", {
    x: 14.085, y: 4.331, w: 1.83, h: 0.213, margin: 0,
    fontFace: FONT, fontSize: sz(1050), color: C.creamHi, charSpacing: spc(420), align: "center"
  });
  s.addText("Pastry, plainly.", {
    x: 12.594, y: 4.815, w: 4.812, h: 1.704, margin: 0,
    fontFace: FONT, fontSize: sz(6300), italic: true, color: C.creamHi, align: "center", valign: "middle",
    wrap: false
  });
  s.addText("Ann Arbor · Michigan", {
    x: 13.872, y: 6.769, w: 2.257, h: 0.192, margin: 0,
    fontFace: FONT, fontSize: sz(900), color: C.creamHi, charSpacing: spc(360), align: "center"
  });
}

// ==============================================
```