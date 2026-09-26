# CONTRATO - finance_investment_committee_memo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_investment_committee_memo.js
**SHA:** d82762be49113948
**Timestamp:** 2026-08-28T02:52:33.858691
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node oklo_memo.js

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Oklo Investment Memo — PPTX recreation via pptxgenjs
 *
 * Recreates the 10-slide NK Ventures / Clean Energy Practice investor memo.
 * Source layout is 20" x 11.25" (2x scale of LAYOUT_WIDE). We use LAYOUT_WIDE
 * (13.333" x 7.5") and scale every source coordinate by 2/3.
 *
 * Run:  node oklo_memo.js
 */

const pptxgen = require("pptxgenjs");

// ---------- Palette ----------
const BG          = "0F0F0F";   // slide background (near-black)
const CARD        = "1C1C1C";   // card fill
const CARD_ALT    = "2A2A2A";   // lighter card fill
const ORANGE      = "D65A2A";   // accent orange
const ORANGE_DK   = "6A2C14";   // dark orange (fills / muted accents)
const CREAM       = "E9E6DF";   // primary text
const WARM        = "9A9690";   // secondary / body text
const DIM         = "6B6864";   // labels / footer text
const LINE        = "3A3A3A";   // rule lines

// ---------- Fonts ----------
const MONO = "Consolas";     // metadata, labels, numbers
const SERIF_BODY = "Calibri"; // body + headings (sans — deck uses clean sans)
const DISPLAY = "Calibri";

// ---------- Scale source 20x11.25 -> 13.333x7.5 ----------
const S = 2 / 3;
const x = v => +(v * S).toFixed(3);
const y = v => +(v * S).toFixed(3);
const w = v => +(v * S).toFixed(3);
const h = v => +(v * S).toFixed(3);
// Font size also scales
const fs = v => Math.max(5, +(v * S).toFixed(1));

// ---------- Setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Oklo Investment Memo";
pres.author = "NK Ventures / Clean Energy Practice";

// Default slide background
function newSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

// ---------- Helpers ----------
function sectionTag(slide, num, label) {
  // "01 / MACRO" style
  slide.addText(
    [
      { text: `${num} / `, options: { color: ORANGE, bold: false } },
      { text: label,       options: { color: ORANGE, bold: false } },
    ],
    {
      x: x(1.15), y: y(1.04), w: w(18.24), h: h(0.34),
      fontFace: MONO, fontSize: fs(14), charSpacing: 2,
      margin: 0, valign: "top",
    }
  );
}

function footer(slide, label, page) {
  slide.addText("NK VENTURES / OKLO INVESTMENT MEMO", {
    x: x(1.15), y: y(10.80), w: w(4.32), h: h(0.23),
    fontFace: MONO, fontSize: fs(10), color: DIM, charSpacing: 1,
    margin: 0,
  });
  slide.addText(label, {
    x: x(8.5), y: y(10.80), w: w(3.0), h: h(0.23),
    fontFace: MONO, fontSize: fs(10), color: DIM, charSpacing: 1,
    align: "center", margin: 0,
  });
  slide.addText(page, {
    x: x(17.99), y: y(10.80), w: w(0.95), h: h(0.23),
    fontFace: MONO, fontSize: fs(10), color: DIM, charSpacing: 1,
    align: "right", margin: 0,
  });
}

function bigTitle(slide, text, fsPt = 44) {
  slide.addText(text, {
    x: x(1.15), y: y(1.68), w: w(18.24), h: h(0.9),
    fontFace: DISPLAY, fontSize: fs(fsPt), color: CREAM,
    bold: false, margin: 0, valign: "top",
  });
}

function subtitle(slide, text, yPos = 2.63, hPos = 1.14) {
  slide.addText(text, {
    x: x(1.15), y: y(yPos), w: w(16.09), h: h(hPos),
    fontFace: SERIF_BODY, fontSize: fs(22), color: WARM,
    margin: 0, valign: "top",
  });
}

// ================================================================
// SLIDE 1 — TITLE
// ================================================================
(function slide1() {
  const s = newSlide();

  // Top header row — brand / meta
  s.addText("NK VENTURES / CLEAN ENERGY PRACTICE", {
    x: x(1.15), y: y(1.04), w: w(10), h: h(0.26),
    fontFace: MONO, fontSize: fs(12), color: CREAM, charSpacing: 2,
    margin: 0,
  });
  s.addText("Q2 2026 / IC MEMO", {
    x: x(13.5), y: y(1.04), w: w(5.43), h: h(0.26),
    fontFace: MONO, fontSize: fs(12), color: CREAM, charSpacing: 2,
    align: "right", margin: 0,
  });

  // Ticker / action line — orange
  s.addText("NYSE : OKLO ———— INITIATE BUY", {
    x: x(1.15), y: y(1.26), w: w(18.24), h: h(0.30),
    fontFace: MONO, fontSize: fs(14), color: ORANGE, bold: true, charSpacing: 2,
    margin: 0,
  });

  // Oklo.
  s.addText("Oklo.", {
    x: x(1.15), y: y(1.97), w: w(18.24), h: h(1.96),
    fontFace: DISPLAY, fontSize: fs(110), color: CREAM,
    bold: false, margin: 0, valign: "top",
  });

  // Tagline
  s.addText(
    "A pure-play bet on sovereign, 24/7 base load power — the missing half of the clean energy transition.",
    {
      x: x(1.15), y: y(4.27), w: w(13.95), h: h(1.19),
      fontFace: SERIF_BODY, fontSize: fs(28), color: CREAM,
      margin: 0, valign: "top",
    }
  );

  // Prepared by
  s.addText("PREPARED BY WILLIAM / APRIL 2026", {
    x: x(1.15), y: y(5.41), w: w(8), h: h(0.26),
    fontFace: MONO, fontSize: fs(11), color: DIM, charSpacing: 2,
    margin: 0,
  });

  // Right-bottom: short rule + tag
  s.addShape(pres.shapes.LINE, {
    x: x(14.41), y: y(5.52), w: w(0.38), h: 0,
    line: { color: ORANGE, width: 1.5 },
  });
  s.addText("PARTNERS PRESENTATION · ~10 MIN", {
    x: x(14.93), y: y(5.43), w: w(5), h: h(0.23),
    fontFace: 
```