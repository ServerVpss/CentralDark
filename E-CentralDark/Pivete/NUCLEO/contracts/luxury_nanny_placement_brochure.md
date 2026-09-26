# CONTRATO - luxury_nanny_placement_brochure.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\luxury_nanny_placement_brochure.js
**SHA:** e6e1c5878966085d
**Timestamp:** 2026-08-28T02:52:35.595795
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:

### Gaps
- const gap = 0;

### Ouro Bruto (primeiros 5000 chars)
```
// Thoughtful Cares — Private Family Brochure
// Replica built with pptxgenjs
//
// Run:
//   npm install pptxgenjs
//   node build.js
//
// Output: Thoughtful-Cares.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.author = "Thoughtful Cares";
pres.title = "A Private Family Brochure — Spring 2026";

// Custom layout matches the source deck (20" x 11.25", still 16:9)
pres.defineLayout({ name: "TC_LAYOUT", width: 20, height: 11.25 });
pres.layout = "TC_LAYOUT";

// ---------- Palette ----------
const COLOR = {
  cream:     "F4EFE7", // primary background
  creamDark: "EAE3D6", // right sidebar / image placeholders
  offWhite:  "FBF8F2", // card fill
  ink:       "1E1C19", // near-black text
  inkSoft:   "4A453D", // secondary dark
  muted:     "8A8478", // muted tan labels
  mutedLt:   "C9C1B1", // light tan lines / dividers
  sage:      "5E7560", // sage green accent
  black:     "0F0E0C", // dark panel (slide 8 center, slide 9 right)
};

// ---------- Type ----------
const SANS = "Arial";
const MONO = "JetBrains Mono";

// ---------- Helpers ----------
const LEFT = 1.0;                 // standard left gutter
const RIGHT_EDGE = 20 - 1.0;      // right-edge content boundary

// Top bar (section label left, "Thoughtful Cares" italic right) + page number footer
function chromeTopBottom(slide, {
  sectionRoman,
  sectionName,
  footerLabel,
  pageNum, // e.g., "02 / 09"
  brandColor = COLOR.ink,
  labelColor = COLOR.muted,
  mutedColor = COLOR.muted,
}) {
  // Top-left: "I · OUR PHILOSOPHY"
  slide.addText(`${sectionRoman} · ${sectionName}`, {
    x: LEFT, y: 0.7, w: 10, h: 0.35,
    fontFace: MONO, fontSize: 10, color: labelColor, charSpacing: 4,
    margin: 0, valign: "middle",
  });

  // Top-right: italic "Thoughtful Cares"
  slide.addText("Thoughtful Cares", {
    x: 12.5, y: 0.7, w: 6.5, h: 0.35,
    fontFace: SANS, fontSize: 14, italic: true, color: brandColor,
    align: "right", margin: 0, valign: "middle",
  });

  // Bottom-left: footer label
  if (footerLabel) {
    slide.addText(footerLabel, {
      x: LEFT, y: 10.6, w: 6, h: 0.3,
      fontFace: MONO, fontSize: 9, color: mutedColor, charSpacing: 4,
      margin: 0, valign: "middle",
    });
  }

  // Bottom-right: page count
  if (pageNum) {
    slide.addText(pageNum, {
      x: 13, y: 10.6, w: 6, h: 0.3,
      fontFace: MONO, fontSize: 9, color: mutedColor, charSpacing: 4,
      align: "right", margin: 0, valign: "middle",
    });
  }
}

// Big "display" headline with one word italic in sage
function displayHeadline(slide, { x, y, w, h, parts, fontSize = 88, color = COLOR.ink, accent = COLOR.sage, lineSpacingMultiple = 0.95 }) {
  // parts: array of { text, italic?, color? } joined with breaks/spaces as given
  const runs = parts.map((p, i) => ({
    text: p.text,
    options: {
      italic: !!p.italic,
      color: p.color || (p.italic ? accent : color),
      fontFace: SANS,
      fontSize,
      breakLine: !!p.breakLine,
    },
  }));
  slide.addText(runs, {
    x, y, w, h,
    fontFace: SANS, fontSize, color, bold: false,
    margin: 0, valign: "top",
    lineSpacingMultiple,
  });
}

// =====================================================================
// SLIDE 1 — Cover
// =====================================================================
(function slide1() {
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };

  // Right sidebar (darker cream) spanning right ~35% of slide
  s.addShape(pres.shapes.RECTANGLE, {
    x: 13, y: 0, w: 7, h: 11.25,
    fill: { color: COLOR.creamDark }, line: { type: "none" },
  });

  // Top row (left side)
  s.addText("THOUGHTFUL CARES", {
    x: LEFT, y: 0.85, w: 5, h: 0.35,
    fontFace: MONO, fontSize: 11, color: COLOR.ink, charSpacing: 6, bold: true,
    margin: 0, valign: "middle",
  });
  s.addText("EST. 2014 · LONDON", {
    x: 6.5, y: 0.85, w: 5, h: 0.35,
    fontFace: MONO, fontSize: 10, color: COLOR.muted, charSpacing: 5,
    align: "center", margin: 0, valign: "middle",
  });

  // Subtitle under THOUGHTFUL CARES
  s.addText("A PRIVATE FAMILY BROCHURE · SPRING 2026", {
    x: LEFT, y: 1.3, w: 8, h: 0.35,
    fontFace: MONO, fontSize: 10, color: COLOR.muted, charSpacing: 5,
    margin: 0, valign: "middle",
  });

  // HEADLINE — "The care of a family, practised as a craft."
  displayHeadline(s, {
    x: LEFT, y: 2.2, w: 11.5, h: 6,
    parts: [
      { text: "The care of a",  breakLine: true },
      { text: "family,",        italic: true, breakLine: true },
      { text: "practised as",   breakLine: true },
      { text: "a craft.",       },
    ],
    fontSize: 96,
    lineSpacingMultiple: 0.98,
  });

  // Body copy under headline
  s.addText(
    "Norland-trained nannies, placed with the world's most considered families. Discreet, deeply skilled, and chosen with the patience they deserve.",
    {
      x: LEFT, y: 8.6, w: 5.8, h: 1.3,
      fontFace: SANS, fontSize: 14, color: COLOR.inkSoft,
      margin: 0, valign: "top", lineSpacingMultiple: 1
```