# OUTRO - skateboarding_beginner_course_lesson.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\skateboarding_beginner_course_lesson.js
**SHA:** e1fe6295b804d226
**Timestamp:** 2026-08-28T02:52:37.213685
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:  node skateboarding_101.js

### Gaps
- const gap = 0.18;
- const ovalGap = 0.7;
- // Each label gets a 1.4"-wide box centered on its oval, with no overlap (since ovalGap = 0.7)

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Skateboarding 101 — pptxgenjs replica
 * Editorial-style 8-slide deck on a black/cream/orange palette.
 *
 * Run:  node skateboarding_101.js
 * Outputs: Skateboarding_101.pptx in the current directory.
 */

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaHelmetSafety,
  FaShield,
  FaHandFist,
  FaShoePrints,
} = require("react-icons/fa6");
const { GiKneeCap } = require("react-icons/gi");

// ---------- Palette ----------
const COLOR = {
  ink:    "1A1A1A", // near-black background / heavy text
  cream:  "EFEAE0", // light page background
  paper:  "E5DFD2", // slightly darker cream for cards on cream
  orange: "F25C1E", // accent
  mute:   "8A8A8A", // muted grey for labels
  line:   "B8B0A0", // hairline rules on cream
  lineDk: "3A3A3A", // hairline rules on dark
  textDk: "1A1A1A", // body text on cream
  textLt: "EFEAE0", // body text on dark
};

const FONT_HEAD = "Arial Black";
const FONT_BODY = "Arial";

// ---------- Icon helpers ----------
function renderIconSvg(IconComponent, color = "#1A1A1A", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ---------- Build deck ----------
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";       // 13.333 x 7.5 inches
  pres.author = "Skateboarding 101";
  pres.title  = "Skateboarding 101 — Intro to Skate";

  const W = 13.333, H = 7.5;

  // Pre-rasterize gear icons for slide 4
  const iconHelmet = await iconToBase64Png(FaHelmetSafety, "#1A1A1A", 256);
  const iconKnee   = await iconToBase64Png(GiKneeCap,      "#1A1A1A", 256);
  const iconElbow  = await iconToBase64Png(FaShield,       "#1A1A1A", 256);
  const iconWrist  = await iconToBase64Png(FaHandFist,     "#1A1A1A", 256);
  const iconShoe   = await iconToBase64Png(FaShoePrints,   "#1A1A1A", 256);

  // ---------- Reusable bits ----------
  const addEyebrow = (slide, num, label, onDark = false) => {
    slide.addText(
      [
        { text: num + "  ", options: { color: onDark ? COLOR.mute : COLOR.mute, bold: true } },
        { text: label,     options: { color: COLOR.orange, bold: true } },
      ],
      {
        x: 0.6, y: 0.45, w: 10, h: 0.4,
        fontSize: 12, fontFace: FONT_BODY,
        charSpacing: 6, margin: 0,
      }
    );
  };

  const addFooter = (slide, page, onDark = false) => {
    const y = H - 0.55;
    const lineColor = onDark ? COLOR.lineDk : COLOR.line;
    const textColor = onDark ? COLOR.mute : COLOR.mute;
    // hairline rule
    slide.addShape(pres.shapes.LINE, {
      x: 0.6, y: y - 0.12, w: W - 1.2, h: 0,
      line: { color: lineColor, width: 0.75 },
    });
    slide.addText("SKATEBOARDING 101", {
      x: 0.6, y: y, w: 5, h: 0.35,
      fontSize: 10, fontFace: FONT_BODY,
      color: textColor, charSpacing: 4, margin: 0,
    });
    slide.addText(`${page} / 08`, {
      x: W - 5.6, y: y, w: 5, h: 0.35,
      fontSize: 10, fontFace: FONT_BODY,
      color: textColor, charSpacing: 4, align: "right", margin: 0,
    });
  };

  // =========================================================
  // SLIDE 1 — Title (dark)
  // =========================================================
  {
    const s = pres.addSlide();
    s.background = { color: COLOR.ink };

    // Top meta strip
    s.addText("SKATEBOARDING 101 / BEGINNERS", {
      x: 0.6, y: 0.55, w: 8, h: 0.4,
      fontSize: 12, fontFace: FONT_BODY,
      color: COLOR.cream, charSpacing: 6, margin: 0,
    });
    s.addText("LESSON 01 OF 08", {
      x: W - 5.6, y: 0.55, w: 5, h: 0.4,
      fontSize: 12, fontFace: FONT_BODY,
      color: COLOR.cream, charSpacing: 6, align: "right", margin: 0,
    });

    // Big display headline — period rendered as orange text run for clean alignment
    s.addText(
      [
        { text: "INTRO TO", options: { color: COLOR.cream, breakLine: true } },
        { text: "SKATE",    options: { color: COLOR.cream } },
        { text: ".",        options: { color: COLOR.orange } },
      ],
      {
        x: 0.6, y: 1.5, w: W - 1.2, h: 4.0,
        fontSize: 130, fontFace: FONT_HEAD, bold: true,
        valign: "top", margin: 0,
        lineSpacingMultiple: 0.95,
      }
    );

    // Bottom three-up meta block
    const metaY = 6.15;
    const metaCols = [
      ["COURSE",  "SKATEBOARDING 101"],
      ["FORMAT",  "8 LESSONS · ALL AGES"],
      ["BRING",   "BOARD · HELMET · PADS"],
    ];
    const colXs = [0.6, 4.0, 8.0];
    metaCols.forEach(([k, v], i) => {
      s.addText(k, {
        x: colXs[i], y: metaY, w: 4, h: 0.32,
        fontSize: 11, fontFace: FONT_BODY,
        color: COLOR.mute, charSp
```