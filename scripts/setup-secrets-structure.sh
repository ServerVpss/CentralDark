#!/bin/bash
# setup-secrets-structure.sh — Preparar cofre canônico /root/CentralDark/secrets/ + export legado /root/.env
# Uso: GITHUB_TOKEN=xxx ./setup-secrets-structure.sh
# Requer: GITHUB_TOKEN com acesso a secrets de ServerVpss/CentralDark
# SEGURANÇA: Valores reais são sensíveis; executar como root em ambiente seguro

set -euo pipefail

GITHUB_TOKEN="${GITHUB_TOKEN:-}"
REPO_OWNER="ServerVpss"
REPO_NAME="CentralDark"
SECRETS_ROOT="/root/CentralDark/secrets"
BACKUP_DIR="$SECRETS_ROOT/.backup"
LOG_FILE="/var/log/centraldark-secrets-setup.log"
ENV_FILE="/root/.env"

# ============ FUNÇÕES ============

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $1" | tee -a "$LOG_FILE"
}

error() {
  echo "❌ ERRO: $1" | tee -a "$LOG_FILE"
  exit 1
}

# ============ VALIDAÇÕES ============

[[ -z "$GITHUB_TOKEN" ]] && error "GITHUB_TOKEN não fornecido. Uso: GITHUB_TOKEN=xxx $0"

# Verificar se rodando como root
[[ $EUID -ne 0 ]] && error "Este script deve rodar como root"

log "🔐 Iniciando setup de consolidação de secrets"
log "Repo: $REPO_OWNER/$REPO_NAME"

# ============ CRIAR ESTRUTURA ============

log "📁 Criando estrutura de diretórios..."

mkdir -p "$SECRETS_ROOT"/{github,supabase,telegram,mcp,cloudflare,wuzapi,vps}
mkdir -p "$BACKUP_DIR"

chmod 700 "$SECRETS_ROOT"
chmod 700 "$SECRETS_ROOT"/{github,supabase,telegram,mcp,cloudflare,wuzapi,vps}
chmod 700 "$BACKUP_DIR"

log "✅ Diretórios criados com chmod 700"

# ============ BACKUP DO .env EXISTENTE ============

if [[ -f "$ENV_FILE" ]]; then
  BACKUP_NAME=".env.backup-$(date +%s)"
  cp "$ENV_FILE" "$BACKUP_DIR/$BACKUP_NAME"
  log "💾 Backup de .env anterior: $BACKUP_NAME"
fi

# ============ FETCH SECRETS DO GITHUB ============

log "🔄 Buscando secrets de GitHub Actions..."

