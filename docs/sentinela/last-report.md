# Sentinela — 2026-07-06T03:49:30.493Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 4 |
| Divergências detectadas | 6 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 201ms · CORS=`*`
- 🟢 **MCP status** — `200` em 263ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 115ms · CORS=`*`
- 🔴 **Install status** — `502` em 123ms
- 🟢 **Painel** — `200` em 87ms · CORS=`*`
- 🔴 **API** — `502` em 91ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: VPS Exec (self-hosted) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
