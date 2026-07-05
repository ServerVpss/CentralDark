# Sentinela — 2026-07-05T08:56:33.729Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 3 |
| Divergências detectadas | 5 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 4 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 323ms · CORS=`*`
- 🟢 **MCP status** — `200` em 217ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 85ms · CORS=`*`
- 🔴 **Install status** — `502` em 77ms
- 🟢 **Painel** — `200` em 98ms · CORS=`*`
- 🔴 **API** — `0` em 5003ms · erro: This operation was aborted

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p1]** Endpoints → Endpoint API fora do ar (HTTP 0) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
