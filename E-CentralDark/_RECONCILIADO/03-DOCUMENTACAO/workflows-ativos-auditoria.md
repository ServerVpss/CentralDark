---
name: Bots GitHub operantes — mapa
description: Mapa dos 10 workflows ativos pós-auditoria 2026-06-09 (Codex, deploy, controller, painel, dependabot, codeql, pr-auto-review, bot-server-validate, farm-co-author, painel-auto-update). Guard ServerVpss/CentralDark.
type: reference
---

Estado pós-auditoria 2026-06-09 (`docs/RELATORIOS/2026-06-09-auditoria-workflows-bots.md`).

## 10 workflows ATIVOS — não desativar sem confirmação

| Workflow | Gatilho | Papel |
|---|---|---|
| `codex-validate.yml` | PR pra main | Valida AGENTS/CODEX/prompt/PR template + bloqueia segredo em docs |
| `github-bot-controller.yml` | cron diário 09:17 UTC + PR closed + dispatch | Fecha PRs substituídas com segurança |
| `deploy.yml` | push main | Guard temporário (SSH desativado — revisar separado) |
| `painel-vivo.yml` | dispatch | Atualização manual do painel com inputs explícitos |
| `dependabot.yml` (config, não workflow) | semanal seg | PRs de atualização em 5 escopos: actions, bot-server, mcp, install-callback, frontend (raiz) |
| `codeql.yml` | push/PR/cron semanal seg 09:17 UTC | Análise estática JS/TS |
| `pr-auto-review.yml` | PR opened/reopened/sync | Label `needs-codex-review` + checklist PT-BR + reaction heart |
| `bot-server-validate.yml` | PR/push em `CentralDark/apps/bot-server/**` | Roda 9 validadores offline Lotes 2–10 |
| `farm-co-author.yml` | push main | Verifica trailer `Co-authored-by: SegredoiDev` (medalha Pair Extraordinaire) |
| `painel-auto-update.yml` | push main (ignora painel-data.json) | Anexa evento no `painel-data.json` e commita |

## Guard universal em todos os workflows novos
```yaml
if: github.repository == 'ServerVpss/CentralDark'
```
Sem isso, fork ou espelho `segredounlock/clone-deck` rodaria automação por engano.

## 27 stubs zumbis em `.github/workflows/`
Listados no relatório. Manter desativados até PR de limpeza dedicado.

## Próxima onda (PENDENCIAS #110)
`release-please` · `semantic-pull-request` · `actionlint` · `gitleaks` · `codecov` quando houver suíte.
