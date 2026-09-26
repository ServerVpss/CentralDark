#!/bin/bash
set -u
G="https://api.centralldark.com/v1/chat/completions"
K="${CENTRALDARK_API_KEY:-$(grep -h CENTRALDARK_API_KEY /etc/centraldark/*.env /root/CentralDark/.env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"')}"
[ -z "$K" ] && { echo "❌ sem chave"; exit 1; }
P="${1:-Diagnóstico geral}"
TS=$(date +%s); O=/tmp/enxame-$TS; mkdir -p $O/{r1,final}
MODELOS=(gpt-5 gpt-5-mini claude-sonnet-4 claude-opus-4 grok-4 grok-4-fast gemini-2.5-pro gemini-2.5-flash deepseek-v3 llama-4-maverick)
echo "🌪️ Rodada 1 — 10 agentes"
for M in "${MODELOS[@]}"; do
  (curl -s "$G" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
    -d "$(jq -n --arg m "$M" --arg p "$P" '{model:$m,messages:[{role:system,content:"Você é agente especialista. Responda técnico, direto, em PT-BR."},{role:user,content:$p}]}')" \
    | jq -r '.choices[0].message.content // "ERRO"' > "$O/r1/${M//\//_}.md") &
done
wait
echo "⚖️ Juiz consolidando"
CTX=$(for f in $O/r1/*.md; do echo "### $(basename $f .md)"; cat "$f"; echo; done)
curl -s "$G" -H "Authorization: Bearer $K" -H "Content-Type: application/json" \
  -d "$(jq -n --arg m "claude-opus-4" --arg p "$P" --arg c "$CTX" \
    '{model:$m,messages:[{role:system,content:"Você é o JUIZ. Consolide as respostas dos 10 agentes em UM veredito único em PT-BR. Estrutura: 1) Consenso 2) Divergências 3) Ação recomendada 4) Riscos."},{role:user,content:("PROBLEMA:\n"+$p+"\n\nRESPOSTAS:\n"+$c)}]}')" \
  | jq -r '.choices[0].message.content' > $O/final/VEREDITO.md
echo "✅ $O/final/VEREDITO.md"
