#!/usr/bin/env bash
# ============================================================
# multizap-check-production-urls.sh
# Guardião de URLs de produção do pacote Gateway/WuzAPI.
#
# Roda no fluxo do multizap-gh-pull.sh logo após o sync,
# antes do npm ci e do restart do PM2.
#
# Sai com 1 se achar URL proibida em produção.
# ============================================================

set -uo pipefail

TARGET="${1:-/root/Multizap}"

PADROES='atendimentoo\.lovable\.app|lovable\.app|lovable\.dev|lovableproject\.com'

# Pastas/arquivos que NÃO contam (não rodam em runtime)
EXCLUIR=(
  --exclude-dir=node_modules
  --exclude-dir=data
  --exclude-dir=logs
  --exclude-dir=.git
  --exclude=CHANGELOG.md
  --exclude=README_ROLLBACK.md
)

ENCONTRADOS="$(grep -REn "${PADROES}" "${EXCLUIR[@]}" "$TARGET" 2>/dev/null || true)"

if [ -z "$ENCONTRADOS" ]; then
  echo "[check-urls] OK: nenhuma URL proibida em $TARGET"
  exit 0
fi

echo "[check-urls] FALHA: URLs proibidas encontradas em $TARGET"
echo "------------------------------------------------------------"
echo "$ENCONTRADOS"
echo "------------------------------------------------------------"
echo "Use https://multizap.dev em produção. Corrija e refaça o deploy."
exit 1
