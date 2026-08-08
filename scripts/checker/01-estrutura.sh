#!/usr/bin/env bash
# Bloco 01 — Estrutura canônica da CentralDark
source "$(dirname "$0")/_lib.sh"
BLOCO="01-estrutura"

PASTAS_OBRIG=(
  "$CK_CENTRALDARK_ROOT"
  "$CK_CENTRALDARK_ROOT/apps"
  "$CK_CENTRALDARK_ROOT/scripts"
  "$CK_CENTRALDARK_ROOT/infra"
  "$CK_CENTRALDARK_ROOT/revisoes"
)

for p in "${PASTAS_OBRIG[@]}"; do
  require_canonical_path "$BLOCO" "$p" || continue
  if [ -d "$p" ]; then
    emit_ok "$BLOCO" "Pasta canônica existe: $p"
  else
    emit_erro "$BLOCO" "Pasta canônica faltando: $p"
  fi
done

if [ -d "$CK_REPO_ROOT/.git" ]; then
  REMOTE="$(git -C "$CK_REPO_ROOT" remote get-url origin 2>/dev/null || true)"
  if printf '%s' "$REMOTE" | grep -Eq 'github\.com[:/]ServerVpss/CentralDark(\.git)?$'; then
    emit_ok "$BLOCO" "Repo canônico confirmado em $CK_REPO_ROOT"
  else
    emit_erro "$BLOCO" "Repo em $CK_REPO_ROOT não aponta para ServerVpss/CentralDark"
  fi
else
  emit_erro "$BLOCO" "Repo Git canônico ausente em $CK_REPO_ROOT"
fi

# O checker não valida /root/Multizap nem árvores irmãs. Se um componente
# necessário existir apenas fora da CentralDark, ele vira dependência a migrar,
# nunca requisito operacional permanente deste checker.
emit_ok "$BLOCO" "Fronteira externa: ${CK_EXTERNAL_ROOT_POLICY}"
