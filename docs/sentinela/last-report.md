# Sentinela — 2026-07-29T19:20:45.743Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 12 |
| Divergências detectadas | 13 |
| Issues novas | 8 |
| Issues já abertas (dedupe) | 5 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 548ms · CORS=`*`
- 🟢 **MCP status** — `200` em 390ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 208ms · CORS=`*`
- 🔴 **Install status** — `503` em 198ms
- 🟢 **Painel** — `200` em 255ms · CORS=`*`
- 🟢 **API** — `200` em 241ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: lupa-conformance (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: lupa-conformance (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: porta-de-entrada (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Pipeline — Telegram + Painel (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: Dependabot Auto-Merge (só patches) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
