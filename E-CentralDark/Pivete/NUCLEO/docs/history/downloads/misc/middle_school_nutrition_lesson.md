# OUTRO - middle_school_nutrition_lesson.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\middle_school_nutrition_lesson.js
**SHA:** 688545b76c27c034
**Timestamp:** 2026-08-28T02:52:35.756786
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const pillGap = 0.25;
- const colGap = 0.4;
- const cardGap = 0.25;
- const tileGap = 0.18;
- const qGap  = 0.04; // tiny gap between quadrants
- const colGap = 0.4;

### Ouro Bruto (primeiros 5000 chars)
```
// Nutritionist deck — recreated with pptxgenjs
// Slide size: 13.333" × 7.5" (LAYOUT_WIDE / 16:9)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.title = "Introduction to Nutrition";
pres.author = "Mr. Halsey";

// ---------- Palette ----------
const COLORS = {
  cream:       "F7F1E5",   // page background (warm cream)
  creamSoft:   "EFE8D9",   // slight variant for slide 6
  ink:         "1A1F1C",   // primary dark
  inkSoft:     "3A4140",   // muted body text
  inkMuted:    "707571",   // captions / footers / page numbers
  rule:        "B8B0A0",   // divider lines
  green:       "2F5D3F",   // primary green (italic accent / dark slides)
  greenDeep:   "264C32",   // darker green (slide 3 background)
  orange:      "E5A23B",   // warm orange
  orangeDark:  "B47B22",   // darker orange (icon circle on orange card)
  pink:        "B6446B",   // berry / pink
  pinkSoft:    "C46A87",   // lighter pink (icon circle on pink card)
  blue:        "6E9BBC",   // hydration blue
  blueSoft:    "9BBAD2",   // softer blue
  greenSoft:   "6F8F77",   // soft green (icon circle on green card)
  charcoal:    "1F2421",   // wrap-up dark background
  white:       "FFFFFF",
};

const FONT_HEAD = "Arial";   // headings (bold sans)
const FONT_BODY = "Calibri"; // body
// Note: PowerPoint will substitute these with installed fonts. The original
// uses a similar geometric sans; Arial is the safest universal fallback.

// ---------- Slide-size helpers ----------
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ---------- Reusable header/footer for content slides ----------
function addHeader(slide, sectionNum, sectionLabel, pageNum, totalPages, opts = {}) {
  const eyebrowColor = opts.eyebrowColor || COLORS.ink;
  const dotColor = opts.dotColor || COLORS.ink;
  const pageColor = opts.pageColor || COLORS.inkMuted;
  const ruleColor = opts.ruleColor || COLORS.rule;

  // Eyebrow: "01 · WHAT IS IT"
  slide.addText(
    [
      { text: sectionNum, options: { bold: true, color: eyebrowColor } },
      { text: "  ·  ", options: { color: dotColor } },
      { text: sectionLabel, options: { bold: true, color: eyebrowColor } },
    ],
    {
      x: 0.7, y: 0.4, w: 8, h: 0.4,
      fontFace: FONT_HEAD, fontSize: 11,
      charSpacing: 4, valign: "middle", margin: 0,
    }
  );

  // Page indicator: "02 / 08"
  slide.addText(`${pageNum}  /  ${totalPages}`, {
    x: SLIDE_W - 2.0, y: 0.4, w: 1.3, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 11,
    color: pageColor, charSpacing: 4,
    align: "right", valign: "middle", margin: 0,
  });

  // Horizontal rule under header
  slide.addShape(pres.shapes.LINE, {
    x: 0.7, y: 0.85, w: SLIDE_W - 1.4, h: 0,
    line: { color: ruleColor, width: 0.5 },
  });
}

function addFooter(slide, pageNum, opts = {}) {
  const color = opts.color || COLORS.inkMuted;
  slide.addText("Introduction to Nutrition", {
    x: 0.7, y: SLIDE_H - 0.55, w: 5, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10,
    color, valign: "middle", margin: 0,
  });
  slide.addText(String(pageNum).padStart(2, "0"), {
    x: SLIDE_W - 1.5, y: SLIDE_H - 0.55, w: 0.8, h: 0.35,
    fontFace: FONT_BODY, fontSize: 10,
    color, align: "right", valign: "middle", margin: 0,
  });
}

// =======================================================================
// SLIDE 1 — Title / cover
// =======================================================================
{
  const s = pres.addSlide();
  s.background = { color: COLORS.cream };

  // Top eyebrow row
  s.addText("HEALTH CLASS GRADE 6", {
    x: 0.7, y: 0.5, w: 6, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 12, bold: true,
    color: COLORS.ink, charSpacing: 6,
    valign: "middle", margin: 0,
  });
  s.addText("LESSON 01 OF 12", {
    x: SLIDE_W - 4.7, y: 0.5, w: 4, h: 0.4,
    fontFace: FONT_HEAD, fontSize: 12, bold: true,
    color: COLORS.ink, charSpacing: 6,
    align: "right", valign: "middle", margin: 0,
  });

  // Big headline: "Introduction to" (bold) and "Nutrition." (italic green)
  s.addText("Introduction to", {
    x: 0.7, y: 1.7, w: 12, h: 1.5,
    fontFace: FONT_HEAD, fontSize: 96, bold: true,
    color: COLORS.ink, valign: "middle", margin: 0,
  });
  s.addText("Nutrition.", {
    x: 0.7, y: 3.05, w: 12, h: 1.5,
    fontFace: "Georgia", fontSize: 96, italic: true,
    color: COLORS.green, valign: "middle", margin: 0,
  });

  // Subtitle
  s.addText(
    "A first look at how food fuels the body, the brain, and everything you do.",
    {
      x: 0.7, y: 4.95, w: 7.5, h: 0.9,
      fontFace: FONT_BODY, fontSize: 16,
      color: COLORS.inkSoft, valign: "top", margin: 0,
    }
  );

  // Decorative circles cluster (bottom-right)
  // Small blue
  s.addShape(pres.shapes.OVAL, {
    x: 9.85, y: 4.7, w: 0.55, h: 0.55,
    fill: { color: COLORS.blue }, line: { type: "none" },
  });
  // Pink
  s.addShape(pres.shapes.OVAL, {
    x: 9.7, y: 5.45, w: 0.85, h: 0.85,
    fill: { color: COLORS.pink }, line: { type: "none"
```