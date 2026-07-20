# Sentinela — 2026-07-20T03:24:42.178Z

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

- 🟢 **MCP health** — `200` em 298ms · CORS=`*`
- 🟢 **MCP status** — `200` em 245ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 189ms · CORS=`*`
- 🔴 **Install status** — `503` em 97ms
- 🟢 **Painel** — `200` em 125ms · CORS=`*`
- 🟢 **API** — `200` em 128ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
