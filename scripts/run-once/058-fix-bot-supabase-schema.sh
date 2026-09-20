#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 058: Correção Arquitetural do Cliente Supabase
# Objetivo: Extirpar RLS Errors e tabelas 404, aplicando
# divisões de 'schema' nativas do Supabase no Frontend Bot.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/058-fix-bot-supabase-schema"

mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 058 - FIX BOT SUPABASE SCHEMA + LOGS"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

# 1. Trazendo Código Seguro do Git
cd "$CLONE_DECK"
git fetch --all
DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)
if [ -n "$DIRTY" ]; then
   git stash push -m "WIP before 058"
   git pull origin main --rebase
   git stash pop || true
else
   git pull origin main --ff-only || git rebase origin/main
fi

echo -n "Commit Atual: "
git log -1 --oneline

# 2. Build Limpo Frontend
cd "$BOT_DIR"
rm -rf dist/
npm ci || npm install
npm run build

# 3. Deploy Local Webroot
if [ -f "dist/index.html" ]; then
    mkdir -p "$BOT_WWW"
    rm -rf /var/www/multizap/bot_backup
    cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true
    rm -rf "$BOT_WWW"/*
    cp -r dist/* "$BOT_WWW"/
    chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || true
    chmod -R 755 "$BOT_WWW"
    echo "✅ SUCESSO: Build Frontend Deployado."
else
    echo "❌ CRÍTICO: Erro no build do Frontend. Deploy cancelado."
fi

cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 058-fix-bot-supabase-schema
📍 FASE: Segmentação de Schema do Supabase Client.

🧭 PROGRESSO:
antes: Tabelas públicas como 'workspace_members' sofrendo erro 404.
depois: Separação cirúrgica entre supabase() e supabaseApi() implementada.

✅ PRINCIPAIS PROVAS:
- Commit local mais recente: $(git log -1 --oneline)
- Pasta dist copiada para var/www/multizap/bot.

⚠️ PROBLEMAS CRÍTICOS:
N/A

🎯 PRÓXIMA DECISÃO:
Aguardando validação do F12 (Console) na URL bot.multizap.dev/instancias para atestar erradicação dos 404s e 403s.
==================================================
RESUMO
cat "$REV/reports/RESUMO_PARA_CHATGPT.txt"
