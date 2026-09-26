#!/usr/bin/env bash
# UFW canônico: 22 + 80 + 443. Remove allow amplo de 3000/9000.
# NÃO altera SSH auth. NÃO reseta UFW por completo (evita janela aberta).
# Uso: CLOSE_EXTRA=1 bash 02-apply-ufw-canonical.sh
set -Eeuo pipefail
umask 077
[[ ${EUID:-999} -eq 0 ]] || { echo "BLOCKED: root only"; exit 10; }

TS="$(date -u +%Y%m%dT%H%M%SZ)"
BAK="/root/centraldark-evidence/ufw-backup-${TS}"
mkdir -p "$BAK"
cp -a /etc/ufw "$BAK/ufw" || true
ufw status numbered > "$BAK/ufw-status-before.txt" || true
echo "BACKUP=$BAK"

CLOSE_EXTRA="${CLOSE_EXTRA:-0}"

echo "=== Garante default deny ==="
ufw default deny incoming
ufw default allow outgoing

echo "=== Garante allows canônicos ==="
ufw allow 22/tcp comment 'ssh'
ufw allow 80/tcp comment 'http-caddy'
ufw allow 443/tcp comment 'https-caddy'

# Remove regras 3000 conflitantes (números mudam — deleta por padrão textual via reset seletivo)
# Estratégia segura: deny explícito 3000/tcp e 9000/tcp após limpar allows genéricos.
# Como ufw delete precisa de número, usamos loop interativo não-interativo:

delete_matching() {
  local pattern="$1"
  local safety=0
  while ufw status numbered | grep -E "$pattern" >/dev/null 2>&1; do
    local num
    num="$(ufw status numbered | grep -E "$pattern" | head -1 | sed -n 's/^\[\s*\([0-9][0-9]*\)\].*/\1/p')"
    [[ -n "$num" ]] || break
    echo "DELETE rule $num ($pattern)"
    ufw --force delete "$num"
    safety=$((safety+1))
    [[ $safety -lt 30 ]] || { echo "BLOCKED: too many deletes"; exit 20; }
  done
}

echo "=== Remove regras 3000 (deny e allow conflitantes) ==="
delete_matching '[[:space:]]3000(/tcp)?[[:space:]]'

echo "=== Remove ALLOW 9000 se CLOSE_EXTRA=1 ==="
if [[ "$CLOSE_EXTRA" == "1" ]]; then
  delete_matching '[[:space:]]9000/tcp[[:space:]]+ALLOW'
  ufw deny 9000/tcp comment 'webhook-system-closed'
fi

echo "=== Deny explícito portas de app que não devem ser públicas ==="
for p in 3000 3090 8082 8083 8090 8899 9077 9100 3100 8080; do
  ufw deny "${p}/tcp" comment "app-not-public-${p}" || true
done

ufw --force enable
ufw status verbose | tee "$BAK/ufw-status-after.txt"

echo
echo "STATUS=UFW_APPLIED"
echo "BACKUP=$BAK"
echo "NOTA: serviços internos DEVEM escutar 127.0.0.1 antes; senão Caddy quebra se apontava para IP público."
echo "SSH: mantenha outra sessão aberta. Console Contabo se lockout."