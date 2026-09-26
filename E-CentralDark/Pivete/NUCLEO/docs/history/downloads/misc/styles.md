# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\packages\sdk\examples\tauri-app\src\styles.css
**SHA:** 435d25a1bb7bf01a
**Timestamp:** 2026-08-23T14:17:22.059074
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
main {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

nav {
  display: flex;
  gap: 8px;
  margin: 20px 0;
}

button {
  height: 34px;
}

#preview {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  border: 1px solid #ddd;
  border-radius: 8px;
}

```

---

# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\packages\sdk\examples\tauri-app\src\styles.css
**SHA:** 435d25a1bb7bf01ad6abee9c24f56743493175c763db64e660ee61722c287f18
**Timestamp:** 2026-08-23T23:44:17.078595
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;

### Ouro Bruto (primeiros 5000 chars)
```
main {
  box-sizing: border-box;
  min-height: 100vh;
  padding: 32px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

nav {
  display: flex;
  gap: 8px;
  margin: 20px 0;
}

button {
  height: 34px;
}

#preview {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  border: 1px solid #ddd;
  border-radius: 8px;
}

```

---

# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\projeto-dashboard\styles.css
**SHA:** 61af0be021e46528
**Timestamp:** 2026-08-26T19:32:45.756068
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 22px;
- gap: 14px;
- gap: 16px;
- gap: 18px;
- gap: 18px;
- gap: 14px;
- gap: 10px;
- gap: 12px;
- gap: 12px;
- gap: 14px;

### Ouro Bruto (primeiros 5000 chars)
```
:root {
  --bg: #050505;
  --bg-2: #0b0b0d;
  --panel: rgba(18, 18, 20, 0.82);
  --panel-2: rgba(28, 28, 32, 0.82);
  --panel-3: rgba(255, 255, 255, 0.055);
  --text: #ffffff;
  --muted: #b8b8c2;
  --soft: #e7e7ee;
  --red: #e50914;
  --red-2: #ff3440;
  --green: #2cff88;
  --yellow: #ffd166;
  --blue: #63d8ff;
  --purple: #b48cff;
  --line: rgba(255, 255, 255, 0.12);
  --line-strong: rgba(255, 255, 255, 0.2);
  --shadow: 0 30px 90px rgba(0, 0, 0, 0.58);
  --radius-xl: 34px;
  --radius-lg: 26px;
  --radius-md: 20px;
  --max: 1320px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 0%, rgba(229, 9, 20, 0.32), transparent 28rem),
    radial-gradient(circle at 92% 4%, rgba(99, 216, 255, 0.14), transparent 30rem),
    radial-gradient(circle at 55% 55%, rgba(180, 140, 255, 0.08), transparent 34rem),
    linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 55%, #050505 100%);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black, transparent 86%);
}

.noise {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.07;
  background-image: linear-gradient(transparent 50%, rgba(255,255,255,.08) 50%);
  background-size: 100% 4px;
}

::selection {
  background: rgba(229, 9, 20, 0.45);
  color: #fff;
}

.hero,
.layout,
.footer {
  width: min(var(--max), calc(100% - 32px));
  margin: 0 auto;
}

.hero {
  padding: clamp(28px, 5vw, 58px) 0 24px;
}

.hero__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: 22px;
  align-items: end;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--red-2);
  letter-spacing: .16em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 900;
}

h1,
h2,
h3 {
  margin: 0;
  letter-spacing: -0.04em;
}

h1 {
  max-width: 980px;
  font-size: clamp(42px, 7.5vw, 96px);
  line-height: .9;
  text-wrap: balance;
}

h2 {
  font-size: clamp(22px, 2vw, 30px);
}

h3 {
  font-size: 16px;
}

.subtitle {
  max-width: 920px;
  color: #e0e0e7;
  font-size: clamp(16px, 1.5vw, 19px);
  line-height: 1.68;
}

.status-card,
.score-card,
.panel {
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.035));
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
}

.status-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-lg);
  min-height: 90px;
}

.status-card strong {
  display: block;
  font-size: 16px;
}

.status-card small {
  display: block;
  margin-top: 4px;
  color: var(--muted);
  line-height: 1.4;
}

.pulse {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: var(--yellow);
  box-shadow: 0 0 0 0 rgba(255, 209, 102, 0.8);
  animation: pulse 1.8s infinite;
}

