# Sentinela — 2026-07-04T19:18:16.561Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 6 |
| Divergências detectadas | 8 |
| Issues novas | 3 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 321ms · CORS=`*`
- 🟢 **MCP status** — `200` em 219ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 112ms · CORS=`*`
- 🔴 **Install status** — `502` em 103ms
- 🟢 **Painel** — `200` em 116ms · CORS=`*`
- 🔴 **API** — `404` em 118ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: 🧠 Notion Sync (docs/CONSCIENCIA → Notion) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
