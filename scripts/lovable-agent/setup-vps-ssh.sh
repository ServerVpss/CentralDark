#!/usr/bin/env bash
set -euo pipefail

VPS_HOST="${VPS_HOST_LOVABLE:-}"
VPS_USER="${VPS_USER_LOVABLE:-}"
SSH_KEY="${VPS_SSH_KEY_LOVABLE:-}"

if [[ -z "$VPS_HOST" || -z "$VPS_USER" || -z "$SSH_KEY" ]]; then
  echo "Variáveis VPS_HOST_LOVABLE, VPS_USER_LOVABLE ou VPS_SSH_KEY_LOVABLE não definidas." >&2
  exit 1
fi

TMP_KEY=$(mktemp)
chmod 600 "$TMP_KEY"
trap 'rm -f "$TMP_KEY"' EXIT
printf '%s\n' "$SSH_KEY" > "$TMP_KEY"

ssh-vps() {
  local SSH_BIN="ssh"
  if ! command -v ssh >/dev/null 2>&1; then
    SSH_BIN="nix run nixpkgs#openssh --"
  fi
  $SSH_BIN -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=10 -i "$TMP_KEY" "${VPS_USER}@${VPS_HOST}" "$@"
}

export -f ssh-vps

