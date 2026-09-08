#!/usr/bin/env bash
# Checker 00 — estado vivo antes de qualquer conclusão operacional.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"

BLOCO="state"
ROOT="$CK_CENTRALDARK_ROOT"
REPO="$ROOT"

emit_ok "$BLOCO" "[CHECKER] DELTA ÚTIL aplicado, fluxo anterior continua"
emit_ok "$BLOCO" "[CHECKER] UNKNOWN != PASS; ACTION != PROOF"

for rel in \
  CENTRALDARK_AI_BOOT.yaml \
  docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml \
  docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md \
  docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CHECKER-CONTRACT.yml; do
  if [ -f "$REPO/$rel" ]; then
    emit_ok "$BLOCO" "Contrato presente: $rel"
  else
    emit_erro "$BLOCO" "Contrato ausente: $rel"
  fi
done

if has_cmd git && [ -d "$REPO/.git" ]; then
  head="$(git -C "$REPO" rev-parse HEAD 2>/dev/null || true)"
  branch="$(git -C "$REPO" branch --show-current 2>/dev/null || true)"
  if [ -n "$head" ]; then
    emit_ok "$BLOCO" "HEAD=${head} BRANCH=${branch:-DETACHED_OR_UNKNOWN}"
  else
    emit_alerta "$BLOCO" "Git existe, mas HEAD não pôde ser medido"
  fi
else
  emit_alerta "$BLOCO" "Git/checkout não disponível neste runtime; estado Git=UNKNOWN"
fi

if has_cmd node; then
  emit_ok "$BLOCO" "Node disponível: $(node -v 2>/dev/null || echo UNKNOWN)"
else
  emit_alerta "$BLOCO" "Node ausente; checkers Node ficam BLOCKED"
fi

exit 0
