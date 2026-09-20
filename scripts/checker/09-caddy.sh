#!/usr/bin/env bash
# Bloco 09 — Caddy / domínios (SOMENTE LEITURA — nunca recarrega)
source "$(dirname "$0")/_lib.sh"
BLOCO="09-caddy"

if has_cmd systemctl; then
  ST=$(systemctl is-active caddy 2>/dev/null || echo "inativo")
  if [ "$ST" = "active" ]; then
    emit_ok "$BLOCO" "Caddy ativo (systemd)"
  else
    emit_alerta "$BLOCO" "Caddy estado=$ST"
  fi
fi

DOMINIOS=(bot.multizap.dev crm.multizap.dev hook.multizap.dev mcp.centralldark.com)
for d in "${DOMINIOS[@]}"; do
  if has_cmd curl; then
    HTTP=$(curl -fsS -o /dev/null -w "%{http_code}" --max-time 8 "https://$d/" 2>/dev/null || echo "000")
    case "$HTTP" in
      2*|3*|401|404) emit_ok     "$BLOCO" "$d HTTPS=$HTTP" ;;
      000)           emit_alerta "$BLOCO" "$d não respondeu (timeout/DNS)" ;;
      5*)            emit_erro   "$BLOCO" "$d HTTPS=$HTTP (servidor com erro)" ;;
      *)             emit_alerta "$BLOCO" "$d HTTPS=$HTTP" ;;
    esac
  fi
done
