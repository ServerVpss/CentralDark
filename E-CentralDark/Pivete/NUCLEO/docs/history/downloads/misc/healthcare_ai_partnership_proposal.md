# OUTRO - healthcare_ai_partnership_proposal.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\healthcare_ai_partnership_proposal.js
**SHA:** c696bd82aa1eaf9d
**Timestamp:** 2026-08-28T02:52:35.044260
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const dotGap = 0.16;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");

async function main() {
  const BLK = "1A1A1A", WHT = "FFFFFF", RED = "E63228", GRY = "6B7280", LTGRY = "9CA3AF", TXT = "1F2937", BDR = "E5E7EB", ALT = "F9FAFB";

  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Abridge";
  pres.title = "Abridge + Houston Methodist";

  function addFooter(slide) {
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.25, w: 10, h: 0.375, fill: { color: RED } });
    slide.addText("Best in KLAS 2025 & 2026  •  Epic's First Pal Partner  •  #1 Most Innovative, Fast Company  •  Forbes AI 50", { x: 0.5, y: 5.25, w: 9, h: 0.375, fontSize: 9, fontFace: "Trebuchet MS", color: WHT, bold: true, align: "center", valign: "middle", margin: 0 });
  }
  function whiteSlide(slide, title) {
    slide.background = { color: WHT };
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: RED } });
    slide.addText(title, { x: 0.8, y: 0.3, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Trebuchet MS", color: BLK, bold: true, margin: 0 });
    slide.addText("ABRIDGE", { x: 8.2, y: 0.1, w: 1.4, h: 0.25, fontSize: 7, fontFace: "Trebuchet MS", color: BLK, bold: true, charSpacing: 3, margin: 0, align: "right" });
  }

  // ===== SLIDE 1 =====
  let s1 = pres.addSlide();
  s1.background = { color: WHT };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: RED } });

  s1.addText("ABRIDGE", { x: 0, y: 1.6, w: 10, h: 0.4, fontSize: 14, fontFace: "Trebuchet MS", color: RED, bold: true, charSpacing: 8, margin: 0, align: "center" });
  s1.addText("Enterprise Ambient AI\nPartnership Proposal", { x: 0, y: 2.0, w: 10, h: 1.0, fontSize: 30, fontFace: "Trebuchet MS", color: BLK, bold: true, lineSpacingMultiple: 1.1, margin: 0, align: "center" });
  s1.addText("Houston Methodist Health System", { x: 0, y: 3.1, w: 10, h: 0.45, fontSize: 18, fontFace: "Calibri", color: GRY, margin: 0, align: "center" });
  s1.addText("April 2026", { x: 0, y: 3.6, w: 10, h: 0.35, fontSize: 12, fontFace: "Calibri", color: LTGRY, margin: 0, align: "center" });
  addFooter(s1);

  // ===== SLIDE 2 =====
  let s2 = pres.addSlide();
  whiteSlide(s2, "Executive Summary");
  s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0.9, w: 10, h: 0.65, fill: { color: BLK } });
  s2.addText("Abridge proposes an enterprise-wide ambient AI partnership to transform clinical documentation, reduce burnout, and optimize revenue capture across Houston Methodist's 8 hospitals, 150+ outpatient locations, and 6,000+ clinicians.", { x: 0.8, y: 0.9, w: 8.4, h: 0.65, fontSize: 11.5, fontFace: "Calibri", color: WHT, margin: 0, valign: "middle" });
  const execStats = [{ big: "#1", sub: "Best in KLAS\n2025 & 2026" }, { big: "250+", sub: "Health Systems\nLive" }, { big: "80M+", sub: "Conversations\nPer Year" }, { big: "55+", sub: "Specialties\nSupported" }];
  execStats.forEach((e, i) => {
    const cx = 0.5 + i * 2.35;
    s2.addText(e.big, { x: cx, y: 2.0, w: 2.15, h: 0.6, fontSize: 36, fontFace: "Trebuchet MS", color: RED, bold: true, align: "center", valign: "middle", margin: 0 });
    s2.addText(e.sub, { x: cx, y: 2.65, w: 2.15, h: 0.5, fontSize: 10, fontFace: "Calibri", color: GRY, align: "center", valign: "top", margin: 0 });
  });
  s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 3.35, w: 8.4, h: 0.01, fill: { color: BDR } });
  const props = [{ t: "Industry Leader", d: "Trusted by Mayo, Johns Hopkins, Duke, Kaiser, and Northwell" }, { t: "Deepest Epic Integration", d: "Epic's first Pal partner with native EHR workflows" }, { t: "Proven Outcomes", d: "JAMA: 13.9% burnout reduction in 30 days" }, { t: "Revenue Impact", d: "Smart billing, prior auth automation, coding accuracy" }];
  props.forEach((p, i) => {
    const cx = 0.5 + i * 2.35;
    s2.addText(p.t, { x: cx, y: 3.55, w: 2.15, h: 0.3, fontSize: 11, fontFace: "Trebuchet MS", color: BLK, bold: true, align: "center", margin: 0 });
    s2.addText(p.d, { x: cx, y: 3.9, w: 2.15, h: 0.6, fontSize: 9.5, fontFace: "Calibri", color: TXT, align: "center", margin: 0 });
  });
  for (let i = 1; i < 4; i++) s2.addShape(pres.shapes.RECTANGLE, { x: 0.5 + i * 2.35 - 0.1, y: 2.0, w: 0.01, h: 2.4, fill: { color: BDR } });
  addFooter(s2);

  // ===== SLIDE 3: THE DOCUMENTATION CHALLENGE — dramatic stat showcase =====
  let s3 = pres.addSlide();
  whiteSlide(s3, "The Documentation Challenge");

  // One massive hero stat dominates the slide
  s3.addText("51.9%", { x: 0, y: 1.0, w: 10, h: 1.2, fontSize: 88, fontFace: "Trebuchet MS", color: RED, bold: true, align: "center", valign: "middle", margin: 0 });
  s3.addText("of physicians report burnout — and documentation is the #1 cause.", { x: 1.5, y: 2.2, w: 7.0, h: 0.4, fontSize: 14, fontFace: "Calibri", color: TXT, align: "center", margin: 0 });

  // Supporting stats as a horizontal strip — shifted down ~5%
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 3.15, w: 10, h: 1.05, fill: { color: BLK } });
  const supportStats = [
    { n: "4,000+", l: "click
```