.pulse.ok {
  background: var(--green);
  box-shadow: 0 0 0 0 rgba(44, 255, 136, 0.8);
}

.pulse.bad {
  background: var(--red);
  box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.8);
}

@keyframes pulse {
  70% { box-shadow: 0 0 0 14px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.hero__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}

.score-card {
  min-height: 142px;
  border-radius: var(--radius-lg);
  padding: 22px;
  overflow: hidden;
  position: relative;
  isolation: isolate;
}

.score-card::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at 100% 100%, rgba(229,9,20,.22), transparent 46%);
}

.score-card::after {
  content: "";
  position: absolute;
  inset: auto -38px -52px auto;
  width: 135px;
  height: 135px;
  z-index: -1;
  border-radius: 999px;
  background: rgba(229,9,20,.2);
  filter: blur(2px);
}

.score-card span,
.score-card small {
  color: var(--muted);
}

.score-card strong {
  display: block;
  margin: 10px 0 8px;
  font-size: clamp(30px, 4vw, 42px);
  letter-spacing: -0.055em;
}

.bar {
  height: 9px;
  border-radius: 999px;
  background: rgba(255,255,255,.1);
  overflow: hidden;
  border: 1px solid rgba(255,255,255,.06);
}

.bar i {
  display: block;
  height: 100%;
  width: 0%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--red), var(--red-2), var(--yellow));
  box-shadow: 0 0 20px rgba(229,9,20,.35);
  transition: width .75s ease;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(340px, .82fr);
  gap: 18px;
  padding-bottom: 34px;
}

.panel {
  position: relative;
  over
```

---

# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.git.desativado-20260630-013358\recarg17asbrasil-main\styles.css
**SHA:** 497e05587db96980
**Timestamp:** 2026-08-28T02:39:19.065310
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 20px;
- gap: 20px;
- gap: 10px;
- gap: 8px;
- gap: 8px;
- gap: 15px;
- gap: 20px;
- gap: 12px;
- gap: 12px;
- gap: 2px;

### Ouro Bruto (primeiros 5000 chars)
```
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Tema Light - Claro e Moderno */
    --primary-color: #2563eb;
    --primary-dark: #1d4ed8;
    --secondary-color: #64748b;
    --success-color: #22c55e;
    --warning-color: #f59e0b;
    --danger-color: #ef4444;
    --bg-color: #f8fafc;
    --card-bg: #ffffff;
    --card-bg-light: #f8fafc;
    --card-bg-lighter: #f1f5f9;
    --text-primary: #1e293b;
    --text-secondary: #64748b;
    --text-muted: #94a3b8;
    --border-color: #e2e8f0;
    --border-light: #cbd5e1;
    --border-lighter: #94a3b8;
    --shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.08);
    --shadow-hover: 0 4px 12px rgba(0, 0, 0, 0.12);
    --gradient-primary: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    --gradient-card: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--bg-color);
    color: var(--text-primary);
    line-height: 1.6;
    min-height: 100vh;
    min-height: 100dvh;
}
@media (max-width: 768px) {
    html, body {
        overflow-x: hidden;
    }
}

.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

/* Header */
.header {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 20px 30px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.balance-display {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px;
    background: var(--gradient-primary);
    color: white;
    border-radius: 10px;
    font-weight: 600;
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow);
}

.balance-label {
    opacity: 0.9;
}

.balance-value {
    font-size: 18px;
}

/* Tabs */
.tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    background: var(--card-bg);
    padding: 8px;
    border-radius: 12px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
    overflow-x: auto;
}

.tab {
    padding: 12px 24px;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.3s ease;
    white-space: nowrap;
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.tab .tab-icon {
    font-size: 1.1em;
}

.tab .tab-text {
    display: inline;
}

.tab:hover {
    background: var(--card-bg-light);
    color: var(--text-primary);
    transform: translateY(-1px);
}

.tab.active {
    background: var(--primary-color);
    color: white;
    box-shadow: var(--shadow);
}

/* Main Content */
.main-content {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 30px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-color);
    min-height: 500px;
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    flex-wrap: wrap;
    gap: 15px;
}

.section-header h2 {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-primary);
}

/* Dashboard */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}

.card {
    background: var(--gradient-card);
    padding: 30px;
    border-radius: 16px;
    color: var(--text-primary);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
}

.card h3 {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: 10px;
}

.big-number {
    font-size: 32px;
    font-weight: 700;
}

