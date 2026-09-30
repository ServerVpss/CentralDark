#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

SOURCE_ROOT="${CENTRALDARK_SOURCE_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
RUNTIME_ROOT="${CENTRALDARK_RUNTIME_ROOT:-$SOURCE_ROOT}"
DRIVE_ROOT="${CENTRALDARK_DRIVE_REMOTE_ROOT:-gdrive:CentralDark}"
PROCESS_NAME="CentralDark-SyncDrive"
HEARTBEAT_ENV="/etc/centraldark-fixed-point.env"

log() { printf '[FORJA_TOTAL] %s\n' "$*"; }
fail() { printf '[FORJA_TOTAL][ERRO] %s\n' "$*" >&2; exit "${2:-1}"; }

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=""
elif command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  SUDO="sudo"
else
  fail "root/sudo sem senha necessário para instalar o heartbeat" 10
fi

install_missing_deps() {
  local missing=()
  local c
  for c in rclone jq sha256sum python3 flock curl openssl pm2 git; do
    command -v "$c" >/dev/null 2>&1 || missing+=("$c")
  done
  [[ ${#missing[@]} -eq 0 ]] && return 0

  if command -v apt-get >/dev/null 2>&1; then
    local apt_pkgs=()
    for c in "${missing[@]}"; do
      case "$c" in
        rclone) apt_pkgs+=(rclone) ;;
        jq) apt_pkgs+=(jq) ;;
        sha256sum) apt_pkgs+=(coreutils) ;;
        python3) apt_pkgs+=(python3 python3-venv) ;;
        flock) apt_pkgs+=(util-linux) ;;
        curl) apt_pkgs+=(curl) ;;
        openssl) apt_pkgs+=(openssl) ;;
        git) apt_pkgs+=(git) ;;
        pm2) ;;
      esac
    done
    if [[ ${#apt_pkgs[@]} -gt 0 ]]; then
      $SUDO apt-get update -qq
      DEBIAN_FRONTEND=noninteractive $SUDO apt-get install -y --no-install-recommends "${apt_pkgs[@]}"
    fi
    if ! command -v pm2 >/dev/null 2>&1; then
      command -v npm >/dev/null 2>&1 || fail "npm ausente; instale Node.js pelo instalador CentralDark antes da Forja Total" 11
      $SUDO npm install -g pm2
    fi
  fi

  for c in rclone jq sha256sum python3 flock curl openssl pm2 git; do
    command -v "$c" >/dev/null 2>&1 || fail "dependência ausente após tentativa de instalação: $c" 12
  done
}

preflight() {
  [[ -d "$SOURCE_ROOT/.git" ]] || fail "SOURCE_ROOT não é checkout Git: $SOURCE_ROOT" 13
  [[ -d "$RUNTIME_ROOT" ]] || fail "RUNTIME_ROOT ausente: $RUNTIME_ROOT" 14
  [[ -f "$SOURCE_ROOT/scripts/sync-loop.sh" ]] || fail "fonte sync-loop ausente" 15
  [[ -f "$SOURCE_ROOT/scripts/drive-ingest-once.sh" ]] || fail "fonte drive-ingest ausente" 16
  [[ -f "$SOURCE_ROOT/scripts/lupa/pr_secret_scan.py" ]] || fail "secret scanner canônico ausente" 17
  rclone listremotes | grep -Fxq 'gdrive:' || fail "remote rclone gdrive: não configurado" 18
  rclone lsf "$DRIVE_ROOT" --max-depth 1 >/dev/null || fail "Drive CentralDark não acessível: $DRIVE_ROOT" 19
}

deploy_drive_owner() {
  local target_sync="$RUNTIME_ROOT/scripts/sync-loop.sh"
  local target_ingest="$RUNTIME_ROOT/scripts/drive-ingest-once.sh"
  mkdir -p "$RUNTIME_ROOT/scripts"

  local backup_dir
  backup_dir="$(mktemp -d)"
  local sync_existed=0 ingest_existed=0 mutated=0
  [[ -f "$target_sync" ]] && { sync_existed=1; cp -a "$target_sync" "$backup_dir/sync-loop.sh"; }
  [[ -f "$target_ingest" ]] && { ingest_existed=1; cp -a "$target_ingest" "$backup_dir/drive-ingest-once.sh"; }

  rollback_drive() {
    local rc=$?
    trap - EXIT ERR
    if [[ "$rc" -ne 0 && "$mutated" == "1" ]]; then
      if [[ "$sync_existed" == "1" ]]; then install -m 0755 "$backup_dir/sync-loop.sh" "$target_sync" || true; else rm -f "$target_sync"; fi
      if [[ "$ingest_existed" == "1" ]]; then install -m 0755 "$backup_dir/drive-ingest-once.sh" "$target_ingest" || true; else rm -f "$target_ingest"; fi
      pm2 restart "$PROCESS_NAME" >/dev/null 2>&1 || true
      pm2 save --force >/dev/null 2>&1 || true
      log "DRIVE_ROLLBACK=ATTEMPTED"
    fi
    rm -rf "$backup_dir"
    exit "$rc"
  }
  trap rollback_drive EXIT ERR

  install -m 0755 "$SOURCE_ROOT/scripts/sync-loop.sh" "$target_sync"
  install -m 0755 "$SOURCE_ROOT/scripts/drive-ingest-once.sh" "$target_ingest"
  mutated=1
  cmp -s "$SOURCE_ROOT/scripts/sync-loop.sh" "$target_sync" || fail "hash/cópia do sync-loop divergente" 20
  cmp -s "$SOURCE_ROOT/scripts/drive-ingest-once.sh" "$target_ingest" || fail "hash/cópia do ingest divergente" 21

  CENTRALDARK_REPO_ROOT="$RUNTIME_ROOT" \
  CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL=0 \
  CENTRALDARK_DRIVE_INGEST_REQUIRE=1 \
  "$target_ingest" | tee /tmp/centraldark-drive-ingest-preflight.txt
  grep -Eq '^DRIVE_INGEST_STATUS=(INGESTED|NO_CHANGE)$' /tmp/centraldark-drive-ingest-preflight.txt || fail "Drive real não entregou delta elegível" 22

  if pm2 jlist | jq -e --arg n "$PROCESS_NAME" 'any(.[]; .name == $n)' >/dev/null; then
    pm2 restart "$PROCESS_NAME" >/dev/null
  else
    CENTRALDARK_REPO_ROOT="$RUNTIME_ROOT" pm2 start "$target_sync" --name "$PROCESS_NAME" --interpreter bash --cwd "$RUNTIME_ROOT" >/dev/null
  fi
  pm2 save --force >/dev/null
  sleep 3
  pm2 jlist | jq -e --arg n "$PROCESS_NAME" 'any(.[]; .name == $n and .pm2_env.status == "online" and (.pid | tonumber) > 0)' >/dev/null || fail "PM2 $PROCESS_NAME não ficou online" 23

  CENTRALDARK_REPO_ROOT="$RUNTIME_ROOT" \
  CENTRALDARK_DRIVE_INGEST_RUN_SENTINEL=1 \
  CENTRALDARK_DRIVE_INGEST_REQUIRE=1 \
  "$target_ingest" | tee /tmp/centraldark-drive-ingest-routed.txt
  grep -Eq '^DRIVE_INGEST_STATUS=(INGESTED|NO_CHANGE)$' /tmp/centraldark-drive-ingest-routed.txt || fail "segunda leitura do delta falhou" 24
  grep -Eq '^DRIVE_INGEST_SENTINEL=(PASS|NO_CHANGE)$' /tmp/centraldark-drive-ingest-routed.txt || fail "Memory Linker sentinel não confirmou roteamento" 25

  mutated=0
  trap - EXIT ERR
  rm -rf "$backup_dir"
  log "CENTRALDARK_SYNC_DRIVE=ONLINE"
  log "DRIVE_INGEST_RUNTIME=PASS"
}

ensure_heartbeat_secret() {
  local tmp
  tmp="$(mktemp)"
  if $SUDO test -f "$HEARTBEAT_ENV"; then
    if $SUDO grep -Eq '^CENTRALDARK_HEARTBEAT_SECRET=.+$' "$HEARTBEAT_ENV"; then
      $SUDO chmod 600 "$HEARTBEAT_ENV"
      rm -f "$tmp"
      return 0
    fi
    $SUDO cat "$HEARTBEAT_ENV" >"$tmp"
  fi
  printf 'CENTRALDARK_HEARTBEAT_SECRET=%s\n' "$(openssl rand -hex 32)" >>"$tmp"
  $SUDO install -m 0600 "$tmp" "$HEARTBEAT_ENV"
  rm -f "$tmp"
}

deploy_heartbeat() {
  local owner=""
  if systemctl is-active --quiet centraldark-vps-heartbeat.service; then owner="centraldark-vps-heartbeat.service"; fi
  if ss -ltn 'sport = :9119' 2>/dev/null | grep -q LISTEN && [[ "$owner" != "centraldark-vps-heartbeat.service" ]]; then
    log "VPS_HEARTBEAT_STATUS=BLOCKED_PORT_9119"
    return 31
  fi

  ensure_heartbeat_secret
  $SUDO bash "$SOURCE_ROOT/apps/modulos/fixed-point-fabric/deploy/linux/install.sh"
  $SUDO systemctl enable --now centraldark-vps-heartbeat.service
  local health
  health="$(curl -fsS --max-time 5 http://127.0.0.1:9119/)"
  jq -e '.timestamp and .hostname and .agent_version == "1.0.0" and (.signature | type == "string" and length == 64)' <<<"$health" >/dev/null || return 32
  log "VPS_HEARTBEAT_HEALTH=PASS"
}

main() {
  install_missing_deps
  preflight
  deploy_drive_owner
  if deploy_heartbeat; then
    :
  else
    rc=$?
    log "FORJA_TOTAL_STATUS=PARTIAL_DRIVE_PASS_HEARTBEAT_BLOCKED"
    exit "$rc"
  fi
  log "FORJA_TOTAL_STATUS=VPS_COMPONENTS_PASS"
  log "FIXED_POINT=NOT_CLAIMED"
  log "NEXT_CURSOR=CASA_GITHUB_SCREENPIPE_RENDEZVOUS"
}

main "$@"
