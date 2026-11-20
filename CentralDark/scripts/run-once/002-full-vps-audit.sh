#!/bin/bash
# Auditoria completa da VPS — roda via run-once
# Resultado vai para /var/log/clone-deck-run-once.log
set -uo pipefail

echo "=========================================="
echo "  AUDITORIA COMPLETA VPS — $(date)"
echo "=========================================="

echo ""
echo "=== 1. DOCKER CONTAINERS ==="
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker não disponível"

echo ""
echo "=== 2. DOCKER VOLUMES ==="
docker volume ls 2>/dev/null || echo "N/A"

echo ""
echo "=== 3. PM2 STATUS ==="
pm2 list 2>/dev/null || echo "PM2 não disponível"

echo ""
echo "=== 4. PORTAS EM USO ==="
ss -tulpn | grep LISTEN 2>/dev/null

echo ""
echo "=== 5. MEMÓRIA ==="
free -h 2>/dev/null

echo ""
echo "=== 6. DISCO ==="
df -h / 2>/dev/null

echo ""
echo "=== 7. NODE VERSION ==="
node --version 2>/dev/null

echo ""
echo "=== 8. WUZAPI STATUS ==="
source /root/Multizap/secrets/wabot.env 2>/dev/null || true
WUZAPI_BASE="${WUZAPI_URL:-http://127.0.0.1:8081}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
WUZAPI_RESP=$(curl -s --connect-timeout 5 "${WUZAPI_BASE}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null)
if [ -n "$WUZAPI_RESP" ]; then
  echo "$WUZAPI_RESP" | python3 -c "
import sys,json
try:
  d=json.load(sys.stdin)
  users=d.get('data',d) if isinstance(d,dict) else d
  for u in users:
    name=u.get('name',u.get('Name','?'))
    connected=u.get('connected',u.get('Connected','?'))
    print(f'  Session: {name[:20]}... | connected: {connected}')
  print(f'  Total: {len(users)} sessions')
except Exception as e:
  print(f'  Erro ao ler: {e}')
" 2>/dev/null
else
  echo "  WuzAPI não respondeu"
fi

echo ""
echo "=== 9. BACKUP EXISTENTE ==="
ls -la /root/Multizap/backups/whatsapp-session-* 2>/dev/null | tail -5 || echo "  Nenhum backup encontrado"

echo ""
echo "=== 10. VALIDAR ÚLTIMO BACKUP ==="
LATEST_BACKUP=$(ls -d /root/Multizap/backups/whatsapp-session-* 2>/dev/null | sort | tail -1)
if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP" ]; then
  echo "  Pasta: $LATEST_BACKUP"
  echo "  Conteúdo:"
  ls -lh "$LATEST_BACKUP/" 2>/dev/null
  
  # Validar dump SQL
  SQL_FILE=$(find "$LATEST_BACKUP" -name "*.sql" | head -1)
  if [ -n "$SQL_FILE" ] && [ -s "$SQL_FILE" ]; then
    echo "  ✅ Dump SQL: $(du -h "$SQL_FILE" | cut -f1), $(wc -l < "$SQL_FILE") linhas"
  else
    echo "  ❌ Dump SQL: ausente ou vazio"
  fi
  
  # Validar PM2
  PM2_FILE=$(find "$LATEST_BACKUP" -name "pm2-dump-*.json" | head -1)
  [ -n "$PM2_FILE" ] && echo "  ✅ PM2 dump: $(du -h "$PM2_FILE" | cut -f1)" || echo "  ❌ PM2 dump: ausente"
  
  # Validar Caddy
  CADDY_FILE=$(find "$LATEST_BACKUP" -name "Caddyfile-*" | head -1)
  [ -n "$CADDY_FILE" ] && echo "  ✅ Caddyfile: $(du -h "$CADDY_FILE" | cut -f1)" || echo "  ❌ Caddyfile: ausente"
  
  # Validar env
  ENV_FILE=$(find "$LATEST_BACKUP" -name "wabot.env.bak" | head -1)
  [ -n "$ENV_FILE" ] && echo "  ✅ wabot.env: backup existe" || echo "  ❌ wabot.env: ausente"
else
  echo "  Nenhum backup encontrado — run-once 001 ainda não executou"
fi

echo ""
echo "=== 11. URLs EXTERNAS ==="
for url in "https://multizap.dev" "https://bot.multizap.dev" "https://crm.multizap.dev" "https://hook.multizap.dev/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "$url" 2>/dev/null)
  echo "  $url → HTTP $CODE"
done

echo ""
echo "=== 12. CRM STATUS ==="
CRM_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:3010" 2>/dev/null)
echo "  http://127.0.0.1:3010 → HTTP $CRM_CODE"
CRM_AUTH=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:3010/auth" 2>/dev/null)
echo "  http://127.0.0.1:3010/auth → HTTP $CRM_AUTH"

echo ""
echo "=== AUDITORIA COMPLETA ==="
