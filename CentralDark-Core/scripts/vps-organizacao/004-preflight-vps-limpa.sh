#!/usr/bin/env bash
# CentralDark — preflight read-only para uma VPS recém-provisionada.
set -euo pipefail

fail=0
warn=0

kv() { printf '%-28s %s\n' "$1" "$2"; }
no() { kv "$1" "NO${2:+ — $2}"; fail=1; }
yes() { kv "$1" "YES${2:+ — $2}"; }
attention() { kv "$1" "ATTENTION${2:+ — $2}"; warn=1; }

kv "CENTRALDARK_CLEAN_PREFLIGHT" "1"
kv "MODE" "READ_ONLY"
kv "TIMESTAMP_UTC" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
kv "HOSTNAME" "$(hostname 2>/dev/null || echo UNKNOWN)"
kv "KERNEL" "$(uname -srmo 2>/dev/null || echo UNKNOWN)"

if [ "$(id -u)" -eq 0 ]; then
  yes "RUNNING_AS_ROOT"
else
  no "RUNNING_AS_ROOT" "bootstrap de sistema exige sessão root/sudo controlada"
fi

if [ -r /etc/os-release ]; then
  . /etc/os-release
  id="${ID:-unknown}"
  ver="${VERSION_ID:-0}"
  major="${ver%%.*}"
  case "$id" in
    debian)
      if [ "${major:-0}" -ge 12 ] 2>/dev/null; then yes "SUPPORTED_OS" "debian $ver"; else no "SUPPORTED_OS" "debian $ver < 12"; fi
      ;;
    ubuntu)
      if awk -v v="$ver" 'BEGIN { exit !(v+0 >= 22.04) }'; then yes "SUPPORTED_OS" "ubuntu $ver"; else no "SUPPORTED_OS" "ubuntu $ver < 22.04"; fi
      ;;
    *) no "SUPPORTED_OS" "$id $ver não está no baseline canônico atual" ;;
  esac
else
  no "SUPPORTED_OS" "/etc/os-release ausente"
fi

arch="$(uname -m 2>/dev/null || echo unknown)"
case "$arch" in
  x86_64|amd64|aarch64|arm64) yes "SUPPORTED_ARCH" "$arch" ;;
  *) attention "SUPPORTED_ARCH" "$arch precisa validação explícita" ;;
esac

if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
  yes "SYSTEMD_AVAILABLE"
else
  no "SYSTEMD_AVAILABLE" "baseline atual depende de systemd para serviços do host"
fi

if command -v apt-get >/dev/null 2>&1; then
  yes "APT_AVAILABLE"
else
  no "APT_AVAILABLE" "baseline Debian/Ubuntu requer apt-get"
fi

root_free="$(df -Pk / 2>/dev/null | awk 'NR==2 {print $4}')"
if [ -n "$root_free" ]; then
  kv "ROOT_FREE_KB" "$root_free"
else
  attention "ROOT_FREE_KB" "UNKNOWN"
fi

mem_kb="$(awk '/^MemTotal:/ {print $2}' /proc/meminfo 2>/dev/null || true)"
kv "MEM_TOTAL_KB" "${mem_kb:-UNKNOWN}"

residue=0
for p in /root/CentralDark /root/Multizap /root/dark /opt/CentralDark /srv/CentralDark; do
  if [ -e "$p" ]; then
    kv "RESIDUE_PATH" "$p"
    residue=1
  fi
done
if [ "$residue" -eq 0 ]; then
  yes "KNOWN_RUNTIME_ROOTS_ABSENT"
else
  no "KNOWN_RUNTIME_ROOTS_ABSENT" "host não está vazio; não chamar de VPS limpa"
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2_count="$(pm2 pid 2>/dev/null | awk 'NF && $1 ~ /^[0-9]+$/ && $1 != 0 {n++} END {print n+0}')"
  if [ "$pm2_count" -eq 0 ]; then yes "PM2_ACTIVE_PROCESSES_ZERO"; else no "PM2_ACTIVE_PROCESSES_ZERO" "$pm2_count processo(s)"; fi
else
  yes "PM2_ACTIVE_PROCESSES_ZERO" "pm2 ausente"
fi

if command -v docker >/dev/null 2>&1; then
  docker_count="$(docker ps -q 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${docker_count:-0}" -eq 0 ]; then yes "DOCKER_RUNNING_CONTAINERS_ZERO"; else no "DOCKER_RUNNING_CONTAINERS_ZERO" "$docker_count container(s)"; fi
else
  yes "DOCKER_RUNNING_CONTAINERS_ZERO" "docker ausente"
fi

if command -v ss >/dev/null 2>&1; then
  listeners="$(ss -lntH 2>/dev/null | wc -l | tr -d ' ')"
  kv "TCP_LISTENERS_COUNT" "${listeners:-UNKNOWN}"
else
  attention "TCP_LISTENERS_COUNT" "ss ausente"
fi

if command -v timedatectl >/dev/null 2>&1; then
  sync="$(timedatectl show -p NTPSynchronized --value 2>/dev/null || true)"
  if [ "$sync" = "yes" ]; then yes "TIME_SYNCHRONIZED"; else attention "TIME_SYNCHRONIZED" "${sync:-UNKNOWN}"; fi
fi

kv "MALWARE_VERDICT" "NOT_PROVEN"
kv "SECURITY_BASELINE" "NOT_PROVEN_UNTIL_POST_BUILD_GATES"

if [ "$fail" -eq 0 ]; then
  kv "READY_FOR_BOOTSTRAP" "YES"
  [ "$warn" -eq 0 ] || kv "WARNINGS_PRESENT" "YES"
  exit 0
fi

kv "READY_FOR_BOOTSTRAP" "NO"
exit 1
