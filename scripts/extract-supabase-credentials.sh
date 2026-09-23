#!/bin/bash
# extract-supabase-credentials.sh — Extrair credenciais via Supabase CLI
# Uso: SUPABASE_ACCESS_TOKEN=xxx ./extract-supabase-credentials.sh
# Output: Credentials para /root/.env

set -euo pipefail

SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
PROJECT_ID="kagejpghnwdfymddwxuf"
SECRETS_DIR="/root/CentralDark/secrets/supabase"
ENV_FILE="/root/.env"
LOG_FILE="/var/log/centraldark-supabase-extract.log"

# ============ FUNÇÕES ============

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $1" | tee -a "$LOG_FILE"
}

error() {
  echo "❌ ERRO: $1" | tee -a "$LOG_FILE"
  exit 1
}

# ============ VALIDAÇÕES ============

[[ -z "$SUPABASE_ACCESS_TOKEN" ]] && error "SUPABASE_ACCESS_TOKEN não fornecido"

log "🔐 Extraindo credenciais Supabase (projeto: $PROJECT_ID)"

# Verificar CLI
if ! command -v supabase &> /dev/null; then
  error "Supabase CLI não instalado. Execute: sudo ./install-supabase-cli.sh"
fi

log "✅ Supabase CLI $(supabase --version) encontrado"

# ============ VALIDAR AUTENTICAÇÃO ============

export SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN"

if ! supabase projects list &> /dev/null; then
  error "Autenticação falhou. Verifique SUPABASE_ACCESS_TOKEN"
fi

log "✅ Autenticação validada"

# ============ EXTRAIR CREDENCIAIS ============

log "📥 Buscando credenciais do projeto..."

# Buscar projeto
PROJECT_JSON=$(supabase projects list --json 2>/dev/null | jq -r ".[] | select(.id==\"$PROJECT_ID\")")

if [[ -z "$PROJECT_JSON" ]]; then
  error "Projeto $PROJECT_ID não encontrado"
fi

SUPABASE_URL=$(echo "$PROJECT_JSON" | jq -r '.api_url // empty')
log "  ✅ SUPABASE_URL = $SUPABASE_URL"

# Buscar API keys (service_role)
log "🔑 Buscando API keys..."

KEYS_JSON=$(supabase projects describe "$PROJECT_ID" --json 2>/dev/null)

SUPABASE_ANON_KEY=$(echo "$KEYS_JSON" | jq -r '.services[] | select(.service=="api") | .default_api_key // empty' 2>/dev/null)
SUPABASE_SERVICE_ROLE=$(echo "$KEYS_JSON" | jq -r '.services[] | select(.service=="api") | .service_role_key // empty' 2>/dev/null)

if [[ -z "$SUPABASE_SERVICE_ROLE" ]]; then
  log "⚠️  Service Role Key não encontrado via CLI. Você pode:"
  log "    1. Ir em: https://app.supabase.com/project/$PROJECT_ID/settings/api"
  log "    2. Copiar 'service_role' key manualmente"
  log "    3. Ou executar: supabase projects describe $PROJECT_ID --json | jq '.services'"
fi

# ============ BUSCAR DATABASE_URL ============

log "🗄️  Buscando DATABASE_URL..."

# Tentar obter via CLI (pode não estar disponível)
DB_PASSWORD=$(echo "$KEYS_JSON" | jq -r '.database_password // empty' 2>/dev/null)

if [[ -z "$DB_PASSWORD" ]]; then
  log "⚠️  DATABASE_URL requer senha do PostgreSQL"
  log "    Você pode obter em: https://app.supabase.com/project/$PROJECT_ID/settings/database"
  DATABASE_URL="postgresql://postgres:PASSWORD_REQUIRED@db.kagejpghnwdfymddwxuf.supabase.co:5432/postgres"
else
  DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@db.kagejpghnwdfymddwxuf.supabase.co:5432/postgres"
  log "  ✅ DATABASE_URL configurado"
fi

# ============ SALVAR EM /root/CentralDark/secrets/ ============

log "💾 Salvando em /root/CentralDark/secrets/supabase/..."

mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"

cat > "$SECRETS_DIR/SUPABASE_URL" << EOF
$SUPABASE_URL
EOF

cat > "$SECRETS_DIR/SUPABASE_ANON_KEY" << EOF
$SUPABASE_ANON_KEY
EOF

[[ -n "$SUPABASE_SERVICE_ROLE" ]] && cat > "$SECRETS_DIR/SUPABASE_KEY" << EOF
$SUPABASE_SERVICE_ROLE
EOF

[[ -n "$DB_PASSWORD" ]] && cat > "$SECRETS_DIR/DATABASE_URL" << EOF
$DATABASE_URL
EOF

chmod 600 "$SECRETS_DIR"/*

log "✅ Credenciais salvas em $SECRETS_DIR/"

# ============ GERAR .env ============

log "📝 Gerando $ENV_FILE..."

# Backup anterior
[[ -f "$ENV_FILE" ]] && cp "$ENV_FILE" "${ENV_FILE}.backup-$(date +%s)" && log "💾 Backup de $ENV_FILE"

# Criar novo .env
cat > "$ENV_FILE" << EOF
# .env — Supabase Consolidated (via CLI)
# Gerado: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
# Fonte: scripts/extract-supabase-credentials.sh

SUPABASE_URL="$SUPABASE_URL"
SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
EOF

if [[ -n "$SUPABASE_SERVICE_ROLE" ]]; then
  echo "SUPABASE_KEY=\"$SUPABASE_SERVICE_ROLE\"" >> "$ENV_FILE"
fi

if [[ -n "$DB_PASSWORD" ]]; then
  echo "DATABASE_URL=\"$DATABASE_URL\"" >> "$ENV_FILE"
fi

chmod 600 "$ENV_FILE"
log "✅ $ENV_FILE criado (chmod 600)"

# ============ VALIDAR CONECTIVIDADE ============

log "🔗 Testando conectividade Supabase..."

if [[ -n "$DB_PASSWORD" ]]; then
  if PGPASSWORD="${DB_PASSWORD}" psql -h db.kagejpghnwdfymddwxuf.supabase.co -U postgres -d postgres -c "SELECT version();" &>/dev/null; then
    log "✅ PostgreSQL conectável"
  else
    log "⚠️  PostgreSQL não respondeu (pode estar em manutenção)"
  fi
fi

# ============ RESUMO ============

log ""
log "📊 RESUMO:"
log "  ✅ Supabase CLI autenticado"
log "  ✅ Credenciais extraídas"
log "  ✅ /root/CentralDark/secrets/supabase/ populado"
log "  ✅ /root/.env gerado"
log ""
log "🚀 Próximos passos:"
log "  1. Validar /root/.env:"
log "     cat /root/.env"
log "  2. Restart PM2 apps:"
log "     pm2 restart all"
log "  3. Testar sincronização:"
log "     pm2 logs unified-bot"
log ""

log "✅ Extração de credenciais concluída"
