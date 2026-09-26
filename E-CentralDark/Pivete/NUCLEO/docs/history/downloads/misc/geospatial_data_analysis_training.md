# OUTRO - geospatial_data_analysis_training.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\geospatial_data_analysis_training.js
**SHA:** 91f0935a8771d40e
**Timestamp:** 2026-08-28T02:52:35.000659
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const Y_START    = (7.50 - TOTAL_H) / 2;    // vertically centered

### Gaps
- const H_GAP  = 1.05;
- const V_GAP  = 0.85;

### Ouro Bruto (primeiros 5000 chars)
```
// Geospatial Data Analysis — minimal rebuild (11 slides)
const pptxgen = require("pptxgenjs");
const PA_DATA = require("./pa_export.json");
const US_PROJ = require("./us_projections.json");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.title = "Geospatial Data Analysis";
pres.author = "Data Science Team";

// ─────────────────────────────────────────────
// PALETTE — slate + blue
// ─────────────────────────────────────────────
const C = {
  white:      "FFFFFF",
  ink:        "0F172A",
  inkSoft:    "1E293B",
  muted:      "64748B",
  rule:       "E2E8F0",
  mist:       "F1F5F9",
  brand:      "2563EB",
  brandLite:  "93C5FD",
  brandPale:  "DBEAFE",
  warn:       "F59E0B",
  warnPale:   "FEF3C7",
  bad:        "DC2626",
  good:       "059669",
};

// ── Typography ──
// Poppins is a geometric sans-serif from Google Fonts — circular
// counters, uniform stroke width, confident display proportions.
// Much more refined than Calibri at large display sizes.
//
// Font embedding on deployment: if the target machine doesn't have
// Poppins installed, PowerPoint will fall back to the closest
// available geometric sans. Common fallbacks: Century Gothic (Office
// bundle), Futura (macOS), Avenir (macOS), then Calibri.
const FONT_H = "Poppins";
const FONT_B = "Poppins";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function newSlide() {
  const s = pres.addSlide();
  s.background = { color: C.white };
  return s;
}

function addTitle(s, title, opts) {
  const w = (opts && opts.w) || 12;
  const fontSize = (opts && opts.fontSize) || 38;   // bigger title
  const ruleW = (opts && opts.ruleW) || 6.50;        // shorter rule (doesn't run over content)
  s.addText(title, {
    x: 0.75, y: 0.45, w: w, h: 1.0,
    fontFace: FONT_H, fontSize: fontSize, color: C.ink, bold: true, margin: 0,
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.75, y: 1.45, w: ruleW, h: 0,
    line: { color: C.rule, width: 0.75 },
  });
}

// Compact takeaway-title helper used on slides 2–15.
// Reserves a ~1.15" band at the top of every slide. Content on each
// slide is expected to start at y ≥ 1.25 to clear the rule.
function slideTitle(s, text) {
  s.addText(text, {
    x: 0.60, y: 0.32, w: 12.10, h: 0.78,
    fontFace: FONT_H, fontSize: 28, color: C.ink, bold: true, margin: 0,
  });
  s.addShape(pres.shapes.LINE, {
    x: 0.60, y: 1.15, w: 12.10, h: 0,
    line: { color: C.brand, width: 1.5 },
  });
}

// ═════════════════════════════════════════════
// SLIDE 1 — TITLE
// Editorial split layout: three stacked words on the left
// (GEOSPATIAL / DATA / ANALYSIS, all-caps, left-aligned), with the
// 3D continental US (with city pins) as the hero visual on the right.
// All-caps + tight tracking gives each word a monolithic rectangular
// footprint, which packs more cleanly in a constrained left column
// and leaves plenty of room for the map hero on the right.
// ═════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };

  // Three words stacked vertically, left-aligned, ALL CAPS
  const WORDS = ["GEOSPATIAL", "DATA", "ANALYSIS"];
  const TITLE_SIZE = 64;
  const LINE_H     = 1.05;            // height of each text box
  const TOTAL_H    = WORDS.length * LINE_H;
  const Y_START    = (7.50 - TOTAL_H) / 2;    // vertically centered

  WORDS.forEach((word, i) => {
    s.addText(word, {
      x: 0.75, y: Y_START + i * LINE_H, w: 6.30, h: LINE_H,
      fontFace: FONT_H, fontSize: TITLE_SIZE, color: C.ink, bold: true,
      align: "left", valign: "middle", margin: 0,
      charSpacing: 2,
    });
  });

  // Hero visual: 3D continental US with city pins (8 major US cities)
  // Image is ~1328×937, aspect ≈ 1.417 (landscape with headroom for pins)
  const HERO_ASPECT = 1.417;
  const HERO_W      = 5.80;
  const HERO_H      = HERO_W / HERO_ASPECT;    // ≈ 4.09
  const HERO_X      = 13.30 - HERO_W - 0.60;   // right margin 0.60
  const HERO_Y      = (7.50 - HERO_H) / 2;     // vertically centered

  s.addImage({
    path: "/home/assets/us_3d_pins.png",
    x: HERO_X, y: HERO_Y, w: HERO_W, h: HERO_H,
  });
}

// ═════════════════════════════════════════════
// SLIDE 2 — VECTOR vs RASTER
// Subtitle sits just above the two columns, everything packed
// tighter so there's no white gap at the top. Content block is
// roughly vertically centered on the slide.
// ═════════════════════════════════════════════
{
  const s = newSlide();

  slideTitle(s, "Vector stores shapes. Raster stores pixels.");

  // Divider — shifted and lengthened to match the new content block
  s.addShape(pres.shapes.LINE, {
    x: 6.65, y: 1.80, w: 0, h: 5.10,
    line: { color: C.rule, width: 0.75 },
  });

  // ── VECTOR ──
  s.addText("VECTOR", {
    x: 0.75, y: 1.80, w: 5.5, h: 0.35,
    fontFace: FONT_B, fontSize: 12, color: C.brand, bold: true, charSpacing: 5, margin: 0,
  });
  s.addText("Points, lines, polygons", {
    x: 0.75, y
```