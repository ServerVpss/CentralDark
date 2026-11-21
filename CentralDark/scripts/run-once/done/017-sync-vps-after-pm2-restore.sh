#!/bin/bash
# ══════════════════════════════════════════════════════════════
# RUN-ONCE 017: Sync VPS após restore do PM2
#
# Objetivo: Atualizar código, landing page, bot, gateway e caddy
#           após pm2 resurrect na VPS.
#
# Regras:
#   - Não usar pm2 restart all
#   - Não apagar secrets
#   - Não imprimir tokens
#   - Fazer backup antes de alterar
#   - Validar Caddy antes de recarregar
#   - Usar rsync para gateway (não cp -a)
# ══════════════════════════════════════════════════════════════
set -uo pipefail

# ══════════════════════════════════════════════════════════════
# CONFIGURAÇÕES
# ══════════════════════════════════════════════════════════════
CLONE_DECK="/root/Multizap/apps/clone-deck"
GATEWAY_SRC="$CLONE_DECK/apps/crm/atendimento-whatsapp-gateway-deploy/gateway"
GATEWAY_DST="/root/Multizap/gateway"
PUBLIC_ROOT="/var/www/multizap"
REV="/root/Multizap/revisoes/$(date +%Y%m%d-%H%M%S)/sync-vps-after-pm2-restore"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_PREFIX="[017]"

mkdir -p "$REV"/{antes,depois,backups,logs}

# ══════════════════════════════════════════════════════════════
# FUNÇÕES
# ══════════════════════════════════════════════════════════════
say()  { echo "$LOG_PREFIX $*"; }
log()  { echo "[$TIMESTAMP] $*" >> "$REV/resumo.md"; }
ts()   { echo "[$(date '+%H:%M:%S')] $*"; }
hr()   { echo "──────────────────────────────────────────────"; }

# Só loga que a variável existe, nunca o valor
safe_var() {
  local varname="$1"
  local val="${!varname:-}"
  if [ -n "$val" ]; then
    echo "$varname=EXISTE (${#val} caracteres)"
  else
    echo "$varname=NAO_DEFINIDA"
  fi
}

# ══════════════════════════════════════════════════════════════
# INÍCIO
# ══════════════════════════════════════════════════════════════
exec > >(tee -a "$REV/logs/execucao-completa.log") 2>&1

say "══════════════════════════════════════════════════"
say " RUN-ONCE 017: Sync VPS após restore do PM2"
say " Data: $(date)"
say "══════════════════════════════════════════════════"
say ""

# ══════════════════════════════════════════════════════════════
# 1. SALVAR ESTADO ANTES
# ══════════════════════════════════════════════════════════════
say ">> [1/9] Salvando estado ANTES das alterações..."

cd "$CLONE_DECK" 2>/dev/null || {
  say "ERRO: $CLONE_DECK não encontrado"
  exit 1
}

hr > "$REV/antes/estado-antes.md"
echo "# Estado Antes das Alterações" >> "$REV/antes/estado-antes.md"
echo "Data: $TIMESTAMP" >> "$REV/antes/estado-antes.md"
echo "" >> "$REV/antes/estado-antes.md"

echo "## Commit atual" >> "$REV/antes/estado-antes.md"
git log --oneline -3 >> "$REV/antes/estado-antes.md" 2>&1
git log --oneline -1 > "$REV/antes/commit-atual.txt" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Git status" >> "$REV/antes/estado-antes.md"
git status --short --branch >> "$REV/antes/estado-antes.md" 2>&1
git status --short > "$REV/antes/git-status-antes.txt" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Mudanças locais não commitadas" >> "$REV/antes/estado-antes.md"
git diff HEAD > "$REV/antes/diff-local-antes.patch" 2>&1
wc -l < "$REV/antes/diff-local-antes.patch" | xargs echo "Linhas no diff:" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## PM2 list" >> "$REV/antes/estado-antes.md"
pm2 list --no-color >> "$REV/antes/pm2-list-antes.txt" 2>&1
cat "$REV/antes/pm2-list-antes.txt" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Portas" >> "$REV/antes/estado-antes.md"
ss -ltnp >> "$REV/antes/portas-antes.txt" 2>&1
ss -ltnp | grep -E ':80|:443|:3000|:3010|:3100|:5000|:8081|:9003' >> "$REV/antes/estado-antes.md" 2>&1

