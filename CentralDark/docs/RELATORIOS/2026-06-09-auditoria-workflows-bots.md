# Auditoria dos bots GitHub — 2026-06-09

**Repo:** `ServerVpss/CentralDark` · **Total de workflows:** 31

## Resumo

```text
ANTES                                        DEPOIS
─────────────                                ──────────────
ativos úteis    4                            ativos úteis   10  (+6)
stubs zumbis   27                            stubs zumbis   27  (mantidos pra histórico)
dependabot      ❌                           dependabot     ✅
codeql          ❌                           codeql         ✅
auto-review PR  ❌                           auto-review    ✅
validate bot    ❌                           validate bot   ✅
farm co-author  ❌                           farm           ✅
painel auto     ❌                           painel auto    ✅
```

## Classificação por arquivo

### ATIVO ÚTIL (manter como está)
| Arquivo | Gatilho | Papel |
|---|---|---|
| `codex-validate.yml` | PR pra main | Valida AGENTS/CODEX/prompt/PR template + bloqueia segredo nos docs |
| `github-bot-controller.yml` | cron diário + PR closed | Audita PRs e fecha substituídas com segurança |
| `deploy.yml` | push na main | Guard temporário (SSH desativado — revisar em entrega separada) |
| `painel-vivo.yml` | dispatch manual | Inputs explícitos pra atualizar painel sob demanda |

### NOVOS — entrega desta auditoria (6)
| Arquivo | Gatilho | Papel |
|---|---|---|
| `dependabot.yml` (config) | semanal seg 06:00 BRT | PRs npm + GitHub Actions em 5 escopos |
| `codeql.yml` | push/PR/weekly | Análise estática JS/TS |
| `pr-auto-review.yml` | PR opened/sync | Label `needs-codex-review` + checklist PT-BR + heart |
| `bot-server-validate.yml` | PR/push em `CentralDark/apps/bot-server/**` | Roda 9 validadores offline (Lotes 2–10) |
| `farm-co-author.yml` | push na main | Valida trailer `Co-authored-by: SegredoiDev` (medalha Pair Extraordinaire) |
| `painel-auto-update.yml` | push na main | Registra evento "push <sha>" em `painel-data.json` e commita |

### STUB-ZUMBI (recomendação: consolidar ou remover em entrega futura)
Os 27 abaixo viraram stubs "manual_only desativado" na limpeza dos workflows vermelhos. Mantêm o nome de arquivo só por histórico. Recomendado: deletar em PR futuro depois de confirmar que nenhum link externo aponta pra eles.

```text
ativar-monitor-tarefas              auditoria-080-clone-deck      auto-pr-memoria
atualiza-memoria-consciencia        consciencia-sync              deploy-fallback
diagnostico-disco-multizap          farm-pr-check                 fase-04-ajustar-actions-e-mcp
housekeeping                        inventario-root-vps           lovable-rescue-edit-branch
lovable-sync-ping                   mirror-to-segredounlock       one-shot-mcp-branding
one-shot-mcp-branding-v2            one-shot-vps-mcp-branding-apply  orquestrador-multizap
patch-install-landing-design        run-once-add-mcp-icon         run-once-instalar-grok-safe
run-once-monitor-tarefas            supabase-db-push              supabase-migrations
sync-healthcheck                    sync-to-segredounlock         validate-memoria
```

### REATIVAR (quando der OK separado)
- `deploy-fallback.yml` — SSH idempotente após 30s. Requer secret SSH na conta + decisão sobre o `webhook-bot`.
- `farm-pr-check.yml` — checagens de farm (Pull Shark/YOLO/Quickdraw). Substituído parcialmente pelo `farm-co-author.yml` novo.
- `mirror-to-segredounlock.yml` — espelho passivo pra farm de medalhas. Reativar quando a fila estabilizar.
- `supabase-migrations.yml` — quando voltar a evolução de schema.

## Codex — estado da configuração

| Item | Caminho | Status |
|---|---|---|
| Identidade | `AGENTS.md` | ✅ |
| Manual operacional | `CODEX.md` | ✅ |
| Prompt sistema | `.github/codex/prompts/centraldark-system.md` | ✅ |
| Template PR | `.github/pull_request_template.md` | ✅ |
| Workflow validate | `.github/workflows/codex-validate.yml` | ✅ |
| Auto-review em todo PR | `.github/workflows/pr-auto-review.yml` | ✅ (NOVO) |

## Próximos bots (PENDENCIAS #110)
- `release-please` — versionamento automático + changelog.
- `semantic-pull-request` — força título de PR no padrão Conventional Commits.
- `codecov` ou `coveralls` — quando houver suíte de testes com cobertura.
- `actionlint` — lint dos próprios YAMLs em CI.
- `gitleaks` — escaneia segredo vazado em commit.

## Hash do estado pós-entrega
- Workflows ativos úteis: **10**
- Dependabot escopos: **5** (actions, bot-server, mcp, install-callback, frontend)
- CodeQL linguagens: **1** (javascript-typescript)
- Validadores offline cobertos em CI: **9** (Lotes 2/3 + 4–10)
