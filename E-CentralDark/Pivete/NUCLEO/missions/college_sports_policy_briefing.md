# MISSAO - college_sports_policy_briefing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\college_sports_policy_briefing.js
**SHA:** 72662e1a1095310f
**Timestamp:** 2026-08-28T02:52:32.816268
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const arrowGap = 0.18;
- const colGap = 0.5;
- const colGap = 0.3;
- const colGap = 0.4;
- const colGap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.title = "EO Briefing — College Sports";

// Palette: Charcoal Minimal + oxblood accent
const BG = "F7F5F0";       // warm off-white
const INK = "1A1A1A";      // primary text
const MUTED = "7A7A7A";    // secondary text
const ACCENT = "7B2D26";   // oxblood
const HAIR = "D9D5CC";     // hairline

const HEAD = "Georgia";
const BODY = "Calibri";

const W = 13.3;
const H = 7.5;
const ML = 0.8;  // left margin
const MR = 0.8;  // right margin
const MT = 0.6;  // top margin

// --- helpers ---
function addBase(slide, { pageNum, footer } = {}) {
  slide.background = { color: BG };
  // small accent square top-left as motif
  slide.addShape(pres.shapes.RECTANGLE, {
    x: ML, y: MT, w: 0.18, h: 0.18,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 }
  });
  // page number
  if (pageNum) {
    slide.addText(String(pageNum).padStart(2, "0"), {
      x: W - 1.0, y: H - 0.5, w: 0.6, h: 0.3,
      fontFace: BODY, fontSize: 10, color: MUTED, align: "right", margin: 0
    });
  }
  // footer (right of page number area, left-aligned at bottom)
  if (footer) {
    slide.addText(footer, {
      x: ML, y: H - 0.5, w: 8, h: 0.3,
      fontFace: BODY, fontSize: 10, color: MUTED, italic: true, margin: 0
    });
  }
}

function addEyebrow(slide, text) {
  slide.addText(text.toUpperCase(), {
    x: ML + 0.35, y: MT - 0.06, w: 8, h: 0.3,
    fontFace: BODY, fontSize: 10, color: MUTED, charSpacing: 3, valign: "middle", margin: 0
  });
}

function addTitle(slide, text, y = 1.1) {
  slide.addText(text, {
    x: ML, y, w: W - ML - MR, h: 0.9,
    fontFace: HEAD, fontSize: 36, color: INK, bold: false, margin: 0
  });
}

// =====================================================
// SLIDE 0 — Title Slide
// =====================================================
{
  const s = pres.addSlide();
  s.background = { color: BG };

  // accent square top-left
  s.addShape(pres.shapes.RECTANGLE, {
    x: ML, y: MT, w: 0.18, h: 0.18,
    fill: { color: ACCENT }, line: { color: ACCENT, width: 0 }
  });

  // eyebrow
  s.addText("EXECUTIVE BRIEFING", {
    x: ML + 0.35, y: MT - 0.06, w: 8, h: 0.3,
    fontFace: BODY, fontSize: 10, color: MUTED, charSpacing: 3, valign: "middle", margin: 0
  });

  // main title
  s.addText("Executive Order on College Sports", {
    x: ML, y: 2.5, w: W - ML - MR, h: 0.95,
    fontFace: HEAD, fontSize: 42, color: INK, align: "center", margin: 0
  });
  s.addText("& Its Implications", {
    x: ML, y: 3.3, w: W - ML - MR, h: 0.95,
    fontFace: HEAD, fontSize: 42, color: ACCENT, align: "center", margin: 0
  });

  // bottom meta
  s.addText("April 2026", {
    x: ML, y: H - 0.8, w: W - ML - MR, h: 0.45,
    fontFace: BODY, fontSize: 18, color: MUTED, italic: true, align: "center", margin: 0
  });
}

// =====================================================
// SLIDE 1 — Title / Bottom Line
// =====================================================
{
  const s = pres.addSlide();
  addBase(s, { pageNum: 1 });
  addEyebrow(s, "Overview");

  s.addText("Core Issue", {
    x: ML, y: 1.4, w: W - ML - MR, h: 0.9,
    fontFace: HEAD, fontSize: 40, color: INK, margin: 0
  });

  s.addText([
    { text: "The executive order uses ", options: { color: INK } },
    { text: "federal research funding", options: { color: ACCENT, bold: true } },
    { text: " as leverage to regulate college sports.", options: { color: INK } }
  ], {
    x: ML + 0.5, y: 2.7, w: W - ML - MR, h: 1.0,
    fontFace: HEAD, fontSize: 24, margin: 0
  });

  s.addText("KEY POINTS", {
    x: ML + 0.5, y: 4.3, w: 8, h: 0.5,
    fontFace: HEAD, fontSize: 22, color: MUTED, bold: true, margin: 0
  });

  s.addText([
    { text: "NCAA violations trigger federal \"present responsibility\" review", options: { bullet: true, breakLine: true } },
    { text: "DoD, HHS, and NSF dollars become the enforcement mechanism", options: { bullet: true, breakLine: true } },
    { text: "Effective August 1, 2026 — enforceability uncertain", options: { bullet: true } }
  ], {
    x: ML + 0.6, y: 4.85, w: W - ML - MR - 1.1, h: 2.4,
    fontFace: HEAD, fontSize: 19, color: INK, paraSpaceAfter: 14, margin: 0, valign: "top"
  });

  s.addText("April 2026", {
    x: W - 2.5, y: H - 0.5, w: 1.7, h: 0.3,
    fontFace: BODY, fontSize: 10, color: MUTED, align: "right", margin: 0
  });
}

// =====================================================
// SLIDE 2 — The Mechanism (icon diagram)
// =====================================================
{
  const s = pres.addSlide();
  addBase(s, { pageNum: 2 });
  addEyebrow(s, "How it works");
  addTitle(s, "Mechanism");

  // Layout — first circle's left edge at ML+0.5, last circle's right edge symmetric
  const circleD = 1.1;
  const circleR = circleD / 2;
  const cellW = (W - ML - MR) / 4;
  const firstCX = ML + 0.5 + circleR;
  const lastCX = W - MR - 0.5 - circleR;
  const step = (lastCX - firstCX) / 3;
  const centers = [0, 1, 2, 
```