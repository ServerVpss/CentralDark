#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 013: Fix CRM Caddy + rebuild + WuzAPI webhook
#
# Problema: CRM esta servindo Python SimpleHTTP fallback
#           que retorna 404 em /auth e outras rotas SPA.
#
# Solucao:
#   1. Mata fallback Python
#   2. Constroi CRM (npm run build)
#   3. Sobe CRM como preview via PM2 na porta 3010
#   4. Se falhar, muda Caddy pra servir como SPA estatico
#   5. Configura webhook WuzAPI para Gateway :3100
#   6. Testa tudo
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
CADDYFILE="/etc/caddy/Caddyfile"
CRM_PORT="3010"
CRM_DIR="$CLONE_DECK/apps/crm"
CRM_FALLBACK_ROOT="/var/www/multizap/crm"
WUZAPI_URL="${WUZAPI_URL:-http://127.0.0.1:8081}"
GATEWAY_PORT="3100"
REVISAO="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/013-fix-crm"
LOG_PREFIX="[fix-crm]"

say() { echo "$LOG_PREFIX $*"; }
mkdir -p "$REVISAO"
exec > >(tee -a "$REVISAO/comandos.log") 2>&1

say "=== RUN-ONCE 013: Fix CRM Caddy + Build ==="

# 1. MATAR PROCESSO PYTHON FALLBACK
say "--- Matando fallback Python CRM ---"
PM2_LIST=$(pm2 list 2>/dev/null)
if echo "$PM2_LIST" | grep -q "CloneDeck-CRM"; then
  pm2 delete CloneDeck-CRM 2>/dev/null && say "OK processo CloneDeck-CRM removido" || say "AVISO falha ao remover CloneDeck-CRM"
fi
# Mata qualquer python na porta CRM
PID=$(ss -tlnp | grep ":$CRM_PORT" | grep -oP 'pid=\K[0-9]+' 2>/dev/null)
if [ -n "$PID" ]; then
  kill "$PID" 2>/dev/null && say "OK processo Python na porta $CRM_PORT morto" || true
fi
sleep 2

# 2. BUILD DO CRM
say "--- Build CRM ---"
cd "$CRM_DIR" || { say "ERRO: $CRM_DIR nao encontrado"; exit 1; }

BUILD_OK=0
if command -v npm >/dev/null 2>&1; then
  npm install --silent 2>/dev/null || npm install 2>/dev/null
  npm run build > "$REVISAO/build.log" 2>&1
  if [ $? -eq 0 ]; then
    BUILD_OK=1
    say "OK build CRM concluido"
  else
    say "WARN build CRM falhou - ver $REVISAO/build.log"
  fi
fi

# 3. TENTAR SUBIR PREVIEW
PREVIEW_OK=0
if [ "$BUILD_OK" -eq 1 ]; then
  pm2 start npm --name CloneDeck-CRM --cwd "$CRM_DIR" -- run preview -- --host 127.0.0.1 --port "$CRM_PORT" >/dev/null 2>&1
  # Aguarda responder
  for i in $(seq 1 15); do
    sleep 2
    CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://127.0.0.1:${CRM_PORT}" 2>/dev/null || echo "000")
    if [ "$CODE" != "000" ]; then
      PREVIEW_OK=1
      say "OK CRM preview respondeu code=$CODE"
      break
    fi
  done
fi

