#!/bin/bash
set -e

echo "🔴 RECUPERAÇÃO PORTA 8081 — VPS REMOTA"
echo "=================================================="

# Detectar onde está o serviço
echo "📍 Procurando serviço sala-controle..."

# Opção 1: /root/CentralDark
if [ -d /root/CentralDark ]; then
  echo "✅ Encontrado /root/CentralDark"
  cd /root/CentralDark
  
  # Verificar se PM2 está rodando
  if command -v pm2 &> /dev/null; then
    echo "✅ PM2 encontrado"
    
    # Listar processos
    echo ""
    echo "📋 Processos PM2 atuais:"
    pm2 list || true
    
    # Procurar por 8081
    echo ""
    echo "🔍 Procurando processo com 8081..."
    pm2 list | grep -i "8081\|sala\|controle" || echo "Nenhum encontrado"
    
    # Tentar ligar
    echo ""
    echo "🚀 Tentando iniciar sala-controle na porta 8081..."
    
    # Se arquivo existe
    if [ -f apps/modulos/sala-controle/server.js ]; then
      echo "Found: apps/modulos/sala-controle/server.js"
      pm2 start apps/modulos/sala-controle/server.js --name "sala-controle" --port 8081 --env production
    elif [ -f apps/instinto-superior/server.js ]; then
      echo "Found: apps/instinto-superior/server.js"
      PORT=8081 pm2 start apps/instinto-superior/server.js --name "sala-controle"
    elif [ -f server.js ]; then
      echo "Found: ./server.js"
      PORT=8081 pm2 start server.js --name "sala-controle"
    else
      echo "⚠️  Nenhum server.js encontrado"
      find . -name "server.js" -o -name "app.js" | head -10
    fi
    
    # Restart all
    echo ""
    echo "🔄 Reiniciando todos os serviços PM2..."
    pm2 restart all || true
    sleep 3
    
    # Verificar
    echo ""
    echo "🔍 Verificando porta 8081..."
    lsof -i :8081 || echo "⚠️  Porta 8081 ainda não listening"
    
  else
    echo "❌ PM2 não encontrado. Instalar..."
    npm install -g pm2
    npm install
    pm2 start server.js --name "sala-controle" --port 8081 || true
  fi
else
  echo "❌ /root/CentralDark não encontrado"
  pwd
  ls -la /root/ | head -20
fi

echo ""
echo "=================================================="
echo "✅ Script finalizado"
