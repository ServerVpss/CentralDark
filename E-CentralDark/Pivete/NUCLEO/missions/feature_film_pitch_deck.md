# MISSAO - feature_film_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\feature_film_pitch_deck.js
**SHA:** 6eae32877591c6e7
**Timestamp:** 2026-08-28T02:52:33.311149
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: `node heliomachy.js` from a folder where ./media/ contains the source PNGs.

### Ouro Bruto (primeiros 5000 chars)
```
// heliomachy.js — recreates the Heliomachy pitch deck.
// Run: `node heliomachy.js` from a folder where ./media/ contains the source PNGs.

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.defineLayout({ name: "HM_WIDE", width: 20, height: 11.25 });
pres.layout = "HM_WIDE";
pres.author = "Téa Kovalenko";
pres.title = "Heliomachy — Pitch Deck";

// --------------------------------------------------------------------------
// Palette (taken from slide 6 swatch row)
// --------------------------------------------------------------------------
const COLOR = {
  void:   "07060A",
  bone:   "EFE7D6",
  ember:  "FF7A1A",
  glow:   "FFB763",
  cobalt: "5A7DFF",
  gold:   "C9A35A",
  // muted neutrals / surfaces used across slides
  parchment: "DAD2C0",     // slide 1 + 8 warm-stone background
  surface:   "8C8782",     // slide 3 + 4 warm-grey surface
  ink:       "1B1B22",     // off-black darker than void for type contrast
  dim:       "5A554F",     // muted text on parchment
  faint:     "9C9690",     // very muted text
};

const SERIF = "Georgia";
const MONO  = "Consolas";

// Tiny helpers ------------------------------------------------------------
const corner = (slide, x, y, dir, color = COLOR.bone, len = 0.35, w = 0.02) => {
  // dir: "tl" | "tr" | "bl" | "br"
  const horizX = dir.includes("l") ? x : x - len;
  const vertY  = dir.includes("t") ? y : y - len;
  const horizY = y;
  const vertX  = x;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: horizX, y: horizY, w: len, h: w, fill: { color }, line: { color, width: 0 },
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x: vertX, y: vertY, w, h: len, fill: { color }, line: { color, width: 0 },
  });
};

const frameCorners = (slide, x, y, w, h, color = COLOR.bone) => {
  corner(slide, x,       y,       "tl", color);
  corner(slide, x + w,   y,       "tr", color);
  corner(slide, x,       y + h,   "bl", color);
  corner(slide, x + w,   y + h,   "br", color);
};

// =========================================================================
// SLIDE 1 — Title
// =========================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.parchment };

  // Decorative concentric circles (using OVAL outlines)
  const cx = 10, cy = 5.5;
  [9.6, 7.8, 5.6, 3.4].forEach((d, i) => {
    s.addShape(pres.shapes.OVAL, {
      x: cx - d / 2, y: cy - d / 2, w: d, h: d,
      fill: { type: "solid", color: COLOR.parchment, transparency: 100 },
      line: { color: COLOR.glow, width: 0.5, transparency: i === 0 ? 70 : 50 },
    });
  });

  // Sun emblem at top
  s.addImage({ path: "./media/image-1-1.png", x: cx - 0.4, y: 0.85, w: 0.8, h: 0.8 });

  // Top corner brackets (small)
  corner(s, 0.4, 0.4, "tl", COLOR.faint, 0.3, 0.015);
  corner(s, 19.6, 0.4, "tr", COLOR.faint, 0.3, 0.015);
  corner(s, 0.4, 10.85, "bl", COLOR.faint, 0.3, 0.015);
  corner(s, 19.6, 10.85, "br", COLOR.faint, 0.3, 0.015);

  // Top tagline
  s.addText("A FEATURE IN DEVELOPMENT 2027", {
    x: 5, y: 1.85, w: 10, h: 0.4, align: "center", margin: 0,
    fontFace: MONO, fontSize: 16, color: COLOR.ember, charSpacing: 8, bold: true,
  });

  // HELIOMACHY title — huge serif, letterspaced
  s.addText("HELIOMACHY", {
    x: 0.5, y: 3.1, w: 19, h: 1.9, align: "center", valign: "middle", margin: 0,
    fontFace: SERIF, fontSize: 130, color: COLOR.bone, charSpacing: 30,
  });

  // Subtitle
  s.addText("— an original space epic in three acts —", {
    x: 4, y: 5.4, w: 12, h: 0.6, align: "center", margin: 0,
    fontFace: SERIF, fontSize: 26, italic: true, color: COLOR.dim,
  });

  // Three credits row
  const credits = [
    { label: "WRITTEN BY",    name: "Téa Kovalenko" },
    { label: "CO-WRITTEN BY", name: "Idris Mwangi"  },
    { label: "DIRECTED BY",   name: "Téa Kovalenko" },
  ];
  credits.forEach((c, i) => {
    const cx2 = 4 + i * 4;
    s.addText(c.label, {
      x: cx2, y: 8.6, w: 4, h: 0.3, align: "center", margin: 0,
      fontFace: MONO, fontSize: 10, color: COLOR.dim, charSpacing: 6,
    });
    s.addText(c.name, {
      x: cx2, y: 8.95, w: 4, h: 0.5, align: "center", margin: 0,
      fontFace: SERIF, fontSize: 22, italic: true, color: COLOR.gold,
    });
  });

  // Top row meta
  s.addText("FILM № 001 · PITCH", {
    x: 0.7, y: 0.55, w: 5, h: 0.3, margin: 0,
    fontFace: MONO, fontSize: 11, color: COLOR.dim, charSpacing: 6,
  });
  s.addText("CONFIDENTIAL", {
    x: 14.3, y: 0.55, w: 5, h: 0.3, align: "right", margin: 0,
    fontFace: MONO, fontSize: 11, color: COLOR.dim, charSpacing: 6,
  });

  // Bottom row meta
  s.addText("DRAFT IV · APRIL MMXXVI", {
    x: 0.7, y: 10.55, w: 6, h: 0.3, margin: 0,
    fontFace: MONO, fontSize: 11, color: COLOR.dim, charSpacing: 6,
  });
  s.addText("PROJECT : HM—001", {
    x: 13.3, y: 10.55, w: 6, h: 0.3, align: "right", margin: 0,
    fontFace: MONO, fontSize: 11, color: COLOR.dim, charSpacing: 6,
  });
}

// =============================================================
```