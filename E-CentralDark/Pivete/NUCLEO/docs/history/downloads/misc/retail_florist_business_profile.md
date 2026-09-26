# OUTRO - retail_florist_business_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\retail_florist_business_profile.js
**SHA:** 7ab855fc2816fe07
**Timestamp:** 2026-08-28T02:52:36.785593
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:    node florist_replica.js

### Gaps
- const rowGap = 0.96;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Florist Replica - "Petal & Stem" presentation generator
 *
 * Recreates an 8-slide editorial-style florist deck (20" x 11.25"),
 * using cream backgrounds, Cormorant Garamond + Inter typography,
 * and embedded illustrative PNGs.
 *
 * Run:    node florist_replica.js
 * Output: Florist_replica.pptx
 *
 * Requires: pptxgenjs  (npm i pptxgenjs)
 *           ./images/image1.png ... image9.png  (in same folder as this script)
 */

const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
const COLOR = {
  bg:        "F6F1E7",  // page cream
  card:      "FAF6EE",  // image card cream (slightly lighter)
  ink:       "2C2820",  // headline / display ink
  muted:     "6E6657",  // small caps / labels / secondary text
  divider:   "D8CFBA",  // hairline separators on contact card
};

const FONT = {
  display: "Cormorant Garamond", // headlines & body serif
  label:   "Inter",              // small caps labels & page numbers
};

// ---------------------------------------------------------------------------
// Image embedding (base64)
// ---------------------------------------------------------------------------
const IMG_DIR = path.join(__dirname, "images");
function imgData(name) {
  const buf = fs.readFileSync(path.join(IMG_DIR, name));
  return "image/png;base64," + buf.toString("base64");
}
const IMG = {
  vine:     imgData("image1.png"),  // Slide 1 - vertical vine
  potTall:  imgData("image2.png"),  // Slide 2 - tall potted plant
  bouquet:  imgData("image3.png"),  // Slide 3 - bouquet (panel i)
  vase:     imgData("image4.png"),  // Slide 3 - low vase   (panel ii)
  arch:     imgData("image5.png"),  // Slide 3 & 6 - floral arch (panel iii)
  trio:     imgData("image6.png"),  // Slide 4 - three bouquets
  potFull:  imgData("image7.png"),  // Slide 5 - full vase
  wreath:   imgData("image8.png"),  // Slide 7 - oval wreath
  garland:  imgData("image9.png"),  // Slide 8 - small garland
};

// ---------------------------------------------------------------------------
// Presentation setup
// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.author = "Petal & Stem";
pres.title  = "Petal & Stem - An Introduction";

// Custom 20" x 11.25" canvas (matches the source deck exactly)
pres.defineLayout({ name: "FLORIST_20x11_25", width: 20, height: 11.25 });
pres.layout = "FLORIST_20x11_25";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// Small caps label (Inter, tracked-out, muted brown)
function addLabel(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT.label,
    fontSize: opts.fontSize || 18,
    color:    opts.color   || COLOR.muted,
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 5.76,
    align:    opts.align   || "left",
    valign:   opts.valign  || "top",
    margin:   0,
    bold:     false,
  });
}

// Editorial display text. `runs` is an array of { text, italic } pieces.
function addDisplay(slide, runs, x, y, w, h, opts = {}) {
  const arr = runs.map((r, i) => ({
    text: r.text,
    options: {
      italic: !!r.italic,
      fontFace: FONT.display,
      fontSize: opts.fontSize || 69,
      color:    opts.color   || COLOR.ink,
      charSpacing: opts.charSpacing != null ? opts.charSpacing : 0,
      breakLine: i < runs.length - 1 ? false : false, // we keep all runs inline
    },
  }));
  slide.addText(arr, {
    x, y, w, h,
    align:  opts.align  || "left",
    valign: opts.valign || "top",
    margin: 0,
  });
}

// Cormorant Garamond body / supporting text
function addBody(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT.display,
    fontSize: opts.fontSize || 24,
    color:    opts.color   || COLOR.ink,
    italic:   !!opts.italic,
    align:    opts.align   || "left",
    valign:   opts.valign  || "top",
    margin:   0,
  });
}

// 0.75" thin "rule" used as a divider under titles (rendered as a flat rect).
function addRule(slide, x, y, opts = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y,
    w: opts.w != null ? opts.w : 0.75,
    h: opts.h != null ? opts.h : 0.012,
    fill: { color: opts.color || COLOR.ink },
    line: { type: "none" },
  });
}

// Footer that appears on every interior slide: "Petal & Stem" + "NN / 08"
function addFooter(slide, pageNum) {
  slide.addText(
    [
      { text: "Petal & Stem", options: { italic: true } },
    ],
    {
      x: 1.25, y: 10.25, w: 4, h: 0.42,
      fontFace: FONT.display,
      fontSize: 22.5,
      color: COLOR.ink,
      charSpacing: 0.9,
      margin: 0,
      align: "left",
    }
  );
  slide.addText(`${String(pageNum).padStart(2, "0")} / 08`
```