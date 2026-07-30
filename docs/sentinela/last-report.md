# Sentinela — 2026-07-30T02:34:21.660Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 2 |
| Divergências detectadas | 3 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 2 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 225ms · CORS=`*`
- 🟢 **MCP status** — `200` em 207ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 112ms · CORS=`*`
- 🔴 **Install status** — `503` em 105ms
- 🟢 **Painel** — `200` em 114ms · CORS=`*`
- 🟢 **API** — `200` em 115ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
