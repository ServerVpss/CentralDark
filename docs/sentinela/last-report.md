# Sentinela — 2026-07-09T03:32:46.538Z

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

- 🟢 **MCP health** — `200` em 281ms · CORS=`*`
- 🟢 **MCP status** — `200` em 225ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 105ms · CORS=`*`
- 🔴 **Install status** — `502` em 88ms
- 🟢 **Painel** — `200` em 94ms · CORS=`*`
- 🔴 **API** — `502` em 109ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
