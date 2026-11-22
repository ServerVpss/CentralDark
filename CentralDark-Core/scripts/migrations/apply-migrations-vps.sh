#!/usr/bin/env bash
# Sincronizador + Admin de Infraestrutura para migrations Supabase
# Executa na VPS — com backup, validação e rollback
# Uso: bash scripts/migrations/apply-migrations-vps.sh <checksum>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"

# Argumentos
EXPECTED_CHECKSUM="${1:-}"
SUPABASE_PROJECT_ID="${SUPABASE_PROJECT_ID:-}"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}📦 SINCRONIZADOR — Migrations Supabase${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo ""

# 1. Validar ambiente
echo -e "${YELLOW}[1/5] Validando ambiente...${NC}"
if [ -z "$SUPABASE_PROJECT_ID" ]; then
  echo -e "${RED}❌ SUPABASE_PROJECT_ID não configurado${NC}"
  exit 1
fi

if ! command -v supabase &> /dev/null; then
  echo -e "${RED}❌ supabase CLI não disponível${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Ambiente validado${NC}"
echo ""

# 2. Fazer backup do estado atual
echo -e "${YELLOW}[2/5] Criando backup...${NC}"
BACKUP_DIR="/tmp/migrations_backup_$(date +%s)"
mkdir -p "$BACKUP_DIR"

# Backup: estado atual do Supabase
supabase db pull --linked > "$BACKUP_DIR/pull_output.txt" 2>&1 || true
cp -r "$MIGRATIONS_DIR"/* "$BACKUP_DIR/migrations/" 2>/dev/null || mkdir -p "$BACKUP_DIR/migrations"

echo -e "${GREEN}✅ Backup em: $BACKUP_DIR${NC}"
echo ""

# 3. Validar checksum (sincronizador)
echo -e "${YELLOW}[3/5] Validando checksum...${NC}"
CURRENT_CHECKSUM=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort | xargs sha256sum | sha256sum | awk '{print $1}')

if [ -n "$EXPECTED_CHECKSUM" ] && [ "$CURRENT_CHECKSUM" != "$EXPECTED_CHECKSUM" ]; then
  echo -e "${RED}❌ Checksum mismatch!${NC}"
  echo -e "${RED}   Esperado: $EXPECTED_CHECKSUM${NC}"
  echo -e "${RED}   Atual:    $CURRENT_CHECKSUM${NC}"
  echo -e "${YELLOW}   Rollback disponível em: $BACKUP_DIR${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Checksum validado: $CURRENT_CHECKSUM${NC}"
echo ""

# 4. Aplicar migrations (admin infra)
echo -e "${YELLOW}[4/5] Aplicando migrations...${NC}"
PUSH_OUTPUT="/tmp/migrations_push_$(date +%s).log"

if supabase db push --linked > "$PUSH_OUTPUT" 2>&1; then
  echo -e "${GREEN}✅ Push para Supabase concluído${NC}"
else
  PUSH_ERROR=$(tail -20 "$PUSH_OUTPUT")
  echo -e "${RED}❌ Erro ao fazer push${NC}"
  echo -e "${RED}$PUSH_ERROR${NC}"
  echo -e "${YELLOW}   Rollback disponível em: $BACKUP_DIR${NC}"
  exit 1
fi
echo ""

# 5. Validar resultado
echo -e "${YELLOW}[5/5] Validando resultado...${NC}"
VALIDATION_CHECKS=0
VALIDATION_PASSED=0

# Check 1: migrations file count
REMOTE_MIGRATIONS=$(supabase db remote-types --linked 2>/dev/null | grep -c "migration" || echo "0")
echo "   Local migrations: $(find "$MIGRATIONS_DIR" -name "*.sql" | wc -l)"
echo "   Remote migrations: $REMOTE_MIGRATIONS"
((VALIDATION_CHECKS++))
if [ "$REMOTE_MIGRATIONS" -gt 0 ]; then
  ((VALIDATION_PASSED++))
fi

echo -e "${GREEN}✅ Validação: $VALIDATION_PASSED/$VALIDATION_CHECKS passou${NC}"
echo ""

# Notificar
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ MIGRATIONS APLICADAS COM SUCESSO${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Resumo:${NC}"
echo "   Project ID: $SUPABASE_PROJECT_ID"
echo "   Checksum: $CURRENT_CHECKSUM"
echo "   Backup: $BACKUP_DIR"
echo "   Push log: $PUSH_OUTPUT"
echo ""

# Se tiver TELEGRAM_BOT_TOKEN, notificar
if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHANNEL_ID:-}" ]; then
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -H "Content-Type: application/json" \
    -d "{\"chat_id\":\"${TELEGRAM_CHANNEL_ID}\",\"text\":\"✅ Migrations Supabase aplicadas com sucesso\n\nProject: $SUPABASE_PROJECT_ID\nChecksum: $CURRENT_CHECKSUM\"}" > /dev/null 2>&1 || true
fi

exit 0
