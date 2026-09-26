# OUTRO - gaming_product_portfolio_review.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\gaming_product_portfolio_review.js
**SHA:** af57af1a9c36804b
**Timestamp:** 2026-08-28T02:52:34.857817
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.15;
- const betGap = 1.75;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * build_pptx.js
 *
 * Recreates "Deliverable_1.pptx" — EA PC Titles Portfolio Review (9 slides)
 * using pptxgenjs.
 *
 * Layout: 13.333" x 7.5" (LAYOUT_WIDE, 16:9)
 * Typography:
 *   - Headline: Helvetica Neue / Arial (regular + italic mix)
 *   - Body:     Helvetica Neue / Arial
 *   - Micro/labels: uppercase, letter-spaced
 * Palette (monochrome editorial):
 *   ink       = "111111"
 *   muted     = "6B6B6B"
 *   faint     = "9A9A9A"
 *   paper     = "FFFFFF"
 *   soft      = "ECECEC"
 */

const pptxgen = require("pptxgenjs");

// ---------- constants ----------
const INK = "111111";
const MUTED = "6B6B6B";
const FAINT = "9A9A9A";
const SOFT = "ECECEC";
const FONT = "Helvetica Neue";
const FONT_FALLBACK = "Arial";

// slide dimensions (inches) for LAYOUT_WIDE
const SW = 13.333;
const SH = 7.5;
const MARGIN = 0.5;

// ---------- helpers ----------
function micro(slide, text, x, y, w, opts = {}) {
  // Small uppercase label text, letter-spaced
  slide.addText(text, {
    x, y, w, h: 0.25,
    fontFace: FONT,
    fontSize: opts.fontSize || 8,
    color: opts.color || INK,
    bold: false,
    charSpacing: opts.charSpacing != null ? opts.charSpacing : 2,
    align: opts.align || "left",
    valign: "top",
    margin: 0,
  });
}

function body(slide, text, x, y, w, h, opts = {}) {
  slide.addText(text, {
    x, y, w, h,
    fontFace: FONT,
    fontSize: opts.fontSize || 11,
    color: opts.color || INK,
    align: opts.align || "left",
    valign: opts.valign || "top",
    paraSpaceAfter: opts.paraSpaceAfter || 0,
    margin: 0,
  });
}

function statBig(slide, value, label, x, y, w, opts = {}) {
  slide.addText(value, {
    x, y, w, h: 0.55,
    fontFace: FONT,
    fontSize: opts.valueSize || 32,
    color: INK,
    bold: false,
    align: opts.align || "left",
    valign: "top",
    margin: 0,
  });
  slide.addText(label, {
    x, y: y + 0.55, w, h: 0.25,
    fontFace: FONT,
    fontSize: 8,
    color: INK,
    charSpacing: 2,
    align: opts.align || "left",
    valign: "top",
    margin: 0,
  });
}

function fieldRow(slide, label, value, x, y, w) {
  // Fixed label column; value right-aligned in remaining width.
  // Values get no charSpacing so they render narrower and don't collide with labels.
  const labelW = 1.3;
  const gap = 0.15;
  slide.addText(label, {
    x, y, w: labelW, h: 0.22,
    fontFace: FONT, fontSize: 8, color: INK, charSpacing: 2,
    align: "left", valign: "top", margin: 0, wrap: false,
  });
  slide.addText(value, {
    x: x + labelW + gap, y, w: w - labelW - gap, h: 0.22,
    fontFace: FONT, fontSize: 8, color: INK, charSpacing: 1,
    align: "right", valign: "top", margin: 0, wrap: false,
  });
}

function headerBar(slide, left, right) {
  // Top thin header with left tag and right slide counter
  if (left) micro(slide, left, MARGIN, 0.35, 6, { fontSize: 8 });
  if (right) micro(slide, right, SW - MARGIN - 1.5, 0.35, 1.5, { fontSize: 8, align: "right" });
}

function footerBar(slide, left, center, right) {
  const y = SH - 0.45;
  if (left) micro(slide, left, MARGIN, y, 4, { fontSize: 8 });
  if (center) micro(slide, center, SW / 2 - 3, y, 6, { fontSize: 8, align: "center" });
  if (right) micro(slide, right, SW - MARGIN - 4, y, 4, { fontSize: 8, align: "right" });
}

// ---------- illustrations ----------
// Slide 2 "Life & Home Sim" — isometric home on triangle-grid
function drawGridTile(slide, gx, gy, gw, gh, cols, rows) {
  // Dense triangle-grid pattern (alternating filled/white triangles approximated with black rectangles + white diagonals).
  // We simulate a woven look using many small black rectangles with thin white lines through.
  slide.addShape("rect", {
    x: gx, y: gy, w: gw, h: gh,
    fill: { color: INK }, line: { color: INK, width: 0 },
  });
  const cellW = gw / cols;
  const cellH = gh / rows;
  // Draw white diagonals in each cell to create triangle pattern
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = gx + c * cellW;
      const y0 = gy + r * cellH;
      // diagonal from top-left to bottom-right (white line)
      slide.addShape("line", {
        x: x0, y: y0, w: cellW, h: cellH,
        line: { color: "FFFFFF", width: 0.75 },
      });
    }
  }
  // Outer white hairlines (horizontal grid) for lattice
  for (let r = 0; r <= rows; r++) {
    slide.addShape("line", {
      x: gx, y: gy + r * cellH, w: gw, h: 0,
      line: { color: "FFFFFF", width: 0.5 },
    });
  }
  for (let c = 0; c <= cols; c++) {
    slide.addShape("line", {
      x: gx + c * cellW, y: gy, w: 0, h: gh,
      line: { color: "FFFFFF", width: 0.5 },
    });
  }
}

function drawIsoHouse(slide, cx, cy, size) {
  // Simple black isometric house silhouette built from shapes
  // "Home" rendered as a stacked pair of rounded blocks
  slide.addShape("rect", {
    x: cx - size * 0.5, y: cy - size * 0.25, w: size, h: size * 0.55,
    fill: { color: INK }, line: { color: INK, width: 0 },
  });
  slide.addShape("rect", {
    x: cx - size * 0.35, y: cy
```