/* Revendedor Dashboard - primeira tela (mobile-first) */
.rev-dash-wrap {
    padding: 0 0 24px;
    max-width: 520px;
    margin: 0 auto;
}
.rev-dash-welcome {
    font-size: 1.25rem;
    color: var(--text-secondary);
    margin-bottom: 20px;
    font-weight: 500;
}
.rev-dash-saldo-card {
    background: var(--gradient-primary);
    color: #fff;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 10px 30px rgba(37, 99, 235, 0.35);
    text-align: center;
}
.rev-dash-saldo-label {
    display: block;
    font-size: 0.875rem;
    opacity: 0.9;
    margin-bottom: 8px;
    font-weight: 500;
}
.rev-dash-saldo-value {
    font-size: 
```

---

# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\obsidian-plugin-grafo-vivo\styles.css
**SHA:** d797d77552f57888
**Timestamp:** 2026-08-28T02:56:39.470867
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 8px;
- gap: 8px;
- .cd-modal-botoes { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
- .cd-notice-botoes { display: flex; gap: 6px; margin-top: 6px; }

### Ouro Bruto (primeiros 5000 chars)
```
/* Estilos do plugin CentralDark Grafo Vivo */

.cd-grafo-vivo-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 8px;
  gap: 8px;
}
.cd-grafo-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.cd-grafo-filtro, .cd-grafo-btn {
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--background-secondary);
  color: var(--text-normal);
  border: 1px solid var(--background-modifier-border);
  cursor: pointer;
}
.cd-grafo-status { font-size: 12px; opacity: 0.85; margin-left: auto; }
.cd-grafo-canvas { flex: 1; min-height: 200px; border-radius: 8px; overflow: hidden; }

/* Modal changelog */
.cd-modal-versoes { font-size: 13px; opacity: 0.9; margin: 4px 0 12px; }
.cd-modal-changelog {
  max-height: 300px;
  overflow-y: auto;
  background: var(--background-secondary);
  padding: 10px;
  border-radius: 6px;
  white-space: pre-wrap;
  font-family: var(--font-monospace);
  font-size: 12px;
}
.cd-modal-botoes { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.cd-modal-botoes button { padding: 6px 14px; }
.cd-modal-erro-detalhes {
  max-height: 260px; overflow: auto;
  background: var(--background-secondary);
  padding: 8px; border-radius: 6px; font-size: 11px;
}

/* Notice com botões */
.cd-notice-botoes { display: flex; gap: 6px; margin-top: 6px; }
.cd-notice-botoes button, .cd-notice-btn-erro {
  padding: 3px 8px; font-size: 12px; border-radius: 4px; cursor: pointer;
  background: var(--interactive-accent); color: var(--text-on-accent); border: none;
}
.cd-grafo-canvas canvas { display: block; }

/* Modal do changelog */
.cd-grafo-changelog h2 { margin: 0 0 8px 0; }
.cd-grafo-changelog-header {
  color: var(--text-muted);
  margin: 0 0 16px 0;
  font-size: 13px;
}
.cd-grafo-changelog-lista {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  border-top: 1px solid var(--background-modifier-border);
  border-bottom: 1px solid var(--background-modifier-border);
  padding: 12px 8px;
  margin-bottom: 12px;
}
.cd-grafo-changelog-bloco { margin-bottom: 16px; }
.cd-grafo-changelog-bloco h3 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: var(--text-accent);
}
.cd-grafo-changelog-bloco ul { margin: 0; padding-left: 20px; }
.cd-grafo-changelog-bloco li { margin: 3px 0; font-size: 13px; }

```

---

# OUTRO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\status\styles.css
**SHA:** 75d5d3a5c8e92cdf
**Timestamp:** 2026-08-28T02:56:40.832575
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 22px;
- gap: 14px;
- gap: 16px;
- gap: 18px;
- gap: 18px;
- gap: 14px;
- gap: 10px;
- gap: 12px;
- gap: 12px;
- gap: 14px;

### Ouro Bruto (primeiros 5000 chars)
```
/* ============================================================
   CentralDark · status.centralldark.com
   Tema Esmeralda (inspirado no TelePanel) — light, 3D tátil
   ============================================================ */

@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap");

