# COMANDO - sports_betting_saas_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\sports_betting_saas_pitch_deck.js
**SHA:** 29a1b98cbf1cf267
**Timestamp:** 2026-08-28T02:52:37.035086
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const colGap = 1.3;
- const colGap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Edge Labs — SaaS Seed Pitch Deck
 * Replica built with pptxgenjs
 *
 * Usage:  node build_deck.js
 * Output: SaaS_Deck.pptx
 */

const pptxgen = require("pptxgenjs");

// ---------- design tokens ----------
const INK       = "000000";          // body / titles
const MUTE      = "6B7280";          // secondary gray text
const RULE      = "D1D5DB";          // thin dividers
const RULE_SOFT = "E5E7EB";          // super-subtle grid lines
const GREEN     = "4ADE80";          // signature brand green
const GREEN_SOFT= "BBF7D0";          // light green area-fill
const ORANGE    = "EA8C14";          // accent on slide 4 only
const PAPER     = "FFFFFF";

const HEAD_FONT = "Arial";           // sans-serif, neutral
const BODY_FONT = "Arial";

// ---------- geometry ----------
// Match the original 20" × 11.25" canvas
const W = 20;
const H = 11.25;

const pres = new pptxgen();
pres.defineLayout({ name: "EDGE_WIDE", width: W, height: H });
pres.layout = "EDGE_WIDE";
pres.author = "Edge Labs, Inc.";
pres.company = "Edge Labs";
pres.title = "Edge — Seed Pitch";

// ================================================================
// helpers
// ================================================================

/** Top "terminal" header bar with pipe separators. Used on every slide. */
function addTopChrome(slide, left, right) {
  const yTop = 0.35;

  // left-side eyebrow group
  slide.addText(left[0], {
    x: 0.5, y: yTop, w: 2.0, h: 0.3,
    fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
    charSpacing: 3, margin: 0, valign: "middle",
  });
  // pipe
  slide.addText("│", {
    x: 2.4, y: yTop, w: 0.2, h: 0.3,
    fontFace: HEAD_FONT, fontSize: 9, color: MUTE,
    margin: 0, valign: "middle",
  });
  slide.addText(left[1], {
    x: 2.7, y: yTop, w: 5.5, h: 0.3,
    fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
    charSpacing: 3, margin: 0, valign: "middle",
  });

  // right-side group
  if (right && right.length >= 1) {
    if (right.length === 1) {
      slide.addText(right[0], {
        x: W - 2.0, y: yTop, w: 1.5, h: 0.3,
        fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
        charSpacing: 3, margin: 0, valign: "middle", align: "right",
      });
    } else {
      slide.addText(right[0], {
        x: W - 5.5, y: yTop, w: 3.2, h: 0.3,
        fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
        charSpacing: 3, margin: 0, valign: "middle", align: "right",
      });
      slide.addText("│", {
        x: W - 2.2, y: yTop, w: 0.2, h: 0.3,
        fontFace: HEAD_FONT, fontSize: 9, color: MUTE,
        margin: 0, valign: "middle", align: "center",
      });
      slide.addText(right[1], {
        x: W - 2.0, y: yTop, w: 1.5, h: 0.3,
        fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
        charSpacing: 3, margin: 0, valign: "middle", align: "right",
      });
    }
  }
}

/** Footer text — small, uppercase, tracked. */
function addFooter(slide, left, right) {
  const y = H - 0.55;
  if (left) {
    slide.addText(left, {
      x: 0.5, y, w: 10, h: 0.3,
      fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
      charSpacing: 3, margin: 0, valign: "middle",
    });
  }
  if (right) {
    slide.addText(right, {
      x: W - 10.5, y, w: 10, h: 0.3,
      fontFace: HEAD_FONT, fontSize: 9, color: INK, bold: true,
      charSpacing: 3, margin: 0, valign: "middle", align: "right",
    });
  }
}

/** Eyebrow label (small uppercase muted) */
function eyebrow(slide, text, x, y, w = 6) {
  slide.addText(text, {
    x, y, w, h: 0.3,
    fontFace: HEAD_FONT, fontSize: 10, color: INK, bold: true,
    charSpacing: 3, margin: 0, valign: "middle",
  });
}

// ================================================================
// SLIDE 1 — Cover
// ================================================================
function slide1() {
  const s = pres.addSlide();
  s.background = { color: PAPER };

  addTopChrome(s,
    ["EDGE / TERMINAL", "SEED · CONFIDENTIAL"],
    ["MLB · 2026 SEASON", "V0.8 BETA"]
  );

  // section marker
  s.addText("01 / 08   SEED PITCH · APRIL 2026", {
    x: 0.8, y: 2.6, w: 10, h: 0.4,
    fontFace: HEAD_FONT, fontSize: 11, color: INK, bold: true,
    charSpacing: 3, margin: 0,
  });

  // giant brand wordmark
  s.addText("Edge.", {
    x: 0.8, y: 3.0, w: 10, h: 2.6,
    fontFace: HEAD_FONT, fontSize: 140, color: INK, bold: true,
    margin: 0, valign: "top",
  });

  // tagline
  s.addText("The right plays at the right time, every time.", {
    x: 0.8, y: 5.9, w: 11, h: 0.6,
    fontFace: BODY_FONT, fontSize: 22, color: INK,
    margin: 0,
  });

  // stats strip (STAGE / MARKET / USERS / EDGE)
  const statY = 7.0;
  const stats = [
    { label: "STAGE",  value: "Seed"      },
    { label: "MARKET", value: "MLB · US"  },
    { label: "USERS",  value: "100 paid"  },
    { label: "EDGE",   value: "+10.2%"    },
  ];
  stats.forEach((stat, i) => {
    const x = 0.8 + i * 1.5;
    s.addText(stat.label, {
      x, y: statY, w: 1.4, h: 0.3,

```