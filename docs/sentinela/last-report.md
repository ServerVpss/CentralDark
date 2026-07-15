# Sentinela — 2026-07-15T02:40:06.772Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 6 |
| Divergências detectadas | 7 |
| Issues novas | 2 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 1319ms · CORS=`*`
- 🟢 **MCP status** — `200` em 1781ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 886ms · CORS=`*`
- 🔴 **Install status** — `502` em 894ms
- 🟢 **Painel** — `200` em 1570ms · CORS=`*`
- 🟢 **API** — `200` em 1555ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
