# Bot Ecosystem Map + Nous Free Models — Session 2026-09-05

## Bot Inventory (Operational)

| Bot | Script | Workflow | Function | Trigger |
|-----|--------|----------|----------|---------|
| GitHub Bot Controller | `scripts/github-bot-controller.mjs` | `github-bot-controller.yml` | Fecha PRs superseded com receipt `Lineage-Absorption: #N@HEAD=PROVEN` | `workflow_dispatch` + `pull_request.closed` + `schedule` |
| VPS HealthCheck | `scripts/bots/vps-healthcheck.mjs` | `vps-healthcheck.yml` | 10 checks read-only (PM2, portas, disco, inodes, memória, load, Caddy, git, grok-worktrees, uptime) | `schedule 6h` + `workflow_dispatch` |
| WuzAPI Sessions Monitor | `scripts/bots/wuzapi-sessions-monitor.mjs` | *(referenciado)* | Monitora sessões MultiZap/WuzAPI, sanitiza JIDs, abre/atualiza Issue dedup | `~15min` |
| Dispatcher Bots | — | `dispatcher-bots.yml` | Roteia Issues/PRs por label `🧠 AGENTE-*` → briefing idempotente | `issues.labeled/opened` + `pull_request_target.labeled/opened` |
| Bot-Server Validate | — | `bot-server-validate.yml` | 9 validadores offline (Lotes 2–10) p/ `bot-server/**` | `pull_request` + `push` + `workflow_dispatch` |
| Bots Labels Seed | — | `bots-labels-seed.yml` | Reconcilia catálogo canônico labels, migra aliases, remove obsoletas | `workflow_dispatch` + `schedule mensal` + `push main` |

**Lib compartilhada**: `scripts/bots/lib/gh.mjs` — helpers GitHub (findBotIssue, createIssue, updateIssue, repo)

## Nous Free Models Validados

**Token**: lido dinamicamente do `E:\CentralDark\Pivete\auth.json` pelo Omni Router (`centraldark_omni_router.py:146`)

**Endpoint**: `https://inference-api.nousresearch.com/v1`

| Modelo | Latência | Status |
|--------|----------|--------|
| `nous/poolside/laguna-xs-2.1:free` | 3.4s | ✅ Funciona |
| `nous/stepfun/step-3.7-flash:free` | 43s | ⚠️ Lento |
| `nous/inclusionai/ling-3.0-flash-sante:free` | 2.9s | ✅ Funciona |

**Modelos pagos**: exigem créditos (ex: `meta-llama/llama-3.1-70b-instruct` → 404 `insufficient_credits_for_paid_model`)

**Rota `nous/auto`**: 404 "Model 'auto' not found" — precisa modelo explícito

## PR #1381 Fixed Point — Commits Aplicados

| Commit | Descrição |
|--------|-----------|
| `1ee31ea24eeb76b842f5b963ab1bb9e4fe5d122f` | MASTER_INGRESS_ALIASES + master_funnel + !CENTRALUTIL + anti-recursão/reentry guard + negação fail-closed |
| `5ce6e667ec02818f18ed7dca84fc18b53ed59477` | Contraprovas/testes do funil |

**Estado**: HEAD `5ce6e667ec...` | BASE `0542cee586...` | STATE OPEN | MERGEABLE false | CI remoto: `statuses=[]` (não provado)

**Anti-loop**: Gatilho interno durante sessão ativa não reentra no master (evita `!CENTRALDARK → #ACORDAR → !CENTRALDARK`)

## Cadeia de Autenticação (Atualizada 2026-09-05)

| Componente | Status | Detalhes |
|------------|--------|----------|
| Nous token | ✅ | `auth.json` → Omni Router dinâmico |
| Omni Router | ✅ | Porta 8099 ativa, engine `nous` free, fallback `centraldark-router` |
| MCP_CENTRALDARK_TOKEN | ⚠️ Vazio local | `ecosystem.config.cjs:72` — vem do VPS via `sync-mcp-password.sh` |
| Hermes profile | ✅ | Provider `centraldark-router`, base_url `http://127.0.0.1:8099/v1` |
| **Faltando** | | |
| OPENAI_API_KEY | ❌ | OpenRouter |
| HERMES_AUTH_TOKEN | ❌ | Se usar Hermes local |
| Claude Code trust | ❌ | `hasTrustDialogAccepted: true` no `~/.claude.json` |
| MCP token sync | ❌ | `sync-mcp-password.sh` na VPS |

## Pro Plan Blocked

- Pagamento R$ 110,00 não cobrado (Visa •••• 2259, venc 31/08)
- Acesso pausado até quitar — afeta !ACORDAR e features Pro
- Fallback via API principal só com pagamento ativo