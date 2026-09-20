#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="builder-bolt"
CONTAINER_NAME="centraldark-builder-bolt"
DEFAULT_ROOT="/root/CentralDark"
ROOT_DIR="${CENTRALDARK_ROOT:-$DEFAULT_ROOT}"
APP_DIR="${BUILDER_BOLT_DIR:-$ROOT_DIR/apps/builder-bolt}"
SOURCE_DIR="${BOLT_SOURCE_DIR:-$APP_DIR/source}"
REVISOES_ROOT="${CENTRALDARK_REVISOES:-$ROOT_DIR/revisoes}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
REPORT_DIR="$REVISOES_ROOT/$STAMP-$APP_NAME"
REPORT_FILE="$REPORT_DIR/relatorio.md"
BOLT_REPO_URL="${BOLT_REPO_URL:-https://github.com/stackblitz-labs/bolt.diy.git}"
BOLT_REF="${BOLT_REF:-main}"
BOLT_HOST_BIND="${BOLT_HOST_BIND:-127.0.0.1}"
BOLT_HOST_PORT="${BOLT_HOST_PORT:-5174}"
BOLT_INTERNAL_PORT="${BOLT_INTERNAL_PORT:-5173}"
PUBLIC_ORIGIN="${PUBLIC_ORIGIN:-https://builder.centralldark.com}"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"
TARGET_OVERRIDE_FILE="$REPORT_DIR/docker-compose.target.override.yml"
PRODUCTION_TARGET=""
CONFIRM_VAR_NAME="CD_CONFIRM_BUILDER_BOLT"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

fail() {
  log "ERRO: $*"
  write_report "falha" "$*"
  exit 1
}

write_report() {
  local status="$1"
  local detail="${2:-}"
  mkdir -p "$REPORT_DIR"
  cat > "$REPORT_FILE" <<REPORT
# Relatório Builder Bolt

- Data UTC: $(date -u +%Y-%m-%dT%H:%M:%SZ)
- Status: $status
- App: $APP_NAME
- Container alvo: $CONTAINER_NAME
- Diretório app: $APP_DIR
- Source bolt.diy: $SOURCE_DIR
- Porta local: $BOLT_HOST_BIND:$BOLT_HOST_PORT
- Porta interna: $BOLT_INTERNAL_PORT
- Origem pública planejada: $PUBLIC_ORIGIN
- Detalhe: $detail

## Restrições respeitadas

- Não reinicia Docker global.
- Não toca em Open WebUI, WuzAPI, WhatsApp, CRM, Supabase, banco real ou containers antigos.
- Não lê nem imprime secrets.
- Sobe apenas o compose do Builder Bolt quando executado com confirmação operacional explícita (`CD_CONFIRM_BUILDER_BOLT=1`).
- Não usa porta 3000 e bloqueia host port 3000.
REPORT
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatório ausente: $1"
}

assert_safe_scope() {
  case "$APP_DIR" in
    */apps/builder-bolt) ;;
    *) fail "APP_DIR fora do escopo permitido: $APP_DIR" ;;
  esac

  if [[ "$BOLT_HOST_BIND" != "127.0.0.1" ]]; then
    fail "Bind público não permitido. Use BOLT_HOST_BIND=127.0.0.1"
  fi

  if [[ "$BOLT_HOST_PORT" == "3000" || "$BOLT_INTERNAL_PORT" == "3000" ]]; then
    fail "Porta 3000 é protegida pelo Open WebUI e não pode ser usada pelo Builder Bolt."
  fi
}

container_owns_port() {
  local inspect
  inspect="$(docker container inspect "$CONTAINER_NAME" --format '{{json .NetworkSettings.Ports}}' 2>/dev/null || true)"
  [[ -n "$inspect" ]] || return 1

  python3 -c '
import json, sys
wanted_ip, wanted_port, payload = sys.argv[1], sys.argv[2], sys.argv[3]
try:
    ports = json.loads(payload) or {}
except Exception:
    sys.exit(1)
for bindings in ports.values():
    for binding in bindings or []:
        if binding.get("HostPort") == wanted_port and binding.get("HostIp") in (wanted_ip, "0.0.0.0", "::"):
            sys.exit(0)
sys.exit(1)
' "$BOLT_HOST_BIND" "$BOLT_HOST_PORT" "$inspect"
}

require_deploy_confirmation() {
  if [[ "${CD_CONFIRM_BUILDER_BOLT:-}" != "1" ]]; then
    write_report "bloqueado" "Deploy não executado: defina CD_CONFIRM_BUILDER_BOLT=1 para autorizar docker compose up do Builder Bolt."
    log "BLOQUEADO: confirmação operacional ausente. Reexecute com CD_CONFIRM_BUILDER_BOLT=1 para permitir docker compose up somente do Builder Bolt."
    exit 2
  fi
}

