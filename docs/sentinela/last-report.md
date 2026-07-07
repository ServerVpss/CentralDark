# Sentinela — 2026-07-07T19:59:45.454Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 7 |
| Divergências detectadas | 9 |
| Issues novas | 2 |
| Issues já abertas (dedupe) | 7 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 226ms · CORS=`*`
- 🟢 **MCP status** — `200` em 227ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 97ms · CORS=`*`
- 🔴 **Install status** — `502` em 93ms
- 🟢 **Painel** — `200` em 104ms · CORS=`*`
- 🔴 **API** — `502` em 92ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
