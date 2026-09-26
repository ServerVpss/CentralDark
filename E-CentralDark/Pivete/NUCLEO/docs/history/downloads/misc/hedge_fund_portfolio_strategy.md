# OUTRO - hedge_fund_portfolio_strategy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\hedge_fund_portfolio_strategy.js
**SHA:** 7c6969d744f29436
**Timestamp:** 2026-08-28T02:52:35.280416
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.25;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

async function main() {
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Dragon Portfolio Fund";
  pres.title = "The Dragon Portfolio Strategy";

  const C = {
    bg: "061317", bgAlt: "0D2324", card: "163833",
    mint: "47F19C", green: "40BB84", teal: "1C6B53",
    red: "F0564A", redSoft: "D94E44",
    white: "F0F6F0", gray: "8DA8A0", grayLight: "B8CFC8", grayDark: "5A7A72",
    gold: "F5B731", cyan: "3DD8D8", amber: "F0A830",
    fixedInc: "6BAACC",
  };
  const mkS = () => ({ type: "outer", blur: 10, offset: 3, angle: 135, color: "000000", opacity: 0.35 });
  const TOTAL = 12;

  function addFooter(slide, num) {
    slide.addText(`${num} / ${TOTAL}`, { x: 8.8, y: 5.25, w: 1.0, h: 0.25, fontSize: 8, fontFace: "Calibri", color: C.grayDark, align: "right", margin: 0 });
    slide.addText("CONFIDENTIAL", { x: 0.8, y: 5.25, w: 2, h: 0.25, fontSize: 8, fontFace: "Calibri", color: C.grayDark, charSpacing: 1.5, margin: 0 });
  }

  function addHeader(slide, section, title) {
    slide.addText(section, { x: 0.8, y: 0.2, w: 5, h: 0.3, fontSize: 11, fontFace: "Calibri", bold: true, color: C.green, charSpacing: 3.5, margin: 0 });
    slide.addText(title, { x: 0.8, y: 0.48, w: 8.5, h: 1.0, fontSize: 22, fontFace: "Trebuchet MS", bold: true, color: C.white, margin: 0 });
  }

  // ============================================================
  // SLIDE 1: TITLE
  // ============================================================
  let s1 = pres.addSlide();
  s1.background = { color: C.bg };
  s1.addText("THE DRAGON", { x: 0.8, y: 1.3, w: 8, h: 1.0, fontSize: 54, fontFace: "Trebuchet MS", bold: true, color: C.white, margin: 0 });
  s1.addText("PORTFOLIO", { x: 0.8, y: 2.25, w: 8, h: 0.9, fontSize: 54, fontFace: "Trebuchet MS", bold: true, color: C.mint, margin: 0 });
  s1.addText("An All-Weather Strategy for Growing and Protecting\nWealth Across Every Market Regime", {
    x: 0.8, y: 3.35, w: 7, h: 0.8, fontSize: 16, fontFace: "Calibri", color: C.gray, lineSpacingMultiple: 1.4, margin: 0
  });
  s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.35, w: 1.2, h: 0.035, fill: { color: C.green } });
  s1.addText("HEDGE FUND STRATEGY OVERVIEW  |  2026", { x: 0.8, y: 4.55, w: 5, h: 0.4, fontSize: 10, fontFace: "Calibri", color: C.grayDark, charSpacing: 3, margin: 0 });

  // ============================================================
  // SLIDE 2: EXECUTIVE SUMMARY
  // ============================================================
  let s2 = pres.addSlide();
  s2.background = { color: C.bg };
  addHeader(s2, "EXECUTIVE SUMMARY", "14.4% CAGR over 100 years by diversifying across regimes, not just asset classes");
  addFooter(s2, 2);

  const summaryItems = [
    { head: "THE PROBLEM", body: "Traditional 60/40 portfolios only perform in growth and disinflation, which represent just 53% of the last century. During the other 47%, investors suffered catastrophic losses.", color: C.red },
    { head: "THE SOLUTION", body: "Five uncorrelated asset classes ensure at least two components produce gains in any environment: equities (24%), long vol (21%), gold (19%), commodity trend (18%), fixed income (18%).", color: C.mint },
    { head: "THE RESULT", body: "14.4% CAGR over 100 years vs. ~9% for 60/40. In 2020, the Dragon returned 52% with an 11% max drawdown vs. 16% return and 33% drawdown for 60/40.", color: C.gold },
  ];
  summaryItems.forEach((item, i) => {
    const x = 0.8 + i * 2.9249;
    s2.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.55, h: 2.6, fill: { color: C.card }, shadow: mkS() });
    s2.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.55, h: 0.05, fill: { color: item.color } });
    s2.addText(item.head, { x: x + 0.11, y: 2.2, w: 2.3, h: 0.3, fontSize: 15, fontFace: "Trebuchet MS", bold: true, color: item.color, charSpacing: 2, margin: 0 });
    s2.addText(item.body, { x: x + 0.11, y: 2.55, w: 2.37, h: 1.8, fontSize: 11, fontFace: "Calibri", color: C.gray, lineSpacingMultiple: 1.4, margin: 0 });
  });

  // ============================================================
  // SLIDE 3: THE PROBLEM
  // ============================================================
  let s3 = pres.addSlide();
  s3.background = { color: C.bg };
  addHeader(s3, "THE PROBLEM", "60/40 portfolios have failed in 47% of the last century's market regimes");
  addFooter(s3, 3);

  const probStats = [
    { val: "47%", label: "OF LAST 100 YEARS", sub: "spent in Hawk \n(crisis) regimes", color: C.red },
    { val: "96%", label: "LOSS IN REAL TERMS", sub: "\"Buy the dip\" strategy\n1918 to 2018", color: C.red },
    { val: "~0%", label: "REAL BOND YIELD", sub: "Bonds fail as \nPortfolio defense", color: C.amber },
    { val: "0.85", label: "CORRELATION", sub: "Stocks and bonds \nCorrelate in crises", color: C.red },
  ];
  probStats.forEach((s, i) => {
    const x = 0.8 + i * 2.25;
    s3.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.0, h: 2.1, fill: { color: C.card }, shadow: mkS(
```