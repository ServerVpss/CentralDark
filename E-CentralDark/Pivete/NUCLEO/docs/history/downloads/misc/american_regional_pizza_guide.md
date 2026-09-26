# OUTRO - american_regional_pizza_guide.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\american_regional_pizza_guide.js
**SHA:** 369848a186b2c467
**Timestamp:** 2026-08-28T02:52:32.108584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node pizza.js   (requires `npm install pptxgenjs`)

### Ouro Bruto (primeiros 5000 chars)
```
// Pizza.pptx replica — pptxgenjs recreation
// Run: node pizza.js   (requires `npm install pptxgenjs`)

const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5 default — we override below
pres.defineLayout({ name: "PIZZA_20x11_25", width: 20, height: 11.25 });
pres.layout = "PIZZA_20x11_25";
pres.title = "American Regional Pizza";
pres.author = "A Field Guide";

// ---------- Palette ----------
const BG_CREAM   = "F2EADF";
const BG_TAN     = "EADFD0"; // Chicago slide
const BG_DARK    = "1A1714"; // New Haven slide
const INK        = "171412"; // main heading ink
const SUBINK     = "3A342E"; // eyebrow/footer ink
const MUTED      = "8A8077"; // tertiary labels / monospace numerals
const ACCENT     = "C8422A"; // red/terracotta accent (italics)
const RULE_DARK  = "171412";
const RULE_LIGHT = "D9CEBE"; // for dark slide
const CREAM_ON_DARK_TEXT = "F2EADF";
const CREAM_ON_DARK_SUB  = "A9A096";

// ---------- Fonts ----------
const HEAD = "Georgia";   // editorial serif for display/body
const SANS = "Arial";     // eyebrows, footers, captions
const MONO = "Consolas";  // index numerals (01, 02, …)

// ---------- Helpers ----------
// Build SVG -> data URI for pptxgenjs addImage({ data: ... })
function svgData(svg) {
  return "image/svg+xml;base64," + Buffer.from(svg).toString("base64");
}

// Horizontal rule
function hrule(slide, x, y, w, color = RULE_DARK) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.012,
    fill: { color }, line: { type: "none" }
  });
}

// Eyebrow (top-bar small caps) — Slide 1–8 share this header structure
function topBar(slide, leftText, rightText, inkColor = SUBINK) {
  slide.addText(leftText, {
    x: 1.04, y: 0.83, w: 10, h: 0.35,
    fontFace: SANS, fontSize: 12, color: inkColor,
    charSpacing: 3.2, bold: false, align: "left", valign: "middle", margin: 0,
  });
  slide.addText(rightText, {
    x: 9.04, y: 0.83, w: 10, h: 0.35,
    fontFace: SANS, fontSize: 12, color: inkColor,
    charSpacing: 3.2, align: "right", valign: "middle", margin: 0,
  });
}

// Bottom footer (brand left / page right)
function footer(slide, page, inkColor = SUBINK) {
  slide.addText("AMERICAN REGIONAL PIZZA" + (page === 8 ? " — FIN." : ""), {
    x: 1.04, y: 10.53, w: 10, h: 0.35,
    fontFace: SANS, fontSize: 12, color: inkColor,
    charSpacing: 3.96, align: "left", valign: "middle", margin: 0,
  });
  slide.addText(`0${page} / 08`, {
    x: 9.04, y: 10.53, w: 10, h: 0.35,
    fontFace: SANS, fontSize: 12, color: inkColor,
    charSpacing: 3.96, align: "right", valign: "middle", margin: 0,
  });
}

// City detail-row factory (CRUST / CHEESE / SIGNATURE block)
function cityFacts(slide, y, facts, labelColor = MUTED, valColor = INK) {
  const xs = [1.04, 4.24, 7.43];
  facts.forEach(([label, value], i) => {
    slide.addText(label, {
      x: xs[i], y, w: 2.95, h: 0.35,
      fontFace: SANS, fontSize: 12, color: labelColor,
      charSpacing: 3.6, align: "left", valign: "middle", margin: 0,
    });
    slide.addText(value, {
      x: xs[i], y: y + 0.41, w: 2.95, h: 0.7,
      fontFace: HEAD, fontSize: 14, color: valColor,
      align: "left", valign: "top", margin: 0,
    });
  });
}

// =========================================================
// PIZZA ILLUSTRATIONS — each returned as an SVG string
// =========================================================

// 1) Title-page "hero" pepperoni pie (slice removed, classic)
function svgHeroPizza() {
  // 1240×1240 viewBox
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1240">
  <g transform="translate(620,620)">
    <!-- crust rim -->
    <circle r="560" fill="#C8894A"/>
    <!-- cheese base -->
    <circle r="510" fill="#F2C96B"/>
    <!-- sauce peek / subtle overlay -->
    <circle r="510" fill="#E8A84A" opacity="0.15"/>
    <!-- missing slice: cut from 285° to 345° (top-right wedge) -->
    <path d="M0,0 L${Math.cos(Math.PI*1.583)*570},${Math.sin(Math.PI*1.583)*570}
             A570,570 0 0,1 ${Math.cos(Math.PI*1.916)*570},${Math.sin(Math.PI*1.916)*570} Z"
          fill="#F2EADF"/>
    <!-- pepperoni -->
    ${[
      [-220,-180,70],[-40,-280,65],[180,-200,68],[320,-40,60],
      [250,180,70],[60,280,66],[-180,260,60],[-320,100,68],
      [-330,-60,62],[-90,-60,58],[120,40,60],[-150,120,55]
    ].map(([cx,cy,r])=>`
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#B83A2C"/>
      <circle cx="${cx-r*0.15}" cy="${cy-r*0.15}" r="${r*0.82}" fill="#C8422A"/>
    `).join("")}
  </g>
</svg>`;
}

// 3) NY — wide thin round, sparse pepperoni, slice cut
function svgNYPizza() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 1440">
  <g transform="translate(720,720)">
    <circle r="660" fill="#D89A5A"/>
    <circle r="610" fill="#F2C96B"/>
    <!-- light sauce zones -->
    <circle r="560" fill="#E56A3A" opacity="0.18"/>
    <!-- slice cut lines (pizza wheel) -->
    ${[0,45,90,135].map(a=>{
      const rad = a*Math.PI/180;
      const x = Math.cos(rad
```