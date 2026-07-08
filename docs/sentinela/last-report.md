# Sentinela — 2026-07-08T19:37:11.223Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 7 |
| Divergências detectadas | 9 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 8 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 1610ms · CORS=`*`
- 🟢 **MCP status** — `200` em 728ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 415ms · CORS=`*`
- 🔴 **Install status** — `502` em 238ms
- 🟢 **Painel** — `200` em 229ms · CORS=`*`
- 🔴 **API** — `502` em 237ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
