# OUTRO - retail_pet_store_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\retail_pet_store_pitch_deck.js
**SHA:** d9d3a0cbc423b9fc
**Timestamp:** 2026-08-28T02:52:36.894508
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  npm i pptxgenjs  &&  node pawmart.js

### Ouro Bruto (primeiros 5000 chars)
```
// pawmart.js
// Recreates "Pawmart" presentation using pptxgenjs.
// Run:  npm i pptxgenjs  &&  node pawmart.js
// Output: Pawmart.pptx

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";           // 13.333" x 7.5"
pres.title = "Pawmart";
pres.author = "Pawmart";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────
const BG     = "1F2A24"; // deep forest green
const CREAM  = "E8D9B8"; // primary text
const GOLD   = "D4A24B"; // accent / italic
const SAGE   = "9A8F75"; // muted label color
const WARM   = "D8C8A4"; // body paragraph color
const DIVIDE = "3A4640"; // subtle divider line

const MONO   = "Roboto Mono";
const SERIF  = "Lora";
const SANS   = "Poppins";

// Source layout is authored at 20" x 11.25"; render target is 13.333" x 7.5".
// Scale every coordinate and size by 2/3 (13.333 / 20 = 0.6667).
const K = 13.333 / 20;
const s = (v) => +(v * K).toFixed(3);

// Convenience wrappers that apply the scale.
const addBgRect = (slide) =>
  slide.addShape("rect", { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: BG }, line: { type: "none" } });

const addText = (slide, text, opts) => {
  const { x, y, w, h, ...rest } = opts;
  slide.addText(text, {
    x: s(x), y: s(y), w: s(w), h: s(h),
    margin: 0,
    isTextBox: true,
    ...rest,
  });
};

const addLine = (slide, x1, y1, x2, y2, color = DIVIDE, thickness = 0.75) => {
  // pptxgenjs: draw a line as a shape with line style
  slide.addShape("line", {
    x: s(x1), y: s(y1), w: s(x2 - x1), h: s(y2 - y1),
    line: { color, width: thickness },
  });
};

const addRect = (slide, x, y, w, h, fill, lineColor) => {
  slide.addShape("rect", {
    x: s(x), y: s(y), w: s(w), h: s(h),
    fill: fill ? { color: fill } : { type: "none" },
    line: lineColor ? { color: lineColor, width: 0.75 } : { type: "none" },
  });
};

// Header/footer bar that appears on every non-title slide.
// Content slides share: top-left page number, top-right section name,
// bottom-left "— PAWMART", bottom-right § chapter mark.
function addChrome(slide, page, sectionRight, chapterRight) {
  addText(slide, page, {
    x: 0.625, y: 0.458, w: 2.5, h: 0.375,
    fontSize: 12, fontFace: MONO, color: SAGE, charSpacing: 2.5,
    align: "left", valign: "top",
  });
  addText(slide, sectionRight, {
    x: 13.0, y: 0.458, w: 6.4, h: 0.375,
    fontSize: 12, fontFace: MONO, color: SAGE, charSpacing: 2.5,
    align: "right", valign: "top",
  });
  addText(slide, "— PAWMART", {
    x: 0.625, y: 10.458, w: 3.0, h: 0.375,
    fontSize: 12, fontFace: MONO, color: SAGE, charSpacing: 2.5,
    align: "left", valign: "top",
  });
  addText(slide, chapterRight, {
    x: 13.0, y: 10.458, w: 6.4, h: 0.375,
    fontSize: 12, fontFace: MONO, color: SAGE, charSpacing: 2.5,
    align: "right", valign: "top",
  });
}

// ─── SLIDE 1 — COVER ──────────────────────────────────────────────────────
{
  const slide = pres.addSlide();
  addBgRect(slide);

  // corner labels
  addText(slide, "PAWMART · EST. 2023", {
    x: 0.625, y: 0.458, w: 5.5, h: 0.375,
    fontSize: 11, fontFace: MONO, color: SAGE, charSpacing: 2.2, align: "left",
  });
  addText(slide, "CLARKSVILLE, ATX", {
    x: 13.5, y: 0.458, w: 5.9, h: 0.375,
    fontSize: 11, fontFace: MONO, color: SAGE, charSpacing: 2.2, align: "right",
  });
  addText(slide, "A TALK IN TEN SLIDES", {
    x: 0.625, y: 10.6, w: 5.5, h: 0.375,
    fontSize: 11, fontFace: MONO, color: SAGE, charSpacing: 2.2, align: "left",
  });
  addText(slide, "30.2747° N · 97.7560° W", {
    x: 13.5, y: 10.6, w: 5.9, h: 0.375,
    fontSize: 11, fontFace: MONO, color: SAGE, charSpacing: 2.2, align: "right",
  });

  // Logo mark — small gold circle with a paw dot, in lieu of an embedded image
  slide.addShape("ellipse", {
    x: s(0.95), y: s(0.95), w: s(0.75), h: s(0.75),
    fill: { color: BG }, line: { color: GOLD, width: 1.5 },
  });
  // A tiny centered dot inside the circle
  slide.addShape("ellipse", {
    x: s(1.23), y: s(1.23), w: s(0.2), h: s(0.2),
    fill: { color: GOLD }, line: { type: "none" },
  });

  addText(slide, "PAWMART / AUSTIN, TX", {
    x: 1.95, y: 1.15, w: 6.0, h: 0.4,
    fontSize: 11, fontFace: MONO, color: CREAM, charSpacing: 3.0, valign: "middle",
  });

  // Tagline (gold italic)
  addText(slide, "natural pet goods for the dogs who raised us.", {
    x: 0.95, y: 4.4, w: 18.4, h: 0.6,
    fontSize: 19, fontFace: SERIF, italic: true, color: GOLD, align: "left",
  });

  // The big wordmark "pawmart" + gold italic period
  addText(
    slide,
    [
      { text: "pawmart", options: { color: CREAM } },
      { text: ".", options: { color: GOLD, italic: true } },
    ],
    {
      x: 0.95, y: 5.2, w: 18.4, h: 3.8,
      fontSize: 155, fontFace: SERIF, charSpacing: -6,
      align: "left", valign: "top",
    }
  );

  addText(slide, "a neighborhood shop for senior dogs · community mixer 2026", {
    x: 2.0, y: 9.5, w: 16.0, h: 0.4,
    fontSize: 12, fontFace: MONO, color: SAGE, charSpacing: 1.2, a
```