:root {
  /* Paleta Esmeralda (HSL como no TelePanel) */
  --bg: 0 0% 99%;
  --bg-2: 0 0% 97%;
  --surface: 0 0% 100%;
  --surface-2: 0 0% 98%;
  --text: 0 0% 7%;
  --muted-c: 0 0% 35%;
  --soft-c: 0 0% 22%;

  --primary: 152 65% 32%;
  --primary-glow: 152 70% 40%;
  --primary-soft: 152 65% 32%;

  --red: 0 72% 45%;
  --red-2: 0 78% 52%;
  --green: 152 65% 36%;
  --yellow: 38 95% 45%;
  --blue: 192 70% 42%;
  --purple: 270 60% 55%;

  --line: 0 0% 88%;
  --line-strong: 0 0% 78%;

  /* Sombras 3D táteis — mesmo padrão do TelePanel */
  --shadow-3d:
    0 10px 20px -8px rgba(0, 0, 0, 0.18),
    0 2px 4px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 hsl(0 0% 100% / 0.6),
    inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  --shadow-3d-soft:
    0 6px 14px -6px rgba(0, 0, 0, 0.14),
    0 1px 2px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 hsl(0 0% 100% / 0.6);
  --shadow-3d-primary:
    0 10px 22px -8px hsl(var(--primary) / 0.45),
    0 2px 6px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 hsl(0 0% 100% / 0.45),
    inset 0 -2px 4px hsl(var(--primary) / 0.25);

  --radius-xl: 22px;
  --radius-lg: 16px;
  --radius-md: 12px;
  --max: 1320px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }

body {
  margin: 0;
  min-height: 100vh;
  color: hsl(var(--text));
  font-family: "Geist", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-feature-settings: "cv11", "ss01", "ss03";
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
  background:
    radial-gradient(ellipse at 8% 0%, hsl(var(--primary) / 0.10), transparent 55%),
    radial-gradient(ellipse at 92% 4%, hsl(160 70% 40% / 0.06), transparent 55%),
    linear-gradient(180deg, hsl(var(--bg)) 0%, hsl(var(--bg-2)) 100%);
}

/* Grade sutil de fundo (estilo CLI suave em light) */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(90deg, hsl(var(--line) / 0.6) 1px, transparent 1px),
    linear-gradient(0deg, hsl(var(--line) / 0.6) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, black, transparent 88%);
  opacity: 0.45;
}

.noise {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  opacity: 0.025;
  background-image: linear-gradient(transparent 50%, rgba(0, 0, 0, 0.5) 50%);
  background-size: 100% 4px;
}

::selection {
  background: hsl(var(--primary) / 0.25);
  color: hsl(var(--text));
}

.hero,
.layout,
.footer {
  width: min(var(--max), calc(100% - 32px));
  margin: 0 auto;
}

.hero { padding: clamp(28px, 5vw, 58px) 0 24px; }

.hero__top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: 22px;
  align-items: end;
}

.eyebrow {
  margin: 0 0 10px;
  color: hsl(var(--primary));
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 700;
}

h1, h2, h3 {
  margin: 0;
  letter-spacing: -0.025em;
  color: hsl(var(--text));
  font-weight: 700;
}

h1 {
  max-width: 980px;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 0.95;
  text-wrap: balance;
  letter-spacing: -0.035em;
}

h2 { font-size: clamp(20px, 1.9vw, 28px); }
h3 { font-size: 16px; }

.subtitle {
  max-width: 920px;
  color: hsl(var(--muted-c));
  font-size: clamp(15px, 1.4vw, 17px);
  line-height: 1.65;
}

/* ===================== Cards principais (3D tátil) ===================== */
.status-card,
.score-card,
.panel {
  border: 1px solid hsl(var(--line));
  background: hsl(var(--surface));
  box-shadow: var(--shadow-3d-soft);
  border-radius: var(--radius-xl);
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: var(--radius-lg);
  min-height: 90px;
}

.status-card strong {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--text));
}

.status-card small {
  display: block;
  margin-top: 4px;
  color: hsl(var(--muted-c));
  line-height: 1.4;
}

.pulse {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: hsl(var(--yellow));
  box-shadow: 0 0 0 0 hsl(var(--yellow) / 0.55);
  animation: pulse 1.8s infinite;
}
.pulse.ok  { background: hsl(var(--primary)); box-shadow: 0 0 0 0 hsl(var(--primary) / 0.55); }
.pulse.bad { background: hsl(var(--red)); box-shadow: 0 0 0 0 hsl(var(--red) / 0.55); }

@keyframes pulse {
  70% { box-shadow: 0 0 0 12px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.hero__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 28px;
}


```