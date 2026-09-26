#!/usr/bin/env bash
# Captura evidência read-only antes de mudar firewall/bind.
set -Eeuo pipefail
umask 077
[[ ${EUID:-999} -eq 0 ]] || { echo "BLOCKED: root only"; exit 10; }

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/root/centraldark-evidence/capture-${TS}"
mkdir -p "$OUT"
exec > >(tee -a "$OUT/execution.log") 2>&1

{
  echo "=== HOST ==="
  hostname; date -u; uptime
  echo
  echo "=== UFW ==="
  ufw status verbose || true
  ufw status numbered || true
  echo
  echo "=== SS LISTEN TCP ==="
  ss -lntp || true
  echo
  echo "=== FAIL2BAN ==="
  fail2ban-client ping || true
  fail2ban-client status sshd 2>/dev/null || true
  echo
  echo "=== PM2 (sanitizado: name status restarts) ==="
  pm2 jlist 2>/dev/null | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
  for (const x of JSON.parse(s||"[]")) {
    const e=x.pm2_env||{};
    console.log([x.name,"status="+e.status,"restarts="+e.restart_time,"pid="+x.pid].join("\t"));
  }
})' || true
  echo
  echo "=== DOCKER PS ==="
  docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null || true
} | tee "$OUT/report.txt"

sha256sum "$OUT/report.txt" | tee "$OUT/report.sha256"
echo "EVIDENCE=$OUT"
echo "STATUS=CAPTURED"