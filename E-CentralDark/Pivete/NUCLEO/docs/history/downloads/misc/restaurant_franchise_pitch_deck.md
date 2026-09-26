# OUTRO - restaurant_franchise_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\restaurant_franchise_pitch_deck.js
**SHA:** e20d325d8dc863cd
**Timestamp:** 2026-08-28T02:52:36.723895
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:

### Gaps
- const gap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Muy Bonita Tacos — Investor Deck Recreation
 * Rebuilt with pptxgenjs to match the original 17-slide presentation.
 *
 * Run:
 *   npm install pptxgenjs
 *   node muy_bonita_tacos.js
 */

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const C = {
  cream:      "F3E9D2",   // main light background
  creamAlt:   "F8F0DD",   // slightly lighter cream variant
  creamLine:  "EADDBC",   // subtle divider tone
  terracotta: "C1440E",   // brand red/orange
  green:      "2E4A2B",   // forest green
  gold:       "F2B705",   // yellow/gold
  brown:      "9C5A2C",   // warm brown
  ink:        "1A1410",   // near-black ink text
  inkSoft:    "2A1D12",   // dark brown alt
  muted:      "4E3826",   // muted label brown
  white:      "FFFFFF",
  // slide-6 delivery menu dark background
  deliveryBg: "2A1D12",
};

// Fonts — serif italic for display headlines, monospace for labels, sans for body.
const F = {
  serif:  "Georgia",         // used italic for headlines and numbers
  mono:   "Consolas",        // used for small-caps style labels / dates / page numbers
  sans:   "Calibri",         // body copy
};

// ---------------------------------------------------------------------------
// Presentation setup — 20" x 11.25" custom widescreen to match original
// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.defineLayout({ name: "MB_WIDE", width: 20, height: 11.25 });
pres.layout = "MB_WIDE";
pres.author = "Muy Bonita Tacos";
pres.title  = "Muy Bonita Tacos — Investor Presentation Spring 2026";

const W = 20;
const H = 11.25;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
// Shared footer (page counter left + brand tag right). Text color adapts.
function addFooter(slide, pageNum, textColor = C.muted) {
  slide.addText(`${String(pageNum).padStart(2, "0")} / 17`, {
    x: 0.9, y: H - 0.75, w: 3, h: 0.35,
    fontFace: F.mono, fontSize: 16, color: textColor,
    charSpacing: 3, align: "left", valign: "middle", margin: 0,
  });
  slide.addText("MUY BONITA  ·  EST. 2014", {
    x: W - 5.5, y: H - 0.75, w: 4.6, h: 0.35,
    fontFace: F.mono, fontSize: 16, color: textColor,
    charSpacing: 3, align: "right", valign: "middle", margin: 0,
  });
}

// Small-caps section kicker at top-left (e.g. "01 — THE THESIS")
function addKicker(slide, text, color = C.terracotta) {
  slide.addText(text, {
    x: 0.9, y: 0.65, w: 12, h: 0.45,
    fontFace: F.mono, fontSize: 18, color, charSpacing: 4,
    bold: false, align: "left", valign: "middle", margin: 0,
  });
}

// Large italic serif headline (used on most content slides).
function addHeadline(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.9,
    y: opts.y ?? 1.35,
    w: opts.w ?? 18,
    h: opts.h ?? 2.4,
    fontFace: F.serif, fontSize: opts.size ?? 52,
    italic: true, bold: false,
    color: opts.color ?? C.ink,
    align: "left", valign: "top", margin: 0,
  });
}

// ---------------------------------------------------------------------------
// SLIDE 1 — Cover
// ---------------------------------------------------------------------------
{
  const s = pres.addSlide();
  s.background = { color: C.cream };

  // Top kicker
  s.addText("INVESTOR PRESENTATION  ·  SPRING 2026", {
    x: 0.9, y: 0.65, w: 14, h: 0.45,
    fontFace: F.mono, fontSize: 20, color: C.terracotta,
    charSpacing: 5, align: "left", valign: "middle", margin: 0,
  });

  // Decorative shapes (left: terracotta standalone block; right: green tall rect + gold circle)
  // Terracotta rectangle — smaller, floating above title with a gap
  s.addShape(pres.shapes.RECTANGLE, {
    x: 1.1, y: 1.4, w: 2.0, h: 2.9,
    fill: { color: C.terracotta }, line: { color: C.terracotta },
  });

  // Green tall rectangle on the right
  s.addShape(pres.shapes.RECTANGLE, {
    x: 14.3, y: 1.6, w: 2.3, h: 3.8,
    fill: { color: C.green }, line: { color: C.green },
  });

  // Gold circle upper right
  s.addShape(pres.shapes.OVAL, {
    x: 16.9, y: 1.1, w: 1.7, h: 1.7,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // Main title — large italic serif (sits below the block with a gap)
  s.addText("Muy Bonita\nTacos.", {
    x: 0.9, y: 5.6, w: 13, h: 2.8,
    fontFace: F.serif, fontSize: 92, italic: true,
    color: C.ink, align: "left", valign: "top", margin: 0,
    lineSpacingMultiple: 0.95,
  });

  // Tagline — extra gap below title
  s.addText("Hand-pressed tortillas, family recipes,\nfast-casual service.", {
    x: 0.9, y: 9.0, w: 11, h: 1.4,
    fontFace: F.serif, fontSize: 24, italic: true,
    color: C.muted, align: "left", valign: "top", margin: 0,
    lineSpacingMultiple: 1.15,
  });

  // Bottom-right URL
  s.addText("MUYBONITA.CO  /  INVESTORS",
```