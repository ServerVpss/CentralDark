#!/usr/bin/env bash
# Wrapper local pra instalar a skill centraldark-consciencia no agente local.
# Atalho conveniente — chama instalar-via-ssh.sh diretamente da pasta da skill.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SKILL_DIR="$REPO_ROOT/skills/centraldark-consciencia"

if [ ! -d "$SKILL_DIR" ]; then
  echo "✗ Skill não encontrada em: $SKILL_DIR"
  echo "  Você está rodando este script de dentro do repo clone-deck?"
  exit 1
fi

exec bash "$SKILL_DIR/scripts/instalar-via-ssh.sh"
