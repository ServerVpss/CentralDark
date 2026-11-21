#!/usr/bin/env bash
set -euo pipefail

# #FASE 04/05 — Enable MCP creation mode (com proteção anti-502)
# Pré-check: confere se o MCP está saudável antes de tocar.
# Pós-check: valida health 3x; se cair, reverte com restart limpo + alerta.

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/enable-mcp-creation-mode"
mkdir -p "$OUT/reports"
chmod 700 "$OUT" "$OUT/reports" 2>/dev/null || true

log(){ echo "$*" | tee -a "$OUT/resumo.txt"; }

MCP_HEALTH_URL="http://127.0.0.1:9100/health"

health_check() {
  # Retorna 0 se /health respondeu 200, 1 caso contrário
  local code
  code="$(curl -fsS -o /dev/null -w '%{http_code}' --max-time 4 "$MCP_HEALTH_URL" 2>/dev/null || echo "000")"
  [ "$code" = "200" ]
}

log "#FASE 04/05 — Enable MCP creation mode"
log "Relatorio: $OUT"
log "Objetivo: fazer MCP-CentralDark aparecer na allowlist do conector."
log "Escopo: restart controlado apenas do MCP-CentralDark; sem shell arbitrario."

if ! command -v pm2 >/dev/null 2>&1; then
  log "ERRO: pm2 nao encontrado"
  exit 1
fi

PM2_JSON="$(pm2 jlist)"
printf '%s' "$PM2_JSON" > "$OUT/pm2-jlist.raw.json"
MCP_ID="$(printf '%s' "$PM2_JSON" | node -e 'const fs=require("fs"); const data=JSON.parse(fs.readFileSync(0,"utf8")); const p=data.find(x=>x.name==="MCP-CentralDark"); if(!p) process.exit(2); console.log(p.pm_id);')"
log "MCP_ID=$MCP_ID"

# === Pré-check de saúde ===
log "Pre-check: verificando $MCP_HEALTH_URL"
if health_check; then
  log "OK: MCP saudavel antes do restart."
  PRE_OK=1
else
  log "ATENCAO: MCP NAO esta respondendo /health antes do restart."
  log "Continuando mesmo assim (o restart pode justamente curar), mas com olho no pos-check."
  PRE_OK=0
fi

ALLOW="CloneDeck-Supabase-Sync,MultiZap-TelegramBot,MCP-CentralDark"
echo "PM2_ALLOWED_RESTART=$ALLOW" > "$OUT/env.sanitizado.txt"
log "Allowlist sanitizada que sera aplicada:"
cat "$OUT/env.sanitizado.txt" | tee -a "$OUT/resumo.txt"

log "#FASE 04/05 — Reiniciando MCP-CentralDark com allowlist atualizada"
export PM2_ALLOWED_RESTART="$ALLOW"
pm2 restart MCP-CentralDark --update-env > "$OUT/pm2-restart.log" 2>&1
pm2 save > "$OUT/pm2-save.log" 2>&1 || true

# === Pós-check com retry ===
log "Pos-check: aguardando 8s pro processo subir..."
sleep 8

POS_OK=0
for tentativa in 1 2 3; do
  if health_check; then
    log "OK: /health respondeu 200 na tentativa $tentativa."
    POS_OK=1
    break
  else
    log "Tentativa $tentativa falhou. Esperando 4s..."
    sleep 4
  fi
done

pm2 describe MCP-CentralDark --no-color > "$OUT/pm2-describe.txt" 2>&1
pm2 env "$MCP_ID" > "$OUT/pm2-env.raw.txt" 2>&1 || true
grep -E 'PM2_ALLOWED_RESTART|MCP_PORT|MCP_PUBLIC_URL' "$OUT/pm2-env.raw.txt" > "$OUT/pm2-env.sanitizado.txt" 2>/dev/null || true
cat "$OUT/pm2-env.sanitizado.txt" | tee -a "$OUT/resumo.txt" || true

if [ "$POS_OK" = "1" ]; then
  STATUS="OK"
  log "OK: MCP-CentralDark reiniciado com allowlist controlada e respondendo /health."
else
  STATUS="ERRO"
  log "ALERTA: MCP-CentralDark NAO respondeu /health apos 3 tentativas. Iniciando rollback."
  # Rollback: restart limpo sem --update-env (volta env anterior do dump PM2)
  pm2 restart MCP-CentralDark > "$OUT/pm2-rollback.log" 2>&1 || true
  sleep 6
  if health_check; then
    log "Rollback OK: MCP voltou a responder /health (mas allowlist nao foi aplicada)."
    STATUS="ROLLBACK_OK"
  else
    log "Rollback FALHOU: MCP segue fora. Investigar logs em /root/CentralDark/logs/mcp/err.log"
    STATUS="ROLLBACK_FALHOU"
  fi
  # Salva ultimas 60 linhas do err.log pra facilitar diagnostico
  tail -n 60 /root/CentralDark/logs/mcp/err.log > "$OUT/mcp-err-tail.log" 2>/dev/null || true
fi

cat > "$OUT/reports/RESUMO_PARA_CHATGPT.txt" <<EOF
STATUS: $STATUS
#FASE 04/05 — MCP allowlist aplicada
Pre-check: $([ "$PRE_OK" = "1" ] && echo "saudavel" || echo "ja estava fora")
Pos-check: $([ "$POS_OK" = "1" ] && echo "saudavel" || echo "FORA — rollback executado")
Acao: MCP-CentralDark reiniciado com PM2_ALLOWED_RESTART incluindo MCP-CentralDark.
Relatorio: $OUT
Proximo teste: vps_list_allowed_services deve mostrar MCP-CentralDark.
EOF

log "Fim. STATUS=$STATUS"
[ "$STATUS" = "OK" ] || [ "$STATUS" = "ROLLBACK_OK" ]
