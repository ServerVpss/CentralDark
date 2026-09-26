#!/usr/bin/env bash
# ============================================================
# fix-production-urls.sh
# Corretor automático de URLs de produção — MultiZap
#
# Substitui URLs de preview/staging pelos domínios oficiais:
#   *.lovable.app/api/public/wuzapi/webhook -> https://multizap.dev/api/public/wuzapi/webhook
#   *.lovable.app                            -> https://multizap.dev
#   *proxy*.lovable.app                      -> https://proxy.multizap.dev
#
# NÃO toca em:
#   - .env, secrets, tokens, bearer, api keys, service_role
#   - node_modules, dist, build, .git
#   - changelog/memória histórica
#
# Uso:
#   bash scripts/fix-production-urls.sh           # dry-run (mostra o que mudaria)
#   bash scripts/fix-production-urls.sh --apply   # aplica de verdade
# ============================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MODO="dry-run"
if [ "${1:-}" = "--apply" ]; then
  MODO="apply"
fi

# Pastas ignoradas
EXCLUIR_DIRS=(
  ".git" "node_modules" "dist" "build" ".next" ".turbo"
  ".cache" ".vite" ".output" "coverage" "playwright-report"
  "test-results" ".lovable" "mem" "logs"
)

# Arquivos sensíveis (NUNCA tocar)
PADRAO_SENSIVEL='(\.env($|\..*)|secret|token|bearer|api[_-]?key|service_role|password|senha)'

# Arquivos de histórico (NUNCA tocar — explicam incidente antigo)
EXCLUIR_ARQUIVOS=(
  "docs/DEPLOY_LOG.md"
  "docs/DECISOES_TECNICAS.md"
  "multizap-gateway-deploy/CHANGELOG.md"
  "multizap-gateway-deploy/README_ROLLBACK.md"
  "scripts/check-production-urls.sh"
  "scripts/fix-production-urls.sh"
  "CHANGELOG.md"
)

# Monta lista de arquivos candidatos
echo "🔍 Procurando arquivos com URLs a corrigir..."
RG_EXCL=()
for d in "${EXCLUIR_DIRS[@]}"; do
  RG_EXCL+=( "--glob" "!${d}/**" )
done
for f in "${EXCLUIR_ARQUIVOS[@]}"; do
  RG_EXCL+=( "--glob" "!${f}" )
done

if command -v rg >/dev/null 2>&1; then
  ARQUIVOS="$(rg -l -S 'lovable\.(app|dev)|lovableproject\.com' "${RG_EXCL[@]}" 2>/dev/null || true)"
else
  GREP_EXCL=()
  for d in "${EXCLUIR_DIRS[@]}"; do
    GREP_EXCL+=( "--exclude-dir=${d}" )
  done
  ARQUIVOS="$(grep -RlE 'lovable\.(app|dev)|lovableproject\.com' "${GREP_EXCL[@]}" . 2>/dev/null | sed 's|^\./||' || true)"
  for f in "${EXCLUIR_ARQUIVOS[@]}"; do
    ARQUIVOS="$(echo "${ARQUIVOS}" | grep -v -F "${f}" || true)"
  done
fi

if [ -z "${ARQUIVOS}" ]; then
  echo "✅ Nada para corrigir. Produção já está limpa."
  exit 0
fi

ALTERADOS=0
PULADOS=0

while IFS= read -r arquivo; do
  [ -z "${arquivo}" ] && continue
  [ ! -f "${arquivo}" ] && continue

  # Pula arquivo sensível
  if echo "${arquivo}" | grep -iqE "${PADRAO_SENSIVEL}"; then
    echo "⏭  PULADO (sensível): ${arquivo}"
    PULADOS=$((PULADOS+1))
    continue
  fi

  # Linhas que contêm token/secret também são puladas (proteção extra)
  if grep -iqE '(token|secret|bearer|api[_-]?key|service_role|password|senha)\s*[:=]' "${arquivo}" 2>/dev/null; then
    # Só pula se a URL proibida estiver na mesma linha que um segredo
    if grep -iE '(token|secret|bearer|api[_-]?key|service_role|password|senha).*lovable\.(app|dev)|lovable\.(app|dev).*(token|secret|bearer|api[_-]?key|service_role|password|senha)' "${arquivo}" >/dev/null 2>&1; then
      echo "⏭  PULADO (URL em linha com segredo): ${arquivo}"
      PULADOS=$((PULADOS+1))
      continue
    fi
  fi

  # Aplica substituições numa cópia temporária
  TMP="$(mktemp)"
  cp "${arquivo}" "${TMP}"

  # Ordem importa: mais específico primeiro
  sed -i.bak -E \
    -e 's#https?://[a-zA-Z0-9.-]*proxy[a-zA-Z0-9.-]*\.lovable\.app#https://proxy.multizap.dev#g' \
    -e 's#https?://[a-zA-Z0-9.-]*\.lovable\.app/api/public/wuzapi/webhook#https://multizap.dev/api/public/wuzapi/webhook#g' \
    -e 's#https?://[a-zA-Z0-9.-]*\.lovable\.app#https://multizap.dev#g' \
    -e 's#https?://[a-zA-Z0-9.-]*\.lovable\.dev#https://multizap.dev#g' \
    -e 's#https?://[a-zA-Z0-9.-]*\.lovableproject\.com#https://multizap.dev#g' \
    "${TMP}"
  rm -f "${TMP}.bak"

  if ! diff -q "${arquivo}" "${TMP}" >/dev/null 2>&1; then
    ALTERADOS=$((ALTERADOS+1))
    echo "✏  ${arquivo}"
    if [ "${MODO}" = "dry-run" ]; then
      diff -u "${arquivo}" "${TMP}" | sed -n '1,20p'
    else
      cp "${TMP}" "${arquivo}"
    fi
  fi

  rm -f "${TMP}"
done <<< "${ARQUIVOS}"

echo ""
echo "------------------------------------------------------------"
if [ "${MODO}" = "dry-run" ]; then
  echo "🧪 DRY-RUN: ${ALTERADOS} arquivo(s) seriam alterados, ${PULADOS} pulado(s)."
  echo "    Para aplicar de verdade: bash scripts/fix-production-urls.sh --apply"
else
  echo "✅ APLICADO: ${ALTERADOS} arquivo(s) alterados, ${PULADOS} pulado(s)."
  echo "    Rode em seguida: bash scripts/check-production-urls.sh"
fi
