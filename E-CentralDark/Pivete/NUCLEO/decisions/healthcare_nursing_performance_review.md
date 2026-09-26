# DECISAO - healthcare_nursing_performance_review.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\healthcare_nursing_performance_review.js
**SHA:** 3253eddf9840dfa2
**Timestamp:** 2026-08-28T02:52:34.926180
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const kW = 1.72, kGap = 0.1, kSX = (10 - (5 * kW + 4 * kGap)) / 2;
- const rX = 6.85, rW = 2.85, mod1H = 1.65, modGap = 0.15, mod2H = CH - mod1H - modGap;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");

function renderIconSvg(IC, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(IC, { color, size: String(size) }));
}
async function iconPng(IC, color, sz = 256) {
  return "image/png;base64," + (await sharp(Buffer.from(renderIconSvg(IC, color, sz))).png().toBuffer()).toString("base64");
}
function b64(p, m) { return `${m};base64,${fs.readFileSync(p).toString("base64")}`; }

async function buildDeck() {
  const { FaHospital, FaExclamationTriangle, FaPills, FaUsers, FaClipboardCheck } = require("react-icons/fa");
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Nursing Administration";
  pres.title = "Q1 2026 Nursing Performance Review";

  const C = {
    navy: "0F2B3C", teal: "0D7377", tealLight: "14A3A8", mint: "A7E8D0",
    white: "FFFFFF", offWhite: "F4F7F6", lightGray: "E8EDED",
    gray: "6B7F82", dkGray: "4A5C60", darkText: "1A2E35",
    red: "D94452", amber: "E8A838", green: "2D9B6E", coral: "E07A5F",
  };
  const F = "Calibri";
  const shadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.08 });

  // Real hospital photo
  const hospitalPhoto = b64("/home/assets/hospital_real.jpg", "image/jpeg");
  const logoSmall = b64("/home/assets/sutter_logo_white.png", "image/png");
  const logoBig = b64("/home/assets/sutter_logo_big.png", "image/png");

  const TX = 0.5, TY = 0.38, TW = 9, TH = 0.35;
  const LBL_Y = 0.2, BODY_Y = 0.85, FTR_Y = 5.25, FTR_H = 0.375;
  const CH = FTR_Y - 0.25 - BODY_Y;

  function addFooter(sl, n, src) {
    sl.addShape(pres.shapes.RECTANGLE, { x: 0, y: FTR_Y, w: 10, h: FTR_H, fill: { color: C.navy } });
    sl.addImage({ data: logoSmall, x: 0.35, y: FTR_Y + (FTR_H - 0.18) / 2, w: 1.2, h: 0.18 });
    sl.addText(src || "Nursing Department  |  Confidential", { x: 1.7, y: FTR_Y, w: 7.0, h: FTR_H, fontSize: 7, fontFace: F, color: C.white, valign: "middle", align: "center", margin: 0, italic: !!src });
    sl.addText(`${n} / 10`, { x: 9, y: FTR_Y, w: 0.7, h: FTR_H, fontSize: 7, fontFace: F, color: C.white, align: "right", valign: "middle", margin: 0 });
  }
  function addLabel(sl, t) { sl.addText(t, { x: TX, y: LBL_Y, w: TW, h: 0.18, fontSize: 9, fontFace: F, color: C.teal, charSpacing: 3, bold: true, margin: 0 }); }
  function addTitle(sl, t) { sl.addText(t, { x: TX, y: TY, w: TW, h: TH, fontSize: 14, fontFace: F, color: C.darkText, bold: true, margin: 0, valign: "middle" }); }

  // ══════════════════════════════════════════════
  // SLIDE 1 — TITLE (real photo, single big logo)
  // ══════════════════════════════════════════════
  let s1 = pres.addSlide();
  s1.background = { color: C.navy };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: C.teal } });

  // Real hospital photo — fills entire right side
  s1.addImage({ data: hospitalPhoto, x: 5, y: 0, w: 5, h: 5.625, sizing: { type: "cover", w: 5, h: 5.625 } });
  s1.addShape(pres.shapes.RECTANGLE, { x: 5, y: 0, w: 5, h: 5.625, fill: { color: C.navy, transparency: 35 } });

  s1.addText("Q1 2026\nNursing Performance Review", { x: 0.55, y: 1.3, w: 4.2, h: 1.5, fontSize: 30, fontFace: F, color: C.white, bold: true, lineSpacingMultiple: 1.15, margin: 0 });
  s1.addShape(pres.shapes.RECTANGLE, { x: 0.55, y: 3.0, w: 3.6, h: 0.03, fill: { color: C.teal } });
  s1.addText("Presented to the Director of Nursing  |  April 14, 2026", { x: 0.55, y: 3.2, w: 4.2, h: 0.25, fontSize: 11, fontFace: F, color: C.gray, margin: 0 });
  s1.addText("Reporting Period: January – March 2026", { x: 0.55, y: 3.5, w: 4.2, h: 0.22, fontSize: 10, fontFace: F, color: C.gray, margin: 0 });

  // Hospital icon + label at bottom-left (moved from top)
  const hospIco = await iconPng(FaHospital, "#14A3A8", 256);
  s1.addImage({ data: hospIco, x: 0.55, y: 4.45, w: 0.5, h: 0.5 });
  s1.addText("SUTTER HEALTH ROSEVILLE", { x: 1.2, y: 4.47, w: 3.8, h: 0.45, fontSize: 12, fontFace: F, color: C.tealLight, charSpacing: 3, valign: "middle", margin: 0 });

  // ══════════════════════════════════════════════
  // SLIDE 2 — EXEC SUMMARY (% on ALL cards)
  // ══════════════════════════════════════════════
  let s2 = pres.addSlide();
  s2.background = { color: C.offWhite };
  addFooter(s2, 2, "Sources: Epic EHR, Kronos Workforce, NHSN  |  All comparisons vs. Q4 2025");
  addLabel(s2, "EXECUTIVE SUMMARY");
  addTitle(s2, "Q1 exceeded 4 of 5 KPI targets; nurse turnover is the sole area requiring Q2 intervention.");

  // ALL cards now have % sign
  const kpis = [
    { metric: "Fall Rate", val: "2.1%", unit: "per 1K pt-days", vs: "▼ 18% QoQ", target: "Target: < 3.0%", status: "green" },
    { metric: "Med Errors", val: "0.8%", unit: "of admin.", vs: "▼ 0.3pp QoQ", target: "Target: < 1.0%", status: "green" },
    { metric: "Readmission", val: "11.2%", unit: "30-day", 
```