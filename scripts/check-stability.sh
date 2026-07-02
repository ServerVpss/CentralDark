#!/bin/bash
echo -e "\033[1;36m[Contenção Cognitiva] Iniciando diagnóstico...\033[0m"

# 1. Verificar Proxy
if curl -s http://localhost:8082/health | grep -q "ok"; then
    echo -e "\033[0;32m[OK] Infiltrado (Proxy) online e operacional.\033[0m"
else
    echo -e "\033[0;31m[ERRO] Infiltrado offline. Reiniciando...\033[0m"
    pm2 restart elite-anthropic-proxy
fi

# 2. Verificar System Prompt
if [ -z "$SYSTEM_PROMPT" ]; then
    echo -e "\033[0;33m[ALERTA] SYSTEM_PROMPT não detectado no ambiente global. Verificando .env...\033[0m"
    source /root/CentralDark/.env 2>/dev/null
fi

echo -e "\033[1;32m[ESTABILIDADE] Sistema pronto. Infiltrado posicionado.\033[0m"
