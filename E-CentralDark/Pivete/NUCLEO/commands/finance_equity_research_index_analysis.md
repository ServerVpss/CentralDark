# COMANDO - finance_equity_research_index_analysis.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_equity_research_index_analysis.js
**SHA:** a4466301a3afba96
**Timestamp:** 2026-08-28T02:52:33.624188
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node hang_seng_deck.js

### Riscos
- { text: "Concentration risk: ", options: { bold: true, color: C.ink } },

### Gaps
- const gap = 0.35;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Hang Seng Index — Investor Briefing
 * Replica generator using pptxgenjs.
 *
 * Run:  node hang_seng_deck.js
 * Out:  Hang_Seng_Index.pptx
 */

const pptxgen = require("pptxgenjs");

// ─── Palette & Type ──────────────────────────────────────────────────────────
const C = {
  bg:        "F4EFE6", // warm cream background
  ink:       "0E1B2C", // primary dark navy ink
  inkSoft:   "23324A", // softer navy
  muted:     "6B6F76", // muted gray for labels/captions
  rule:      "2A2A2A", // hairline rule near header
  ruleSoft:  "C9C2B6", // soft separator
  accent:    "C0392B", // muted brick-red accent
  accentSub: "E0CFC2", // dusty pinkish for hangSeng row highlight
  bull:      "5C8A6B", // green for bull
  panelBg:   "EAE3D5", // panel/box fill
  bar:       "0E1B2C", // bar charts (navy)
  barLight:  "DCD6CA", // bar background track
};

const FONT_HEADER = "Georgia";
const FONT_BODY   = "Calibri";

// Slide is 20.0" × 11.25"
const W = 20.0, H = 11.25;
const MARGIN_X = 1.05; // outer left/right margin
const HEADER_Y = 0.65;
const HEADER_RULE_Y = 1.00;
const FOOTER_RULE_Y = 10.50;
const FOOTER_TEXT_Y = 10.65;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function addBackground(slide) {
  slide.background = { color: C.bg };
}

function addLogoMark(slide, x, y) {
  // small framed "恒" mark in upper-left
  slide.addShape("rect", {
    x: x, y: y, w: 0.42, h: 0.42,
    fill: { color: C.bg },
    line: { color: C.ink, width: 0.75 },
  });
  slide.addText("恒", {
    x: x, y: y, w: 0.42, h: 0.42,
    fontFace: FONT_HEADER, fontSize: 16, color: C.ink,
    align: "center", valign: "middle", margin: 0,
  });
}

function addHeader(slide, leftLabel, rightLabel) {
  // Header rule (drawn FIRST so it sits underneath everything else cleanly)
  slide.addShape("line", {
    x: MARGIN_X, y: HEADER_RULE_Y + 0.18, w: W - 2 * MARGIN_X, h: 0,
    line: { color: C.rule, width: 0.75 },
  });
  addLogoMark(slide, MARGIN_X, HEADER_Y);
  slide.addText(leftLabel, {
    x: MARGIN_X + 0.65, y: HEADER_Y, w: 11, h: 0.42,
    fontFace: FONT_BODY, fontSize: 13, color: C.ink,
    charSpacing: 4, valign: "middle", margin: 0,
  });
  slide.addText(rightLabel, {
    x: W - MARGIN_X - 11, y: HEADER_Y, w: 11, h: 0.42,
    fontFace: FONT_BODY, fontSize: 13, color: C.ink,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
}

function addFooter(slide, leftLabel, rightLabel, pageNum) {
  // footer rule
  slide.addShape("line", {
    x: MARGIN_X, y: FOOTER_RULE_Y, w: W - 2 * MARGIN_X, h: 0,
    line: { color: C.ruleSoft, width: 0.5 },
  });
  if (leftLabel) {
    slide.addText(leftLabel, {
      x: MARGIN_X, y: FOOTER_TEXT_Y, w: 11, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: C.muted,
      charSpacing: 3, valign: "middle", margin: 0,
    });
  }
  if (rightLabel) {
    slide.addText(rightLabel, {
      x: W - MARGIN_X - 7.5, y: FOOTER_TEXT_Y, w: 7, h: 0.4,
      fontFace: FONT_BODY, fontSize: 11, color: C.muted,
      charSpacing: 3, align: "right", valign: "middle", margin: 0,
    });
  }
  if (pageNum !== undefined) {
    slide.addText(pageNum, {
      x: W - MARGIN_X - 0.6, y: FOOTER_TEXT_Y, w: 0.6, h: 0.4,
      fontFace: FONT_HEADER, fontSize: 12, italic: true, color: C.muted,
      align: "right", valign: "middle", margin: 0,
    });
  }
}

// ─── Build presentation ──────────────────────────────────────────────────────
const pres = new pptxgen();
pres.title = "The Hang Seng, repriced.";
pres.author = "Equity Research · Asia Pacific";
pres.defineLayout({ name: "HSI_WIDE", width: W, height: H });
pres.layout = "HSI_WIDE";

// ─── Slide 1: Title ──────────────────────────────────────────────────────────
{
  const s = pres.addSlide();
  addBackground(s);
  addHeader(s, "EQUITY RESEARCH · ASIA PACIFIC", "APRIL 2026 · CONFIDENTIAL");

  // Section eyebrow
  s.addText("INVESTOR BRIEFING", {
    x: MARGIN_X, y: 2.45, w: 8, h: 0.45,
    fontFace: FONT_BODY, fontSize: 14, color: C.accent,
    charSpacing: 6, margin: 0,
  });

  // Big title (rich text: navy + red italic)
  s.addText(
    [
      { text: "The Hang Seng, ", options: { color: C.ink, italic: false } },
      { text: "repriced.",       options: { color: C.accent, italic: true } },
    ],
    {
      x: MARGIN_X, y: 3.0, w: 18, h: 1.9,
      fontFace: FONT_HEADER, fontSize: 88, bold: false,
      valign: "top", margin: 0,
    }
  );

  // Lead description
  s.addText(
    "A market-cap-weighted view of Hong Kong's flagship index — its largest constituents, " +
    "its valuation against global peers, and the policy backdrop shaping capital flows into China.",
    {
      x: MARGIN_X, y: 6.1, w: 11.0, h: 1.6,
      fontFace: FONT_BODY, fontSize: 18, color: C.inkSoft,
      valign: "top", margin: 0, paraSpaceAfter: 0,
    }
  );

  // Big "01" in soft cream (background number)
  s.addText("01", {
    x: W - MARGIN_X - 4.2, y: 6.6, w: 4.2, h: 2.6,
    fontFace: FONT_HEADER, fontSize: 180, italic: true, color: C.accentSu
```