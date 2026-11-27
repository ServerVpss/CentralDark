#!/usr/bin/env bash
# switch-provider.sh — troca o provider do CentralDark-ArsenalAdapter
# entre a arsenal-proxy (Lovable AI Gateway) e o OpenRouter direto,
# SEM alterar o ecosystem.config.cjs (rollback = rodar de novo com o outro modo).
#
# Uso:
#   ./switch-provider.sh proxy        # volta pro padrão (arsenal-proxy / Lovable)
#   ./switch-provider.sh openrouter   # aponta pro OpenRouter direto
#   ./switch-provider.sh status       # mostra em qual modo tá agora
#
# Pré-requisito pro modo openrouter:
#   Existir /root/CentralDark/secrets/openrouter.env com uma linha:
#     OPENROUTER_KEY=sk-or-v1-...
#   (arquivo local da VPS, fora do repo)

set -euo pipefail

PM2_NAME="CentralDark-ArsenalAdapter"
ADAPTER_KEY="arsenal-key-local-2026"

PROXY_BASE="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/arsenal-proxy"
PROXY_KEY="arsenal-key-local-2026"

OPENROUTER_BASE="https://openrouter.ai/api/v1"
OPENROUTER_ENV_FILE="/root/CentralDark/secrets/openrouter.env"

MODE="${1:-}"

cor_verde()   { printf "\033[32m%s\033[0m\n" "$*"; }
cor_amarelo() { printf "\033[33m%s\033[0m\n" "$*"; }
cor_vermelho(){ printf "\033[31m%s\033[0m\n" "$*"; }

mostrar_status() {
  local base
  base=$(pm2 env "$PM2_NAME" 2>/dev/null | grep -E '^PROVIDER_BASE:' | awk '{print $2}' || true)
  if [[ -z "$base" ]]; then
    cor_vermelho "❌ $PM2_NAME não está rodando no PM2."
    exit 1
  fi
  echo "PROVIDER_BASE atual: $base"
  case "$base" in
    *"/functions/v1/arsenal-proxy"*) cor_verde   "✅ Modo: PROXY (arsenal-proxy / Lovable AI Gateway)" ;;
    *"openrouter.ai"*)               cor_amarelo "🟡 Modo: OPENROUTER (direto)" ;;
    *)                               cor_amarelo "❔ Modo: DESCONHECIDO" ;;
  esac
}

reiniciar_adapter() {
  local base="$1" key="$2" rotulo="$3"
  echo "🔄 Reiniciando $PM2_NAME em modo: $rotulo"
  export PROVIDER_BASE="$base"
  export PROVIDER_KEY="$key"
  export ARSENAL_ADAPTER_KEY="$ADAPTER_KEY"
  pm2 restart "$PM2_NAME" --update-env >/dev/null
  pm2 save >/dev/null
  sleep 1
  cor_verde "✅ Adapter em $rotulo. Rollback = ./switch-provider.sh <outro-modo>."
  mostrar_status
}

case "$MODE" in
  proxy)
    reiniciar_adapter "$PROXY_BASE" "$PROXY_KEY" "PROXY"
    ;;
  openrouter)
    if [[ ! -f "$OPENROUTER_ENV_FILE" ]]; then
      cor_vermelho "❌ Falta $OPENROUTER_ENV_FILE com a linha OPENROUTER_KEY=sk-or-v1-..."
      exit 1
    fi
    # shellcheck disable=SC1090
    source "$OPENROUTER_ENV_FILE"
    if [[ -z "${OPENROUTER_KEY:-}" ]]; then
      cor_vermelho "❌ OPENROUTER_KEY vazia em $OPENROUTER_ENV_FILE."
      exit 1
    fi
    reiniciar_adapter "$OPENROUTER_BASE" "$OPENROUTER_KEY" "OPENROUTER"
    ;;
  status|"")
    mostrar_status
    ;;
  *)
    cor_vermelho "Uso: $0 {proxy|openrouter|status}"
    exit 2
    ;;
esac
