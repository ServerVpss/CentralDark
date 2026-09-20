# Grafo padrão 2026 — VPS + Obsidian (fase 1+2)

## Stack (igual a galera)

```text
Graphify (repo) → import painel → /api/graph
GrafoVivo 5min  → mode=vivo (PM2)
Plugin Obsidian → só CONSOME a API (poll + auto-update do plugin)
GraphRAG Hermes → só LÊ a mesma API
```

## URLs

| Uso | URL |
|-----|-----|
| Site 3D | https://grafo.centralldark.com/ |
| API UI (Graphify ~2.5k) | https://grafo.centralldark.com/api/graph |
| API PM2 vivo | https://grafo.centralldark.com/api/graph?mode=vivo |
| API full Graphify | https://grafo.centralldark.com/api/graph?mode=full |
| Plugin default | `mode=vivo` (leve, tempo real) |

## Quem atualiza

| Motor | Freq | Escreve |
|-------|------|---------|
| `graphify update` + import | cron 6h | `graph-full.json` + `graph.json` |
| `CentralDark-GrafoVivo` | 5 min | `status/graph-data.json` |
| Plugin auto-update | 10 min | binários do plugin (não o grafo) |
| Plugin poll | 15 s | só lê |

## Obsidian em casa

1. Plugin: `apps/modulos/obsidian-plugin-grafo-vivo` (build → `.obsidian/plugins/centraldark-grafo-vivo/`)
2. URL do grafo = `https://grafo.centralldark.com/api/graph?mode=vivo`
3. Auto-update do plugin: ligado (changelog antes de aplicar)
4. Nota Mermaid auto: `docs/BRAIN/00 - Mapa do Sistema/GRAFO-VIVO.md` (VPS)

## Scripts

- `scripts/grafo-vivo/import-graphify-to-panel.mjs`
- `scripts/grafo-vivo/cron-grafo-unificado.sh`
- cron: `/etc/cron.d/centraldark-grafo-unificado`