echo "" >> "$REV/antes/estado-antes.md"
echo "## Caddy status" >> "$REV/antes/estado-antes.md"
systemctl status caddy --no-pager -l >> "$REV/antes/caddy-status-antes.txt" 2>&1
head -10 "$REV/antes/caddy-status-antes.txt" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Caddyfile" >> "$REV/antes/estado-antes.md"
cat /etc/caddy/Caddyfile > "$REV/antes/Caddyfile.backup" 2>&1
wc -l < "$REV/antes/Caddyfile.backup" | xargs echo "Linhas no Caddyfile:" >> "$REV/antes/estado-antes.md"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Landing page atual" >> "$REV/antes/estado-antes.md"
if [ -f "$PUBLIC_ROOT/web/index.html" ]; then
  LANDING_SIZE=$(wc -c < "$PUBLIC_ROOT/web/index.html")
  LANDING_LINES=$(wc -l < "$PUBLIC_ROOT/web/index.html")
  LANDING_HAS_SCRIPT=$(grep -c "ALLOWED_PATHS" "$PUBLIC_ROOT/web/index.html" 2>/dev/null || echo "0")
  echo "Tamanho: $LANDING_SIZE bytes, $LANDING_LINES linhas" >> "$REV/antes/estado-antes.md"
  echo "Script seguro (ALLOWED_PATHS): $LANDING_HAS_SCRIPT ocorrências" >> "$REV/antes/estado-antes.md"
  cp "$PUBLIC_ROOT/web/index.html" "$REV/antes/landing-page-atual.html"
else
  echo "Landing page AUSENTE em $PUBLIC_ROOT/web/" >> "$REV/antes/estado-antes.md"
fi

echo "" >> "$REV/antes/estado-antes.md"
echo "## Bot dist" >> "$REV/antes/estado-antes.md"
if [ -d "$PUBLIC_ROOT/bot" ]; then
  BOT_FILES=$(find "$PUBLIC_ROOT/bot" -type f 2>/dev/null | wc -l)
  echo "Arquivos em bot: $BOT_FILES" >> "$REV/antes/estado-antes.md"
else
  echo "Bot AUSENTE em $PUBLIC_ROOT/bot" >> "$REV/antes/estado-antes.md"
fi

echo "" >> "$REV/antes/estado-antes.md"
echo "## Gateway destino" >> "$REV/antes/estado-antes.md"
if [ -d "$GATEWAY_DST" ]; then
  GW_SIZE=$(du -sh "$GATEWAY_DST" 2>/dev/null | cut -f1)
  echo "Gateway destino: $GATEWAY_DST ($GW_SIZE)" >> "$REV/antes/estado-antes.md"
else
  echo "Gateway destino AUSENTE" >> "$REV/antes/estado-antes.md"
fi

