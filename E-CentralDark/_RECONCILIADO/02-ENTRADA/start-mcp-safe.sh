#!/usr/bin/env bash
set -euo pipefail
cd /root/CentralDark/apps/mcp

load_env_file() {
  local file="$1"
  [ -f "$file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%$'\r'}"
    [ -z "$line" ] && continue
    case "$line" in \#*) continue ;; esac
    [[ "$line" == *=* ]] || continue

    local key="${line%%=*}"
    local value="${line#*=}"

    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue

    # Não deixa valor vazio sobrescrever secret real.
    [ -z "$value" ] && continue

    export "$key=$value"
  done < "$file"
}

# Primeiro configs comuns.
load_env_file /root/CentralDark/apps/mcp/.env
load_env_file /root/CentralDark/apps/mcp/.env.obra

# Secret real por último para vencer qualquer valor vazio/antigo.
load_env_file /root/CentralDark/secrets/mcp.env


# Modo Obra oficial do projeto.
# O código MCP espera string "true", não "1".

# Segurança continua ativa.

# Modo Obra oficial do projeto.
# O código MCP espera string "true", não "1".
export MCP_MODO_OBRA="true"
export MCP_OBRA_FULL_ADMIN="true"
export MCP_FULL_ADMIN="true"

# Segurança continua ativa.
export MCP_HARD_SECRET_BLOCK="1"
export MCP_REDACT_SECRETS="1"

exec node dist/index.js
