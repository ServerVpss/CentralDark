# COMANDO - hospitality_bed_and_breakfast_promo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\hospitality_bed_and_breakfast_promo.js
**SHA:** 0cba66ad4a2e1860
**Timestamp:** 2026-08-28T02:52:35.155980
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.18;

### Ouro Bruto (primeiros 5000 chars)
```
// Replica of Deliverable_8.pptx — "Courtyard House · Match Day Stay"
// Built with pptxgenjs

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaBed,
  FaStar,
  FaShuttleVan,
  FaBullseye,
  FaConciergeBell,
  FaEnvelope,
  FaPhone,
  FaGlobe,
} = require("react-icons/fa");

// ---------- Palette ----------
const C = {
  cream: "F5EFE3",      // background
  creamLight: "FBF7EE", // slightly brighter cream (for room cards on dark)
  navy: "162032",       // primary dark
  navyAlt: "1A2438",    // a touch lighter for on-card accents
  slate: "3A4458",      // muted navy text
  forest: "1F4D2B",     // primary green
  forestDark: "163920", // darker green for grid bg
  coral: "D4623A",      // accent orange/red
  white: "FFFFFF",
  black: "000000",
};

// ---------- Setup ----------
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333" x 7.5" (16:9)
pres.title = "Courtyard House — Match Day Stay";
pres.author = "Courtyard House";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

// ---------- Icon helpers ----------
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToPngB64(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ---------- Reused chrome (header + footer) ----------
function addChrome(slide, opts) {
  const {
    pageNum,           // e.g. "01"
    sectionTag,        // e.g. "COVER"
    headerRight,       // e.g. "MATCH DAY STAY · BED & BREAKFAST"
    bg = C.cream,      // slide background
    textColor = C.navy,
    mutedColor = C.slate,
    rightHalfBg = null,   // for slide 1 split bg, optional override of header right color region
  } = opts;

  // Brand mark: small coral dot + "COURTYARD HOUSE"
  slide.addShape(pres.shapes.OVAL, {
    x: 0.55, y: 0.43, w: 0.13, h: 0.13,
    fill: { color: C.coral }, line: { color: C.coral, width: 0 },
  });
  slide.addText("COURTYARD HOUSE", {
    x: 0.74, y: 0.32, w: 3, h: 0.4,
    fontFace: "Calibri", fontSize: 11, bold: true,
    color: textColor, charSpacing: 4, valign: "middle", margin: 0,
  });

  // Top-right header text
  slide.addText(headerRight, {
    x: SLIDE_W - 5.2, y: 0.32, w: 4.7, h: 0.4,
    fontFace: "Calibri", fontSize: 11,
    color: mutedColor, charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });

  // Bottom rule
  slide.addShape(pres.shapes.LINE, {
    x: 1.2, y: 7.13, w: SLIDE_W - 2.6, h: 0,
    line: { color: mutedColor, width: 0.5, transparency: 60 },
  });

  // Page number
  slide.addText(`${pageNum} / 08`, {
    x: 0.55, y: 6.95, w: 1.5, h: 0.35,
    fontFace: "Calibri", fontSize: 10,
    color: mutedColor, charSpacing: 4, valign: "middle", margin: 0,
  });

  // Section tag (right)
  slide.addText(sectionTag, {
    x: SLIDE_W - 2.05, y: 6.95, w: 1.5, h: 0.35,
    fontFace: "Calibri", fontSize: 10,
    color: mutedColor, charSpacing: 4, align: "right", valign: "middle", margin: 0,
  });
}

// ===================================================================
// MAIN
// ===================================================================
async function build() {
  // Pre-render icons (needed in slides 7 & 8)
  const iconBed       = await iconToPngB64(FaBed, "#1F4D2B", 256);
  const iconStar      = await iconToPngB64(FaStar, "#FBF7EE", 256);   // white star on coral disc
  const iconVan       = await iconToPngB64(FaShuttleVan, "#162032", 256);
  const iconBullseye  = await iconToPngB64(FaBullseye, "#1F4D2B", 256);
  const iconBell      = await iconToPngB64(FaConciergeBell, "#162032", 256);
  const iconEnv       = await iconToPngB64(FaEnvelope, "#F5EFE3", 256);
  const iconPhone     = await iconToPngB64(FaPhone, "#F5EFE3", 256);
  const iconGlobe     = await iconToPngB64(FaGlobe, "#F5EFE3", 256);

  // ============================================================
  // SLIDE 1 — COVER
  // ============================================================
  {
    const s = pres.addSlide();
    s.background = { color: C.cream };

    // Right half forest panel
    s.addShape(pres.shapes.RECTANGLE, {
      x: 7.7, y: 0, w: SLIDE_W - 7.7, h: SLIDE_H,
      fill: { color: C.forest }, line: { color: C.forest, width: 0 },
    });

    addChrome(s, {
      pageNum: "01",
      sectionTag: "COVER",
      headerRight: "MATCH DAY STAY · BED & BREAKFAST",
    });

    // Eyebrow
    s.addText("MATCH DAY STAY · FINAL WEEKEND", {
      x: 0.55, y: 1.4, w: 7, h: 0.35,
      fontFace: "Calibri", fontSize: 12, color: C.slate,
      charSpacing: 4, valign: "middle", margin: 0,
    });

    // Big headline (rich text — "final" in coral, italic-y serif feel via Georgia)
    s.addText(
      [
      
```