echo "" >> "$REV/antes/estado-antes.md"
echo "## Secrets (só existência)" >> "$REV/antes/estado-antes.md"
for f in /root/Multizap/secrets/*.env; do
  if [ -f "$f" ]; then
    echo "Secret: $(basename "$f") - $(wc -l < "$f") linhas" >> "$REV/antes/estado-antes.md"
  fi
done

say "✅ Estado ANTES salvo em $REV/antes/"
say ""

# ══════════════════════════════════════════════════════════════
# 2. ATUALIZAR CÓDIGO DO REPOSITÓRIO
# ══════════════════════════════════════════════════════════════
say ">> [2/9] Atualizando código do repositório..."

cd "$CLONE_DECK"

# Salva commit antes
COMMIT_ANTES=$(git log --oneline -1)
echo "$COMMIT_ANTES" > "$REV/commit-antes.txt"

say "Commit atual: $COMMIT_ANTES"

# Fetch seguro
say "Fazendo fetch..."
git fetch origin main 2>&1 | tee -a "$REV/logs/git-fetch.log"

# Verifica se tem mudanças locais
if [ -n "$(git status --short)" ]; then
  say "⚠️ Mudanças locais detectadas! Salvando patch..."
  git diff HEAD > "$REV/mudancas-locais.patch"
  git stash > "$REV/logs/git-stash.log" 2>&1
  MUDANCAS_LOCAIS=true
else
  MUDANCAS_LOCAIS=false
fi

# Pull
say "Fazendo pull..."
git pull origin main 2>&1 | tee -a "$REV/logs/git-pull.log"
PULL_EXIT=$?

if [ $PULL_EXIT -ne 0 ]; then
  say "⚠️ Pull falhou (exit=$PULL_EXIT). Tentando force..."
  git reset --hard origin/main 2>&1 | tee -a "$REV/logs/git-reset.log"
fi

# Restaura stash se havia mudanças locais
if [ "$MUDANCAS_LOCAIS" = true ]; then
  say "Restaurando mudanças locais..."
  git stash pop > "$REV/logs/git-stash-pop.log" 2>&1 || true
fi

COMMIT_DEPOIS=$(git log --oneline -1)
echo "$COMMIT_DEPOIS" > "$REV/commit-depois.txt"

say "Commit depois: $COMMIT_DEPOIS"

echo "" >> "$REV/antes/estado-antes.md"
echo "## Atualização" >> "$REV/antes/estado-antes.md"
echo "Antes: $COMMIT_ANTES" >> "$REV/antes/estado-antes.md"
echo "Depois: $COMMIT_DEPOIS" >> "$REV/antes/estado-antes.md"

# Salva status depois do pull
git status --short --branch > "$REV/depois/git-status-depois.txt"
git log --oneline -5 > "$REV/depois/commits-recentes.txt"

say "✅ Repositório atualizado"
say ""

# ══════════════════════════════════════════════════════════════
# 3. ATUALIZAR LANDING PAGE
# ══════════════════════════════════════════════════════════════
say ">> [3/9] Atualizando landing page..."

cd "$CLONE_DECK"

LANDING_SRC="apps/web/index.html"
ERRO_LANDING=""

if [ ! -f "$LANDING_SRC" ]; then
  ERRO_LANDING="Arquivo $LANDING_SRC não encontrado"
  say "❌ $ERRO_LANDING"
else
  # Verifica script seguro
  HAS_SCRIPT=$(grep -c "ALLOWED_PATHS" "$LANDING_SRC" 2>/dev/null || echo "0")
  say "Script seguro no source: $HAS_SCRIPT ocorrências"

  if [ "$HAS_SCRIPT" -eq 0 ]; then
    ERRO_LANDING="Landing page no repo não contém ALLOWED_PATHS"
    say "❌ $ERRO_LANDING"
  else
    # Backup dos atuais
    if [ -f "$PUBLIC_ROOT/web/index.html" ]; then
      cp "$PUBLIC_ROOT/web/index.html" "$REV/backups/landing-web-before.html"
    fi
    if [ -f "$PUBLIC_ROOT/index.html" ]; then
      cp "$PUBLIC_ROOT/index.html" "$REV/backups/landing-root-before.html"
    fi

    # Copia para os dois lugares
    mkdir -p "$PUBLIC_ROOT/web"
    cp "$LANDING_SRC" "$PUBLIC_ROOT/web/index.html"
    chmod 644 "$PUBLIC_ROOT/web/index.html"
    say "✅ Copiado para $PUBLIC_ROOT/web/index.html"

    cp "$LANDING_SRC" "$PUBLIC_ROOT/index.html"
    chmod 644 "$PUBLIC_ROOT/index.html"
    say "✅ Copiado para $PUBLIC_ROOT/index.html"

    # Valida
    VALIDACAO=$(grep -c "ALLOWED_PATHS" "$PUBLIC_ROOT/web/index.html" 2>/dev/null || echo "0")
    if [ "$VALIDACAO" -gt 0 ]; then
      say "✅ Validação: $VALIDACAO ocorrências de ALLOWED_PATHS"
      echo "Landing atualizada: OK ($VALIDACAO)" >> "$REV/depois/resultado-landing.txt"
    else
      ERRO_LANDING="ALLOWED_PATHS não encontrado após cópia"
      say "❌ $ERRO_LANDING"
    fi
  fi
fi

[ -n "$ERRO_LANDING" ] && echo "ERRO: $ERRO_LANDING" >> "$REV/depois/resultado-landing.txt"
say ""

# ══════════════════════════════════════════════════════════════
# 4. BUILD E PUBLICAR BOT
# ══════════════════════════════════════════════════════════════
say ">> [4/9] Build e publicar Bot..."

cd "$CLONE_DECK/apps/bot" || {
  say "❌ apps/bot não encontrado"
  ERRO_BOT="apps/bot não encontrado"
}

BOT_BUILD_OK=false

if [ -z "${ERRO_BOT:-}" ]; then
  # Detecta package manager
  PKG_MANAGER="npm"
  [ -f "bun.lock" ] || [ -f "bun.lockb" ] && PKG_MANAGER="bun"
  [ -f "yarn.lock" ] && PKG_MANAGER="yarn"

  say "Package manager detectado: $PKG_MANAGER"

  # Install
  say "Instalando dependências..."
  case "$PKG_MANAGER" in
    bun) bun install --silent > "$REV/logs/bot-install.log" 2>&1 ;;
    yarn) yarn install --silent > "$REV/logs/bot-install.log" 2>&1 ;;
    *) npm install --silent > "$REV/logs/bot-install.log" 2>&1 ;;
  esac
  INSTALL_EXIT=$?
  say "Install exit code: $INSTALL_EXIT"

  # Build
  say "Buildando..."
  case "$PKG_MANAGER" in
    bun) bun run build > "$REV/logs/bot-build.log" 2>&1 ;;
    yarn) yarn build > "$REV/logs/bot-build.log" 2>&1 ;;
    *) npm run build > "$REV/logs/bot-build.log" 2>&1 ;;
  esac
  BUILD_EXIT=$?
  say "Build exit code: $BUILD_EXIT"

  # Verifica dist
  if [ -d "dist" ] && [ "$BUILD_EXIT" -eq 0 ]; then
    BOT_BUILD_OK=true
    DIST_FILES=$(find dist -type f 2>/dev/null | wc -l)
    say "✅ Build OK! $DIST_FILES arquivos em dist/"

    # Backup do bot atual
    if [ -d "$PUBLIC_ROOT/bot" ]; then
      BACKUP_BOT="$REV/backups/bot-antes"
      mkdir -p "$BACKUP_BOT"
      cp -a "$PUBLIC_ROOT/bot/." "$BACKUP_BOT/"
      say "✅ Backup do bot atual salvo"
    fi

    # Publica
    mkdir -p "$PUBLIC_ROOT/bot"
    cp -a dist/* "$PUBLIC_ROOT/bot/"
    chmod -R a+rX "$PUBLIC_ROOT/bot/"
    say "✅ Bot publicado em $PUBLIC_ROOT/bot/"

    echo "Build: OK ($DIST_FILES arquivos)" > "$REV/depois/resultado-bot.txt"
  else
    ERRO_BOT="Build falhou (exit=$BUILD_EXIT)"
    say "❌ $ERRO_BOT"
    echo "ERRO: $ERRO_BOT" > "$REV/depois/resultado-bot.txt"
    tail -30 "$REV/logs/bot-build.log" >> "$REV/logs/bot-build-erro.log"
  fi
fi

say ""

# ══════════════════════════════════════════════════════════════
# 5. ATUALIZAR GATEWAY COM RSYNC
# ══════════════════════════════════════════════════════════════
say ">> [5/9] Atualizando Gateway..."

cd "$CLONE_DECK"

ERRO_GATEWAY=""

if [ ! -d "$GATEWAY_SRC" ]; then
  ERRO_GATEWAY="Origem do gateway não encontrada: $GATEWAY_SRC"
  say "❌ $ERRO_GATEWAY"
else
  say "Origem: $GATEWAY_SRC"

  if [ ! -d "$GATEWAY_DST" ]; then
    say "⚠️ Destino não existe. Criando..."
    mkdir -p "$GATEWAY_DST"
  fi

  # Backup do destino
  BACKUP_GW="$REV/backups/gateway-antes"
  mkdir -p "$BACKUP_GW"
  if [ -n "$(ls -A "$GATEWAY_DST" 2>/dev/null)" ]; then
    rsync -a "$GATEWAY_DST/" "$BACKUP_GW/" 2>&1
    BACKUP_GW_SIZE=$(du -sh "$BACKUP_GW" 2>/dev/null | cut -f1)
    say "✅ Backup do gateway salvo ($BACKUP_GW_SIZE)"
  fi

  # Rsync da origem para o destino (com delete para remover arquivos órfãos)
  say "Sincronizando com rsync..."
  rsync -a --delete "$GATEWAY_SRC/" "$GATEWAY_DST/" 2>&1 | tee -a "$REV/logs/gateway-rsync.log"
  RSYNC_EXIT=$?

  if [ $RSYNC_EXIT -eq 0 ]; then
    say "✅ rsync concluído"
  else
    ERRO_GATEWAY="rsync falhou (exit=$RSYNC_EXIT)"
    say "⚠️ $ERRO_GATEWAY"
  fi

  # Instalar dependências no destino
  say "Instalando dependências do gateway..."
  cd "$GATEWAY_DST"
  if [ -f "package.json" ]; then
    npm install --silent > "$REV/logs/gateway-install.log" 2>&1
    INSTALL_EXIT=$?
    say "npm install exit: $INSTALL_EXIT"
  else
    say "⚠️ package.json não encontrado no destino"
  fi

  # Verificar se MultiZap-Gateway existe no PM2
  cd "$CLONE_DECK"
  HAS_GATEWAY=$(pm2 list --no-color 2>/dev/null | grep -c "MultiZap-Gateway" || echo "0")

  if [ "$HAS_GATEWAY" -gt 0 ]; then
    say "✅ MultiZap-Gateway encontrado no PM2. Reiniciando..."
    pm2 restart MultiZap-Gateway > "$REV/logs/gateway-restart.log" 2>&1
    sleep 2

    # Verifica se subiu
    GW_STATUS=$(pm2 list --no-color 2>/dev/null | grep "MultiZap-Gateway" | awk '{print $10}')
    say "Status após restart: $GW_STATUS"
    echo "Gateway: reiniciado (status=$GW_STATUS)" > "$REV/depois/resultado-gateway.txt"
  else
    ERRO_GATEWAY="MultiZap-Gateway não encontrado no PM2"
    say "⚠️ $ERRO_GATEWAY"
    echo "ERRO: $ERRO_GATEWAY" > "$REV/depois/resultado-gateway.txt"
  fi
fi

say ""

# ══════════════════════════════════════════════════════════════
# 6. VALIDAR E RECARREGAR CADDY
# ══════════════════════════════════════════════════════════════
say ">> [6/9] Validando e recarregando Caddy..."

ERRO_CADDY=""

say "Validando Caddyfile..."
caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile > "$REV/logs/caddy-validate.log" 2>&1
VALIDATE_EXIT=$?

if [ $VALIDATE_EXIT -eq 0 ]; then
  say "✅ Caddyfile válido"

  # Backup do Caddyfile atual
  cp /etc/caddy/Caddyfile "$REV/backups/Caddyfile-antes-reload.txt"

  say "Recarregando..."
  systemctl reload caddy > "$REV/logs/caddy-reload.log" 2>&1
  RELOAD_EXIT=$?

  if [ $RELOAD_EXIT -eq 0 ]; then
    say "✅ Caddy recarregado com sucesso"
    echo "Caddy: recarregado OK" > "$REV/depois/resultado-caddy.txt"
  else
    ERRO_CADDY="Recarga do Caddy falhou (exit=$RELOAD_EXIT)"
    say "❌ $ERRO_CADDY"
    echo "ERRO: $ERRO_CADDY" > "$REV/depois/resultado-caddy.txt"
  fi
else
  ERRO_CADDY="Caddyfile inválido! Não recarregando."
  say "❌ $ERRO_CADDY"
  echo "ERRO: $ERRO_CADDY" > "$REV/depois/resultado-caddy.txt"
  cat "$REV/logs/caddy-validate.log"
fi

say ""

# ══════════════════════════════════════════════════════════════
# 7. TESTAR URLs
# ══════════════════════════════════════════════════════════════
say ">> [7/9] Testando URLs..."

sleep 3

echo "# Testes de URL" > "$REV/depois/testes-url.txt"
echo "Data: $TIMESTAMP" >> "$REV/depois/testes-url.txt"
echo "" >> "$REV/depois/testes-url.txt"

TESTAR_URLS=(
  "https://multizap.dev"
  "https://bot.multizap.dev"
  "https://crm.multizap.dev"
  "https://proxy.multizap.dev/health"
  "https://hook.multizap.dev/health"
)

ERROS_URL=0
for url in "${TESTAR_URLS[@]}"; do
  CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null || echo "000")
  SIZE=$(curl -sk -o /dev/null -w "%{size_download}" --connect-timeout 10 "$url" 2>/dev/null || echo "0")

  if [ "$CODE" = "000" ]; then
    ICON="❌"
    ERROS_URL=$((ERROS_URL + 1))
  elif [ "$CODE" = "200" ] || [ "$CODE" = "201" ] || [ "$CODE" = "301" ] || [ "$CODE" = "302" ]; then
    ICON="✅"
  else
    ICON="⚠️"
    ERROS_URL=$((ERROS_URL + 1))
  fi

  echo "$ICON $url → HTTP $CODE ($SIZE bytes)" | tee -a "$REV/depois/testes-url.txt"
done

echo "" >> "$REV/depois/testes-url.txt"
echo "Total de erros: $ERROS_URL" >> "$REV/depois/testes-url.txt"

say "✅ Testes concluídos. $ERROS_URL erro(s)."
say ""

# ══════════════════════════════════════════════════════════════
# 8. SALVAR ESTADO DEPOIS
# ══════════════════════════════════════════════════════════════
say ">> [8/9] Salvando estado DEPOIS..."

cd "$CLONE_DECK"

hr > "$REV/depois/estado-depois.md"
echo "# Estado Depois das Alterações" >> "$REV/depois/estado-depois.md"
echo "Data: $TIMESTAMP" >> "$REV/depois/estado-depois.md"
echo "" >> "$REV/depois/estado-depois.md"

echo "## Commit atual" >> "$REV/depois/estado-depois.md"
git log --oneline -1 >> "$REV/depois/estado-depois.md"

echo "" >> "$REV/depois/estado-depois.md"
echo "## Git status" >> "$REV/depois/estado-depois.md"
git status --short --branch >> "$REV/depois/estado-depois.md"

echo "" >> "$REV/depois/estado-depois.md"
echo "## PM2 list" >> "$REV/depois/estado-depois.md"
pm2 list --no-color >> "$REV/depois/estado-depois.md"

echo "" >> "$REV/depois/estado-depois.md"
echo "## Portas" >> "$REV/depois/estado-depois.md"
ss -ltnp | grep -E ':80|:443|:3000|:3010|:3100|:5000|:8081|:9003' >> "$REV/depois/estado-depois.md" 2>&1

echo "" >> "$REV/depois/estado-depois.md"
echo "## Caddy status" >> "$REV/depois/estado-depois.md"
systemctl status caddy --no-pager -l >> "$REV/depois/caddy-status-depois.txt" 2>&1
head -5 "$REV/depois/caddy-status-depois.txt" >> "$REV/depois/estado-depois.md"

say "✅ Estado DEPOIS salvo em $REV/depois/"
say ""

# ══════════════════════════════════════════════════════════════
# 9. GERAR RELATÓRIO FINAL
# ══════════════════════════════════════════════════════════════
say ">> [9/9] Gerando relatório final..."

cat > "$REV/resumo.md" << RESUMO
# Run-Once 017: Sync VPS após restore do PM2

**Data:** $(date)
**Revisão:** $REV

---

## Resumo

| Etapa | Status |
|-------|--------|
| 1. Estado ANTES | ✅ Salvo |
| 2. Git pull | ✅ $(cat "$REV/commit-antes.txt" 2>/dev/null) → $(cat "$REV/commit-depois.txt" 2>/dev/null) |
| 3. Landing page | $([ -z "${ERRO_LANDING:-}" ] && echo "✅ Atualizada" || echo "❌ $ERRO_LANDING") |
| 4. Bot build | $([ "$BOT_BUILD_OK" = true ] && echo "✅ Buildado e publicado" || echo "❌ ${ERRO_BOT:-}") |
| 5. Gateway | $([ -z "${ERRO_GATEWAY:-}" ] && echo "✅ Atualizado e reiniciado" || echo "❌ $ERRO_GATEWAY") |
| 6. Caddy | $([ -z "${ERRO_CADDY:-}" ] && echo "✅ Validado e recarregado" || echo "❌ $ERRO_CADDY") |
| 7. Testes URL | ✅ $(grep -c '✅' "$REV/depois/testes-url.txt" 2>/dev/null || echo "0") OK / $ERROS_URL erro(s) |
| 8. Estado DEPOIS | ✅ Salvo |

## Testes de URL

$(cat "$REV/depois/testes-url.txt")

## Próximos Passos

- Verificar se mensagens do WhatsApp estão chegando no Supabase
- Verificar webhook do WuzAPI apontando para Gateway :3100
- Se landing page não atualizou, verificar Caddyfile e permissões

---

*Relatório gerado automaticamente pelo run-once 017.*
RESUMO

say "══════════════════════════════════════════════════"
say "✅ RUN-ONCE 017 CONCLUÍDO!"
say "📁 Revisão: $REV"
say "══════════════════════════════════════════════════"
echo ""
echo "=== RESUMO RÁPIDO ==="
grep -E "^[✅❌⚠️]" "$REV/resumo.md" 2>/dev/null || true
echo ""
echo "=== URLs ==="
cat "$REV/depois/testes-url.txt" 2>/dev/null || true
echo ""
echo "=== Próximos passos sugeridos ==="
echo "  - Sehouver erros, verificar logs em $REV/logs/"
echo "  - Rodar run-once 015 para diagnóstico completo"
echo "  - Rodar run-once 012 para sincronizar contatos/mensagens"
