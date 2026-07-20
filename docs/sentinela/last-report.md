# Sentinela — 2026-07-20T14:11:14.201Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 3 |
| Divergências detectadas | 4 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 4 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 937ms · CORS=`*`
- 🟢 **MCP status** — `200` em 535ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 373ms · CORS=`*`
- 🔴 **Install status** — `503` em 195ms
- 🟢 **Painel** — `200` em 419ms · CORS=`*`
- 🟢 **API** — `200` em 405ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
