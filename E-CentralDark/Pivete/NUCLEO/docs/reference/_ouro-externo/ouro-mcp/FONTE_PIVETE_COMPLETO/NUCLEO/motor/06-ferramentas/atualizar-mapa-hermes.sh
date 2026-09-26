#!/usr/bin/env bash
# ATUALIZAR-MAPA-HERMES -- re-varre os fatos MECANICOS (arquivos, tamanhos,
# config real) do ecossistema Hermes e atualiza o bloco "STATUS AUTOMATICO"
# no topo de motor/10-observabilidade/MAPA-HERMES-19-07-2026.md.
#
# Honestidade (Regra de Ouro 7, "verde nao e prova"): este script so
# reconfirma FATOS MECANICOS (existe/nao existe, tamanho, valor de config).
# Ele NAO refaz a analise qualitativa (as 5 geracoes conceituais, o que e
# residual) -- isso exige leitura/julgamento humano ou de IA, nao um grep.
# Se os fatos mecanicos abaixo mudarem, quem le sabe que a analise textual
# do resto do arquivo pode ter ficado desatualizada e precisa de revisao.
#
# Uso:
#   atualizar-mapa-hermes.sh              (roda e atualiza o arquivo real)
#   hermes cron: chamado via --script com --no-agent (sem custo de LLM)

set -euo pipefail

NUCLEO="/e/CentralDark/Pivete/NUCLEO"
MENTE="$NUCLEO/hermes-mente"
MAPA="$NUCLEO/motor/10-observabilidade/MAPA-HERMES-19-07-2026.md"
HERMES_HOME="/c/Users/danda/AppData/Local/hermes/profiles/pivete"
CONFIG="$HERMES_HOME/config.yaml"

if [ ! -f "$MAPA" ]; then
  echo "MAPA nao encontrado em: $MAPA" >&2
  exit 1
fi

TS="$(date '+%d/%m/%Y %H:%M:%S %z')"

# --- 1. hermes-mente: arquivos esperados (lista fixa da auditoria de 19/07) ---
ESPERADOS=(
  "CARREGADOR.md" "HERMES-REGRAS-DE-OURO.md" "MANIFESTO.json"
  "TESTE-DE-DIFERENCA.md" "00-NUCLEO-MORDOMO.md" "01-MEMORIA-VIVA.md"
  "02-ANTECIPACAO.md" "03-DECISAO.md" "04-COMUNICACAO.md" "05-APRENDIZADO.md"
  "memoria/HOJE.md" "memoria/SEMANA.md" "memoria/REGRAS.md"
  "hermes-motor/INSTALACAO.md" "hermes-motor/01-identidade/00-NUCLEO-MORDOMO.md"
  "hermes-motor/schemas/loop-cognitivo.json" "hermes-motor/schemas/consolidador-io.json"
  "hermes-motor/schemas/maestro.pseudo"
)
FALTANDO=""
NOVOS=""
for f in "${ESPERADOS[@]}"; do
  [ -f "$MENTE/$f" ] || FALTANDO="$FALTANDO $f"
done
if [ -d "$MENTE" ]; then
  ACHADOS_COUNT="$(find "$MENTE" -type f | wc -l | tr -d ' ')"
else
  ACHADOS_COUNT="0 (pasta hermes-mente nao encontrada)"
fi

# --- 2. as 3 notas de inventario ainda estao la? ---
NOTA_1="AUSENTE"; NOTA_2="AUSENTE"; NOTA_3="AUSENTE"
grep -q "Nota de inventário (19/07/2026)" "$NUCLEO/motor/01-identidade/IDENTIDADE-HERMES.md" 2>/dev/null && NOTA_1="presente"
grep -q "Nota de inventário (19/07/2026)" "$NUCLEO/motor/02-cerebro/ARQUITETURA.md" 2>/dev/null && NOTA_2="presente"
grep -q "Nota de inventário (19/07/2026)" "$NUCLEO/motor/03-memoria/MEMORIA.md" 2>/dev/null && NOTA_3="presente"

# --- 3. memoria REAL vs schema conceitual (a discrepancia achada em 19/07 ainda existe?) ---
# pipefail: grep sem match nao pode derrubar o cron (chave pode estar ausente / default).
MEM_LIMIT_REAL="$(grep 'memory_char_limit:' "$CONFIG" 2>/dev/null | grep -oE '[0-9]+' | head -1 || true)"
USER_LIMIT_REAL="$(grep 'user_char_limit:' "$CONFIG" 2>/dev/null | grep -oE '[0-9]+' | head -1 || true)"
MEM_LIMIT_REAL="${MEM_LIMIT_REAL:-?}"
USER_LIMIT_REAL="${USER_LIMIT_REAL:-?}"

