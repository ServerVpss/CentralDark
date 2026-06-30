# Sentinela — 2026-06-30T14:24:48.259Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 4 |
| Divergências detectadas | 6 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 260ms · CORS=`*`
- 🟢 **MCP status** — `200` em 183ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 90ms · CORS=`*`
- 🔴 **Install status** — `502` em 102ms
- 🟢 **Painel** — `200` em 104ms · CORS=`*`
- 🔴 **API** — `404` em 131ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
