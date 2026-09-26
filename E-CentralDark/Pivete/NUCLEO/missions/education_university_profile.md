# MISSAO - education_university_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_university_profile.js
**SHA:** 06412b6bb8684be5
**Timestamp:** 2026-08-28T02:52:33.334224
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:

### Padroes
- * Header pattern: thin top rule + dot, section number/name (left), tagline (right),

### Gaps
- const gap  = 0.0;          // panels touch

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * lse.js — Recreates the LSE "A Brief Portrait" deck using pptxgenjs.
 *
 * Run:
 *   npm install pptxgenjs   (or: npm install -g pptxgenjs)
 *   node lse.js
 *
 * Output: lse.pptx
 *
 * Slide canvas: custom 20" × 11.25" (matches the source file).
 * Two-tone editorial system:
 *   - DARK slides (1, 3, 6, 9): #101418 background, cream text
 *   - LIGHT slides (2, 4, 5, 7, 8, 10): #EDE8DD background, ink text
 * Accent colors: burgundy #7A1C2A (light slides), coral #D97A4A (dark slides).
 * Header pattern: thin top rule + dot, section number/name (left), tagline (right),
 * chapter line in accent color, large display title with one italic accent word.
 */

const pptxgen = require("pptxgenjs");

// ─────────────────────────────────────────────────────────────────────────────
// Theme
// ─────────────────────────────────────────────────────────────────────────────
const W = 20;            // slide width
const H = 11.25;         // slide height
const M = 0.75;          // outer margin

const C = {
  // Light theme
  cream:      "EDE8DD",
  ink:        "1A1A1A",
  inkSoft:    "3D3D3D",
  muted:      "8A8578",
  rule:       "C9C3B5",
  burgundy:   "7A1C2A",
  // Dark theme
  navy:       "101418",
  cream2:     "E8E2D5",
  navyMuted:  "7A776F",
  navyRule:   "2A2E33",
  coral:      "D97A4A",
};

const FONT_SERIF = "Georgia";
const FONT_SANS  = "Calibri";

// ─────────────────────────────────────────────────────────────────────────────
// Boilerplate
// ─────────────────────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.title  = "L · S · E / A Brief Portrait";
pres.author = "LSE";
pres.defineLayout({ name: "LSE_CUSTOM", width: W, height: H });
pres.layout = "LSE_CUSTOM";

// ─────────────────────────────────────────────────────────────────────────────
// Header / Footer helpers
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Draws the standard chrome on every slide:
 *   - thin horizontal rule near top
 *   - small filled dot at the right end of the rule
 *   - top-left section number + name (e.g. "02 · ORIGINS")
 *   - top-right tagline (e.g. "1895 — PRESENT")
 *   - chapter line in accent color (e.g. "CHAPTER I · 1895–1910")
 */
function drawHeader(slide, opts) {
  const dark   = opts.dark === true;
  const bgText = dark ? C.cream2 : C.ink;
  const muted  = dark ? C.navyMuted : C.muted;
  const rule   = dark ? C.navyRule : C.rule;
  const accent = dark ? C.coral : C.burgundy;

  // Top rule
  slide.addShape(pres.shapes.LINE, {
    x: M, y: 0.55, w: W - 2 * M, h: 0,
    line: { color: rule, width: 0.75 },
  });
  // Right-end dot
  slide.addShape(pres.shapes.OVAL, {
    x: W - M - 0.07, y: 0.485, w: 0.14, h: 0.14,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });

  // Section number + name (top-left)
  slide.addText(opts.section, {
    x: M, y: 0.7, w: 8, h: 0.4,
    fontFace: FONT_SANS, fontSize: 12, color: muted,
    charSpacing: 6, bold: false, margin: 0,
  });

  // Tagline (top-right)
  slide.addText(opts.tag, {
    x: W - M - 8, y: 0.7, w: 8, h: 0.4,
    fontFace: FONT_SANS, fontSize: 12, color: muted,
    charSpacing: 6, align: "right", margin: 0,
  });

  // Chapter line (accent color)
  slide.addText(opts.chapter, {
    x: M, y: 1.15, w: W - 2 * M, h: 0.4,
    fontFace: FONT_SANS, fontSize: 13, color: accent,
    charSpacing: 6, bold: false, margin: 0,
  });
}

/**
 * Footer: page indicator (left), section name in caps (right).
 */
function drawFooter(slide, opts) {
  const dark  = opts.dark === true;
  const muted = dark ? C.navyMuted : C.muted;

  slide.addText(opts.page, {
    x: M, y: H - 0.7, w: 4, h: 0.35,
    fontFace: FONT_SANS, fontSize: 11, color: muted,
    charSpacing: 4, margin: 0,
  });

  if (opts.label) {
    slide.addText(opts.label, {
      x: W - M - 6, y: H - 0.7, w: 6, h: 0.35,
      fontFace: FONT_SANS, fontSize: 11, color: muted,
      charSpacing: 4, align: "right", margin: 0,
    });
  }
}

/**
 * Display title: a giant serif headline with ONE italicised accent word.
 * Renders as rich text so the italic word inherits accent color + italic style.
 */
function drawTitle(slide, parts, opts) {
  const dark   = opts.dark === true;
  const ink    = dark ? C.cream2 : C.ink;
  const accent = dark ? C.coral : C.burgundy;
  const size   = opts.size || 56;
  const y      = opts.y    ?? 1.7;
  const h      = opts.h    || 1.8;
  const w      = opts.w    || (W - 2 * M);

  const runs = parts.map((p) => ({
    text: p.text,
    options: {
      fontFace: FONT_SERIF,
      fontSize: size,
      color: p.italic ? accent : ink,
      italic: !!p.italic,
      bold: false,
    },
  }));

  slide.addText(runs, {
    x: M, y, w, h, valign: "top", margin: 0,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — COVER (dark)
// ─────────────────────────────────────────────────────────────────────────────
function slide1() {
  const s = pres.addSli
```