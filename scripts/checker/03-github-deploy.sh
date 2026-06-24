#!/usr/bin/env bash
# Bloco 03 — GitHub + workflow + webhook + run-once + post-deploy
source "$(dirname "$0")/_lib.sh"
BLOCO="03-github-deploy"

REPO="$CK_MULTIZAP_ROOT/apps/clone-deck"
if [ -d "$REPO/.git" ]; then
  emit_ok "$BLOCO" "Repositório clonado em $REPO"
  REMOTE=$(git -C "$REPO" remote get-url origin 2>/dev/null || echo "?")
  emit_ok "$BLOCO" "Remote: $REMOTE"
else
  emit_erro "$BLOCO" "Repositório clone-deck não encontrado em $REPO"
fi

# Webhook listener (porta 9003 padrão)
if has_cmd ss; then
  if ss -ltn 2>/dev/null | grep -qE ':9003\s'; then
    emit_ok "$BLOCO" "Webhook listener escutando em :9003"
  else
    emit_alerta "$BLOCO" "Nada escutando em :9003 (webhook-bot pode estar parado)"
  fi
fi

# Cron de fallback
if crontab -l 2>/dev/null | grep -q "clone-deck-gh-pull-with-deploy"; then
  emit_ok "$BLOCO" "Cron de fallback do gh-pull instalado"
else
  emit_alerta "$BLOCO" "Cron de fallback gh-pull NÃO encontrado"
fi

# Scripts essenciais existem
for s in scripts/clone-deck-gh-pull-with-deploy.sh infra/scripts/post-deploy.sh; do
  if [ -f "$REPO/$s" ]; then
    emit_ok "$BLOCO" "Script presente: $s"
  else
    emit_alerta "$BLOCO" "Script ausente no repo: $s"
  fi
done
