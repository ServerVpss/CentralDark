# Sentinela — 2026-06-27T13:48:23.751Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 5 |
| Divergências detectadas | 7 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 7 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 188ms · CORS=`*`
- 🟢 **MCP status** — `200` em 214ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 66ms · CORS=`*`
- 🟢 **Install status** — `200` em 100ms · CORS=`*`
- 🔴 **Painel** — `404` em 128ms · CORS=`*`
- 🔴 **API** — `404` em 144ms

## Divergências

- **[p2]** Endpoints → Endpoint Painel fora do ar (HTTP 404) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: CORS Validator (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
