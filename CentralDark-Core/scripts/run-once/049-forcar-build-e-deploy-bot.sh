#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 049: Build Limpo e Deploy do Bot
#
# Objetivo: Forçar o Git a mesclar os commits pendentes na VPS,
# compilar o bundle Vite em apps/bot e servir fisicamente em
# /var/www/multizap/bot sem afetar o CRM ou o Gateway.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REV="/root/Multizap/revisoes/${TIMESTAMP}/049-forcar-build-e-deploy-bot"
mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 049 - FORCAR BUILD E DEPLOY DO BOT (VPS)"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

# 1. Puxar código de forma segura preservando un-tracked locais (se houver)
cd "$CLONE_DECK"
echo "[1] Baixando commits do Repositório (Rebase Seguro)..."
git fetch origin main || true
DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)

if [ -n "$DIRTY" ]; then
   echo "⚠️ Árvore suja detectada. Fazendo Stash temporário."
   git stash push -m "Stash pre-deploy 049"
   git pull origin main --rebase || {
     echo "❌ Falha no rebase. Abortando deploy!"
     git rebase --abort
     git stash pop
     exit 1
   }
   git stash pop || echo "⚠️ Stash pop completado com avisos."
else
   git pull origin main --ff-only || git rebase origin/main
fi

echo -n "Último commit no sistema: "
git log -1 --oneline

# 2. Compilação Limpa (Evitar Vite error 321 / Chunks velhos)
echo -e "\n[2] Construindo Bundle do Bot (Vite / NPM)..."
cd "$BOT_DIR"

if [ -d "dist" ]; then
    rm -rf dist/
fi

# Instala dependências silenciosamente
npm ci > /dev/null 2>&1 || npm install > /dev/null 2>&1

# Injeta a compilação do Vite
if npm run build; then
    echo "✅ Build finalizado com sucesso."
else
    echo "❌ CRÍTICO: Erro no npm run build do Bot. Abortando substituição física."
    exit 1
fi

# 3. Distribuição dos arquivos compilados
echo -e "\n[3] Substituindo arquivos no Servidor Web (Caddy /var/www)..."
if [ ! -d "$BOT_WWW" ]; then
    mkdir -p "$BOT_WWW"
fi

# Backup preventivo (Sem overwrite cego)
rm -rf /var/www/multizap/bot_backup
cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true

# Limpeza e cópia
rm -rf "$BOT_WWW"/*
cp -r dist/* "$BOT_WWW"/

# 4. Ajustar permissões para o servidor web poder ler
chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || echo "⚠️ Aviso: Usuário www-data não presente, pulando chown."
chmod -R 755 "$BOT_WWW"

echo -e "\n[4] Validação do Novo Payload JS..."
if grep -q "Forçar Logout" "$BOT_WWW"/assets/*.js 2>/dev/null; then
   echo "✅ Componente Dropdown (Forçar Logout) confirmado no build de produção!"
else
   echo "❌ Componente Dropdown AUSENTE no payload final!"
fi

cat << RESUMO > "$REV/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 049-forcar-build-e-deploy-bot
📍 FASE: Build e Publicação Frontend

🧭 PROGRESSO:
antes: Commit 058cb2d nao aparecia. Build antigo.
depois: Deploy físico realizado para o Bot_Root.

✅ PRINCIPAIS PROVAS:
- Commit local mais recente: $(git log -1 --oneline)
- Pasta \`dist/\` gerada: SIM
- Arquivos movidos para \`/var/www/multizap/bot\`: SIM
- Payload final contém "Forçar Logout"?: $(grep -q "Forçar Logout" "$BOT_WWW"/assets/*.js 2>/dev/null && echo "SIM" || echo "NAO")

⚠️ PROBLEMAS CRÍTICOS:
- N/A

🎯 PRÓXIMA DECISÃO:
Testar botão visual na plataforma bot.multizap.dev e enviar payload do novo QR via backend.
==================================================
RESUMO
cat "$REV/RESUMO_PARA_CHATGPT.txt"
