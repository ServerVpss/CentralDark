# OUTRO - finance_venture_capital_primer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_venture_capital_primer.js
**SHA:** dc937eeba9e45cb9
**Timestamp:** 2026-08-28T02:52:34.433606
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardW = 2.85, cardH = 2.75, gap = 0.2;
- const colW = 2.4, colGap = 0.1;
- const rowGap    = 0.85;
- const cardW = 4.05, cardH = 3.1, gap = 0.1;

### Ouro Bruto (primeiros 5000 chars)
```
// Recreates the "Venture Capital — A Primer" deck using pptxgenjs
// Palette: cream #F1EBE0, burnt orange #C84B1F, ink #1A1A1A, muted #6B6356, dark #0E0E0E

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";          // 13.333" × 7.5"
pres.author = "Venture Capital Primer";
pres.title  = "Venture Capital — A Primer";

// --- Color tokens ------------------------------------------------------------
const CREAM   = "F1EBE0";
const CREAM_DK= "E8E0D1";
const ORANGE  = "C84B1F";
const ORANGE_L= "E0987A";
const TAN     = "D6C9B3";
const INK     = "1A1A1A";
const MUTED   = "6B6356";
const DARK_BG = "1A1512";
const DARK_BG_TXT = "F1EBE0";
const DARK_MUTED  = "9A9184";
const HAIRLINE    = "CFC5B3";
const HAIRLINE_DK = "3A332D";

const HF = "Helvetica";                // header / body (clean sans)

// --- Helpers -----------------------------------------------------------------
const SW = 13.333;    // slide width
const SH = 7.5;       // slide height

// Top "eyebrow" strip: orange dot + SECTION + index
function addEyebrow(slide, section, index, dark = false) {
  const dotColor = ORANGE;
  const txtColor = ORANGE;
  const idxColor = dark ? DARK_MUTED : MUTED;

  slide.addShape(pres.shapes.OVAL, {
    x: 0.55, y: 0.63, w: 0.1, h: 0.1,
    fill: { color: dotColor }, line: { type: "none" },
  });
  slide.addText(section, {
    x: 0.72, y: 0.52, w: 3.5, h: 0.32,
    fontFace: HF, fontSize: 11, bold: true, color: txtColor,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  slide.addText(index, {
    x: 4.3, y: 0.52, w: 1.5, h: 0.32,
    fontFace: HF, fontSize: 11, color: idxColor,
    charSpacing: 4, margin: 0, valign: "middle",
  });
}

// Bottom footer row
function addFooter(slide, rightText, dark = false) {
  const color = dark ? DARK_MUTED : MUTED;
  slide.addText(
    [{ text: "VENTURE CAPITAL — A PRIMER", options: { italic: true } }],
    {
      x: 0.55, y: 7.05, w: 5, h: 0.3,
      fontFace: HF, fontSize: 10, color, charSpacing: 2, margin: 0,
    }
  );
  slide.addText(rightText, {
    x: 8.3, y: 7.05, w: 4.5, h: 0.3,
    fontFace: HF, fontSize: 10, color, charSpacing: 4,
    align: "right", margin: 0,
  });
}

// ============================================================================
// SLIDE 1 — Cover
// ============================================================================
{
  const s = pres.addSlide();
  s.background = { color: CREAM };

  addEyebrow(s, "A PRIMER", "01 / 09");

  // Title: "Venture" (ink) / "Capital" (orange italic) stacked
  s.addText("Venture", {
    x: 0.55, y: 1.45, w: 7.5, h: 1.5,
    fontFace: HF, fontSize: 110, bold: true, color: INK,
    margin: 0, valign: "middle",
  });
  s.addText("Capital", {
    x: 0.55, y: 2.85, w: 7.5, h: 1.5,
    fontFace: HF, fontSize: 110, bold: true, italic: true, color: ORANGE,
    margin: 0, valign: "middle",
  });

  // Tagline
  s.addText(
    "How a small corner of finance quietly funds the future — and how to participate in it.",
    {
      x: 0.55, y: 4.6, w: 6.3, h: 1.2,
      fontFace: HF, fontSize: 20, italic: true, color: INK,
      margin: 0, valign: "top",
    }
  );

  // Hairline divider above meta row
  s.addShape(pres.shapes.LINE, {
    x: 0.55, y: 6.45, w: 6.5, h: 0,
    line: { color: HAIRLINE, width: 0.75 },
  });

  // Meta row
  s.addText("2026 EDITION", {
    x: 0.55, y: 6.65, w: 2.2, h: 0.35,
    fontFace: HF, fontSize: 10, bold: true, color: MUTED,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  s.addText("GLOBAL · RETAIL PRIMER", {
    x: 2.85, y: 6.65, w: 3.8, h: 0.35,
    fontFace: HF, fontSize: 10, bold: true, color: MUTED,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  s.addText("09 SLIDES", {
    x: 6.75, y: 6.65, w: 2.0, h: 0.35,
    fontFace: HF, fontSize: 10, bold: true, color: MUTED,
    charSpacing: 4, margin: 0, valign: "middle",
  });

  // --- Right-side radial "VC" diagram -------------------------------------
  // Slide is 13.333" wide. Keep the entire diagram within bounds with ~0.3"
  // margin on the right, or it gets clipped in presentation mode.
  const cx = 10.3, cy = 3.9;
  const radii = [2.7, 1.98, 1.26, 0.63]; // outer → inner rings (diameter)
  radii.forEach((d) => {
    s.addShape(pres.shapes.OVAL, {
      x: cx - d, y: cy - d, w: d * 2, h: d * 2,
      fill: { type: "none" }, line: { color: INK, width: 0.5 },
    });
  });

  // Cross + diagonals
  // PowerPoint rejects shapes with negative cy, so we flip the upward diagonal
  // with flipV instead of using a negative height.
  const R = 2.7;
  s.addShape(pres.shapes.LINE, {
    x: cx - R, y: cy, w: R * 2, h: 0,
    line: { color: INK, width: 0.5 },
  });
  s.addShape(pres.shapes.LINE, {
    x: cx, y: cy - R, w: 0, h: R * 2,
    line: { color: INK, width: 0.5 },
  });
  // \ diagonal (top-left to bottom-right)
  s.addShape(pres.shapes.LINE, {
    x: cx - R * 0.707, y: cy - R * 0.707, w: R * 1.414, h: R * 1.414,
    line: { color: INK, width: 0.5 },
  });
  // / diagonal (bo
```