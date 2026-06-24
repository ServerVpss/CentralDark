#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RENAME PM2: Nomes claros e profissionais
# NÃO mexe em: recargas-server, webhook-recargas (protegidos)
# NÃO usa pm2 restart all
# ══════════════════════════════════════════════════════════════
set -uo pipefail

echo "🔄 Renomeando processos PM2..."
echo ""

# Função: renomear sem perder estado
rename_pm2() {
  OLD="$1"
  NEW="$2"
  
  if ! pm2 list 2>/dev/null | grep -q "$OLD"; then
    echo "  ⏭️  $OLD → não existe"
    return
  fi
  
  if pm2 list 2>/dev/null | grep -q "$NEW"; then
    echo "  ⏭️  $NEW → já existe"
    return
  fi
  
  # Pegar o script e cwd do processo atual
  SCRIPT=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
for p in json.load(sys.stdin):
    if p['name']=='$OLD':
        print(p['pm2_env'].get('pm_exec_path',''))
        break
" 2>/dev/null)

  CWD=$(pm2 jlist 2>/dev/null | python3 -c "
import sys,json
for p in json.load(sys.stdin):
    if p['name']=='$OLD':
        print(p['pm2_env'].get('pm_cwd',''))
        break
" 2>/dev/null)

  if [ -z "$SCRIPT" ]; then
    echo "  ❌ $OLD → script não encontrado"
    return
  fi

  # Parar e deletar o antigo
  pm2 stop "$OLD" > /dev/null 2>&1
  pm2 delete "$OLD" > /dev/null 2>&1
  
  # Iniciar com novo nome
  if [ -n "$CWD" ]; then
    pm2 start "$SCRIPT" --name "$NEW" --cwd "$CWD" > /dev/null 2>&1
  else
    pm2 start "$SCRIPT" --name "$NEW" > /dev/null 2>&1
  fi
  
  echo "  ✅ $OLD → $NEW"
}

# ══════════════════════════════════════
# RENOMEAR (só os nossos, NÃO tocar protegidos)
# ══════════════════════════════════════

# Nossos processos
rename_pm2 "CloneDeck-Receiver" "receiver-mensagens"
rename_pm2 "CloneDeck-Supabase-Sync" "sync-supabase"
rename_pm2 "MultiZap-TelegramBot" "bot-telegram"
rename_pm2 "MultiZap-Gateway" "gateway-whatsapp"
rename_pm2 "MultiZap-GitHub-Webhook" "webhook-crm"
rename_pm2 "wabot-bridge" "bridge-legado"

# NÃO TOCAR (protegidos)
echo ""
echo "  🔒 whatsapp-server → NÃO RENOMEADO (Recargas)"
echo "  🔒 github-webhook → NÃO RENOMEADO (Recargas)"

echo ""
pm2 save > /dev/null 2>&1
echo "💾 PM2 salvo"

echo ""
echo "=== PM2 FINAL ==="
pm2 list
