# COMANDO - pipeline-notify.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\.github\workflows\pipeline-notify.yml
**SHA:** bf26c98b6c1e2ecf
**Timestamp:** 2026-08-28T02:56:03.684127
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: Pipeline — Telegram + Painel

# Notifica Telegram e atualiza o Mega Painel em cada estágio do ciclo de vida.
# Estágios cobertos:
#   🔁 PR ABERTO     → pull_request opened/ready_for_review
#   🧪 CHECKS        → pull_request synchronize (novo commit → checks rodando)
#   ✅ APROVADO      → pull_request_review approved
#   🔄 REVISÃO       → pull_request_review changes_requested
#   🟢 MERGEADO      → pull_request closed + merged=true
#   ❌ FECHADO       → pull_request closed + merged=false
#
# NOTA (28/06/2026): o estágio "🚀 VPS ATUALIZADA" NÃO vem mais daqui.
# O deploy real é feito pelo webhook (PM2 CentralDark-WebhookDeploy), fora do
# GitHub Actions. A notificação "VPS ATUALIZADA" é emitida pelo próprio handler
# (scripts/webhook/github-webhook-deploy.mjs) quando o git reset conclui com
# mudança real. O trigger workflow_run antigo apontava para workflows
# inexistentes ("Deploy VPS"/"Deploy") e nunca disparava — removido.
#
# NOTA (16/07/2026): Step "Git commit + push" removido.
# O painel foi consolidado em apps/modulos/status/ (02/07).
# Commits automáticos em main foram abolidos pelo Fluxo de Ouro.
# Este workflow agora apenas NOTIFICA eventos via Telegram.

on:
  pull_request:
    types: [opened, ready_for_review, synchronize, closed]
    branches: [main, program/centraldark-convergencia-omniroute-722]
  pull_request_review:
    types: [submitted]

permissions:
  contents: read
  pull-requests: read

concurrency:
  group: pipeline-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: false

jobs:
  pipeline:
    name: Notificar + Atualizar Painel
    runs-on: [self-hosted, Linux]
    if: github.repository == 'ServerVpss/CentralDark'
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Determinar estágio
        id: stage
        env:
          EVENT:        ${{ github.event_name }}
          ACTION:       ${{ github.event.action }}
          MERGED:       ${{ github.event.pull_request.merged }}
          REVIEW_STATE: ${{ github.event.review.state }}
        run: |
          case "$EVENT" in
            pull_request)
              case "$ACTION" in
                opened|ready_for_review)
                  echo "emoji=🔁"  >> $GITHUB_OUTPUT
                  echo "stage=PR_ABERTO" >> $GITHUB_OUTPUT
                  echo "label=PR ABERTO" >> $GITHUB_OUTPUT
                  echo "desc=Em revisão — aguardando checks e aprovação" >> $GITHUB_OUTPUT
                  ;;
                synchronize)
                  echo "emoji=🧪"  >> $GITHUB_OUTPUT
                  echo "stage=CHECKS" >> $GITHUB_OUTPUT
                  echo "label=CHECKS" >> $GITHUB_OUTPUT
                  echo "desc=Novo commit adicionado — checks rodando" >> $GITHUB_OUTPUT
                  ;;
                closed)
                  if [[ "$MERGED" == "true" ]]; then
                    echo "emoji=🟢"  >> $GITHUB_OUTPUT
                    echo "stage=MERGEADO" >> $GITHUB_OUTPUT
                    echo "label=MERGEADO" >> $GITHUB_OUTPUT
                    echo "desc=Entrou na base alvo — promoção seguinte depende de gates" >> $GITHUB_OUTPUT
                  else
                    echo "emoji=❌"  >> $GITHUB_OUTPUT
                    echo "stage=FECHADO" >> $GITHUB_OUTPUT
                    echo "label=FECHADO" >> $GITHUB_OUTPUT
                    echo "desc=PR fechado sem merge" >> $GITHUB_OUTPUT
                  fi
                  ;;
              esac
              ;;
            pull_request_review)
              case "$REVIEW_STATE" in
                approved)
                  echo "emoji=✅"  >> $GITHUB_OUTPUT
                  echo "stage=APROVADO" >> $GITHUB_OUTPUT
                  echo "label=APROVADO" >> $GITHUB_OUTPUT
                  echo "desc=Aprovado — pronto para próximo gate" >> $GITHUB_OUTPUT
                  ;;
                changes_requested)
                  echo "emoji=🔄"  >> $GITHUB_OUTPUT
                  echo "stage=REVISAO_PEDIDA" >> $GITHUB_OUTPUT
                  echo "label=REVISÃO PEDIDA" >> $GITHUB_OUTPUT
                  echo "desc=Revisor pediu alterações antes do merge" >> $GITHUB_OUTPUT
                  ;;
                commented)
                  echo "emoji=💬"  >> $GITHUB_OUTPUT
                  echo "stage=COMENTADO" >> $GITHUB_OUTPUT
                  echo "label=COMENTÁRIO" >> $GITHUB_OUTPUT
                  echo "desc=Comentário de revisão adicionado" >> $GITHUB_OUTPUT
                  ;;
              esac
              ;;
          esac

      - name: Notificar Telegram
        env:
          BOT:     ${{ secrets.SRVER1_BOT_TOKEN }}
          CHAT:    ${{ secrets.TELEGRAM_CHANNEL_ID }}
          EMOJI:   ${{ steps.stage.outputs.emoji }}
          LABEL:   ${{ steps.stage.outputs.label }}
          DESC:    ${{ steps.stage.outputs.desc }}
          TITLE:   ${{ github.event.pull_request.title || 'PR' }}
          NUMBER:  ${{ github.event.pull_re
```