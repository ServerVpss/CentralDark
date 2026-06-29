#!/usr/bin/env bash
# Roda o teste de proxy ap7 carregando a key de secrets/anthropic.env
# Uso: bash scripts/run-proxy-test.sh
# A key NUNCA aparece na linha de comando — fica só no arquivo de secrets.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS="$SCRIPT_DIR/../secrets/anthropic.env"

if [ -f "$SECRETS" ]; then
  set -a; source "$SECRETS"; set +a
  echo "✅ secrets/anthropic.env carregado"
else
  echo "❌ secrets/anthropic.env não encontrado."
  echo "   Crie o arquivo com: ANTHROPIC_AUTH_TOKEN=sua-key-do-ap7"
  exit 1
fi

if [ -z "${ANTHROPIC_AUTH_TOKEN:-}" ]; then
  echo "❌ ANTHROPIC_AUTH_TOKEN vazio — preencha secrets/anthropic.env"
  exit 1
fi

exec bash "$SCRIPT_DIR/test-proxy-anthropic.sh"
