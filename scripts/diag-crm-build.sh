#!/bin/bash
# ══════════════════════════════════════════════════════════════
# DIAGNÓSTICO DO BUILD DO CRM
# Roda na VPS via post-deploy. Captura TODOS os erros reais.
# Publica resultado no repo via branch diagnostics/crm-build-*
# NÃO expõe secrets.
# ══════════════════════════════════════════════════════════════
set -uo pipefail

CLONE_DECK="${CLONE_DECK:-/root/Multizap/apps/clone-deck}"
CRM_DIR="$CLONE_DECK/apps/crm"
REPORT="/tmp/crm-build-diag-$(date +%Y%m%d%H%M%S).md"
BRANCH="diagnostics/crm-build-$(date +%Y%m%d%H%M%S)"
LOG="/var/log/clone-deck-crm-build-diag.log"

ts() { date '+%Y-%m-%d %H:%M:%S'; }

cat > "$REPORT" << HEADER
# Diagnóstico do Build CRM — $(ts)
HEADER

echo "" >> "$REPORT"

# 1. MEMÓRIA E SWAP
echo "## 1. Memória e Swap" >> "$REPORT"
echo '```' >> "$REPORT"
free -h >> "$REPORT" 2>&1
echo "" >> "$REPORT"
swapon --show >> "$REPORT" 2>&1 || echo "Sem swap ativo" >> "$REPORT"
echo "" >> "$REPORT"
echo "OOM recentes:" >> "$REPORT"
dmesg -T 2>/dev/null | grep -i -E "killed|oom" | tail -5 >> "$REPORT" || echo "Nenhum OOM" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 2. CRIAR SWAP SE NECESSÁRIO
echo "## 2. Swap Setup" >> "$REPORT"
MEM_FREE=$(awk '/MemAvailable/{print int($2/1024)}' /proc/meminfo 2>/dev/null || echo 0)
SWAP_ACTIVE=$(swapon --show --noheadings 2>/dev/null | wc -l || echo 0)
echo "RAM livre: ${MEM_FREE}MB, Swap ativo: ${SWAP_ACTIVE}" >> "$REPORT"

if [ "$MEM_FREE" -lt 3000 ] && [ "$SWAP_ACTIVE" -eq 0 ]; then
  echo "Criando swap de 4GB..." >> "$REPORT"
  SWAP_FILE="/tmp/crm-build-swap"
  fallocate -l 4G "$SWAP_FILE" 2>/dev/null || dd if=/dev/zero of="$SWAP_FILE" bs=1M count=4096 status=none 2>/dev/null
  chmod 600 "$SWAP_FILE"
  mkswap "$SWAP_FILE" >> "$REPORT" 2>&1
  swapon "$SWAP_FILE" >> "$REPORT" 2>&1
  echo "Swap ativado:" >> "$REPORT"
  free -h >> "$REPORT" 2>&1
else
  echo "Swap OK ou RAM suficiente, prosseguindo" >> "$REPORT"
fi
echo "" >> "$REPORT"

