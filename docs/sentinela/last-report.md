# Sentinela — 2026-07-07T03:39:35.978Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 5 |
| Divergências detectadas | 7 |
| Issues novas | 0 |
| Issues já abertas (dedupe) | 7 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 603ms · CORS=`*`
- 🟢 **MCP status** — `200` em 663ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 338ms · CORS=`*`
- 🔴 **Install status** — `502` em 300ms
- 🟢 **Painel** — `200` em 328ms · CORS=`*`
- 🔴 **API** — `502` em 333ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
