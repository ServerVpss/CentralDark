# OUTRO - restaurant_concept_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\restaurant_concept_pitch_deck.js
**SHA:** 2c7b930254492815
**Timestamp:** 2026-08-28T02:52:36.529843
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap     = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// MAÍZ — una taquería · Ann Arbor 2027
// Recreates restaurant.pptx using pptxgenjs
//
// Usage:  node generate.js
// Output: restaurant.pptx   (same directory as this script)
//
// Assets are expected in ./assets/ (image-1-1.png, image-3-1.png, image-4-1.png .. image-9-1.png)

const pptxgen = require("pptxgenjs");
const path = require("path");

const ASSETS = path.join(__dirname, "assets");

// Palette
const CAL     = "EAE1D1"; // weathered lime-wash (cream)
const ANIL    = "2A4766"; // faded painted wall (navy)
const MASA    = "B4572A"; // toasted tortilla (terracotta)
const INK     = "1F1B16"; // near-black
const MUTED   = "4A3F33"; // warm gray

// Fonts
const HEAD = "Arial";      // bold/black sans used for headlines
const BODY = "Arial";      // body
const ITAL = "Georgia";    // serif italic for accent words (fraunces-ish)

const pres = new pptxgen();

// Custom layout to match the source deck (20" × 11.25", 16:9)
pres.defineLayout({ name: "MAIZ_WIDE", width: 20, height: 11.25 });
pres.layout  = "MAIZ_WIDE";
pres.title   = "MAÍZ — una taquería";
pres.author  = "MAÍZ";
pres.company = "MAÍZ Ann Arbor";

const W = 20;
const H = 11.25;

// ---------- helpers ----------
const eyebrow = (slide, num, label, color = MASA) => {
  slide.addText(
    [
      { text: num,      options: { color, bold: true } },
      { text: "  ·  ",  options: { color: color } },
      { text: label,    options: { color } },
    ],
    {
      x: 1.25, y: 0.83, w: 10, h: 0.45,
      fontFace: BODY, fontSize: 18, charSpacing: 8, margin: 0,
    }
  );
};

// ---------- SLIDE 1 — Cover ----------
{
  const s = pres.addSlide();
  s.background = { color: CAL };

  // Navy top band with wavy bottom (embedded image recreates the hand-drawn curve)
  s.addImage({
    path: path.join(ASSETS, "image-1-1.png"),
    x: 0, y: 0, w: W, h: 2.29,
  });

  // Eyebrow on navy band
  s.addText("ANN ARBOR  ·  A VISION", {
    x: 1.25, y: 0.83, w: 12, h: 0.45,
    fontFace: BODY, fontSize: 18, color: CAL,
    charSpacing: 8, margin: 0,
  });

  // MAÍZ big title
  s.addText("MAÍZ", {
    x: 1.25, y: 3.55, w: 18.0, h: 4.0,
    fontFace: HEAD, fontSize: 330, bold: true, color: ANIL,
    charSpacing: -40, margin: 0,
  });

  // "— una taquería —" tilted slightly (rot = -1.2°)
  s.addText([
    { text: "—  ",          options: { bold: true, color: MASA } },
    { text: "una taquería", options: { bold: true, italic: true, color: MASA } },
    { text: "  —",          options: { bold: true, color: MASA } },
  ], {
    x: 1.56, y: 7.87, w: 17.7, h: 1.31,
    fontFace: ITAL, fontSize: 72, rotate: -1.2, margin: 0,
  });

  // Right-bottom stamp "hecho a mano / EST. 2027"
  s.addText([
    { text: "hecho a",  options: { bold: true, color: MASA, breakLine: true } },
    { text: "mano",     options: { bold: true, color: MASA } },
  ], {
    x: 17.4, y: 9.15, w: 2.2, h: 1.0,
    fontFace: BODY, fontSize: 22, margin: 0,
  });
  s.addText("EST. 2027", {
    x: 17.4, y: 10.25, w: 2.2, h: 0.4,
    fontFace: BODY, fontSize: 14, color: INK, charSpacing: 6, margin: 0,
  });
}

// ---------- SLIDE 2 — The Name ----------
{
  const s = pres.addSlide();
  s.background = { color: CAL };
  eyebrow(s, "01", "THE NAME");

  // Giant MAÍZ
  s.addText("MAÍZ", {
    x: 1.25, y: 1.55, w: 10.5, h: 3.9,
    fontFace: HEAD, fontSize: 260, bold: true, color: ANIL,
    charSpacing: -30, margin: 0,
  });

  // Pronunciation line
  s.addText([
    { text: "/ MA·ˈIS / ", options: { color: INK } },
    { text: "N.",          options: { bold: true, color: MASA } },
    { text: " SPANISH, CORN.", options: { color: INK } },
  ], {
    x: 1.25, y: 5.55, w: 10, h: 0.6,
    fontFace: BODY, fontSize: 22, margin: 0,
  });

  // Right side: headline + three rows
  s.addText("One word. Says what we are.", {
    x: 11.0, y: 2.15, w: 8.0, h: 0.8,
    fontFace: ITAL, fontSize: 28, bold: true, italic: true, color: INK, margin: 0,
  });
  // Divider under headline
  s.addShape(pres.shapes.LINE, {
    x: 11.0, y: 3.25, w: 8.0, h: 0,
    line: { color: INK, width: 0.75 },
  });

  const rows = [
    ["01", "The soul of every dish. If we can't make it, we don't serve it."],
    ["02", "Quiet wink at maize & blue — home, not costume."],
    ["03", "Pronounceable. Memorable. Fits on an awning."],
  ];
  let ry = 3.5;
  rows.forEach(([num, text], i) => {
    s.addText(num, {
      x: 11.0, y: ry, w: 0.9, h: 0.6,
      fontFace: BODY, fontSize: 18, color: MASA, margin: 0,
    });
    s.addText(text, {
      x: 12.0, y: ry, w: 7.1, h: 0.9,
      fontFace: BODY, fontSize: 18, color: INK, margin: 0,
    });
    ry += 1.25;
    if (i < rows.length - 1) {
      s.addShape(pres.shapes.LINE, {
        x: 11.0, y: ry - 0.25, w: 8.0, h: 0,
        line: { color: INK, width: 0.5 },
      });
    }
  });
}

// ---------- SLIDE 3 — The Vision ----------
{
  const s = pres.addSlide();
  s.background = { color: ANIL };
  eyebrow(s, "02", "THE VISION", MASA);

  // Big headline (mixed cream + masa italic)
  s.addText([
    { t
```