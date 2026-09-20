#!/usr/bin/env bash
# CentralDark — Tema NETFLIX (vermelho #E50914 + banner em blocos).
# Inspirado em shopeevpn/menu-themes (paleta + estética), sem copiar código.

if [ "${CD_FORCE_COLOR:-0}" = "1" ] || [ -t 1 ]; then
  NC='\e[0m'
  # Vermelho Netflix oficial (24-bit)
  NRED='\e[38;2;229;9;20m'
  BNRED='\e[1;38;2;229;9;20m'
  NDARK='\e[38;2;180;0;15m'
  WHITE='\e[1;97m'
  GREY='\e[38;2;180;180;180m'
  BGreen='\e[1;32m'
  BYellow='\e[1;33m'
  BRed='\e[1;31m'
  BBlue='\e[1;34m'
  BCyan='\e[1;36m'
else
  NC=''; NRED=''; BNRED=''; NDARK=''; WHITE=''; GREY=''
  BGreen=''; BYellow=''; BRed=''; BBlue=''; BCyan=''
fi

RULE="$BNRED"
HEAD="$BNRED"
LABEL="$WHITE"
ITEM="$BNRED"
ERR="$BRed"
WARN="$BYellow"
OK="$BGreen"

THEME_NAME="netflix"
# LINE legado (alguns scripts antigos ainda leem); o cdmenu novo usa $RULE_W.
LINE="================================================="

# Banner adaptativo:
#  - >=90 cols: ASCII gigante (visual cabrata)
#  - 60..89:    ASCII médio
#  - <60:       texto compacto (mobile / split pane)
print_banner() {
  local cols="${COLS:-$(tput cols 2>/dev/null || echo 80)}"
  echo
  echo -e "${BNRED}"
  if [ "$cols" -ge 90 ]; then
    cat <<'EOF'
  █████  ███████ █     █ ███████ ██████     █    █
 █     █ █       ██    █    █    █     █   █ █   █
 █       █       █ █   █    █    █     █  █   █  █
 █       █████   █  █  █    █    ██████  █     █ █
 █       █       █   █ █    █    █   █   ███████ █
 █     █ █       █    ██    █    █    █  █     █ █
  █████  ███████ █     █    █    █     █ █     █ ███████

      ██████     █    ██████  █    █
      █     █   █ █   █     █ █   █
      █     █  █   █  █     █ █  █
      █     █ █     █ ██████  ███
      █     █ ███████ █   █   █  █
      █     █ █     █ █    █  █   █
      ██████  █     █ █     █ █    █
EOF
  elif [ "$cols" -ge 60 ]; then
    cat <<'EOF'
  ██████ ███████ ███    ██ ████████ ██████   █████  ██
 ██      ██      ████   ██    ██    ██   ██ ██   ██ ██
 ██      █████   ██ ██  ██    ██    ██████  ███████ ██
 ██      ██      ██  ██ ██    ██    ██   ██ ██   ██ ██
  ██████ ███████ ██   ████    ██    ██   ██ ██   ██ ███████

         ██████   █████  ██████  ██   ██
         ██   ██ ██   ██ ██   ██ ██  ██
         ██   ██ ███████ ██████  █████
         ██   ██ ██   ██ ██   ██ ██  ██
         ██████  ██   ██ ██   ██ ██   ██
EOF
  else
    cat <<'EOF'
  ╔═══════════════════════════╗
  ║   C E N T R A L  D A R K  ║
  ╚═══════════════════════════╝
EOF
  fi
  echo -e "${NDARK} Premium-Server-Script-by-CentralDark${NC}"
  echo
}
