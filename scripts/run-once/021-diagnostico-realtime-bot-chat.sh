#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 021: Diagnóstico Realtime Bot/Chat
#
# Objetivo: Descobrir onde exatamente a mensagem WhatsApp está
#           parando no fluxo WuzAPI → Gateway → Supabase → Chat
#
# Regras:
#   - NÃO mexer no CRM SSR
#   - NÃO mexer em Caddy
#   - NÃO parar WuzAPI
#   - NÃO resetar sessão WhatsApp
#   - NÃO rodar run-once-executor
#   - NÃO rodar scripts antigos
#   - NÃO usar pm2 restart all
#   - NÃO expor secrets
#   - NÃO alterar banco
#   - NÃO publicar build
#   - APENAS DIAGNÓSTICO
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/realtime-bot-chat-diagnostico"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$REV"/{diagnostico,logs,tmp}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "══════════════════════════════════════════════════"
echo " DIAGNÓSTICO REALTIME BOT/CHAT"
echo " Data: $TIMESTAMP"
echo " Revisão: $REV"
echo " ⚠️  APENAS DIAGNÓSTICO — NENHUMA CORREÇÃO"
echo "══════════════════════════════════════════════════"
echo ""

ERROS=0

# ══════════════════════════════════════════════════════════════
# 1. ESTADO GERAL
# ══════════════════════════════════════════════════════════════
echo "══════════ [1/6] ESTADO GERAL ══════════"
echo ""

cd "$CLONE_DECK" 2>/dev/null || { echo "❌ Repo não encontrado"; exit 1; }

echo "Commit:"
git log --oneline -8 > "$REV/diagnostico/git-log.txt"
cat "$REV/diagnostico/git-log.txt"

echo ""
echo "Git status:"
git status --short > "$REV/diagnostico/git-status.txt"
cat "$REV/diagnostico/git-status.txt"

echo ""
echo "PM2:"
pm2 list --no-color > "$REV/diagnostico/pm2-list.txt"
cat "$REV/diagnostico/pm2-list.txt"

echo ""
echo "Portas:"
ss -ltnp 2>&1 | grep -E ':80|:443|:3010|:3100|:8081|:9000|:9003' > "$REV/diagnostico/portas.txt"
cat "$REV/diagnostico/portas.txt"

echo ""
echo "Gateway health:"
curl -s --connect-timeout 5 http://127.0.0.1:3100/health 2>&1 | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for k in ['ok','status','port','env']:
        print(f'  {k}: {d.get(k)}')
except:
    print('  OFFLINE')
" 2>/dev/null | tee -a "$REV/diagnostico/gateway-health.txt"

echo ""
echo "Webhook health:"
curl -s --connect-timeout 5 http://127.0.0.1:9003/health 2>&1 | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    for k in ['ok','service','branch','secret_loaded']:
        print(f'  {k}: {d.get(k)}')
except:
    print('  OFFLINE')
" 2>/dev/null | tee -a "$REV/diagnostico/webhook-health.txt"

echo ""

# ══════════════════════════════════════════════════════════════
# 2. WUZAPI
# ══════════════════════════════════════════════════════════════
echo "══════════ [2/6] WUZAPI ══════════"
echo ""

echo "Container Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1 | grep -i wuzapi > "$REV/diagnostico/wuzapi-container.txt" || true
cat "$REV/diagnostico/wuzapi-container.txt"
echo ""

# Carrega env para acesso ao WuzAPI (sem imprimir valores)
WUZAPI_ENV=""
for f in /root/Multizap/secrets/wabot.env /root/Multizap/gateway/.env "$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/.env"; do
  if [ -f "$f" ]; then
    set -a
    source "$f" 2>/dev/null
    set +a
    [ -n "${WUZAPI_ADMIN_TOKEN:-}" ] && WUZAPI_ENV="$f" && break
  fi
done

