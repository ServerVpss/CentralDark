# Sentinela — 2026-07-12T19:09:24.747Z

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

- 🟢 **MCP health** — `200` em 225ms · CORS=`*`
- 🟢 **MCP status** — `200` em 226ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 96ms · CORS=`*`
- 🔴 **Install status** — `502` em 80ms
- 🟢 **Painel** — `200` em 140ms · CORS=`*`
- 🟢 **API** — `200` em 99ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
