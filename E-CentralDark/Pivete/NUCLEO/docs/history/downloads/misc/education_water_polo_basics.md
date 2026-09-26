# OUTRO - education_water_polo_basics.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\education_water_polo_basics.js
**SHA:** e2902beb27e71ec7
**Timestamp:** 2026-08-28T02:52:34.134177
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:    node build_water_polo.js

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Water_Polo.pptx replica — built with pptxgenjs
 *
 * Layout: 20" x 11.25" custom (matches original 18288000 x 10287000 EMU)
 * Fonts : Arial throughout
 *
 * Palette:
 *   Navy deep   0A2540  (slide 2,5,7 bg)
 *   Navy darker 061A30  (slide 3 bg)
 *   Navy mid    144B7A  (slide 1,8 bg)
 *   Off-white   F5FBFD  (slide 4,6 bg / primary light text)
 *   Teal accent 00D4C4
 *   Cyan accent 4FD8EB
 *
 * Media: 16 decorative PNGs are read from ./media/ and embedded.
 *
 * Run:    node build_water_polo.js
 * Output: Water_Polo.pptx
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const MEDIA_DIR = path.join(__dirname, "media");

// ---------- helpers ----------------------------------------------------------

/** Load media/<file> and return a base64 data URI for pptxgenjs. */
function img(file) {
  const buf = fs.readFileSync(path.join(MEDIA_DIR, file));
  return "image/png;base64," + buf.toString("base64");
}

/** Convert an OOXML %-alpha (e.g. 65) to pptxgenjs transparency (0-100). */
const trans = (alphaPct) => 100 - alphaPct;

// Colors -----------------------------------------------------------------------
const C = {
  navyDeep:   "0A2540",
  navyDark:   "061A30",
  navyMid:    "144B7A",
  offWhite:   "F5FBFD",
  teal:       "00D4C4",
  cyan:       "4FD8EB",
};

const FONT = "Arial";

// ---------- presentation setup ----------------------------------------------

const pres = new pptxgen();
pres.defineLayout({ name: "CUSTOM_20x11_25", width: 20, height: 11.25 });
pres.layout = "CUSTOM_20x11_25";
pres.title = "Water Polo 101";
pres.author = "Your Name";

// Fresh shadow factory (pptxgenjs mutates shadow objects in place)
const cardShadow = () => ({
  type: "outer", color: "000000", opacity: 0.18, blur: 8, offset: 3, angle: 90,
});

// =============================================================================
// SLIDE 1 — Title
// =============================================================================
{
  const s = pres.addSlide();
  s.background = { color: C.navyMid };

  // Decorative ball (top-right, off slide)
  s.addImage({
    data: img("image-1-1.png"),
    x: 15.0, y: -1.458, w: 6.458, h: 6.458,
    transparency: 5,   // alphaModFix 95000 -> 5% transparent
  });

  // Decorative concentric circles (bottom-left, off slide)
  s.addImage({
    data: img("image-1-2.png"),
    x: -2.291, y: 6.25, w: 9.375, h: 9.375,
    transparency: 50,
  });

  // Top eyebrow
  s.addText("HOMEROOM · A SPORT WORTH KNOWING", {
    x: 1.0417, y: 1.4583, w: 16.874, h: 0.325,
    fontFace: FONT, fontSize: 18, color: C.cyan, charSpacing: 5,
    margin: 0, align: "left",
  });

  // Main title — "WATER POLO" / "101." (stacked two lines)
  s.addText([
    { text: "WATER POLO",
      options: { bold: true, color: C.offWhite, fontSize: 172, fontFace: FONT, charSpacing: -7, breakLine: true } },
    { text: "101.",
      options: { italic: true, color: C.teal,     fontSize: 172, fontFace: FONT, charSpacing: -7 } },
  ], {
    x: 1.0417, y: 2.358, w: 17.5, h: 5.822,
    margin: 0, valign: "top", align: "left", paraSpaceAfter: 0,
  });

  // Bottom-left credit line
  s.addText([
    { text: "PRESENTED BY ",      options: { color: C.offWhite, transparency: trans(65), fontSize: 18, fontFace: FONT, charSpacing: 4 } },
    { text: "YOUR NAME ",         options: { color: C.offWhite,                          fontSize: 18, fontFace: FONT, charSpacing: 4 } },
    { text: "PERIOD 2 · HOMEROOM",options: { color: C.offWhite, transparency: trans(65), fontSize: 18, fontFace: FONT, charSpacing: 4 } },
  ], {
    x: 1.0417, y: 9.296, w: 12.0, h: 0.55,
    margin: 0, align: "left", valign: "top",
  });

  // Bottom-right tagline
  s.addText([
    { text: "EIGHT SLIDES ",      options: { color: C.offWhite,                          fontSize: 18, fontFace: FONT, charSpacing: 4 } },
    { text: "ZERO YAWNS PROMISED",options: { color: C.offWhite, transparency: trans(65), fontSize: 18, fontFace: FONT, charSpacing: 4 } },
  ], {
    x: 11.0, y: 9.296, w: 7.958, h: 0.55,
    margin: 0, align: "right", valign: "top",
  });
}

// =============================================================================
// reusable content-slide chrome (top + bottom labels)
// =============================================================================
function addChrome(s, slideNum, topicUpper, darkLabelBase /* true => dark bg => light label color */) {
  const labelColor = darkLabelBase ? C.offWhite : C.navyDeep;
  s.addText(`${String(slideNum).padStart(2, "0")} / 08`, {
    x: 1.0417, y: 0.625, w: 3.5, h: 0.325,
    fontFace: FONT, fontSize: 18, color: labelColor, transparency: trans(55),
    charSpacing: 3, margin: 0, align: "left",
  });
  s.addText(topicUpper, {
    x: 13.5, y: 0.625, w: 5.5, h: 0.325,
    fontFace: FONT, fontSize: 18, color: labelColor, transparency: trans(55),
    charSpacing: 3, margin: 0, align: "right",
  });
  // Bottom footer: "WATER POLO 101" left, page num right
  s.addText(
```