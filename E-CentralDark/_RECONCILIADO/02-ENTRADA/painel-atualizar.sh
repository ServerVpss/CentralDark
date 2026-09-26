#!/usr/bin/env bash
# painel-atualizar — Atualiza o painel V2 com 1 comando
# Uso: painel-atualizar          (atualiza e abre)
#      painel-atualizar --no-open (só atualiza, não abre)
set -euo pipefail

GREEN=$(tput setaf 2 2>/dev/null || echo ""); RED=$(tput setaf 1 2>/dev/null || echo "")
YELLOW=$(tput setaf 3 2>/dev/null || echo ""); RESET=$(tput sgr0 2>/dev/null || echo "")
BOLD=$(tput bold 2>/dev/null || echo "")

SRC="/root/Multizap/scripts/multizap-panel-v2.sh"
DST="/usr/local/bin/multizap-panel-v2"
PAINEL_CMD="/usr/local/bin/painel"

echo "${BOLD}▶ Atualizando painel MultiZap V2${RESET}"
echo

# 1) Puxar última versão do GitHub
echo "${BOLD}[1/3]${RESET} Baixando última versão do GitHub..."
if ! /usr/local/bin/multizap-gh-pull; then
  echo "${RED}✗ Falha no multizap-gh-pull${RESET}"
  exit 1
fi

# 2) Conferir se o arquivo existe no repo
if [ ! -f "$SRC" ]; then
  echo "${RED}✗ Arquivo $SRC não encontrado após pull.${RESET}"
  echo "  Verifique se o commit foi sincronizado no GitHub."
  exit 1
fi

# 3) Backup + instalar
echo "${BOLD}[2/3]${RESET} Instalando..."
if [ -f "$DST" ]; then
  cp "$DST" "${DST}.bak.$(date +%Y%m%d-%H%M%S)"
fi
cp "$SRC" "$DST"
chmod +x "$DST"

# Sanity check
if ! bash -n "$DST"; then
  echo "${RED}✗ Script novo com erro de sintaxe. Restaurando backup...${RESET}"
  LAST_BAK=$(ls -t "${DST}.bak."* 2>/dev/null | head -1)
  [ -n "$LAST_BAK" ] && cp "$LAST_BAK" "$DST" && chmod +x "$DST"
  exit 1
fi

echo "${GREEN}✓ Painel atualizado em $DST${RESET}"

# 4) Abrir, salvo se --no-open
echo "${BOLD}[3/3]${RESET} Abrindo painel..."
if [ "${1:-}" = "--no-open" ]; then
  echo "${YELLOW}Pulado (--no-open). Rode 'painel' quando quiser.${RESET}"
  exit 0
fi

sleep 1
exec "$PAINEL_CMD"
