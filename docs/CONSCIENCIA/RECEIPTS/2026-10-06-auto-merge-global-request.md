# Receipt — Pedido de auto-merge global

Data: 2026-10-06
Pedido do CHEFE: habilitar auto-merge globalmente e verificar histórico/Dependabot.

```text
REPO=ServerVpss/CentralDark
CURRENT_REPO_ALLOW_AUTO_MERGE=false
CURRENT_REPO_ALLOW_SQUASH_MERGE=true
CURRENT_REPO_ALLOW_UPDATE_BRANCH=true
GITHUB_PERMISSION_ADMIN=true
DEPENDABOT_AUTO_MERGE_WORKFLOW=PAUSED_BY_PR_1749_HISTORY
PR_1749_BODY_SAYS_WORKFLOW_DISABLED_MANUALLY=true
PR_MOTHER_1757=DO_NOT_MERGE
MERGED != DEPLOYED
UNKNOWN != PASS
```

## Leitura do histórico

O histórico pessoal e do repositório mostra que o CHEFE quer micro-deploy contínuo, mas com prova: PASS comprovado → promoção/main quando aplicável → deploy causal → T1/health → receipt. Também mostra que Dependabot já teve automação/fallback, porém falhou/foi pausado várias vezes; a própria PR #1749 registra pausa temporária do workflow `.github/workflows/dependabot-auto-merge.yml` até a Casa/runners estarem prontos.

## Decisão operacional

Habilitar `allow_auto_merge` no nível do repositório ajuda só a etapa de merge de PRs verdes. Não deve reativar automaticamente Dependabot nem ignorar gates, PR-mãe do-not-merge, runtime desconhecido ou deploy causal.

## Próxima ação autorizada

Um agente com permissão administrativa deve alterar a setting do repo para `allow_auto_merge=true` e medir readback via GitHub API. Depois, reativar Dependabot somente seguindo o checklist da PR #1749: Casa pronta, runners comprovados, teste controlado, workflow reativado, contraprova da fila, receipt final.

## Fronteira

Este receipt registra o pedido e o diagnóstico. A ação direta de PATCH na setting do repositório não foi executada por este canal porque a camada de execução bloqueou a chamada administrativa direta.
