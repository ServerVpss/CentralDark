# MISSAO - photography_studio_portfolio.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\photography_studio_portfolio.js
**SHA:** 7e308fd56141cb6d
**Timestamp:** 2026-08-28T02:52:36.207492
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * Run:

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * build.js
 *
 * Recreates "Imagine Studios — Photography Portfolio · Volume IV" using pptxgenjs.
 *
 * Color scheme:
 *   - Slides 1, 5, 8: BLACK background with LIGHT BROWN text
 *   - Slides 2, 3, 4, 6, 7: LIGHT BROWN background with BLACK text
 *
 * Image strategy:
 *   - Each placement registers a sharp pre-crop to the EXACT target aspect
 *     ratio (centered cover crop), saved to ./tmp_cropped/.
 *   - The pre-cropped image is then placed at the target frame at full size,
 *     so pptxgenjs cannot stretch or distort it.
 *   - This avoids the stretching that came from forcing arbitrary w/h on
 *     addImage(), and is more reliable than pptxgenjs's `sizing: { type:'cover' }`
 *     which doesn't actually crop when used with `path:` images.
 *
 * Run:
 *   npm install pptxgenjs sharp
 *   node build.js
 */

const pptxgen = require("pptxgenjs");
const sharp   = require("sharp");
const fs      = require("fs");
const path    = require("path");

// ---------------------------------------------------------------------------
// Color palette
// ---------------------------------------------------------------------------
const BLACK    = "0E0E0E";
const BROWN    = "D9C2A7";
const BROWN_DK = "8C6F4F";
const BROWN_LT = "EBD9C2";
const DARK_SLIDES = new Set([1, 5, 8]);

function palette(slideNum) {
  if (DARK_SLIDES.has(slideNum)) {
    return { bg: BLACK, fg: BROWN, accent: BROWN_DK, deco: BROWN_LT };
  }
  return { bg: BROWN, fg: BLACK, accent: BROWN_DK, deco: BROWN_DK };
}

// ---------------------------------------------------------------------------
// Image pre-cropping
// ---------------------------------------------------------------------------
const IMG_DIR     = path.join(__dirname, "images");
const CROPPED_DIR = path.join(__dirname, "tmp_cropped");
if (!fs.existsSync(CROPPED_DIR)) fs.mkdirSync(CROPPED_DIR, { recursive: true });

const cropQueue = [];

function registerCrop(filename, targetRatio) {
  const stem = filename.replace(/\.[^.]+$/, "");
  const tag = "r" + Math.round(targetRatio * 1000);
  const out = path.join(CROPPED_DIR, `${stem}__${tag}.jpeg`);
  cropQueue.push({ src: path.join(IMG_DIR, filename), out, targetRatio });
  return out;
}

async function processCropQueue() {
  const seen = new Set();
  for (const job of cropQueue) {
    if (seen.has(job.out)) continue;
    seen.add(job.out);
    const meta = await sharp(job.src).metadata();
    const srcRatio = meta.width / meta.height;
    let cropW = meta.width;
    let cropH = meta.height;
    if (srcRatio > job.targetRatio) {
      cropW = Math.round(meta.height * job.targetRatio);
    } else if (srcRatio < job.targetRatio) {
      cropH = Math.round(meta.width / job.targetRatio);
    }
    const left = Math.round((meta.width  - cropW) / 2);
    const top  = Math.round((meta.height - cropH) / 2);
    await sharp(job.src)
      .extract({ left, top, width: cropW, height: cropH })
      .jpeg({ quality: 92 })
      .toFile(job.out);
  }
}

// ---------------------------------------------------------------------------
// Build the presentation
// ---------------------------------------------------------------------------
const pres = new pptxgen();
pres.defineLayout({ name: "PORTFOLIO_20x1125", width: 20, height: 11.25 });
pres.layout = "PORTFOLIO_20x1125";
pres.author = "Imagine Studios";
pres.title  = "Photography Portfolio · Volume IV";

const SERIF = "Cormorant Garamond";
const SANS  = "Inter";

function placeImage(slide, filename, x, y, w, h) {
  const ratio = w / h;
  const croppedPath = registerCrop(filename, ratio);
  slide.addImage({ path: croppedPath, x, y, w, h });
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------
function rule(slide, x, y, w, color, weight = 1.5) {
  slide.addShape(pres.shapes.LINE, {
    x, y, w, h: 0,
    line: { color, width: weight },
  });
}

function header(slide, leftLabel, rightLabel, fg, accent) {
  slide.addText(leftLabel, {
    x: 1, y: 0.55, w: 5, h: 0.4,
    fontFace: SANS, fontSize: 14, charSpacing: 4, bold: true, color: fg,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText(rightLabel, {
    x: 6, y: 0.55, w: 13, h: 0.4,
    fontFace: SANS, fontSize: 14, charSpacing: 4, color: fg,
    align: "left", valign: "middle", margin: 0,
  });
  rule(slide, 1, 1.05, 18, accent, 0.75);
}

function footer(slide, pageNum, label, fg, accent) {
  rule(slide, 1, 10.55, 18, accent, 0.75);
  slide.addText(pageNum, {
    x: 1, y: 10.65, w: 1, h: 0.4,
    fontFace: SANS, fontSize: 12, charSpacing: 3, color: fg,
    align: "left", valign: "middle", margin: 0,
  });
  slide.addText(label, {
    x: 17, y: 10.65, w: 2, h: 0.4,
    fontFace: SERIF, fontSize: 16, italic: true, color: fg,
    align: "right", valign: "middle", margin: 0,
  });
}

function chapterMark(slide, numeral, color) {
  slide.addText(numeral, {
    x: 6.0, y: 1.4, w: 3.5, h: 1.3,
    fontFace: SERIF
```