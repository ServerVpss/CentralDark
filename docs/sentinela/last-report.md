# Sentinela — 2026-07-16T13:58:58.617Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 5 |
| Divergências detectadas | 6 |
| Issues novas | 3 |
| Issues já abertas (dedupe) | 3 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 528ms · CORS=`*`
- 🟢 **MCP status** — `200` em 383ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 279ms · CORS=`*`
- 🔴 **Install status** — `503` em 207ms
- 🟢 **Painel** — `200` em 246ms · CORS=`*`
- 🟢 **API** — `200` em 247ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: GitHub Bot Controller (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
