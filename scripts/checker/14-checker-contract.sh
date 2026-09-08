#!/usr/bin/env bash
# Checker 14 — contrato transversal do próprio sistema de checkers.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/_lib.sh"
BLOCO="checker-contract"
ROOT="$CK_CENTRALDARK_ROOT"

need_file() {
  local rel="$1"
  if [ -f "$ROOT/$rel" ]; then emit_ok "$BLOCO" "Owner presente: $rel"; else emit_erro "$BLOCO" "Owner ausente: $rel"; fi
}

need_token() {
  local rel="$1" token="$2"
  if [ -f "$ROOT/$rel" ] && grep -Fq -- "$token" "$ROOT/$rel"; then
    emit_ok "$BLOCO" "$rel contém contrato: $token"
  else
    emit_erro "$BLOCO" "$rel sem contrato obrigatório: $token"
  fi
}

need_file "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/CHECKER-CONTRACT.yml"
need_file "scripts/checker/step-checker.mjs"
need_file "scripts/checker/step-checker.test.mjs"
need_file "apps/modulos/Bolt/source/electron/main/utils/update-checker.ts"

need_token "CENTRALDARK_AI_BOOT.yaml" "REMEASURE_CURRENT_REALITY"
need_token "CENTRALDARK_AI_BOOT.yaml" "TEST_AFTER_MUTATION"
need_token "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml" "ABSORB_MINIMAL_DELTA"
need_token "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/DELTA-CONTINUO.md" "NEXT_CURSOR"
need_token "install.sh" "run_check_final"
need_token "install.sh" "ensure_deps"
need_token "install.sh" 'bash -n "$tmp"'
need_token "install.sh" "sha256sum"
need_token ".github/workflows/centraldark-desktop-windows-installer.yml" "step-checker.mjs"
need_token "apps/modulos/Bolt/source/electron/main/utils/auto-update.ts" "reconcilePendingUpdateCheckpoint"

if has_cmd node; then
  if node --test "$SCRIPT_DIR/step-checker.test.mjs" >/dev/null 2>&1; then
    emit_ok "$BLOCO" "step-checker: testes positivo/negativo/redaction PASS"
  else
    emit_erro "$BLOCO" "step-checker: suíte determinística falhou"
  fi
else
  emit_alerta "$BLOCO" "Node ausente; teste do step-checker BLOCKED"
fi

emit_ok "$BLOCO" "[CHECKER] DELTA ÚTIL aplicado, fluxo anterior continua"
exit 0
