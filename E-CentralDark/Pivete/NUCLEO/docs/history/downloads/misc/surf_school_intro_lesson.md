# OUTRO - surf_school_intro_lesson.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\surf_school_intro_lesson.js
**SHA:** b201bc7c4d1d540a
**Timestamp:** 2026-08-28T02:52:37.481439
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = 0.28;
- const cols = 4, rows = 3, cell = 0.20, gap = 0.06;
- const gap = 0.35;

### Ouro Bruto (primeiros 5000 chars)
```
/* ============================================================================
 * Surfing — Lesson 01 (recreated & lightly enhanced)
 * --------------------------------------------------------------------------
 * A faithful pptxgenjs replica of the original "Surfing.pptx" editorial deck.
 *
 * Design language carried over from the original:
 *   - Sandwich palette: navy + cream, alternating dark/light slides
 *   - Coral/peach accent for eyebrow labels
 *   - Slim outline frame just inside every slide
 *   - All-caps eyebrows w/ heavy character spacing, big serif/sans titles
 *   - Roman-numeral and 2-digit indices, "NN / 08" page indicator
 *
 * Enhancements vs. the original (all minor, all on-brand):
 *   - Replaces the empty "FULL BLEED IMAGE" placeholder on slide 4 with
 *     an actual editorial ocean/wave illustration in the same palette.
 *   - Sizes every text container so labels and page numbers fit in full
 *     (the original clips "01 / 0", "WAVE STUDY/FULL BLEED IM.",
 *     "SOFT-TOP BOA[RD]", "WETSUIT SUNSCREE[N]", "PADDLE / CHEST D[OWN]",
 *     etc.). Nothing in this rebuild is cut off.
 *   - Adds a subtle crest motif on the cover and a thin divider hairline
 *     on safety/wrap-up slides for a touch more polish.
 * ============================================================================ */

const pptxgen = require("pptxgenjs");

// ---------- Palette ----------
const NAVY        = "0F2A4F";   // dominant dark
const NAVY_DEEP   = "0A1E3C";   // for inner card fills
const CREAM       = "EFE9DC";   // dominant light
const CREAM_DEEP  = "E2D9C5";   // tinted card fill on cream slides
const CORAL       = "E8B27D";   // accent (warm sand / sunset)
const INK         = "111A2E";   // body text on cream
const INK_SOFT    = "3A4A66";   // body sub on cream
const PAPER_LINE  = "C9BFA8";   // hairline on cream
const NAVY_LINE   = "27406B";   // hairline on navy
const CREAM_DIM   = "BFB7A6";   // muted cream-on-navy text

// ---------- Layout ----------
// Standard 16:9 — 13.333" x 7.5"
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const M = 0.55;                 // slide-edge margin
const FRAME_INSET = 0.22;       // inset of the thin border frame

// ---------- Fonts ----------
const FONT_HEAD = "Georgia";    // editorial serif feel for big titles
const FONT_SANS = "Calibri";    // clean body
const FONT_MONO = "Consolas";   // numerals and indices

// ---------- Helpers ----------------------------------------------------------

/** Thin outlined frame just inside the slide edge — matches the original. */
function addFrame(slide, color) {
    const inset = FRAME_INSET;
    slide.addShape("rect", {
        x: inset, y: inset,
        w: SLIDE_W - inset * 2,
        h: SLIDE_H - inset * 2,
        fill: { type: "none" },
        line: { color, width: 0.5 },
    });
}

/** Eyebrow label — top-left "NN · SECTION NAME" */
function addEyebrow(slide, text, color) {
    slide.addText(text, {
        x: M, y: M, w: 7, h: 0.35,
        fontFace: FONT_SANS, fontSize: 10, bold: false,
        color, charSpacing: 5, margin: 0,
        valign: "middle",
    });
}

/** Page indicator — top-right "NN / 08" */
function addPageIndicator(slide, n, total, color) {
    slide.addText(`${String(n).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
        x: SLIDE_W - M - 2, y: M,
        w: 2, h: 0.35,
        fontFace: FONT_MONO, fontSize: 10,
        color, charSpacing: 4, margin: 0,
        align: "right", valign: "middle",
    });
}

/** Footer used on the deeper interior slides — small caption row. */
function addFooter(slide, leftText, color) {
    slide.addText(leftText, {
        x: M, y: SLIDE_H - M - 0.32, w: 7, h: 0.32,
        fontFace: FONT_SANS, fontSize: 9, color,
        charSpacing: 4, margin: 0, valign: "middle",
    });
}

// ============================================================================
// Build presentation
// ============================================================================
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";    // 13.333 x 7.5
pres.title = "Surfing — Lesson 01";
pres.author = "Surf School";
pres.company = "Surf School / 2026";

const TOTAL = 8;

// ----------------------------------------------------------------------------
// Slide 1 — Cover
// ----------------------------------------------------------------------------
{
    const s = pres.addSlide();
    s.background = { color: NAVY };
    addFrame(s, NAVY_LINE);

    // Top brand row
    s.addText("SURF SCHOOL / 2026", {
        x: M + 0.2, y: M + 0.05, w: 5, h: 0.35,
        fontFace: FONT_SANS, fontSize: 10, color: CREAM,
        charSpacing: 6, margin: 0, valign: "middle",
    });
    s.addText("LESSON 01", {
        x: SLIDE_W - M - 2.2, y: M + 0.05, w: 2, h: 0.35,
        fontFace: FONT_SANS, fontSize: 10, color: CREAM,
        charSpacing: 6, margin: 0, align: "right", valign: "middle",
    });

    // Eyebrow + huge title
    s.addText("AN INTRODUCTION", {
        x: M + 0.2, y: 
```