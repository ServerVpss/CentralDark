#!/usr/bin/env bash
# .githooks/pre-commit-root-contract.sh
# Superfície 5 de 5: Git hook que impede arquivo raiz fora do contrato.
# Instalar: git config core.hooksPath .githooks
#
# Owner: SOL | Autoridade: SEGREDO/CHEFE
# Regra: NEW_ROOT_FILE_REQUIRES_REGISTRY=true

set -euo pipefail

REGISTRY="ROOT-FILE-REGISTRY.json"

# Só checar se o registry existe (pode estar sendo criado neste commit)
if [ ! -f "$REGISTRY" ]; then
  exit 0
fi

# Pegar arquivos staged que estão na raiz (sem / no path)
ROOT_FILES=$(git diff --cached --name-only --diff-filter=A | grep -v '/' || true)

if [ -z "$ROOT_FILES" ]; then
  exit 0
fi

# Arquivos que não precisam de registro (dotfiles padrão, diretórios git)
EXEMPT_PATTERNS=(
  '^\.'           # dotfiles (.gitignore, .env, etc)
  '^package'      # package.json, package-lock.json
  '^node_modules' # should be gitignored but just in case
)

ERRORS=0

for FILE in $ROOT_FILES; do
  # Pular exempts
  SKIP=false
  for PATTERN in "${EXEMPT_PATTERNS[@]}"; do
    if echo "$FILE" | grep -qE "$PATTERN"; then
      SKIP=true
      break
    fi
  done

  if [ "$SKIP" = true ]; then
    continue
  fi

  # Verificar se o arquivo está no registry
  if ! python3 -c "
import json, sys
with open('$REGISTRY') as f:
    reg = json.load(f)
target = '$FILE'
for cat in reg.get('categories', {}).values():
    files = cat.get('files', {})
    if target in files:
        sys.exit(0)
sys.exit(1)
" 2>/dev/null; then
    echo "❌ BLOQUEADO: '$FILE' não está registrado em ROOT-FILE-REGISTRY.json"
    echo "   → Adicione uma entrada antes de commitar."
    echo "   → Skill: .agents/skills/root-file-contract-router/SKILL.md"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ "$ERRORS" -gt 0 ]; then
  echo ""
  echo "🛑 $ERRORS arquivo(s) raiz sem registro no contrato."
  echo "   Registre no ROOT-FILE-REGISTRY.json + ROOT-FILE-REGISTRY.md"
  echo "   antes de commitar."
  exit 1
fi

exit 0