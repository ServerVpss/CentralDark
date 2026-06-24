#!/usr/bin/env bash
# ============================================================================
#  CentralDark — Menu principal (estilo cabrata/autoscript adaptado)
# ----------------------------------------------------------------------------
#  Suporta temas via $CDMENU_THEME (default | netflix) ou flag --netflix.
#  IP público é OMITIDO de propósito. Mostra só o domínio.
#  Layout 100% responsivo: adapta à largura do terminal (mín 40, máx 100 cols).
#  Instalar:  ./install.sh --menu
#  Rodar:     cdmenu              (tema atual)
#             cdmenu --netflix    (skin Netflix)
#             CDMENU_THEME=netflix cdmenu
# ============================================================================

set -u

# Garante TERM válido pra cores funcionarem mesmo em SSH novo / .bashrc autostart
if [ -z "${TERM:-}" ] || [ "${TERM:-}" = "dumb" ]; then
  export TERM=xterm-256color
fi
# Permite forçar cor mesmo sem TTY (autostart no .bashrc, pipe, etc.)
export CD_FORCE_COLOR="${CD_FORCE_COLOR:-1}"

# ---------- escolha de tema ----------
case "${1:-}" in
  --netflix) export CDMENU_THEME=netflix ;;
  --default) export CDMENU_THEME=default ;;
esac
THEME="${CDMENU_THEME:-netflix}"

# ---------- responsividade ----------
detectar_colunas() {
  local c=""
  if [ -t 1 ]; then
    c="$(tput cols 2>/dev/null || echo "")"
    [ -z "$c" ] && c="${COLUMNS:-}"
  fi
  [ -z "$c" ] && c=72
  [ "$c" -lt 40  ] && c=40
  [ "$c" -gt 100 ] && c=100
  COLS="$c"
  # Largura útil da régua (com 1 espaço de margem em cada lado)
  RULE_W=$((COLS - 2))
  # Largura do label das chaves (fixo, mas encolhe em telas pequenas)
  if [ "$COLS" -lt 56 ]; then LABEL_W=12; else LABEL_W=14; fi
  export COLS RULE_W LABEL_W
}
detectar_colunas
trap detectar_colunas WINCH 2>/dev/null || true

repetir() { local n="$1" s="${2:-=}" o=""; while [ "$n" -gt 0 ]; do o+="$s"; n=$((n-1)); done; printf '%s' "$o"; }
linha()   { printf "${RULE} %s${NC}\n" "$(repetir "$RULE_W")"; }
centro()  {
  local t="$1" w="$RULE_W" len=${#1} pad
  [ "$len" -gt "$w" ] && { t="${t:0:$w}"; len=$w; }
  pad=$(( (w - len) / 2 )); [ "$pad" -lt 0 ] && pad=0
  printf "${HEAD} %*s%s%*s${NC}\n" "$pad" "" "$t" "$((w - pad - len))" ""
}
kv() {
  # imprime "  LABEL  : valor" respeitando LABEL_W e truncando valor se estourar
  local lab="$1" val="$2"
  local max_val=$(( COLS - LABEL_W - 5 ))
  [ "$max_val" -lt 8 ] && max_val=8
  [ "${#val}" -gt "$max_val" ] && val="${val:0:$((max_val-1))}…"
  # Valor em branco bold pra contrastar com fundo escuro
  printf "${LABEL} %-${LABEL_W}s${NC}: \e[1;97m%s\e[0m\n" "$lab" "$val"
}
item() {
  local n="$1" txt="$2"
  local max_txt=$(( COLS - 6 ))
  [ "${#txt}" -gt "$max_txt" ] && txt="${txt:0:$((max_txt-1))}…"
  # Número colorido, texto em branco bold pra leitura fácil
  printf "${ITEM} %2s ${NC}: \e[1;97m%s\e[0m\n" "$n" "$txt"
}
export -f repetir linha centro kv item

# Resolve caminho real (cdmenu costuma ser symlink em /usr/local/bin)
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}" 2>/dev/null || echo "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
THEME_DIR="$SCRIPT_DIR/themes"
THEME_FILE="$THEME_DIR/${THEME}.sh"
[ -f "$THEME_FILE" ] || THEME_FILE="$THEME_DIR/default.sh"
# shellcheck disable=SC1090
source "$THEME_FILE"

# ---------- coleta ----------
OS_NAME="$(hostnamectl 2>/dev/null | awk -F': ' '/Operating System/ {print $2}')"
[ -z "${OS_NAME:-}" ] && OS_NAME="$(uname -srm)"

UPTIME_STR="$(uptime -p 2>/dev/null | sed 's/^up //')"
# Em telas estreitas mostra data compacta
if [ "$COLS" -lt 64 ]; then
  DATETIME="$(TZ=America/Sao_Paulo date '+%d/%m %H:%M')"