# --- 4. kit hermes-mente foi ativado no boot real? (CARREGADOR.md referenciado em algum lugar do config real) ---
ATIVACAO="NAO ATIVADO (nenhuma referencia a hermes-mente/CARREGADOR.md no config.yaml real)"
grep -qi "hermes-mente" "$CONFIG" 2>/dev/null && ATIVACAO="POSSIVELMENTE ATIVADO -- referencia a hermes-mente encontrada em config.yaml, revisar manualmente" || true

# --- 5. skills symlinks ainda de pe? ---
SKILL_LUPA="AUSENTE"; SKILL_ARCH="AUSENTE"
[ -e "$HERMES_HOME/skills/tecnica-da-lupa-premium" ] && SKILL_LUPA="presente"
[ -e "$HERMES_HOME/skills/senior-architect" ] && SKILL_ARCH="presente"

# --- 6. gateway rodando agora? ---
GATEWAY_STATE="$(cd "/c/Users/danda/AppData/Local/hermes/hermes-agent" && ./venv/Scripts/hermes.exe --profile pivete gateway status 2>&1 | tr -d '\r' | grep -o "Gateway process running (PID: [0-9]*)" || echo "processo nao detectado")"

STATUS_BLOCK="<!-- STATUS-AUTOMATICO:INICIO -->
## STATUS AUTOMÁTICO (última verificação real: ${TS})

*Bloco gerado por \`motor/06-ferramentas/atualizar-mapa-hermes.sh\` — só fatos
mecânicos reconfirmados agora. A análise qualitativa abaixo (seções 1-6) foi
escrita por leitura humana/IA em 19/07/2026 e NÃO é regerada automaticamente
— se algo aqui mudou, ela pode estar desatualizada.*

- Arquivos em \`hermes-mente/\`: ${ACHADOS_COUNT} encontrados. Faltando da lista original:${FALTANDO:- nenhum}.
- Notas de inventário: IDENTIDADE-HERMES.md=${NOTA_1} · ARQUITETURA.md=${NOTA_2} · MEMORIA.md=${NOTA_3}
- Limite real memória (config.yaml): memory_char_limit=${MEM_LIMIT_REAL} · user_char_limit=${USER_LIMIT_REAL} (schema conceitual pede 8000/4000 — ${MEM_LIMIT_REAL}x${USER_LIMIT_REAL} vs 8000x4000, ainda divergente se diferente)
- Ativação do kit no boot real: ${ATIVACAO}
- Skills symlink: tecnica-da-lupa-premium=${SKILL_LUPA} · senior-architect=${SKILL_ARCH}
- Gateway agora: ${GATEWAY_STATE}
<!-- STATUS-AUTOMATICO:FIM -->"

# Substitui o bloco entre os marcadores (ou insere apos a primeira linha se for a 1a execucao).
# awk puro -- sem shell-out pra python, evita problema de traducao de caminho
# MSYS/Windows quando o cron dispara este script fora do meu Bash interativo
# (achado real: 1a tentativa falhou por causa exatamente disso, ver §44).
if grep -q "STATUS-AUTOMATICO:INICIO" "$MAPA"; then
  STATUS_BLOCK="$STATUS_BLOCK" awk '
    BEGIN { block = ENVIRON["STATUS_BLOCK"]; skip = 0 }
    /<!-- STATUS-AUTOMATICO:INICIO -->/ { print block; skip = 1; next }
    /<!-- STATUS-AUTOMATICO:FIM -->/ { if (skip) { skip = 0; next } }
    skip { next }
    { print }
  ' "$MAPA" > "$MAPA.tmp"
  mv "$MAPA.tmp" "$MAPA"
else
  # 1a execucao: insere logo apos a linha de titulo (linha 1)
  { head -n 1 "$MAPA"; echo ""; echo "$STATUS_BLOCK"; echo ""; tail -n +2 "$MAPA"; } > "$MAPA.tmp"
  mv "$MAPA.tmp" "$MAPA"
fi

echo "MAPA atualizado: $TS"
echo "Arquivo: $MAPA"
