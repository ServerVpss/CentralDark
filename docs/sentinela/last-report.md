# Sentinela — 2026-06-28T08:56:50.424Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 3 |
| Divergências detectadas | 5 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 195ms · CORS=`*`
- 🟢 **MCP status** — `200` em 178ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 79ms · CORS=`*`
- 🔴 **Install status** — `502` em 80ms
- 🟢 **Painel** — `200` em 100ms · CORS=`*`
- 🔴 **API** — `404` em 98ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
