#!/bin/bash

# 🔴 SCRIPT DE EMERGÊNCIA — LIGAR PORTA 8081 (sala-controle)
# Execute isso na VPS como root

echo "🔴 INICIANDO RECUPERAÇÃO DA PORTA 8081..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Verificar se serviço 8081 está rodando
echo "📋 Step 1: Verificando serviço na porta 8081..."
lsof -i :8081
SERVICE_FOUND=$?

if [ $SERVICE_FOUND -eq 0 ]; then
    echo "✅ Serviço encontrado. Matando processo..."
    pkill -f "8081" || true
    sleep 2
else
    echo "⚠️  Serviço não encontrado na porta 8081"
fi

# Step 2: Verificar PM2
echo ""
echo "📋 Step 2: Verificando PM2 status..."
pm2 list

# Step 3: Procurar por serviço 8081 no PM2
echo ""
echo "📋 Step 3: Procurando 'sala-controle' ou '8081' no PM2..."
pm2 list | grep -i "sala\|8081\|controle"

# Step 4: Tentar ligar o serviço correto
echo ""
echo "📋 Step 4: Ligando serviço sala-controle..."

# Opção A: Se for um serviço PM2 chamado "sala-controle"
pm2 start "sala-controle" --name "sala-controle" 2>/dev/null || echo "❌ Falha em 'sala-controle'"

# Opção B: Se for Node.js na pasta específica
if [ -f /root/CentralDark/apps/modulos/sala-controle/server.js ]; then
    echo "📋 Encontrado /root/CentralDark/apps/modulos/sala-controle/server.js"
    pm2 start /root/CentralDark/apps/modulos/sala-controle/server.js --name "sala-controle" --port 8081
    sleep 3
fi

# Opção C: Se for na pasta do hub ou instinto-superior
if [ -f /root/CentralDark/apps/instinto-superior/server.js ]; then
    echo "📋 Encontrado /root/CentralDark/apps/instinto-superior/server.js"
    PORT=8081 pm2 start /root/CentralDark/apps/instinto-superior/server.js --name "sala-controle-hub"
    sleep 3
fi

# Step 5: Verificar se porta 8081 agora está listening
echo ""
echo "📋 Step 5: Verificando se porta 8081 está listening..."
sleep 2
lsof -i :8081

PORT_STATUS=$?
if [ $PORT_STATUS -eq 0 ]; then
    echo ""
    echo "✅ PORTA 8081 ESTÁ ONLINE!"
else
    echo ""
    echo "❌ PORTA 8081 AINDA NÃO ESTÁ RESPONDENDO"
    echo ""
    echo "DEBUG — Procurando em /root/CentralDark..."
    find /root/CentralDark -name "*8081*" -o -name "*sala*" -o -name "*controle*" 2>/dev/null | head -20
    echo ""
    echo "Tente manualmente:"
    echo "  cd /root/CentralDark"
    echo "  pm2 start <arquivo-encontrado> --port 8081"
fi

# Step 6: Guardar logs
echo ""
echo "📋 Step 6: Salvando logs..."
pm2 logs sala-controle --lines 20 > /tmp/sala-controle-logs.txt 2>&1 || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SCRIPT FINALIZADO"
echo ""
echo "Comando para monitorar:"
echo "  curl http://100.123.93.25:8081/health"
echo ""
echo "Se ainda não funcionar, verifique:"
echo "  pm2 list"
echo "  pm2 logs"
echo "  lsof -i :8081"
