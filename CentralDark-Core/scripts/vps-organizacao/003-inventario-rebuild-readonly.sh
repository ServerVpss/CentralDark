#!/usr/bin/env bash
# CentralDark — inventário read-only para rebuild determinístico de VPS.
# Não instala, não remove, não reinicia, não altera firewall/DNS/Caddy/PM2/Docker.
set -euo pipefail

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REVIEW_ROOT="${CD_REVIEW_ROOT:-/root/Multizap/revisoes}"
OUT="${REVIEW_ROOT}/${STAMP}/rebuild-inventory"
if ! mkdir -p "$OUT" 2>/dev/null; then
  OUT="/tmp/centraldark-${STAMP}-rebuild-inventory"
  mkdir -p "$OUT"
fi
chmod 700 "$OUT" 2>/dev/null || true

redact() {
  sed -E \
    -e 's#(https?://)[^/@[:space:]]+:[^/@[:space:]]+@#\1***:***@#g' \
    -e 's#((token|password|passwd|authorization|apikey|api_key|secret|client_secret|private_key|service_role)[[:space:]]*[=:][[:space:]]*)[^[:space:]]+#\1***REDACTED***#Ig' \
    -e 's#(Bearer[[:space:]]+)[A-Za-z0-9._~+/=-]+#\1***REDACTED***#Ig' \
    -e 's#(gh[pousr]_[A-Za-z0-9_]{8,})#***REDACTED_GITHUB_TOKEN***#g' \
    -e 's#(sb_(secret|publishable)_[A-Za-z0-9_-]{8,})#***REDACTED_SUPABASE_KEY***#g'
}

capture() {
  local name="$1"; shift
  {
    printf '# command:'
    printf ' %q' "$@"
    printf '\n\n'
    "$@" 2>&1 || true
  } | redact >"$OUT/${name}.txt"
  chmod 600 "$OUT/${name}.txt" 2>/dev/null || true
}

capture_shell() {
  local name="$1" code="$2"
  {
    printf '# shell: %s\n\n' "$code"
    bash -lc "$code" 2>&1 || true
  } | redact >"$OUT/${name}.txt"
  chmod 600 "$OUT/${name}.txt" 2>/dev/null || true
}

{
  echo "CENTRALDARK_REBUILD_INVENTORY=1"
  echo "MODE=READ_ONLY"
  echo "TIMESTAMP_UTC=$STAMP"
  echo "HOSTNAME=$(hostname 2>/dev/null || echo UNKNOWN)"
  echo "MALWARE_VERDICT=NOT_PROVEN"
  echo "TRUST_CURRENT_HOST=NO"
  echo "NOTE=Este relatório inventaria estado; não declara a VPS limpa."
} >"$OUT/00-manifest.txt"

capture "01-os-release" cat /etc/os-release
capture "02-kernel" uname -a
capture "03-filesystems" df -hT
capture "04-memory" free -h
capture_shell "05-runtime-versions" '
command -v git >/dev/null && git --version || true
command -v node >/dev/null && node --version || true
command -v npm >/dev/null && npm --version || true
command -v bun >/dev/null && bun --version || true
command -v python3 >/dev/null && python3 --version || true
command -v uv >/dev/null && uv --version || true
command -v docker >/dev/null && docker --version || true
command -v caddy >/dev/null && caddy version || true
command -v pm2 >/dev/null && pm2 --version || true
'

capture_shell "06-listening-ports" 'command -v ss >/dev/null && ss -lntup || command -v netstat >/dev/null && netstat -lntup || true'
capture_shell "07-running-services" 'command -v systemctl >/dev/null && systemctl list-units --type=service --state=running --no-pager || true'
capture_shell "08-pm2-summary" 'command -v pm2 >/dev/null && pm2 ls --no-color || true'
capture_shell "09-docker-containers" 'command -v docker >/dev/null && docker ps --no-trunc --format "table {{.ID}}\t{{.Image}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}" || true'
capture_shell "10-docker-volumes" 'command -v docker >/dev/null && docker volume ls || true'
capture_shell "11-docker-images" 'command -v docker >/dev/null && docker images --digests --format "table {{.Repository}}\t{{.Tag}}\t{{.Digest}}\t{{.ID}}\t{{.CreatedSince}}" || true'

