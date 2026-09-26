#!/usr/bin/env bash
# Biblioteca de sanitização — mascara secrets em qualquer saída antes
# de gravar em arquivo ou imprimir na tela.
# Uso:
#   source _lib-sanitize.sh
#   echo "Authorization: Bearer abc123" | sanitize

sanitize() {
  sed -E 's/(token|password|authorization|apikey|api_key|secret|bearer|BOT_TOKEN|SUPABASE[^=]*=|GITHUB_PAT[^=]*=|VPS_SSH_KEY[^=]*=)[^ ,"]+/\1***OCULTO***/Ig'
}

export -f sanitize 2>/dev/null || true
