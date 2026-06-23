#!/usr/bin/env bash
# Configura SSH para a VPS CentralDark a partir do sandbox Lovable.
# A chave vem em $VPS_SSH_KEY_LOVABLE como UMA linha só, com espaços
# no lugar das quebras. Precisa reconstruir o PEM em blocos de 70 chars,
# senão o openssh recusa ("error in libcrypto").
set -euo pipefail

VPS_HOST="${VPS_HOST_LOVABLE:-}"
VPS_USER="${VPS_USER_LOVABLE:-}"
SSH_KEY="${VPS_SSH_KEY_LOVABLE:-}"

if [[ -z "$VPS_HOST" || -z "$VPS_USER" || -z "$SSH_KEY" ]]; then
  echo "Variáveis VPS_HOST_LOVABLE, VPS_USER_LOVABLE ou VPS_SSH_KEY_LOVABLE não definidas." >&2
  return 1 2>/dev/null || exit 1
fi

TMP_KEY=$(mktemp)
chmod 600 "$TMP_KEY"
trap 'rm -f "$TMP_KEY"' EXIT

# Reconstrução robusta: detecta header/footer (OPENSSH ou RSA),
# limpa espaços/quebras do miolo base64 e reemite em linhas de 70 chars.
python3 - "$TMP_KEY" <<'PY'
import os, re, sys
raw = os.environ['VPS_SSH_KEY_LOVABLE'].strip()
m = re.search(r'-----BEGIN ([A-Z0-9 ]+?) PRIVATE KEY-----(.*?)-----END \1 PRIVATE KEY-----', raw, re.S)
if not m:
    sys.exit("formato de chave não reconhecido")
tipo, miolo = m.group(1), m.group(2)
b64 = re.sub(r'\s+', '', miolo)
linhas = [b64[i:i+70] for i in range(0, len(b64), 70)]
out = [f"-----BEGIN {tipo} PRIVATE KEY-----", *linhas, f"-----END {tipo} PRIVATE KEY-----", ""]
open(sys.argv[1], 'w').write("\n".join(out))
PY

# Garante openssh disponível (no sandbox Lovable cai via nix).
if command -v ssh >/dev/null 2>&1; then
  SSH_BIN="ssh"
else
  SSH_BIN="nix run nixpkgs#openssh --"
fi

ssh-vps() {
  $SSH_BIN -o StrictHostKeyChecking=no \
           -o BatchMode=yes \
           -o ConnectTimeout=10 \
           -i "$TMP_KEY" \
           "${VPS_USER}@${VPS_HOST}" "$@"
}
export -f ssh-vps
export TMP_KEY SSH_BIN
