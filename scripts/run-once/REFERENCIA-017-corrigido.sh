#!/bin/bash
# ══════════════════════════════════════════════════════════════
# REFERÊNCIA: 017 corrigido — Sync VPS seguro
#
# Este script NÃO está na fila run-once.
# O 017 original já foi executado manualmente em 2026-05-31.
# Esta versão corrigida serve como referência para futuros scripts.
#
# Correções aplicadas em relação ao original:
# 1. Bot build: fallback npm quando bun não existe (exit 127)
# 2. PM2: detecta vazio e faz resurrect antes de continuar
# 3. Gateway: não declara sucesso se PM2 estiver vazio
# 4. Status final: 502 é tratado como FALHA, não ignorado
# 5. Relatório: mensagem honesta ("concluído com erros")
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="/root/Multizap/apps/clone-deck"
GATEWAY_SRC="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway"
GATEWAY_DST="/root/Multizap/gateway"
PUBLIC_ROOT="/var/www/multizap"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/sync-vps-seguro"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_PREFIX="[ref-017]"
STATUS_FINAL="ok"  # muda para "falha" se algo crítico quebrar

mkdir -p "$REV"/{antes,depois,backups,logs}
exec > >(tee -a "$REV/logs/execucao-completa.log") 2>&1

say()  { echo "$LOG_PREFIX $*"; }
hr()   { echo "──────────────────────────────────────────────"; }

say "══════════════════════════════════════════════════"
say "[REF] Sync VPS Seguro (017 corrigido)"
say "Data: $TIMESTAMP"
say "══════════════════════════════════════════════════"

# ── 1. VERIFICAR PM2 ──────────────────────────────
say ">> [1/9] Verificando PM2..."
pm2 list --no-color > "$REV/antes/pm2-list.txt" 2>&1
PM2_ONLINE=$(grep -c "online" "$REV/antes/pm2-list.txt" 2>/dev/null || echo "0")
say "PM2 online: $PM2_ONLINE processos"

if [ "$PM2_ONLINE" -eq 0 ]; then
  say "⚠️ PM2 vazio. Executando pm2 resurrect..."
  pm2 resurrect 2>/dev/null || true
  sleep 3
  pm2 list --no-color > "$REV/antes/pm2-apos-resurrect.txt" 2>&1
  PM2_ONLINE=$(grep -c "online" "$REV/antes/pm2-apos-resurrect.txt" 2>/dev/null || echo "0")
  say "PM2 após resurrect: $PM2_ONLINE processos"
  if [ "$PM2_ONLINE" -eq 0 ]; then
    say "❌ PM2 continua vazio. Abortando."
    STATUS_FINAL="falha"
    exit 1
  fi
fi

# ── 2. GIT PULL ────────────────────────────────────
say ">> [2/9] Git pull..."
cd "$CLONE_DECK" 2>/dev/null || { say "❌ Repo não encontrado"; STATUS_FINAL="falha"; exit 1; }
git fetch origin main 2>&1 | tee -a "$REV/logs/git-fetch.log"
git pull origin main 2>&1 | tee -a "$REV/logs/git-pull.log" || true
COMMIT_ATUAL=$(git log --oneline -1 2>/dev/null || echo "desconhecido")
say "Commit: $COMMIT_ATUAL"

# ── 3. LANDING PAGE ────────────────────────────────
say ">> [3/9] Landing page..."
LANDING_SRC="apps/web/index.html"
HAS_SCRIPT=$(grep -c "ALLOWED_PATHS" "$LANDING_SRC" 2>/dev/null || echo "0")
if [ "$HAS_SCRIPT" -gt 0 ]; then
  cp "$LANDING_SRC" "$PUBLIC_ROOT/web/index.html" 2>/dev/null || true
  cp "$LANDING_SRC" "$PUBLIC_ROOT/index.html" 2>/dev/null || true
  say "✅ Landing atualizada ($HAS_SCRIPT ocorrências)"
else
  say "⚠️ Landing sem ALLOWED_PATHS"
fi

# ── 4. BUILD BOT ──────────────────────────────────
say ">> [4/9] Bot build..."
cd "$CLONE_DECK/apps/bot" 2>/dev/null || { say "❌ apps/bot não encontrado"; STATUS_FINAL="falha"; }
BOT_OK=false

# Detecção com fallback: tenta npm se bun não existir
if command -v bun &>/dev/null && [ -f "bun.lock" -o -f "bun.lockb" ]; then
  say "Usando bun..."
  bun install --silent > "$REV/logs/bot-install.log" 2>&1 || true
  bun run build > "$REV/logs/bot-build.log" 2>&1
  BUILD_EXIT=$?
else
  say "Usando npm..."
  npm install --silent > "$REV/logs/bot-install.log" 2>&1 || true
  npm run build > "$REV/logs/bot-build.log" 2>&1
  BUILD_EXIT=$?
fi

