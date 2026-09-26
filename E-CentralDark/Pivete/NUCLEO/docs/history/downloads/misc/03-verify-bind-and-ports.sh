#!/usr/bin/env bash
# Contraprova pós-hardening.
set -Eeuo pipefail
[[ ${EUID:-999} -eq 0 ]] || { echo "BLOCKED: root only"; exit 10; }

FAIL=0

echo "=== UFW ==="
ufw status | head -5

echo
echo "=== Portas que NÃO podem estar em 0.0.0.0 ==="
for PORT in 3090 8082 8083 8090 8899 9077 9100; do
  if ss -H -lntp "sport = :$PORT" 2>/dev/null | grep -qE '0\.0\.0\.0:' ; then
    echo "FAIL: porta $PORT ainda em 0.0.0.0"
    ss -H -lntp "sport = :$PORT" || true
    FAIL=1
  else
    echo "OK: $PORT não está público (ou down)"
  fi
done

echo
echo "=== fail2ban ==="
if fail2ban-client ping 2>/dev/null | grep -qi pong; then
  echo "OK: fail2ban pong"
else
  echo "FAIL: fail2ban"
  FAIL=1
fi

echo
echo "=== HTTP local smoke (não imprime body) ==="
for URL in \
  http://127.0.0.1:8082/health \
  http://127.0.0.1:9100/health \
  http://127.0.0.1:80/
 do
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$URL" || echo 000)"
  echo "$URL -> $code"
done

if [[ "$FAIL" -eq 0 ]]; then
  echo "STATUS=PASS"
  exit 0
else
  echo "STATUS=FAIL"
  exit 1
fi