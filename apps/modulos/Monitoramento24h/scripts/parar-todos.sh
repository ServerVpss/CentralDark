#!/usr/bin/env bash
# Monitoramento 24h — BOTAO "STOP AGENTES".
# Para SOMENTE os agentes do monitoramento. NUNCA toca em whatsapp-server / MultiZap-Gateway.
set -uo pipefail
AGENTES="CentralDark-TelegramBot guardiao-consciencia guardiao-analista"

echo "Vou PARAR estes agentes:"
for a in $AGENTES; do echo "  - $a"; done
read -r -p 'Confirmar? (digite SIM em maiusculas): ' c
if [ "${c:-}" != "SIM" ]; then echo "cancelado."; exit 0; fi

for a in $AGENTES; do
  if pm2 stop "$a" >/dev/null 2>&1; then echo "parado: $a"; else echo "falhou/ausente: $a"; fi
done
echo
echo "Para religar um agente:  pm2 start <nome>   (ou use o painel do Hub)."
echo "Lembre de rodar 'pm2 save' se quiser que o estado parado persista."
