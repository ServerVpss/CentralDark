# OUTRO - seaborn_data_visualization_training.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\seaborn_data_visualization_training.js
**SHA:** 0a7e947a4b6e682d
**Timestamp:** 2026-08-28T02:52:37.169009
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const run = (label, key) => {

### Gaps
- const gap = 0.7;
- const gap = 0.6;
- const gap = 0.6;

### Ouro Bruto (primeiros 5000 chars)
```
// Seaborn training deck
const pptxgen = require("pptxgenjs");

const P = "/home/assets/plots";
const DIMS = {"annotated_bars":[9940,7285],"ctx_notebook":[8744,5896],"ctx_talk":[9109,6191],"despine_after":[8778,6250],"despine_before":[8778,6250],"heatmap":[9924,6951],"kdeplot":[10205,6564],"mpl_bar":[9815,6666],"mpl_scatter":[9808,6673],"regplot":[9808,6564],"relplot":[12273,6040],"sns_bar":[9815,6666],"sns_scatter":[9808,6673],"title_bg":[3990,2250],"violin":[9815,6557]};
const dim = (name) => {
  const [w, h] = DIMS[name];
  return { w, h, ratio: w / h };
};

// Palette (3 colors + ink)
const TEAL = "1F4E5F";
const CORAL = "E07856";
const CREAM = "F4EAD5";
const INK = "2B2B2B";
const MUTED = "8A8378";

const FH = "Georgia";       // header font
const FB = "Calibri";       // body font

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.3 x 7.5
pres.title = "Seaborn: A Case for Switching";
pres.author = "Senior DS";

const SW = 13.3, SH = 7.5;

// Helpers
function bg(slide, color = CREAM) {
  slide.background = { color };
}

function pageFurniture(slide, pageNum, totalPages, section = "") {
  const sectionMap = {
    "motivation": "basics",
    "basics":     "basics",
    "simplifies": "simplifies",
    "tips":       "tips",
  };
  const currentKey = sectionMap[section.toLowerCase()] || "";

  const run = (label, key) => {
    const isCurrent = key === currentKey;
    return {
      text: label,
      options: {
        color: isCurrent ? CORAL : MUTED,
        bold: isCurrent,
        charSpacing: 3,
      },
    };
  };
  const sep = { text: "     ", options: { color: MUTED, charSpacing: 0 } };
  const pageStr = `${String(pageNum).padStart(2,"0")} / ${String(totalPages).padStart(2,"0")}`;

  // Header upper-right: breadcrumb + page number, single rich-text box, right-aligned
  slide.addText([
    run("BASICS", "basics"),
    sep,
    run("SIMPLIFIES", "simplifies"),
    sep,
    run("TIPS", "tips"),
    { text: "     ·     ", options: { color: MUTED } },
    { text: pageStr, options: { color: MUTED } },
  ], {
    x: SW - 7.5 - 0.6, y: 0.4, w: 7.5, h: 0.3,
    fontFace: FB, fontSize: 10,
    margin: 0, align: "right", valign: "middle",
  });
}

// --- Typographic system ---
// Every content slide uses the same horizontal bands:
//   header:       y=0.35–0.55  (breadcrumb + page num, right-aligned)
//   title:        y=0.75–1.40  (Georgia bold 32pt)
//   subtitle:     y=1.45–1.80  (Calibri italic 14pt)
//   rule:         y=1.95       (coral hairline, spans content width)
//   content:      y=2.20–6.70  (never extends past 6.70)

function title(slide, text, { y = 0.75, color = TEAL } = {}) {
  slide.addText(text, {
    x: 0.6, y, w: SW - 1.2, h: 0.65,
    fontFace: FH, fontSize: 32, bold: true, color, margin: 0, align: "left",
    valign: "middle",
  });
}

function subtitle(slide, text, { y = 1.45 } = {}) {
  slide.addText(text, {
    x: 0.6, y, w: SW - 1.2, h: 0.35,
    fontFace: FB, fontSize: 14, italic: true, color: MUTED, margin: 0, align: "left",
  });
}

// Hairline coral rule — visual anchor for the top of the content area.
function rule(slide, { y = 1.95, x = 0.6, w = SW - 1.2, color = CORAL, thickness = 0.012 } = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: thickness,
    fill: { color }, line: { color, width: 0 },
  });
}

// Section eyebrow: small charSpaced coral label.
function eyebrow(slide, text, { x = 0.6, y = 0.75, color = CORAL } = {}) {
  slide.addText(text, {
    x, y, w: 8, h: 0.3,
    fontFace: FB, fontSize: 10, color, charSpacing: 3, bold: true, margin: 0, align: "left",
  });
}

// Fit an image within (maxW x maxH), returning placement.
function fit(name, x, y, maxW, maxH) {
  const d = dim(name);
  let w = maxW, h = maxW / d.ratio;
  if (h > maxH) { h = maxH; w = maxH * d.ratio; }
  return { path: `${P}/${name}.svg`, x: x + (maxW - w)/2, y: y + (maxH - h)/2, w, h };
}

// Place an image using its natural aspect ratio. Specify target height; width is derived.
function plotByH(name, x, y, h) {
  const d = dim(name);
  return { path: `${P}/${name}.svg`, x, y, w: h * d.ratio, h };
}

// Place an image using its natural aspect ratio. Specify target width; height is derived.
function plotByW(name, x, y, w) {
  const d = dim(name);
  return { path: `${P}/${name}.svg`, x, y, w, h: w / d.ratio };
}

// Place a padded image in a fixed box. For padded images we don't need centering —
// the cream padding IS the frame, so we fill the box exactly.
function box(name, x, y, w, h) {
  return { path: `${P}/${name}_padded.png`, x, y, w, h };
}

// --- Code snippet library (rendered natively with syntax highlighting) ---
const SNIPPETS = {
  install: `# install
pip install seaborn

# typical imports
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style="whitegrid")`,

  mpl_bar: `m = tips.groupby("day").total_bill.mean()
fig, ax = plt.subplots()
ax.bar(m.index, m.values)
ax.set_ylabel("total_bill")`,

  sns_bar: `sns.barplot(
    data=tips, x="day"
```