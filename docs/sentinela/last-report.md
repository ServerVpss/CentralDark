# Sentinela — 2026-07-15T13:48:22.688Z

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

- 🟢 **MCP health** — `200` em 436ms · CORS=`*`
- 🟢 **MCP status** — `200` em 300ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 202ms · CORS=`*`
- 🔴 **Install status** — `502` em 167ms
- 🟢 **Painel** — `200` em 237ms · CORS=`*`
- 🟢 **API** — `200` em 207ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
