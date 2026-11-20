#!/usr/bin/env bash
set -euo pipefail
BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
TAREFA="${1:-069-plano-apps-bot-qr}"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/069-orquestrador-multizap"
mkdir -p "$REV/dados"
echo "Orquestrador rodando tarefa: $TAREFA" > "$REV/dados/resumo.md"
