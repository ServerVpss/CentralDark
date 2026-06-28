# Sentinela — 2026-06-28T13:52:16.383Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 7 |
| Divergências detectadas | 9 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 9 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 261ms · CORS=`*`
- 🟢 **MCP status** — `200` em 192ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 103ms · CORS=`*`
- 🔴 **Install status** — `502` em 104ms
- 🟢 **Painel** — `200` em 110ms · CORS=`*`
- 🔴 **API** — `404` em 126ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `lovable`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 404) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel auto-update (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: CORS Validator (bot: `codex`)
