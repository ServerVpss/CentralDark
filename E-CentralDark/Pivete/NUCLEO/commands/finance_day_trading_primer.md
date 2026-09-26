# COMANDO - finance_day_trading_primer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_day_trading_primer.js
**SHA:** 78186db5ae3998d7
**Timestamp:** 2026-08-28T02:52:33.696048
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = px(40);
- const colGap = px(64);
- const gap = px(40);
- const statGap = px(24);
- const gap = px(40);
- const gap = px(40);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Day Trading, Explained — pptxgenjs recreation
 *
 * Faithfully reproduces the dark, editorial deck defined in the HTML source
 * (1920×1080 stage) as a 13.333" × 7.5" widescreen PowerPoint.
 *
 * Design system (translated from the HTML CSS vars):
 *   --bg        #16120E  warm off-black       (oklch 0.16 0.01 60)
 *   --bg-2      #1E1915  slightly lifted card bg
 *   --bg-3      #25201B  lifted bg 3
 *   --fg        #F4F1EB  warm off-white
 *   --fg-dim    #C3BDB1  dimmed body text
 *   --fg-muted  #8A8478  muted captions / chrome
 *   --rule      #44403A  strong rule
 *   --rule-soft #33302B  soft rule / card border
 *   --accent    #E6B55A  warm gold
 *   --accent-2  #C17B5B  clay rust
 *   --up        #7FC98A  green tickers
 *   --dn        #D37B6A  red tickers
 *
 * Fonts:
 *   serif  → "Georgia"         (standin for Instrument Serif — widely available)
 *   sans   → "Calibri"         (standin for Geist)
 *   mono   → "Consolas"        (standin for JetBrains Mono)
 *
 * Coordinate conversion: HTML is 1920×1080 px, deck is 13.333×7.5 inches.
 * 1 px ≈ 0.006944 inches. Slide padding "100px" ≈ 0.694".
 */

const pptxgen = require("pptxgenjs");

// ---- Design tokens ----
const COLORS = {
  bg:       "16120E",
  bg2:      "1E1915",
  bg3:      "25201B",
  fg:       "F4F1EB",
  fgDim:    "C3BDB1",
  fgMuted:  "8A8478",
  rule:     "44403A",
  ruleSoft: "33302B",
  accent:   "E6B55A",
  accent2:  "C17B5B",
  up:       "7FC98A",
  dn:       "D37B6A",
};

const FONTS = {
  serif: "Georgia",
  sans:  "Calibri",
  mono:  "Consolas",
};

// ---- Helpers ----
const px = (n) => n * (13.333 / 1920); // 1920px wide stage → 13.333" slide
const PAD = px(100);                    // standard left/right page padding

// ---- Create presentation ----
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";            // 13.333" × 7.5"
pres.author = "Day Trading Primer";
pres.company = "Day Trading · Explained";
pres.title = "Day Trading, Explained";
pres.subject = "A primer for the absolute beginner";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ---------------------------------------------------------------
// Shared chrome: top eyebrow bar & bottom footer with rule
// ---------------------------------------------------------------
function addChromeTop(slide, leftText, rightText = "DAY TRADING · EXPLAINED") {
  // accent dot
  slide.addShape(pres.shapes.OVAL, {
    x: PAD, y: px(52) + px(8),
    w: px(8), h: px(8),
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent, width: 0 },
  });
  // left label (with leading space to clear dot)
  slide.addText(leftText, {
    x: PAD + px(20), y: px(44),
    w: px(800), h: px(32),
    fontFace: FONTS.mono, fontSize: 11,
    color: COLORS.fgMuted,
    charSpacing: 2,
    margin: 0, valign: "middle", align: "left",
  });
  // right label
  slide.addText(rightText, {
    x: SLIDE_W - PAD - px(800), y: px(44),
    w: px(800), h: px(32),
    fontFace: FONTS.mono, fontSize: 11,
    color: COLORS.fgMuted,
    charSpacing: 2,
    margin: 0, valign: "middle", align: "right",
  });
}

function addChromeBottom(slide, pageNum) {
  const y = SLIDE_H - px(44) - px(16);
  const leftLabel = "DAY TRADING";
  const rightLabel = String(pageNum).padStart(2, "0");

  // left label
  slide.addText(leftLabel, {
    x: PAD, y: y,
    w: px(260), h: px(32),
    fontFace: FONTS.mono, fontSize: 11,
    color: COLORS.fgMuted,
    charSpacing: 2,
    margin: 0, valign: "middle", align: "left",
  });
  // right page number
  slide.addText(rightLabel, {
    x: SLIDE_W - PAD - px(100), y: y,
    w: px(100), h: px(32),
    fontFace: FONTS.mono, fontSize: 11,
    color: COLORS.fgMuted,
    charSpacing: 2,
    margin: 0, valign: "middle", align: "right",
  });
  // thin rule between them
  const ruleX = PAD + px(260) + px(24);
  const ruleW = SLIDE_W - PAD - px(100) - px(24) - ruleX;
  slide.addShape(pres.shapes.LINE, {
    x: ruleX, y: y + px(16),
    w: ruleW, h: 0,
    line: { color: COLORS.ruleSoft, width: 0.75 },
  });
}

// Subtle grid-background hint: a few very faint grid lines.
// We keep this OPTIONAL per slide and use very thin lines to suggest the HTML's
// radial-masked grid, without cluttering the slide.
function addSubtleGrid(slide) {
  const step = px(160);
  const color = "1F1A15"; // just above bg
  const inset = px(60);
  // vertical lines
  for (let x = inset; x < SLIDE_W - inset; x += step) {
    slide.addShape(pres.shapes.LINE, {
      x: x, y: inset, w: 0, h: SLIDE_H - 2 * inset,
      line: { color, width: 0.4 },
    });
  }
  // horizontal lines
  for (let y = inset; y < SLIDE_H - inset; y += step) {
    slide.addShape(pres.shapes.LINE, {
      x: inset, y: y, w: SLIDE_W - 2 * inset, h: 0,
      line: { color, width: 0.4 },
    });
  }
}

// Reusable: a "card" — dark lifted rectangle with soft border
function addCard(slide, x, y, w, h) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.ruleSoft, wi
```