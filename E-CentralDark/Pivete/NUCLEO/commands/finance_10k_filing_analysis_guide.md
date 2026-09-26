# COMANDO - finance_10k_filing_analysis_guide.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_10k_filing_analysis_guide.js
**SHA:** 1df9dfdabdedc05d
**Timestamp:** 2026-08-28T02:52:33.542646
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const cardY = 2.35, cardH = 4.5, gap = 0.2, cardW = (CW - gap * 3) / 4;
- const rTop = 1.85, rH2 = 0.87, rGap = 0.08;
- const sTop = 2.3, sBtm = H - FH - 0.3, sH = sBtm - sTop, sGap = 0.2, cols = 3, rows = 2;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

// Bryant University brand palette
const BLACK = "000000", CHARCOAL = "1A1A1A", DARK = "2B2B2B";
const GOLD = "B4975B", LIGHT_GOLD = "C9BB8C", GOLD_PALE = "F3EDDD";
const GRAY = "818286", LIGHT_GRAY = "E5E5E6";
const OFF_WHITE = "FAFAF8", WHITE = "FFFFFF";

const HEADER = "Arial Black", BODY = "Calibri";
const W = 13.3, H = 7.5, M = 0.6, CW = W - 2 * M, FH = 0.4;

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Bryant University";
  pres.title = "How to Read a 10-K";

  // ── Helpers ──────────────────────────────────────────────
  function footer(s, n) {
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - FH, w: W, h: 0.05, fill: { color: GOLD }, line: { color: GOLD } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: H - FH + 0.05, w: W, h: FH - 0.05, fill: { color: BLACK }, line: { color: BLACK } });
    s.addText([
      { text: "BRYANT", options: { bold: true, color: GOLD, fontFace: HEADER, charSpacing: 2 } },
      { text: "  UNIVERSITY", options: { color: WHITE, fontFace: BODY, charSpacing: 1 } }
    ], { x: M, y: H - FH + 0.05, w: 5, h: FH - 0.05, fontSize: 10, valign: "middle", margin: 0 });
    s.addText("How to Read a 10-K  |  Graduate Finance Seminar", {
      x: W / 2 - 3, y: H - FH + 0.05, w: 6, h: FH - 0.05,
      fontSize: 10, fontFace: BODY, color: LIGHT_GOLD, align: "center", valign: "middle", margin: 0
    });
    s.addText(`${String(n).padStart(2, "0")}  /  10`, {
      x: W - M - 2, y: H - FH + 0.05, w: 2, h: FH - 0.05,
      fontSize: 10, fontFace: BODY, color: GOLD, bold: true, align: "right", valign: "middle", margin: 0
    });
  }

  function title(s, eye, txt) {
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: 0.55, w: 0.1, h: 0.95, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText(eye, { x: M + 0.22, y: 0.55, w: CW, h: 0.3, fontSize: 11, fontFace: BODY, color: GOLD, bold: true, charSpacing: 3, margin: 0 });
    s.addText(txt, { x: M + 0.22, y: 0.82, w: CW, h: 0.7, fontSize: 30, fontFace: HEADER, color: BLACK, bold: true, margin: 0, valign: "top" });
    s.addShape(pres.shapes.LINE, { x: M, y: 1.65, w: CW, h: 0, line: { color: LIGHT_GRAY, width: 1 } });
  }

  // ── SLIDE 1: TITLE ──────────────────────────────────────
  {
    const s = pres.addSlide(); s.background = { color: CHARCOAL };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.6, h: H, fill: { color: GOLD }, line: { color: GOLD } });
    s.addShape(pres.shapes.RECTANGLE, { x: W - 3.5, y: 0, w: 3.5, h: 0.15, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText([
      { text: "BRYANT", options: { bold: true, color: GOLD, fontFace: HEADER, charSpacing: 3 } },
      { text: "  UNIVERSITY", options: { color: GOLD, fontFace: BODY, charSpacing: 2 } }
    ], { x: 1.0, y: 0.7, w: 4, h: 0.35, fontSize: 14, margin: 0 });
    s.addText("GRADUATE FINANCE SEMINAR  |  SEC DISCLOSURE", { x: 1.0, y: 2.3, w: 11.5, h: 0.35, fontSize: 13, fontFace: BODY, color: GOLD, bold: true, charSpacing: 4, margin: 0 });
    s.addText("HOW TO READ", { x: 1.0, y: 2.75, w: 11.5, h: 1.0, fontSize: 58, fontFace: HEADER, color: WHITE, bold: true, margin: 0, charSpacing: 1 });
    s.addText("A 10-K FILING", { x: 1.0, y: 3.7, w: 11.5, h: 1.0, fontSize: 58, fontFace: HEADER, color: WHITE, bold: true, margin: 0, charSpacing: 1 });
    s.addShape(pres.shapes.RECTANGLE, { x: 1.0, y: 4.85, w: 1.2, h: 0.06, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText("A Practical Guide to the Annual Report on Form 10-K", { x: 1.0, y: 5.0, w: 11.5, h: 0.5, fontSize: 20, fontFace: BODY, color: LIGHT_GOLD, italic: true, margin: 0 });
    s.addText([
      { text: "MASTER'S LEVEL SEMINAR", options: { bold: true, color: WHITE, breakLine: true, charSpacing: 2 } },
      { text: "Department of Finance  |  Bryant University", options: { color: LIGHT_GOLD, breakLine: true } },
      { text: "Source: U.S. Securities and Exchange Commission, Office of Investor Education and Advocacy", options: { color: GRAY, italic: true } }
    ], { x: 1.0, y: 6.1, w: 11.5, h: 1.1, fontSize: 12, fontFace: BODY, paraSpaceAfter: 4, margin: 0 });
  }

  // ── SLIDE 2: WHAT IS A 10-K ─────────────────────────────
  {
    const s = pres.addSlide(); s.background = { color: OFF_WHITE };
    title(s, "01  |  OVERVIEW", "What Is a Form 10-K?");
    const lX = M, lY = 1.95, lW = 6.0, lH = 4.8;
    // Left card
    s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: lH, fill: { color: WHITE }, line: { color: LIGHT_GRAY, width: 1 }, shadow: { type: "outer", color: "000000", blur: 10, offset: 2, angle: 90, opacity: 0.08 } });
    s.addShape(pres.shapes.RECTANGLE, { x: lX, y: lY, w: lW, h: 0.1, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText("THE ANNUAL DISCLOSURE", { x: lX + 0.35, y: lY + 0.35, w: 5.3, h: 0.3, fontSize: 11, fontFace: BODY, color: GOLD, bold: true, charSpacing: 2, margin: 0 });
    s.addText("The Form 10-K", { x: lX + 0.35, y: lY + 0.6, w: 5.3, h: 0
```