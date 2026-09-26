# CONTRATO - finance_vc_investment_memo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_vc_investment_memo.js
**SHA:** 7ad6772fde6cdb0d
**Timestamp:** 2026-08-28T02:52:34.261377
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build_deck.js

### Ouro Bruto (primeiros 5000 chars)
```
// build_deck.js
// Replica of Lunar_Family_Offices.pptx using pptxgenjs.
// Run: node build_deck.js
// Output: Lunar_Family_Offices.pptx in the current working directory.

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLOR = {
  darkBg:     "0D0C0A",   // near-black for body slides
  taupeBg:    "B8B2A0",   // warm taupe for title slide
  creamBg:    "EDE7D6",   // cream for slides 6 & 10
  ink:        "0D0C0A",   // dark body text on cream
  cream:      "EDE7D6",   // cream text / moon
  white:      "F2EEE2",   // warm off-white for headline text on dark
  amber:      "C89A2E",   // primary gold accent
  amberDim:   "8A6A1F",
  mutedOnDark:    "6A6558",  // low-contrast mono labels on dark
  mutedOnCream:   "7A7566",  // low-contrast mono labels on cream
  bodyOnDark:     "BCB7A8",  // body copy on dark
  bodyOnCream:    "3E3A30",  // body copy on cream
  rule:           "2A2720",  // subtle rule line on dark
  ruleCream:      "C9C2AF",  // subtle rule line on cream
};

const F = {
  serif:  "Georgia",
  mono:   "Consolas",
};

// Slide dimensions (LAYOUT_WIDE: 13.333 x 7.5)
const W = 13.333;
const H = 7.5;

// Margins
const MARGIN_L = 0.6;
const MARGIN_R = 0.6;
const MARGIN_T = 0.45;
const MARGIN_B = 0.45;

// Helpers ------------------------------------------------------------------

// Small mono uppercase label (spaced out), used for eyebrow/footer text
function monoLabel(slide, text, opts) {
  slide.addText(text, {
    fontFace: F.mono,
    fontSize: opts.fontSize || 9,
    color: opts.color || COLOR.mutedOnDark,
    bold: false,
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 6,
    align: opts.align || "left",
    valign: opts.valign || "top",
    margin: 0,
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
  });
}

function headerEyebrow(slide, category, roman, onCream = false) {
  const mutedCol = onCream ? COLOR.mutedOnCream : COLOR.mutedOnDark;
  // Left: category
  monoLabel(slide, category.toUpperCase(), {
    x: MARGIN_L, y: MARGIN_T, w: 8, h: 0.3,
    color: mutedCol, fontSize: 9, charSpacing: 6,
  });
  // Right: roman numeral
  monoLabel(slide, roman, {
    x: W - MARGIN_R - 1.5, y: MARGIN_T, w: 1.5, h: 0.3,
    color: mutedCol, fontSize: 9, charSpacing: 8, align: "right",
  });
}

function sectionTag(slide, tag, y, onCream = false) {
  monoLabel(slide, tag.toUpperCase(), {
    x: MARGIN_L, y: y, w: 6, h: 0.3,
    color: COLOR.amber, fontSize: 9, charSpacing: 6,
  });
}

function pageFooter(slide, page, onCream = false) {
  const mutedCol = onCream ? COLOR.mutedOnCream : COLOR.mutedOnDark;
  // Left: brand
  monoLabel(slide, "SATURN  HOUSE  CAPITAL", {
    x: MARGIN_L, y: H - MARGIN_B - 0.3, w: 5, h: 0.3,
    color: mutedCol, fontSize: 8.5, charSpacing: 4,
  });
  // Right: page counter
  monoLabel(slide, `${String(page).padStart(2, "0")}  /  10`, {
    x: W - MARGIN_R - 2, y: H - MARGIN_B - 0.3, w: 2, h: 0.3,
    color: mutedCol, fontSize: 8.5, charSpacing: 6, align: "right",
  });
}

function ruleLine(slide, x, y, w, color = COLOR.rule, thickness = 0.75) {
  slide.addShape("line", {
    x: x, y: y, w: w, h: 0,
    line: { color: color, width: thickness },
  });
}

// ---------------------------------------------------------------------------
// Build presentation
// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Saturn House Capital";
pres.title  = "Moonlaunch FreightCo — Investment Memo";

// =========================================================================
// SLIDE 1 — Title / cover
// =========================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.taupeBg };

  // Top-left eyebrow
  monoLabel(s, "SATURN  HOUSE  CAPITAL  ·  PRIVATE  MARKETS", {
    x: MARGIN_L, y: MARGIN_T, w: 7, h: 0.3,
    color: "5A5648", fontSize: 9.5, charSpacing: 5,
  });
  // Top-right confidentiality
  monoLabel(s, "CONFIDENTIAL  /  FOR  DISCUSSION", {
    x: W - MARGIN_R - 5, y: MARGIN_T, w: 5, h: 0.3,
    color: "5A5648", fontSize: 9.5, charSpacing: 5, align: "right",
  });

  // Moon (cream circle, upper right)
  s.addShape("ellipse", {
    x: 9.3, y: 1.0, w: 2.6, h: 2.6,
    fill: { color: COLOR.cream },
    line: { color: COLOR.cream, width: 0 },
  });

  // Amber "INVESTMENT MEMO — SERIES B LEAD"
  monoLabel(s, "INVESTMENT  MEMO  —  SERIES  B  LEAD", {
    x: MARGIN_L, y: 3.55, w: 8, h: 0.35,
    color: COLOR.amber, fontSize: 10.5, charSpacing: 5,
  });

  // Big title with mixed serif + amber italic
  s.addText(
    [
      { text: "Moonlaunch ",  options: { fontFace: F.serif, fontSize: 66, color: COLOR.white, italic: false } },
      { text: "FreightCo.",   options: { fontFace: F.serif, fontSize: 66, color: COLOR.amber, italic: true } },
 
```