#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/force-mcp-build-restart"
mkdir -p "$OUT"
chmod 700 "$OUT"

log() { echo "$*" | tee -a "$OUT/resumo.txt"; }

log "════════════════════════════════════════════════════════"
log "== FORCE MCP BUILD + RESTART (run-once seguro v3) =="
log "Relatório: $OUT"
log "Data: $(date '+%Y-%m-%d %H:%M:%S')"
log "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
log "Commit HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
log "════════════════════════════════════════════════════════"

# === 1. Verificações de ambiente ===
if ! command -v pm2 >/dev/null 2>&1; then
    log "ERRO: pm2 não encontrado no PATH"
    exit 1
fi

# Extrai MCP_DIR da forma correta (evita dirname quebrando)
MCP_DIR="$(
  pm2 jlist | node -e '
    const fs = require("fs");
    const path = require("path");
    const data = JSON.parse(fs.readFileSync(0, "utf8"));
    const p = data.find(x => x.name === "MCP-CentralDark");
    if (!p) process.exit(2);
    const env = p.pm2_env || {};
    console.log(env.pm_cwd || path.dirname(env.pm_exec_path || ""));
  '
)"

if [ -z "$MCP_DIR" ] || [ ! -d "$MCP_DIR" ]; then
    log "ERRO: MCP_DIR inválido ou não encontrado → $MCP_DIR"
    exit 1
fi

log "MCP_DIR detectado: $MCP_DIR"

ENV_FILE="$MCP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    log "AVISO: .env não existia. Criando vazio com permissão 600"
    install -m 600 /dev/null "$ENV_FILE"
fi

cp -a "$ENV_FILE" "$OUT/.env.bak" 2>/dev/null || true

# === 2. Forçar build ===
log ""
log "→ Iniciando build do MCP..."
cd "$MCP_DIR"

if [ ! -f package.json ]; then
    log "ERRO: package.json não encontrado em $MCP_DIR"
    exit 1
fi

npm run build > "$OUT/npm-build.log" 2>&1 || {
    log "ERRO: Build falhou. Ver detalhes em: $OUT/npm-build.log"
    exit 1
}

log "✅ Build concluído com sucesso"

# === 3. Restart controlado ===
log ""
log "→ Reiniciando MCP-CentralDark com --update-env..."

pm2 restart MCP-CentralDark --update-env > "$OUT/pm2-restart.log" 2>&1
pm2 save > "$OUT/pm2-save.log" 2>&1 || true

sleep 6

# === 4. Validação de saúde (porta correta) ===
MCP_PORT="${MCP_PORT:-9100}"
log ""
log "→ Validando saúde do MCP na porta ${MCP_PORT}..."

HEALTH_URL="http://127.0.0.1:${MCP_PORT}/health"

if curl -sf --max-time 8 "$HEALTH_URL" > "$OUT/health.json" 2>/dev/null; then
    log "✅ /health OK na porta ${MCP_PORT}"
    cat "$OUT/health.json" | tee -a "$OUT/resumo.txt"
else
    log "⚠️  /health falhou ou MCP ainda não respondeu na porta ${MCP_PORT}"
    log "   Verifique logs: pm2 logs MCP-CentralDark --lines 50"
fi

# === 5. Verificação final do allowlist ===
log ""
log "→ Verificando se MCP-CentralDark está no allowlist de restart..."

pm2 env MCP-CentralDark 2>/dev/null | grep -E "PM2_ALLOWED_RESTART|MCP_PORT" | \
    sed 's/.*\(token\|secret\|key\|password\)[^ ]*//I' > "$OUT/allowlist-final.txt" || true

if grep -q "MCP-CentralDark" "$OUT/allowlist-final.txt" 2>/dev/null; then
    log "✅ MCP-CentralDark está presente no PM2_ALLOWED_RESTART"
else
    log "⚠️  MCP-CentralDark NÃO encontrado no allowlist (pode precisar rodar o enable primeiro)"
fi

log ""
log "════════════════════════════════════════════════════════"
log "✅ Tarefa concluída com sucesso"
log "Relatório completo salvo em: $OUT"
log "════════════════════════════════════════════════════════════════════"