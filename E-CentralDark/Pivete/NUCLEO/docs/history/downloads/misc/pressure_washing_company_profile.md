# OUTRO - pressure_washing_company_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\pressure_washing_company_profile.js
**SHA:** 1207cd4f9ae3689d
**Timestamp:** 2026-08-28T02:52:36.577990
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:

### Gaps
- const statX = 0.9, statY = 9.0, statW = 2.55, gap = 0.05;
- const cardW = 3.75, cardH = 1.5, cardGap = 0.2;
- const cardW = 4.4, cardH = 3.6, gap = 0.25;
- const cols = 3, cardW = 5.9, cardH = 1.55, gap = 0.25;
- const cardW = 4.4, cardH = 3.4, gap = 0.25;
- const cardW = 5.9, cardH = 5.2, gap = 0.3;
- const cardW = 5.95, cardH = 5.3, gap = 0.3;
- const blkY = 8.0, blkW = 2.5, blkGap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// Squeaky Clean Pressure Washing — Services & Pricing 2026
// Recreates the source PPTX using pptxgenjs
//
// Run:
//   npm install pptxgenjs      (or -g)
//   node squeaky_clean.js
//
// Output: Squeaky_Clean_Pressure_Washing.pptx

const pptxgen = require("pptxgenjs");

// ---------- palette & type ----------
const C = {
  navyDeep:  "0B2540", // primary dark navy (titles, dark slide bg)
  navyAlt:   "0B3B66", // secondary navy (dark card bg)
  blue:      "1D6FB8", // accent blue (eyebrows, numerals, logo square)
  teal:      "2EA3A0", // accent teal (italic accents, "most popular" pill)
  slate:     "3B5676", // body text / muted headings
  gray:      "7B8FA8", // captions, footers
  border:    "DCE5EF", // card borders, divider lines
  tintBlue:  "E6F0FA", // icon circle tint
  bg:        "F4F7FA", // light slide background
  white:     "FFFFFF",
  gold:      "E8A33B", // review stars
};

const FONT = "Arial";

// ---------- presentation (20" x 11.25") ----------
const pres = new pptxgen();
pres.defineLayout({ name: "SQ_WIDE", width: 20, height: 11.25 });
pres.layout = "SQ_WIDE";
pres.title  = "Squeaky Clean — Services & Pricing 2026";
pres.author = "Squeaky Clean Pressure Washing";

// ---------- shared helpers ----------
const SW = 20, SH = 11.25;

function makeShadow() {
  return { type: "outer", color: "000000", opacity: 0.08, blur: 10, offset: 2, angle: 90 };
}

// Top header: logo square + brand lockup on the left, eyebrow pill on the right
function addHeader(slide, eyebrowText) {
  // logo square
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.9, y: 0.75, w: 0.65, h: 0.65,
    fill: { color: C.blue }, line: { color: C.blue }, rectRadius: 0.08,
  });
  // brand name
  slide.addText("Squeaky Clean", {
    x: 1.7, y: 0.72, w: 4.2, h: 0.38,
    fontFace: FONT, fontSize: 15, bold: true, color: C.navyDeep, margin: 0, valign: "middle",
  });
  // brand tagline
  slide.addText("PRESSURE WASHING · ATLANTA, GA", {
    x: 1.7, y: 1.07, w: 4.2, h: 0.32,
    fontFace: FONT, fontSize: 9, color: C.gray, charSpacing: 3, margin: 0, valign: "middle",
  });

  // eyebrow pill (top-right)
  if (eyebrowText) {
    const pillW = 3.4, pillH = 0.52, pillX = SW - 0.9 - pillW, pillY = 0.82;
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: pillX, y: pillY, w: pillW, h: pillH,
      fill: { color: C.white }, line: { color: C.border, width: 1 }, rectRadius: 0.26,
    });
    slide.addText(eyebrowText, {
      x: pillX, y: pillY, w: pillW, h: pillH,
      fontFace: FONT, fontSize: 9.5, bold: true, color: C.blue,
      charSpacing: 3, align: "center", valign: "middle", margin: 0,
    });
  }
}

// Top divider line under header
function addTopDivider(slide) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: 1.55, w: SW - 1.8, h: 0,
    line: { color: C.border, width: 0.75 },
  });
}

// Bottom footer: left tagline + page counter on the right
function addFooter(slide, leftText, pageN, total = 10) {
  slide.addShape(pres.shapes.LINE, {
    x: 0.9, y: SH - 0.95, w: SW - 1.8, h: 0,
    line: { color: C.border, width: 0.75 },
  });
  if (leftText) {
    slide.addText(leftText, {
      x: 0.9, y: SH - 0.7, w: 14, h: 0.4,
      fontFace: FONT, fontSize: 10, color: C.gray, charSpacing: 3, margin: 0, valign: "middle",
    });
  }
  // page counter (right aligned)
  slide.addText(
    [
      { text: String(pageN).padStart(2, "0"), options: { color: C.slate, bold: true } },
      { text: " / " + total, options: { color: C.gray } },
    ],
    {
      x: SW - 3.0, y: SH - 0.7, w: 2.1, h: 0.4,
      fontFace: FONT, fontSize: 10, charSpacing: 2, align: "right", valign: "middle", margin: 0,
    }
  );
}

// Section eyebrow (small uppercase blue label above a big title)
function addEyebrow(slide, text, x, y, w = 10) {
  slide.addText(text, {
    x, y, w, h: 0.38,
    fontFace: FONT, fontSize: 11, bold: true, color: C.blue,
    charSpacing: 4, margin: 0, valign: "middle",
  });
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
{
  const s = pres.addSlide();
  s.background = { color: C.bg };

  // right dark panel
  const panelX = 11.8, panelW = SW - panelX;
  s.addShape(pres.shapes.RECTANGLE, {
    x: panelX, y: 0, w: panelW, h: SH,
    fill: { color: C.navyDeep }, line: { color: C.navyDeep },
  });

  // big soft circle on the dark panel
  const circleD = 6.2, circleX = panelX + (panelW - circleD) / 2, circleY = 2.4;
  s.addShape(pres.shapes.OVAL, {
    x: circleX, y: circleY, w: circleD, h: circleD,
    fill: { color: C.blue, transparency: 70 }, line: { color: C.blue, transparency: 50, width: 0.75 },
  });
  // tiny moon/dot bottom-right of the circle
  s.addShape(pres.shapes.OVAL, {
    x: circleX + circleD - 1.25, y: circleY + circleD - 1.05, w: 0.55, h: 0.55,
    fill: { color: C.white, transparency: 70 }, line: { color: C.white, transparency: 50, width: 0.75 },
  });

  // HEADER (logo + brand + pill)
  addHeader(
```