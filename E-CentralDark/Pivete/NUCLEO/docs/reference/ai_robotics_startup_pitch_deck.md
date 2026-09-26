# REFERENCIA - ai_robotics_startup_pitch_deck.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\ai_robotics_startup_pitch_deck.js
**SHA:** 8442c7681a897b85
**Timestamp:** 2026-08-28T02:52:32.209287
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:  node build_phyzix.js

### Ouro Bruto (primeiros 5000 chars)
```
// Phyzix YC W26 deck — recreated with pptxgenjs
// Aesthetic: technical-drawing / engineering-blueprint look
//   - cool neutral gray field (BAB9B7) — composite of cream paper + translucent navy overlays
//   - deep navy ink (0F1A2E), electric blue annotations (1E5FFF), orange accent (FF5B1F)
//   - thin border frames everything; corner title-block bottom-right; figure callouts at top
//   - blueprint-style SVG illustrations (rasterized via sharp) populate the picture slots
//
// Run:  node build_phyzix.js
// Deps: npm install pptxgenjs sharp
// Output: Deliverable_10.pptx in the current directory.

const pptxgen = require("pptxgenjs");
const sharp   = require("sharp");

// =============================================================================
// INLINED ILLUSTRATIONS MODULE
// Technical-drawing SVG illustrations for the Phyzix deck.
// Each function returns an SVG string that gets rasterized to PNG via sharp.
// =============================================================================
// illustrations.js — Technical-drawing SVG illustrations for the Phyzix deck.
// Each function returns an SVG string that can be rasterized to a PNG via sharp.

const ILL_INK    = "#0F1A2E";
const ILL_INK2   = "#2A3654";
const ILL_ORANGE = "#FF5B1F";
const ILL_BLUE   = "#1E5FFF";
const ILL_MUTED  = "#6B6655";

// Common helper: a dashed annotation line with end-ticks (dimension line)
function dimLine(x1, y1, x2, y2, label, opts = {}) {
    const color = opts.color || ILL_INK;
    const t = 6; // tick length
    const horiz = y1 === y2;
    const tick1 = horiz
        ? `M${x1} ${y1 - t} L${x1} ${y1 + t}`
        : `M${x1 - t} ${y1} L${x1 + t} ${y1}`;
    const tick2 = horiz
        ? `M${x2} ${y2 - t} L${x2} ${y2 + t}`
        : `M${x2 - t} ${y2} L${x2 + t} ${y2}`;
    const lbl = label
        ? `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 6}" text-anchor="middle" font-family="Consolas, monospace" font-size="14" fill="${color}">${label}</text>`
        : "";
    return `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1" stroke-dasharray="4 4"/>
        <path d="${tick1}" stroke="${color}" stroke-width="1.5" fill="none"/>
        <path d="${tick2}" stroke="${color}" stroke-width="1.5" fill="none"/>
        ${lbl}`;
}

// ---------------------------------------------------------------------------
// SLIDE 1 — Exploded robot / "general assembly" blueprint
// 1200x1400 viewbox to roughly match aspect of placeholder (6.25 x 7.29)
// ---------------------------------------------------------------------------
function slide1Illustration() {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
        <!-- crosshair grid background -->
        <g stroke="${ILL_INK}" stroke-opacity="0.12" stroke-width="1">
            ${Array.from({ length: 14 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join("")}
            ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1400"/>`).join("")}
        </g>

        <!-- corner registration crosses -->
        ${[[60, 60], [1140, 60], [60, 1340], [1140, 1340]].map(([x, y]) =>
            `<g stroke="${ILL_INK}" stroke-width="2" fill="none">
                <line x1="${x - 18}" y1="${y}" x2="${x + 18}" y2="${y}"/>
                <line x1="${x}" y1="${y - 18}" x2="${x}" y2="${y + 18}"/>
                <circle cx="${x}" cy="${y}" r="6"/>
            </g>`).join("")}

        <!-- robot torso (main body) -->
        <g fill="none" stroke="${ILL_INK}" stroke-width="3">
            <!-- head module (cylinder) -->
            <ellipse cx="600" cy="280" rx="120" ry="30"/>
            <line x1="480" y1="280" x2="480" y2="380"/>
            <line x1="720" y1="280" x2="720" y2="380"/>
            <ellipse cx="600" cy="380" rx="120" ry="30"/>
            <!-- camera lens -->
            <circle cx="600" cy="330" r="22" stroke="${ILL_ORANGE}" stroke-width="3"/>
            <circle cx="600" cy="330" r="10" fill="${ILL_ORANGE}" stroke="none"/>

            <!-- neck -->
            <line x1="570" y1="410" x2="570" y2="470"/>
            <line x1="630" y1="410" x2="630" y2="470"/>

            <!-- torso (rounded rect) -->
            <rect x="400" y="470" width="400" height="380" rx="20"/>
            <!-- chest plate detail -->
            <rect x="450" y="520" width="300" height="180" rx="6" stroke-width="2"/>
            <line x1="600" y1="520" x2="600" y2="700" stroke-width="1.5"/>
            <line x1="450" y1="610" x2="750" y2="610" stroke-width="1.5"/>
            <!-- bolts -->
            ${[[470, 540], [730, 540], [470, 680], [730, 680]].map(([x, y]) =>
                `<circle cx="${x}" cy="${y}" r="5" fill="${ILL_INK}"/>`).join("")}

            <!-- shoulders -->
            <circle cx="400" cy="510" r="38"/>
            <circle cx="800" cy="510" r="38"/>

            <!-- left arm (segmented) -->
            <line x1="362" y1="510" x2="280" y2="640" s
```