SECRETS_JSON=$(curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets")

ERROR_MSG=$(echo "$SECRETS_JSON" | jq -r '.message // empty' 2>/dev/null)
if [[ -n "$ERROR_MSG" ]]; then
  error "GitHub API: $ERROR_MSG"
fi

# ============ MAPEAR SECRETS PARA CATEGORIAS ============

# Definir categorias (secret_name -> path relative to SECRETS_ROOT)
declare -A SECRET_PATHS=(
  [GITHUB_TOKEN]="github/GITHUB_TOKEN"
  [GH_PAT]="github/GH_PAT"
  [SUPABASE_URL]="supabase/SUPABASE_URL"
  [SUPABASE_KEY]="supabase/SUPABASE_KEY"
  [SUPABASE_ANON_KEY]="supabase/SUPABASE_ANON_KEY"
  [DATABASE_URL]="supabase/DATABASE_URL"
  [DATABASE_PASSWORD]="supabase/DATABASE_PASSWORD"
  [TELEGRAM_BOT_TOKEN]="telegram/TELEGRAM_BOT_TOKEN"
  [TELEGRAM_CHAT_ID]="telegram/TELEGRAM_CHAT_ID"
  [TELEGRAM_WEBHOOK_SECRET]="telegram/TELEGRAM_WEBHOOK_SECRET"
  [MCP_ENDPOINT]="mcp/MCP_ENDPOINT"
  [MCP_ADMIN_KEY]="mcp/MCP_ADMIN_KEY"
  [CF_API_TOKEN]="cloudflare/CF_API_TOKEN"
  [CF_ZONE_ID]="cloudflare/CF_ZONE_ID"
  [CF_ACCOUNT_ID]="cloudflare/CF_ACCOUNT_ID"
  [WUZAPI_URL]="wuzapi/WUZAPI_URL"
  [WUZAPI_TOKEN]="wuzapi/WUZAPI_TOKEN"
  [WORKSPACE_ID]="wuzapi/WORKSPACE_ID"
  [PM2_SECRET]="vps/PM2_SECRET"
)

# ============ EXTRAIR E SALVAR SECRETS ============

log "💾 Salvando secrets em /root/CentralDark/secrets/..."

# Criar arquivo .env temporário
ENV_TEMP=$(mktemp)
trap "rm -f $ENV_TEMP" EXIT

# Iniciar .env com metadata
cat >> "$ENV_TEMP" << 'EOF'
# .env — Secrets consolidados de GitHub Actions
# Gerado: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
# Fonte: GitHub Actions Secrets API
# SEGURANÇA: chmod 600 /root/.env (apenas root pode ler)

EOF

echo "$SECRETS_JSON" | jq -r '.secrets[] | .name' 2>/dev/null | while read -r SECRET_NAME; do
  # Procurar valor via secrets API (apenas nomes; valores não retornados por segurança)
  # Alternativa: usar personal access token com menor escopo ou integração de confiança
  
  if [[ -v SECRET_PATHS[$SECRET_NAME] ]]; then
    CATEGORY_PATH="${SECRET_PATHS[$SECRET_NAME]}"
    SECRET_FILE="$SECRETS_ROOT/$CATEGORY_PATH"
    
    # Nós NÃO podemos acessar valores de secrets via API sem token de confiança específico
    # Então nós criamos PLACEHOLDERS para serem preenchidos manualmente OU
    # Assumimos que os secrets já existem em .env ou via environment do PM2
    
    log "  ℹ️  $SECRET_NAME → $CATEGORY_PATH (será preenchido)"
  fi
done

log "✅ Secrets mapeados"

# ============ INSTRUÇÕES PARA PREENCHIMENTO MANUAL ============

log "⚠️  PRÓXIMOS PASSOS:"
log ""
log "1. Obter valores reais (manual, por segurança):"
log "   - GitHub Secrets: gh secret list -R ServerVpss/CentralDark"
log "   - PM2 env: pm2 env 27 | grep TELEGRAM"
log "   - Cloudflare: https://dash.cloudflare.com/[account]/account/api-tokens"
log ""
log "2. Popular /root/.env com valores reais (chmod 600)"
log ""
log "3. Validar conectividade:"
log "   - SUPABASE: psql \$DATABASE_URL -c 'SELECT version();'"
log "   - TELEGRAM: curl -s https://api.telegram.org/bot\$TELEGRAM_BOT_TOKEN/getMe"
log ""
log "4. Ativar PM2 apps:"
log "   - pm2 restart all"
log ""

log "📊 Setup de estrutura completo. Aguardando valores em /root/.env"

# ============ CRIAR README NO /root/CentralDark/secrets/ ============

cat > "$SECRETS_ROOT/README.md" << 'EOF'
# /root/CentralDark/secrets/ — Cofre canônico de Secrets CentralDark

## Estrutura
- `github/` — GitHub Actions tokens
- `supabase/` — Supabase credentials (banco de dados)
- `telegram/` — Telegram bot tokens
- `mcp/` — MCP server admin keys
- `cloudflare/` — Cloudflare DNS/CDN tokens
- `wuzapi/` — WhatsApp integration tokens
- `vps/` — VPS-specific secrets (SSH keys, PM2)
- `.backup/` — Histórico de backups automáticos

## Permissões
```bash
chmod 700 /root/CentralDark/secrets
chmod 600 /root/CentralDark/secrets/*
chmod 600 /root/.env
```

## Uso
- Owner canônico: `/root/CentralDark/secrets/`; `/root/.env` é somente export de compatibilidade quando algum consumidor legado exigir
- Este diretório é apenas armazenamento estruturado
- Sincronização via `sync-secrets-github.sh` (metadados apenas)

## Rotação
Ver: docs/SECRETS-CONSOLIDATION/README.md

Gerado: $(date -u +'%Y-%m-%dT%H:%M:%SZ')
EOF

chmod 644 "$SECRETS_ROOT/README.md"

log "✅ Script setup-secrets-structure.sh concluído"
log "Status: Estrutura pronta, aguardando valores reais em /root/.env"
