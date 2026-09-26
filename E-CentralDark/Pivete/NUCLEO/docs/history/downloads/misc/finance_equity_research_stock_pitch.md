# OUTRO - finance_equity_research_stock_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_equity_research_stock_pitch.js
**SHA:** 85c49c770e7d81cf
**Timestamp:** 2026-08-28T02:52:34.074199
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const bandStart = tblX;
- const band2Start = colX[4];

### Gaps
- const gap   = 0.25;
- const gap   = 0.3;
- const colGap = 0.4;
- const rowGap = 0.3;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Recreate PYPL Investment Memo deck via pptxgenjs.
 * Layout: LAYOUT_WIDE (13.333" x 7.5")
 */

const pptxgen = require("pptxgenjs");

// ---- Palette ----------------------------------------------------------------
const C = {
  ink:        "0F0F0E", // near-black for dark slides
  cream:      "F1EDE2", // parchment body background
  creamSoft:  "E8E2D2", // card fill on cream slides
  creamLine:  "C9C2AF", // hairlines on cream
  textDark:   "1A1A18", // body text on cream
  textMute:   "6B6657", // muted/secondary text on cream
  textOnDark: "E8E2D2", // body text on dark
  textMuteDk: "8A8470", // muted on dark
  gold:       "B8923B", // accent gold
  goldSoft:   "D9B772", // softer gold (italic accent on slide 4)
  rust:       "8B2E1F", // terracotta / accent rust
  rustDark:   "6B2415", // darker rust (slide 4 background)
  hairline:   "B8B2A0",
};

// ---- Fonts ------------------------------------------------------------------
const F = {
  serif: "Georgia",     // display + body serif
  mono:  "Courier New", // monospaced labels
  sans:  "Calibri",     // body sans
};

// ---- Layout constants -------------------------------------------------------
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN_X = 0.6;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Meridian Capital";
pres.title  = "PYPL Investment Memo";

// =============================================================================
// Helper: page header band (kicker top-left, confidential top-right, hairline)
// =============================================================================
function addHeader(slide, kicker, page, opts = {}) {
  const dark = !!opts.dark;
  const kickerColor = dark ? C.textOnDark : C.textDark;
  const muteColor   = dark ? C.textMuteDk : C.textMute;
  const lineColor   = dark ? C.textMuteDk : C.hairline;

  slide.addText(kicker, {
    x: MARGIN_X, y: 0.38, w: 8, h: 0.35,
    fontFace: F.mono, fontSize: 11, bold: true,
    color: kickerColor, charSpacing: 4, margin: 0,
  });

  if (opts.confidential) {
    slide.addText(opts.confidential, {
      x: SLIDE_W - 4 - MARGIN_X, y: 0.38, w: 4, h: 0.35,
      fontFace: F.mono, fontSize: 10,
      color: muteColor, charSpacing: 3, align: "right", margin: 0,
    });
  } else {
    slide.addText(page, {
      x: SLIDE_W - 1.2 - MARGIN_X, y: 0.38, w: 1.2, h: 0.35,
      fontFace: F.mono, fontSize: 10,
      color: muteColor, charSpacing: 3, align: "right", margin: 0,
    });
  }

  // Hairline under header
  slide.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 0.78, w: SLIDE_W - MARGIN_X * 2, h: 0,
    line: { color: lineColor, width: 0.5 },
  });
}

// =============================================================================
// Helper: footer band (left tag, right page number, hairline above)
// =============================================================================
function addFooter(slide, leftTag, page, opts = {}) {
  const dark = !!opts.dark;
  const muteColor = dark ? C.textMuteDk : C.textMute;
  const lineColor = dark ? C.textMuteDk : C.hairline;

  slide.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 7.0, w: SLIDE_W - MARGIN_X * 2, h: 0,
    line: { color: lineColor, width: 0.5 },
  });

  slide.addText(leftTag, {
    x: MARGIN_X, y: 7.08, w: 9, h: 0.32,
    fontFace: F.mono, fontSize: 10,
    color: muteColor, charSpacing: 3, margin: 0,
  });

  slide.addText(page, {
    x: SLIDE_W - 1.4 - MARGIN_X, y: 7.08, w: 1.4, h: 0.32,
    fontFace: F.mono, fontSize: 10,
    color: muteColor, charSpacing: 3, align: "right", margin: 0,
  });
}

// =============================================================================
// SLIDE 1 — Title / cover
// =============================================================================
function buildSlide1() {
  const s = pres.addSlide();
  s.background = { color: C.ink };

  addHeader(s, "MERIDIAN CAPITAL  ·  INTERNAL MEMO", "01 / 09", {
    dark: true,
    confidential: "CONFIDENTIAL  ·  APR 2026",
  });

  // LEFT: kicker + giant PYPL logotype
  s.addText("LONG IDEA / SINGLE NAME", {
    x: MARGIN_X, y: 3.55, w: 7, h: 0.35,
    fontFace: F.mono, fontSize: 12,
    color: C.textMuteDk, charSpacing: 4, margin: 0,
  });

  // PYPL — "P" in cream, "YPL" in gold italic
  s.addText(
    [
      { text: "P",   options: { color: C.textOnDark, italic: false } },
      { text: "YPL", options: { color: C.gold, italic: true } },
    ],
    {
      x: MARGIN_X - 0.1, y: 3.85, w: 7.2, h: 2.5,
      fontFace: F.serif, fontSize: 180, bold: false, margin: 0,
      valign: "top",
    }
  );

  // RIGHT: thesis block
  const RX = 7.4;
  const RW = SLIDE_W - RX - MARGIN_X;

  s.addText("THESIS", {
    x: RX, y: 2.85, w: RW, h: 0.3,
    fontFace: F.mono, fontSize: 11, charSpacing: 4,
    color: C.textMuteDk, margin: 0,
  });
  s.addText("A profitable, cash-generative payments network trading like a melting ice cube.", {
    x: RX, y: 3.2, w: RW, h: 1.3,
    fontFace: F.serif, fontSize: 22,
    colo
```