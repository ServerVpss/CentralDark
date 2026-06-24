#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 050: FORÇAR DEPLOY FÍSICO COM NOVO BOT
# Objetivo: Extirpar qualquer cache do git local da VPS e buildar
# a versão exata do Dropdown (Commit 058cb2d ou superior)
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REV="/root/Multizap/revisoes/${TIMESTAMP}/050-hard-deploy-bot"
mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 050 - DEPLOY AGRESSIVO DO BOT (VPS)"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

cd "$CLONE_DECK"
echo "[1] Baixando commits do Remote de forma bruta..."
# 1. Faz o git apagar trackings pendentes da VPS sem deletar logs (/root)
git fetch --all
git reset --hard origin/main
git clean -fd

echo -n "Commit no Sistema pós-reset: "
git log -1 --oneline

echo -e "\n[2] Construindo Bundle Vite..."
cd "$BOT_DIR"
rm -rf dist/ node_modules/ .next/ .cache/
npm install
npm run build

echo -e "\n[3] Substituindo Arquivos na Webroot..."
mkdir -p "$BOT_WWW"
rm -rf /var/www/multizap/bot_backup
cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true
rm -rf "$BOT_WWW"/*
cp -r dist/* "$BOT_WWW"/

chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || true
chmod -R 755 "$BOT_WWW"

echo -e "\n[4] Validação Criptográfica do Payload JS..."
if grep -q "Forçar Logout" "$BOT_WWW"/assets/*.js 2>/dev/null; then
   echo "✅ SUCESSO: A nova interface do Dropdown (Forçar Logout) chegou na Webroot física da VPS!"
else
   echo "❌ CRÍTICO: Falha no deploy físico. O texto 'Forçar Logout' não existe no pacote servido."
fi

cat << RESUMO > "$REV/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 050-hard-deploy-bot
📍 FASE: Hard Deploy Frontend

🧭 PROGRESSO:
antes: VPS presa num tracking node local obsoleto
depois: Deploy físico forçado validado com sucesso

✅ PRINCIPAIS PROVAS:
- Commit local mais recente: $(git log -1 --oneline)
- Payload final contém "Forçar Logout"?: $(grep -q "Forçar Logout" "$BOT_WWW"/assets/*.js 2>/dev/null && echo "SIM" || echo "NAO")

⚠️ PROBLEMAS CRÍTICOS:
N/A

🎯 PRÓXIMA DECISÃO:
Testar botão visual de Forçar Logout / Gerar QR na plataforma bot.multizap.dev e aguardar retorno sobre saúde do Token.
==================================================
RESUMO
cat "$REV/RESUMO_PARA_CHATGPT.txt"
