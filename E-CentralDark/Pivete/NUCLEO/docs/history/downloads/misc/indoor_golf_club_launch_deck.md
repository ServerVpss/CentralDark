# OUTRO - indoor_golf_club_launch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\indoor_golf_club_launch_deck.js
**SHA:** 9d1669fac053ace9
**Timestamp:** 2026-08-28T02:52:35.300045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run: `node Fairway_and_Sons.js` → produces Fairway_and_Sons.pptx

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Fairway & Sons — Marketing Launch Deck
 * Replica generator using pptxgenjs.
 *
 * Slide size: 20" x 11.25" (custom, matches source EMU 18288000 x 10287000)
 * Run: `node Fairway_and_Sons.js` → produces Fairway_and_Sons.pptx
 */

const pptxgen = require("pptxgenjs");

// ----- Brand palette (extracted from source XML) -----
const C = {
  cream:     "F1ECE0", // slide background
  tan:       "D9C9A3", // right-side tan panel on title + final slides
  forestDk:  "1C3128", // darkest green (premium card + slide 2 bg)
  forest:    "2D4A3E", // primary green (eyebrows, accents, italics)
  nearBlk:   "14201B", // near-black text
  gold:      "B8944A", // accent gold
  goldLt:    "D9BE80", // lighter gold (dark-bg variant)
  bodyGrey:  "34433D", // body paragraph text
  white:     "FFFFFF",
  cardGrey:  "E0E0DC", // empty image placeholder fill (approx; not in src)
};

// ----- Fonts -----
const F = {
  header: "Arial",
  body:   "Arial",
};

// ----- Slide dimensions -----
const SLIDE_W = 20;
const SLIDE_H = 11.25;

const pres = new pptxgen();
pres.title = "Fairway & Sons — Marketing Launch Deck";
pres.author = "Fairway & Sons";
pres.defineLayout({ name: "FW_WIDE", width: SLIDE_W, height: SLIDE_H });
pres.layout = "FW_WIDE";

// ----- Small helpers -----
// Source XML spc is in 1/100 pt (spc=540 → +5.4 pt).
// pptxgenjs `charSpacing` is in whole points, so divide by 100.
const cs = (spc) => spc / 100;

// Standard eyebrow row on content slides (category + "N / 10")
function eyebrow(slide, category, pageNum) {
  slide.addText(category, {
    x: 1.25, y: 0.5, w: 6, h: 0.3125,
    fontFace: F.header, fontSize: 18, bold: false,
    color: C.forest, charSpacing: cs(396), margin: 0,
  });
  slide.addText(pageNum, {
    x: 17.6209, y: 0.5, w: 1.25, h: 0.3125,
    fontFace: F.header, fontSize: 18,
    color: C.forest, charSpacing: cs(396), margin: 0,
  });
}

// Section sub-eyebrow (second small line under category)
function subEyebrow(slide, text, y = 1.0417) {
  slide.addText(text, {
    x: 1.25, y, w: 18.025, h: 0.3125,
    fontFace: F.header, fontSize: 18,
    color: C.forest, charSpacing: cs(396), margin: 0,
  });
}

// Big two-tone headline used on most content slides (e.g. "Golf, indoors. Brooklyn, outdoors.")
function bigHeadline(slide, parts, opts = {}) {
  const y = opts.y ?? 1.5;
  const h = opts.h ?? 2.2415;
  const sz = opts.sz ?? 82.5;
  const spc = opts.spc ?? -165;
  slide.addText(
    parts.map((p, i) => ({
      text: p.text,
      options: {
        fontFace: F.header, fontSize: sz,
        color: p.color ?? C.nearBlk,
        italic: !!p.italic,
        charSpacing: cs(spc),
        breakLine: i === parts.length - 1 ? false : !!p.breakLine,
      },
    })),
    { x: 1.25, y, w: 18.025, h, align: "left", margin: 0, valign: "top" }
  );
}

// =====================================================================
// SLIDE 1 — Title
// =====================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.cream };

  // Right-side tan panel
  s.addShape(pres.shapes.RECTANGLE, {
    x: 10.2439, y: 0, w: 9.7561, h: 11.25,
    fill: { color: C.tan }, line: { type: "none" },
  });

  // Top eyebrow
  s.addText("FAIRWAY & SONS · WILLIAMSBURG · OPENING FALL '26", {
    x: 1.25, y: 1.0417, w: 8.4054, h: 0.5833,
    fontFace: F.header, fontSize: 18, bold: true,
    color: C.forest, charSpacing: cs(540), margin: 0,
  });

  // Big wordmark "Fairway & Sons."
  s.addText(
    [
      { text: "Fairway ", options: { color: C.nearBlk } },
      { text: "& ",       options: { color: C.gold, italic: true } },
      { text: "Sons.",    options: { color: C.forest, italic: true } },
    ].map((r) => ({
      text: r.text,
      options: {
        fontFace: F.header, fontSize: 135,
        color: r.options.color, italic: !!r.options.italic,
        charSpacing: cs(-405),
      },
    })),
    {
      x: 1.25, y: 3.2995, w: 8.4054, h: 3.4167,
      align: "left", valign: "top", margin: 0,
      lineSpacingMultiple: 0.9,
    }
  );

  // Tagline
  s.addText("An indoor golf club for Brooklyn — bays, putts, and a proper bar.", {
    x: 1.25, y: 7.0078, w: 6.8667, h: 1.0833,
    fontFace: F.header, fontSize: 30, italic: true,
    color: C.bodyGrey, margin: 0,
    lineSpacingMultiple: 1.25,
  });

  // Footer hairline
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.25, y: 9.7656, w: 8.1606, h: 0.0104,
    fill: { color: C.nearBlk }, line: { type: "none" },
  });

  // Footer labels
  s.addText("Marketing Launch Deck", {
    x: 1.25, y: 10.026, w: 3.0296, h: 0.3281,
    fontFace: F.header, fontSize: 18,
    color: C.bodyGrey, charSpacing: cs(108), margin: 0,
  });
  s.addText("Spring 2026", {
    x: 7.8972, y: 10.026, w: 1.5967, h: 0.3281,
    fontFace: F.header, fontSize: 18,
    color: C.bodyGrey, charSpacing: cs(108), margin: 0,
  });
}

// =====================================================================
// SLIDE 2 — Hello, Williamsburg (dark)
// ==============
```