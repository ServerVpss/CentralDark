# Grafo — uma fonte, um escritor (2026-07-14)

**Problema:** vários escritores + HTMLs paralelos (Lovable/Fable/erro de comunicação) + feeds diferentes.

## Antes

| Quem | O quê | Intervalo |
|------|--------|-----------|
| PM2 `CentralDark-GrafoVivo` | escrevia `status/graph-data.json` | 5 min |
| PM2 `CentralDark-Hermes` | `atualizarGrafo()` mesmo gerador | 30 min (**duplicata**) |
| `graph-panel/data/graph.json` | pipeline antigo / fallback 318 nós | **stale** (02/07) |
| public `vault.html`, `2d.html`, baks | páginas extras em grafo.centralldark.com | confusão |

## Depois (canônico)

| Papel | Quem |
|-------|------|
| **Único escritor** | `CentralDark-GrafoVivo` → `gerar-grafo-vivo.mjs` |
| **Arquivo canônico** | `apps/modulos/status/graph-data.json` |
| **Espelho** | `apps/modulos/graph-panel/data/graph.json` (mesmo payload) |
| **API** | `https://grafo.centralldark.com/api/graph` lê o canônico |
| **UI oficial** | `https://grafo.centralldark.com/` → `public/index.html` (JARVIS) |
| **Obsidian** | `obsidian-nota.mjs` lê o **mesmo** `graph-data.json` (não quebra) |
| **Mega Painel grafo** | status `app.js` lê `graph-data.json` |
| **Hermes GraphRAG** | só **lê** (API :3030); auto-regen **OFF** (`GRAFO_INTERVAL=0`) |

## HTML arquivado (não apagado do disco)

`apps/modulos/graph-panel/public/_arquivo_erro_comunicacao/`:

- vault.html  
- 2d.html  
- graph.js  
- index.html.bak-*  

URLs `/vault.html` e `/2d.html` → **404** (esperado).

## Lovable / Sonnet

Não criar novas páginas HTML soltas em `graph-panel/public/`.  
Uma UI = `index.html`. Dados = `/api/graph` (canônico).  
Ver também `missoes/MAPA-VIVO/`.
