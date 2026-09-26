# CONTRATO - finance_lihtc_bond_portfolio_review.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_lihtc_bond_portfolio_review.js
**SHA:** 8413d6b5543727eb
**Timestamp:** 2026-08-28T02:52:33.863697
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const startX = 0.5, gap = 2.28;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * LIHTC_Portfolio_Final_v9.js
 * Goldman Sachs — Fixed Income | Municipal Securities
 * LIHTC Bond Portfolio — Managing Director Review
 * PptxGenJS rebuild · April 2025
 *
 * Usage:
 *   npm install pptxgenjs
 *   node LIHTC_Portfolio_Final_v9.js
 */

const pptxgen = require("pptxgenjs");

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:      "0B2344",   // GS deep navy (background / dark slides)
  navyMid:   "1A3A5C",   // secondary dark
  gold:      "B5935A",   // GS warm gold accent
  goldLight: "D4AF70",
  white:     "FFFFFF",
  offWhite:  "F5F4F0",
  slate:     "4A5568",
  midGrey:   "718096",
  lightGrey: "E2E8F0",
  bodyText:  "1A202C",
  green:     "2D6A4F",
  amber:     "92400E",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeShadow = () => ({
  type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.12,
});

const FOOTER_Y  = 5.25;
const FOOTER_H  = 0.32;
const SLIDE_W   = 10;
const SLIDE_H   = 5.625;

/** Add a standard confidential footer + page indicator */
function addFooter(slide, leftText, pageNum) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: FOOTER_Y, w: SLIDE_W, h: FOOTER_H,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  slide.addText(leftText, {
    x: 0.3, y: FOOTER_Y, w: 7, h: FOOTER_H,
    fontSize: 7, color: C.gold, valign: "middle", bold: false,
    fontFace: "Calibri", margin: 0,
  });
  slide.addText(`${pageNum} / 13`, {
    x: 8.9, y: FOOTER_Y, w: 0.9, h: FOOTER_H,
    fontSize: 7, color: C.midGrey, align: "right", valign: "middle",
    fontFace: "Calibri", margin: 0,
  });
}

/** Dark section-label header strip */
function addSectionBadge(slide, label, y = 0.18) {
  slide.addText(label, {
    x: 0.35, y, w: 9.3, h: 0.3,
    fontSize: 7.5, color: C.gold, bold: true, fontFace: "Calibri",
    charSpacing: 3, margin: 0,
  });
}

/** Slide title block */
function addTitle(slide, title, subtitle, titleY = 0.55) {
  slide.addText(title, {
    x: 0.35, y: titleY, w: 9.3, h: 0.5,
    fontSize: 22, bold: true, color: C.navy,
    fontFace: "Georgia", margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.35, y: titleY + 0.52, w: 9.3, h: 0.35,
      fontSize: 10, color: C.slate, fontFace: "Calibri", margin: 0,
    });
  }
}

/** KPI stat card */
function addKpiCard(slide, value, label, sublabel, x, y, w = 2.1, h = 1.0) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: C.offWhite }, line: { color: C.lightGrey, pt: 0.75 },
    shadow: makeShadow(),
  });
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.07, h,
    fill: { color: C.gold }, line: { color: C.gold },
  });
  slide.addText(value, {
    x: x + 0.13, y: y + 0.08, w: w - 0.18, h: 0.42,
    fontSize: 22, bold: true, color: C.navy, fontFace: "Georgia",
    valign: "top", margin: 0,
  });
  slide.addText(label, {
    x: x + 0.13, y: y + 0.5, w: w - 0.18, h: 0.22,
    fontSize: 9, bold: true, color: C.bodyText, fontFace: "Calibri",
    margin: 0,
  });
  if (sublabel) {
    slide.addText(sublabel, {
      x: x + 0.13, y: y + 0.72, w: w - 0.18, h: 0.2,
      fontSize: 7.5, color: C.midGrey, fontFace: "Calibri", margin: 0,
    });
  }
}

/** Footnote / disclaimer line */
function addDisclaimer(slide, text) {
  slide.addText(text, {
    x: 0.35, y: FOOTER_Y - 0.28, w: 9.3, h: 0.25,
    fontSize: 6.5, color: C.midGrey, fontFace: "Calibri",
    italic: true, margin: 0,
  });
}

// ─── Presentation init ────────────────────────────────────────────────────────
let pres = new pptxgen();
pres.layout  = "LAYOUT_16x9";
pres.author  = "Goldman Sachs — Fixed Income";
pres.title   = "LIHTC Bond Portfolio — Managing Director Review";
pres.subject = "CONFIDENTIAL | April 2025";

// ══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Cover
// ══════════════════════════════════════════════════════════════════════════════
{
  let s = pres.addSlide();
  s.background = { color: C.navy };

  // top gold bar
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: SLIDE_W, h: 0.08,
    fill: { color: C.gold }, line: { color: C.gold },
  });

  // firm wordmark
  s.addText("GOLDMAN SACHS", {
    x: 0.5, y: 0.22, w: 9, h: 0.36,
    fontSize: 13, bold: true, color: C.white, fontFace: "Georgia",
    charSpacing: 4, margin: 0,
  });
  s.addText("FIXED INCOME  |  MUNICIPAL SECURITIES", {
    x: 0.5, y: 0.56, w: 9, h: 0.25,
    fontSize: 8.5, color: C.gold, fontFace: "Calibri",
    charSpacing: 2, margin: 0,
  });

  // divider
  s.addShape(pres.shapes.LINE, {
    x: 0.5, y: 0.88, w: 9, h: 0,
    line: { color: C.gold, width: 0.75 },
  });

  // main title
  s.addText("LIHTC Bond Portfolio", {
    x: 0.5, y: 1.05, w: 9, h: 0.72,
    fontSize: 38, bold: true, color: C.white, fontFace: "Georgia",
    margin: 0,
  });
  s.addText("Managing Director Portfolio Review", {
    x: 0.5, y: 1.78, w: 9, h: 0.36,
    fontSize: 14, co
```