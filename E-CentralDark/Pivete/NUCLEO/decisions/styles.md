# DECISAO - styles.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.copilot\installed-plugins\copilot-plugins\azure-devops-copilot-plugin\extensions\azure-devops\ui\styles.css
**SHA:** 0635b380b18f7f02
**Timestamp:** 2026-08-28T02:37:57.294962
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- main { display: grid; gap: 16px; padding: 16px; max-width: var(--content-max-width); margin: 0 auto; box-sizing: border-box; }
- .sign-in-splash { display: grid; gap: 12px; max-width: 480px; margin: 10vh auto 0; }
- .sign-in-options { display: grid; gap: 8px; }
- .loading-surface { display: flex; align-items: center; gap: 16px; box-sizing: border-box; width: min(100%, 480px); min-height: 112px; margin: 10vh auto 0; padding: 20px; background: var(--background-c
- .loading-state { display: flex; align-items: center; justify-content: center; gap: 14px; box-sizing: border-box; width: 100%; min-height: 180px; padding: 24px; }
- .loading-state-compact { justify-content: flex-start; min-height: 0; padding: 0; gap: 8px; }
- .loading-copy { display: grid; gap: 2px; min-width: 0; }
- .view-tabs { display: flex; gap: 24px; flex: 1 1 auto; min-width: 0; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none; }
- .view-tab { position: relative; display: flex; flex: 0 0 auto; align-items: center; gap: 4px; max-width: 240px; min-height: 48px; cursor: pointer; }
- .home-sections { display: grid; width: min(100%, 1040px); margin: 0 auto; gap: 24px; }

### Ouro Bruto (primeiros 5000 chars)
```
:root { color-scheme: light dark; --content-max-width: 1200px; }
body { margin: 0; background: var(--background-color-default, #fff); color: var(--text-color-default, #1f2328); font: var(--text-body-medium, 14px)/var(--leading-body-medium, 20px) var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif); }
[hidden] { display: none !important; }
/* The canvas can be docked at any width. Past a comfortable reading measure the
   content stops growing and centres instead, so long descriptions and comment
   threads do not stretch into single unreadable lines. */
main { display: grid; gap: 16px; padding: 16px; max-width: var(--content-max-width); margin: 0 auto; box-sizing: border-box; }
/* Kept in the same column as main so the footer and logs do not sit off to one
   side once the content is centred. */
footer, .logs-panel { max-width: var(--content-max-width); margin-left: auto; margin-right: auto; box-sizing: border-box; }
section { border: 1px solid var(--border-color-default, #d0d7de); border-radius: 10px; background: var(--background-color-muted, rgba(127, 127, 127, .05)); padding: 12px; }
.sign-in-splash { display: grid; gap: 12px; max-width: 480px; margin: 10vh auto 0; }
.sign-in-splash p { margin: 0; color: var(--text-color-muted, #57606a); }
.sign-in-options { display: grid; gap: 8px; }
.loading-surface { display: flex; align-items: center; gap: 16px; box-sizing: border-box; width: min(100%, 480px); min-height: 112px; margin: 10vh auto 0; padding: 20px; background: var(--background-color-default, #fff); }
.loading-state { display: flex; align-items: center; justify-content: center; gap: 14px; box-sizing: border-box; width: 100%; min-height: 180px; padding: 24px; }
.loading-state-compact { justify-content: flex-start; min-height: 0; padding: 0; gap: 8px; }
.loading-copy { display: grid; gap: 2px; min-width: 0; }
.loading-title { color: var(--text-color-default, #1f2328); font-size: var(--text-title-small, 16px); font-weight: var(--font-weight-semibold, 600); line-height: var(--leading-title-small, 24px); }
.loading-state-compact .loading-title { font-size: var(--text-body-small, 12px); line-height: var(--leading-body-small, 18px); }
.loading-detail { color: var(--text-color-muted, #57606a); font-size: var(--text-body-small, 12px); line-height: var(--leading-body-small, 18px); }
.loading-spinner { display: inline-flex; flex: 0 0 auto; width: 24px; height: 24px; color: var(--fgColor-accent, var(--text-color-accent, #0969da)); }
.loading-spinner-large { width: 32px; height: 32px; }
.loading-spinner-compact { width: 18px; height: 18px; }
.loading-spinner-svg { display: block; width: 100%; height: 100%; overflow: visible; transform-origin: center; animation: loading-spinner-rotate .9s linear infinite; }
.loading-spinner-track, .loading-spinner-arc { fill: none; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
.loading-spinner-track { stroke: var(--border-color-muted, #d8dee4); }
.loading-spinner-arc { stroke: currentColor; stroke-linecap: round; stroke-dasharray: 8 49; animation: loading-spinner-dash 1.35s ease-in-out infinite; }
@keyframes loading-spinner-rotate { to { transform: rotate(360deg); } }
@keyframes loading-spinner-dash {
  0% { stroke-dasharray: 8 49; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 32 25; stroke-dashoffset: -12; }
  100% { stroke-dasharray: 8 49; stroke-dashoffset: -48; }
}
@media (prefers-reduced-motion: reduce) {
  .loading-spinner-svg, .loading-spinner-arc { animation: none; }
  .loading-spinner-arc { stroke-dasharray: 22 35; }
}
.view-bar { display: flex; align-items: stretch; margin: -16px -16px 4px; padding: 0 26px; border-bottom: 1px solid var(--borderColor-muted, var(--border-color-muted, #d8dee4)); }
/* The bar's negative top margin cancels the page padding so the tabs sit flush
   with the top of the canvas, which is right while the bar leads the content.
   With the setup notice above it that same pull drags the tabs up into the
   notice, so it is cancelled and replaced with real spacing. */
#setupWarning:not([hidden]) + .view-bar { margin-top: 12px; }
.view-tabs { display: flex; gap: 24px; flex: 1 1 auto; min-width: 0; overflow-x: auto; overflow-y: hidden; overscroll-behavior-x: contain; scrollbar-width: none; }
.view-tabs:hover, .view-tabs:focus-within { scrollbar-width: thin; }
.view-tabs::-webkit-scrollbar { width: 0; height: 0; }
.view-tabs:hover::-webkit-scrollbar, .view-tabs:focus-within::-webkit-scrollbar { height: 6px; }
.view-tabs::-webkit-scrollbar-thumb { border-radius: 999px; background: var(--border-color-emphasis, #8c959f); }
.view-tabs::-webkit-scrollbar-track { background: transparent; }
.view-tab { position: relative; display: flex; flex: 0 0 auto; align-items: center; gap: 4px; max-width: 240px; min-height: 48px; cursor: pointer; }
.view-tab.active::after { content: ""; position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--bgColor-accent-emphasis, var(--background-color-accent-emphasis, #096
```