#!/usr/bin/env bash
# CentralDark — Tema DEFAULT (cabrata/autoscript original).
# Carregado por cdmenu.sh / cdstatus.sh quando CDMENU_THEME=default (ou vazio).
# Define paleta + função print_banner. Não executa nada.

if [ "${CD_FORCE_COLOR:-0}" = "1" ] || [ -t 1 ]; then
  NC='\e[0m'
  BYellow='\e[1;33m'; BBlue='\e[1;34m'; BGreen='\e[1;32m'
  BCyan='\e[1;36m'; BRed='\e[1;31m'; BPurple='\e[1;35m'
  GREEN='\e[0;32m'; YELLOW='\e[0;33m'; RED='\e[0;31m'
else
  NC=''; BYellow=''; BBlue=''; BGreen=''; BCyan=''; BRed=''; BPurple=''
  GREEN=''; YELLOW=''; RED=''
fi

# Aliases semânticos usados pelo cdmenu/cdstatus
RULE="$BYellow"        # cor das linhas divisórias
HEAD="$BBlue"          # cabeçalho de seção
LABEL="$BGreen"        # rótulo (RAM, OS, etc.)
ITEM="$BCyan"          # número da opção do menu
ERR="$BRed"
WARN="$BYellow"
OK="$BGreen"

THEME_NAME="default"
LINE="-------------------------------------------------"

print_banner() {
  : # tema default não imprime banner extra — mantém visual atual
}