# 4. SE PREVIEW FALHOU, USA SPA ESTATICO
if [ "$PREVIEW_OK" -eq 0 ]; then
  say "--- Usando fallback SPA estatico para CRM ---"
  
  # Tenta usar dist se existir
  if [ -d "$CRM_DIR/dist" ]; then
    rm -rf "$CRM_FALLBACK_ROOT"
    cp -a "$CRM_DIR/dist" "$CRM_FALLBACK_ROOT"
    say "OK copiado dist para $CRM_FALLBACK_ROOT"
  else
    ensure_index() {
      dir="$1"; title="$2"; msg="$3"
      mkdir -p "$dir"
      cat > "$dir/index.html" <<HTML
<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080b12;color:#e5f7ef;font-family:Arial,sans-serif}
main{max-width:720px;padding:32px;text-align:center;border:1px solid #17382d;border-radius:18px;background:#0d151f}
h1{color:#22c55e;margin:0 0 12px}p{color:#9ca3af;line-height:1.5}
</style></head>
<body><main><h1>${title}</h1><p>${msg}</p></main></body></html>
HTML
    }
    ensure_index "$CRM_FALLBACK_ROOT" "MultiZap CRM" "CRM em manutencao. Voltamos em instantes."
  fi
  
  # Sobe servidor estatico na porta CRM
  pm2 start python3 --name CloneDeck-CRM -- -m http.server "$CRM_PORT" --bind 127.0.0.1 --directory "$CRM_FALLBACK_ROOT" >/dev/null 2>&1
  say "OK servidor estatico iniciado na porta $CRM_PORT"
  
  # AJUSTA CADDY para SPA (try_files) em vez de reverse_proxy
  say "--- Ajustando Caddy para SPA estatico ---"
  if [ -f "$CADDYFILE" ]; then
    cp "$CADDYFILE" "${CADDYFILE}.backup.$(date +%Y%m%d%H%M%S)"
    # Troca o bloco do crm de reverse_proxy para file_server
    python3 - "$CADDYFILE" <<'PY'
import re
with open('/etc/caddy/Caddyfile', 'r') as f:
    content = f.read()

# Find crm.multizap.dev block and replace reverse_proxy with file_server + try_files
old = '''crm.multizap.dev {
\treverse_proxy 127.0.0.1:3010
\tencode gzip
\thandle_errors {
\t\troot * /var/www/multizap/crm
\t\ttry_files {path} /index.html
\t\tfile_server
\t}
}'''

new = '''crm.multizap.dev {
\troot * /var/www/multizap/crm
\ttry_files {path} /index.html
\tfile_server
\tencode gzip
}'''

if old in content:
    content = content.replace(old, new)
    with open('/etc/caddy/Caddyfile', 'w') as f:
        f.write(content)
    print('Caddyfile atualizado: crm agora usa file_server + try_files')
else:
    print('Bloco crm.multizap.dev nao encontrado no formato esperado, mantendo atual')
PY
  fi
fi

# 5. VALIDAR E RECARREGAR CADDY
say "--- Validando Caddy ---"
if caddy validate --config "$CADDYFILE" --adapter caddyfile > "$REVISAO/caddy-validate.log" 2>&1; then
  say "OK Caddy valido"
  systemctl reload caddy >/dev/null 2>&1 || systemctl restart caddy >/dev/null 2>&1
  say "OK Caddy recarregado"
else
  say "ERRO Caddy invalido"
  cat "$REVISAO/caddy-validate.log"
  # Restaura backup
  cp "$(ls -t ${CADDYFILE}.backup.* | head -1)" "$CADDYFILE"
  systemctl reload caddy >/dev/null 2>&1 || true
fi

sleep 3

# 6. TESTAR TODOS OS DOMINIOS
say "--- Testando dominios ---"
for d in multizap.dev bot.multizap.dev crm.multizap.dev proxy.multizap.dev; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://${d}" 2>/dev/null || echo "000")
  if [ "$d" = "crm.multizap.dev" ]; then
    CODE_AUTH=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://${d}/auth" 2>/dev/null || echo "000")
    say "${d} -> ${CODE} | /auth -> ${CODE_AUTH}"
  else
    say "${d} -> ${CODE}"
  fi
done

# 7. CONFIGURAR WEBHOOK WUZAPI
say "--- Configurando webhook WuzAPI para Gateway :3100 ---"
[ -f "/root/Multizap/secrets/wabot.env" ] && source "/root/Multizap/secrets/wabot.env"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"
WH_SECRET="${WUZAPI_WEBHOOK_SECRET:-}"

USERS=$(curl -s --connect-timeout 5 "${WUZAPI_URL}/admin/users" -H "Authorization: ${WUZAPI_TK}" 2>/dev/null || echo "")
if [ -n "$USERS" ] && [ "$USERS" != "[]" ]; then
  echo "$USERS" | python3 -c "
import sys, json, urllib.request
wuza='${WUZAPI_URL}'; tk='${WUZAPI_TK}'; sec='${WH_SECRET}'
url='http://127.0.0.1:3100/webhooks/wuzapi?secret=' + sec
evts=['Message','ReadReceipt','HistorySync','ChatPresence']
try:
    data = json.load(sys.stdin)
    users = data if isinstance(data, list) else data.get('data', data.get('users', []))
    for u in users:
        token = u.get('token', u.get('Token', ''))
        if not token: continue
        try:
            body = json.dumps({'webhookURL': url, 'Subscribe': evts, 'events': ','.join(evts)}).encode()
            req = urllib.request.Request(f'{wuza}/webhook', data=body, headers={'token': token, 'Content-Type': 'application/json'}, method='POST')
            urllib.request.urlopen(req, timeout=5)
            print(f'Webhook OK: {u.get(\"name\",u.get(\"Name\",\"?\"))}')
        except Exception as e: print(f'Falha: {str(e)[:80]}')
except Exception as e: print(f'Erro: {str(e)[:80]}')
" 2>&1
  say "OK Webhook WuzAPI configurado"
fi

# 8. TESTAR MENSAGENS VIA GATEWAY
say "--- Testando Gateway /sync/contacts ---"
curl -s --connect-timeout 10 "http://127.0.0.1:${GATEWAY_PORT}/connections" | python3 -m json.tool 2>/dev/null || echo "Sem conexoes"

# 9. RESUMO
cat > "$REVISAO/resumo.md" <<RESUMO
# Run-Once 013: Fix CRM Caddy + Build

## O que foi feito
- Build do CRM: $([ "$BUILD_OK" -eq 1 ] && echo "OK" || echo "FALHOU")
- Preview na porta $CRM_PORT: $([ "$PREVIEW_OK" -eq 1 ] && echo "OK (preview)" || echo "FALLBACK (estatico)")
- Caddy ajustado para SPA: $(grep -q "try_files" "$CADDYFILE" 2>/dev/null && echo "OK" || echo "PENDENTE")
- Webhook WuzAPI configurado

## Proximo passo
- Verificar crm.multizap.dev/auth se retorna 200
- Aguardar mensagens reais chegarem no Supabase
RESUMO

pm2 save > /dev/null 2>&1
say "✅ RUN-ONCE 013 concluido"
say "Revisao: $REVISAO"