WUZAPI_BASE="${WUZAPI_URL:-${WUZAPI_BASE_URL:-http://127.0.0.1:8081}}"
WUZAPI_TK="${WUZAPI_ADMIN_TOKEN:-admin}"

echo "WuzAPI URL: $WUZAPI_BASE"
echo "Token: $( [ -n "$WUZAPI_TK" ] && echo "EXISTE (${#WUZAPI_TK} caracteres)" || echo "AUSENTE")"
echo ""

# Status da sessão
echo "Status da sessão WuzAPI:"
SESSION_STATUS=$(curl -s --connect-timeout 5 "$WUZAPI_BASE/status" -H "Authorization: $WUZAPI_TK" 2>/dev/null || echo '{"error":"offline"}')
echo "$SESSION_STATUS" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if isinstance(d, dict):
        for k,v in d.items():
            if k.lower() in ('token','secret','password','key'): continue
            print(f'  {k}: {v}')
    else:
        print(f'  Resposta: {str(d)[:200]}')
except:
    print(f'  (resposta nao json: {str(d)[:200]})')
" 2>/dev/null | tee "$REV/diagnostico/wuzapi-status.txt"

echo ""

# Listar usuários/instâncias
echo "Usuários/instâncias no WuzAPI:"
USERS=$(curl -s --connect-timeout 5 "$WUZAPI_BASE/admin/users" -H "Authorization: $WUZAPI_TK" 2>/dev/null || echo "[]")
echo "$USERS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    users = data if isinstance(data, list) else data.get('data', data.get('users', []))
    for u in users:
        name = u.get('name','')
        status = u.get('status','?')
        phone = str(u.get('phone','') or u.get('jid','') or '')
        # Mascara telefone
        if len(phone) > 4:
            phone = phone[:2] + '***' + phone[-3:]
        print(f'  User: {name} | Status: {status} | Phone: {phone}')
    print(f'  Total: {len(users)} usuarios')
except:
    print(f'  (erro ao parsear: {str(users)[:200]})')
" 2>/dev/null | tee "$REV/diagnostico/wuzapi-users.txt"

echo ""

# Webhook configurado no WuzAPI
echo "Webhook configurado no WuzAPI:"
for u in $(echo "$USERS" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    users = data if isinstance(data, list) else data.get('data', data.get('users', []))
    for u in users:
        token = u.get('token', '') or u.get('Token', '')
        if token: print(token)
except: pass
" 2>/dev/null); do
  
  WH_CHECK=$(curl -s --connect-timeout 5 "$WUZAPI_BASE/webhook" -H "token: $u" 2>/dev/null || echo "{}")
  echo "$WH_CHECK" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    url = d.get('webhookURL','') or d.get('webhook_url','') or d.get('url','')
    events = d.get('events','') or d.get('Subscribe','')
    if url:
        # Mostra só o host, não URL completa com secret
        host = url.split('?')[0]
        print(f'  Webhook: {host}')
        print(f'  Events: {events}')
    else:
        print('  Webhook: nao configurado')
except:
    pass
" 2>/dev/null
done | tee "$REV/diagnostico/wuzapi-webhook.txt"

echo ""

# Últimos eventos no Gateway (message.received)
echo "Últimos eventos message.received no Gateway:"
pm2 logs MultiZap-Gateway --lines 300 --nostream 2>&1 | grep -i "message.received\|webhook_wuzapi_in\|message_fields" | tail -20 | tee "$REV/diagnostico/gateway-eventos.txt"
echo ""

# ══════════════════════════════════════════════════════════════
# 3. GATEWAY
# ══════════════════════════════════════════════════════════════
echo "══════════ [3/6] GATEWAY ══════════"
echo ""

# Env vars do Gateway (só nomes)
echo "Gateway .env (nomes):"
for gw_dir in /root/Multizap/gateway /root/Multizap/apps/clone-deck/apps/crm/atendimento-whatsapp-gateway-deploy/gateway; do
  if [ -f "$gw_dir/.env" ]; then
    echo "--- $gw_dir/.env ---"
    grep -v '^#' "$gw_dir/.env" 2>/dev/null | grep -v '^\s*$' | cut -d= -f1 | sort -u | while read var; do
      [ -n "$var" ] && echo "  $var=EXISTE"
    done
    break
  fi
done | tee "$REV/diagnostico/gateway-env.txt"

echo ""
echo "Gateway logs (últimos eventos, erros, forward):"
pm2 logs MultiZap-Gateway --lines 500 --nostream 2>&1 | \
  grep -i "message\.received\|webhook_wuzapi\|forward\|supabase_save\|save_message\|upsert_contact\|error\|fail\|warn\|405\|500\|401\|403" | \
  tail -40 | tee "$REV/diagnostico/gateway-logs-filtrados.txt"

echo ""

# Logs de forward
echo "Gateway forward logs (detalhado):"
pm2 logs MultiZap-Gateway --lines 300 --nostream 2>&1 | \
  grep -i "forward\|atendimento\|atendimento_webhook_url_vazia\|forward_failed\|forwarded_to" | \
  tail -20 | tee "$REV/diagnostico/gateway-forward.txt"

echo ""

# ══════════════════════════════════════════════════════════════
# 4. SUPABASE
# ══════════════════════════════════════════════════════════════
echo "══════════ [4/6] SUPABASE ══════════"
echo ""

# Carrega Supabase env (sem imprimir valores)
SUPABASE_URL=""
SUPABASE_KEY=""

for f in /root/Multizap/secrets/wabot.env /root/Multizap/gateway/.env "$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway/.env"; do
  if [ -f "$f" ]; then
    while IFS='=' read -r var val; do
      case "$var" in
        SUPABASE_URL) SUPABASE_URL="$val" ;;
        SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY) SUPABASE_KEY="$val" ;;
      esac
    done < <(grep -E "^(SUPABASE_URL|SUPABASE_SERVICE_KEY|SUPABASE_SERVICE_ROLE_KEY)=" "$f" 2>/dev/null)
  fi
done

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
  echo "Supabase: ✅ Conectado"
  echo "URL: $(echo "$SUPABASE_URL" | sed 's|https://||' | cut -d. -f1).supabase.co"
  echo "Key: $( [ -n "$SUPABASE_KEY" ] && echo "EXISTE (${#SUPABASE_KEY} caracteres)" || echo "AUSENTE")"
  echo ""

  # Listar tabelas candidatas
  echo "Tabelas candidatas para mensagens/eventos:"
  for table in messages contacts conversations whatsapp_events whatsapp_messages whatsapp_contacts whatsapp_chats crm_messages crm_conversations bot_events notifications; do
    COUNT=$(curl -s --connect-timeout 5 \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Accept-Profile: public" \
      "${SUPABASE_URL}/rest/v1/${table}?select=count" 2>/dev/null | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    if isinstance(d, list) and len(d) > 0:
        print(d[0].get('count', '?'))
    else:
        print('?')
except:
    print('erro')
" 2>/dev/null)
    
    [ -n "$COUNT" ] && [ "$COUNT" != "erro" ] && echo "  $table: $COUNT registros"
  done | tee "$REV/diagnostico/supabase-tabelas.txt"

  echo ""

  # Últimos registros em messages
  echo "Últimos 5 registros em messages:"
  curl -s --connect-timeout 5 \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept-Profile: public" \
    "${SUPABASE_URL}/rest/v1/messages?select=id,workspace_id,text,direction,status,event,created_at&order=created_at.desc&limit=5" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        if len(data) == 0:
            print('  Nenhuma mensagem encontrada')
        else:
            for m in data:
                print(f'  [{str(m.get(\"created_at\",\"\"))[:19]}] Dir:{m.get(\"direction\",\"?\")} Status:{m.get(\"status\",\"?\")} Event:{m.get(\"event\",\"?\")} Text:{str(m.get(\"text\",\"\") or \"\")[:60]}')
    else:
        print(f'  Erro: {data}')
except:
    print('  Erro ao parsear resposta')
" 2>/dev/null | tee "$REV/diagnostico/supabase-ultimas-messages.txt"

  echo ""

  # Últimos contatos
  echo "Últimos 5 contatos:"
  curl -s --connect-timeout 5 \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept-Profile: public" \
    "${SUPABASE_URL}/rest/v1/contacts?select=id,name,phone,created_at&order=created_at.desc&limit=5" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        if len(data) == 0:
            print('  Nenhum contato encontrado')
        else:
            for c in data:
                phone = str(c.get('phone','') or '')
                if len(phone) > 4:
                    phone = phone[:2] + '***' + phone[-3:]
                print(f'  [{str(c.get(\"created_at\",\"\"))[:19]}] Nome:{c.get(\"name\",\"?\")} Phone:{phone}')
    else:
        print(f'  Erro: {data}')
except:
    print('  Erro ao parsear resposta')
" 2>/dev/null | tee "$REV/diagnostico/supabase-ultimos-contatos.txt"

  echo ""

  # Verificar Realtime publications
  echo "Realtime publications:"
  curl -s --connect-timeout 5 \
    -X POST \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{"query": "SELECT pubname, puballtables FROM pg_publication WHERE pubname LIKE '"'"'%supabase%'"'"' OR pubname LIKE '"'"'%realtime%'"'"'"}' \
    "${SUPABASE_URL}/rest/v1/rpc/" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'  Publications: {data}')
except:
    print('  (não foi possível consultar)')
" 2>/dev/null | tee "$REV/diagnostico/supabase-realtime-pub.txt"

  echo ""

  # Verificar system_logs para eventos recentes
  echo "System logs recentes:"
  curl -s --connect-timeout 5 \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Accept-Profile: public" \
    "${SUPABASE_URL}/rest/v1/system_logs?select=created_at,action,level&order=created_at.desc&limit=10" 2>/dev/null | \
    python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        for l in data:
            icon = '✅' if l.get('level')=='info' else '❌'
            print(f'  {icon} [{str(l.get(\"created_at\",\"\"))[:19]}] {l.get(\"action\",\"?\")}')
    else:
        print(f'  Erro: {data}')
except:
    print('  Erro ao parsear')
" 2>/dev/null | tee "$REV/diagnostico/supabase-system-logs.txt"

else
  echo "❌ Supabase não configurado neste ambiente"
fi

# ══════════════════════════════════════════════════════════════
# 5. BOT/FRONTEND
# ══════════════════════════════════════════════════════════════
echo ""
echo "══════════ [5/6] BOT/FRONTEND ══════════"
echo ""

cd "$CLONE_DECK/apps/bot" 2>/dev/null || { echo "❌ apps/bot não encontrado"; cd "$CLONE_DECK" || exit 1; }

# Encontrar tela de chat
echo "Arquivos de chat:"
find src -type f \( -name "*chat*" -o -name "*Chat*" -o -name "*mensagem*" -o -name "*message*" -o -name "*conversa*" \) | head -10 | tee "$REV/diagnostico/bot-chat-files.txt"

echo ""

# Procurar subscriptions Realtime
echo "Subscriptions Realtime (supabase.channel, .on('INSERT', etc):"
grep -rn "\.channel\|\\.on('\|realtime\|subscribe\|\.subscribe(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -30 | tee "$REV/diagnostico/bot-realtime.txt"

echo ""

# Procurar onde mensagens são carregadas
echo "Carregamento de mensagens (select * from messages):"
grep -rn "from('messages\|from('contacts\|from('conversations\|supabase.from\|\.select(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -i "message\|chat\|conversa" | head -20 | tee "$REV/diagnostico/bot-queries.txt"

echo ""

# Último build publicado
echo "Bot publicado em /var/www/multizap/bot:"
if [ -d /var/www/multizap/bot ]; then
  BOT_FILES=$(find /var/www/multizap/bot -type f 2>/dev/null | wc -l)
  BOT_INDEX=$(find /var/www/multizap/bot -name "index.html" -exec grep -c "chat\|Chat\|mensagem\|conversa" {} \; 2>/dev/null || echo "0")
  echo "  Arquivos: $BOT_FILES"
  echo "  index.html contém referências a chat: $BOT_INDEX"
else
  echo "  ❌ Diretório não existe"
fi

echo ""

# ══════════════════════════════════════════════════════════════
# 6. TESTE PRÁTICO + RELATÓRIO
# ══════════════════════════════════════════════════════════════
echo "══════════ [6/6] RELATÓRIO ══════════"
echo ""

# ── estado-geral.md ─────────────────────────────
cat > "$REV/diagnostico/estado-geral.md" << EOF
# Estado Geral

- Commit: $(git log --oneline -1 2>/dev/null || echo '?')
- PM2: $(pm2 list --no-color 2>/dev/null | grep -c "online" || echo "0") processos online
- Gateway: $(curl -s --connect-timeout 5 http://127.0.0.1:3100/health 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print('OK' if d.get('ok') else 'ERR')" 2>/dev/null || echo "OFF")
- Webhook: $(curl -s --connect-timeout 5 http://127.0.0.1:9003/health 2>/dev/null | python3 -c "import sys,json;d=json.load(sys.stdin);print('OK' if d.get('ok') else 'ERR')" 2>/dev/null || echo "OFF")
- WuzAPI: $(docker ps 2>/dev/null | grep -c wuzapi || echo "OFF") container(s)
EOF

# ── wuzapi.md ───────────────────────────────────
cat > "$REV/diagnostico/wuzapi.md" << EOF
# WuzAPI

$(cat "$REV/diagnostico/wuzapi-container.txt" 2>/dev/null || echo "Container: verificar")
$(cat "$REV/diagnostico/wuzapi-status.txt" 2>/dev/null || echo "Status: verificar")
$(cat "$REV/diagnostico/wuzapi-users.txt" 2>/dev/null || echo "Users: verificar")
$(cat "$REV/diagnostico/wuzapi-webhook.txt" 2>/dev/null || echo "Webhook: verificar")
EOF

# ── gateway.md ──────────────────────────────────
cat > "$REV/diagnostico/gateway.md" << EOF
# Gateway

$(cat "$REV/diagnostico/gateway-env.txt" 2>/dev/null || echo "Env: verificar")
$(cat "$REV/diagnostico/gateway-health.txt" 2>/dev/null || echo "Health: verificar")

## Eventos recebidos
$(cat "$REV/diagnostico/gateway-eventos.txt" 2>/dev/null || echo "(nenhum evento recebido)")

## Forward
$(cat "$REV/diagnostico/gateway-forward.txt" 2>/dev/null || echo "(sem logs de forward)")

## Erros
$(cat "$REV/diagnostico/gateway-logs-filtrados.txt" 2>/dev/null || echo "(sem erros)")
EOF

# ── supabase-schema.md ──────────────────────────
cat > "$REV/diagnostico/supabase-schema.md" << EOF
# Supabase Schema

$(cat "$REV/diagnostico/supabase-tabelas.txt" 2>/dev/null || echo "Tabelas: verificar")
$(cat "$REV/diagnostico/supabase-realtime-pub.txt" 2>/dev/null || echo "Realtime: verificar")
EOF

# ── supabase-ultimos-registros.md ──────────────
cat > "$REV/diagnostico/supabase-ultimos-registros.md" << EOF
# Últimos Registros no Supabase

## Mensagens
$(cat "$REV/diagnostico/supabase-ultimas-messages.txt" 2>/dev/null || echo "(sem dados)")

## Contatos
$(cat "$REV/diagnostico/supabase-ultimos-contatos.txt" 2>/dev/null || echo "(sem dados)")

## System Logs
$(cat "$REV/diagnostico/supabase-system-logs.txt" 2>/dev/null || echo "(sem dados)")
EOF

# ── bot-frontend.md ─────────────────────────────
cat > "$REV/diagnostico/bot-frontend.md" << EOF
# Bot/Frontend

## Arquivos de chat
$(cat "$REV/diagnostico/bot-chat-files.txt" 2>/dev/null || echo "(não encontrados)")

## Subscriptions Realtime
$(cat "$REV/diagnostico/bot-realtime.txt" 2>/dev/null || echo "(não encontradas)")

## Queries de mensagens
$(cat "$REV/diagnostico/bot-queries.txt" 2>/dev/null || echo "(não encontradas)")
EOF

# ── realtime.md ─────────────────────────────────
REALTIME_INFO=$(grep -rn "channel\|realtime\|subscribe" "$CLONE_DECK/apps/bot/src" --include="*.ts" --include="*.tsx" 2>/dev/null | head -20)

cat > "$REV/diagnostico/realtime.md" << EOF
# Supabase Realtime

## No frontend (Bot)
$( [ -n "$REALTIME_INFO" ] && echo "$REALTIME_INFO" || echo "Nenhuma subscription Realtime encontrada no frontend")

## Publicações no banco
$(cat "$REV/diagnostico/supabase-realtime-pub.txt" 2>/dev/null || echo "Não verificado")
EOF

# ── teste-ponta-a-ponta.md ──────────────────────
cat > "$REV/diagnostico/teste-ponta-a-ponta.md" << EOF
# Teste Ponta a Ponta

## Instruções para teste manual

1. Envie uma mensagem real para o número WhatsApp conectado
2. Depois de enviar, rode:
   \`\`\`bash
   cd $CLONE_DECK
   bash scripts/run-once/021-diagnostico-realtime-bot-chat.sh
   \`\`\`
3. O script vai capturar os logs pós-mensagem

## O que observar

| Etapa | Como verificar |
|-------|---------------|
| WuzAPI recebeu? | \`pm2 logs MultiZap-Gateway --lines 100 --nostream | grep "message.received"\` |
| Gateway salvou? | \`curl -s -H "apikey: \$KEY" .../rest/v1/messages?order=created_at.desc&limit=5\` |
| Realtime disparou? | Logs do navegador (console) |
| Chat atualizou? | Inspecionar tela visualmente |
EOF

# ── causa-provavel.md ───────────────────────────
# Analisar onde a mensagem está parando
MSG_COUNT=$(cat "$REV/diagnostico/supabase-ultimas-messages.txt" 2>/dev/null | grep -c "Dir:" || echo "0")
GATEWAY_EVENTS=$(cat "$REV/diagnostico/gateway-eventos.txt" 2>/dev/null | wc -l || echo "0")

cat > "$REV/diagnostico/causa-provavel.md" << EOF
# Causa Provável

## Status do fluxo

| Etapa | Status |
|-------|--------|
| WuzAPI online | $(docker ps 2>/dev/null | grep -q wuzapi && echo "✅" || echo "❌") |
| Gateway online | $(curl -s --connect-timeout 5 http://127.0.0.1:3100/health >/dev/null 2>&1 && echo "✅" || echo "❌") |
| Eventos no Gateway | $( [ "$GATEWAY_EVENTS" -gt 0 ] && echo "✅ ($GATEWAY_EVENTS)" || echo "❌ (0)") |
| Mensagens no Supabase | $( [ "$MSG_COUNT" -gt 0 ] && echo "✅ ($MSG_COUNT)" || echo "❌ (0)") |
| Realtime subscriptions | $( [ -n "$REALTIME_INFO" ] && echo "✅" || echo "❌") |
| Chat atualizando | $(echo "⚠️ VERIFICAR MANUALMENTE") |

## Observação
Este diagnóstico é um retrato estático. Para confirmar o fluxo completo,
envie uma mensagem real para o WhatsApp conectado e rode este script novamente.
EOF

# ── proxima-correcao-segura.md ─────────────────
cat > "$REV/diagnostico/proxima-correcao-segura.md" << EOF
# Próxima Correção Segura

Aguardar resultado do diagnóstico completo antes de definir correção.

Possíveis cenários:

1. Mensagem não chega no Gateway → verificar webhook do WuzAPI
2. Mensagem chega no Gateway mas não salva no Supabase → verificar env SUPABASE_KEY e schema
3. Mensagem salva no Supabase mas não chega no frontend → verificar Realtime subscriptions
4. Mensagem chega no frontend mas chat não atualiza → verificar filtros (workspace_id, chat_id)
EOF

# ── resumo.md ───────────────────────────────────
cat > "$REV/resumo.md" << RESUMO
# Diagnóstico Realtime Bot/Chat

**Data:** $TIMESTAMP
**Revisão:** $REV
**Tipo:** APENAS DIAGNÓSTICO — nenhuma correção foi aplicada

## Resumo do Fluxo

| Etapa | Status | Detalhe |
|-------|--------|---------|
| WuzAPI | $(docker ps 2>/dev/null | grep -q wuzapi && echo "✅" || echo "❌") | Container online |
| Sessão WhatsApp | $(cat "$REV/diagnostico/wuzapi-status.txt" 2>/dev/null | grep -qi "connected\|CONNECTED" && echo "✅" || echo "⚠️ Verificar") | - |
| Webhook WuzAPI | $(cat "$REV/diagnostico/wuzapi-webhook.txt" 2>/dev/null | grep -q "Webhook" && echo "✅" || echo "❌") | - |
| Gateway | $(curl -s --connect-timeout 5 http://127.0.0.1:3100/health >/dev/null 2>&1 && echo "✅" || echo "❌") | :3100 |
| Eventos recebidos | $( [ "$GATEWAY_EVENTS" -gt 0 ] && echo "✅ $GATEWAY_EVENTS" || echo "❌ 0") | Últimos eventos |
| Mensagens no Supabase | $( [ "$MSG_COUNT" -gt 0 ] && echo "✅ $MSG_COUNT" || echo "❌ 0") | Tabela messages |
| Contatos no Supabase | $(cat "$REV/diagnostico/supabase-ultimos-contatos.txt" 2>/dev/null | grep -c "Phone:" || echo "0") | Tabela contacts |
| Realtime frontend | $( [ -n "$REALTIME_INFO" ] && echo "✅" || echo "❌ NÃO ENCONTRADO") | subscriptions |
| Chat atualiza | ⏳ Teste manual necessário | - |

## Teste Manual

Para confirmar o fluxo completo:
1. Envie uma mensagem real para o número WhatsApp conectado
2. Rode este script novamente para capturar os novos registros
3. Verifique em qual etapa a mensagem parou

## Arquivos gerados

- estado-geral.md
- wuzapi.md
- gateway.md
- supabase-schema.md
- supabase-ultimos-registros.md
- bot-frontend.md
- realtime.md
- teste-ponta-a-ponta.md
- causa-provavel.md
- proxima-correcao-segura.md
RESUMO

echo ""
echo "══════════════════════════════════════════════════"
echo " ✅ DIAGNÓSTICO CONCLUÍDO"
echo " 📁 Revisão: $REV"
echo " ⚠️  NENHUMA CORREÇÃO FOI APLICADA"
echo ""
echo " Para teste prático:"
echo "   1. Envie mensagem para o WhatsApp conectado"
echo "   2. Rode este script novamente"
echo "══════════════════════════════════════════════════"