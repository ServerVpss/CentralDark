#!/usr/bin/env bash
# notify — wrapper universal de notificação CentralDark
# Uso: notify <origem> <tipo> "<titulo>" "<mensagem>" [metadata-json]
# Tipos: info | sucesso | aviso | erro | critico
#
# Lê NOTIFY_URL e NOTIFY_API_KEY de /etc/centraldark/notify.env (chmod 600)
# Tolerante a falha: tenta 3x; se cair tudo, guarda em fila local pra reenviar depois.

set -u

CONF="/etc/centraldark/notify.env"
QUEUE_DIR="/var/log/centraldark"
QUEUE_FILE="${QUEUE_DIR}/notify-pending.log"
MAX_TENTATIVAS=3

if [[ ! -r "$CONF" ]]; then
  echo "[notify] erro: não consigo ler $CONF (rode como root ou ajuste permissão)" >&2
  exit 2
fi
# shellcheck disable=SC1090
source "$CONF"

if [[ -z "${NOTIFY_URL:-}" || -z "${NOTIFY_API_KEY:-}" ]]; then
  echo "[notify] erro: NOTIFY_URL e NOTIFY_API_KEY precisam estar em $CONF" >&2
  exit 2
fi

if [[ $# -lt 4 ]]; then
  echo "uso: notify <origem> <tipo> \"<titulo>\" \"<mensagem>\" [metadata-json]" >&2
  echo "  tipos: info | sucesso | aviso | erro | critico" >&2
  exit 1
fi

ORIGEM="$1"
TIPO="$2"
TITULO="$3"
MENSAGEM="$4"
METADATA="${5:-{}}"

# Escapa pra JSON usando python (sempre disponível) ou jq como fallback
escape_json() {
  python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1" 2>/dev/null \
    || printf '"%s"' "${1//\"/\\\"}"
}

PAYLOAD=$(cat <<EOF
{
  "origem":   $(escape_json "$ORIGEM"),
  "tipo":     $(escape_json "$TIPO"),
  "titulo":   $(escape_json "$TITULO"),
  "mensagem": $(escape_json "$MENSAGEM"),
  "metadata": ${METADATA}
}
EOF
)

mkdir -p "$QUEUE_DIR"

tentar() {
  curl -fsS -X POST "$NOTIFY_URL" \
    -H "X-Notify-Key: ${NOTIFY_API_KEY}" \
    -H "Content-Type: application/json" \
    --max-time 10 \
    -d "$PAYLOAD"
}

ok=0
for i in $(seq 1 $MAX_TENTATIVAS); do
  if RESP=$(tentar 2>&1); then
    echo "$RESP"
    ok=1
    break
  fi
  sleep $((i * 2))
done

if [[ $ok -eq 0 ]]; then
  ts=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$ts] FALHOU: $PAYLOAD" >>"$QUEUE_FILE"
  echo "[notify] aviso: edge function inacessível, guardado em $QUEUE_FILE" >&2
  exit 3
fi
