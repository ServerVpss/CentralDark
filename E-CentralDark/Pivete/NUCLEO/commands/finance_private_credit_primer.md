# COMANDO - finance_private_credit_primer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_private_credit_primer.js
**SHA:** 29b58e6c14baa39e
**Timestamp:** 2026-08-28T02:52:33.882937
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node private_credit.js  →  produces Private_Credit.pptx
- const rowStart = cardY + 1.45;

### Gaps
- const gap = 0.3;
- const gap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// Replica of Private_Credit.pptx — built with pptxgenjs
// Run: node private_credit.js  →  produces Private_Credit.pptx

const pptxgen = require("pptxgenjs");

// ─── Palette ──────────────────────────────────────────────
const BG        = "EFEAE0"; // warm cream background
const BG_CARD   = "F5F0E6"; // slightly lighter card on cream
const DARK_BG   = "2B2824"; // dark card / dark slide background
const DARK_TEXT = "1A1A1A"; // near-black body
const MUTED     = "7A756D"; // muted gray-brown for labels/meta
const MUTED_LT  = "A89F93"; // lighter muted for footers on dark
const ACCENT    = "B85C38"; // terracotta/rust accent
const RULE      = "CFC7B9"; // thin divider color on cream
const RULE_DK   = "4A443E"; // divider on dark
const CREAM_TX  = "EFEAE0"; // cream text on dark bg

// Fonts
const HEADER_FONT = "Arial";
const BODY_FONT   = "Arial";

const pres = new pptxgen();
pres.layout  = "LAYOUT_WIDE";   // 13.333" × 7.5"
pres.author  = "Retail Primer";
pres.title   = "Private Credit — A Retail Primer";

const W = 13.333;
const H = 7.5;
const MARGIN = 0.6;

// ─── Helpers ──────────────────────────────────────────────
function addHeaderFooter(slide, opts) {
  const {
    eyebrowLeft = "",
    pageNum     = "",
    footerLeft  = "PRIVATE CREDIT · A RETAIL PRIMER",
    footerRight = "",
    dark        = false,
  } = opts || {};

  const metaColor   = dark ? MUTED_LT : MUTED;
  const footerColor = dark ? MUTED_LT : MUTED;

  // Top-left eyebrow
  if (eyebrowLeft) {
    slide.addText(eyebrowLeft, {
      x: MARGIN, y: 0.35, w: 8, h: 0.3,
      fontSize: 10, fontFace: HEADER_FONT,
      color: metaColor, charSpacing: 4, bold: false, margin: 0,
    });
  }
  // Top-right page number
  if (pageNum) {
    slide.addText(pageNum, {
      x: W - MARGIN - 2, y: 0.35, w: 2, h: 0.3,
      fontSize: 10, fontFace: HEADER_FONT,
      color: metaColor, charSpacing: 4, align: "right", margin: 0,
    });
  }
  // Bottom-left footer
  if (footerLeft) {
    slide.addText(footerLeft, {
      x: MARGIN, y: H - 0.55, w: 8, h: 0.3,
      fontSize: 10, fontFace: HEADER_FONT,
      color: footerColor, charSpacing: 4, margin: 0,
    });
  }
  // Bottom-right footer
  if (footerRight) {
    slide.addText(footerRight, {
      x: W - MARGIN - 5, y: H - 0.55, w: 5, h: 0.3,
      fontSize: 10, fontFace: HEADER_FONT,
      color: footerColor, charSpacing: 4, align: "right", margin: 0,
    });
  }
}

// ═══════════════════════════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: BG };

  addHeaderFooter(s, {
    eyebrowLeft: "A RETAIL PRIMER · 2026",
    pageNum:     "10 MIN READ",
    footerLeft:  "INTRODUCTION · DEFINITIONS · MARKET · PLAYERS · ACCESS",
    footerRight: "01 / 10",
  });

  // Huge title "Private Credit."
  s.addText(
    [
      { text: "Private ", options: { color: DARK_TEXT, bold: false } },
      { text: "Credit.",   options: { color: ACCENT,    italic: true } },
    ],
    {
      x: MARGIN, y: 1.3, w: W - 2 * MARGIN, h: 2.2,
      fontSize: 110, fontFace: HEADER_FONT, valign: "top", margin: 0,
    }
  );

  // Thin divider rule
  s.addShape(pres.shapes.LINE, {
    x: MARGIN, y: 4.55, w: 5.5, h: 0,
    line: { color: RULE, width: 0.75 },
  });

  // Subtitle below rule
  s.addText(
    "The $1.7 trillion corner of finance that used to belong only to institutions.",
    {
      x: MARGIN, y: 4.8, w: 6.2, h: 1.0,
      fontSize: 18, fontFace: BODY_FONT,
      color: DARK_TEXT, margin: 0,
    }
  );
}

// ═══════════════════════════════════════════════════════════
// SLIDE 2 — Definition
// ═══════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: BG };

  addHeaderFooter(s, {
    eyebrowLeft: "01 · DEFINITION",
    pageNum:     "02 / 10",
    footerRight: "DEFINITION",
  });

  // Small eyebrow label
  s.addText("WHAT IS PRIVATE CREDIT?", {
    x: MARGIN, y: 1.3, w: 8, h: 0.35,
    fontSize: 11, fontFace: HEADER_FONT,
    color: MUTED, charSpacing: 4, margin: 0,
  });

  // Big definition text (rich)
  s.addText(
    [
      { text: "Loans made ",                           options: { color: DARK_TEXT } },
      { text: "directly",                              options: { color: ACCENT, italic: true } },
      { text: " from non-bank lenders to mostly private companies — negotiated one-on-one, held to maturity, and ",
                                                       options: { color: DARK_TEXT } },
      { text: "never traded",                          options: { color: ACCENT, italic: true } },
      { text: " on a public market.",                  options: { color: DARK_TEXT } },
    ],
    {
      x: MARGIN, y: 1.8, w: W - 2 * MARGIN, h: 2.6,
      fontSize: 36, fontFace: HEADER_FONT, valign: "top",
      paraSpaceAfter: 0, margin: 0,
    }
  );

  // Divider rule above the three columns
  s.addShape(pres.shapes.LINE, {
    x: MARGIN
```