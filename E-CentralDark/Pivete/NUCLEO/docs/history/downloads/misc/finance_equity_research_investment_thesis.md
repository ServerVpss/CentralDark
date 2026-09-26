# OUTRO - finance_equity_research_investment_thesis.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_equity_research_investment_thesis.js
**SHA:** ae005578a7ca9808
**Timestamp:** 2026-08-28T02:52:34.079199
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const colGap = 0.25;
- const sx0 = 0.7, sw = 3.85, sgap = 0.25, sy0 = 3.5;
- const cx0 = 0.7, cw = 3.95, cgap = 0.2, cy = 2.0, ch = 4.85;
- const px0 = 0.7, pw = 3.95, pgap = 0.2, py = 2.0, ph = 4.85;
- const ssX0 = 7.6, ssW = 1.7, ssGap = 0.2, ssY = 3.7;
- const tx0 = 0.7, tw = 3.85, tgap = 0.25, ty = 4.0;

### Ouro Bruto (primeiros 5000 chars)
```
// Russell 2000 — Halo Companies Investment Thesis
// Recreated with pptxgenjs

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5"
pres.title = "Halo Companies of the Russell 2000";
pres.author = "Equity Research";

// Palette
const NAVY = "0E1726";
const NAVY_DEEP = "0A1220";
const CREAM = "F4F0E6";
const CREAM_LIGHT = "F7F3EA";
const CREAM_HIGHLIGHT = "EFE6CF";
const GOLD = "B8923A";
const GOLD_DARK = "8C6F2C";
const GOLD_LIGHT = "E8D9A8";
const RED = "7A1F1F";
const TEXT_DARK = "0E1726";
const TEXT_MUTED = "6B6F76";
const TEXT_MUTED_DARK = "9CA0A8";
const RULE_LIGHT = "D8D3C4";
const WHITE = "FFFFFF";

const FONT_HEAD = "Calibri";
const FONT_BODY = "Calibri";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ======================================================================
// SLIDE 1 — TITLE / COVER
// ======================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // Big gold circle, top-right (partially off-canvas)
  s.addShape(pres.shapes.OVAL, {
    x: 9.4, y: -2.2, w: 6.6, h: 6.6,
    fill: { color: GOLD_DARK },
    line: { type: "none" },
  });

  // Outlined circle, bottom-right
  s.addShape(pres.shapes.OVAL, {
    x: 10.9, y: 4.4, w: 1.9, h: 1.9,
    fill: { type: "none" },
    line: { color: TEXT_MUTED_DARK, width: 1 },
  });

  // Eyebrow: small ring + label
  s.addShape(pres.shapes.OVAL, {
    x: 0.7, y: 0.66, w: 0.18, h: 0.18,
    fill: { type: "none" },
    line: { color: GOLD, width: 1.25 },
  });
  s.addText("2026 INVESTMENT THESIS", {
    x: 1.0, y: 0.55, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 13, bold: true,
    color: GOLD, charSpacing: 6, valign: "middle", margin: 0,
  });

  // Title
  s.addText("Halo Companies of the Russell 2000", {
    x: 0.7, y: 2.7, w: 11.5, h: 1.9,
    fontFace: FONT_HEAD, fontSize: 60, bold: true,
    color: CREAM, valign: "top", margin: 0,
  });

  // Subhead
  s.addText("Where high-asset, low-obsolescence small caps meet a small-cap index repricing.", {
    x: 0.7, y: 4.7, w: 7.6, h: 0.9,
    fontFace: FONT_BODY, fontSize: 16,
    color: TEXT_MUTED_DARK, valign: "top", margin: 0,
  });

  // Bottom-left credit
  s.addText("EQUITY RESEARCH · APRIL 2026", {
    x: 0.7, y: 6.85, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 11, bold: false,
    color: TEXT_MUTED_DARK, charSpacing: 6, valign: "middle", margin: 0,
  });
}

// ======================================================================
// SLIDE 2 — THE HALO DEFINITION (table-ish + quadrant chart)
// ======================================================================
{
  const s = pres.addSlide();
  s.background = { color: CREAM };

  s.addText("THE HALO DEFINITION", {
    x: 0.7, y: 0.55, w: 8, h: 0.35,
    fontFace: FONT_HEAD, fontSize: 12, bold: false,
    color: TEXT_MUTED, charSpacing: 6, valign: "middle", margin: 0,
  });

  s.addText("A Halo company carries a heavy asset base and a durable business model.", {
    x: 0.7, y: 1.0, w: 12, h: 1.6,
    fontFace: FONT_HEAD, fontSize: 36, bold: true,
    color: TEXT_DARK, valign: "top", margin: 0,
  });

  // Top divider line above the rows
  s.addShape(pres.shapes.LINE, {
    x: 0.7, y: 2.55, w: 6.4, h: 0,
    line: { color: RULE_LIGHT, width: 1 },
  });

  // Four definition rows on the left
  const rows = [
    { label: "HIGH ASSETS", body: "Tangible balance sheet — real estate, infrastructure, lending books, plant & equipment, deposits." },
    { label: "LOW OBSOLESCENCE", body: "Demand profile that resists technology disruption, secular substitution, or platform shifts." },
    { label: "CASH-GENERATIVE", body: "Profitable today, not promising profitability later. Net income is the entry ticket." },
    { label: "DOMESTICALLY ANCHORED", body: "Revenues tied to U.S. economic activity, insulated from global multinational drag." },
  ];
  const rowY0 = 2.75;
  const rowH = 0.95;
  rows.forEach((r, i) => {
    const ry = rowY0 + i * rowH;
    s.addText(r.label, {
      x: 0.7, y: ry, w: 1.9, h: rowH - 0.2,
      fontFace: FONT_HEAD, fontSize: 11, bold: true,
      color: TEXT_DARK, charSpacing: 3, valign: "top", margin: 0,
    });
    s.addText(r.body, {
      x: 2.75, y: ry, w: 4.3, h: rowH - 0.1,
      fontFace: FONT_BODY, fontSize: 12,
      color: TEXT_DARK, valign: "top", margin: 0,
    });
    // divider under each row
    s.addShape(pres.shapes.LINE, {
      x: 0.7, y: ry + rowH - 0.1, w: 6.4, h: 0,
      line: { color: RULE_LIGHT, width: 0.75 },
    });
  });

  // ---- Quadrant chart on the right ----
  const qx = 7.7, qy = 2.55, qw = 4.95, qh = 4.0;
  // outer frame
  s.addShape(pres.shapes.RECTANGLE, {
    x: qx, y: qy, w: qw, h: qh,
    fill: { color: CREAM_LIGHT },
    line: { color: TEXT_MUTED, width: 0.5 },
  });
  // shaded upper-right "halo" quadrant
  s.addShape(pres.shapes.RECTANGLE, {
    x: qx + qw / 2, y: qy, w: qw / 2, h: qh / 2,
    fill: { color: CREAM_HIGHLIGHT },
    line
```