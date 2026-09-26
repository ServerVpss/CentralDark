# COMANDO - labor_economics_research_presentation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\labor_economics_research_presentation.js
**SHA:** 707ae16da37a2949
**Timestamp:** 2026-08-28T02:52:35.404839
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "Demos (2016). The Racial Wealth Gap: Why Policy Matters.",

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

async function main() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.title = "The Racial Unemployment Gap in the United States";

  const C = {
    navy: "1B2A4A", dk: "0F1B33", slate: "2D3E50", teal: "0E7C86",
    gold: "D4A843", off: "FAFAF7", wg: "E8E4DD", tx: "2C2C2C",
    mu: "6B7280", wh: "FFFFFF", lt: "E6F4F5", red: "B03A2E",
    grn: "1D7A4E", dkgold: "A07D2E"
  };
  const H = "Century Gothic";
  const B = "Calibri";
  const TS = 20;
  const LSP = 1.5;

  // ── S1: TITLE ──
  let s = pres.addSlide(); s.background = { color: C.dk };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.6, w: 10, h: 1.025, fill: { color: C.navy } });
  s.addText("THE RACIAL\nUNEMPLOYMENT GAP", {
    x: 0.8, y: 1.0, w: 8.4, h: 2.2, fontFace: H, fontSize: 40,
    color: C.wh, bold: true, lineSpacingMultiple: 1.1
  });
  s.addText("What We Know, What We Don't, and Why It Matters", {
    x: 0.8, y: 3.2, w: 8, h: 0.5, fontFace: B, fontSize: 18,
    color: C.gold, italic: true
  });
  s.addText("Author | Institution | April, 2026", {
    x: 0.8, y: 4.85, w: 8, h: 0.4, fontFace: B, fontSize: 12, color: C.wg
  });

  // ── S2: WHAT IS THE GAP ──
  s = pres.addSlide(); s.background = { color: C.navy };
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.gold } });
  s.addText("A PERSISTENT 2:1 RATIO WITH MURKY HISTORICAL MEASUREMENT FOR NEARLY 100 YEARS", {
    x: 0.5, y: 0.18, w: 9.2, h: 0.65, fontFace: H, fontSize: TS,
    color: C.gold, bold: true, margin: 0
  });

  s.addText("2:1", {
    x: 0.3, y: 0.95, w: 3.2, h: 1.5, fontFace: H, fontSize: 68,
    color: C.wh, bold: true, align: "center", valign: "middle"
  });

  s.addText([
    { text: "The ratio of Black to white unemployment in the U.S.", options: { bold: true, fontSize: 16, color: C.wh } },
    { text: "\nIt has never again fallen below 1.5:1.", options: { fontSize: 13, color: C.wg } },
  ], {
    x: 3.7, y: 0.95, w: 5.8, h: 1.3, fontFace: B,
    valign: "middle", lineSpacingMultiple: LSP
  });

  s.addText("1940", {
    x: 4.1, y: 3.5, w: 1.8, h: 0.7, fontFace: H, fontSize: 34,
    color: C.gold, bold: true, align: "center", valign: "middle"
  });
  s.addText("PRE-1940", {
    x: 0.5, y: 2.9, w: 3.5, h: 0.35, fontFace: H, fontSize: 14,
    color: C.gold, bold: true, align: "right", margin: 0, valign: "middle"
  });
  s.addText("POST-1940", {
    x: 6.0, y: 2.9, w: 3.5, h: 0.35, fontFace: H, fontSize: 14,
    color: C.gold, bold: true, align: "left", margin: 0, valign: "middle"
  });

  s.addShape(pres.shapes.LINE, { x: 0.5, y: 3.35, w: 3.5, h: 0, line: { color: C.gold, width: 1.5 } });
  s.addShape(pres.shapes.LINE, { x: 6.0, y: 3.35, w: 3.5, h: 0, line: { color: C.gold, width: 1.5 } });

  s.addText([
    { text: "\"Gainful worker\" concept — anyone with an occupation counted as workforce", options: { bullet: true, breakLine: true, fontSize: 11, color: C.wg } },
    { text: "Only decennial snapshots; no monthly survey", options: { bullet: true, breakLine: true, fontSize: 11, color: C.wg } },
    { text: "Enumeration methods varied across decades", options: { bullet: true, fontSize: 11, color: C.wg } },
  ], { x: 0.5, y: 3.45, w: 3.5, h: 1.3, fontFace: B, valign: "top", paraSpaceAfter: 3 });

  s.addText([
    { text: "Modern \"labor force\" framework (employed / unemployed / not in labor force)", options: { bullet: true, breakLine: true, fontSize: 11, color: C.wg } },
    { text: "Monthly Current Population Survey begins", options: { bullet: true, breakLine: true, fontSize: 11, color: C.wg } },
    { text: "Consistent methodology across years", options: { bullet: true, fontSize: 11, color: C.wg } },
  ], { x: 6.0, y: 3.45, w: 3.5, h: 1.3, fontFace: B, valign: "top", paraSpaceAfter: 3 });

  s.addShape(pres.shapes.LINE, { x: 0.5, y: 4.85, w: 9.0, h: 0, line: { color: C.gold, width: 0.75, dashType: "dash" } });
  s.addText([
    { text: "These issues matter most because ", options: { fontSize: 11, color: C.wg } },
    { text: "the definitional shift itself makes pre/post-1940 comparisons significantly harder", options: { fontSize: 11, color: C.gold, bold: true } },
    { text: " — precisely when the gap appears to have emerged.", options: { fontSize: 11, color: C.wg } },
  ], { x: 0.5, y: 4.95, w: 9.0, h: 0.35, fontFace: B, valign: "middle", align: "center", margin: 0 });

  s.addText("Sources: BLS Handbook of Methods; Fairlie & Sundstrom (1999); U.S. Census Bureau", {
    x: 0.5, y: 5.35, w: 9, h: 0.2, fontFace: B, fontSize: 8, color: C.mu
  });

  // ── S3: TIMELINE ──
  s = pres.addSlide(); s.background = { color: C.off };
  s.addText("ACADEMIC CONSENSUS: THE GAP EMERGED BETWEEN THE 1930s AND EARLY 1940s", {
    x: 0.5, y: 0.2, w: 9.2, h: 0.55, fontFace: H, fontSize: TS,
    color: C.navy, bold: true, margin: 0
  });

  const tlX0 = 0.8, tlW = 8.4, tlY = 3.05;
  const yr = (y) => tl
```