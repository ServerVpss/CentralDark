#!/bin/bash
set -u
G="https://api.centralldark.com/v1/chat/completions"
K="${CENTRALDARK_API_KEY:-$(grep -h CENTRALDARK_API_KEY /etc/centraldark/*.env /root/CentralDark/.env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"')}"
[ -z "$K" ] && { echo "❌ sem chave"; exit 1; }
P="${1:-Diagnóstico geral do sistema}"
O=/tmp/enxame-$(date +%s); mkdir -p $O
MODELOS=(gpt-5 claude-sonnet-4 grok-4 gemini-2.5-pro deepseek-v3)
for M in "${MODELOS[@]}"; do
  (curl -s "$G" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
    -d "$(jq -n --arg m "$M" --arg p "$P" '{model:$m,messages:[{role:user,content:$p}]}')" \
    > "$O/${M//\//_}.json") &
done
wait
echo "✅ $O"
ls -1 $O
