# Sentinela — 2026-07-08T02:54:28.623Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 2 |
| Workflows vermelhos 24h | 9 |
| Divergências detectadas | 11 |
| Issues novas | 1 |
| Issues já abertas (dedupe) | 10 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 230ms · CORS=`*`
- 🟢 **MCP status** — `200` em 290ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 161ms · CORS=`*`
- 🔴 **Install status** — `502` em 105ms
- 🟢 **Painel** — `200` em 118ms · CORS=`*`
- 🔴 **API** — `502` em 146ms

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Endpoints → Endpoint API fora do ar (HTTP 502) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
