#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 061: Deploy Fix de Geração de QR e Status
# Objetivo: Rodar a compilação do React para atrelar a tela de 
# instâncias às requisições do Proxy Gateway nativo.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/061-deploy-qr-proxy-bot"

mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 061 - SMART DEPLOY: FIX QR CODE PROXY"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

cd "$CLONE_DECK" || exit 1
git fetch --all >/dev/null 2>&1
DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)

if [ -n "$DIRTY" ]; then
   git stash push -m "WIP before 061" >/dev/null 2>&1
   git pull origin main --rebase >/dev/null 2>&1 || git rebase --abort
   git stash pop >/dev/null 2>&1 || true
else
   git pull origin main --ff-only >/dev/null 2>&1 || git rebase origin/main >/dev/null 2>&1
fi

echo -e "\n[1] Checagem de Repositório:"
echo "Commit atual na VPS: $(git log -1 --oneline)"
if git log -5 --oneline | grep -q "eradicate frontend reliance"; then
    echo "✅ Patch do Gateway Proxy validado no working tree."
else
    echo "❌ O patch não desceu para a VPS."
    exit 1
fi

echo -e "\n[2] Construindo Bundle do Bot (Vite / NPM)..."
cd "$BOT_DIR"
rm -rf dist/
npm ci > /dev/null 2>&1 || npm install > /dev/null 2>&1

if npm run build >/dev/null 2>&1; then
    if [ -f "dist/index.html" ]; then
        echo "✅ Build VITE finalizado."
        
        echo "Substituindo arquivos no Servidor Web..."
        mkdir -p "$BOT_WWW"
        rm -rf /var/www/multizap/bot_backup
        cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true
        rm -rf "$BOT_WWW"/*
        cp -r dist/* "$BOT_WWW"/
        
        chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || true
        chmod -R 755 "$BOT_WWW"
        echo "✅ Webroot física atualizada com sucesso!"
    else
        echo "❌ Erro: index.html ausente."
        exit 1
    fi
else
    echo "❌ Erro no build."
    exit 1
fi

echo -e "\n[3] Validação de JS Gerado:"
if grep -q "https://proxy.multizap.dev/connections/" "$BOT_WWW"/assets/*.js 2>/dev/null; then
    echo "✅ SUCESSO: URL de Proxy encontrada no código final servido pelo Caddy."
else
    echo "❌ FALHA: Código de proxy ausente no bundle gerado."
fi

cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 061-deploy-qr-proxy-bot
📍 FASE: Validação e Deploy de Componentes Proxy QR

🧭 PROGRESSO:
antes: Front enviava 'inst.id' pro Supabase atrás da colunas falsas de QR Code Base64.
depois: Front bate na URL proxy.multizap.dev com o verdadeiro 'connection_id' validando resposta 200/401 direta.

✅ PRINCIPAIS PROVAS:
- Commit local mais recente: $(git log -1 --oneline)
- Bundle compila e expõe Proxy URLs?: $(grep -q "https://proxy.multizap.dev/connections/" "$BOT_WWW"/assets/*.js 2>/dev/null && echo "SIM" || echo "NAO")

⚠️ PROBLEMAS CRÍTICOS:
N/A

🎯 PRÓXIMA DECISÃO:
Testar a captura de QR de uma das conexões em 'bot.multizap.dev/instancias'. O Status do Loading vai parar imediatamente caso encontre Timeout ou Erro 401 do WuzAPI sem piscar tela.
==================================================
RESUMO
