#!/usr/bin/env bash
# Atualiza a WuzAPI (asternic/wuzapi:latest) com segurança.
# Preserva volumes/sessões. Faz healthcheck após restart. Em caso de falha,
# imprime os logs do compose pra diagnóstico (Docker mantém a imagem antiga
# em cache local — rollback manual basta retaggear e subir de novo).
#
# Uso: update-wuzapi.sh <compose_dir> <container_name>
#
# Saída: stdout/stderr são retornados ao Gateway pra registro no audit_log.

set -euo pipefail

COMPOSE_DIR="${1:-/root/Multizap/wuzapi}"
CONTAINER="${2:-multizap-gateway-wuzapi-1}"
PORT="${WUZAPI_PORT:-8081}"

echo "[update-wuzapi] dir=${COMPOSE_DIR} container=${CONTAINER} port=${PORT}"

if [ ! -f "${COMPOSE_DIR}/docker-compose.yml" ]; then
  echo "[update-wuzapi] ERRO: docker-compose.yml não encontrado em ${COMPOSE_DIR}"
  exit 2
fi

cd "${COMPOSE_DIR}"

echo "[update-wuzapi] >> docker compose pull wuzapi"
docker compose pull wuzapi

echo "[update-wuzapi] >> docker compose up -d wuzapi (SEM -v, preserva volumes)"
docker compose up -d wuzapi

echo "[update-wuzapi] aguardando WuzAPI responder em 127.0.0.1:${PORT}..."
OK=0
for i in $(seq 1 30); do
  if curl -sfo /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then
    OK=1
    break
  fi
  sleep 2
done

if [ "${OK}" -ne 1 ]; then
  echo "[update-wuzapi] ERRO: WuzAPI não respondeu em 60s após o restart."
  echo "[update-wuzapi] últimos logs do serviço:"
  docker compose logs --tail 80 wuzapi 2>&1 || true
  exit 3
fi

echo "[update-wuzapi] OK — WuzAPI atualizada e respondendo."
