# Sentinela — 2026-07-07T14:41:51.342Z

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

- 🟢 **MCP health** — `200` em 373ms · CORS=`*`
- 🟢 **MCP status** — `200` em 325ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 188ms · CORS=`*`
- 🔴 **Install status** — `502` em 199ms
- 🟢 **Painel** — `200` em 201ms · CORS=`*`
- 🔴 **API** — `502` em 179ms

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