if [ -d "dist" ] && [ "$BUILD_EXIT" -eq 0 ]; then
  BOT_OK=true
  DIST_FILES=$(find dist -type f | wc -l)
  mkdir -p "$PUBLIC_ROOT/bot"
  cp -a dist/* "$PUBLIC_ROOT/bot/"
  say "✅ Bot build OK ($DIST_FILES arquivos)"
else
  say "❌ Bot build falhou (exit=$BUILD_EXIT)"
  STATUS_FINAL="falha"
fi

# ── 5. GATEWAY ────────────────────────────────────
say ">> [5/9] Gateway..."
cd "$CLONE_DECK"
GATEWAY_OK=false

if [ -d "$GATEWAY_SRC" ]; then
  mkdir -p "$GATEWAY_DST"
  rsync -a --delete "$GATEWAY_SRC/" "$GATEWAY_DST/" > "$REV/logs/gateway-rsync.log" 2>&1
  cd "$GATEWAY_DST"
  [ -f "package.json" ] && npm install --silent > "$REV/logs/gateway-install.log" 2>&1 || true

  # Verifica PM2 antes de reiniciar
  HAS_GW=$(pm2 list --no-color 2>/dev/null | grep -c "MultiZap-Gateway" || echo "0")
  if [ "$HAS_GW" -gt 0 ]; then
    pm2 restart MultiZap-Gateway > /dev/null 2>&1
    sleep 2
    GW_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:3100/health" 2>/dev/null || echo "000")
    if [ "$GW_CODE" = "200" ]; then
      GATEWAY_OK=true
      say "✅ Gateway OK (health $GW_CODE)"
    else
      say "⚠️ Gateway reiniciado mas health=$GW_CODE"
    fi
  else
    say "⚠️ MultiZap-Gateway não está no PM2"
  fi
fi

# ── 6. CADDY ──────────────────────────────────────
say ">> [6/9] Caddy..."
Caddy_OK=false
if caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile > "$REV/logs/caddy-validate.log" 2>&1; then
  systemctl reload caddy > "$REV/logs/caddy-reload.log" 2>&1 && Caddy_OK=true && say "✅ Caddy recarregado" || say "⚠️ Caddy reload falhou"
else
  say "❌ Caddyfile inválido"
fi

# ── 7. TESTAR URLs ────────────────────────────────
say ">> [7/9] Testando URLs..."
sleep 3
ERROS_URL=0
for url in "https://multizap.dev" "https://bot.multizap.dev" "https://crm.multizap.dev" "https://proxy.multizap.dev/health" "https://hook.multizap.dev/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 15 "$url" 2>/dev/null || echo "000")
  SIZE=$(curl -sk -o /dev/null -w "%{size_download}" --connect-timeout 10 "$url" 2>/dev/null || echo "0")
  if [ "$CODE" = "200" ]; then
    say "  ✅ $url → $CODE ($SIZE bytes)"
  else
    say "  ❌ $url → $CODE ($SIZE bytes)"
    ERROS_URL=$((ERROS_URL+1))
    STATUS_FINAL="falha"
  fi
done

# ── 8. VALIDAÇÃO FINAL ───────────────────────────
say ">> [8/9] Validação final..."

# Verifica se PM2 ainda está vivo
pm2 list --no-color > "$REV/depois/pm2-list.txt" 2>&1
PM2_FINAL=$(grep -c "online" "$REV/depois/pm2-list.txt" 2>/dev/null || echo "0")
if [ "$PM2_FINAL" -eq 0 ]; then
  say "❌ PM2 vazio ao final. Tentando resurrect..."
  pm2 resurrect 2>/dev/null || true
  sleep 3
  pm2 list --no-color > "$REV/depois/pm2-resurrect.txt" 2>&1
  PM2_FINAL=$(grep -c "online" "$REV/depois/pm2-resurrect.txt" 2>/dev/null || echo "0")
  [ "$PM2_FINAL" -eq 0 ] && STATUS_FINAL="falha"
fi
pm2 save > /dev/null 2>&1

# ── 9. RELATÓRIO ─────────────────────────────────
say ">> [9/9] Relatório..."

if [ "$STATUS_FINAL" = "falha" ]; then
  RESUMO_STATUS="❌ CONCLUÍDO COM ERROS"
elif [ "$ERROS_URL" -gt 0 ]; then
  RESUMO_STATUS="⚠️ PARCIALMENTE CONCLUÍDO"
else
  RESUMO_STATUS="✅ CONCLUÍDO"
fi

cat > "$REV/resumo.md" << RESUMO
# Referência: Sync VPS Seguro (017 corrigido)

**Data:** $TIMESTAMP
**Status:** $RESUMO_STATUS
**Revisão:** $REV

## Resultado

| Etapa | Status |
|-------|--------|
| PM2 | $([ "$PM2_FINAL" -gt 0 ] && echo "✅ $PM2_FINAL processos" || echo "❌ VAZIO") |
| Git pull | ✅ $COMMIT_ATUAL |
| Landing page | $([ "$HAS_SCRIPT" -gt 0 ] && echo "✅" || echo "⚠️") |
| Bot build | $([ "$BOT_OK" = true ] && echo "✅" || echo "❌") |
| Gateway | $([ "$GATEWAY_OK" = true ] && echo "✅" || echo "❌") |
| Caddy | $([ "$Caddy_OK" = true ] && echo "✅" || echo "❌") |
| URLs | $([ "$ERROS_URL" -eq 0 ] && echo "✅ 0 erros" || echo "❌ $ERROS_URL erros") |

## Testes de URL

$(for url in "multizap.dev" "bot.multizap.dev" "crm.multizap.dev" "proxy.multizap.dev/health" "hook.multizap.dev/health"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "https://$url" 2>/dev/null || echo "000")
  echo "- https://$url → $CODE"
done)

## Próximo passo

Corrigir build do bot (npm) e CRM SSR.
RESUMO

say "══════════════════════════════════════════════════"
say " $RESUMO_STATUS"
say " 📁 $REV"
say "══════════════════════════════════════════════════"