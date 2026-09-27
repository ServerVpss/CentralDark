#!/bin/bash
# install-supabase-cli.sh — Instalar e configurar Supabase CLI na VPS
# Uso: sudo ./install-supabase-cli.sh [SUPABASE_ACCESS_TOKEN]
# Requer: Node.js/npm já instalados na VPS

set -euo pipefail

SUPABASE_ACCESS_TOKEN="${1:-${SUPABASE_ACCESS_TOKEN:-}}"
CLI_VERSION="latest"
LOG_FILE="/var/log/centraldark-supabase-cli-install.log"

# ============ FUNÇÕES ============

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $1" | tee -a "$LOG_FILE"
}

error() {
  echo "❌ ERRO: $1" | tee -a "$LOG_FILE"
  exit 1
}

success() {
  echo "✅ $1" | tee -a "$LOG_FILE"
}

# ============ VALIDAÇÕES ============

log "🚀 Iniciando instalação do Supabase CLI"

# Verificar se rodando como root
[[ $EUID -ne 0 ]] && error "Este script deve rodar como root"

# Verificar Node.js
if ! command -v node &> /dev/null; then
  error "Node.js não encontrado. Instale com: apt update && apt install -y nodejs npm"
fi

log "✅ Node.js $(node --version) encontrado"

# ============ INSTALAR SUPABASE CLI ============

log "📦 Instalando Supabase CLI (npm global)..."

npm install -g supabase@latest 2>&1 | tee -a "$LOG_FILE"

if ! command -v supabase &> /dev/null; then
  error "Falha na instalação do Supabase CLI"
fi

success "Supabase CLI instalado"
log "Versão: $(supabase --version)"

# ============ CONFIGURAR AUTENTICAÇÃO ============

if [[ -z "$SUPABASE_ACCESS_TOKEN" ]]; then
  log "⚠️  SUPABASE_ACCESS_TOKEN não fornecido"
  log "Para autenticar depois, execute:"
  log "  export SUPABASE_ACCESS_TOKEN=seu_token_aqui"
  log "  supabase login"
else
  log "🔐 Configurando SUPABASE_ACCESS_TOKEN..."
  export SUPABASE_ACCESS_TOKEN="$SUPABASE_ACCESS_TOKEN"
  
  # Testar autenticação
  if supabase projects list &> /dev/null; then
    success "Autenticação validada"
    log "Projetos disponíveis:"
    supabase projects list 2>&1 | tee -a "$LOG_FILE"
  else
    log "⚠️  Token pode estar inválido. Teste com: supabase projects list"
  fi
fi

# ============ CRIAR DIRETÓRIO DE CONFIGURAÇÃO ============

mkdir -p /root/.supabase
chmod 700 /root/.supabase

log "📁 Diretório /root/.supabase criado (chmod 700)"

# ============ CRIAR ARQUIVO DE SETUP ============

cat > /root/.supabase/cli-config.sh << 'EOF'
#!/bin/bash
# Configuração do Supabase CLI para CentralDark
# Fonte: scripts/install-supabase-cli.sh

export SUPABASE_CLI_INSTALLED="yes"
export SUPABASE_PROJECT_ID="kagejpghnwdfymddwxuf"
export SUPABASE_URL="https://kagejpghnwdfymddwxuf.supabase.co"

# Próximos passos quando autenticado:
# 1. supabase projects list
# 2. supabase db push (sincronizar schema)
# 3. supabase secrets list (listar secrets do projeto)
# 4. supabase db pull (puxar credenciais)

echo "✅ Supabase CLI configurado para CentralDark"
echo "   Projeto: $SUPABASE_PROJECT_ID"
echo "   URL: $SUPABASE_URL"
EOF

chmod 600 /root/.supabase/cli-config.sh

success "Arquivo de configuração criado em /root/.supabase/cli-config.sh"

# ============ INSTRUÇÕES FINAIS ============

log ""
log "🎯 PRÓXIMOS PASSOS:"
log ""
log "1. Obter Access Token (se não tiver):"
log "   - Ir em: https://app.supabase.com/account/tokens"
log "   - Criar novo 'Personal Access Token' com escopo 'API'"
log ""
log "2. Autenticar CLI:"
log "   export SUPABASE_ACCESS_TOKEN=seu_token_aqui"
log "   supabase login"
log ""
log "3. Validar:"
log "   supabase projects list"
log ""
log "4. Puxar credenciais do projeto:"
log "   supabase projects list --json | jq '.[] | select(.name==\"CentralDark\")'"
log ""
log "5. Ler secrets do projeto:"
log "   supabase secrets list"
log ""
log "✅ Instalação concluída!"
log "📝 Log completo em: $LOG_FILE"