# 3. VERSÕES
echo "## 3. Versões" >> "$REPORT"
echo '```' >> "$REPORT"
echo "node: $(node --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "npm: $(npm --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo "bun: $(bun --version 2>/dev/null || echo 'NOT FOUND')" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 4. PASTA CRM
echo "## 4. Pasta CRM" >> "$REPORT"
echo '```' >> "$REPORT"
echo "Existe: $([ -d "$CRM_DIR" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo "package.json: $([ -f "$CRM_DIR/package.json" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo "bun.lock: $([ -f "$CRM_DIR/bun.lock" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo "package-lock.json: $([ -f "$CRM_DIR/package-lock.json" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo "node_modules: $([ -d "$CRM_DIR/node_modules" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo "dist: $([ -d "$CRM_DIR/dist" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo ".output: $([ -d "$CRM_DIR/.output" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo ".vinxi: $([ -d "$CRM_DIR/.vinxi" ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 5. SCRIPTS DISPONÍVEIS
echo "## 5. Scripts do package.json" >> "$REPORT"
echo '```json' >> "$REPORT"
python3 -c "
import json
with open('$CRM_DIR/package.json') as f: d=json.load(f)
print(json.dumps(d.get('scripts',{}), indent=2))
" >> "$REPORT" 2>&1
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 6. INSTALAR DEPENDÊNCIAS
echo "## 6. Instalação de dependências" >> "$REPORT"
echo '```' >> "$REPORT"
cd "$CRM_DIR" || { echo "ERRO: não conseguiu entrar em $CRM_DIR" >> "$REPORT"; exit 1; }

# Sempre usar npm para CRM (bun falha com @lovable.dev plugins)
  echo "Usando npm install (forçado)..." >> "$REPORT"
  npm install --include=dev 2>&1 | tail -20 >> "$REPORT"
  INSTALL_CODE=$?
  echo "Usando npm install..." >> "$REPORT"
  if [ -f package-lock.json ]; then
    npm ci 2>&1 | tail -20 >> "$REPORT"
    npm install 2>&1 | tail -20 >> "$REPORT"
  INSTALL_CODE=$?
fi
echo "" >> "$REPORT"
echo "Install exit code: $INSTALL_CODE" >> "$REPORT"
echo "node_modules existe agora: $([ -d node_modules ] && echo 'SIM' || echo 'NAO')" >> "$REPORT"
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 7. TENTAR BUILD (COM ERRO COMPLETO)
echo "## 7. Build do CRM" >> "$REPORT"
echo '```' >> "$REPORT"
echo "Rodando: NODE_OPTIONS=--max-old-space-size=4096 npm run build" >> "$REPORT"
echo "Início: $(ts)" >> "$REPORT"

NODE_OPTIONS=--max-old-space-size=4096 timeout 300 npm run build >> "$REPORT" 2>&1
BUILD_CODE=$?

echo "" >> "$REPORT"
echo "Fim: $(ts)" >> "$REPORT"
echo "Build exit code: $BUILD_CODE" >> "$REPORT"

if [ "$BUILD_CODE" -eq 137 ]; then
  echo "*** BUILD KILLED (code 137 = OOM Killed) ***" >> "$REPORT"
  echo "Mesmo com swap, memória insuficiente" >> "$REPORT"
elif [ "$BUILD_CODE" -eq 124 ]; then
  echo "*** BUILD TIMEOUT (mais de 5 minutos) ***" >> "$REPORT"
elif [ "$BUILD_CODE" -ne 0 ]; then
  echo "*** BUILD FALHOU (code $BUILD_CODE) ***" >> "$REPORT"
fi

echo "" >> "$REPORT"
echo "Saída do build existe:" >> "$REPORT"
for d in dist .output .vinxi build; do
  [ -d "$CRM_DIR/$d" ] && echo "  $d: SIM ($(du -sh "$CRM_DIR/$d" 2>/dev/null | cut -f1))" >> "$REPORT" || echo "  $d: NAO" >> "$REPORT"
done
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 8. MEMÓRIA APÓS BUILD
echo "## 8. Memória após build" >> "$REPORT"
echo '```' >> "$REPORT"
free -h >> "$REPORT" 2>&1
echo '```' >> "$REPORT"
echo "" >> "$REPORT"

# 9. REMOVER SWAP TEMPORÁRIO
SWAP_FILE="/tmp/crm-build-swap"
if [ -f "$SWAP_FILE" ]; then
  swapoff "$SWAP_FILE" 2>/dev/null || true
  rm -f "$SWAP_FILE" 2>/dev/null || true
  echo "Swap temporário removido" >> "$REPORT"
fi

# 10. SE BUILD OK, TENTAR PREVIEW
if [ "$BUILD_CODE" -eq 0 ]; then
  echo "## 9. Teste de preview" >> "$REPORT"
  echo '```' >> "$REPORT"
  pm2 delete CloneDeck-CRM >/dev/null 2>&1 || true
  
  if [ -d "$CRM_DIR/.output" ] || [ -d "$CRM_DIR/dist" ]; then
    pm2 start npm --name CloneDeck-CRM --cwd "$CRM_DIR" -- run preview -- --host 127.0.0.1 --port 3010 >/dev/null 2>&1
    sleep 5
    PREVIEW_CODE=$(curl -sk -o /dev/null -w "%{http_code}" --connect-timeout 5 "http://127.0.0.1:3010" 2>/dev/null)
    echo "Preview HTTP: $PREVIEW_CODE" >> "$REPORT"
    if [ "$PREVIEW_CODE" = "200" ]; then
      echo "*** CRM PREVIEW FUNCIONANDO! ***" >> "$REPORT"
    else
      echo "Preview não respondeu, verificando PM2:" >> "$REPORT"
      pm2 logs CloneDeck-CRM --nostream --lines 15 >> "$REPORT" 2>&1
    fi
  fi
  echo '```' >> "$REPORT"
fi

echo "" >> "$REPORT"
echo "---" >> "$REPORT"
echo "Fim do diagnóstico: $(ts)" >> "$REPORT"


# SANITIZAR RELATÓRIO — remover qualquer secret antes de publicar
sanitize_report() {
  local file="$1"
  # Mascarar tokens longos (JWT, API keys, PATs)
  sed -i -E 's/eyJ[A-Za-z0-9_-]{20,}/***JWT_REDACTED***/g' "$file"
  sed -i -E 's/ghp_[A-Za-z0-9]{30,}/***GH_TOKEN_REDACTED***/g' "$file"
  sed -i -E 's/sb_[a-z]+_[A-Za-z0-9_-]{20,}/***SUPABASE_KEY_REDACTED***/g' "$file"
  sed -i -E 's/sk_[a-z]+_[A-Za-z0-9]{20,}/***STRIPE_KEY_REDACTED***/g' "$file"
  sed -i -E 's/whsec_[A-Za-z0-9]{20,}/***WEBHOOK_SECRET_REDACTED***/g' "$file"
  # Mascarar URLs com credenciais (postgres://, https://user:pass@)
  sed -i -E 's|postgres://[^@]+@|postgres://***:***@|g' "$file"
  sed -i -E 's|https://[^:]+:[^@]+@|https://***:***@|g' "$file"
  # Mascarar valores de .env inline (KEY=valor_longo)
  sed -i -E 's/(SUPABASE_SERVICE_ROLE_KEY=).{10,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(SUPABASE_ANON_KEY=).{10,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(WEBHOOK_SECRET=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(DATABASE_URL=).{10,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(GATEWAY_SERVER_TOKEN=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(MULTIZAP_GATEWAY_TOKEN=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(TELEGRAM_BOT_TOKEN=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(WUZAPI_ADMIN_TOKEN=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(SECRET=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(PASSWORD=).{5,}/\1***REDACTED***/g' "$file"
  sed -i -E 's/(API_KEY=).{5,}/\1***REDACTED***/g' "$file"
  # Mascarar qualquer string que pareça token (32+ chars alfanuméricos seguidos)
  sed -i -E 's/[A-Za-z0-9_-]{40,}/***LONG_TOKEN_REDACTED***/g' "$file"
  # Remover linhas que contenham .env content dumps
  sed -i '/^[A-Z_]*SECRET=/d' "$file"
  sed -i '/^[A-Z_]*TOKEN=/d' "$file"
  sed -i '/^[A-Z_]*PASSWORD=/d' "$file"
}

# PUBLICAR NO GITHUB
cd "$CLONE_DECK" || exit 1

# Tentar push via write key
if ssh -o ConnectTimeout=3 -o BatchMode=yes -T git@github-clone-deck-write 2>&1 | grep -qi "success\|authenticated"; then
  PUSH_REMOTE="git@github-clone-deck-write:segredounlock/clone-deck.git"
else
  PUSH_REMOTE="$(git remote get-url origin 2>/dev/null)"
fi

if [ -n "$PUSH_REMOTE" ]; then
  git checkout -b "$BRANCH" 2>/dev/null || true
  mkdir -p diagnostics
  cp "$REPORT" "diagnostics/crm-build-report.md"
  sanitize_report "diagnostics/crm-build-report.md"
  git add diagnostics/crm-build-report.md
  git -c user.name="VPS-Diag" -c user.email="diag@multizap.dev" commit -m "diag: CRM build diagnostic $(date +%Y%m%d%H%M%S)" 2>/dev/null
  git push "$PUSH_REMOTE" "$BRANCH" 2>/dev/null || true
  git checkout main 2>/dev/null || true
  echo "[DIAG-CRM] Report publicado em $BRANCH" >> "$LOG"
else
  sanitize_report "$REPORT"
  cp "$REPORT" "$CLONE_DECK/diagnostics-crm-build.md"
  echo "[DIAG-CRM] Report salvo localmente" >> "$LOG"
fi
