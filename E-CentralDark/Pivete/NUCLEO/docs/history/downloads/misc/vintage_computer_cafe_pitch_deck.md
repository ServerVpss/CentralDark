# OUTRO - vintage_computer_cafe_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\vintage_computer_cafe_pitch_deck.js
**SHA:** 11729985ecc1a24f
**Timestamp:** 2026-08-28T02:52:37.625770
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cellW = 4.29, cellH = 2.92, gap = 0.34;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * retro_tech_shop.js
 *
 * Replica of retro_tech_shop.pptx using pptxgenjs.
 *
 * Usage:
 *   npm install pptxgenjs
 *   node retro_tech_shop.js
 *
 * Produces: retro_tech_shop.pptx in the current working directory.
 */

const pptxgen = require("pptxgenjs");

// ---------- EMBEDDED IMAGES (base64) ----------
// The original deck bundles 18 illustrated PNGs.  They are embedded here
// so this single file reproduces the deck without any external assets.
// The block is injected just below this line.
// ---------- EMBEDDED IMAGES (base64) ----------
const image_3_1 = "data:image/png;base64,PLACEHOLDER";
const image_3_2 = "data:image/png;base64,PLACEHOLDER";
const image_4_1 = "data:image/png;base64,PLACEHOLDER";
const image_4_2 = "data:image/png;base64,PLACEHOLDER";
const image_4_3 = "data:image/png;base64,PLACEHOLDER";
const image_6_1 = "data:image/png;base64,PLACEHOLDER";
const image_6_2 = "data:image/png;base64,PLACEHOLDER";
const image_6_3 = "data:image/png;base64,PLACEHOLDER";
const image_6_4 = "data:image/png;base64,PLACEHOLDER";
const image_6_5 = "data:image/png;base64,PLACEHOLDER";
const image_6_6 = "data:image/png;base64,PLACEHOLDER";
const image_6_7 = "data:image/png;base64,PLACEHOLDER";
const image_6_8 = "data:image/png;base64,PLACEHOLDER";
const image_8_1 = "data:image/png;base64,PLACEHOLDER";
const image_8_2 = "data:image/png;base64,PLACEHOLDER";
const image_8_3 = "data:image/png;base64,PLACEHOLDER";
const image_8_4 = "data:image/png;base64,PLACEHOLDER";
const image_8_5 = "data:image/png;base64,PLACEHOLDER";

// ---------- PALETTE ----------
const C = {
  bg:        "FAF8F3",  // page background (warm cream)
  ink:       "1A1A1A",  // body / titles
  inkSoft:   "4A4A47",  // secondary text
  mute:      "8A8A85",  // muted grey headings
  mute2:     "7A766A",  // secondary muted
  line:      "D8D4C7",  // hairline rules
  lineSoft:  "C9C2B0",  // softer rules
  tan:       "B8956A",  // signature tan accent
  tanDeep:   "8A6A44",  // italic accent brown
  tanBright: "D9A35B",  // DOS-terminal plate
  tanLight:  "D9B07A",  // light tan (opening-soon)
  plateCream:"EFE6D0",  // plate background
  plateCream2:"F0EAD9", // alt plate cream
  gridCream: "F4EDE0",  // grid plate
  sage:      "D9DCCB",  // sage (grey-era tint)
  red:       "C44536",  // accent red (book spines)
  maroon:    "6B3A2E",  // dark red spine
  navy:      "1F2A38",  // navy spine
  forest:    "2E3B2A",  // forest spine
  coal:      "2B2A27",  // near-black spine
  planDark:  "14130F",  // dark plan background
  planPanel: "33302A",  // plan panel fill
};

// ---------- HELPERS ----------
// Convert a plain hex like "8A8A85" plus alpha 0-100 to pptxgenjs transparency
// (pptxgenjs uses `transparency: 0-100` where 100 is fully transparent).
function trans(pct) { return { transparency: 100 - pct }; }

// Font families
const FONT_SANS  = "Arial";
const FONT_SERIF = "Georgia";

// Build a tracked-caps text option object.  The source deck uses large
// character-spacing on the small caption/eyebrow lines.
function caps(size, color, spacing) {
  return {
    fontFace: FONT_SANS, fontSize: size, color: color,
    charSpacing: spacing != null ? spacing : 4,
    bold: false, italic: false, valign: "top", margin: 0,
  };
}

// ---------- PRESENTATION ----------
const pres = new pptxgen();
pres.title  = "TERMINAL — Aesthetic Study";
pres.author = "Terminal Ann Arbor";

// Custom slide size: 20in × 11.25in (matches the source 18288000 × 10287000 EMU).
pres.defineLayout({ name: "TERMINAL_20x11", width: 20, height: 11.25 });
pres.layout = "TERMINAL_20x11";

// Shared slide background
function newSlide(bg) {
  const s = pres.addSlide();
  s.background = { color: bg || C.bg };
  return s;
}

// ============================================================
// SLIDE 1 — COVER: TERMiNAL
// ============================================================
{
  const s = newSlide();

  // Eyebrow (top-left): "ANN ARBOR, MICHIGAN · EST. 2026"
  s.addText("ANN ARBOR, MICHIGAN · EST. 2026", {
    x: 0.92, y: 0.75, w: 8, h: 0.34, ...caps(14, C.mute, 10), margin: 0,
  });

  // Eyebrow (top-right): "AESTHETIC STUDY / VOL. 01"
  s.addText("AESTHETIC STUDY / VOL. 01", {
    x: 14.01, y: 0.75, w: 5.22, h: 0.34,
    ...caps(14, C.mute, 10), align: "right", margin: 0,
  });

  // Big wordmark: TERMiNAL  — italic brown 'i'
  s.addText(
    [
      { text: "TERM", options: { color: C.ink } },
      { text: "i",    options: { color: C.tanDeep, italic: true } },
      { text: "NAL",  options: { color: C.ink } },
    ],
    {
      x: 0.92, y: 6.01, w: 18.71, h: 3.25,
      fontFace: FONT_SANS, fontSize: 270,
      bold: false, charSpacing: -12,
      align: "left", valign: "top", margin: 0,
    }
  );

  // Tagline (italic serif)
  s.addText("a computer café, opening soon on Liberty Street.", {
    x: 0.92, y: 9.70, w: 18.71, h: 0.55,
    fontFace: FONT_SERIF, fontSize: 26, italic: true, color: C.inkSoft,
    align: "left", valign: "top", margin: 0,
  });

  // Bottom-
```