# Sentinela — 2026-06-28T04:05:18.330Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 4 |
| Divergências detectadas | 6 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 6 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 262ms · CORS=`*`
- 🟢 **MCP status** — `200` em 193ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 80ms · CORS=`*`
- 🔴 **Install status** — `502` em 85ms
- 🟢 **Painel** — `200` em 94ms · CORS=`*`
- 🔴 **API** — `404` em 112ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: CORS Validator (bot: `codex`)
