# OUTRO - sports_sponsorship_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\sports_sponsorship_pitch_deck.js
**SHA:** 0f325c4a6b3762c8
**Timestamp:** 2026-08-28T02:52:37.425492
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- s3.addText("Key Principle: Augusta National controls every aspect of its brand. No outside retail. No third-party licensing. No exceptions.", {

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const { FaGolfBall } = require("react-icons/fa");
  const iconGolfBall = await iconToBase64Png(FaGolfBall, "#FFFFFF", 256);
  const iconGolfBallGold = await iconToBase64Png(FaGolfBall, "#C9A84C", 256);

  const DG = "0C3823";
  const MG = "006747";
  const GOLD = "C9A84C";
  const CREAM = "F5F0E8";
  const OW = "FDFBF7";
  const CH = "1A1A1A";
  const LG = "D4CFC4"; // light gold/tan for hairlines

  // Helpers — fresh object factories to avoid pptxgenjs mutation bug
  const hairline = (x, y, w) => ({ x, y, w, h: 0, line: { color: GOLD, width: 0.75 } });
  const thinRule = (x, y, w) => ({ x, y, w, h: 0, line: { color: LG, width: 0.5 } });

  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "Augusta National Golf Club";
  pres.title = "Pro Shop Partnership Opportunities: Inaugural Pilot Program";

  // ─── SLIDE 1 — TITLE ───
  let s1 = pres.addSlide();
  s1.background = { color: DG };
  s1.addShape(pres.shapes.LINE, hairline(0, 0.03, 10));
  s1.addImage({ data: iconGolfBall, x: 4.6, y: 0.55, w: 0.8, h: 0.8 });
  s1.addText("NOW ON THE TEE:\nYOUR BRAND AT\nAUGUSTA NATIONAL", {
    x: 0.8, y: 1.5, w: 8.4, h: 2.4,
    fontSize: 38, fontFace: "Trebuchet MS", color: "FFFFFF",
    bold: true, align: "center", lineSpacingMultiple: 1.15, charSpacing: 2
  });
  s1.addShape(pres.shapes.LINE, { x: 3.8, y: 4.1, w: 2.4, h: 0, line: { color: GOLD, width: 0.75 } });
  s1.addText("Inaugural Pilot Program  •  Augusta National Golf Club", {
    x: 1, y: 4.25, w: 8, h: 0.4,
    fontSize: 13, fontFace: "Calibri", color: GOLD, align: "center", charSpacing: 1.5
  });
  s1.addText("CONFIDENTIAL: FOR PROSPECTIVE PARTNERS ONLY", {
    x: 1, y: 5.05, w: 8, h: 0.3,
    fontSize: 8, fontFace: "Calibri", color: "5A7F6A", align: "center", charSpacing: 3
  });
  s1.addShape(pres.shapes.LINE, { x: 0, y: 5.595, w: 10, h: 0, line: { color: GOLD, width: 0.75 } });


  // ─── SLIDE 2 — GOLF'S MOST PRESTIGIOUS EVENT ───
  let s2 = pres.addSlide();
  s2.background = { color: OW };
  // Eyebrow
  s2.addText("THE MASTERS TOURNAMENT", {
    x: 0.8, y: 0.45, w: 8, h: 0.3,
    fontSize: 9, fontFace: "Calibri", color: GOLD, charSpacing: 4, bold: true, margin: 0
  });
  s2.addText("Golf's Most Prestigious Event Reaches 19.5 Million Viewers", {
    x: 0.8, y: 0.85, w: 8.4, h: 0.5,
    fontSize: 18, fontFace: "Trebuchet MS", color: DG, bold: true, margin: 0
  });
  s2.addShape(pres.shapes.LINE, { x: 0.8, y: 1.45, w: 2, h: 0, line: { color: GOLD, width: 0.75 } });
  // Body
  s2.addText("The Masters Tournament is the first of golf's four major championships, held annually at Augusta National Golf Club in Augusta, Georgia. Founded in 1934 by Bobby Jones and Clifford Roberts, it has grown into one of the most prestigious and exclusive sporting events in the world, and the most coveted retail destination in professional sports.", {
    x: 0.8, y: 1.65, w: 8.4, h: 1.0,
    fontSize: 12, fontFace: "Calibri", color: "444444", lineSpacingMultiple: 1.6, margin: 0
  });
  // Three stats — just big numbers, no boxes
  const s2stats = [
    { num: "90 Yrs", unit: "", label: "of tradition" },
    { num: "19.5M", unit: "", label: "peak TV viewers, 2025 final round" },
    { num: "~$70M", unit: "", label: "estimated merchandise revenue per week" },
  ];
  s2stats.forEach((s, i) => {
    const x = 0.8 + (i * 3.0);
    s2.addText(s.num, {
      x, y: 3.55, w: 2.6, h: 0.6,
      fontSize: 32, fontFace: "Trebuchet MS", color: DG, bold: true, margin: 0
    });
    s2.addText(s.label, {
      x, y: 4.15, w: 2.6, h: 0.4,
      fontSize: 10, fontFace: "Calibri", color: "888888", margin: 0
    });
  });
  // Light rule above stats
  s2.addShape(pres.shapes.LINE, { x: 0.8, y: 3.4, w: 8.4, h: 0, line: { color: LG, width: 0.5 } });
  // Bottom info row
  s2.addShape(pres.shapes.LINE, { x: 0.8, y: 4.7, w: 8.4, h: 0, line: { color: LG, width: 0.5 } });
  s2.addText("Broadcast: CBS, Paramount+, 200+ countries     |     Sponsors: IBM, AT&T, Rolex, Mercedes-Benz, Delta     |     2025 Purse: $21M", {
    x: 0.8, y: 4.85, w: 8.4, h: 0.35,
    fontSize: 9, fontFace: "Calibri", color: "999999", margin: 0
  });


  // ─── SLIDE 3 — MERCH HISTORY 1/3 ───
  let s3 = pres.addSlide();
  s3.background = { color: OW };
  s3.addText("THE HISTORY OF MASTERS MERCHANDISE   01 / 03", {
    x: 0.8, y: 0.45, w: 8.4, h: 0.3,
    fontSize: 9, fontFace: "Calibri"
```