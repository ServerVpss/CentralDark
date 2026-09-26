# OUTRO - scuba_dive_operator_prospectus.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\scuba_dive_operator_prospectus.js
**SHA:** dc61aa5e7de84338
**Timestamp:** 2026-08-28T02:52:37.225756
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardW = 5.8, cardH = 6.6, gap = 0.35;

### Ouro Bruto (primeiros 5000 chars)
```
// Abyssal — dive operation prospectus
// Recreates scuba.pptx using pptxgenjs

const pptxgen = require("pptxgenjs");
const path = require("path");

const IMG = (n) => path.join(__dirname, "images", n);

// Palette
const NAVY       = "0E2544";   // deep navy (dark backgrounds)
const NAVY_DK    = "091A30";   // darker navy for cards
const ICE        = "E6ECF2";   // light background
const ICE_LT     = "DEE6EE";   // slightly darker light bg
const INK        = "0B1E3A";   // heading ink
const INK_SOFT   = "1C2F4D";   // body ink
const SKY        = "7FA6C8";   // accent sky
const SKY_LT     = "9CBDD8";   // lighter sky
const SKY_DK     = "4A78A2";   // darker sky
const MUTED      = "6F89A6";   // muted text
const MUTED_ICE  = "A9BED2";   // muted on ice
const WHITE      = "FFFFFF";
const BAR_DK     = "0E2744";
const BAR_MD     = "2F5E8A";
const BAR_LT     = "8AB0D4";
const BAR_XLT    = "B5CDE2";

// Fonts
const SERIF = "Georgia";
const SANS  = "Calibri";
const MONO  = "Consolas";

// Slide dims (custom 20 x 11.25)
const W = 20;
const H = 11.25;

const pres = new pptxgen();
pres.defineLayout({ name: "ABYSSAL", width: W, height: H });
pres.layout = "ABYSSAL";
pres.title  = "Abyssal — Prospectus MMXXVI";
pres.author = "Abyssal";

// ---------- helpers ----------
function addHeader(slide, section, onDark) {
  const fg = onDark ? WHITE : INK_SOFT;
  const muted = onDark ? MUTED_ICE : MUTED;
  // Diamond glyph
  slide.addText("◆", {
    x: 1.1, y: 0.55, w: 0.35, h: 0.35,
    fontFace: SANS, fontSize: 14, color: fg, align: "center", valign: "middle", margin: 0,
  });
  // Brand
  slide.addText("ABYSSAL", {
    x: 1.5, y: 0.55, w: 3.5, h: 0.35,
    fontFace: SANS, fontSize: 12, color: fg, charSpacing: 6, valign: "middle", margin: 0, bold: false,
  });
  // Section (right)
  if (section) {
    slide.addText(section, {
      x: W - 5.5, y: 0.55, w: 4.4, h: 0.35,
      fontFace: SANS, fontSize: 12, color: fg, charSpacing: 6, align: "right", valign: "middle", margin: 0,
    });
  }
}

function addFooter(slide, sectionShort, page, onDark) {
  const fg = onDark ? WHITE : INK_SOFT;
  slide.addText("ABYSSAL — PROSPECTUS MMXXVI", {
    x: 1.1, y: H - 0.55, w: 6, h: 0.3,
    fontFace: SANS, fontSize: 9.5, color: fg, charSpacing: 4, valign: "middle", margin: 0,
  });
  slide.addText(sectionShort, {
    x: W / 2 - 3, y: H - 0.55, w: 6, h: 0.3,
    fontFace: SANS, fontSize: 9.5, color: fg, charSpacing: 4, align: "center", valign: "middle", margin: 0,
  });
  slide.addText(page, {
    x: W - 3.1, y: H - 0.55, w: 2, h: 0.3,
    fontFace: SANS, fontSize: 9.5, color: fg, charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
}

// A simple monochrome "stamp" — concentric circle with text-in-center
function addStamp(slide, x, y, size, letter, color) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: size, h: size,
    fill: { type: "solid", color: "FFFFFF", transparency: 100 },
    line: { color, width: 0.75, transparency: 40 },
  });
  slide.addShape(pres.shapes.OVAL, {
    x: x + size * 0.18, y: y + size * 0.18, w: size * 0.64, h: size * 0.64,
    fill: { type: "solid", color: "FFFFFF", transparency: 100 },
    line: { color, width: 0.5, transparency: 40 },
  });
  slide.addText(letter, {
    x, y, w: size, h: size,
    fontFace: SERIF, italic: true, fontSize: Math.round(size * 22),
    color, align: "center", valign: "middle", margin: 0, transparency: 40,
  });
}

// ============================================================
// SLIDE 1 — Title / cover
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  // Hero photo (right ~55%)
  s.addImage({ path: IMG("image-1-1.jpeg"), x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
  // Dark overlay on left for text legibility
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: W * 0.55, h: H,
    fill: { color: "000000", transparency: 45 }, line: { type: "none" },
  });

  addHeader(s, null, true);
  // Header right cluster: A DIVE OPERATION | MMXXVI · NO. 01
  s.addText("A DIVE OPERATION", {
    x: W - 8.5, y: 0.55, w: 3.8, h: 0.35,
    fontFace: SANS, fontSize: 12, color: WHITE, charSpacing: 6, align: "right", valign: "middle", margin: 0,
  });
  s.addText("|", {
    x: W - 4.5, y: 0.55, w: 0.4, h: 0.35,
    fontFace: SANS, fontSize: 12, color: WHITE, align: "center", valign: "middle", margin: 0, transparency: 40,
  });
  s.addText("MMXXVI · NO. 01", {
    x: W - 4.0, y: 0.55, w: 2.9, h: 0.35,
    fontFace: SANS, fontSize: 12, color: WHITE, charSpacing: 6, align: "right", valign: "middle", margin: 0,
  });

  // Eyebrow
  s.addText("SÃO MIGUEL · AZORES · MID-ATLANTIC RIDGE", {
    x: 1.1, y: 4.9, w: 10, h: 0.4,
    fontFace: SANS, fontSize: 12, color: SKY_LT, charSpacing: 6, valign: "middle", margin: 0,
  });

  // Huge serif title "Abyssal."
  s.addText([
    { text: "Abyssal", options: { color: WHITE } },
    { text: ".",       options: { color: SKY_LT } },
  ], {
    x: 1.0,
```