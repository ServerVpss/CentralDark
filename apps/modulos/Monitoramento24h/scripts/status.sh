#!/usr/bin/env bash
# Monitoramento 24h — STATUS (somente leitura). Nao altera nada.
set -uo pipefail
AGENTES="CentralDark-TelegramBot guardiao-consciencia guardiao-analista monitor_tarefas zentinel-health"
echo "=== Monitoramento 24h — status dos agentes ==="
JSON="$(pm2 jlist 2>/dev/null)"
for a in $AGENTES; do
  s=$(printf '%s' "$JSON" | python3 -c "import sys,json;d=json.load(sys.stdin);print(next((p['pm2_env']['status'] for p in d if p['name']=='$a'),'ausente'))" 2>/dev/null)
  printf "  %-26s %s\n" "$a" "${s:-?}"
done
echo
echo "(lembrete: whatsapp-server e MultiZap-Gateway devem ficar 'stopped' — nao e erro)"