capture_shell "12-caddy-state" '
if command -v systemctl >/dev/null; then systemctl status caddy --no-pager || true; fi
if [ -f /etc/caddy/Caddyfile ]; then
  echo "CADDYFILE_SHA256=$(sha256sum /etc/caddy/Caddyfile | awk "{print \$1}")"
  echo "CADDYFILE_MODE=$(stat -c "%a %U:%G" /etc/caddy/Caddyfile 2>/dev/null || true)"
fi
'

capture_shell "13-cron-metadata" '
echo "# root crontab (redacted)"; crontab -l 2>/dev/null || true
echo; echo "# /etc/cron.d filenames"; find /etc/cron.d -maxdepth 1 -type f -printf "%f\n" 2>/dev/null | sort || true
echo; echo "# timers"; command -v systemctl >/dev/null && systemctl list-timers --all --no-pager || true
'

capture_shell "14-security-surface" '
echo "# SUID/SGID files on root filesystem"
find / -xdev -type f \( -perm -4000 -o -perm -2000 \) -printf "%m %u:%g %p\n" 2>/dev/null | sort || true
echo; echo "# world-writable executables in common runtime roots"
for d in /usr/local/bin /opt /srv /root/CentralDark /root/Multizap; do
  [ -d "$d" ] || continue
  find "$d" -xdev -type f -perm -0002 -executable -printf "%m %u:%g %p\n" 2>/dev/null || true
done
'

capture_shell "15-security-tools" '
for c in clamscan clamdscan freshclam trivy rkhunter chkrootkit; do
  if command -v "$c" >/dev/null 2>&1; then echo "$c=PRESENT ($(command -v "$c"))"; else echo "$c=MISSING"; fi
done
'

capture_shell "16-ssh-key-fingerprints" '
for f in /root/.ssh/authorized_keys /home/*/.ssh/authorized_keys; do
  [ -f "$f" ] || continue
  echo "FILE=$f MODE=$(stat -c "%a %U:%G" "$f" 2>/dev/null || true)"
  while IFS= read -r line; do
    [ -n "$line" ] || continue
    printf "%s\n" "$line" | ssh-keygen -lf - 2>/dev/null || echo "UNPARSEABLE_KEY"
  done < "$f"
done
'

capture_shell "17-repo-state" '
for d in /root/CentralDark /root/Multizap /root/dark /opt/CentralDark /srv/CentralDark; do
  [ -d "$d/.git" ] || continue
  echo "=== $d ==="
  git -C "$d" status --short --branch 2>/dev/null || true
  echo "HEAD=$(git -C "$d" rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
  echo "REMOTE=$(git -C "$d" remote get-url origin 2>/dev/null || echo UNKNOWN)"
  echo
done
'

capture_shell "18-env-key-names-only" '
for root in /root/CentralDark /root/Multizap /root/dark /opt/CentralDark /srv/CentralDark; do
  [ -d "$root" ] || continue
  find "$root" -xdev -maxdepth 6 -type f \( -name ".env" -o -name "*.env" \) -print0 2>/dev/null |
    while IFS= read -r -d "" f; do
      echo "=== $f ==="
      stat -c "MODE=%a OWNER=%U:%G SIZE=%s" "$f" 2>/dev/null || true
      sed -nE "s/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=.*/\2/p" "$f" | sort -u
      echo
    done
done
'

capture_shell "19-runtime-roots" '
for d in /root/CentralDark /root/Multizap /root/dark /opt/CentralDark /srv/CentralDark /var/lib/docker /etc/caddy; do
  [ -e "$d" ] || continue
  printf "%-28s " "$d"
  du -sh "$d" 2>/dev/null | awk "{print \$1}" || echo UNKNOWN
done
'

(
  cd "$OUT"
  sha256sum ./*.txt | sort
) >"$OUT/SHA256SUMS"
chmod 600 "$OUT/SHA256SUMS" 2>/dev/null || true

printf 'STATUS=INVENTORY_CAPTURED\n'
printf 'TRUST_CURRENT_HOST=NO\n'
printf 'MALWARE_VERDICT=NOT_PROVEN\n'
printf 'REPORT_DIR=%s\n' "$OUT"
printf 'NEXT=Copiar os relatórios para análise fora da VPS; não restaurar executáveis/binários desta máquina em uma VPS nova.\n'
