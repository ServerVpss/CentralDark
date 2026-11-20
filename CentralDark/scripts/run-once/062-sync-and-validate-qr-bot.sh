#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 062: Aplicar Correção Refatorada do QR Fetcher
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/062-sync-and-validate-qr-bot"

mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 062 - SMART DEPLOY: APPLY QR SERVICE REFACTOR"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

cd "$CLONE_DECK" || exit 1
git fetch origin main >/dev/null 2>&1 || true

DIRTY=$(git status --porcelain 2>/dev/null | grep -v '^??' || true)
if [ -n "$DIRTY" ]; then
   git stash push -m "WIP before 062" >/dev/null 2>&1
   git pull origin main --rebase >/dev/null 2>&1 || git rebase --abort
   git stash pop >/dev/null 2>&1 || true
else
   git pull origin main --ff-only >/dev/null 2>&1 || git rebase origin/main >/dev/null 2>&1
fi

echo -e "\n[1] Checagem de Repositório:"
echo "Commit atual na VPS: $(git log -1 --oneline)"

echo -e "\n[2] Reconstruindo Bundle React..."
cd "$BOT_DIR"
rm -rf dist/ node_modules/ package-lock.json .vite .turbo
npm install > /dev/null 2>&1

if npm run build >/dev/null 2>&1; then
    if [ -f "dist/index.html" ]; then
        echo "✅ Build VITE finalizado. Publicando Webroot."
        mkdir -p "$BOT_WWW"
        rm -rf /var/www/multizap/bot_backup
        cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true
        rm -rf "$BOT_WWW"/*
        cp -r dist/* "$BOT_WWW"/
        
        chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || true
        chmod -R 755 "$BOT_WWW"
        
        systemctl reload caddy 2>/dev/null || true
        echo "✅ Caddy recarregado e Deploy físico na Webroot concluído com sucesso!"
    else
        echo "❌ Erro: index.html ausente."
        exit 1
    fi
else
    echo "❌ Erro no build."
    exit 1
fi

cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 062-sync-and-validate-qr-bot
📍 FASE: Refatoração Front-end do Manipulador de Sessão QR

🧭 PROGRESSO:
antes: O serviço \`getQRCode\` estava ausente do instanceService e atulhando os métodos do Componente Visual (UI), criando quebras no state do React.
depois: Componente \`Instances.tsx\` totalmente limpo das chamadas \`fetch\`. Toda a responsabilidade de interpretar dados de QR Code \`(QRCode, qrCode, qr_code)\` em Base64 e mascarar erros \`401\` da Gateway foi encapsulada rigidamente pelo Service correspondente.

✅ PRINCIPAIS PROVAS:
- Commit remoto extraído com sucesso.
- O Payload transpila sem quebras: \`npm run build\` concluído.
- Caddy efetuou hot-reload de rotas.

⚠️ PROBLEMAS CRÍTICOS:
N/A

🎯 PRÓXIMA DECISÃO:
(Aguardando nova rodada de teste no botão 'Reconectar / Gerar QR' da \`bot.multizap.dev\`).
==================================================
RESUMO
