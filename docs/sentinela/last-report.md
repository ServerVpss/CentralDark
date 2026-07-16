# Sentinela — 2026-07-16T08:18:08.246Z

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

- 🟢 **MCP health** — `200` em 276ms · CORS=`*`
- 🟢 **MCP status** — `200` em 271ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 122ms · CORS=`*`
- 🔴 **Install status** — `502` em 153ms
- 🟢 **Painel** — `200` em 128ms · CORS=`*`
- 🟢 **API** — `200` em 123ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 502) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
