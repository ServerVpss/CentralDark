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
| **Owner de geração** | `scripts/grafo-vivo/gerar-grafo-vivo.mjs` |
| **Scheduler CURRENT na VPS** | `/etc/cron.d/centraldark-grafo-unificado` → `cron-grafo-unificado.sh` a cada 6h |
| **Arquivo canônico vivo** | `apps/modulos/status/graph-data.json` |
| **Espelho do Graph Panel** | `apps/modulos/graph-panel/data/graph.json` (mesmo payload) |
| **API** | `https://grafo.centralldark.com/api/graph` lê o canônico |
| **UI oficial** | `https://grafo.centralldark.com/` → `public/index.html` (JARVIS) |
| **Writer da projeção BRAIN** | `scripts/grafo-vivo/obsidian-nota.mjs` |
| **BRAIN primário** | `docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md` |
| **BRAIN legado compatível** | `docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md` — espelho, não segundo owner |
| **Freshness** | ambos devem carregar o mesmo `GRAPH_FINGERPRINT`; mismatch = STALE, regenerar |
| **Mega Painel grafo** | status `app.js` lê `graph-data.json` |
| **Hermes GraphRAG** | só **lê**; não vira escritor do grafo |

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

## Reconciliação 2026-10-01 — causa do BRAIN stale

Medição CURRENT encontrou:

```text
graph-data.json=ATUALIZADO_PELO_CRON
docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md=STALE
docs/BRAIN/00-MAPA-SISTEMA/02-GRAFOS/GRAFO-VIVO.md=STALE_AINDA_MAIS_ANTIGO
PM2_CentralDark-GrafoVivo=NAO_OBSERVADO
CRON_GRAFO_UNIFICADO=ATIVO_CONFIGURADO
```

Causa: o cron atual terminava em `gerar-grafo-vivo.mjs` e **não chamava** `obsidian-nota.mjs`; além disso, o writer da nota apontava só para o caminho legado com espaços.

Correção no mesmo sistema:

```text
CRON
→ GRAPHIFY
→ IMPORT
→ gerar-grafo-vivo.mjs
→ obsidian-nota.mjs
→ PRIMARY + LEGACY_COMPAT com mesmo GRAPH_FINGERPRINT
```

`ONE_SYSTEM_ONLY=true` · `ONE_WRITER_PER_SCOPE=true` · `GRAPH != AUTHORITY` · `STALE_BRAIN_GRAPH != CURRENT`.
