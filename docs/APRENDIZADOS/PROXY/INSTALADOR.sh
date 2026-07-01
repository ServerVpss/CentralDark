#!/usr/bin/env bash
# ============================================================
#  🖥️ INSTALADOR — Claude Code no terminal SEM conta (proxy)
# ------------------------------------------------------------
#  Tudo-em-um: verifica dependências, instala atalhos,
#  e abre painel interativo. Roda em QUALQUER VPS Linux.
#
#  USO:
#    bash INSTALADOR.sh
# ============================================================
set -e

VERDE='\033[0;32m'; AMARELO='\033[1;33m'; VERMELHO='\033[0;31m'; AZUL='\033[0;34m'; RESET='\033[0m'
INFO="${AZUL}ℹ${RESET}"; OK="${VERDE}✓${RESET}"; AVISO="${AMARELO}⚠${RESET}"; ERRO="${VERMELHO}✗${RESET}"

# ─── 1. Detectar diretório do script ───────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROXY_SCRIPT="$SCRIPT_DIR/../../secrets/claude-proxy.sh"
COFRE="$SCRIPT_DIR/../../secrets/anthropic.env"

# Se não achar relativo, tenta caminho absoluto da CentralDark
[ -f "$PROXY_SCRIPT" ] || PROXY_SCRIPT="/root/CentralDark/secrets/claude-proxy.sh"
[ -f "$COFRE" ] || COFRE="/root/CentralDark/secrets/anthropic.env"

clear
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🖥️  INSTALADOR — Claude Code via Proxy                     ║"
echo "║   CentralDark · Terminal sem conta                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ─── 2. Verificar dependências ─────────────────────────────
echo -e "${INFO} Verificando dependências..."

DEP_FALTA=0
for cmd in bash curl python3; do
  if command -v "$cmd" &>/dev/null; then
    echo -e "  ${OK} $cmd encontrado"
  else
    echo -e "  ${AVISO} $cmd não encontrado — instalando..."
    DEP_FALTA=1
  fi
done

if [ "$DEP_FALTA" -eq 1 ]; then
  echo -e "${INFO} Instalando dependências faltantes..."
  apt-get update -qq && apt-get install -y -qq curl python3 2>/dev/null
  echo -e "${OK} Dependências instaladas"
fi

# ─── 3. Verificar script proxy ─────────────────────────────
echo ""
echo -e "${INFO} Verificando script claude-proxy.sh..."
if [ -f "$PROXY_SCRIPT" ]; then
  echo -e "  ${OK} Script encontrado: $PROXY_SCRIPT"
  chmod +x "$PROXY_SCRIPT" 2>/dev/null
else
  echo -e "  ${ERRO} Script não encontrado em $PROXY_SCRIPT"
  echo -e "  ${AVISO} Baixe o script manualmente ou ajuste o caminho"
fi

# ─── 4. Verificar cofre de credenciais ─────────────────────
echo ""
echo -e "${INFO} Verificando cofre de credenciais..."
if [ -f "$COFRE" ]; then
  echo -e "  ${OK} Cofre encontrado: $COFRE"
else
  echo -e "  ${AVISO} Cofre não encontrado em $COFRE"
  echo -e "  ${AVISO} Você precisará criar o arquivo com suas credenciais"
fi

# ─── 5. Instalar atalhos no .bashrc ────────────────────────
echo ""
echo -e "${INFO} Instalando atalhos no ~/.bashrc..."

if grep -q "CentralDark proxy aliases" ~/.bashrc 2>/dev/null; then
  echo -e "  ${OK} Atalhos já existem no .bashrc (pulando)"
else
  cat >> ~/.bashrc <<'EOF'

# === CentralDark proxy aliases ===
alias proxy-on='source /root/CentralDark/secrets/claude-proxy.sh on'
alias proxy-off='source /root/CentralDark/secrets/claude-proxy.sh off'
alias proxy-status='source /root/CentralDark/secrets/claude-proxy.sh status'
alias proxy-models='source /root/CentralDark/secrets/claude-proxy.sh models'
alias proxy-switch='source /root/CentralDark/secrets/claude-proxy.sh switch'
alias claude-proxy='bash /root/CentralDark/secrets/claude-proxy.sh run'
EOF
  echo -e "  ${OK} Atalhos adicionados ao ~/.bashrc"
  source ~/.bashrc 2>/dev/null || true
fi

# ─── 6. Painel interativo ──────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   🔌 PAINEL DO PROXY — escolha uma opção                    ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║  1. 🟢 Ligar proxy (terminal atual)                         ║"
echo "║  2. 🔴 Desligar proxy                                       ║"
echo "║  3. 📊 Ver status                                           ║"
echo "║  4. 🤖 Listar modelos disponíveis                           ║"
echo "║  5. 🔄 Trocar modelo (menu interativo)                      ║"
echo "║  6. 🚀 Ligar proxy + abrir Claude Code                      ║"
echo "║  0. ❌ Sair                                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
read -p "  👉 Escolha (0-6): " OPCAO

case "$OPCAO" in
  1) bash "$PROXY_SCRIPT" on 2>/dev/null || source "$PROXY_SCRIPT" on ;;
  2) bash "$PROXY_SCRIPT" off 2>/dev/null || source "$PROXY_SCRIPT" off ;;
  3) bash "$PROXY_SCRIPT" status ;;
  4) bash "$PROXY_SCRIPT" models ;;
  5) bash "$PROXY_SCRIPT" switch 2>/dev/null || source "$PROXY_SCRIPT" switch ;;
  6) bash "$PROXY_SCRIPT" run ;;
  0) echo -e "${INFO} Saindo..."; exit 0 ;;
  *) echo -e "${AVISO} Opção inválida"; exit 1 ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   ✅ INSTALAÇÃO CONCLUÍDA                                    ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║   Atalhos disponíveis (digite no terminal):                 ║"
echo "║                                                              ║"
echo "║     claude-proxy    → liga proxy + abre Claude Code         ║"
echo "║     proxy-on       → só liga o proxy                        ║"
echo "║     proxy-off      → desliga o proxy                        ║"
echo "║     proxy-status   → ver status + modelo ativo              ║"
echo "║     proxy-models   → listar modelos disponíveis             ║"
echo "║     proxy-switch   → menu pra trocar modelo                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
