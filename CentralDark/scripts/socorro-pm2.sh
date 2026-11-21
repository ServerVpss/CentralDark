#!/bin/bash
# =====================================================
# socorro-pm2.sh — Ressuscitação em massa CentralDark
# Uso: ./scripts/socorro-pm2.sh [--dry-run]
# Segue o PLAYBOOK-RESSUSCITACAO-PM2.md
# =====================================================
set +e

ROOT="/root/CentralDark"
LOG="$ROOT/logs/socorro-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$ROOT/logs"
DRY=""
[ "$1" = "--dry-run" ] && DRY="echo [DRY]"

log(){ echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

# ---- Aviso Telegram (usa curl + connector gateway) ----
notify_tg() {
  local titulo="$1" corpo="$2"
  local msg=$(cat <<EOF
<pre>
🚑 SOCORRO-PM2 — $titulo
────────────────────────
$corpo
────────────────────────
$(date -Iseconds)
</pre>
EOF
)
  # tenta via secret local (se existir), senão só loga
  if [ -f "$ROOT/scripts/.telegram-secret" ]; then
    source "$ROOT/scripts/.telegram-secret"
    curl -sS -X POST "https://connector-gateway.lovable.dev/telegram/sendMessage" \
      -H "Authorization: Bearer $LOVABLE_API_KEY" \
      -H "X-Connection-Api-Key: $TELEGRAM_API_KEY" \
      -H 'Content-Type: application/json' \
      -d "{\"chat_id\":1901426549,\"text\":$(echo "$msg" | jq -Rs .),\"parse_mode\":\"HTML\"}" >/dev/null 2>&1 \
      && log "📱 Card Telegram enviado" || log "⚠️  Falha ao enviar Card Telegram"
  else
    log "⚠️  .telegram-secret ausente — Card Telegram NÃO enviado (mensagem: $titulo)"
  fi
}

# ---- Backup imediato do dump ----
if [ -f /root/.pm2/dump.pm2 ]; then
  cp /root/.pm2/dump.pm2 "/root/.pm2/dump.pm2.bak.$(date +%s)"
  log "💾 Backup do dump.pm2 salvo"
fi

# ---- Mapa oficial dos processos protegidos ----
declare -A DAEMONS=(
  ["CentralDark-HubBot"]="pm2 start apps/bot-telegram/hub.ecosystem.config.cjs"
  ["CentralDark-HermesThinker"]="pm2 start apps/modulos/hermes-thinker/src/index.mjs --name CentralDark-HermesThinker --time"
  ["CentralDark-LovableProxy"]="pm2 start apps/modulos/lovable-proxy/ecosystem.config.cjs"
  ["CentralDark-Memoria"]="pm2 start apps/modulos/memoria-api/index.mjs --name CentralDark-Memoria --time"
  ["CentralDark-EliteHTTP"]="pm2 start apps/modulos/elite-anthropic-proxy/start.sh --name CentralDark-EliteHTTP --time"
  ["CentralDark-ArsenalProxy"]="pm2 start apps/modulos/proxy/ecosystem.config.cjs"
  ["CentralDark-PiveteSync"]="pm2 start apps/modulos/pivete-sync/ecosystem.config.cjs"
)

cd "$ROOT" || exit 1

FALHAS=()
SUCESSOS=()

for nome in "${!DAEMONS[@]}"; do
  status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$nome\") | .pm2_env.status")
  if [ "$status" = "online" ]; then
    log "✅ $nome já online — pulando"
    continue
  fi
  log "🚀 subindo $nome ..."
  # matar zumbi (heurística: procurar porta no comando)
  cmd="${DAEMONS[$nome]}"
  $DRY $cmd >>"$LOG" 2>&1
  sleep 2
  novo_status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$nome\") | .pm2_env.status")
  restarts=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$nome\") | .pm2_env.restart_time")
  if [ "$novo_status" = "online" ] && [ "${restarts:-0}" -lt 5 ]; then
    SUCESSOS+=("$nome")
    log "  🟢 $nome OK"
  else
    FALHAS+=("$nome (status=$novo_status restarts=$restarts)")
    log "  🔴 $nome FALHOU"
  fi
done

# ---- Só salvar se veio limpo ----
if [ ${#FALHAS[@]} -eq 0 ]; then
  $DRY pm2 save >>"$LOG" 2>&1
  log "💾 pm2 save executado (todos online)"
else
  log "⚠️  pm2 save PULADO — há falhas: ${FALHAS[*]}"
fi

# ---- Registro em docs quando houver falha ----
if [ ${#FALHAS[@]} -gt 0 ]; then
  APREND="$ROOT/docs/CONSCIENCIA/APRENDIZADOS/socorro-$(date +%Y-%m-%d).md"
  mkdir -p "$ROOT/docs/CONSCIENCIA/APRENDIZADOS"
  {
    echo "# Socorro PM2 — $(date -Iseconds)"
    echo ""
    echo "## Sucessos (${#SUCESSOS[@]})"
    for s in "${SUCESSOS[@]}"; do echo "- 🟢 $s"; done
    echo ""
    echo "## Falhas (${#FALHAS[@]})"
    for f in "${FALHAS[@]}"; do echo "- 🔴 $f"; done
    echo ""
    echo "## Log completo"
    echo "\`$LOG\`"
  } >> "$APREND"
  log "📝 Registrado em $APREND"

  notify_tg "Falhas detectadas" \
"Sucessos: ${#SUCESSOS[@]}
Falhas: ${#FALHAS[@]}
$(printf '  🔴 %s\n' "${FALHAS[@]}")
Log: $LOG
Registro: $APREND"
else
  notify_tg "Ressuscitação OK" \
"Todos os $(echo "${!DAEMONS[@]}" | wc -w) daemons alvo estão online.
dump.pm2 atualizado."
fi

log "🏁 Fim"
exit ${#FALHAS[@]}
