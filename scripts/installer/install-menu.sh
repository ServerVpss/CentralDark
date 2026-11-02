#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Instala o menu da VPS no estilo cabrata/autoscript.
#  Cria symlinks /usr/local/bin/cdmenu, /usr/local/bin/menu, /usr/local/bin/cdstatus
#  Idempotente. Pode rodar quantas vezes quiser.
# ============================================================================

set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/menu"
BIN_DIR="${CENTRALDARK_BIN_DIR:-}"
if [ -z "$BIN_DIR" ]; then
  if [ -w /usr/local/bin ]; then BIN_DIR=/usr/local/bin
  else BIN_DIR="${XDG_BIN_HOME:-$HOME/.local/bin}"; fi
fi

if [ ! -f "$SRC_DIR/cdmenu.sh" ] || [ ! -f "$SRC_DIR/cdstatus.sh" ]; then
  echo "Não achei scripts/menu/cdmenu.sh ou cdstatus.sh em $SRC_DIR"
  exit 1
fi

mkdir -p "$BIN_DIR" || { echo "Não foi possível criar pasta de atalhos: $BIN_DIR"; exit 1; }

chmod +x "$SRC_DIR/cdmenu.sh" "$SRC_DIR/cdstatus.sh"

# -sfn força sobrescrever symlink existente mesmo se apontar pra diretório/cópia velha
ln -sfn "$SRC_DIR/cdmenu.sh"   "$BIN_DIR/cdmenu"
ln -sfn "$SRC_DIR/cdstatus.sh" "$BIN_DIR/cdstatus"

# Não sobrescreve /usr/local/bin/menu — esse aponta pro painel AIO antigo (multizap-panel-v2).
# Se quiser trocar, use: ln -sf "$SRC_DIR/cdmenu.sh" "$BIN_DIR/menu"

echo "OK — menu instalado em $BIN_DIR."
echo " Rode:  cdmenu        (menu principal colorido novo)"
echo " Rode:  cdstatus      (painel só de status dos serviços)"
echo " Atalho 'menu' antigo (multizap-panel-v2) foi preservado."

