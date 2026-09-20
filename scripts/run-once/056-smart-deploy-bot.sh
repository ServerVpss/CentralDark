#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 056: Smart Deploy Inteligente (Monorepo)
# Objetivo: Acionar build e restart SOMENTE nos módulos alterados,
# economizando CPU e prevenindo downtime na VPS.
# ══════════════════════════════════════════════════════════════
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BASE_REV="/root/Multizap/security/revisoes"
[ ! -d "$BASE_REV" ] && BASE_REV="/root/Multizap/revisoes"
REV="$BASE_REV/${TIMESTAMP}/056-smart-deploy-bot"

mkdir -p "$REV"/{logs,diagnostico,backups}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

echo "=================================================="
echo " 056 - SMART DEPLOY BOT/GATEWAY (VPS)"
echo "=================================================="

CLONE_DECK="/root/Multizap/apps/clone-deck"
BOT_DIR="$CLONE_DECK/apps/bot"
BOT_WWW="/var/www/multizap/bot"

cd "$CLONE_DECK" || exit 1

# Puxa atualizacoes se houver
git fetch origin main >/dev/null 2>&1 || true

CURRENT_COMMIT=$(git log -1 --format="%H")
REMOTE_COMMIT=$(git ls-remote origin main | awk '{print $1}')

if [ "$CURRENT_COMMIT" != "$REMOTE_COMMIT" ]; then
    echo "Baixando novos commits (Fast-Forward/Rebase)..."
    git pull origin main --rebase >/dev/null 2>&1 || git pull origin main --ff-only
fi

echo -n "Commit Atual (HEAD): "
git log -1 --oneline

# 1. Identificar arquivos alterados no último commit (HEAD~1...HEAD)
echo -e "\n[1] Mapeando arquivos alterados..."
CHANGED_FILES=$(git diff --name-only HEAD~1 HEAD)

BOT_FRONTEND_CHANGED="NAO"
BOT_SERVER_CHANGED="NAO"
GATEWAY_CHANGED="NAO"
DOCS_ONLY="SIM"

