# PADRAO - admin-patterns-ui.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\admin-patterns-ui.js
**SHA:** f15c75a23439261f
**Timestamp:** 2026-08-28T02:54:31.793337
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- <div class="pattern-note">Regra: PROVEN_ADMINISTRABLE → registrar em <code>docs/CONSCIENCIA/ADMINISTRAVEIS.json</code> → esta aba renderiza automaticamente.</div>
- IN_RECURRING_PATTERN:'absorvido no padrão'

### Gaps
- .pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
- .pattern-toolbar,.admin-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
- .pattern-office{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
- .pattern-drawer-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.pattern-drawer-title b{color:var(--em2);font-size:14px}.pattern-count{font-size:11px;color:var(--muted)}
- .pattern-item summary{list-style:none;cursor:pointer;padding:12px 13px;display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.pattern-item summary::-webkit-details-marker{display:
- .pattern-section ul{margin:4px 0 0 18px;padding:0;color:var(--text)}.pattern-target{font-family:ui-monospace,monospace;color:#c8f5eb;overflow-wrap:anywhere}.pattern-tokens{display:flex;flex-wrap:wrap;
- .admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
- .admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:17px;position:relative;over
- .admin-card-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.admin-title-wrap{display:flex;gap:10px;align-items:flex-start}.admin-glyph{font-size:25px;line-height:1}.ad
- .admin-purpose{font-size:12px;color:var(--muted);margin:12px 0}.admin-command{display:flex;gap:8px;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10

### Ouro Bruto (primeiros 5000 chars)
```
import { readFileSync } from 'node:fs';
import { readPatternLibrary } from '../../../../scripts/memory-linker/pattern-library.mjs';
const ADMIN_REGISTRY_URL = new URL('../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json', import.meta.url);
export const PATTERN_ADMIN_STYLE = `
.pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.pattern-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}
.pattern-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}.pattern-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
.pattern-toolbar,.admin-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.pattern-toolbar input,.admin-toolbar input{flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:9px;font:inherit}
.pattern-office{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.pattern-drawer{background:var(--surf);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.pattern-drawer-head{padding:15px 18px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(52,211,153,.03));border-bottom:1px solid var(--border)}
.pattern-drawer-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.pattern-drawer-title b{color:var(--em2);font-size:14px}.pattern-count{font-size:11px;color:var(--muted)}
.pattern-purpose{font-size:12px;color:var(--muted);margin-top:5px}
.pattern-list{padding:10px}.pattern-empty{padding:18px;color:var(--muted);font-size:12px;text-align:center}
.pattern-item{border:1px solid rgba(15,89,81,.75);border-radius:10px;margin:8px 0;background:rgba(3,31,29,.35)}
.pattern-item summary{list-style:none;cursor:pointer;padding:12px 13px;display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.pattern-item summary::-webkit-details-marker{display:none}
.pattern-item summary:hover{background:rgba(16,185,129,.05)}
.pattern-item-title{font-size:13px;font-weight:700;line-height:1.35}.pattern-item-meta{font-size:10.5px;color:var(--muted);margin-top:5px}
.pattern-status{font-size:10px;padding:3px 7px;border-radius:99px;border:1px solid var(--border);white-space:nowrap;color:var(--muted)}
.pattern-status.ready{color:var(--em2);border-color:rgba(52,211,153,.45);background:rgba(16,185,129,.12)}
.pattern-status.quarantine{color:var(--warn);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
.pattern-body{padding:0 13px 13px;border-top:1px dashed rgba(15,89,81,.6);font-size:12px}.pattern-section{margin-top:10px}.pattern-section strong{color:var(--em2);display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.4px}
.pattern-section ul{margin:4px 0 0 18px;padding:0;color:var(--text)}.pattern-target{font-family:ui-monospace,monospace;color:#c8f5eb;overflow-wrap:anywhere}.pattern-tokens{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.pattern-token{font-size:10px;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:2px 6px}
.pattern-note{font-size:11px;color:var(--muted);margin:10px 0 0}
.admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.admin-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}.admin-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}.admin-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}
.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:17px;position:relative;overflow:hidden}.admin-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--em),var(--em2))}
.admin-card-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.admin-title-wrap{display:flex;gap:10px;align-items:flex-start}.admin-glyph{font-size:25px;line-height:1}.admin-title{font-size:16px;font-weight:800;color:var(--text)}.admin-sub{font-size:11px;color:var(--muted);margin-top:3px}.admin-status{font-size:10px;color:var(--em2);border:1px solid rgba(52,211,153,.4);background:rgba(16,185,129,.1);padding:4px 8px;border-radius:99px;white-space:nowrap}
.admin-purpose{font-size:12px;color:var(--muted);margin:12px 0}.admin-command{display:flex;gap:8px;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:ui-monospace,'SF Mono',monospace;color:#c8f5eb}.admin-command code{flex:1;overflow-wrap:anywhere}.admin-mini-btn{border:1px solid var(--border2);background:transparent;color:var(--em2);border-radius:8px;padding:6px 8px;cursor:pointer;font:inherit}.admin-mini-btn:hover{background:rgba(16,185,129,.08)}
.admin-actions{display:
```

---

# PADRAO - admin-patterns-ui.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\admin-patterns-ui.js
**SHA:** f59c968c2d3609c0
**Timestamp:** 2026-08-28T02:54:42.787285
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- <div class="pattern-note">Regra: PROVEN_ADMINISTRABLE → registrar em <code>docs/CONSCIENCIA/ADMINISTRAVEIS.json</code> → esta aba renderiza automaticamente.</div>
- IN_RECURRING_PATTERN:'absorvido no padrão'

### Gaps
- .pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
- .pattern-toolbar,.admin-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
- .pattern-office{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
- .pattern-drawer-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.pattern-drawer-title b{color:var(--em2);font-size:14px}.pattern-count{font-size:11px;color:var(--muted)}
- .pattern-item summary{list-style:none;cursor:pointer;padding:12px 13px;display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.pattern-item summary::-webkit-details-marker{display:
- .pattern-section ul{margin:4px 0 0 18px;padding:0;color:var(--text)}.pattern-target{font-family:ui-monospace,monospace;color:#c8f5eb;overflow-wrap:anywhere}.pattern-tokens{display:flex;flex-wrap:wrap;
- .admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
- .admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:17px;position:relative;over
- .admin-card-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.admin-title-wrap{display:flex;gap:10px;align-items:flex-start}.admin-glyph{font-size:25px;line-height:1}.ad
- .admin-purpose{font-size:12px;color:var(--muted);margin:12px 0}.admin-command{display:flex;gap:8px;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10

### Ouro Bruto (primeiros 5000 chars)
```
import { readFileSync } from 'node:fs';
import { readPatternLibrary } from '../../../../scripts/memory-linker/pattern-library.mjs';

const ADMIN_REGISTRY_URL = new URL('../../../../docs/CONSCIENCIA/ADMINISTRAVEIS.json', import.meta.url);

export const PATTERN_ADMIN_STYLE = `
.pattern-head{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.pattern-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}
.pattern-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}.pattern-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}
.pattern-toolbar,.admin-toolbar{display:flex;gap:8px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.pattern-toolbar input,.admin-toolbar input{flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:10px 12px;border-radius:9px;font:inherit}
.pattern-office{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.pattern-drawer{background:var(--surf);border:1px solid var(--border);border-radius:14px;overflow:hidden}
.pattern-drawer-head{padding:15px 18px;background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(52,211,153,.03));border-bottom:1px solid var(--border)}
.pattern-drawer-title{display:flex;justify-content:space-between;gap:10px;align-items:center}.pattern-drawer-title b{color:var(--em2);font-size:14px}.pattern-count{font-size:11px;color:var(--muted)}
.pattern-purpose{font-size:12px;color:var(--muted);margin-top:5px}
.pattern-list{padding:10px}.pattern-empty{padding:18px;color:var(--muted);font-size:12px;text-align:center}
.pattern-item{border:1px solid rgba(15,89,81,.75);border-radius:10px;margin:8px 0;background:rgba(3,31,29,.35)}
.pattern-item summary{list-style:none;cursor:pointer;padding:12px 13px;display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.pattern-item summary::-webkit-details-marker{display:none}
.pattern-item summary:hover{background:rgba(16,185,129,.05)}
.pattern-item-title{font-size:13px;font-weight:700;line-height:1.35}.pattern-item-meta{font-size:10.5px;color:var(--muted);margin-top:5px}
.pattern-status{font-size:10px;padding:3px 7px;border-radius:99px;border:1px solid var(--border);white-space:nowrap;color:var(--muted)}
.pattern-status.ready{color:var(--em2);border-color:rgba(52,211,153,.45);background:rgba(16,185,129,.12)}
.pattern-status.quarantine{color:var(--warn);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.08)}
.pattern-body{padding:0 13px 13px;border-top:1px dashed rgba(15,89,81,.6);font-size:12px}.pattern-section{margin-top:10px}.pattern-section strong{color:var(--em2);display:block;margin-bottom:4px;font-size:11px;text-transform:uppercase;letter-spacing:.4px}
.pattern-section ul{margin:4px 0 0 18px;padding:0;color:var(--text)}.pattern-target{font-family:ui-monospace,monospace;color:#c8f5eb;overflow-wrap:anywhere}.pattern-tokens{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}.pattern-token{font-size:10px;color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:2px 6px}
.pattern-note{font-size:11px;color:var(--muted);margin:10px 0 0}
.admin-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px}
.admin-kpi{background:linear-gradient(135deg,var(--surf),var(--surf2));border:1px solid var(--border);border-radius:12px;padding:14px}.admin-kpi .t{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.6px}.admin-kpi .n{font-size:24px;font-weight:800;color:var(--em2);margin-top:4px}
.admin-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.admin-card{background:var(--surf);border:1px solid var(--border);border-radius:14px;padding:17px;position:relative;overflow:hidden}.admin-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--em),var(--em2))}
.admin-card-head{display:flex;gap:12px;align-items:flex-start;justify-content:space-between}.admin-title-wrap{display:flex;gap:10px;align-items:flex-start}.admin-glyph{font-size:25px;line-height:1}.admin-title{font-size:16px;font-weight:800;color:var(--text)}.admin-sub{font-size:11px;color:var(--muted);margin-top:3px}.admin-status{font-size:10px;color:var(--em2);border:1px solid rgba(52,211,153,.4);background:rgba(16,185,129,.1);padding:4px 8px;border-radius:99px;white-space:nowrap}
.admin-purpose{font-size:12px;color:var(--muted);margin:12px 0}.admin-command{display:flex;gap:8px;align-items:center;background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-family:ui-monospace,'SF Mono',monospace;color:#c8f5eb}.admin-command code{flex:1;overflow-wrap:anywhere}.admin-mini-btn{border:1px solid var(--border2);background:transparent;color:var(--em2);border-radius:8px;padding:6px 8px;cursor:pointer;font:inherit}.admin-mini-btn:hover{background:rgba(16,185,129,.08)}
.admin-actions{displa
```