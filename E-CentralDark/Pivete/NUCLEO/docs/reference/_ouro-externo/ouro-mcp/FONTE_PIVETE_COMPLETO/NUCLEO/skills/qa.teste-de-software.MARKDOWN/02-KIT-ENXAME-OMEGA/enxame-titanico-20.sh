#!/bin/bash
set -u
G="https://api.centralldark.com/v1/chat/completions"
K="${CENTRALDARK_API_KEY:-$(grep -h CENTRALDARK_API_KEY /etc/centraldark/*.env /root/CentralDark/.env 2>/dev/null | head -1 | cut -d= -f2 | tr -d '"')}"
[ -z "$K" ] && { echo "❌ sem chave"; exit 1; }
P="${1:-Diagnóstico geral}"
TS=$(date +%s); O=/tmp/titanico-$TS; mkdir -p $O/{r1,r2,final}
M=(gpt-5 gpt-5-mini gpt-5-nano o4-mini claude-opus-4 claude-sonnet-4 claude-haiku-4 grok-4 grok-4-fast grok-code gemini-2.5-pro gemini-2.5-flash gemini-2.0-pro deepseek-v3 deepseek-r1 llama-4-maverick llama-4-scout mistral-large qwen-2.5-72b command-r-plus)
run(){ curl -s "$G" -H "Authorization: Bearer $K" -H "Content-Type: application/json" -d "$(jq -n --arg m "$1" --arg s "$2" --arg u "$3" '{model:$m,messages:[{role:system,content:$s},{role:user,content:$u}]}')" | jq -r '.choices[0].message.content // "ERRO"'; }
echo "🌪️ R1 — 20 diagnósticos"
for x in "${M[@]}"; do (run "$x" "Diagnóstico técnico staff, PT-BR, direto." "$P" > $O/r1/${x//\//_}.md) & done; wait
echo "⚔️ R2 — debate cruzado"
CTX1=$(for f in $O/r1/*.md; do echo "### $(basename $f .md)"; head -c 3000 "$f"; echo; done)
for x in "${M[@]}"; do (run "$x" "Você leu 20 respostas. Aponte a MELHOR análise e ONDE cada uma errou. Seja adversarial." "$P\n\nRESPOSTAS:\n$CTX1" > $O/r2/${x//\//_}.md) & done; wait
echo "👑 Juiz final"
CTX2=$(for f in $O/r2/*.md; do echo "### $(basename $f .md)"; head -c 2500 "$f"; echo; done)
run "claude-opus-4" "JUIZ SUPREMO. Consolide em plano executivo PT-BR: Diagnóstico Confirmado / Plano de Ação Numerado / Riscos / Métricas de Sucesso." "$P\n\nDEBATE:\n$CTX2" > $O/final/PLANO-MESTRE.md
echo "✅ $O/final/PLANO-MESTRE.md"