else
  DATETIME="$(TZ=America/Sao_Paulo date '+%a, %d %b %Y %H:%M:%S %Z')"
fi

DOMAIN_FILE="/root/CentralDark/secrets/domain.txt"
if [ -f "$DOMAIN_FILE" ]; then
  DOMAIN="$(head -n1 "$DOMAIN_FILE")"
elif [ -n "${CENTRALDARK_DOMAIN:-}" ]; then
  DOMAIN="$CENTRALDARK_DOMAIN"
else
  DOMAIN="centralldark.com"
fi

URAM="$(free -m | awk 'NR==2 {print $3}')"
TRAM="$(free -m | awk 'NR==2 {print $2}')"
CPU_USAGE="$(top -bn1 2>/dev/null | awk '/Cpu\(s\)/ {print 100 - $8"%"}')"
[ -z "${CPU_USAGE:-}" ] && CPU_USAGE="n/d"
DISK_USED="$(df -h / 2>/dev/null | awk 'NR==2 {print $3"/"$2" ("$5")"}')"

IFACE="$(ip route 2>/dev/null | awk '/default/ {print $5; exit}')"
IFACE="${IFACE:-eth0}"
if command -v vnstat >/dev/null 2>&1; then
  DTODAY="$(vnstat -i "$IFACE" --oneline b 2>/dev/null | awk -F\; '{print $4}')"
  UTODAY="$(vnstat -i "$IFACE" --oneline b 2>/dev/null | awk -F\; '{print $5}')"
  TTODAY="$(vnstat -i "$IFACE" --oneline b 2>/dev/null | awk -F\; '{print $6}')"
fi
# Fallback: se vnstat não tem dado, lê tráfego desde o último boot via /proc/net/dev.
human_bytes() {
  awk -v b="$1" 'BEGIN{
    split("B KB MB GB TB",u);s=1;
    while(b>=1024 && s<5){b/=1024;s++}
    printf "%.2f %s", b, u[s]
  }'
}
if [ -z "${TTODAY:-}" ] || [ "${TTODAY:-n/d}" = "n/d" ]; then
  if [ -r /proc/net/dev ]; then
    read rx tx < <(awk -v i="$IFACE" '$1 ~ i":" {gsub(":",""); print $2, $10}' /proc/net/dev)
    if [ -n "${rx:-}" ]; then
      DTODAY="$(human_bytes "$rx") (boot)"
      UTODAY="$(human_bytes "$tx") (boot)"
      TTODAY="$(human_bytes "$((rx + tx))") (boot)"
    fi
  fi
fi
DTODAY="${DTODAY:-n/d}"; UTODAY="${UTODAY:-n/d}"; TTODAY="${TTODAY:-n/d}"

CLIENT_NAME="${CLIENT_NAME:-CentralDark}"
VERSION_FILE="/root/CentralDark/VERSION"
if [ -f "$VERSION_FILE" ]; then
  VERSAO="$(head -n1 "$VERSION_FILE")"
else
  VERSAO="rolling-main"
fi
EXPIRED="Lifetime"

# ---------- render ----------
clear
print_banner
linha
centro "INFO DA VPS"
linha
kv "Sistema"     "$OS_NAME"
kv "Tempo ligado" "$UPTIME_STR"
kv "Domínio"     "$DOMAIN"
kv "Data / Hora" "$DATETIME"
linha
centro "SERVIDOR"
linha
kv "RAM usada"   "${URAM} MB"
kv "RAM total"   "${TRAM} MB"
kv "CPU"         "$CPU_USAGE"
kv "Disco"       "$DISK_USED"
linha
centro "BANDA"
linha
kv "Download hoje" "$DTODAY"
kv "Upload hoje"   "$UTODAY"
kv "Total hoje"    "$TTODAY"
linha
centro "MENU"
linha
echo
# Estado do "painel fixo" (autostart no SSH)
AUTOSTART_FLAG="$HOME/.cdmenu-autostart"
if [ -f "$AUTOSTART_FLAG" ]; then
  PAINEL_FIXO_LABEL="🟢 Abrir instalador ao logar no SSH: LIGADO  (desligar)"
else
  PAINEL_FIXO_LABEL="🔴 Abrir instalador ao logar no SSH: DESLIGADO (ligar)"
fi

