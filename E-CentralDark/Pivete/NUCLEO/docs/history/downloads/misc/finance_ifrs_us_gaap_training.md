# OUTRO - finance_ifrs_us_gaap_training.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\finance_ifrs_us_gaap_training.js
**SHA:** b4cf9f019922eb95
**Timestamp:** 2026-08-28T02:52:34.298408
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = p.runs[0];
- const run = para.runs[0] || { text: "" };

### Ouro Bruto (primeiros 5000 chars)
```
// recreate.js
// Recreates the IFRS vs US GAAP deck from slides_full.json (parsed from original PPTX).
// Usage: node recreate.js [output.pptx] [slides_full.json]

const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const JSON_PATH = process.argv[3] || path.join(__dirname, "slides_full.json");
const OUT_PATH = process.argv[2] || path.join(__dirname, "recreated.pptx");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

// ---------------------------------------------------------------------------
// Map OOXML run properties to pptxgenjs text-option objects.
// Units: sz is hundredths of a point (1500 -> 15pt); spc is hundredths of a
// point character spacing; color is 6-char hex (no '#').
// ---------------------------------------------------------------------------
function runToTextOpts(run) {
  const opts = {};
  if (run.text !== undefined) opts.text = run.text;
  if (run.sz) opts.options = Object.assign(opts.options || {}, { fontSize: run.sz / 100 });
  if (run.b) opts.options = Object.assign(opts.options || {}, { bold: true });
  if (run.i) opts.options = Object.assign(opts.options || {}, { italic: true });
  if (run.color) opts.options = Object.assign(opts.options || {}, { color: run.color });
  if (run.font) opts.options = Object.assign(opts.options || {}, { fontFace: run.font });
  if (run.spc) opts.options = Object.assign(opts.options || {}, { charSpacing: run.spc / 100 });
  return opts;
}

// PPTXgenJS paragraph-level alignment map.
const ALIGN_MAP = { l: "left", ctr: "center", r: "right" };
const ANCHOR_MAP = { t: "top", ctr: "middle", b: "bottom" };

// ---------------------------------------------------------------------------
// Convert a list of parsed paragraphs into a pptxgenjs rich-text array.
// Each paragraph becomes one (or more) runs; breakLine: true separates them.
//
// Bullets: the original uses Wingdings char 'v' (renders as ❖). pptxgenjs
// bullet code uses the surrounding font, so we substitute the equivalent
// Unicode glyph U+2756 (❖) as a literal prefix + manual indent. This matches
// the visual exactly without needing Wingdings installed.
// ---------------------------------------------------------------------------
const WINGDINGS_TO_UNICODE = {
  "v": "\u2756", // BLACK DIAMOND MINUS WHITE X  (same glyph as Wingdings v)
};

function paragraphsToRichText(paragraphs) {
  const out = [];
  paragraphs.forEach((p, idx) => {
    const runs = p.runs && p.runs.length ? p.runs : [{ text: "" }];
    runs.forEach((run, rIdx) => {
      const item = { text: run.text || "", options: {} };
      if (run.sz) item.options.fontSize = run.sz / 100;
      if (run.b) item.options.bold = true;
      if (run.i) item.options.italic = true;
      if (run.color) item.options.color = run.color;
      if (run.font) item.options.fontFace = run.font;
      if (run.spc) item.options.charSpacing = run.spc / 100;
      if (p.align && ALIGN_MAP[p.align]) item.options.align = ALIGN_MAP[p.align];
      if (p.bullet) {
        const glyph = WINGDINGS_TO_UNICODE[p.bullet] || p.bullet;
        item.options.bullet = { code: glyph.charCodeAt(0).toString(16).padStart(4, "0").toUpperCase() };
        item.options.indentLevel = 0;
      }
      if (p.spcAft !== undefined) item.options.paraSpaceAfter = p.spcAft / 100;
      if (p.spcBef !== undefined) item.options.paraSpaceBefore = p.spcBef / 100;
      // breakLine on last run of paragraph, except the very last paragraph.
      const isLastRunInPara = rIdx === runs.length - 1;
      const isLastPara = idx === paragraphs.length - 1;
      if (isLastRunInPara && !isLastPara) item.options.breakLine = true;
      out.push(item);
    });
  });
  return out;
}

// Simpler path: if the text box has exactly one paragraph with one run and
// no bullet, we can just pass a plain string with flat options.
function addShape(slide, el) {
  const hasText = el.paragraphs && el.paragraphs.some(p => p.runs && p.runs.length);
  const isSolidFill = !!el.fill;

  // Pure rectangle (rule line, vertical bar, etc) - no text.
  if (isSolidFill && !hasText) {
    slide.addShape("rect", {
      x: el.x, y: el.y, w: el.w, h: el.h,
      fill: { color: el.fill },
      line: { color: el.fill, width: 1 },
    });
    return;
  }

  // Text box (possibly with fill).
  if (hasText) {
    const textOpts = {
      x: el.x, y: el.y, w: el.w, h: el.h,
      margin: 0,
      valign: el.anchor && ANCHOR_MAP[el.anchor] ? ANCHOR_MAP[el.anchor] : "top",
      wrap: true,
    };
    if (el.fill) textOpts.fill = { color: el.fill };

    // Single-paragraph, single-run, no-bullet fast path.
    if (el.paragraphs.length === 1 && el.paragraphs[0].runs.length === 1 &&
        !el.paragraphs[0].bullet) {
      const p = el.paragraphs[0];
      const run = p.runs[0];
      if (run.sz) textOpts.fontSize = run.sz / 100;
      if (run.b) textOpts.bold = true;
      if (run.i) textOpts.italic = true;
      if (run.color) textOpts.color = run.color;
      if (ru
```