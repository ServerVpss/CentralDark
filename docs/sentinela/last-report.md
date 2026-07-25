# Sentinela — 2026-07-25T13:39:30.318Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 5 |
| Divergências detectadas | 6 |
| Issues novas | 2 |
| Issues já abertas (dedupe) | 4 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 203ms · CORS=`*`
- 🟢 **MCP status** — `200` em 212ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 75ms · CORS=`*`
- 🔴 **Install status** — `503` em 87ms
- 🟢 **Painel** — `200` em 117ms · CORS=`*`
- 🟢 **API** — `200` em 99ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
