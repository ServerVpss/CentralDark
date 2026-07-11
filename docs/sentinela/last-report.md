# Sentinela — 2026-07-11T19:08:17.805Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 3 |
| Divergências detectadas | 4 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 3 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 259ms · CORS=`*`
- 🟢 **MCP status** — `200` em 275ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 115ms · CORS=`*`
- 🔴 **Install status** — `502` em 104ms
- 🟢 **Painel** — `200` em 140ms · CORS=`*`
- 🟢 **API** — `200` em 140ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
