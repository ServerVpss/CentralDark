#!/usr/bin/env bash
# ============================================================================
# instalar-local.sh — instala darkai no seu Mac/Linux local
# ============================================================================
set -euo pipefail

INSTALL_DIR="$HOME/.local/bin"
SCRIPT_URL_FALLBACK="./darkai.sh"

echo "🚀 Instalando darkai em $INSTALL_DIR/darkai"
mkdir -p "$INSTALL_DIR"

# Copia darkai.sh que está no mesmo diretório do instalador
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/darkai.sh" ]]; then
  cp "$SCRIPT_DIR/darkai.sh" "$INSTALL_DIR/darkai"
else
  echo "⚠️  darkai.sh não encontrado no mesmo diretório. Baixa manual."
  exit 1
fi

chmod +x "$INSTALL_DIR/darkai"

echo ""
echo "✅ darkai instalado em $INSTALL_DIR/darkai"
echo ""

# Detecta shell
SHELL_RC=""
case "${SHELL:-}" in
  */zsh)  SHELL_RC="$HOME/.zshrc" ;;
  */bash) SHELL_RC="$HOME/.bashrc" ;;
  *)      SHELL_RC="$HOME/.profile" ;;
esac

echo "📝 Adicionando ao $SHELL_RC (se ainda não estiver):"
echo ""

# PATH
if ! grep -q '.local/bin' "$SHELL_RC" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
  echo "  ✅ PATH adicionado"
fi

# Variáveis DARKAI (se ainda não configuradas)
if ! grep -q 'DARKAI_URL' "$SHELL_RC" 2>/dev/null; then
  cat >> "$SHELL_RC" <<'EOF'

# darkai — CLI para IAs (Gemini/GPT via Lovable AI Gateway)
export DARKAI_URL="https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy"
export DARKAI_ANON_KEY="COLE_AQUI_SUA_ANON_KEY"
export DARKAI_MODEL="google/gemini-3-flash-preview"
EOF
  echo "  ⚠️  Variáveis DARKAI_* adicionadas — EDITE $SHELL_RC e cole sua ANON_KEY!"
else
  echo "  ✅ DARKAI_* já configuradas"
fi

echo ""
echo "🎉 Pronto! Roda:"
echo "     source $SHELL_RC"
echo "     darkai \"oi\""
echo ""
echo "📚 Documentação completa em: docs/CONSCIENCIA/DARKAI/"
