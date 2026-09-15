#!/usr/bin/env bash
set -euo pipefail

SCRIPT="scripts/micro_deploy.sh"
TMP_BASE=$(mktemp -d "${RUNNER_TEMP:-/tmp}/centraldark-micro-deploy-test.XXXXXX")
trap 'rm -rf "$TMP_BASE"' EXIT

fail() {
  echo "MICRO_DEPLOY_SELF_TEST=FAIL reason=$1"
  exit 1
}

run_proof_cycle() {
  local root="$1"
  local sha="$2"
  local logdir="$3"
  mkdir -p "$logdir"
  MICRO_DEPLOY_MODE=proof \
  MICRO_DEPLOY_ACTION=cycle \
  MICRO_DEPLOY_TARGET_ROOT="$root" \
  MICRO_DEPLOY_LOGDIR="$logdir" \
  MICRO_DEPLOY_COMPONENT="self-test-canary" \
    bash "$SCRIPT" "refs/heads/feat/self-test" "$sha"
}

# Cenário 1: runtime anterior existe e precisa voltar exatamente para ele.
ROOT1="$TMP_BASE/centraldark-micro-deploy-existing"
mkdir -p "$ROOT1/releases/previous"
printf 'source_sha=previous\n' > "$ROOT1/releases/previous/artifact.txt"
ln -s "$ROOT1/releases/previous" "$ROOT1/current"
run_proof_cycle "$ROOT1" "1111111111111111111111111111111111111111" "$TMP_BASE/logs-1"
[ -L "$ROOT1/current" ] || fail "previous_current_lost"
[ "$(readlink "$ROOT1/current")" = "$ROOT1/releases/previous" ] || fail "previous_runtime_not_restored"
grep -Rqs '^RUNTIME_RECEIPT=PASS$' "$TMP_BASE/logs-1" || fail "receipt_missing_scenario_1"
grep -Rqs '^ROLLBACK_RESULT=PASS$' "$TMP_BASE/logs-1" || fail "rollback_missing_scenario_1"

# Cenário 2: sem runtime anterior; rollback precisa remover current.
ROOT2="$TMP_BASE/centraldark-micro-deploy-empty"
run_proof_cycle "$ROOT2" "2222222222222222222222222222222222222222" "$TMP_BASE/logs-2"
[ ! -e "$ROOT2/current" ] && [ ! -L "$ROOT2/current" ] || fail "empty_runtime_not_restored"
grep -Rqs '^RUNTIME_BINDING=PASS$' "$TMP_BASE/logs-2" || fail "binding_missing_scenario_2"

# Dry-run não pode criar o alvo de runtime.
ROOT3="$TMP_BASE/centraldark-micro-deploy-dry"
MICRO_DEPLOY_MODE=dry-run MICRO_DEPLOY_TARGET_ROOT="$ROOT3" MICRO_DEPLOY_LOGDIR="$TMP_BASE/logs-3" \
  bash "$SCRIPT" "refs/heads/feat/self-test" "3333333333333333333333333333333333333333"
[ ! -e "$ROOT3" ] || fail "dry_run_mutated_runtime"

# Real genérico continua fail-closed sem adapter específico.
if MICRO_DEPLOY_MODE=real MICRO_DEPLOY_LOGDIR="$TMP_BASE/logs-4" \
  bash "$SCRIPT" "refs/heads/feat/self-test" "4444444444444444444444444444444444444444"; then
  fail "real_mode_should_block_without_adapter"
fi
grep -Rqs '^ERROR=REAL_MODE_REQUIRES_COMPONENT_ADAPTER$' "$TMP_BASE/logs-4" || fail "real_mode_block_receipt_missing"

echo "MICRO_DEPLOY_SELF_TEST=PASS"