item  1 "📊 Status dos serviços (PM2)"
item  2 "♻️  Reiniciar MCP CentralDark"
item  3 "♻️  Reiniciar Supabase Sync"
item  4 "♻️  Reiniciar Bot Telegram"
item  5 "📜 Ver logs de um serviço"
item  6 "⬇️  Atualizar do GitHub (git pull)"
item  7 "✅ Rodar checagem completa"
item  8 "🛠  Atualizar instalador"
item  9 "📋 Ver pendências"
item 10 "🧹 Limpar cache de RAM"
item 11 "🔌 Reiniciar a VPS"
item 12 "🎨 Trocar tema (default / netflix)"
item 13 "🌐 Status do Caddy"
item 14 "🔁 Recarregar Caddy (reload)"
item 15 "🛰  Portas escutando"
item 16 "🌍 Ver IP público"
item 17 "📶 Ligar/instalar medidor de banda"
item 18 "💾 Backup da pasta secrets"
item 19 "📖 Abrir docs (install.centralldark.com)"
item 20 "$PAINEL_FIXO_LABEL"
item  x "🚪 Sair"
echo
linha
kv "Cliente"   "$CLIENT_NAME"
kv "Versão"    "$VERSAO"
kv "Expira em" "$EXPIRED"
kv "Tema"      "${THEME_NAME:-$THEME}"
linha
echo
# Rodapé adapta: em tela larga mostra os dois domínios lado a lado, em estreita empilha
if [ "$COLS" -ge 60 ]; then
  printf "${ITEM} %*scentralldark.com  ·  mcp.centralldark.com${NC}\n" \
    "$(( (COLS - 40) / 2 ))" ""
else
  printf "${ITEM}  centralldark.com${NC}\n"
  printf "${ITEM}  mcp.centralldark.com${NC}\n"
fi
echo

read -rp " Escolha: " opt
echo

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
[ -d "$REPO" ] || REPO="/root/Multizap/apps/clone-deck"

reiniciar_seguro() {
  local svc="$1"
  case "$svc" in
    MCP-CentralDark|CloneDeck-Supabase-Sync|MultiZap-TelegramBot)
      pm2 restart "$svc" --update-env
      ;;
    *)
      echo -e "${ERR}Serviço fora da lista branca. Abortado.${NC}"
      ;;
  esac
}

