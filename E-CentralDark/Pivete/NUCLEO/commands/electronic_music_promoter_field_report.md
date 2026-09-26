# COMANDO - electronic_music_promoter_field_report.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\electronic_music_promoter_field_report.js
**SHA:** 8788517b37772110
**Timestamp:** 2026-08-28T02:52:33.382561
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const xStart = 13.6 + i * 0.55;
- const rowStart = 2.96;

### Gaps
- const gap = 0.104;

### Ouro Bruto (primeiros 5000 chars)
```
// generate_deck.js
// Recreates "Northern Goa, after dark" field-report deck using pptxgenjs.
// Source slide dimensions (EMU): 18288000 x 10287000 → 20.0" x 11.25" (custom 16:9 widescreen).
// Palette: bg 0B0C0E, off-white E9E4D9, muted A9A396 / 7A7569, primary FF4B1F,
//          accent teal 3BD3C5, accent pink E63F87, rule 2A2A30.

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

// ---------- config ----------
const SLIDE_W = 20.0;
const SLIDE_H = 11.25;

const COLORS = {
  bg:          "0B0C0E",
  bgTitle:     "000000",
  bgSlide8:    "06070A",
  card:        "101116",
  cardAlt:     "0D0E12",
  cardAlt2:    "0B0D11",
  off:         "E9E4D9",
  muted:       "A9A396",
  mutedDark:   "7A7569",
  rule:        "2A2A30",
  primary:     "FF4B1F",
  teal:        "3BD3C5",
  pink:        "E63F87",
};

const FONT_SERIF = "Georgia"; // used for the large italic accents and title display
const FONT_SANS  = "Arial";   // body/eyebrows/caption
// (The source file uses "Arial" and "-apple-system"; we map the display/italic runs to Georgia
//  to preserve the "serif italic accent inside a sans headline" feel.)

// ---------- helpers ----------
function eyebrow(slide, left, right) {
  // top-of-slide eyebrow row: section number/title on left, section eyebrow on right
  slide.addText(left, {
    x: 1.042, y: 0.458, w: 8.0, h: 0.28,
    fontFace: FONT_SANS, fontSize: 12, color: COLORS.muted,
    charSpacing: 3.6, margin: 0, align: "left", valign: "top",
  });
  slide.addText(right, {
    x: 11.0, y: 0.458, w: 8.042, h: 0.28,
    fontFace: FONT_SANS, fontSize: 12, color: COLORS.mutedDark,
    charSpacing: 3.6, margin: 0, align: "right", valign: "top",
  });
}

function footer(slide, pageNum) {
  slide.addText("NORTHERN GOA · ELECTRONIC MUSIC", {
    x: 1.042, y: 10.625, w: 6, h: 0.28,
    fontFace: FONT_SANS, fontSize: 10.5, color: COLORS.mutedDark,
    charSpacing: 2.4, margin: 0, align: "left", valign: "top",
  });
  slide.addText(`${String(pageNum).padStart(2, "0")} / 10`, {
    x: 16.5, y: 10.625, w: 2.541, h: 0.28,
    fontFace: FONT_SANS, fontSize: 10.5, color: COLORS.mutedDark,
    charSpacing: 2.4, margin: 0, align: "right", valign: "top",
  });
}

// Horizontal rule
function hr(slide, x, y, w, color = COLORS.rule, thickness = 0.01) {
  slide.addShape("rect", {
    x, y, w, h: thickness,
    fill: { color }, line: { type: "none" },
  });
}

// Vertical rule
function vr(slide, x, y, h, color = COLORS.rule, thickness = 0.01) {
  slide.addShape("rect", {
    x, y, w: thickness, h,
    fill: { color }, line: { type: "none" },
  });
}

// Display headline — "word, [italic word]."
// runs = [{ text, italic?, color? }, ...]
function displayHeadline(slide, y, runs, sz = 78) {
  const rich = runs.map((r, i) => ({
    text: r.text,
    options: {
      fontFace: r.italic ? FONT_SERIF : FONT_SANS,
      fontSize: sz,
      color: r.color || COLORS.off,
      italic: !!r.italic,
      charSpacing: -0.3,
    },
  }));
  slide.addText(rich, {
    x: 1.042, y, w: 18.454, h: 1.4,
    margin: 0, valign: "top", align: "left",
  });
}

// ---------- presentation ----------
const pres = new pptxgen();
pres.author = "Field Report";
pres.title  = "Northern Goa, after dark";
pres.defineLayout({ name: "CUSTOM_20x11_25", width: SLIDE_W, height: SLIDE_H });
pres.layout = "CUSTOM_20x11_25";

// ============================================================
// SLIDE 1 — COVER
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: COLORS.bgTitle };

  // Orange wash overlay (35% alpha) — warms the whole frame
  s.addShape("rect", {
    x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
    fill: { color: COLORS.primary, transparency: 65 },
    line: { type: "none" },
  });
  // Soft white film on top
  s.addShape("rect", {
    x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
    fill: { color: "FFFFFF", transparency: 98 },
    line: { type: "none" },
  });

  // Eyebrow row — "A FIELD REPORT ●" left, season right
  s.addText(
    [
      { text: "A FIELD REPORT ", options: { color: COLORS.muted, charSpacing: 3.6 } },
      { text: "●",              options: { color: COLORS.primary, charSpacing: 3.6 } },
    ],
    {
      x: 1.042, y: 0.792, w: 6, h: 0.35,
      fontFace: FONT_SANS, fontSize: 18, margin: 0,
      align: "left", valign: "top",
    }
  );
  s.addText("2025 / 2026 SEASON", {
    x: 13.0, y: 0.792, w: 5.95, h: 0.35,
    fontFace: FONT_SANS, fontSize: 18, color: COLORS.muted,
    charSpacing: 3.6, margin: 0, align: "right", valign: "top",
  });

  // Sub-eyebrow: GOA, INDIA / coords
  s.addText("GOA, INDIA / 15.6°N 73.7°E", {
    x: 1.042, y: 1.24, w: 10, h: 0.32,
    fontFace: FONT_SANS, fontSize: 18, color: COLORS.mutedDark,
    charSpacing: 1.44, margin: 0, align: "left", valign: "top",
  });

  // Big display title — "Northern Goa, after dark."
  s.addText(
    [
      { text: "Northern Goa",  options: { fontFace: FONT_SANS,  italic: false, col
```