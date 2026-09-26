# OUTRO - legal_docx.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\midpage\skills\draft-brief\scripts\legal_docx.js
**SHA:** d34ca45b90cf40d9
**Timestamp:** 2026-08-26T18:32:00.317136
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- default: { document: { run: { font: FONT, size: 24, color: BLACK } } }, // 12 pt body
- run: { size: HEADING_SIZE, bold: true, font: FONT, color: BLACK },
- run: { size: HEADING_SIZE, bold: true, allCaps: true, font: FONT, color: BLACK },
- run: { size: HEADING_SIZE, bold: true, font: FONT, color: BLACK },
- run: { size: HEADING_SIZE, italics: true, font: FONT, color: BLACK },
- run: { size: HEADING_SIZE, font: FONT, color: BLACK },
- const HEADING_RUN = {

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * legal_docx.js — the single Word-rendering engine for the litigation skills suite.
 *
 * Owns the docx implementation of the suite's court-document look (see references/legal-docx.md
 * for the full API). Every skill that emits Word calls this module; none hand-roll docx
 * styling. Three surfaces:
 *
 *   1. A helper API for prose documents: section(), title/caption/sub/h1–h4, p/bullet/numbered/t/
 *      link/status, table(), box(), write().
 *   2. A data-driven builder: buildSpec()/writeSpec() turn a JSON `spec` (title, subtitle,
 *      footer, columns, groups[]/rows[]) into a checklist / punch-list / table document.
 *   3. Format profiles (brief, memo, letter, table) so callers pick a look without re-specifying
 *      spacing/indent/status defaults each time.
 *
 * The look: Times New Roman, black on white, blue underlined links (#0563C1), gray (#D9D9D9)
 * bold-black table headers, thin gray (#BFBFBF) cell borders, US Letter with 1" margins,
 * centered page-number-only footer.
 *
 * Requires the `docx` package: run `npm install docx` in the working dir, then
 *   const D = require("./scripts/legal_docx.js");
 */
const fs = require("fs");
const path = require("path");
const docx = require("docx");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, LineRuleType, ExternalHyperlink,
  BorderStyle, WidthType, ShadingType, PageNumber, VerticalAlign,
} = docx;

// ---- design-system constants (the one source of truth for the Word look) ----
const FONT = "Times New Roman";
const BLACK = "000000";
const GREY_TEXT = "595959";   // footer + sub-caption gray
const HEADER_FILL = "D9D9D9"; // table header row fill
const BOX_FILL = "F2F2F2";    // light callout/code box fill
const BORDER = "BFBFBF";      // thin gray cell border
const LINK = "0563C1";        // hyperlink blue, underlined
const STATUS = { green: "2E7D32", orange: "B26A00", blue: "0563C1", black: BLACK };

// Reconciled divergence — border weight. docx_style.js used size 1 (a 0.125pt hairline that
// renders inconsistently / can vanish across Word versions); build_punchlist_docx.js used
// size 4 (0.5pt). The design system asks for a *thin* gray rule, so we standardize on size 4:
// reliably visible, still thin. This is the one value used for every table border in the suite.
const BORDER_SIZE = 4;
const cellBorder = { style: BorderStyle.SINGLE, size: BORDER_SIZE, color: BORDER };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

const CONTENT_WIDTH = 9360; // US Letter content width at 1" margins (DXA)
const CELL_MARGINS = { top: 60, bottom: 60, left: 100, right: 100 };

// Heading geometry — shared by every profile. Four nested point-heading levels, each on a
// hanging indent: the hanging distance is constant (HEADING_STEP) while the left indent grows
// by one step per level (left = level × HEADING_STEP). That keeps each level's wrapped lines
// aligned under the title text (never under the enumerator) and steps each level 0.5" further
// right than the one above. 12 pt across all levels — hierarchy is carried by case/weight/
// italic/indent, not by size (see the heading() builder for per-level run styling).
const HEADING_STEP = 720; // 0.5" in twips
const HEADING_SIZE = 24;  // 12 pt, all four levels

// ---- format profiles ----
// A profile is the single place per-profile *typography* lives, so a caller picks a complete
// look by name instead of hand-setting spacing/indent/sizes. Explicit options always override.
// This split is the suite's two registers (see references/legal-docx.md):
//   • a court-filing register (brief) — double-spaced (or rules-driven); and
//   • a work-product register (memo/letter/table) — single-spaced.
// Every profile indents paragraphs 0.5" on the first line — legal documents indent.
// Units: half-points for sizes (24 = 12 pt); twips for spacing/indent (240 = single line,
// 480 = double, 720 = 0.5").
//   boldStatus      — also bold attention statuses (orange) in spec tables so they draw the eye?
//   lineSpacing     — body line spacing (twips); brief default is double, overridable by court rule
//   firstLineIndent — body first-line indent (twips); all profiles indent 0.5"
//   bodyAfter       — body paragraph spacing-after (twips); for briefs the line spacing carries it
//   titleSize       — document title font (half-points)
//   headingSize     — point-heading font, all levels (half-points)
const PROFILES = {
  // Court-filed brief: double-spaced, first-line-indented body; hanging point headings. lineSpacing
  // defaults to double but defers to a governing court rule when the caller passes one (see
  // Court-rules deference / the builders() factory).
  brief:  { boldStatus: false, lineSpacing: 480, firstLineIndent: 720, bodyAfter: 0,   titleSize: 24, headingSize: HEADING_SIZE },
  // Internal legal memo: single-spaced by default (callers double-space when they want it, e.g. a
  /
```
  /
```