#!/usr/bin/env bash
# Bloco 03 — GitHub + deploy canônico CentralDark
source "$(dirname "$0")/_lib.sh"
BLOCO="03-github-deploy"

REPO="$CK_REPO_ROOT"
require_canonical_path "$BLOCO" "$REPO" || exit 0

if [ -d "$REPO/.git" ]; then
  REMOTE=$(git -C "$REPO" remote get-url origin 2>/dev/null || echo "?")
  if printf '%s' "$REMOTE" | grep -Eq 'github\.com[:/]ServerVpss/CentralDark(\.git)?$'; then
    emit_ok "$BLOCO" "Repositório canônico: $REPO"
    emit_ok "$BLOCO" "Remote: $REMOTE"
  else
    emit_erro "$BLOCO" "Remote não canônico em $REPO: $REMOTE"
  fi
else
  emit_erro "$BLOCO" "Repositório ServerVpss/CentralDark não encontrado em $REPO"
fi

# Webhook canônico observado na CentralDark usa a porta 9300.
if has_cmd ss; then
  if ss -ltn 2>/dev/null | grep -qE ':9300\s'; then
    emit_ok "$BLOCO" "Webhook listener escutando em :9300"
  else
    emit_alerta "$BLOCO" "Nada escutando em :9300"
  fi
fi

# Qualquer cron que ainda execute a partir de /root/Multizap é drift, não fallback.
CRON="$(crontab -l 2>/dev/null || true)"
if printf '%s\n' "$CRON" | grep -q '/root/Multizap'; then
  emit_erro "$BLOCO" "Cron operacional ainda aponta para árvore externa /root/Multizap"
elif printf '%s\n' "$CRON" | grep -Eq 'clone-deck-gh-pull-with-deploy|CentralDark'; then
  emit_ok "$BLOCO" "Cron de sincronização encontrado sem dependência Multizap"
else
  emit_alerta "$BLOCO" "Cron de sincronização não localizado"
fi

# Atualizar mecanismos existentes; não criar pipeline paralelo.
for s in scripts/clone-deck-gh-pull-with-deploy.sh scripts/webhook/deploy-job.sh; do
  if [ -f "$REPO/$s" ]; then
    emit_ok "$BLOCO" "Mecanismo existente presente: $s"
  else
    emit_erro "$BLOCO" "Mecanismo canônico ausente: $s"
  fi
done
