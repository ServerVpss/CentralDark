#!/usr/bin/env bash
# Testa o owner canônico de deploy sem fabricar verde.
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DISPATCHER="$SCRIPT_DIR/deploy-guards-dispatcher.sh"
OPERATIONAL="$SCRIPT_DIR/deploy-operational-guards.sh"
README="$SCRIPT_DIR/README.md"

PASS=0
FAIL=0
log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
pass() { printf '  PASS: %s\n' "$*"; PASS=$((PASS + 1)); }
fail() { printf '  FAIL: %s\n' "$*"; FAIL=$((FAIL + 1)); }

log "=== 1. Sintaxe ==="
if bash -n "$DISPATCHER" && bash -n "$OPERATIONAL"; then
  pass "dispatcher + operational guards têm sintaxe bash válida"
else
  fail "bash -n falhou"
fi

log "=== 2. Owners executáveis/documentados ==="
[[ -x "$DISPATCHER" ]] && pass "dispatcher executável" || fail "dispatcher não executável"
[[ -x "$OPERATIONAL" ]] && pass "operational guards executável" || fail "operational guards não executável"
grep -q 'deploy-guards-dispatcher' "$README" && pass "README menciona dispatcher" || fail "README sem dispatcher"

log "=== 3. Contrato exact-SHA + gate-only ==="
if grep -q 'TARGET_SHA_INPUT=' "$DISPATCHER" \
  && grep -q -- '--gate-only' "$DISPATCHER" \
  && grep -q 'tlc23_runtime_gate.py --self-test' "$DISPATCHER"; then
  pass "TARGET_SHA + gate-only + TLC23 runtime self-test presentes"
else
  fail "binding exact-SHA/gate-only/TLC23 incompleto"
fi

log "=== 4. Worktree isolado não reutiliza diretório mktemp ==="
if grep -q 'GATE_ROOT="$(mktemp -d ' "$DISPATCHER" \
  && grep -q 'GATE_TMP="$GATE_ROOT/worktree"' "$DISPATCHER" \
  && ! grep -q 'GATE_TMP="$(mktemp -d ' "$DISPATCHER"; then
  pass "worktree usa filho inexistente de GATE_ROOT"
else
  fail "worktree ainda pode apontar para diretório já criado"
fi

log "=== 5. no_destructive_bypass somente após dirty/history no caminho mutante ==="
dirty_line="$(grep -nF '[[ "$SUJOS_ALL" -eq 0 ]]' "$DISPATCHER" | head -n1 | cut -d: -f1 || true)"
ahead_line="$(grep -nF '[[ "$AFRENTE" -eq 0 ]]' "$DISPATCHER" | head -n1 | cut -d: -f1 || true)"
apply_fact_line="$(grep -nF '"no_destructive_bypass": true' "$DISPATCHER" | tail -n1 | cut -d: -f1 || true)"
if [[ -n "$dirty_line" && -n "$ahead_line" && -n "$apply_fact_line" \
  && "$dirty_line" -lt "$apply_fact_line" && "$ahead_line" -lt "$apply_fact_line" ]]; then
  pass "Horn fact mutante nasce depois das contraprovas destrutivas"
else
  fail "no_destructive_bypass pode nascer antes das contraprovas"
fi

log "=== 6. operational guards não bypassa dispatcher ==="
gate_line="$(grep -nF 'bash "$CANONICAL_GATE_SCRIPT" --gate-only' "$OPERATIONAL" | head -n1 | cut -d: -f1 || true)"
sync_line="$(grep -nF 'SOURCE_SYNC_REQUIRED=0' "$OPERATIONAL" | head -n1 | cut -d: -f1 || true)"
if [[ -n "$gate_line" && -n "$sync_line" && "$gate_line" -lt "$sync_line" ]]; then
  pass "gate canônico ocorre antes de source-sync/mutação"
else
  fail "operational guards possui rota de mutação antes do gate"
fi

log "=== 7. Flags incompatíveis falham antes de tocar repo ==="
set +e
OUTPUT="$(REPO_DIR=/definitivamente/inexistente bash "$DISPATCHER" --apply --gate-only 2>&1)"
EXIT_CODE=$?
set -e
if [[ "$EXIT_CODE" -eq 2 ]] && grep -q 'mutuamente exclusivos' <<<"$OUTPUT"; then
  pass "--apply + --gate-only = exit 2 fail-closed"
else
  fail "flags incompatíveis não falharam corretamente (rc=$EXIT_CODE)"
fi

log "=== 8. Guard SSH_KEY continua no caminho apply ==="
if grep -q 'SSH_KEY' "$DISPATCHER" \
  && grep -qF '[[ ! -f "$SSH_KEY" && "$APPLY" -eq 1 ]]' "$DISPATCHER" \
  && grep -q 'die.*14' "$DISPATCHER"; then
  pass "guard SSH_KEY preservado"
else
  fail "guard SSH_KEY ausente/regredido"
fi

TOTAL=$((PASS + FAIL))
log "=== RESUMO ==="
printf 'Testes: %d passaram, %d falharam (total: %d)\n' "$PASS" "$FAIL" "$TOTAL"
[[ "$FAIL" -eq 0 ]] || exit 1
exit 0
