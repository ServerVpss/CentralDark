#!/bin/bash
# ══════════════════════════════════════════════════════════════
# INSTALAR: auto-deploy com post-deploy
# Substitui /usr/local/bin/clone-deck-gh-pull pelo script com post-deploy
# Executar UMA VEZ na VPS
# ══════════════════════════════════════════════════════════════
set -euo pipefail

SRC="/root/Multizap/apps/clone-deck/scripts/clone-deck-gh-pull-with-deploy.sh"
DST="/usr/local/bin/clone-deck-gh-pull"

if [ ! -f "$SRC" ]; then
  echo "❌ $SRC não encontrado"
  exit 1
fi

# Backup
cp "$DST" "${DST}.backup.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true

# Instalar
cp "$SRC" "$DST"
chmod +x "$DST"

echo "✅ clone-deck-gh-pull atualizado com post-deploy automático"
echo "   Agora cada push na main vai:"
echo "   1. git pull"
echo "   2. npm install + build"
echo "   3. Reiniciar Bridge e Telegram bot"
