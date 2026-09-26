# OUTRO - education_intro_chemistry_lecture.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_intro_chemistry_lecture.js
**SHA:** 82f8b8eab6ff0824
**Timestamp:** 2026-08-28T02:52:33.980033
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- grid:  { cols: 4, rows: 3, gap: 0.18 },
- grid:  { cols: 4, rows: 3, gap: 0.22, jitter: true },
- grid:  { cols: 3, rows: 2, gap: 0.55, jitter: true },
- const gap = 0.05;
- const mixGap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Chemistry 101 — Lecture 01 — Introduction to Chemistry
 * pptxgenjs replica of the Chemistry.pptx deck.
 *
 * Design notes:
 *   - Palette: cream background, deep navy accent, black text, sage + muted gray supporting
 *   - Typography: Helvetica Neue for body, sans-serif italics for accent words
 *   - Layout: every content slide has a top-left chapter label ("01 — DEFINITION"),
 *     bottom-left page number ("02 / 08"), bottom-right section name ("DEFINITION")
 *   - Italic blue words are the recurring visual motif
 *
 * Aesthetic enhancements vs the original (the user explicitly invited these):
 *   - Fixed text-overflow defects on slides 3 and 8 where labels were cut off
 *     ("02 — RELEVA" → "02 — RELEVANCE", "CH 0" → "CH 02" etc.)
 *   - Brightened the pale "next" italic on slide 8 from a very light blue to the
 *     deck's primary navy so it reads at a glance
 *   - Tightened spacing on the bottom rows of slides 3 and 8 so the columns sit
 *     comfortably above the slide edge
 */

const pptxgen = require("pptxgenjs");

// ---------- design tokens ----------
const COLORS = {
  bg:        "F1ECDF",  // warm cream background
  ink:       "1A1A1A",  // body / titles
  navy:      "1F3DA8",  // accent blue (italic words, key elements)
  navyLight: "8FA4D9",  // softened navy for "next." accent (slide 8)
  muted:     "6B6B6B",  // small caps labels
  mutedSoft: "9A9A9A",  // very soft labels
  divider:   "D9D2C2",  // hairline separators
  sage:      "8FA67E",  // sage accent (slide 5 electron, slide 6 mixture)
  black:     "000000",
};

const FONT_BODY  = "Helvetica Neue";
const FONT_TITLE = "Helvetica Neue";

// slide is 13.333" × 7.5" (LAYOUT_WIDE)
const W = 13.333;
const H = 7.5;

// ---------- create deck ----------
const pres = new pptxgen();
pres.layout    = "LAYOUT_WIDE";
pres.title     = "Introduction to Chemistry";
pres.author    = "CHEM 101";
pres.company   = "CHEM 101 / Lecture 01";

// ---------- shared chrome (top label + bottom page no + section tag) ----------
function addChrome(slide, { topLabel, page, section }) {
  // top-left chapter label, e.g. "01 — DEFINITION"
  slide.addText(topLabel, {
    x: 0.7, y: 0.55, w: 6, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10, color: COLORS.muted,
    charSpacing: 4, bold: false, margin: 0,
  });

  // bottom-left page indicator, e.g. "02 / 08"
  slide.addText(page, {
    x: 0.7, y: 6.85, w: 2, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, color: COLORS.muted,
    charSpacing: 3, margin: 0,
  });

  // bottom-right section name, e.g. "DEFINITION"
  slide.addText(section, {
    x: W - 4.7, y: 6.85, w: 4, h: 0.3,
    fontFace: FONT_BODY, fontSize: 10, color: COLORS.muted,
    charSpacing: 4, align: "right", margin: 0,
  });
}

// ============================================================================
// SLIDE 1 — Title slide
// ============================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };

  // top-left lecture tag
  s.addText("CHEM 101 / LECTURE 01", {
    x: 0.7, y: 0.55, w: 5, h: 0.4,
    fontFace: FONT_BODY, fontSize: 11, color: COLORS.ink,
    charSpacing: 5, bold: false, margin: 0,
  });

  // top-right semester tag
  s.addText("A first look · Fall semester", {
    x: W - 5.2, y: 0.55, w: 4.5, h: 0.4,
    fontFace: FONT_BODY, fontSize: 11, color: COLORS.muted,
    align: "right", italic: false, margin: 0,
  });

  // big title — "Introduction to" (black) + "Chemistry" (navy italic) + "."
  s.addText(
    [
      { text: "Introduction to ", options: { color: COLORS.ink, bold: false, italic: false, breakLine: true } },
      { text: "Chemistry",        options: { color: COLORS.navy, italic: true,  bold: false } },
      { text: ".",                options: { color: COLORS.ink, italic: false, bold: false } },
    ],
    {
      x: 0.65, y: 1.6, w: 12.5, h: 4.4,
      fontFace: FONT_TITLE, fontSize: 110, bold: false,
      valign: "top", margin: 0, lineSpacingMultiple: 1.0,
    }
  );

  // navy circle, bottom-right
  s.addShape(pres.shapes.OVAL, {
    x: W - 2.0, y: H - 2.0, w: 1.1, h: 1.1,
    fill: { color: COLORS.navy }, line: { type: "none" },
  });

  // bottom tagline
  s.addText("THE SCIENCE OF STUFF", {
    x: 0.7, y: H - 0.6, w: 6, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: COLORS.ink,
    charSpacing: 5, bold: false, margin: 0,
  });
}

// ============================================================================
// SLIDE 2 — Definition
// ============================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bg };
  addChrome(s, { topLabel: "01 — DEFINITION", page: "02 / 08", section: "DEFINITION" });

  // big title left side: "What is chemistry?" with "is" in navy italic
  s.addText(
    [
      { text: "What ",       options: { color: COLORS.ink,  italic: false, breakLine: false } },
      { text: "is",          options: { color: COLORS.navy, italic: t
```