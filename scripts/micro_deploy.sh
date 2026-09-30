#!/usr/bin/env bash
# Micro-deploy canônico.
# - dry-run: leitura/simulação, compatível com o comportamento legado.
# - proof: promoção REAL porém isolada e reversível em diretório temporário controlado.
# - real: fail-closed até existir adapter específico do componente.

set -euo pipefail

BRANCH=${1:-"unknown-branch"}
SHA=${2:-"unknown-sha"}
DRY_RUN=${DRY_RUN:-true}
MODE=${MICRO_DEPLOY_MODE:-}
ACTION=${MICRO_DEPLOY_ACTION:-deploy}
COMPONENT=${MICRO_DEPLOY_COMPONENT:-centraldark-micro-deploy-canary}
OWNER=${MICRO_DEPLOY_OWNER:-docs/CONSCIENCIA/03-FLUXO-DEPLOY.md}
LOGDIR=${MICRO_DEPLOY_LOGDIR:-files}
TS=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$LOGDIR"
LOGFILE="$LOGDIR/deploy-$TS.log"

if [ -z "$MODE" ]; then
  case "${DRY_RUN,,}" in
    true|1) MODE=dry-run ;;
    *) MODE=real ;;
  esac
fi

SHORT_SHA=${SHA:0:12}
MICRO_DEPLOY_ID="micro-${TS}-${SHORT_SHA}"

log() {
  printf '%s\n' "$*" | tee -a "$LOGFILE"
}

blocked() {
  log "RESULT=BLOCKED"
  log "RUNTIME_RECEIPT=NOT_PROVEN"
  log "ERROR=$1"
  exit 1
}

emit_common_receipt() {
  log "MICRO_DEPLOY_ID=$MICRO_DEPLOY_ID"
  log "INTENT_GOAL=PROVE_CAUSAL_MICRO_DEPLOY_WITH_ROLLBACK"
  log "COMPONENT=$COMPONENT"
  log "OWNER=$OWNER"
  log "SOURCE_SHA=$SHA"
  log "GATES_HEAD_EXATO=${GATES_HEAD_EXATO:-UNKNOWN}"
  log "NEXT_CURSOR=${NEXT_CURSOR:-COUNTERPROOF_THEN_REMEASURE}"
}

log "=== CENTRALDARK MICRO DEPLOY START ==="
log "MODE=$MODE"
log "ACTION=$ACTION"
log "BRANCH=$BRANCH"
emit_common_receipt

