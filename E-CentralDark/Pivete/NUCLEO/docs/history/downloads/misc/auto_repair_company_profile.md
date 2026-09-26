# OUTRO - auto_repair_company_profile.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\auto_repair_company_profile.js
**SHA:** e064a5a642c521ca
**Timestamp:** 2026-08-28T02:52:32.489734
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: npm install pptxgenjs && node generate_deck.js

### Ouro Bruto (primeiros 5000 chars)
```
// Brian's Auto Repair — Deck Replica
// Generated using pptxgenjs
// Run: npm install pptxgenjs && node generate_deck.js

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.author = "Brian's Auto Repair";
pres.title = "Brian's Auto Repair";

// Custom slide size: 20" x 11.25" (matches the original deck)
pres.defineLayout({ name: "CUSTOM_20x11", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11";

let slide;

// ===== Slide 1 =====
slide = pres.addSlide();
slide.background = { color: "141210" };
slide.addText([
  { text: "Brian's — est. 2018", options: { fontSize: 27.0, italic: true, fontFace: "Georgia", color: "F4EFE6" } }
], {
  x: 1.0417, y: 0.625, w: 3.291, h: 0.4688, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Georgia"
});
slide.addText([
  { text: "MIAMI BEACH, FL EUROPEAN MARQUES", options: { fontSize: 18.0, fontFace: "Consolas", color: "C7C3BB", charSpacing: 2.88 } }
], {
  x: 15.8266, y: 0.625, w: 3.1317, h: 0.8916, margin: 0, fit: "shrink", valign: "top", align: "right", lineSpacingMultiple: 1.7, fontFace: "Consolas"
});
slide.addText([
  { text: "Brian's ", options: { fontSize: 180.0, fontFace: "Georgia", color: "F4EFE6", charSpacing: -3.6 } },
  { text: "Auto ", options: { fontSize: 180.0, italic: true, fontFace: "Georgia", color: "C99560", charSpacing: -3.6 } },
  { text: "Repair.", options: { fontSize: 180.0, fontFace: "Georgia", color: "F4EFE6", charSpacing: -3.6 } }
], {
  x: 1.0417, y: 4.2021, w: 18.4542, h: 4.6416, margin: 0, fit: "shrink", valign: "top", align: "left", lineSpacingMultiple: 0.92, fontFace: "Georgia"
});
slide.addShape(pres.shapes.RECTANGLE, { x: 1.0417, y: 9.3021, w: 17.9167, h: 0.0104, fill: { color: "F4EFE6", transparency: 75 }, line: { type: "none" } });
slide.addText([
  { text: "COLLINS AVE · MIAMI BEACH", options: { fontSize: 18.0, fontFace: "Consolas", color: "D2CEC6", charSpacing: 3.6 } }
], {
  x: 1.0417, y: 9.7188, w: 5.1507, h: 0.3229, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Consolas"
});
slide.addText([
  { text: "European specialty since 2018", options: { fontSize: 25.5, italic: true, fontFace: "Georgia", color: "D2CEC6" } }
], {
  x: 14.1411, y: 9.6042, w: 4.9617, h: 0.4375, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Georgia"
});

// ===== Slide 2 =====
slide = pres.addSlide();
slide.background = { color: "F4EFE6" };
slide.addText([
  { text: "Brian's Auto Repair", options: { fontSize: 21.0, italic: true, fontFace: "Georgia", color: "161412" } }
], {
  x: 1.0417, y: 0.5625, w: 2.6844, h: 0.375, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Georgia"
});
slide.addText([
  { text: "01 / INTRODUCTION", options: { fontSize: 18.0, fontFace: "Consolas", color: "161412", charSpacing: 2.52 } }
], {
  x: 15.8128, y: 0.5885, w: 3.2399, h: 0.3229, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Consolas"
});
slide.addText([
  { text: "MIAMI BEACH · SINCE 2018", options: { fontSize: 18.0, fontFace: "Consolas", color: "96653A", charSpacing: 3.24 } }
], {
  x: 1.0417, y: 1.6667, w: 18.4542, h: 0.3229, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Consolas"
});
slide.addText([
  { text: "Eight years of ", options: { fontSize: 99.0, fontFace: "Georgia", color: "161412", charSpacing: -1.48 } },
  { text: "European ", options: { fontSize: 99.0, italic: true, fontFace: "Georgia", color: "96653A", charSpacing: -1.48 } },
  { text: "obsession.", options: { fontSize: 99.0, fontFace: "Georgia", color: "161412", charSpacing: -1.48 } }
], {
  x: 1.0417, y: 2.2812, w: 17.1667, h: 2.7917, margin: 0, fit: "shrink", valign: "top", align: "left", lineSpacingMultiple: 1.0, fontFace: "Georgia"
});
slide.addText([
  { text: "A Miami Beach shop built around one idea: that the cars engineered in Stuttgart, Coventry, and Munich deserve the same care on a humid Florida afternoon as they do in a European dealership.", options: { fontSize: 22.5, fontFace: "Calibri", color: "2B2622" } }
], {
  x: 1.0417, y: 6.1329, w: 8.7979, h: 1.9792, margin: 0, fit: "shrink", valign: "top", align: "left", lineSpacingMultiple: 1.55, fontFace: "Calibri"
});
slide.addText([
  { text: "We opened our bay doors in 2018. Eight years later, we are the independent shop of record for a small, particular clientele — and the technicians they trust with vehicles worth defending.", options: { fontSize: 22.5, fontFace: "Calibri", color: "2B2622" } }
], {
  x: 10.4167, y: 6.1329, w: 8.7979, h: 1.9792, margin: 0, fit: "shrink", valign: "top", align: "left", lineSpacingMultiple: 1.55, fontFace: "Calibri"
});

// ===== Slide 3 =====
slide = pres.addSlide();
slide.background = { color: "141210" };
slide.addText([
  { text: "Brian's Auto Repair", options: { fontSize: 21.0, italic: true, fontFace: "Georgia", color: "F4EFE6" } }
], {
  x: 1.0417, y: 0.5625, w: 2.6844, h: 0.375, margin: 0, fit: "shrink", valign: "top", align: "left", fontFace: "Georgia"
});
slide.addText([
  {
```