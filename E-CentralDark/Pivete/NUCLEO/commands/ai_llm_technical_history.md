# COMANDO - ai_llm_technical_history.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\ai_llm_technical_history.js
**SHA:** 073ef0e8d108bed7
**Timestamp:** 2026-08-28T02:52:32.148999
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node class2-replica.js

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * class2-replica.js
 *
 * Recreates "class2.pptx" — A Short History of LLMs — using pptxgenjs.
 *
 * The deck is 11 slides, 20" x 11.25" (a custom widescreen layout).
 * Design: warm paper background (#EFE9DD), Georgia serif headlines,
 * Helvetica Neue body, Courier New for monospaced captions, with a
 * gold accent (#C6A46A / #A8864A) and dark brown (#3A2C1A).
 *
 * Four slides (1, 3, 5, 10) use illustration images that live alongside
 * this script in ./assets/. If those files are missing the script will
 * still run; those illustrations will simply be skipped.
 *
 * Run:  node class2-replica.js
 * Out:  ./class2-replica.pptx
 */

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

// ─────────────────────────────────────────────────────────────────────────────
// Theme tokens (pulled directly from the source .pptx XML)
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:      "EFE9DD",  // paper
  ink:     "3A2C1A",  // near-black brown (headlines)
  body:    "6B5A44",  // muted brown (body copy)
  meta:    "9A8A72",  // light taupe (captions / chapter labels)
  gold:    "A8864A",  // deep gold (stat numbers, accents)
  goldHi:  "C6A46A",  // lighter gold (rule lines)
  rule:    "C9BDA4",  // pale rule line
  panel:   "E6DFCE",  // soft panel fill
  panelHi: "FCFAF4",  // white-ish chat panel
};

const F = {
  serif:  "Georgia",
  sans:   "Helvetica Neue",
  mono:   "Courier New",
};

// Asset directory (for the 4 illustration PNGs from the source deck)
const ASSETS = path.join(__dirname, "assets");
const hasAsset = (name) => fs.existsSync(path.join(ASSETS, name));
const asset = (name) => path.join(ASSETS, name);

// ─────────────────────────────────────────────────────────────────────────────
// Presentation setup — custom 20" x 11.25" layout
// ─────────────────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.title  = "A Short History of LLMs";
pres.author = "class2 replica";
pres.defineLayout({ name: "CLASS2", width: 20, height: 11.25 });
pres.layout = "CLASS2";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Convert XML `spc` (hundredths of a point) to pptxgenjs `charSpacing` (points). */
const spc = (v) => (v ? v / 100 : 0);

/** Convert XML `sz` (hundredths of a point) to pptxgenjs `fontSize` (points). */
const sz = (v) => v / 100;

/** Add a thin solid bar (rectangle). */
function bar(slide, x, y, w, h, color) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color },
    line: { type: "none" },
  });
}

/** Add a simple left-aligned single-line text box with zero internal padding. */
function label(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: opts.face || F.sans,
    fontSize: opts.size || 12,
    color: opts.color || C.body,
    bold: opts.bold || false,
    italic: opts.italic || false,
    align: opts.align || "left",
    valign: opts.valign || "top",
    charSpacing: opts.charSpacing || 0,
    margin: opts.margin != null ? opts.margin : 0.03,
  });
}

/** Chapter label (top left) + page counter (top right) + gold rule under it. */
function addHeader(slide, chapter, counter) {
  label(slide, chapter, 1.25, 0.5, 6.5, 0.3056, {
    face: F.sans, size: 16.5, color: C.meta, charSpacing: 2.97,
  });
  label(slide, counter, 17.7604, 0.5, 1.0729, 0.3056, {
    face: F.sans, size: 16.5, color: C.meta, charSpacing: 2.97,
  });
  // Gold rule that sits above the slide's headline
  bar(slide, 1.25, 1.875, 1.25, 0.0312, C.goldHi);
}

/** Headline (the big Georgia serif sentence).
 *  Source XML: 54 pt with normAutofit. We drop to 46 pt to fit the 0.85" box. */
function addHeadline(slide, text) {
  slide.addText(text, {
    x: 1.25, y: 2.2396, w: 18.025, h: 0.8516,
    fontFace: F.serif, fontSize: 46, color: C.ink,
    charSpacing: -0.81, margin: 0.03,
    paraSpaceBefore: 0, paraSpaceAfter: 0,
    valign: "top",
  });
}

/** Plain paragraph of body copy.
 *  Note: the source XML specifies 25.5 pt with `normAutofit`, which PowerPoint
 *  renders smaller to fit the box. pptxgenjs has no equivalent, so we emit
 *  the text at ~20 pt with a tighter line-height so the box height from the
 *  original file still holds. */
function addBody(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: F.sans,
    fontSize: opts.size || 20,
    color: opts.color || C.body,
    lineSpacingMultiple: opts.lineSpacing || 1.35,
    margin: 0.03,
    valign: "top",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Title: "A short history of large language models."
// ─────────────────────────────────────────────────────────────────────────────
function buildSlide1() {
  const s = pres.addSlide();
  s.back
```