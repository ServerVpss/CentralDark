#!/usr/bin/env bash
# Instala a skill centraldark-consciencia no agente de IA instalado localmente.
# Auto-detecta Claude Code, Cursor, Codex CLI. Roda na VPS ou em qualquer máquina com acesso SSH.

set -e

SKILL_NAME="centraldark-consciencia"
SKILL_SRC="$(cd "$(dirname "$0")/.." && pwd)"

# Cores
if [ -t 1 ]; then
  BOLD=$(printf '\033[1m'); GREEN=$(printf '\033[32m'); RED=$(printf '\033[31m')
  CYAN=$(printf '\033[36m'); YELLOW=$(printf '\033[33m'); RESET=$(printf '\033[0m')
else
  BOLD=''; GREEN=''; RED=''; CYAN=''; YELLOW=''; RESET=''
fi

info()  { printf "%s◇%s %s\n" "$CYAN"  "$RESET" "$1"; }
ok()    { printf "%s✓%s %s\n" "$GREEN" "$RESET" "$1"; }
warn()  { printf "%s!%s %s\n" "$YELLOW" "$RESET" "$1"; }
fail()  { printf "%s✗%s %s\n" "$RED"   "$RESET" "$1"; exit 1; }

echo
echo "${BOLD}Instalando skill: $SKILL_NAME${RESET}"
echo "Origem: $SKILL_SRC"
echo

# Detectar agente alvo
DEST=""
AGENT=""

if [ -d "$HOME/.claude" ]; then
  DEST="$HOME/.claude/skills/$SKILL_NAME"
  AGENT="claude-code"
elif [ -d "$HOME/.cursor" ]; then
  DEST="$HOME/.cursor/skills/$SKILL_NAME"
  AGENT="cursor"
elif [ -d "$HOME/.config/codex" ]; then
  DEST="$HOME/.config/codex/skills/$SKILL_NAME"
  AGENT="codex-cli"
elif [ -d "$HOME/.config/claude" ]; then
  DEST="$HOME/.config/claude/skills/$SKILL_NAME"
  AGENT="claude-desktop"
else
  warn "Nenhum agente conhecido detectado (~/.claude, ~/.cursor, ~/.config/codex, ~/.config/claude)."
  echo
  echo "Instalando no destino genérico: ~/.local/share/centraldark/skills/$SKILL_NAME"
  DEST="$HOME/.local/share/centraldark/skills/$SKILL_NAME"
  AGENT="generic"
fi

info "Agente detectado: ${BOLD}$AGENT${RESET}"
info "Destino: $DEST"
echo

# Backup se já existe
if [ -d "$DEST" ]; then
  BACKUP="${DEST}.bak.$(date +%Y%m%d-%H%M%S)"
  warn "Skill já instalada. Movendo backup pra $BACKUP"
  mv "$DEST" "$BACKUP"
fi

# Copiar
mkdir -p "$(dirname "$DEST")"
cp -r "$SKILL_SRC" "$DEST"

ok "Skill copiada com sucesso."
echo

# Roda pos-instalacao se existir
if [ -x "$DEST/scripts/pos-instalacao.sh" ]; then
  bash "$DEST/scripts/pos-instalacao.sh"
fi

echo "${GREEN}${BOLD}Pronto.${RESET} Abra uma nova conversa com $AGENT — a Consciência já tá ativa."
echo
