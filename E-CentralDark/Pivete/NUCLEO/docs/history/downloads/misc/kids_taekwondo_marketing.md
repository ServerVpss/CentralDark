# OUTRO - kids_taekwondo_marketing.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\kids_taekwondo_marketing.js
**SHA:** d21d82af80b185c0
**Timestamp:** 2026-08-28T02:52:35.488557
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run: node build_taekwondo.js  ->  produces Taekwondo.pptx

### Ouro Bruto (primeiros 5000 chars)
```
// build_taekwondo.js
// Recreates "Kim's Taekwondo" presentation using pptxgenjs
// Run: node build_taekwondo.js  ->  produces Taekwondo.pptx

const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

// Slide size: 20" x 11.25" (custom widescreen)
pres.defineLayout({ name: "TKD", width: 20, height: 11.25 });
pres.layout = "TKD";
pres.title = "Kim's Taekwondo";

// ======== Color Palette ========
const NAVY_DARK   = "06132A"; // deep navy bg
const NAVY        = "0A1F3D"; // navy text/bg variant
const CREAM       = "F7EFD9"; // primary cream
const CREAM_2     = "FBF6E8"; // light cream bg
const GOLD        = "E5A93A"; // accent gold
const RED         = "D7392F"; // accent red
const BLUE        = "2A5DB0"; // accent blue (slide 2 third card)

// ======== Fonts ========
const F_HEAD = "Newsreader";        // serif headlines
const F_BODY = "Plus Jakarta Sans"; // sans-serif body

// ======== Image map (base64 data URIs) ========
const IMG = {
  image_1_1: "data:image/png;base64,PLACEHOLDER",
  image_10_1: "data:image/png;base64,PLACEHOLDER",
  image_10_2: "data:image/png;base64,PLACEHOLDER",
  image_10_3: "data:image/png;base64,PLACEHOLDER",
  image_10_4: "data:image/png;base64,PLACEHOLDER",
  image_2_1: "data:image/png;base64,PLACEHOLDER",
  image_2_2: "data:image/png;base64,PLACEHOLDER",
  image_2_3: "data:image/png;base64,PLACEHOLDER",
  image_3_1: "data:image/png;base64,PLACEHOLDER",
  image_4_1: "data:image/png;base64,PLACEHOLDER",
  image_4_2: "data:image/png;base64,PLACEHOLDER",
  image_5_1: "data:image/png;base64,PLACEHOLDER",
  image_5_2: "data:image/png;base64,PLACEHOLDER",
  image_5_3: "data:image/png;base64,PLACEHOLDER",
  image_5_4: "data:image/png;base64,PLACEHOLDER",
  image_5_5: "data:image/png;base64,PLACEHOLDER",
  image_5_6: "data:image/png;base64,PLACEHOLDER",
  image_5_7: "data:image/png;base64,PLACEHOLDER",
  image_6_1: "data:image/png;base64,PLACEHOLDER",
  image_6_2: "data:image/png;base64,PLACEHOLDER",
  image_6_3: "data:image/png;base64,PLACEHOLDER",
  image_6_4: "data:image/png;base64,PLACEHOLDER",
  image_7_1: "data:image/png;base64,PLACEHOLDER",
  image_8_1: "data:image/png;base64,PLACEHOLDER",
  image_8_2: "data:image/png;base64,PLACEHOLDER",
  image_8_3: "data:image/png;base64,PLACEHOLDER",
  image_8_4: "data:image/png;base64,PLACEHOLDER",
  image_9_1: "data:image/png;base64,PLACEHOLDER",
};

// =================================================================
// SLIDE 1 — Cover: Kick. Bow. Begin.
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: NAVY_DARK };

  // Korean trigram artwork (right side, partially off-canvas)
  s.addImage({ data: IMG.image_1_1, x: 8.33, y: -1.15, w: 13.54, h: 13.54 });

  // Logo block: gold square with "K" overlapping rotated
  s.addShape("rect", { x: 1.04, y: 0.94, w: 0.56, h: 0.56, fill: { color: GOLD }, line: { type: "none" }, rotate: 354 });
  s.addText([{ text: "K", options: { bold: true, italic: true, fontFace: F_HEAD, fontSize: 30, color: NAVY_DARK } }],
    { x: 1.04, y: 0.94, w: 0.65, h: 0.60, align: "center", valign: "middle", margin: 0 });

  // Brand wordmark — widened to fit on one line
  s.addText("KIM'S TAEKWONDO",
    { x: 1.79, y: 1.04, w: 5.00, h: 0.50, fontFace: F_BODY, fontSize: 19.5, bold: true, color: CREAM, valign: "middle", charSpacing: 4, margin: 0 });

  // Top-right meta — widened and pulled left
  s.addText("EST. 2026 · CHILDREN AGES 4–13",
    { x: 11.00, y: 1.06, w: 8.12, h: 0.45, fontFace: F_BODY, fontSize: 18, bold: true, color: GOLD, align: "right", valign: "middle", charSpacing: 3, margin: 0 });

  // Big serif headline stack
  s.addText("Kick.",  { x: 1.04, y: 2.75, w: 11.80, h: 2.01, fontFace: F_HEAD, fontSize: 165, bold: true,           color: CREAM, valign: "middle", margin: 0 });
  s.addText("Bow.",   { x: 1.04, y: 4.72, w: 11.80, h: 2.01, fontFace: F_HEAD, fontSize: 165, bold: true, italic:true, color: GOLD,  valign: "middle", margin: 0 });
  s.addText("Begin.", { x: 1.04, y: 6.69, w: 11.80, h: 2.01, fontFace: F_HEAD, fontSize: 165, bold: true,           color: CREAM, valign: "middle", margin: 0 });

  // Bottom CTA tag — widened
  s.addShape("rect", { x: 1.04, y: 9.70, w: 4.47, h: 0.93, fill: { color: GOLD }, line: { type: "none" } });
  s.addText("FIRST CLASS FREE",
    { x: 1.21, y: 9.93, w: 4.13, h: 0.51, fontFace: F_BODY, fontSize: 22, bold: true, color: NAVY_DARK, align: "center", valign: "middle", charSpacing: 4, margin: 0 });
  s.addText("Stop by — try a class this week.",
    { x: 5.78, y: 9.84, w: 7.00, h: 0.65, fontFace: F_BODY, fontSize: 21, color: CREAM, valign: "middle", margin: 0 });
}

// =================================================================
// SLIDE 2 — Three good reasons.
// =================================================================
{
  const s = pres.addSlide();
  s.background = { color: CREAM_2 };

  // Title
  s.addText([
    { text: "Three good ", options: { fontFace: F_HEAD, fontSize: 
```