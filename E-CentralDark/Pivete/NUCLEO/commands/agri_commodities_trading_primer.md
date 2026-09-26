# COMANDO - agri_commodities_trading_primer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\agri_commodities_trading_primer.js
**SHA:** a9daf7ee93fc7a10
**Timestamp:** 2026-08-28T02:52:31.858054
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node abcd.js

### Gaps
- const gap = 2.92;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Agri_Traders_ABCD.pptx - pptxgenjs replica (revised)
 *
 * Colour / typography palette matches the source deck
 * "Agri_Traders_ABCD-3.pptx":
 *   - Cream paper background with a warm-neutral palette
 *   - Amber/ochre accent used for letters B/D, italic "ABCDs",
 *     bold runs, TREND arrows, progress bars, etc.
 *   - Arial throughout (as declared in the source XML)
 *
 * Slide canvas: 20" x 11.25"
 *
 * Run:  node abcd.js
 * Deps: npm install pptxgenjs
 */

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// Presentation + layout
// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.author = "Agri Commodities Market Brief";
pres.title = "The ABCDs of Agri-Trading";
pres.company = "Agri Commodities / Market Brief";

pres.defineLayout({ name: "CUSTOM_20x11_25", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11_25";

// ---------------------------------------------------------------------------
// Design tokens (extracted from the source .pptx)
// ---------------------------------------------------------------------------
const COLOR = {
  paper:       "F6F2EA", // cream slide background
  card:        "EEE8DC", // darker cream — margin-bar track, slide-10 middle card
  ink:         "2B2821", // primary dark brown-black (titles, body emphasis, letters A/C)
  secondary:   "5A5347", // medium brown — subheads, supporting body prose
  muted:       "847C6E", // warm gray — eyebrows, captions, footers, page numbers
  accent:      "A87432", // amber/ochre — B/D, italic "ABCDs", bold %, arrows, bars
  accentLight: "D6B989", // light tan — middle timeline dots (s5), 15% bar (s6)
  divider:     "C4BDAE", // light warm gray — hairlines between rows
};

const FONT = {
  head: "Arial",
  body: "Arial",
};

// Common geometry
const MARGIN_X = 1.25;
const CONTENT_W = 18.02;
const TITLE_Y = 1.48;
const EYEBROW_Y = 1.00;
const FOOTER_Y = 10.58;

// ---------------------------------------------------------------------------
// Reusable chrome: eyebrow, footer, page number
// ---------------------------------------------------------------------------
function addChrome(slide, sectionLabel, pageNumber) {
  slide.addText(sectionLabel, {
    x: MARGIN_X, y: EYEBROW_Y, w: CONTENT_W, h: 0.23,
    fontFace: FONT.body, fontSize: 12, color: COLOR.muted,
    bold: false, charSpacing: 1.7, margin: 0,
  });

  slide.addText("THE ABCDS OF AGRI-TRADING", {
    x: MARGIN_X, y: FOOTER_Y, w: 4, h: 0.21,
    fontFace: FONT.body, fontSize: 10.5, color: COLOR.muted,
    charSpacing: 1.5, margin: 0,
  });

  slide.addText(pageNumber, {
    x: 18.16, y: FOOTER_Y, w: 0.67, h: 0.21,
    fontFace: FONT.body, fontSize: 10.5, color: COLOR.muted,
    align: "right", charSpacing: 1.5, margin: 0,
  });
}

function addSlideTitle(slide, text) {
  slide.addText(text, {
    x: MARGIN_X, y: TITLE_Y, w: CONTENT_W, h: 0.95,
    fontFace: FONT.head, fontSize: 57, color: COLOR.ink,
    bold: false, margin: 0, valign: "top",
  });
}

// ---------------------------------------------------------------------------
// SLIDE 1 — Cover
// ---------------------------------------------------------------------------
function slide01() {
  const s = pres.addSlide();
  s.background = { color: COLOR.paper };

  // Top-left meta
  s.addText("AGRI COMMODITIES / MARKET BRIEF", {
    x: 1.25, y: 0.75, w: 5, h: 0.22,
    fontFace: FONT.body, fontSize: 11.25, color: COLOR.muted,
    charSpacing: 1.5, margin: 0,
  });

  // Top-right meta
  s.addText("VOLUME 01 · 2026", {
    x: 14, y: 0.75, w: 4.83, h: 0.22,
    fontFace: FONT.body, fontSize: 11.25, color: COLOR.muted,
    align: "right", charSpacing: 1.5, margin: 0,
  });

  // Huge "ABCD" letters — A/C = ink, B/D = accent
  const letters = [
    { L: "A", color: COLOR.ink },
    { L: "B", color: COLOR.accent },
    { L: "C", color: COLOR.ink },
    { L: "D", color: COLOR.accent },
  ];
  const xs = [1.25, 3.60, 5.95, 8.51];
  const widths = [2.43, 2.43, 2.64, 2.64];
  letters.forEach((obj, i) => {
    s.addText(obj.L, {
      x: xs[i], y: 1.62, w: widths[i], h: 3.23,
      fontFace: FONT.head, fontSize: 270, color: obj.color,
      bold: false, margin: 0, valign: "top",
    });
  });

  // Headline: "The ABCDs of Agri-Trading" (ABCDs italic, accent colour)
  s.addText(
    [
      { text: "The ", options: { italic: false, color: COLOR.ink } },
      { text: "ABCDs", options: { italic: true, color: COLOR.accent } },
      { text: " of Agri-Trading", options: { italic: false, color: COLOR.ink } },
    ],
    {
      x: 1.25, y: 5.31, w: 17.5, h: 2.3,
      fontFace: FONT.head, fontSize: 96, color: COLOR.ink,
      charSpacing: -1.9, margin: 0, valign: "top",
    }
  );

  // Subhead
  s.addText(
    "A field guide to the four houses that quietly move the world\u2019s grain, oilseeds, sugar and cotton.",
    {
      x: 1.25, y: 8.41, w: 11.80, h: 1.02,
      fontFace: FONT.body, fontSize: 25.
```