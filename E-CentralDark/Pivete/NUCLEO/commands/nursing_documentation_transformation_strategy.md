# COMANDO - nursing_documentation_transformation_strategy.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\nursing_documentation_transformation_strategy.js
**SHA:** db1ae31a92a0d114
**Timestamp:** 2026-08-28T02:52:36.046732
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- { risk: "Nurse Adoption\nResistance", likelihood: "High", impact: "High", mitigation: "Co-design with frontline nurses; 120 unit-level champions; incentive-linked adoption KPIs", residual: "Medium" },
- { risk: "AI Accuracy /\nPatient Safety", likelihood: "Medium", impact: "Critical", mitigation: "Mandatory nurse attestation; 99.5% accuracy threshold before scaling; continuous monitoring", residual: 
- { risk: "EHR Vendor\nDelays", likelihood: "Medium", impact: "Medium", mitigation: "Parallel vendor track (Epic + 3M); contractual SLAs with penalty clauses; internal build fallback", residual: "Low" }
- { risk: "Regulatory\nCompliance", likelihood: "Low", impact: "High", mitigation: "Joint Counsel & Compliance review; CMS/TJC pre-engagement; phased rollout with audit checkpoints", residual: "Low" },

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

const { FaCheckCircle } = require("react-icons/fa");

// ── MAYO CLINIC PALETTE ─────────────────────────────────────────────
const C = {
  navy:      "002B5C",
  blue:      "003DA5",
  blueLight: "1A5DBF",
  bluePale:  "D6E4F7",
  slate:     "4A6FA5",
  steel:     "7A96BF",
  ice:       "EBF0F7",
  white:     "FFFFFF",
  offWhite:  "F4F6FA",
  accent:    "C8982D",
  accentDk:  "A67C1A",
  accentLt:  "F5EDD4",
  text:      "1B2A4A",
  muted:     "6B7FA0",
  red:       "B8292F",
  green:     "1B7A4E",
  lightLine: "C8D3E2",
};

const FONT_TITLE = "Georgia";
const FONT_BODY  = "Calibri";

// ── ICON HELPER ─────────────────────────────────────────────────────
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// ── REUSABLE HELPERS ────────────────────────────────────────────────
const makeShadow = () => ({ type: "outer", blur: 4, offset: 1.5, angle: 135, color: "000000", opacity: 0.07 });

function addFooter(slide, num, total) {
  slide.addText(`${num} / ${total}`, { x: 8.8, y: 5.25, w: 0.8, h: 0.25, fontSize: 9, fontFace: FONT_BODY, color: C.muted, align: "right" });
  slide.addText("CONFIDENTIAL", { x: 0.5, y: 5.25, w: 1.5, h: 0.25, fontSize: 9, fontFace: FONT_BODY, color: C.muted, charSpacing: 2 });
  slide.addText("April 2026", { x: 4, y: 5.25, w: 2, h: 0.25, fontSize: 9, fontFace: FONT_BODY, color: C.muted, align: "center" });
}

function addActionTitle(slide, title) {
  slide.addText(title, {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 16, fontFace: FONT_BODY, color: C.navy, bold: true,
    valign: "top", margin: 0, lineSpacingMultiple: 1.15
  });
  slide.addShape("line", { x: 0.5, y: 1.0, w: 9, h: 0, line: { color: C.lightLine, width: 0.5 } });
}

function addCard(slide, x, y, w, h, fillColor) {
  slide.addShape("rect", { x, y, w, h, fill: { color: fillColor || C.white }, shadow: makeShadow() });
}

// ── MAIN ────────────────────────────────────────────────────────────
async function buildDeck() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Chief Nursing Officer, Mayo Clinic";
  pres.title = "Nursing Documentation Transformation";
  const TOTAL = 12;

  const checkIcon = await iconToBase64Png(FaCheckCircle, `#${C.blue}`);

  // ================================================================
  // SLIDE 1 — Title
  // ================================================================
  let s1 = pres.addSlide();
  s1.background = { color: C.navy };
  s1.addShape("rect", { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.accent } });
  s1.addText("MAYO CLINIC", { x: 0.5, y: 1.15, w: 9, h: 0.45, fontSize: 14, fontFace: FONT_BODY, color: C.accent, charSpacing: 5, align: "center", margin: 0 });
  s1.addText("Transforming Nursing\nDocumentation", {
    x: 0.5, y: 2.0, w: 9, h: 1.6,
    fontSize: 38, fontFace: FONT_TITLE, color: C.white, bold: true, lineSpacingMultiple: 1.1, align: "center", margin: 0
  });
  s1.addText("An Enterprise Strategy to Reclaim the Bedside,\nReduce Burnout, and Elevate Quality", {
    x: 0.5, y: 3.7, w: 9, h: 0.8,
    fontSize: 15, fontFace: FONT_BODY, color: C.steel, italic: true, lineSpacingMultiple: 1.3, align: "center", margin: 0
  });
  s1.addText("C-Suite Executive Session  |  April 2026", {
    x: 0.5, y: 4.8, w: 9, h: 0.3, fontSize: 10, fontFace: FONT_BODY, color: C.muted, align: "center", margin: 0
  });
  s1.addShape("rect", { x: 0, y: 5.585, w: 10, h: 0.04, fill: { color: C.accent } });
  s1.addText("CONFIDENTIAL", { x: 0.5, y: 5.25, w: 9, h: 0.25, fontSize: 9, fontFace: FONT_BODY, color: C.steel, charSpacing: 2, align: "center" });

  // ================================================================
  // SLIDE 2 — Executive Summary (SCQA)
  // ================================================================
  let s2 = pres.addSlide();
  s2.background = { color: C.offWhite };
  addActionTitle(s2, "Executive Summary: Documentation burden costs Mayo $22M/year and drives 34% turnover intent — a targeted 18-month transformation will recover 60+ min/nurse/shift");
  addFooter(s2, 2, TOTAL);

  const scqaData = [
    { label: "SITUATION", color: C.blue, text: "Mayo employs 14,000+ nurses across 92 care units. EHR documentation is the single largest non-clinical activity, consuming an average of 4.8 hours of every 12-hour shift." },
    { label: "COMPLICATION", color: C.red, text: "Documentation burden has reached a tipping point: burnout intent-to-leave is at 34%, near-miss events linked to documentation gaps ro
```