case "$opt" in
  1) clear; CDMENU_THEME="$THEME" bash "$(dirname "$0")/cdstatus.sh" ;;
  2) reiniciar_seguro MCP-CentralDark ;;
  3) reiniciar_seguro CloneDeck-Supabase-Sync ;;
  4) reiniciar_seguro MultiZap-TelegramBot ;;
  5)
     read -rp " Nome do serviço PM2: " svc
     pm2 logs "$svc" --lines 80 --nostream
     ;;
  6)
     cd "$REPO" 2>/dev/null && git pull --ff-only || echo -e "${ERR}Repo não encontrado em $REPO${NC}"
     ;;
  7)
     if [ -x "$REPO/scripts/checker/run-all.sh" ]; then
       bash "$REPO/scripts/checker/run-all.sh"
     else
       echo -e "${ERR}Checker não encontrado.${NC}"
     fi
     ;;
  8)
     if [ -x "$REPO/install.sh" ]; then
       bash "$REPO/install.sh" --update || bash "$REPO/install.sh" --help
     else
       echo -e "${ERR}install.sh não encontrado em $REPO${NC}"
     fi
     ;;
  9)
     ${PAGER:-less} "$REPO/docs/PENDENCIAS.md" 2>/dev/null || cat "$REPO/docs/PENDENCIAS.md"
     ;;
  10)
     sync && echo 3 > /proc/sys/vm/drop_caches && echo -e "${OK}Cache limpo.${NC}"
     ;;
  11)
     read -rp " Confirma reiniciar a VPS? (digite SIM): " c
     [ "$c" = "SIM" ] && /sbin/reboot || echo "Abortado."
     ;;
  12)
     echo " Temas disponíveis:"
     ls -1 "$THEME_DIR" 2>/dev/null | sed 's/\.sh$//' | sed 's/^/  - /'
     read -rp " Nome do tema: " nt
     if [ -f "$THEME_DIR/${nt}.sh" ]; then
       echo "export CDMENU_THEME=${nt}" > "$HOME/.cdmenu-theme"
       echo -e "${OK}Tema '${nt}' salvo em ~/.cdmenu-theme. Adicione 'source ~/.cdmenu-theme' no ~/.bashrc.${NC}"
       exec env CDMENU_THEME="$nt" "$0"
     else
       echo -e "${ERR}Tema não encontrado.${NC}"
     fi
     ;;
  13)
     echo " Status do Caddy:"
     systemctl status caddy --no-pager -l 2>/dev/null | head -20 || echo -e "${ERR}Caddy não está instalado.${NC}"
     ;;
  14)
     read -rp " Confirma recarregar Caddy? (digite SIM): " c
     if [ "$c" = "SIM" ]; then
       systemctl reload caddy && echo -e "${OK}Caddy recarregado.${NC}" || echo -e "${ERR}Falha no reload.${NC}"
     else
       echo "Abortado."
     fi
     ;;
  15)
     echo " Portas TCP escutando:"
     ss -tlnp 2>/dev/null | awk 'NR==1 || /LISTEN/' | head -40
     ;;
  16)
     echo -n " IP público: "
     curl -fsS --max-time 5 https://ifconfig.co 2>/dev/null \
       || curl -fsS --max-time 5 https://api.ipify.org 2>/dev/null \
       || echo "n/d (sem internet?)"
     echo
     ;;
  17)
     if command -v vnstat >/dev/null 2>&1; then
       systemctl enable --now vnstat 2>/dev/null
       echo -e "${OK}vnstat ativo. Aguarde alguns minutos pra coletar dados.${NC}"
     else
       read -rp " Instalar vnstat agora (apt install)? (digite SIM): " c
       if [ "$c" = "SIM" ]; then
         apt-get update -y && apt-get install -y vnstat \
           && systemctl enable --now vnstat \
           && echo -e "${OK}vnstat instalado e rodando.${NC}" \
           || echo -e "${ERR}Falha ao instalar vnstat.${NC}"
       else
         echo "Abortado."
       fi
     fi
     ;;
  18)
     SECRETS_DIR="/root/CentralDark/secrets"
     if [ -d "$SECRETS_DIR" ]; then
       BKP="/root/backups"; mkdir -p "$BKP"
       NOME="$BKP/secrets-$(date +%Y%m%d-%H%M%S).tar.gz"
       tar -czf "$NOME" -C /root/CentralDark secrets \
         && echo -e "${OK}Backup salvo em $NOME${NC}" \
         || echo -e "${ERR}Falha ao criar backup.${NC}"
     else
       echo -e "${ERR}Pasta $SECRETS_DIR não encontrada.${NC}"
     fi
     ;;
  19)
     if command -v xdg-open >/dev/null 2>&1; then
       xdg-open https://install.centralldark.com >/dev/null 2>&1 &
       echo -e "${OK}Abrindo no navegador…${NC}"
     else
       echo " Acesse no navegador: https://install.centralldark.com"
     fi
     ;;
   20)
      # 🔌 Painel fixo: liga/desliga o auto-abrir do INSTALADOR ao logar via SSH.
      #    Tomada pura — toggle. Abre o wizard colorido LOCAL (cdinstall).
      MARK_BEGIN="# >>> centraldark cdmenu autostart >>>"
      MARK_END="# <<< centraldark cdmenu autostart <<<"
      BRC="$HOME/.bashrc"
      touch "$BRC"
      # Limpa blocos antigos (qualquer variação) pra não duplicar
      sed -i.bak-autostart '/# >>> centraldark cdmenu autostart >>>/,/# <<< centraldark cdmenu autostart <<</d' "$BRC" 2>/dev/null || true
      sed -i.bak-autostart '/# >>> centraldark bootstrap autostart >>>/,/# <<< centraldark bootstrap autostart <<</d' "$BRC" 2>/dev/null || true
      if [ -f "$AUTOSTART_FLAG" ]; then
        # DESLIGAR
        rm -f "$AUTOSTART_FLAG"
        echo -e "${OK}🔴 Painel fixo DESLIGADO. Próximo SSH abre o shell normal.${NC}"
      else
        # LIGAR
        touch "$AUTOSTART_FLAG"
        {
          echo ""
          echo "$MARK_BEGIN"
          echo "# Abre o INSTALADOR (wizard colorido local) em sessões SSH interativas."
          echo "# Pra desligar: rode 'cdmenu' → opção 20, OU apague ~/.cdmenu-autostart."
          echo "if [ -n \"\$PS1\" ] && [ -n \"\$SSH_CONNECTION\" ] && [ -f \"\$HOME/.cdmenu-autostart\" ] && [ -z \"\$CDINSTALL_RUNNING\" ] && command -v cdinstall >/dev/null 2>&1; then"
          echo "  export CDINSTALL_RUNNING=1 CD_FORCE_COLOR=1"
          echo "  export TERM=\"\${TERM:-xterm-256color}\""
          echo "  exec cdinstall"
          echo "fi"
          echo "$MARK_END"
        } >> "$BRC"
        echo -e "${OK}🟢 Painel fixo LIGADO. Próximo SSH já abre o instalador colorido sozinho.${NC}"
      fi
      ;;
  x|X) exit 0 ;;
  *) echo -e "${ERR}Opção inválida.${NC}"; sleep 1; exec "$0" ;;
esac

echo
read -rp " Pressione ENTER pra voltar ao menu... " _
exec env CDMENU_THEME="$THEME" "$0"