check_port_free() {
  if command -v ss >/dev/null 2>&1; then
    if ss -H -ltn "sport = :$BOLT_HOST_PORT" | awk '{print $4}' | grep -qE "(^|:)${BOLT_HOST_PORT}$"; then
      if container_owns_port; then
        log "Porta local $BOLT_HOST_PORT já está em uso pelo container $CONTAINER_NAME; reexecução permitida."
        return 0
      fi
      fail "Porta local $BOLT_HOST_PORT já está em uso por outro processo/container. Abortado sem tocar em containers existentes."
    fi
  elif command -v lsof >/dev/null 2>&1; then
    if lsof -nP -iTCP:"$BOLT_HOST_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
      if container_owns_port; then
        log "Porta local $BOLT_HOST_PORT já está em uso pelo container $CONTAINER_NAME; reexecução permitida."
        return 0
      fi
      fail "Porta local $BOLT_HOST_PORT já está em uso por outro processo/container. Abortado sem tocar em containers existentes."
    fi
  else
    log "AVISO: ss/lsof ausentes; validação de porta será limitada."
  fi
}

prepare_source() {
  mkdir -p "$APP_DIR"

  if [[ ! -f "$COMPOSE_FILE" ]]; then
    fail "Compose não encontrado em $COMPOSE_FILE. Faça pull do repo CentralDark antes de instalar."
  fi

  if [[ -d "$SOURCE_DIR/.git" ]]; then
    log "Source bolt.diy já existe; atualizando referência sem mexer em outros diretórios."
    git -C "$SOURCE_DIR" fetch --depth 1 origin "$BOLT_REF"
    git -C "$SOURCE_DIR" checkout --detach FETCH_HEAD
  elif [[ -e "$SOURCE_DIR" ]]; then
    fail "Diretório source existe mas não parece git: $SOURCE_DIR"
  else
    log "Clonando bolt.diy em source isolado."
    git clone --depth 1 --branch "$BOLT_REF" "$BOLT_REPO_URL" "$SOURCE_DIR" \
      || { rm -rf "$SOURCE_DIR"; git clone --depth 1 "$BOLT_REPO_URL" "$SOURCE_DIR"; git -C "$SOURCE_DIR" checkout "$BOLT_REF"; }
  fi

  [[ -f "$SOURCE_DIR/Dockerfile" ]] || fail "Dockerfile do bolt.diy não encontrado em $SOURCE_DIR"
}

detect_production_target() {
  local dockerfile="$SOURCE_DIR/Dockerfile"
  local candidates=(production prod bolt-ai-production release runner)
  local candidate

  PRODUCTION_TARGET=""
  for candidate in "${candidates[@]}"; do
    if awk 'BEGIN{IGNORECASE=1} /^FROM[[:space:]].+[[:space:]]+AS[[:space:]]+/ {print $NF}' "$dockerfile" | grep -Fxqi "$candidate"; then
      PRODUCTION_TARGET="$candidate"
      break
    fi
  done

  if [[ -n "$PRODUCTION_TARGET" ]]; then
    cat > "$TARGET_OVERRIDE_FILE" <<OVERRIDE
services:
  builder-bolt:
    build:
      target: $PRODUCTION_TARGET
OVERRIDE
    log "Dockerfile upstream expõe target de produção '$PRODUCTION_TARGET'; override temporário ativado."
  else
    rm -f "$TARGET_OVERRIDE_FILE"
    log "Dockerfile upstream sem target de produção conhecido; usando build padrão para evitar quebra."
  fi
}

compose() {
  local files=(-f "$COMPOSE_FILE")
  if [[ -n "$PRODUCTION_TARGET" && -f "$TARGET_OVERRIDE_FILE" ]]; then
    files+=(-f "$TARGET_OVERRIDE_FILE")
  fi

  BOLT_SOURCE_DIR="$SOURCE_DIR" \
  BOLT_HOST_BIND="$BOLT_HOST_BIND" \
  BOLT_HOST_PORT="$BOLT_HOST_PORT" \
  BOLT_INTERNAL_PORT="$BOLT_INTERNAL_PORT" \
  PUBLIC_ORIGIN="$PUBLIC_ORIGIN" \
    docker compose "${files[@]}" "$@"
}

main() {
  mkdir -p "$REPORT_DIR"
  log "Iniciando instalação isolada do Builder Bolt."

  require_cmd docker
  require_cmd git
  require_cmd python3
  if ! docker compose version >/dev/null 2>&1; then
    fail "docker compose não disponível."
  fi

  assert_safe_scope
  check_port_free
  prepare_source
  detect_production_target

  log "Validando docker compose config."
  compose config >/dev/null || fail "docker compose config falhou para o Builder Bolt."

  require_deploy_confirmation

  log "Construindo e subindo somente o container $CONTAINER_NAME."
  if ! compose up -d --build builder-bolt; then
    fail "docker compose up/build falhou para o Builder Bolt. Consulte este relatório e os logs locais sanitizados antes de tentar novamente."
  fi

  log "Aguardando health HTTP local."
  local ok=0
  for _ in $(seq 1 60); do
    if curl -fsS "http://$BOLT_HOST_BIND:$BOLT_HOST_PORT" >/dev/null 2>&1; then
      ok=1
      break
    fi
    sleep 2
  done

  if [[ "$ok" != "1" ]]; then
    compose ps || true
    fail "Health local não respondeu em http://$BOLT_HOST_BIND:$BOLT_HOST_PORT dentro do prazo."
  fi

  write_report "ok" "Builder Bolt respondeu em http://$BOLT_HOST_BIND:$BOLT_HOST_PORT."
  log "Concluído. Relatório: $REPORT_FILE"
}

main "$@"
