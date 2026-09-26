#!/usr/bin/env bash
# Reconstrói a chave SSH da VPS no sandbox do Lovable, lidando com qualquer
# quebra de linha que o transporte de secrets possa ter causado.
# Uso:  source scripts/lovable-agent/setup-vps-ssh.sh && ssh-vps "pm2 ls"

set -u

_KEY_RAW="${VPS_SSH_KEY_LOVABLE:-}"
_HOST="${VPS_HOST_LOVABLE:-}"
_USER="${VPS_USER_LOVABLE:-root}"
_KEY_PATH="/tmp/vps_key"

if [ -z "$_KEY_RAW" ] || [ -z "$_HOST" ]; then
  echo "[setup-vps-ssh] faltando VPS_SSH_KEY_LOVABLE ou VPS_HOST_LOVABLE" >&2
  return 1 2>/dev/null || exit 1
fi

python3 - "$_KEY_PATH" <<'PY'
import os, sys, re, base64, textwrap

raw = os.environ["VPS_SSH_KEY_LOVABLE"]
out_path = sys.argv[1]

# 1) Normaliza \n literais (inclusive duplo-escapado \\n)
s = raw.replace("\\n", "\n")

# 2) Se já tem cabeçalho PEM com várias linhas, usa direto
if "BEGIN" in s and "\n" in s.strip() and s.count("\n") > 3:
    key = s.strip() + "\n"
else:
    # 3) Tenta extrair como PEM "achatada" (BEGIN ... END numa linha só ou com espaços)
    m = re.search(r"(-----BEGIN [^-]+-----)(.*?)(-----END [^-]+-----)", s, re.S)
    if m:
        header, body, footer = m.group(1), m.group(2), m.group(3)
        body = re.sub(r"\s+", "", body)
        # tenta decodificar como base64 puro pra detectar formato
        wrapped = "\n".join(textwrap.wrap(body, 70))
        key = f"{header}\n{wrapped}\n{footer}\n"
    else:
        # 4) Assumir que é base64 da chave PEM inteira (com espaços no lugar das quebras)
        b64 = re.sub(r"\s+", "", s)
        try:
            decoded = base64.b64decode(b64).decode("utf-8", errors="strict")
            key = decoded.strip() + "\n"
        except Exception as e:
            sys.stderr.write(f"[setup-vps-ssh] formato de chave nao reconhecido: {e}\n")
            sys.exit(1)

with open(out_path, "w") as f:
    f.write(key)
os.chmod(out_path, 0o600)
print(f"[setup-vps-ssh] chave escrita em {out_path} ({len(key)} bytes, {key.count(chr(10))} linhas)")
PY

if [ $? -ne 0 ]; then
  echo "[setup-vps-ssh] falha ao reconstruir a chave" >&2
  return 1 2>/dev/null || exit 1
fi

# Valida formato com ssh-keygen
if command -v ssh-keygen >/dev/null 2>&1; then
  if ! ssh-keygen -y -f "$_KEY_PATH" >/dev/null 2>&1; then
    echo "[setup-vps-ssh] aviso: ssh-keygen nao validou a chave" >&2
  fi
fi

export VPS_SSH_KEY_FILE="$_KEY_PATH"
export VPS_HOST="$_HOST"
export VPS_USER="$_USER"

ssh-vps() {
  ssh -i "$VPS_SSH_KEY_FILE" \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/dev/null \
      -o ConnectTimeout=15 \
      -o LogLevel=ERROR \
      "${VPS_USER}@${VPS_HOST}" "$@"
}

scp-vps() {
  scp -i "$VPS_SSH_KEY_FILE" \
      -o StrictHostKeyChecking=no \
      -o UserKnownHostsFile=/dev/null \
      -o ConnectTimeout=15 \
      -o LogLevel=ERROR \
      "$@"
}

export -f ssh-vps scp-vps 2>/dev/null || true

echo "[setup-vps-ssh] pronto. Use: ssh-vps \"comando\"  (host: $_USER@$_HOST)"