case "$MODE" in
  dry-run)
    log "PREVIOUS_RUNTIME=NOT_TOUCHED"
    log "ARTIFACT=NOT_CREATED_DRY_RUN"
    log "NEW_RUNTIME=NOT_TOUCHED"
    log "ROLLBACK_TARGET=NOT_REQUIRED"
    log "LOG_SOURCE=$LOGFILE"
    log "RESULT=PASS_DRY_RUN"
    log "RUNTIME_RECEIPT=DRY_RUN_ONLY"
    ;;

  proof)
    TARGET_ROOT=${MICRO_DEPLOY_TARGET_ROOT:-"${RUNNER_TEMP:-/tmp}/centraldark-micro-deploy-proof"}
    case "$TARGET_ROOT" in
      ""|"/") blocked "UNSAFE_TARGET_ROOT" ;;
    esac
    case "$TARGET_ROOT" in
      *centraldark-micro-deploy*) ;;
      *) blocked "PROOF_TARGET_MUST_BE_ISOLATED" ;;
    esac

    RELEASES="$TARGET_ROOT/releases"
    CURRENT="$TARGET_ROOT/current"
    RELEASE="$RELEASES/$SHA"
    mkdir -p "$RELEASES"

    if [ -L "$CURRENT" ]; then
      PREVIOUS_RUNTIME=$(readlink "$CURRENT")
    elif [ -e "$CURRENT" ]; then
      blocked "CURRENT_EXISTS_AND_IS_NOT_SYMLINK"
    else
      PREVIOUS_RUNTIME=NONE
    fi
    log "PREVIOUS_RUNTIME=$PREVIOUS_RUNTIME"

    mkdir -p "$RELEASE"
    ARTIFACT_FILE="$RELEASE/artifact.txt"
    TMP_ARTIFACT="$TARGET_ROOT/.artifact-${SHORT_SHA}.tmp"
    {
      printf 'component=%s\n' "$COMPONENT"
      printf 'source_sha=%s\n' "$SHA"
      printf 'branch=%s\n' "$BRANCH"
      printf 'micro_deploy_id=%s\n' "$MICRO_DEPLOY_ID"
    } > "$TMP_ARTIFACT"

    ARTIFACT_SHA256=$(sha256sum "$TMP_ARTIFACT" | awk '{print $1}')
    install -m 0644 "$TMP_ARTIFACT" "$ARTIFACT_FILE"
    rm -f "$TMP_ARTIFACT"

    ACTUAL_ARTIFACT_SHA256=$(sha256sum "$ARTIFACT_FILE" | awk '{print $1}')
    [ "$ACTUAL_ARTIFACT_SHA256" = "$ARTIFACT_SHA256" ] || blocked "ARTIFACT_HASH_MISMATCH"
    log "ARTIFACT=$ARTIFACT_FILE#sha256:$ARTIFACT_SHA256"

    ln -sfn "$RELEASE" "$CURRENT"
    [ -L "$CURRENT" ] || blocked "CURRENT_SYMLINK_NOT_CREATED"
    [ "$(readlink "$CURRENT")" = "$RELEASE" ] || blocked "CURRENT_TARGET_MISMATCH"
    grep -Fxq "source_sha=$SHA" "$CURRENT/artifact.txt" || blocked "RUNTIME_SHA_BINDING_MISMATCH"

    NEW_RUNTIME=$(readlink "$CURRENT")
    log "NEW_RUNTIME=$NEW_RUNTIME"
    log "RUNTIME_BINDING=PASS"

    if [ "$ACTION" = "cycle" ]; then
      if [ "$PREVIOUS_RUNTIME" = "NONE" ]; then
        rm -f "$CURRENT"
        [ ! -e "$CURRENT" ] && [ ! -L "$CURRENT" ] || blocked "ROLLBACK_REMOVE_FAILED"
        ROLLBACK_TARGET=NONE
      else
        ln -sfn "$PREVIOUS_RUNTIME" "$CURRENT"
        [ "$(readlink "$CURRENT")" = "$PREVIOUS_RUNTIME" ] || blocked "ROLLBACK_TARGET_MISMATCH"
        ROLLBACK_TARGET=$PREVIOUS_RUNTIME
      fi
      log "ROLLBACK_TARGET=$ROLLBACK_TARGET"
      log "ROLLBACK_RESULT=PASS"
    else
      log "ROLLBACK_TARGET=$PREVIOUS_RUNTIME"
      log "ROLLBACK_RESULT=NOT_EXECUTED"
    fi

    log "LOG_SOURCE=$LOGFILE"
    log "RESULT=PASS"
    log "RUNTIME_RECEIPT=PASS"
    ;;

  real)
    ADAPTER=${MICRO_DEPLOY_ADAPTER:-}
    [ -n "$ADAPTER" ] || blocked "REAL_MODE_REQUIRES_COMPONENT_ADAPTER"
    case "$ADAPTER" in
      scripts/*) ;;
      *) blocked "REAL_MODE_ADAPTER_OUTSIDE_SCRIPTS_FORBIDDEN" ;;
    esac
    [ -x "$ADAPTER" ] || blocked "REAL_MODE_ADAPTER_NOT_EXECUTABLE"
    log "DELEGATING_TO_COMPONENT_ADAPTER=$ADAPTER"
    exec "$ADAPTER" "$BRANCH" "$SHA" "$COMPONENT"
    ;;

  *)
    blocked "UNSUPPORTED_MODE_$MODE"
    ;;
esac

log "=== CENTRALDARK MICRO DEPLOY END ==="
log "WROTE_LOG=$LOGFILE"
