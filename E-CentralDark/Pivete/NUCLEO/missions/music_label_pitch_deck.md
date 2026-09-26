# MISSAO - music_label_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\music_label_pitch_deck.js
**SHA:** ca3b373a2455b399
**Timestamp:** 2026-08-28T02:52:35.789004
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const rowStart = headerY + 32;

### Gaps
- // 3 columns — gap:32, total 1760 → each = (1760 - 64)/3 ≈ 565.3

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * On My Grind — PPTX Replica Builder
 * --------------------------------------------------------------
 * Recreates the HTML deck (On_My_Grind_Deck.html) as a PPTX
 * using pptxgenjs. Canvas is 1920x1080 px → 20" x 11.25" slide.
 *
 * Fonts are kept IDENTICAL to the HTML source:
 *   - Anton        (display headlines, big numbers, marquee)
 *   - Archivo Black (display fallback)
 *   - Instrument Serif (italic serif quote/lede)
 *   - JetBrains Mono (mono labels, corners, footers)
 *
 * Usage:  node build_deck.js
 * Output: On_My_Grind_Deck.pptx
 */

const pptxgen = require("pptxgenjs");

// ─── Unit conversion helpers ────────────────────────────────────
// HTML canvas is 1920x1080 at 96dpi. We map 1px → 1/96 inch.
const px = (n) => n / 96;               // px → inches (positions/sizes)
const fs = (n) => +(n * 0.75).toFixed(2); // px → pt   (font sizes, 1px = 0.75pt)

// Character spacing: CSS "letter-spacing" is in em. PptxGenJS charSpacing
// is in POINTS (library multiplies by 100 internally). Formula: em * fontPt.
const cs = (emVal, fontPx) => +(emVal * fs(fontPx)).toFixed(2);

// ─── Palette (matches :root vars in the HTML) ───────────────────
const C = {
  ink:   "0C0C0C",   // --ink
  bone:  "F3EFE6",   // --bone
  paper: "EBE5D6",   // --paper
  acid:  "C8E93D",   // oklch(0.88 0.19 120) → sRGB
  red:   "E63946",   // --red
  mute:  "6B665C",   // --mute
  phBg:  "D9D3C3",   // placeholder background (on bone slides)
  phInk: "1A1A1A",   // placeholder on ink-bg slides
};

// ─── Font families (authored names preserved exactly) ───────────
const F = {
  display: "Anton",
  displayAlt: "Archivo Black",
  serif:   "Instrument Serif",
  mono:    "JetBrains Mono",
};

// ─── Presentation setup ─────────────────────────────────────────
const pres = new pptxgen();
pres.title  = "On My Grind — Introduction Deck";
pres.author = "OMG";
pres.defineLayout({ name: "CUSTOM_20x11_25", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11_25";

// Slide canvas in inches
const W = 20, H = 11.25;

// ─── Reusable chrome: corner header + footer ────────────────────
function addCorner(slide, leftText, rightText, onInk = false) {
  const color = onInk ? C.bone : C.ink;
  const dotColor = onInk ? C.acid : C.ink;

  // Black dot before leftText
  slide.addShape(pres.shapes.OVAL, {
    x: px(40), y: px(45), w: px(10), h: px(10),
    fill: { color: dotColor }, line: { type: "none" },
  });
  // Left corner text (with room after the dot)
  slide.addText(leftText, {
    x: px(58), y: px(36), w: px(900), h: px(28),
    fontFace: F.mono, fontSize: fs(14),
    charSpacing: cs(0.18, 14),
    color, bold: false, margin: 0, valign: "middle",
  });
  // Right corner text
  slide.addText(rightText, {
    x: px(940), y: px(36), w: px(940), h: px(28),
    fontFace: F.mono, fontSize: fs(14),
    charSpacing: cs(0.18, 14),
    color, align: "right", margin: 0, valign: "middle",
  });
}

function addFooter(slide, left, middle, right, onInk = false) {
  const color = onInk ? C.bone : C.ink;
  const y = px(1080 - 34 - 18); // bottom:34px, approx text height
  const baseOpts = {
    y, h: px(22),
    fontFace: F.mono, fontSize: fs(13),
    charSpacing: cs(0.18, 13),
    color, margin: 0, valign: "middle",
  };
  slide.addText(left,   { ...baseOpts, x: px(40),   w: px(600), align: "left"   });
  slide.addText(middle, { ...baseOpts, x: px(640),  w: px(640), align: "center" });
  slide.addText(right,  { ...baseOpts, x: px(1280), w: px(600), align: "right"  });
}

// Tag (outlined mono pill, e.g. "MISSION")
function addTag(slide, label, x, y, opts = {}) {
  const onInk = opts.onInk || false;
  const color = onInk ? C.bone : C.ink;
  const text = label;
  // Approx width: ~12px per char at 14px + padding 20px
  const w  = opts.w  ?? px(Math.max(10, text.length) * 12 + 24);
  const h  = opts.h  ?? px(34);
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { type: "none" },
    line: { color, width: 1.5 },
  });
  slide.addText(text, {
    x, y, w, h,
    fontFace: F.mono, fontSize: fs(14),
    charSpacing: cs(0.12, 14),
    color, margin: 0, align: "center", valign: "middle",
  });
}

// Thick rule
function addRule(slide, x, y, w, thick = 2, onInk = false) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: px(thick),
    fill: { color: onInk ? C.bone : C.ink },
    line: { type: "none" },
  });
}

// ═══════════════════════════════════════════════════════════════
//  SLIDE 01 — COVER
// ═══════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.bone };

  // Decorative diagonal stripe block (bottom-right, subtle)
  // approximated with a rotated tinted rectangle
  s.addShape(pres.shapes.RECTANGLE, {
    x: px(1300), y: px(600), w: px(640), h: px(640),
    rotate: 12,
    fill: { color: C.ink, transparency: 92 },
    line: { type: "none" },
  });

  // Corner header
  addCorner(s, "OMG // INTRODUCTION", "CONFIDENTIAL // FOR UNIVERSAL MUSIC GROUP");


```