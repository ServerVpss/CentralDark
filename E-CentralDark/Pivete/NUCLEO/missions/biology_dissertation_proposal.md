# MISSAO - biology_dissertation_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\biology_dissertation_proposal.js
**SHA:** 3592b9563adda51f
**Timestamp:** 2026-08-28T02:52:32.288673
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node build_presentation.js

### Gaps
- const gap = 0.2;
- const gap = 0.3;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Committee Meeting — Year 2
 * Dissertation Track Plan: Roots, Microbes, and the Cereal Rhizosphere
 *
 * Regenerates the 8-slide committee presentation using pptxgenjs.
 * Run:  node build_presentation.js
 */

const pptxgen = require("pptxgenjs");

// ---------- Design tokens ----------
const COLOR = {
  darkBg:       "1B2420",   // dark slide background (slide 1 + open-question band)
  cream:        "F1EDE3",   // main light background (slides 2, 3, 5, 8)
  beige:        "E8DFC8",   // warmer alt background (slides 4, 7)
  cardCream:    "F5EFE2",   // lighter card fill on beige background
  ink:          "1B2420",   // near-black body text on light bg
  body:         "3B3F3A",   // dark grey body
  muted:        "7A7F76",   // muted labels (uppercase eyebrow)
  mutedLight:   "A7A79A",   // muted labels on dark bg
  forest:       "3B5D3A",   // primary accent green
  forestDeep:   "2C4A2B",   // deeper green
  moss:         "7A9A6A",   // secondary moss
  terracotta:   "C26A33",   // accent orange/terracotta
  terracottaSoft:"D48A5B",  // softer terracotta
  hairline:     "C9C4B4",   // subtle divider on light bg
  hairlineDark: "2A3530",   // divider on dark bg
  greenIce:     "CADCFC",   // unused - placeholder
  subtitleOnDark:"C9C4B4",  // subtitle on dark slide
  titleOnDark:  "EFE9D9",   // title color on dark bg
};

const FONT = {
  head: "Georgia",
  body: "Calibri",
  mono: "Consolas",
};

// ---------- Presentation setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";  // 13.3 x 7.5 in
pres.title = "Committee Meeting — Year 2";
pres.author = "Graduate Researcher";

const W = 13.333;   // slide width
const H = 7.5;      // slide height
const MARGIN_X = 0.85;

// ---------- helpers ----------
function addEyebrow(slide, label, pageStr, onDark = false) {
  const labelColor = onDark ? COLOR.mutedLight : COLOR.muted;
  slide.addText(label, {
    x: MARGIN_X, y: 0.55, w: 8, h: 0.35,
    fontFace: FONT.body, fontSize: 10, bold: false,
    color: labelColor, charSpacing: 4, margin: 0,
  });
  slide.addText(pageStr, {
    x: W - MARGIN_X - 2, y: 0.55, w: 2, h: 0.35,
    fontFace: FONT.body, fontSize: 10,
    color: labelColor, charSpacing: 4, align: "right", margin: 0,
  });
}

function addTitle(slide, text, opts = {}) {
  const {
    y = 1.55, h = 1.5, size = 40, color = COLOR.ink,
    w = W - 2 * MARGIN_X, italic = false, runs = null, x = MARGIN_X,
  } = opts;
  if (runs) {
    slide.addText(runs, {
      x, y, w, h,
      fontFace: FONT.head, fontSize: size, color,
      valign: "top", margin: 0,
    });
  } else {
    slide.addText(text, {
      x, y, w, h,
      fontFace: FONT.head, fontSize: size, color, italic,
      valign: "top", margin: 0,
    });
  }
}

// ======================================================================
// SLIDE 1  —  Title / dark cover
// ======================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: COLOR.darkBg };

  addEyebrow(s, "COMMITTEE MEETING — YEAR 2", "01 / 08", true);

  // Small "DISSERTATION TRACK PLAN" chip (bordered box)
  s.addShape(pres.shapes.RECTANGLE, {
    x: MARGIN_X, y: 1.55, w: 3.1, h: 0.45,
    fill: { color: COLOR.darkBg },
    line: { color: COLOR.mutedLight, width: 0.75 },
  });
  s.addText("DISSERTATION TRACK PLAN", {
    x: MARGIN_X, y: 1.55, w: 3.1, h: 0.45,
    fontFace: FONT.body, fontSize: 10, color: COLOR.subtitleOnDark,
    charSpacing: 4, align: "center", valign: "middle", margin: 0,
  });

  // Main title
  addTitle(s, "Roots, Microbes, and the Cereal Rhizosphere", {
    y: 2.25, h: 2.1, size: 54, color: COLOR.titleOnDark,
    w: W - 2 * MARGIN_X - 1.5,
  });

  // Subtitle
  s.addText(
    "Single-cell transcriptomics and spatial metagenomics to map who lives where along cereal roots — and what each partner is doing.",
    {
      x: MARGIN_X, y: 4.55, w: 10.5, h: 1.0,
      fontFace: FONT.body, fontSize: 16, color: COLOR.subtitleOnDark,
      valign: "top", margin: 0,
    }
  );

  // Bottom hairline above footer meta
  s.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 6.25, w: W - 2 * MARGIN_X, h: 0,
    line: { color: COLOR.hairlineDark, width: 0.75 },
  });

  // Footer metadata — 3 columns
  const metaY = 6.45;
  const col1X = MARGIN_X;
  const col2X = 4.6;
  const col3X = 8.2;

  // STUDENT
  s.addText("STUDENT", {
    x: col1X, y: metaY, w: 2.5, h: 0.3,
    fontFace: FONT.body, fontSize: 9, color: COLOR.mutedLight,
    charSpacing: 3, margin: 0,
  });
  s.addText("GRADUATE RESEARCHER · Y2", {
    x: col1X, y: metaY + 0.32, w: 3.5, h: 0.3,
    fontFace: FONT.body, fontSize: 11, bold: true, color: COLOR.titleOnDark,
    charSpacing: 1, margin: 0,
  });

  // PROGRAM
  s.addText("PROGRAM", {
    x: col2X, y: metaY, w: 2.5, h: 0.3,
    fontFace: FONT.body, fontSize: 9, color: COLOR.mutedLight,
    charSpacing: 3, margin: 0,
  });
  s.addText("PLANT BIOLOGY / MICROBIOME", {
    x: col2X, y: metaY + 0.32, w: 3.5, h: 0.3,
  
```