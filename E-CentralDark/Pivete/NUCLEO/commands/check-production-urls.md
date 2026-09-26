# COMANDO - check-production-urls.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\scripts\check-production-urls.sh
**SHA:** 9abf930f5c6d3397
**Timestamp:** 2026-08-26T19:31:34.000396
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- echo "    Padrão: ${PADRAO_REGEX}"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# ============================================================
# check-production-urls.sh
# Guardião de URLs oficiais — MultiZap
#
# Bloqueia URLs de preview/staging (lovable.app, lovable.dev,
# lovableproject.com, atendimentoo.lovable.app) em arquivos
# ATIVOS de produção. Em produção só vale multizap.dev.
#
# Uso:
#   bash scripts/check-production-urls.sh
#
# Saída:
#   0 = nenhuma URL proibida encontrada
#   1 = URL proibida encontrada (deploy NÃO pode prosseguir)
# ============================================================

set -uo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Padrões proibidos em produção
PADROES=(
  "atendimentoo\.lovable\.app"
  "lovable\.app"
  "lovable\.dev"
  "lovableproject\.com"
)

# Pastas/arquivos ignorados (não fazem parte do runtime de produção)
EXCLUIR_DIRS=(
  ".git"
  "node_modules"
  "dist"
  "build"
  ".next"
  ".turbo"
  ".cache"
  ".vite"
  ".output"
  "coverage"
  "playwright-report"
  "test-results"
  ".lovable"
  "mem"
  "logs"
)

# Arquivos de histórico/documentação que SÓ explicam incidentes antigos
# (podem mencionar a URL proibida sem que isso quebre produção)
EXCLUIR_ARQUIVOS=(
  "docs/DEPLOY_LOG.md"
  "docs/DECISOES_TECNICAS.md"
  "multizap-gateway-deploy/CHANGELOG.md"
  "multizap-gateway-deploy/README_ROLLBACK.md"
  "scripts/check-production-urls.sh"
  "scripts/fix-production-urls.sh"
  "CHANGELOG.md"
)

# Monta args do ripgrep / grep
RG_EXCLUDES=()
for d in "${EXCLUIR_DIRS[@]}"; do
  RG_EXCLUDES+=( "--glob" "!${d}/**" )
done
for f in "${EXCLUIR_ARQUIVOS[@]}"; do
  RG_EXCLUDES+=( "--glob" "!${f}" )
done

# Junta padrões em alternância regex
PADRAO_REGEX="$(IFS='|'; echo "${PADROES[*]}")"

echo "🔍 Procurando URLs proibidas em produção..."
echo "    Padrão: ${PADRAO_REGEX}"
echo ""

ENCONTRADOS=""
if command -v rg >/dev/null 2>&1; then
  ENCONTRADOS="$(rg -n --no-heading -S "${PADRAO_REGEX}" "${RG_EXCLUDES[@]}" 2>/dev/null || true)"
else
  # Fallback: grep -r com excludes
  GREP_EXCL=()
  for d in "${EXCLUIR_DIRS[@]}"; do
    GREP_EXCL+=( "--exclude-dir=${d}" )
  done
  ENCONTRADOS="$(grep -RnE "${PADRAO_REGEX}" "${GREP_EXCL[@]}" . 2>/dev/null || true)"
  # Remove arquivos da lista de exclusão
  for f in "${EXCLUIR_ARQUIVOS[@]}"; do
    ENCONTRADOS="$(echo "${ENCONTRADOS}" | grep -v -F "${f}" || true)"
  done
fi

if [ -z "${ENCONTRADOS}" ]; then
  echo "✅ Nenhuma URL proibida encontrada. Produção limpa."
  exit 0
fi

echo "❌ URLs PROIBIDAS encontradas em arquivos ativos de produção:"
echo "------------------------------------------------------------"
echo "${ENCONTRADOS}"
echo "------------------------------------------------------------"
echo ""
echo "⚠  Deploy BLOQUEADO."
echo "    Em produção, use sempre: https://multizap.dev"
echo "    Para corrigir automaticamente, rode:"
echo "        bash scripts/fix-production-urls.sh"
echo ""
exit 1

```