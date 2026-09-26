# COMANDO - finance_investment_portfolio_brief.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_investment_portfolio_brief.js
**SHA:** 9abfab187b878244
**Timestamp:** 2026-08-28T02:52:34.282815
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:   node ai_bucket.js
- const rowStart = headerY + 0.48;
- const rowStart = headerY + 0.45;

### Gaps
- const cardGap = 0.15;
- const colGap = 0.5;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * AI-Bucket.pptx replica — built with pptxgenjs
 *
 * Run:   node ai_bucket.js
 * Out:   AI-Bucket.pptx
 */

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();

// ---------- Layout: 13.333" x 7.5" (16:9 widescreen) ----------
pres.defineLayout({ name: "CUSTOM_WIDE", width: 13.333, height: 7.5 });
pres.layout = "CUSTOM_WIDE";
pres.title = "AI Bucket — Portfolio Brief";
pres.author = "Research Desk";

// ---------- Palette ----------
const BG       = "0B0B0B";   // deep near-black
const FG       = "FFFFFF";   // white
const MUTED    = "8A8A8A";   // gray muted text
const DIM      = "555555";   // dim lines
const GREEN    = "7FE27E";   // primary green accent (bright)
const GREEN_D  = "5BB85A";   // darker green for donut sleeves
const GREEN_DD = "3F7F3E";   // darkest green for donut sleeves
const GREEN_L  = "A8EEA7";   // lightest green for donut sleeves
const TRACK    = "2A2A2A";   // bar-track / divider
const RED      = "F26C5F";   // negative/red for -22.4% etc.

// ---------- Layout constants ----------
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const MARGIN_X = 0.7;

// ---------- Header (top breadcrumb: left • center • right) ----------
function addHeader(slide, leftText, rightText) {
  const headerY = 0.35;

  slide.addText(leftText, {
    x: MARGIN_X, y: headerY, w: 4.5, h: 0.28,
    fontFace: "Consolas", fontSize: 9, color: MUTED,
    charSpacing: 4, align: "left", valign: "middle", margin: 0,
  });

  // center: green diamond + "AI BUCKET"
  slide.addText(
    [
      { text: "◆ ", options: { color: GREEN } },
      { text: "AI BUCKET", options: { color: GREEN } },
    ],
    {
      x: (SLIDE_W - 3) / 2, y: headerY, w: 3, h: 0.28,
      fontFace: "Consolas", fontSize: 9, bold: true,
      charSpacing: 4, align: "center", valign: "middle", margin: 0,
    }
  );

  slide.addText(rightText, {
    x: SLIDE_W - MARGIN_X - 4.5, y: headerY, w: 4.5, h: 0.28,
    fontFace: "Consolas", fontSize: 9, color: MUTED,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });

  // thin divider under header
  slide.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 0.68, w: SLIDE_W - 2 * MARGIN_X, h: 0,
    line: { color: DIM, width: 0.5 },
  });
}

// Helper to set dark bg
function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

// =========================================================================
// SLIDE 1 — Cover
// =========================================================================
{
  const s = darkSlide();
  addHeader(s, "PORTFOLIO BRIEF · INTERNAL", "Q2 · 2026");

  // Eyebrow
  s.addText("THEMATIC ALLOCATION · EQUITY", {
    x: MARGIN_X, y: 1.75, w: 7, h: 0.3,
    fontFace: "Consolas", fontSize: 10, color: MUTED,
    charSpacing: 4, margin: 0,
  });

  // "AI" (white)
  s.addText("AI", {
    x: MARGIN_X, y: 2.05, w: 6, h: 1.35,
    fontFace: "Arial", fontSize: 96, bold: true, color: FG,
    align: "left", valign: "top", margin: 0,
  });

  // "Bucket." (green)
  s.addText("Bucket.", {
    x: MARGIN_X, y: 3.25, w: 10, h: 1.5,
    fontFace: "Arial", fontSize: 110, bold: true, color: GREEN,
    align: "left", valign: "top", margin: 0,
  });

  // Subtitle
  s.addText(
    "A ten-name, conviction-weighted sleeve capturing the compute, models, and\napplication layer of the artificial intelligence build-out.",
    {
      x: MARGIN_X, y: 5.4, w: 10, h: 0.9,
      fontFace: "Calibri", fontSize: 15, color: "BFBFBF",
      align: "left", valign: "top", margin: 0,
    }
  );

  // Divider above stats
  s.addShape(pres.shapes.LINE, {
    x: MARGIN_X, y: 6.35, w: SLIDE_W - 2 * MARGIN_X, h: 0,
    line: { color: DIM, width: 0.5 },
  });

  // Four stat columns
  const statY = 6.5;
  const labelOpts = {
    fontFace: "Consolas", fontSize: 9, color: MUTED,
    charSpacing: 4, margin: 0, valign: "top",
  };
  const valueOpts = {
    fontFace: "Calibri", fontSize: 16, bold: true, color: FG,
    margin: 0, valign: "top",
  };

  s.addText("INCEPTION",  { x: MARGIN_X,          y: statY,        w: 2.5, h: 0.25, ...labelOpts });
  s.addText("Jan 2024",   { x: MARGIN_X,          y: statY + 0.3,  w: 2.5, h: 0.35, ...valueOpts });

  s.addText("HOLDINGS",   { x: MARGIN_X + 3,      y: statY,        w: 2.5, h: 0.25, ...labelOpts });
  s.addText("10",         { x: MARGIN_X + 3,      y: statY + 0.3,  w: 2.5, h: 0.35, ...valueOpts });

  s.addText("NAV",        { x: MARGIN_X + 6,      y: statY,        w: 2.5, h: 0.25, ...labelOpts });
  s.addText("$248.4M",    { x: MARGIN_X + 6,      y: statY + 0.3,  w: 2.5, h: 0.35, ...valueOpts });

  s.addText("PREPARED BY",{ x: SLIDE_W - MARGIN_X - 3, y: statY,        w: 3, h: 0.25, ...labelOpts, align: "left" });
  s.addText("Research Desk",{ x: SLIDE_W - MARGIN_X - 3, y: statY + 0.3,  w: 3, h: 0.35, ...valueOpts, align: "left" });
}

// =========================================================================
// SLIDE 2 — Thesis
// =========================================================================
{
```