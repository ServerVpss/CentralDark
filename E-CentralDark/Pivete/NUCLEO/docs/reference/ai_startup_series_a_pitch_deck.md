# REFERENCIA - ai_startup_series_a_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\ai_startup_series_a_pitch_deck.js
**SHA:** 55e39c5bd4b76a39
**Timestamp:** 2026-08-28T02:52:32.196505
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node recreate.js   →  produces pitch_deck.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// recreate.js
// Recreates pitch_deck.pptx using pptxgenjs.
//
// Requires: npm install pptxgenjs
// Decorative PNGs (the visual on each slide) live in ./images/
// and are referenced by file path. They were extracted from the
// original .pptx (ppt/media/image-N-1.png) and shipped alongside
// this script so the output is byte-for-byte visually faithful.
//
// Run:  node recreate.js   →  produces pitch_deck.pptx

const path = require("path");
const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// ---------- Slide canvas: custom 20" × 11.25" (matches source deck) ----------
pres.defineLayout({ name: "MIRRORLINE", width: 20, height: 11.25 });
pres.layout = "MIRRORLINE";
pres.author = "Mirrorline";
pres.title = "Mirrorline — Series A Pitch Deck";

const SLIDE_W = 20;
const SLIDE_H = 11.25;

// ---------- Design tokens ----------
const FONT = "Arial";
const INK = "000000";

const IMG = (name) => path.join(__dirname, "images", name);

// Caps-style label settings used for the small header / footer / eyebrow rows.
const CAPS = {
  fontFace: FONT,
  fontSize: 18,
  color: INK,
  charSpacing: 4, // approximates the tracked-out caps look
  margin: 0,
};

// ---------- Reusable chrome: top-left logo, top-right section tag, ----------
// bottom-left footer caption, bottom-right page number.
function addChrome(slide, sectionTag, footerLeft, pageNumber) {
  // Top-left logo wordmark
  slide.addText("MIRRORLINE", {
    x: 1.333, y: 0.583, w: 2.5, h: 0.328,
    ...CAPS, align: "left",
  });

  // Top-right section tag (e.g. "02 / 10 · THE PROBLEM")
  if (sectionTag) {
    slide.addText(sectionTag, {
      x: 13.5, y: 0.583, w: 5.55, h: 0.328,
      ...CAPS, align: "right",
    });
  }

  // Bottom-left footer caption
  if (footerLeft) {
    slide.addText(footerLeft, {
      x: 1.042, y: 10.38, w: 12, h: 0.328,
      ...CAPS, align: "left",
    });
  }

  // Bottom-right page number
  if (pageNumber) {
    slide.addText(pageNumber, {
      x: 17.5, y: 10.38, w: 1.55, h: 0.328,
      ...CAPS, align: "right",
    });
  }
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
{
  const s = pres.addSlide();
  // Full-bleed decorative artwork (gradient sphere) sits behind everything
  s.addImage({ path: IMG("image-1-1.png"), x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });

  // Top chrome (no section tag here — uses "SERIES A · 2026" instead)
  s.addText("MIRRORLINE", {
    x: 1.333, y: 0.583, w: 2.5, h: 0.328, ...CAPS, align: "left",
  });
  s.addText("SERIES A · 2026", {
    x: 13.5, y: 0.583, w: 5.55, h: 0.328, ...CAPS, align: "right",
  });

  // Eyebrow
  s.addText("PITCH DECK — CONFIDENTIAL", {
    x: 2.062, y: 5.877, w: 6, h: 0.318, ...CAPS, align: "left",
  });

  // Hero wordmark
  s.addText("Mirrorline", {
    x: 1.042, y: 6.534, w: 11.802, h: 2.287,
    fontFace: FONT, fontSize: 165, color: INK, bold: false,
    align: "left", valign: "top", margin: 0,
  });

  // Sub-headline
  s.addText("Ambient computing infrastructure for teams that build with AI.", {
    x: 1.042, y: 9.154, w: 10.729, h: 1.096,
    fontFace: FONT, fontSize: 33, color: INK, align: "left", valign: "top",
    margin: 0,
  });

  // Bottom row
  s.addText("APRIL 2026", {
    x: 1.042, y: 10.38, w: 3, h: 0.328, ...CAPS, align: "left",
  });
  s.addText("MAREN ALDÍS · FOUNDER & CEO", {
    x: 13.5, y: 10.38, w: 5.55, h: 0.328,
    ...CAPS, align: "right",
  });
}

// ============================================================
// SLIDE 2 — The Problem
// ============================================================
{
  const s = pres.addSlide();
  // Right-side scattered shapes artwork
  s.addImage({ path: IMG("image-2-1.png"), x: 9.375, y: 0, w: 11.458, h: 11.25 });

  addChrome(s, "02 / 10 · THE PROBLEM", "SOURCE · MIRRORLINE CUSTOMER INTERVIEWS, N=42", "02");

  // Eyebrow
  s.addText("THE PROBLEM", {
    x: 2.062, y: 2.401, w: 5, h: 0.318, ...CAPS, align: "left",
  });

  // Big headline. Slightly smaller and wider than the source spec so the
  // four-line render fits cleanly above the stats row at y=7.411 (LibreOffice's
  // line metrics are a hair taller than the source app's).
  s.addText(
    "Teams building with AI are stitching together a dozen tools that were never meant to talk.",
    {
      x: 1.042, y: 3.057, w: 13.5, h: 4.242,
      fontFace: FONT, fontSize: 64, color: INK, align: "left", valign: "top",
      margin: 0,
    }
  );

  // Three stat columns: number + caption
  const stats = [
    { num: "14",    cap: "average tools in an AI workflow before something ships", x: 1.042 },
    { num: "38%",   cap: "of engineering time spent on plumbing, not product",     x: 5.443 },
    { num: "6 wks", cap: "median time-to-prototype for a new internal agent",      x: 9.844 },
  ];
  for (const st of stats) {
    s.addText(st.num, {
      x: st.x, y: 7.411, w: 4.667, h: 1.031,
      fontFace: FONT, fontSize: 54, color: INK, align: "left", v
```