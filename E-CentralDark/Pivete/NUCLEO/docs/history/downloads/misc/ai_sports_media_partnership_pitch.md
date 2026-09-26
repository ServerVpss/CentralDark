# OUTRO - ai_sports_media_partnership_pitch.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\ai_sports_media_partnership_pitch.js
**SHA:** c52fc733633ead4f
**Timestamp:** 2026-08-28T02:52:32.325034
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const nsStart = 2.25;

### Gaps
- const colInnerGap = (9.0 - 3 * colW) / 2;
- const statGap = (9.0 - 3 * statW) / 2;
- const whyGap = (whyBot - whyTop - 3 * whyItemH) / 4;
- const cardGap = (9.0 - 4 * cardW) / 3;
- const stepGap = (9.0 - 4 * stepW) / 3;
- const intGap = (9.0 - 3 * intW) / 2;
- const cardGap = (9.0 - 3 * cardW) / 2;
- const gap = 0.1;
- const tierGap = (tierBoxBot - tierTitleBot - 3 * tierBlockH) / 4;
- const nsGap = (nsEnd - nsStart - 4 * nsItemW) / 5;

### Ouro Bruto (primeiros 5000 chars)
```
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const {
  FaRocket, FaBullseye, FaShieldAlt, FaCogs, FaChartLine,
  FaHandshake, FaNewspaper, FaCheckCircle, FaEnvelope, FaArrowRight,
  FaBolt, FaUsers, FaTrophy, FaLock, FaPlayCircle, FaGlobe,
  FaImage, FaStar, FaFlag, FaCrown
} = require("react-icons/fa");

function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Generate an abstract network/data graphic as PNG
async function generateAbstractGraphic() {
  const width = 500;
  const height = 600;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#E8611A;stop-opacity:0.8"/>
        <stop offset="100%" style="stop-color:#F4935B;stop-opacity:0.3"/>
      </linearGradient>
      <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#1A2E4F;stop-opacity:0.9"/>
        <stop offset="100%" style="stop-color:#E8611A;stop-opacity:0.4"/>
      </linearGradient>
    </defs>
    <!-- Connection lines -->
    <line x1="150" y1="120" x2="350" y2="200" stroke="#E8611A" stroke-width="2" opacity="0.3"/>
    <line x1="350" y1="200" x2="250" y2="350" stroke="#E8611A" stroke-width="2" opacity="0.3"/>
    <line x1="250" y1="350" x2="100" y2="300" stroke="#E8611A" stroke-width="2" opacity="0.25"/>
    <line x1="100" y1="300" x2="150" y2="120" stroke="#F4935B" stroke-width="1.5" opacity="0.2"/>
    <line x1="350" y1="200" x2="400" y2="400" stroke="#F4935B" stroke-width="1.5" opacity="0.2"/>
    <line x1="250" y1="350" x2="400" y2="400" stroke="#E8611A" stroke-width="2" opacity="0.3"/>
    <line x1="150" y1="120" x2="300" y2="80" stroke="#F4935B" stroke-width="1.5" opacity="0.2"/>
    <line x1="300" y1="80" x2="350" y2="200" stroke="#E8611A" stroke-width="1.5" opacity="0.25"/>
    <line x1="100" y1="300" x2="80" y2="450" stroke="#F4935B" stroke-width="1.5" opacity="0.15"/>
    <line x1="250" y1="350" x2="200" y2="500" stroke="#E8611A" stroke-width="1.5" opacity="0.2"/>
    <line x1="400" y1="400" x2="350" y2="520" stroke="#F4935B" stroke-width="1.5" opacity="0.15"/>
    <!-- Large ring -->
    <circle cx="250" cy="280" r="120" fill="none" stroke="url(#g1)" stroke-width="3" opacity="0.25"/>
    <circle cx="250" cy="280" r="80" fill="none" stroke="#E8611A" stroke-width="1.5" opacity="0.15" stroke-dasharray="8 6"/>
    <!-- Nodes -->
    <circle cx="150" cy="120" r="22" fill="#E8611A" opacity="0.85"/>
    <circle cx="300" cy="80" r="14" fill="#F4935B" opacity="0.6"/>
    <circle cx="350" cy="200" r="28" fill="url(#g1)" opacity="0.9"/>
    <circle cx="250" cy="350" r="24" fill="#E8611A" opacity="0.75"/>
    <circle cx="100" cy="300" r="16" fill="#F4935B" opacity="0.5"/>
    <circle cx="400" cy="400" r="20" fill="#E8611A" opacity="0.7"/>
    <circle cx="80" cy="450" r="10" fill="#F4935B" opacity="0.35"/>
    <circle cx="200" cy="500" r="12" fill="#E8611A" opacity="0.4"/>
    <circle cx="350" cy="520" r="8" fill="#F4935B" opacity="0.3"/>
    <!-- Center highlight -->
    <circle cx="250" cy="280" r="35" fill="#E8611A" opacity="0.15"/>
    <circle cx="250" cy="280" r="12" fill="#E8611A" opacity="0.6"/>
    <!-- Small dot accents -->
    <circle cx="420" cy="130" r="6" fill="#F4935B" opacity="0.3"/>
    <circle cx="60" cy="180" r="5" fill="#E8611A" opacity="0.25"/>
    <circle cx="440" cy="300" r="7" fill="#F4935B" opacity="0.2"/>
    <circle cx="180" cy="420" r="5" fill="#E8611A" opacity="0.3"/>
  </svg>`;
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const C = {
    navy:      "0C1B33",
    darkNavy:  "08122A",
    midNavy:   "1A2E4F",
    accent:    "E8611A",
    accentLt:  "F4935B",
    white:     "FFFFFF",
    offWhite:  "F5F6FA",
    lightGray: "DDE1EA",
    medGray:   "8892A6",
    darkText:  "1E2337",
    bodyText:  "3B4055",
    green:     "2D8B55",
  };

  const icons = {
    rocket:     await iconToBase64Png(FaRocket, `#${C.accent}`, 256),
    bullseye:   await iconToBase64Png(FaBullseye, `#${C.accent}`, 256),
    shield:     await iconToBase64Png(FaShieldAlt, `#${C.accent}`, 256),
    cogs:       await iconToBase64Png(FaCogs, `#${C.accent}`, 256),
    chart:      await iconToBase64Png(FaChartLine, `#${C.accent}`, 256),
    check:      await iconToBase64Png(FaCheckCircle, `#${C.whi
```