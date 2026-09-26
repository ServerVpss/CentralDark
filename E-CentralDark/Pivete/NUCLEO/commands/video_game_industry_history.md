# COMANDO - video_game_industry_history.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\video_game_industry_history.js
**SHA:** 4cbaa12e92543da7
**Timestamp:** 2026-08-28T02:52:37.453263
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const barW = 0.35, gap = 0.2;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Recreates "The History of the Video Game Industry" deck using pptxgenjs.
 *
 * Slide size: 20" x 11.25" (16:9 widescreen, custom)
 * Palette:
 *   BG_CREAM   = F2ECE0  (light/cream background)
 *   INK_DARK   = 141210  (body / primary text)
 *   INK_MUTED  = 3A342C  (secondary / labels)
 *   INK_BLACK  = 0A0908  (near-black, dark slide bg)
 *   ACCENT     = C7591A  (orange accent)
 *   ON_DARK    = BFB7A8  (body text on dark bg)
 *   ON_DARK_MUTED = A8A195 (muted text on dark bg)
 *
 * Fonts: Arial throughout (matches source)
 */

const pptxgen = require("pptxgenjs");

// -------- constants --------
const W = 20;           // slide width (inches)
const H = 11.25;        // slide height (inches)
const MARGIN = 1.05;    // left/right margin used across slides
const BG_CREAM = "F2ECE0";
const INK_DARK = "141210";
const INK_MUTED = "3A342C";
const INK_BLACK = "0A0908";
const ACCENT = "C7591A";
const ON_DARK = "BFB7A8";
const ON_DARK_MUTED = "A8A195";
const FONT = "Arial";

// -------- helpers --------
// Adds the header eyebrow (top-left label + top-right page number) common to most slides.
function addHeader(slide, eyebrow, pageText, opts = {}) {
    const onDark = opts.onDark === true;
    const labelColor = onDark ? ON_DARK_MUTED : INK_MUTED;
    slide.addText(eyebrow, {
        x: MARGIN, y: 0.55, w: 10, h: 0.4,
        fontFace: FONT, fontSize: 12, color: labelColor,
        charSpacing: 4, bold: false, margin: 0,
    });
    slide.addText(pageText, {
        x: W - MARGIN - 2, y: 0.55, w: 2, h: 0.4,
        fontFace: FONT, fontSize: 12, color: labelColor,
        charSpacing: 4, align: "right", margin: 0,
    });
}

// Adds the footer (bottom-left tagline + bottom-right page number).
function addFooter(slide, tagline, pageText, opts = {}) {
    const onDark = opts.onDark === true;
    const labelColor = onDark ? ON_DARK_MUTED : INK_MUTED;
    slide.addText(tagline, {
        x: MARGIN, y: H - 0.85, w: 10, h: 0.4,
        fontFace: FONT, fontSize: 12, color: labelColor,
        charSpacing: 4, margin: 0,
    });
    slide.addText(pageText, {
        x: W - MARGIN - 2, y: H - 0.85, w: 2, h: 0.4,
        fontFace: FONT, fontSize: 12, color: labelColor,
        charSpacing: 4, align: "right", margin: 0,
    });
}

// Builds the reusable "Chapter" content layout shared by slides 4–8.
// title parts: [regularWord, italicAccentWord, regularWord] rendered as one line.
function addChapterLayout(slide, cfg) {
    const onDark = cfg.onDark === true;
    const bg = onDark ? INK_BLACK : BG_CREAM;
    const ink = onDark ? "F2ECE0" : INK_DARK;
    const body = onDark ? ON_DARK : INK_DARK;
    const subtle = onDark ? ON_DARK_MUTED : INK_MUTED;
    const rule = onDark ? "3A342C" : "BFB7A8";

    slide.background = { color: bg };
    addHeader(slide, cfg.eyebrow, cfg.page, { onDark });
    addFooter(slide, cfg.tagline, cfg.page, { onDark });

    // CHAPTER N label
    slide.addText(cfg.chapterLabel, {
        x: MARGIN, y: 1.55, w: 6, h: 0.45,
        fontFace: FONT, fontSize: 14, color: ACCENT,
        charSpacing: 4, margin: 0,
    });

    // Chapter title: "The [Accent] Rest"
    slide.addText([
        { text: "The ", options: { color: ink } },
        { text: cfg.titleAccent, options: { color: ACCENT, italic: true } },
        { text: " " + cfg.titleTail, options: { color: ink } },
    ], {
        x: MARGIN, y: 2.05, w: 11, h: 1.3,
        fontFace: FONT, fontSize: 54, bold: false, margin: 0,
    });

    // Intro paragraph (top-left) + date range (top-right) with horizontal rule beneath
    slide.addText(cfg.intro, {
        x: MARGIN, y: 4.35, w: 9.0, h: 1.1,
        fontFace: FONT, fontSize: 17, color: body, margin: 0,
    });
    slide.addText(cfg.dateRange, {
        x: W - MARGIN - 6, y: 4.55, w: 6, h: 0.9,
        fontFace: FONT, fontSize: 30, color: ACCENT,
        align: "right", margin: 0,
    });
    // Rule under the intro row
    slide.addShape("line", {
        x: MARGIN, y: 5.65, w: W - MARGIN * 2, h: 0,
        line: { color: rule, width: 0.75 },
    });

    // Pull-quote with italic accent phrase
    slide.addText([
        { text: cfg.pullLead + " ", options: { color: body } },
        { text: cfg.pullAccent, options: { color: ACCENT, italic: true } },
        { text: " " + cfg.pullTail, options: { color: body } },
    ], {
        x: MARGIN, y: 6.05, w: 10.2, h: 1.4,
        fontFace: FONT, fontSize: 22, margin: 0,
    });

    // Supporting bullet body (fine print)
    const bulletItems = cfg.bullets.map((t, i) => ({
        text: t,
        options: {
            breakLine: i < cfg.bullets.length - 1,
            paraSpaceAfter: 8,
        },
    }));
    slide.addText(bulletItems, {
        x: MARGIN + 0.1, y: 7.6, w: 10.1, h: 2.6,
        fontFace: FONT, fontSize: 13, color: body, margin: 0,
    });

    // Right-side stat pair (two stacked fields separated by rules)
    const rightX = 13.5;
    const rightW = W - rightX - MARGIN;
    slide.addShape("line", {
        x: rightX, y: 6.0
```