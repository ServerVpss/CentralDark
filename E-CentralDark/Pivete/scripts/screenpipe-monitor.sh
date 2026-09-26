#!/bin/bash
# screenpipe-monitor.sh — Monitora status do Screenpipe
# Executa a cada minuto (* * * * *)
# Modo: no-agent (script stdout delivered directly)

set -euo pipefail

echo "[SCREENPIPE-MONITOR] INICIANDO monitoramento ($(date +%Y%m%dT%H%M%S))"

# 1. Verificar se o processo screenpipe está rodando
SCREENPIPE_FOUND=false
if command -v tasklist > /dev/null 2>&1; then
    if tasklist 2>/dev/null | grep -i screenpipe > /dev/null 2>&1; then
        SCREENPIPE_FOUND=true
        echo "[SCREENPIPE-MONITOR] Screenpipe RODANDO (detectado via tasklist)"
    fi
elif command -v ps > /dev/null 2>&1; then
    if ps aux 2>/dev/null | grep -i screenpipe > /dev/null 2>&1; then
        SCREENPIPE_FOUND=true
        echo "[SCREENPIPE-MONITOR] Screenpipe RODANDO (detectado via ps)"
    fi
fi

if [ "$SCREENPIPE_FOUND" = "false" ]; then
    echo "[SCREENPIPE-MONITOR] Screenpipe NÃO RODANDO — requer reinício manual"
fi

# 2. Verificar portas do Screenpipe (padrão: 3030)
echo "[SCREENPIPE-MONITOR] Verificando portas..."
PORT_OK=false
if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:3030/ 2>/dev/null | grep -q "200\|403\|404"; then
    PORT_OK=true
    echo "[SCREENPIPE-MONITOR] Porta 3030 RESPONDendo (HTTP $(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://localhost:3030/ 2>/dev/null))"
else
    echo "[SCREENPIPE-MONITOR] Porta 3030 NÃO RESPONDE"
fi

# 3. Uptime (se systemctl disponível)
if command -v systemctl > /dev/null 2>&1; then
    echo "[SCREENPIPE-MONITOR] Status do serviço:"
    systemctl status screenpipe 2>/dev/null | head -5 || echo "[SCREENPIPE-MONITOR] screenpipe não é serviço systemd"
else
    echo "[SCREENPIPE-MONITOR] systemctl não disponível (não é Linux ou sem privileges)"
fi

# 4. Arquivo de log recente
LOG_DIR="/e/CentralDark/Pivete/logs"
if [ -d "$LOG_DIR" ]; then
    echo "[SCREENPIPE-MONITOR] Últimos logs (top 3 por data):"
    ls -lt "$LOG_DIR" 2>/dev/null | head -4 || echo "  Nenhum log encontrado"
fi

echo "[SCREENPIPE-MONITOR] CONCLUÍDO — $(date +%Y%m%dT%H%M%S)"
exit 0
