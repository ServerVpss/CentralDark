#!/usr/bin/env bash
# Sobe a WuzAPI local (Docker) de forma idempotente e segura.
# Falha duro (exit 1) se:
#   - .env faltando ou variável obrigatória vazia
#   - docker compose up falhar
#   - porta 127.0.0.1:${WUZAPI_PORT} não responder em até 60s
#
# NUNCA usa `docker compose down -v` nem remove volumes/sessões.
# NUNCA toca em /root/whatsapp-server, PM2 whatsapp-server, porta 3000 ou webhook 9001.

set -euo pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
cd "$ROOT/wuzapi"

if [ ! -f .env ]; then
  echo "[start-wuzapi] ERRO: .env não encontrado em wuzapi/. Copie de .env.example e configure."
  exit 1
fi

# Valida variáveis obrigatórias.
REQUIRED_VARS=(WUZAPI_ADMIN_TOKEN POSTGRES_PASSWORD WUZAPI_GLOBAL_ENCRYPTION_KEY WUZAPI_GLOBAL_HMAC_KEY)
for var in "${REQUIRED_VARS[@]}"; do
  if ! grep -E "^${var}=.+" .env >/dev/null 2>&1; then
    echo "[start-wuzapi] ERRO: variável ${var} ausente ou vazia em wuzapi/.env"
    exit 1
  fi
done

PORT="$(grep -E '^WUZAPI_PORT=' .env | head -n1 | cut -d= -f2 || true)"
PORT="${PORT:-8081}"

echo "[start-wuzapi] Subindo containers (porta 127.0.0.1:${PORT})..."

# Idempotente: --remove-orphans descarta containers que sobraram de versões
# antigas (ex.: containers com container_name fixo do compose anterior).
# NUNCA usar -v aqui — volumes preservam sessões WhatsApp.
if ! docker compose up -d --remove-orphans; then
  echo "[start-wuzapi] ERRO: docker compose up falhou."
  docker compose ps || true
  exit 1
fi

echo "[start-wuzapi] Containers atuais:"
docker compose ps

# Healthcheck: aguarda até 60s a porta responder.
echo "[start-wuzapi] Aguardando WuzAPI responder em 127.0.0.1:${PORT}..."
OK=0
for i in $(seq 1 30); do
  if curl -sfo /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then
    OK=1
    break
  fi
  sleep 2
done

if [ "$OK" -ne 1 ]; then
  echo "[start-wuzapi] ERRO: WuzAPI não respondeu em 127.0.0.1:${PORT} após 60s."
  echo "[start-wuzapi] Últimos 50 logs do serviço wuzapi:"
  docker compose logs --tail 50 wuzapi 2>&1 || true
  exit 1
fi

echo "[start-wuzapi] OK — WuzAPI respondendo em 127.0.0.1:${PORT}."
