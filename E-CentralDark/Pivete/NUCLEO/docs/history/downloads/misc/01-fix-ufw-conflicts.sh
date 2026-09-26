#!/usr/bin/env bash
# Só leitura: detecta regras UFW contraditórias e portas 0.0.0.0 suspeitas.
set -Eeuo pipefail
[[ ${EUID:-999} -eq 0 ]] || { echo "BLOCKED: root only"; exit 10; }

echo "=== UFW numbered ==="
ufw status numbered

echo
echo "=== Conflitos óbvios 3000 ==="
ufw status numbered | grep -E '3000' || echo "(nenhuma regra 3000)"

echo
echo "=== Listeners em 0.0.0.0 (não localhost) ==="
ss -H -lntp | awk '
  $1=="LISTEN" {
    # local address is field 4 in ss -H -lntp typically
    split($4, a, ":");
    port=a[length(a)];
    if ($4 ~ /^0\.0\.0\.0:/ || $4 ~ /^\*:/) print $0
  }'

echo
echo "=== Esperado público: 22, 80, 443 (e nada mais sem Caddy) ==="
echo "STATUS=READ_ONLY_OK"