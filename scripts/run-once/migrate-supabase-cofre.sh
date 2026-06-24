#!/bin/bash
set -e

# === RUN-ONCE: Migração do cofre Supabase para /root/CentralDark/secrets/ ===
# Idempotente, seguro, sem expor valores
# Uso: bash scripts/run-once/migrate-supabase-cofre.sh

COFRE_DIR="/root/CentralDark/secrets"
ARQUIVO_OFICIAL="$COFRE_DIR/supabase-mcp.env"
LEGADO="/root/Multizap/secrets/supabase-mcp.env"

echo "[Migração Cofre] Iniciando preparação do cofre oficial..."

# 1. Criar diretório com permissão 700
mkdir -p "$COFRE_DIR"
chmod 700 "$COFRE_DIR"
chown root:root "$COFRE_DIR"

echo "[Migração Cofre] Diretório $COFRE_DIR preparado (700)"

# 2. Criar ou copiar o arquivo supabase-mcp.env
if [ -f "$ARQUIVO_OFICIAL" ]; then
  echo "[Migração Cofre] Arquivo oficial já existe. Mantendo."
else
  if [ -f "$LEGADO" ]; then
    echo "[Migração Cofre] Copiando conteúdo do legado para o cofre oficial (sem apagar legado)..."
    install -m 600 -o root -g root "$LEGADO" "$ARQUIVO_OFICIAL"
    echo "[Migração Cofre] Copiado com sucesso. Legado mantido como fallback."
  else
    echo "[Migração Cofre] Criando casca vazia do arquivo oficial..."
    install -m 600 -o root -g root /dev/null "$ARQUIVO_OFICIAL"
    echo "[Migração Cofre] ⚠️  ATENÇÃO: Arquivo criado vazio. Preencha manualmente com as chaves Supabase."
  fi
fi

echo "[Migração Cofre] Permissões aplicadas: 600 no arquivo."

echo "[Migração Cofre] ✅ Migração do cofre preparada com sucesso."

echo ""
echo "Próximos passos manuais (se necessário):"
echo "  1. Verifique se o arquivo $ARQUIVO_OFICIAL tem as chaves corretas"
echo "  2. Rode: cd /root/CentralDark/apps/mcp && npm run build"
echo "  3. Reinicie o MCP se necessário: pm2 restart MCP-CentralDark"
echo "  4. Valide com: curl http://localhost:PORTA/health e supabase_projects"
