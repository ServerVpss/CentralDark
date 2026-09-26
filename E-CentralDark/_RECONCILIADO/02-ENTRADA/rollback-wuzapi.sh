#!/usr/bin/env bash
# Rollback da WuzAPI para uma imagem anterior (digest sha256:... já em cache local).
# Preserva volumes/sessões. NUNCA usa -v. NÃO toca Recargas Brasil / whatsapp-server.
#
# Uso: rollback-wuzapi.sh <compose_dir> <container_name> <target_image_or_digest>
#
# target_image_or_digest pode ser:
#   - sha256:abcdef...                  (digest local)
#   - asternic/wuzapi@sha256:abcdef...  (repo digest)
#   - asternic/wuzapi:tag               (tag normal)

set -euo pipefail

COMPOSE_DIR="${1:-/root/Multizap/wuzapi}"
CONTAINER="${2:-multizap-gateway-wuzapi-1}"
TARGET="${3:-}"
PORT="${WUZAPI_PORT:-8081}"

if [ -z "${TARGET}" ]; then
  echo "[rollback-wuzapi] ERRO: target image/digest obrigatório."
  exit 2
fi

if [ ! -f "${COMPOSE_DIR}/docker-compose.yml" ]; then
  echo "[rollback-wuzapi] ERRO: docker-compose.yml não encontrado em ${COMPOSE_DIR}"
  exit 2
fi

echo "[rollback-wuzapi] dir=${COMPOSE_DIR} container=${CONTAINER} target=${TARGET}"

# Confirma que a imagem existe localmente — não tentamos pull, rollback é offline.
if ! docker image inspect "${TARGET}" >/dev/null 2>&1; then
  echo "[rollback-wuzapi] ERRO: imagem ${TARGET} não está em cache local."
  echo "[rollback-wuzapi] imagens disponíveis (asternic/wuzapi):"
  docker images --digests asternic/wuzapi 2>&1 || true
  exit 3
fi

# Retag pra asternic/wuzapi:rollback — o compose usa essa tag via override temporário.
echo "[rollback-wuzapi] >> retag para asternic/wuzapi:rollback"
docker tag "${TARGET}" asternic/wuzapi:rollback

cd "${COMPOSE_DIR}"

# Override do compose: força usar a tag rollback sem editar o arquivo original.
echo "[rollback-wuzapi] >> docker compose up -d wuzapi (com override rollback)"
WUZAPI_IMAGE_OVERRIDE="asternic/wuzapi:rollback" \
  docker compose up -d --no-deps wuzapi

echo "[rollback-wuzapi] aguardando WuzAPI responder em 127.0.0.1:${PORT}..."
OK=0
for i in $(seq 1 30); do
  if curl -sfo /dev/null --max-time 2 "http://127.0.0.1:${PORT}/"; then
    OK=1; break
  fi
  sleep 2
done

if [ "${OK}" -ne 1 ]; then
  echo "[rollback-wuzapi] ERRO: WuzAPI não respondeu em 60s após rollback."
  docker compose logs --tail 80 wuzapi 2>&1 || true
  exit 4
fi

echo "[rollback-wuzapi] OK — WuzAPI revertida para ${TARGET} e respondendo."
