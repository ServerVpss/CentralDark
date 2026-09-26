# OUTRO - grocery_flash_sale_promotion.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\grocery_flash_sale_promotion.js
**SHA:** 642be434fc9bf213
**Timestamp:** 2026-08-28T02:52:35.067305
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gridX = 11.1, gridY = 2.0, cellW = 4.15, cellH = 1.55, gap = 0.15;
- const gridX = 0.6, gridY = 3.85, cellW = 4.6, cellH = 3.1, gap = 0.15;
- const infoY = 7.3, colW = 4.35, colGap = 0.25;

### Ouro Bruto (primeiros 5000 chars)
```
// Milestone Mart - Flash Sale Week
// Recreation of Milestone_Mart_Flash_Sale__1_.pptx using pptxgenjs
//
// Usage: node recreate.js
// Output: Milestone_Mart_Flash_Sale.pptx

const pptxgen = require("pptxgenjs");

// ----- Palette -----
const COLOR = {
  cream:      "F3EAD7", // main slide background
  creamLight: "FBF6E8", // light cream (card body on hero)
  sand:       "ECD9B0", // product image placeholder (on cream cards)
  sandDark:   "D8C79E", // placeholder on hero (slightly darker tone)
  sandBorder: "C9B78A", // dashed border for image placeholders
  green:      "2B4A2E", // forest green — accents, hero card bg, footer bar
  greenDark:  "1F3521", // darker green for deep accents
  red:        "C7361E", // tomato red — primary CTA / badges
  redDeep:    "A62C18", // darker red for strike-through contrast if needed
  gold:       "D8A421", // gold star, price on hero
  ink:        "1F1A14", // near-black for body
  inkSoft:    "4A3D2C", // muted body
  white:      "FFFFFF",
  cardBorder: "D8C79E", // subtle card hairline
};

// ----- Fonts -----
const FONT_HEAD = "Fraunces";
const FONT_BODY = "-apple-system";
const FONT_MONO = "JetBrains Mono";

// ----- Helpers -----
function makeShadow() {
  return { type: "outer", blur: 8, offset: 2, angle: 90, color: "000000", opacity: 0.08 };
}

/**
 * Draw the milestone•mart wordmark at a given position.
 */
function addLogo(slide, x, y) {
  slide.addText(
    [
      { text: "milestone",                          options: { italic: true, color: COLOR.ink, fontFace: FONT_HEAD } },
      { text: " ",                                   options: {} },
      { text: "●",                                   options: { color: COLOR.red, bold: true, fontFace: FONT_BODY } },
      { text: " ",                                   options: {} },
      { text: "mart",                                options: { italic: true, color: COLOR.ink, fontFace: FONT_HEAD } },
    ],
    { x: x, y: y, w: 3.2, h: 0.45, fontSize: 18, margin: 0, valign: "middle" }
  );
}

/**
 * Top-right label (eyebrow) on every slide.
 */
function addEyebrow(slide, text, colorHex) {
  slide.addText(text, {
    x: 13.5, y: 0.45, w: 6.0, h: 0.4,
    fontSize: 12, bold: true, color: colorHex || COLOR.inkSoft,
    fontFace: FONT_BODY, align: "right", valign: "middle",
    charSpacing: 4, margin: 0,
  });
}

/**
 * Footer page number ("N / 10") and optional left text.
 */
function addPageFooter(slide, pageNum, totalPages, leftText) {
  // thin horizontal rule
  slide.addShape("line", {
    x: 0.6, y: 10.6, w: 18.8, h: 0,
    line: { color: COLOR.sandBorder, width: 0.5 },
  });
  if (leftText) {
    slide.addText(leftText, {
      x: 0.6, y: 10.7, w: 12, h: 0.4,
      fontSize: 11, color: COLOR.inkSoft, fontFace: FONT_BODY, margin: 0, valign: "middle",
    });
  }
  slide.addText(`${String(pageNum).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`, {
    x: 17.5, y: 10.7, w: 1.9, h: 0.4,
    fontSize: 11, color: COLOR.inkSoft, fontFace: FONT_BODY, align: "right", margin: 0, valign: "middle",
  });
}

// ====================================================================
// BUILD PRESENTATION
// ====================================================================

const pres = new pptxgen();
pres.title = "Milestone Mart — Flash Sale Week";
pres.author = "Milestone Mart";

// Custom 16:9 layout at 20" x 11.25" to match the source file
pres.defineLayout({ name: "MM_WIDE", width: 20, height: 11.25 });
pres.layout = "MM_WIDE";

const TOTAL = 10;

// ====================================================================
// SLIDE 1 — COVER
// ====================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLOR.cream };

  addLogo(s, 0.6, 0.45);
  addEyebrow(s, "EST. IN YOUR NEIGHBORHOOD", COLOR.inkSoft);

  // Big multi-line headline "Flash / Sale / Week."
  s.addText(
    [
      { text: "Flash", options: { color: COLOR.ink, bold: true, breakLine: true } },
      { text: "Sale",  options: { color: COLOR.green, italic: true, bold: true, breakLine: true } },
      { text: "Week.", options: { color: COLOR.ink, bold: true } },
    ],
    {
      x: 0.6, y: 1.3, w: 12, h: 6.5,
      fontSize: 130, fontFace: FONT_HEAD,
      lineSpacingMultiple: 0.95, margin: 0, valign: "top",
    }
  );

  // Four info blocks at the bottom
  const infoY = 8.1;
  const infoBlocks = [
    { label: "SEVEN DAYS ONLY",   value: "Apr 28 — May 4, 2026" },
    { label: "HOW LOW",           value: "10–30% off everyday prices — cheaper than the big chains, online and offline." },
    { label: "WHERE",             value: "24 Larch Street" },
  ];
  const infoXs = [0.6, 3.2, 9.5];
  const infoWs = [2.5, 5.9, 3.5];
  infoBlocks.forEach((blk, i) => {
    s.addText(blk.label, {
      x: infoXs[i], y: infoY, w: infoWs[i], h: 0.35,
      fontSize: 12, bold: true, color: COLOR.inkSoft, fontFace: FONT_BODY,
      charSpacing: 3, margin: 0,
    });
    s.addText(blk.value, {
      x: inf
```