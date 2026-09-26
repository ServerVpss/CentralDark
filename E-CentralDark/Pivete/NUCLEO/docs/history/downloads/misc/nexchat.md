# OUTRO - nexchat.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\nexchat\styles\nexchat.css
**SHA:** ba25672ef1c8c880
**Timestamp:** 2026-08-26T19:31:11.530017
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- gap: 14px;
- gap: 2px;
- gap: 10px;
- gap: 8px;
- gap: 8px;
- gap: 6px;
- gap: 14px;
- gap: 8px;
- gap: 8px;
- gap: 12px;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Tema NexChat — camada visual isolada
 * Todos os seletores começam com .nexchat-root pra não vazar pro resto do app.
 * Tokens inspirados no template NexChat (licenciado pelo cliente via ThemeForest)
 * e mapeados pra coexistir com o design system do MultiZap.
 */

.nexchat-root {
  /* paleta */
  --nx-primary: #13ec5b;
  --nx-primary-soft: rgba(19, 236, 91, 0.1);
  --nx-blue: #3b82f6;
  --nx-purple: #8b5cf6;
  --nx-success: #2ecb71;
  --nx-danger: #e74c3c;
  --nx-warning: #f1c40f;

  /* superfícies (dark default) */
  --nx-bg: rgb(16 34 22);
  --nx-surface: rgb(22 43 30);
  --nx-surface-hover: rgb(28 51 36);
  --nx-text: #ffffff;
  --nx-text-muted: rgb(157 185 166);
  --nx-border: rgba(255, 255, 255, 0.05);
  --nx-glass: color-mix(in srgb, rgb(22 43 30) 85%, transparent);

  /* shape */
  --nx-radius-sm: 8px;
  --nx-radius-md: 14px;
  --nx-radius-lg: 20px;
  --nx-radius-xl: 30px;
  --nx-radius-2xl: 40px;

  /* sombras */
  --nx-shadow-md: 0 4px 10px rgba(0, 0, 0, 0.1);
  --nx-shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --nx-shadow-glow: 0 0 20px color-mix(in srgb, var(--nx-primary) 25%, transparent);

  --nx-transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  font-family: "Plus Jakarta Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
  background-color: var(--nx-bg);
  color: var(--nx-text);
  -webkit-font-smoothing: antialiased;
}

/* overlay tokens (dark default) — usados em camadas semi-transparentes */
.nexchat-root {
  --nx-overlay-soft: rgba(255, 255, 255, 0.05);
  --nx-overlay: rgba(255, 255, 255, 0.08);
  --nx-overlay-strong: rgba(255, 255, 255, 0.12);
  --nx-shadow-card: 0 20px 50px rgba(0, 0, 0, 0.5);
  --nx-shadow-drawer: -8px 0 30px rgba(0, 0, 0, 0.4);
}

/* light mode */
:root:not(.dark) .nexchat-root {
  --nx-bg: #f6f8f6;
  --nx-surface: #ffffff;
  --nx-surface-hover: #eef3ef;
  --nx-text: #102216;
  --nx-text-muted: #5a7565;
  --nx-border: rgba(16, 34, 22, 0.08);
  --nx-glass: color-mix(in srgb, #ffffff 85%, transparent);
  --nx-overlay-soft: rgba(16, 34, 22, 0.05);
  --nx-overlay: rgba(16, 34, 22, 0.08);
  --nx-overlay-strong: rgba(16, 34, 22, 0.12);
  --nx-shadow-card: 0 20px 50px rgba(16, 34, 22, 0.12);
  --nx-shadow-drawer: -8px 0 30px rgba(16, 34, 22, 0.12);
}

/* ---------- shell ---------- */
.nexchat-root .nx-shell {
  display: flex;
  height: 100%;
  width: 100%;
  background: var(--nx-bg);
  color: var(--nx-text);
  overflow: hidden;
}

/* ---------- navigation rail ---------- */
.nexchat-root .nx-rail {
  width: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px 0;
  background: var(--nx-surface);
  border-right: 1px solid var(--nx-border);
}
.nexchat-root .nx-rail-logo {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--nx-primary);
  color: #102216;
  font-weight: 800;
  cursor: pointer;
  box-shadow: var(--nx-shadow-glow);
}
.nexchat-root .nx-rail-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}
.nexchat-root .nx-rail-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2px;
  border-radius: 14px;
  color: var(--nx-text-muted);
  transition: var(--nx-transition);
  background: transparent;
  border: none;
  cursor: pointer;
}
.nexchat-root .nx-rail-btn:hover {
  background: var(--nx-surface-hover);
  color: var(--nx-text);
}
.nexchat-root .nx-rail-btn[data-active="true"] {
  background: var(--nx-primary-soft);
  color: var(--nx-primary);
}
/* Rótulo só aparece no mobile (bottom nav). Desktop: rail só com ícones. */
.nexchat-root .nx-rail-label {
  display: none;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* ---------- conversation list ---------- */
.nexchat-root .nx-list {
  width: 420px;
  display: flex;
  flex-direction: column;
  background: var(--nx-surface);
  border-right: 1px solid var(--nx-border);
  min-width: 0;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
.nexchat-root .nx-list-header {
  padding: 12px 14px 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-bottom: 1px solid var(--nx-border);
}
.nexchat-root .nx-list-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
}
.nexchat-root .nx-list-title {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1;
}
.nexchat-root .nx-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  background: var(--nx-surface-hover);
  border-radius: var(--nx-radius-md);
  border: 1px solid transparent;
  transition: var(--nx-transition);
}
.nexchat-root .nx-search:focus-within {
  border-color: var(--nx-primary);
  box-shadow: 0 0 0 2px var(--nx-primary-soft);
}
.nexchat-root .nx-search input {
  
```