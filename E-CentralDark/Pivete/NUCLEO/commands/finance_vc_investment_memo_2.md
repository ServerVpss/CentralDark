# COMANDO - finance_vc_investment_memo_2.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_vc_investment_memo_2.js
**SHA:** 590cb50cfb7d9cd5
**Timestamp:** 2026-08-28T02:52:34.180761
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:   npm install pptxgenjs && node generate.js

### Gaps
- const gap = 0.1;
- const gap = 0.3;

### Ouro Bruto (primeiros 5000 chars)
```
// AlienTech Labs · IC Memo · Asterion Ventures
// Standalone pptxgenjs script — produces a faithful replica of the source deck.
// Run:   npm install pptxgenjs && node generate.js

const pptxgen = require("pptxgenjs");

// ---------- Setup: custom 20 x 11.25 inch layout ----------
const pres = new pptxgen();
pres.author = "M. Halberd · Asterion Ventures";
pres.title = "AlienTech Labs · IC Memo";
pres.defineLayout({ name: "AV_CUSTOM", width: 20, height: 11.25 });
pres.layout = "AV_CUSTOM";

// ---------- Color palette ----------
const C = {
  bgLight: "F5F2EC",
  bgDark: "2A2620",
  ink: "1A1A1A",
  inkSoft: "3A3631",
  muted: "6B6357",
  rule: "C8BFAE",
  ruleSoft: "E2DCCF",
  cream: "ECE8DF",
  gold: "8A6A3A",
  red: "8A3A3A",
  green: "4A6B3A",
};

// ---------- Fonts ----------
const F = {
  serif: "Georgia",
  mono: "Consolas",
  sans: "Aptos",
};

// ---------- Slide dimensions ----------
const W = 20;
const H = 11.25;
const M = 0.85;

// ---------- Reusable: header + footer ----------
function addHeaderFooter(slide, slideNum, sectionLabel, dark = false) {
  const fg = dark ? C.cream : C.ink;
  const fgSoft = dark ? "ECE8DF" : C.muted;
  const ruleColor = dark ? "4A4640" : C.rule;

  slide.addShape(pres.shapes.LINE, {
    x: M, y: 1.02, w: W - 2 * M, h: 0,
    line: { color: ruleColor, width: 0.5 },
  });

  slide.addText("ASTERION VENTURES", {
    x: M, y: 0.4, w: 3.6, h: 0.5,
    fontFace: F.mono, fontSize: 15, bold: true, color: fg,
    charSpacing: 4, margin: 0, valign: "middle",
  });

  slide.addText(sectionLabel, {
    x: M + 3.8, y: 0.4, w: 10, h: 0.5,
    fontFace: F.mono, fontSize: 15, color: fgSoft,
    charSpacing: 2, margin: 0, valign: "middle",
  });

  slide.addText("CONFIDENTIAL", {
    x: W - M - 3.5, y: 0.4, w: 3.5, h: 0.5,
    fontFace: F.mono, fontSize: 15, color: fgSoft,
    charSpacing: 2, margin: 0, valign: "middle", align: "right",
  });

  slide.addShape(pres.shapes.LINE, {
    x: M, y: H - 0.65, w: W - 2 * M, h: 0,
    line: { color: ruleColor, width: 0.5 },
  });

  slide.addText("ALIENTECH LABS · IC MEMO", {
    x: M, y: H - 0.5, w: 5, h: 0.35,
    fontFace: F.mono, fontSize: 13, color: fgSoft,
    charSpacing: 2, margin: 0, valign: "middle",
  });

  slide.addText("CONFIDENTIAL — INTERNAL USE ONLY", {
    x: W / 2 - 3.5, y: H - 0.5, w: 7, h: 0.35,
    fontFace: F.mono, fontSize: 13, color: C.gold,
    charSpacing: 3, margin: 0, valign: "middle", align: "center",
  });

  slide.addText(`${String(slideNum).padStart(2, "0")} / 12`, {
    x: W - M - 2, y: H - 0.5, w: 2, h: 0.35,
    fontFace: F.mono, fontSize: 13, color: fgSoft,
    charSpacing: 2, margin: 0, valign: "middle", align: "right",
  });
}

// ---------- Reusable: eyebrow + title block ----------
function addTitleBlock(slide, eyebrow, title, dark = false) {
  slide.addText(eyebrow, {
    x: M, y: 1.4, w: 14, h: 0.5,
    fontFace: F.mono, fontSize: 16, color: C.gold,
    charSpacing: 4, bold: true, margin: 0, valign: "middle",
  });

  slide.addText(title, {
    x: M, y: 1.95, w: 18, h: 1.2,
    fontFace: F.serif, fontSize: 54, color: dark ? C.cream : C.ink,
    charSpacing: -1, margin: 0, valign: "middle",
  });
}

// ============================================================
// SLIDE 1 · COVER
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { color: C.bgLight };

  slide.addShape(pres.shapes.LINE, {
    x: M, y: 1.02, w: W - 2 * M, h: 0,
    line: { color: C.rule, width: 0.5 },
  });
  slide.addText("ASTERION VENTURES", {
    x: M, y: 0.4, w: 3.6, h: 0.5,
    fontFace: F.mono, fontSize: 15, bold: true, color: C.ink,
    charSpacing: 4, margin: 0, valign: "middle",
  });
  slide.addText("INVESTMENT COMMITTEE MEMORANDUM", {
    x: M + 3.8, y: 0.4, w: 11, h: 0.5,
    fontFace: F.mono, fontSize: 15, color: C.muted,
    charSpacing: 2, margin: 0, valign: "middle",
  });
  slide.addText("CONFIDENTIAL · DRAFT V3.2", {
    x: W - M - 5.5, y: 0.4, w: 5.5, h: 0.5,
    fontFace: F.mono, fontSize: 15, color: C.muted,
    charSpacing: 2, margin: 0, valign: "middle", align: "right",
  });

  slide.addShape(pres.shapes.OVAL, {
    x: M, y: 1.65, w: 0.95, h: 0.95,
    fill: { type: "none" }, line: { color: C.gold, width: 1 },
  });

  slide.addText("SERIES A · LEAD INVESTMENT", {
    x: M, y: 3.05, w: 12, h: 0.55,
    fontFace: F.mono, fontSize: 19, color: C.gold,
    charSpacing: 4, bold: true, margin: 0, valign: "middle",
  });

  slide.addText("AlienTech Labs", {
    x: M, y: 3.65, w: 18, h: 1.9,
    fontFace: F.serif, fontSize: 96, color: C.ink,
    charSpacing: -2, margin: 0, valign: "middle",
  });

  slide.addText(
    "Commercialising recovered non-terrestrial materials science into civilian platforms across aerospace, advanced manufacturing, and dual-use defence.",
    {
      x: M, y: 5.85, w: 13, h: 1.7,
      fontFace: F.serif, fontSize: 26, italic: true, color: C.inkSoft,
      margin: 0, valign: "top",
    }
  );

  slide.addShape(pres.shapes.L
```