#!/usr/bin/env bash
# Bloco 11 — Segurança (permissões de secrets, vazamentos em logs)
source "$(dirname "$0")/_lib.sh"
BLOCO="11-seguranca"

# Permissão de pastas sensíveis
for d in "$CK_MULTIZAP_ROOT/secrets" "$CK_MULTIZAP_ROOT/credenciais" "$CK_CENTRALDARK_ROOT/secrets"; do
  [ -d "$d" ] || continue
  PERM=$(stat -c '%a' "$d" 2>/dev/null || echo "?")
  OWNER=$(stat -c '%U' "$d" 2>/dev/null || echo "?")
  if [ "$PERM" = "700" ] || [ "$PERM" = "750" ]; then
    emit_ok "$BLOCO" "$d perm=$PERM owner=$OWNER"
  else
    emit_erro "$BLOCO" "$d com permissão insegura $PERM (esperado 700/750)"
  fi
done

# Arquivos .env soltos no repo (não deveriam existir versionados)
REPO="$CK_MULTIZAP_ROOT/apps/clone-deck"
if [ -d "$REPO/.git" ]; then
  VAZADOS=$(git -C "$REPO" ls-files 2>/dev/null | grep -E '(^|/)\.env$|(^|/)\.env\.[^e]' | grep -v '\.example$' || true)
  if [ -z "$VAZADOS" ]; then
    emit_ok "$BLOCO" "Nenhum .env versionado no repo"
  else
    emit_erro "$BLOCO" "Arquivos .env versionados: $VAZADOS"
  fi
fi