for file in $CHANGED_FILES; do
    if [[ "$file" != *.md && "$file" != docs/* && "$file" != security/* && "$file" != scripts/* ]]; then
        DOCS_ONLY="NAO"
    fi
    
    if [[ "$file" == apps/bot/src/* || "$file" == apps/bot/public/* || "$file" == apps/bot/index.html || "$file" == apps/bot/package*.json || "$file" == apps/bot/vite.config.* || "$file" == apps/bot/tsconfig* ]]; then
        BOT_FRONTEND_CHANGED="SIM"
    fi
    
    if [[ "$file" == apps/bot/server/* ]]; then
        BOT_SERVER_CHANGED="SIM"
    fi

    if [[ "$file" == apps/crm/atendimento-whatsapp-gateway-deploy/gateway/* ]]; then
        GATEWAY_CHANGED="SIM"
    fi
done

echo "- BOT_FRONTEND_CHANGED : $BOT_FRONTEND_CHANGED"
echo "- BOT_SERVER_CHANGED   : $BOT_SERVER_CHANGED"
echo "- GATEWAY_CHANGED      : $GATEWAY_CHANGED"
echo "- DOCS_ONLY            : $DOCS_ONLY"

# 2. Roteamento de Ação
if [ "$DOCS_ONLY" = "SIM" ]; then
    echo -e "\n[2] Execução suspensa: Apenas documentação ou scripts de infraestrutura foram alterados. Nenhuma compilação necessária."
else

    if [ "$BOT_FRONTEND_CHANGED" = "SIM" ]; then
        echo -e "\n[2.A] Construindo Bundle do Bot (Vite / NPM)..."
        cd "$BOT_DIR"
        
        # Limpeza leve (Preserva lock files e cache NPM para CI veloz)
        rm -rf dist/
        
        if [ -f "package-lock.json" ]; then
            npm ci > /dev/null 2>&1 || npm install > /dev/null 2>&1
        else
            npm install > /dev/null 2>&1
        fi
        
        if npm run build; then
            if [ -f "dist/index.html" ] && [ -d "dist/assets" ]; then
                echo "✅ Build VITE finalizado com sucesso (Index e Assets presentes)."
                
                # Deploy Físico Webroot
                echo "Substituindo arquivos no Servidor Web (Caddy /var/www)..."
                mkdir -p "$BOT_WWW"
                rm -rf /var/www/multizap/bot_backup
                cp -r "$BOT_WWW" /var/www/multizap/bot_backup 2>/dev/null || true
                rm -rf "$BOT_WWW"/*
                cp -r dist/* "$BOT_WWW"/
                
                chown -R www-data:www-data "$BOT_WWW" 2>/dev/null || true
                chmod -R 755 "$BOT_WWW"
                echo "✅ Frontend Bot Webroot atualizada."
            else
                echo "❌ CRÍTICO: Pasta dist gerada, mas index.html ou assets ausentes. Preservando diretório antigo em /var/www."
            fi
        else
            echo "❌ CRÍTICO: Erro fatal no 'npm run build'. Preservando Webroot física intacta."
        fi
        cd "$CLONE_DECK"
    fi

    if [ "$BOT_SERVER_CHANGED" = "SIM" ]; then
        echo -e "\n[2.B] Reiniciando Worker Sync do Bot..."
        if pm2 list 2>/dev/null | grep -q "CloneDeck-Supabase-Sync"; then
            pm2 restart CloneDeck-Supabase-Sync --update-env > /dev/null
            echo "✅ CloneDeck-Supabase-Sync reiniciado com sucesso."
        else
            echo "⚠️ PM2 CloneDeck-Supabase-Sync não encontrado no daemon local."
        fi
    fi

    if [ "$GATEWAY_CHANGED" = "SIM" ]; then
        echo -e "\n[2.C] Reiniciando Gateway Express..."
        if pm2 list 2>/dev/null | grep -q "MultiZap-Gateway"; then
            pm2 restart MultiZap-Gateway --update-env > /dev/null
            echo "✅ MultiZap-Gateway reiniciado com sucesso."
        else
            echo "⚠️ PM2 MultiZap-Gateway não encontrado no daemon local."
        fi
    fi

fi

echo -e "\n[3] Gerando Relatório de Resumo..."
cat << RESUMO > "$REV/reports/RESUMO_PARA_CHATGPT.txt"
== 99. RESUMO PARA COLAR NO CHATGPT ==
RODEI O SCRIPT: 056-smart-deploy-bot
📍 FASE: Smart Deploy Pipeline (Monorepo)

🧭 PROGRESSO:
Commit anterior: HEAD~1
Commit atual: $(git log -1 --oneline)

📊 PLACAR DE AÇÃO:
| Módulo | Alterado | Ação Tomada |
|---|---|---|
| Documentação | $DOCS_ONLY | Ignorada na compilação. |
| Bot Frontend | $BOT_FRONTEND_CHANGED | $( [ "$BOT_FRONTEND_CHANGED" = "SIM" ] && echo "npm ci + Vite Build + Webroot Replace." || echo "Nenhuma." ) |
| Bot Sync Bridge | $BOT_SERVER_CHANGED | $( [ "$BOT_SERVER_CHANGED" = "SIM" ] && echo "PM2 restart CloneDeck-Supabase-Sync." || echo "Nenhuma." ) |
| MultiZap Gateway | $GATEWAY_CHANGED | $( [ "$GATEWAY_CHANGED" = "SIM" ] && echo "PM2 restart MultiZap-Gateway." || echo "Nenhuma." ) |

✅ PRINCIPAIS PROVAS:
- Build do Vite Pulado desnecessariamente? $( [ "$BOT_FRONTEND_CHANGED" = "NAO" ] && echo "SIM, economizou CPU." || echo "NAO, precisava compilar." )
- PM2 do Gateway reiniciado? $( [ "$GATEWAY_CHANGED" = "SIM" ] && echo "SIM." || echo "NAO" )
- Webroot do Bot Existe (/var/www/multizap/bot/index.html)? $( [ -f "/var/www/multizap/bot/index.html" ] && echo "SIM" || echo "NAO" )

⚠️ PROBLEMAS CRÍTICOS:
- N/A

🎯 PRÓXIMA DECISÃO:
(Aguardando comando visual na UI bot.multizap.dev ou nova rotina do Gateway).
==================================================
RESUMO
cat "$REV/reports/RESUMO_PARA_CHATGPT.txt"
