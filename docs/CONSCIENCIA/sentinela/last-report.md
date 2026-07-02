---
title: "Last Report"
date: 2026-07-02
tags: ["consciencia"]
updated: 2026-07-02
---

# Sentinela — 2026-06-30T20:02:26.008Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 5 |
| Workflows vermelhos 24h | 4 |
| Divergências detectadas | 9 |
| Issues novas | 4 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🔴 **MCP health** — `0` em 200ms · erro: fetch failed
- 🔴 **MCP status** — `0` em 47ms · erro: fetch failed
- 🔴 **MCP tools** — `0` em 43ms · erro: fetch failed
- 🔴 **Install status** — `502` em 109ms
- 🟢 **Painel** — `200` em 114ms · CORS=`*`
- 🔴 **API** — `404` em 106ms

## Divergências

- **[p1]** Endpoints → Endpoint MCP health fora do ar (HTTP 0) (bot: `grok`)
- **[p1]** Endpoints → Endpoint MCP status fora do ar (HTTP 0) (bot: `grok`)
- **[p1]** Endpoints → Endpoint MCP tools fora do ar (HTTP 0) (bot: `codex`)
- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
