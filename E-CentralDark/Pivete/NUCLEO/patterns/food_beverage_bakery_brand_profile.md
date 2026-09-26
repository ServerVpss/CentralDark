# PADRAO - food_beverage_bakery_brand_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\food_beverage_bakery_brand_profile.js
**SHA:** eb1fcecc1f5e3efe
**Timestamp:** 2026-08-28T02:52:34.390093
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node butter_lane.js   (requires `npm install pptxgenjs`)

### Ouro Bruto (primeiros 5000 chars)
```
// Butter Lane Charlotte — bakery deck recreation
// Run: node butter_lane.js   (requires `npm install pptxgenjs`)

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// -------- Setup --------
const pres = new pptxgen();
pres.author = "Butter Lane";
pres.title = "Butter Lane Charlotte";

// Original deck is 20" × 11.25" — define a custom layout to preserve coordinates 1:1
pres.defineLayout({ name: "BL_WIDE", width: 20, height: 11.25 });
pres.layout = "BL_WIDE";

// -------- Color palette --------
const COL = {
  cream:    "FAF1DC",
  yellow:   "F4D77A",
  darkBg:   "3A2A1A",
  ink:      "2A1F12",
  ink2:     "3B2A1A",
  brown:    "5A4329",
  tan:      "B7733A",
};

// -------- Helpers --------
const FONT_SERIF = "Georgia";
const FONT_SANS  = "Arial";

const ASSETS = path.join(__dirname, "assets");
const img = (name) => path.join(ASSETS, name);

// Reusable label-with-flanking-rules helper used on the title slide
function labelWithRules(slide, { x, y, w, text, ruleColor = COL.ink2 }) {
  // text centered in width w, with a small horizontal rule on each side
  const ruleW = 0.62;
  const ruleH = 0.02;
  const ruleY = y + 0.16; // visually center against the cap-height of 18pt text
  // Left rule
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x, y: ruleY, w: ruleW, h: ruleH,
    fill: { color: ruleColor }, line: { type: "none" },
  });
  // Right rule
  slide.addShape(pres.shapes.RECTANGLE, {
    x: x + w - ruleW, y: ruleY, w: ruleW, h: ruleH,
    fill: { color: ruleColor }, line: { type: "none" },
  });
  // Centered label text
  slide.addText(text, {
    x: x + ruleW + 0.15, y: y, w: w - 2 * (ruleW + 0.15), h: 0.37,
    fontFace: FONT_SANS, fontSize: 18, color: ruleColor,
    bold: false, charSpacing: 4, align: "center", valign: "middle", margin: 0,
  });
}

// =====================================================================
// SLIDE 1 — Title / cover
// =====================================================================
{
  const slide = pres.addSlide();
  slide.background = { color: COL.cream };

  // Soft yellow glow background
  slide.addImage({ path: img("image1.png"), x: 0, y: 0, w: 20, h: 11.25 });

  // Thin inner border
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0.73, y: 0.73, w: 18.54, h: 9.79,
    fill: { type: "none" },
    line: { color: COL.darkBg, width: 0.75, transparency: 65 },
  });

  // Top row: "THE NEIGHBORHOOD BAKERY" — left, BL monogram circle — center, "CHARLOTTE · NC" — right
  // small left rule preceding the label
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 2.40, y: 2.70, w: 0.62, h: 0.02,
    fill: { color: COL.ink2 }, line: { type: "none" },
  });
  slide.addText("THE NEIGHBORHOOD BAKERY", {
    x: 3.20, y: 2.54, w: 5.50, h: 0.37,
    fontFace: FONT_SANS, fontSize: 18, color: COL.ink2,
    charSpacing: 4, align: "left", valign: "middle", margin: 0,
  });

  // BL monogram circle — center top
  slide.addShape(pres.shapes.OVAL, {
    x: 9.48, y: 2.19, w: 1.03, h: 1.03,
    fill: { color: COL.cream },
    line: { color: COL.ink2, width: 1 },
  });
  slide.addText(
    [
      { text: "B", options: { fontFace: FONT_SERIF, fontSize: 28, color: COL.ink, bold: false } },
      { text: " · ", options: { fontFace: FONT_SERIF, fontSize: 18, color: COL.ink } },
      { text: "L", options: { fontFace: FONT_SERIF, fontSize: 28, color: COL.ink, bold: false } },
    ],
    { x: 9.48, y: 2.19, w: 1.03, h: 1.03, align: "center", valign: "middle", margin: 0 }
  );

  // CHARLOTTE · NC — right (rule on far right, label aligned to left of rule)
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 16.98, y: 2.70, w: 0.62, h: 0.02,
    fill: { color: COL.ink2 }, line: { type: "none" },
  });
  slide.addText("CHARLOTTE · NC", {
    x: 11.30, y: 2.54, w: 5.50, h: 0.37,
    fontFace: FONT_SANS, fontSize: 18, color: COL.ink2,
    charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });

  // Big serif title — "Butter & Lane" with the ampersand in tan italic
  slide.addText(
    [
      { text: "Butter ", options: { color: COL.ink } },
      { text: "& ",       options: { color: COL.tan, italic: true } },
      { text: "Lane",     options: { color: COL.ink } },
    ],
    {
      x: 1.50, y: 3.80, w: 17.00, h: 2.80,
      fontFace: FONT_SERIF, fontSize: 140,
      align: "center", valign: "middle", margin: 0,
    }
  );

  // Tagline — italic serif
  slide.addText("Bread, pastry & cakes — baked fresh, every morning.", {
    x: 2.17, y: 6.95, w: 15.66, h: 1.10,
    fontFace: FONT_SERIF, fontSize: 36, color: COL.brown,
    italic: true, align: "center", valign: "middle", margin: 0,
  });

  // Bottom row: EST. 2026 — A FAMILY BAKERY (with rules) — NO. 01
  slide.addText("EST. 2026", {
    x: 2.40, y: 8.73, w: 2.50, h: 0.37,
    fontFace: FONT_SANS, fontSize: 18, color: COL.ink2,
    charSpacing: 4, align: "left", valign: "middle", margin: 0,
  });

  // A FAMILY BAKERY with flanking rules
  labelWithRules(slide, { x: 8.02, y: 8.73, w: 4.
```