# COMANDO - biotech_cloud_rd_infrastructure_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\biotech_cloud_rd_infrastructure_proposal.js
**SHA:** 7f087294a5cb48f4
**Timestamp:** 2026-08-28T02:52:32.388730
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build.js   →   outputs ./emerald_cloud_lab.pptx
- const iconRun      = await iconPng(FaRobot,          "#" + TEAL, 256);

### Gaps
- const rowGap = 0.22;
- const startY = 1.45, gap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
// Emerald Cloud Lab — Executive Pitch Deck
// Recreates the uploaded PPTX using pptxgenjs.
//
// Run: node build.js   →   outputs ./emerald_cloud_lab.pptx

const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaLaptopCode,
  FaRobot,
  FaProjectDiagram,
  FaChartLine,
  FaDollarSign,
  FaShareAlt,
  FaFileAlt,
  FaGlobe,
} = require("react-icons/fa");

// ────────────────────────────────────────────────────────────────────────────
// Palette
// ────────────────────────────────────────────────────────────────────────────
const BG_NAVY       = "0F1E35";   // deep navy background
const TEAL          = "2EE5BA";   // primary teal accent
const TEAL_DIM      = "1FB896";   // darker teal (chart bars)
const WHITE         = "FFFFFF";
const TEXT_MUTED    = "94A3B8";   // muted slate for body/captions
const TEXT_DIMMER   = "64748B";   // axis labels, footer
const ROW_ALT       = "1A2B45";   // alternating table row
const ROW_HEADER    = "14243E";   // table header row
const AMBER         = "F5B041";   // in-house/warning color
const MAUVE         = "C07C94";   // CRO color (pink/mauve)
const PINK_HIGH     = "FF6B6B";   // HIGH risk tag
const AMBER_MED     = "F5A623";   // MEDIUM risk tag
const GRAY_BAR      = "6B7A91";   // stat comparison bars (muted)

// ────────────────────────────────────────────────────────────────────────────
// Icon rasterization helper
// ────────────────────────────────────────────────────────────────────────────
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconPng(IconComponent, color = "#" + TEAL, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}

// ────────────────────────────────────────────────────────────────────────────
// Shared slide furniture
// ────────────────────────────────────────────────────────────────────────────
// Fresh shadow object per call (pptxgenjs mutates shadow options in place)
const makeShadow = () => ({
  type: "outer", blur: 8, offset: 2, angle: 90, color: "000000", opacity: 0.25,
});

function addFooter(slide, pageNum) {
  slide.addText(
    [
      { text: "CONFIDENTIAL", options: { color: TEXT_DIMMER } },
      { text: "  |  ", options: { color: TEXT_DIMMER } },
      { text: "Prepared for Executive Leadership", options: { color: TEXT_DIMMER } },
    ],
    { x: 0.4, y: 5.32, w: 6, h: 0.25, fontSize: 9, fontFace: "Calibri", margin: 0 }
  );
  if (pageNum !== null && pageNum !== undefined) {
    slide.addText(String(pageNum), {
      x: 9.4, y: 5.32, w: 0.3, h: 0.25,
      fontSize: 9, fontFace: "Calibri", color: TEXT_DIMMER,
      align: "right", margin: 0,
    });
  }
}

// Eyebrow (small, teal, wide-tracked all-caps) + big white title
function addEyebrowAndTitle(slide, eyebrow, title, opts = {}) {
  const titleY = opts.titleY ?? 0.55;
  const titleH = opts.titleH ?? 0.75;
  const titleW = opts.titleW ?? 9.2;
  slide.addText(eyebrow, {
    x: 0.4, y: 0.22, w: 9, h: 0.3,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: TEXT_MUTED, charSpacing: 6, margin: 0,
  });
  slide.addText(title, {
    x: 0.4, y: titleY, w: titleW, h: titleH,
    fontSize: 28, fontFace: "Calibri", bold: true,
    color: WHITE, margin: 0,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Build the deck
// ────────────────────────────────────────────────────────────────────────────
async function build() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";   // 10" × 5.625"
  pres.title = "Emerald Cloud Lab: The Case for Cloud-First R&D";
  pres.author = "Executive Leadership";

  // Pre-rasterize icons used across the deck
  const iconCommand  = await iconPng(FaLaptopCode,     "#" + TEAL, 256);
  const iconRun      = await iconPng(FaRobot,          "#" + TEAL, 256);
  const iconExplore  = await iconPng(FaProjectDiagram, "#" + TEAL, 256);
  const iconAnalyze  = await iconPng(FaChartLine,      "#" + TEAL, 256);
  const iconDollar   = await iconPng(FaDollarSign,     "#" + TEAL, 256);
  const iconFlex     = await iconPng(FaShareAlt,       "#" + TEAL, 256);
  const iconRepro    = await iconPng(FaFileAlt,        "#" + TEAL, 256);
  const iconAccess   = await iconPng(FaGlobe,          "#" + TEAL, 256);

  // ══════════════════════════════════════════════════════════════════════
  // SLIDE 1 — Title
  // ══════════════════════════════════════════════════════════════════════
  {
    const s = pres.addSlide();
    s.background = { color: BG_NAVY };
    // Top teal bar
    s.addShape(pres.shapes.RECTANGLE, {
      x: 0, y: 0, w: 10, h: 0.12,
      fill: { color: TEAL }, line: { type: "none" },
    });
    // Eyebrow
    s.addText("STRAT
```