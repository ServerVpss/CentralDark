# OUTRO - education_music_theory_lesson.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_music_theory_lesson.js
**SHA:** 31c08d8928cb6f80
**Timestamp:** 2026-08-28T02:52:33.812563
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.18;
- const lineGap = 0.45;
- const barGap = 0.15;
- const pieceGap = 0.05;
- const barGap = 0.08;

### Ouro Bruto (primeiros 5000 chars)
```
// Music Theory Presentation - pptxgenjs replica
// Recreates the original Music_Theory.pptx with minor enhancements:
//  - Slide 1: Widened title box so "Introduction" no longer breaks across lines.
//  - Slide 6: Time Signature column reordered so the "Time Signature" label sits
//    at the top with the other column headers (matching Beat / Measure pattern).

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Introduction to Music Theory";
pres.author = "Middle School Music";

// ---- Color palette (sampled from original) ----
const COLOR = {
  navy: "1E2A4A",        // primary deep navy
  cream: "F1ECE0",       // background warm off-white
  coral: "E86A52",       // primary accent / italic words
  gold: "C9974A",        // secondary accent
  muted: "8A8A7A",       // muted footer / labels
  bodyNavy: "1E2A4A",
  white: "FFFFFF",
};

const FONT_HEAD = "Calibri";   // bold sans-ish for headers
const FONT_BODY = "Calibri";
// Use a heavier system font for big titles -- "Calibri" with bold is reliable on most renderers
// We choose Verdana/Calibri combo to mimic the bold geometric sans look of the original.
const FONT_TITLE = "Verdana";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ---- Reusable helpers ----
function addEyebrow(slide, text, color = COLOR.coral) {
  slide.addText(text, {
    x: 0.7, y: 0.45, w: 8, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color, charSpacing: 4, margin: 0,
  });
}

function addFooter(slide, pageLabel, sectionLabel, dark = false) {
  const c = dark ? COLOR.cream : COLOR.muted;
  slide.addText(pageLabel, {
    x: 0.7, y: 7.0, w: 3, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: c,
    charSpacing: 2, margin: 0, transparency: dark ? 40 : 0,
  });
  slide.addText(sectionLabel, {
    x: SLIDE_W - 3.7, y: 7.0, w: 3, h: 0.35,
    fontFace: FONT_BODY, fontSize: 11, color: c,
    charSpacing: 4, align: "right", margin: 0, transparency: dark ? 40 : 0,
  });
}

// =====================================================================
// SLIDE 1 — Title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.navy };

  // top eyebrow with dot
  s.addShape(pres.shapes.OVAL, {
    x: 0.7, y: 0.62, w: 0.18, h: 0.18,
    fill: { color: COLOR.coral }, line: { color: COLOR.coral },
  });
  s.addText("MUSIC · UNIT 01", {
    x: 1.0, y: 0.5, w: 5, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color: COLOR.cream, charSpacing: 4, margin: 0,
  });

  // Big title — widened so "Introduction" stays on one line
  s.addText([
    { text: "Introduction to Music ", options: { color: COLOR.cream } },
    { text: "Theory.", options: { color: COLOR.coral, italic: true } },
  ], {
    x: 0.7, y: 1.85, w: 10.5, h: 3.2,
    fontFace: FONT_TITLE, fontSize: 78, bold: true,
    valign: "top", margin: 0,
  });

  // Subtitle
  s.addText("A first look at the language behind every song.", {
    x: 0.7, y: 5.25, w: 9, h: 0.5,
    fontFace: FONT_BODY, fontSize: 18, color: COLOR.gold, margin: 0,
  });

  // Bottom labels
  s.addText("MIDDLE SCHOOL MUSIC", {
    x: 0.7, y: 7.0, w: 5, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 12, bold: true,
    color: COLOR.cream, charSpacing: 4, margin: 0,
  });
  s.addText("LESSON ONE", {
    x: SLIDE_W - 3.5, y: 7.0, w: 2.8, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 12, bold: true,
    color: COLOR.cream, charSpacing: 4, align: "right", margin: 0,
  });

  // Decorative shapes on right (circle + line + square)
  s.addShape(pres.shapes.OVAL, {
    x: 11.2, y: 1.9, w: 1.4, h: 1.4,
    fill: { color: COLOR.coral }, line: { color: COLOR.coral },
  });
  s.addShape(pres.shapes.LINE, {
    x: 11.9, y: 3.4, w: 0, h: 1.2,
    line: { color: COLOR.gold, width: 2 },
  });
  s.addShape(pres.shapes.RECTANGLE, {
    x: 11.2, y: 4.7, w: 1.4, h: 1.4,
    fill: { color: COLOR.cream }, line: { color: COLOR.cream },
  });
}

// =====================================================================
// SLIDE 2 — What & Why (3 columns)
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };

  addEyebrow(s, "02 — WHAT & WHY");

  // Title
  s.addText([
    { text: "Music theory is the ", options: { color: COLOR.navy } },
    { text: "how", options: { color: COLOR.coral, italic: true } },
    { text: " and ", options: { color: COLOR.navy } },
    { text: "why", options: { color: COLOR.gold, italic: true } },
    { text: " of music.", options: { color: COLOR.navy } },
  ], {
    x: 0.7, y: 1.0, w: 12, h: 1.8,
    fontFace: FONT_TITLE, fontSize: 42, bold: true,
    valign: "top", margin: 0,
  });

  // 3 columns
  const cols = [
    { num: "1", color: COLOR.navy, head: "Read it",
      body: "Turn the dots and lines on a page into actual sounds." },
    { num: "2", color: COLOR.coral, head: "Talk about it",
      
```