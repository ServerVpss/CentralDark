# Sentinela — 2026-07-30T14:07:58.043Z

| Métrica | Valor |
|---|---|
| Endpoints checados | 6 |
| Endpoints fora | 1 |
| Workflows vermelhos 24h | 20 |
| Divergências detectadas | 22 |
| Issues novas | 10 |
| Issues já abertas (dedupe) | 12 |
| Dry-run? | não |

## Endpoints

- 🟢 **MCP health** — `200` em 297ms · CORS=`*`
- 🟢 **MCP status** — `200` em 242ms · CORS=`*`
- 🟢 **MCP tools** — `200` em 124ms · CORS=`*`
- 🔴 **Install status** — `503` em 117ms
- 🟢 **Painel** — `200` em 121ms · CORS=`*`
- 🟢 **API** — `200` em 125ms · CORS=`*`

## Divergências

- **[p2]** Endpoints → Endpoint Install status fora do ar (HTTP 503) (bot: `claude`)
- **[p2]** Workflows → Workflow vermelho: supabase-bot (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: painel-validacao (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: sentinela-divergencias (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: sentinela-divergencias (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: sentinela-divergencias (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: codex-validate (bot: `codex`)
- **[p2]** Workflows → Workflow vermelho: PR auto-review (Codex + checklist) (bot: `codex`)
- **[p2]** Drift-VPS → DRIFT (BRANCH_DIVERGENTE) — VPS divergente do GitHub (bot: `claude`)

## Drift GitHub <-> VPS

- Status: `DRIFT` (BRANCH_DIVERGENTE)
- checkout está em "chore/gateway-providers-routes", esperado "main"

