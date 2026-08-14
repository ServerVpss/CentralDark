#!/usr/bin/env bash
# Bloco 11 — Segurança (permissões de secrets, vazamentos em logs)
source "$(dirname "$0")/_lib.sh"
BLOCO="11-seguranca"

# Somente caminhos sensíveis dentro da raiz canônica entram neste checker.
# O conteúdo não é lido; apenas permissões/metadados são observados.
for d in "$CK_CENTRALDARK_ROOT/secrets" "$CK_CENTRALDARK_ROOT/credenciais"; do
  require_canonical_path "$BLOCO" "$d" || continue
  [ -d "$d" ] || continue
  PERM=$(stat -c '%a' "$d" 2>/dev/null || echo "?")
  OWNER=$(stat -c '%U' "$d" 2>/dev/null || echo "?")
  if [ "$PERM" = "700" ] || [ "$PERM" = "750" ]; then
    emit_ok "$BLOCO" "$d perm=$PERM owner=$OWNER"
  else
    emit_erro "$BLOCO" "$d com permissão insegura $PERM (esperado 700/750)"
  fi
done

# Detecta somente nomes de .env rastreados pelo Git; nunca abre o conteúdo.
REPO="$CK_REPO_ROOT"
require_canonical_path "$BLOCO" "$REPO" || exit 0
if [ -d "$REPO/.git" ]; then
  VAZADOS=$(git -C "$REPO" ls-files 2>/dev/null | grep -E '(^|/)\.env($|\.)' | grep -vE '(^|/)\.env\.example$' || true)
  if [ -z "$VAZADOS" ]; then
    emit_ok "$BLOCO" "Nenhum .env versionado no repo canônico"
  else
    emit_erro "$BLOCO" "Arquivos .env versionados detectados por nome: $VAZADOS"
  fi
fi
