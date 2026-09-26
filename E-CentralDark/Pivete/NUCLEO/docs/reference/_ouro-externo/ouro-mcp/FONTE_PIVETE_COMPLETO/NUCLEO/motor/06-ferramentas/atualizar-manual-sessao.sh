#!/usr/bin/env bash
# ATUALIZAR-MANUAL-SESSAO -- re-varre fatos MECANICOS reais e atualiza o
# bloco "Status ao vivo" no topo do MANUAL-SESSAO-19-07-2026/MANUAL.html.
#
# Honestidade (Regra de Ouro 7, "verde nao e prova"): este script so
# reconfirma FATOS MECANICOS (arquivo existe, gateway rodando, skill
# symlinkada, contagem real de secoes). NAO reescreve o texto humano do
# manual (panorama, timeline, glossario) -- isso exige julgamento, nao grep.
# Mesmo padrao ja usado e testado em atualizar-mapa-hermes.sh.
#
# Uso:
#   atualizar-manual-sessao.sh              (roda e atualiza o arquivo real)
#   hermes cron: chamado via --script com --no-agent (sem custo de LLM)

set -euo pipefail

NUCLEO="/e/CentralDark/Pivete/NUCLEO"
MANUAL="$NUCLEO/MANUAL-SESSAO-19-07-2026/MANUAL.html"
RELATORIO="$NUCLEO/motor/10-observabilidade/REVISAO-TECNICA-DA-LUPA.md"
HERMES_HOME="/c/Users/danda/AppData/Local/hermes/profiles/pivete"

if [ ! -f "$MANUAL" ]; then
  echo "MANUAL nao encontrado em: $MANUAL" >&2
  exit 1
fi

TS="$(date '+%d/%m/%Y %H:%M:%S %z')"

# --- secoes reais registradas no relatorio canonico ---
if [ -f "$RELATORIO" ]; then
  N_SECOES="$(grep -oE '^## [0-9]+\.' "$RELATORIO" | grep -oE '[0-9]+' | sort -n | tail -1)"
else
  N_SECOES="?"
fi

# --- gateway rodando agora? ---
GATEWAY_STATE="$(cd "/c/Users/danda/AppData/Local/hermes/hermes-agent" && ./venv/Scripts/hermes.exe --profile pivete gateway status 2>&1 | tr -d '\r' | grep -o "Gateway process running (PID: [0-9]*)" || echo "nao detectado")"

# --- skills novas ainda symlinkadas? ---
SKILLS_OK=0; SKILLS_TOTAL=4
for s in meta-lupa senior-architect background-output-log buscar-aprendizado; do
  [ -e "$HERMES_HOME/skills/$s" ] && SKILLS_OK=$((SKILLS_OK + 1))
done

# --- ferramentas novas ainda existem de verdade? ---
FERRAMENTAS_OK=0; FERRAMENTAS_TOTAL=3
[ -f "$NUCLEO/motor/06-ferramentas/REGISTRAR" ] && FERRAMENTAS_OK=$((FERRAMENTAS_OK + 1))
[ -f "$NUCLEO/motor/06-ferramentas/BUSCAR-APRENDIZADO" ] && FERRAMENTAS_OK=$((FERRAMENTAS_OK + 1))
[ -f "$NUCLEO/motor/06-ferramentas/atualizar-mapa-hermes.sh" ] && FERRAMENTAS_OK=$((FERRAMENTAS_OK + 1))

BLOCK="<!-- STATUS-AUTOMATICO:INICIO -->
    <div class=\"live-card\">
      <div class=\"live-head\">
        <span class=\"live-dot\"></span>
        <strong>Status ao vivo</strong>
        <span class=\"live-when\">verificado em ${TS}</span>
      </div>
      <p class=\"live-note\">Este bloco é regerado sozinho a cada 6h pelo Hermes — só fatos mecânicos reconferidos na hora, nunca a análise escrita acima.</p>
      <ul class=\"live-facts\">
        <li>Seções reais no histórico técnico: <b>${N_SECOES}</b></li>
        <li>Gateway do Hermes agora: <b>${GATEWAY_STATE}</b></li>
        <li>Skills novas symlinkadas: <b>${SKILLS_OK}/${SKILLS_TOTAL}</b></li>
        <li>Ferramentas novas presentes em disco: <b>${FERRAMENTAS_OK}/${FERRAMENTAS_TOTAL}</b></li>
      </ul>
    </div>
    <!-- STATUS-AUTOMATICO:FIM -->"

if grep -q "STATUS-AUTOMATICO:INICIO" "$MANUAL"; then
  BLOCK="$BLOCK" awk '
    BEGIN { block = ENVIRON["BLOCK"]; skip = 0 }
    /<!-- STATUS-AUTOMATICO:INICIO -->/ { print block; skip = 1; next }
    /<!-- STATUS-AUTOMATICO:FIM -->/ { if (skip) { skip = 0; next } }
    skip { next }
    { print }
  ' "$MANUAL" > "$MANUAL.tmp"
  mv "$MANUAL.tmp" "$MANUAL"
else
  echo "Marcador STATUS-AUTOMATICO nao encontrado no MANUAL -- nada a atualizar." >&2
  exit 1
fi

echo "MANUAL atualizado: $TS"
echo "Arquivo: $MANUAL"
