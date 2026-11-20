#!/usr/bin/env bash
set -Eeuo pipefail
export LC_ALL=C
ROOT="${CENTRALDARK_REPO:-/root/CentralDark}"
STATE="${CENTRALDARK_INVENTORY_STATE:-/var/lib/centraldark/inventory-reconcile}"
MAIN_REL="scripts/centraldark-inventory-reconcile.sh"
MAIN="$ROOT/$MAIN_REL"
RECEIPT="$STATE/centraldark-inventory-reconcile.json"
BACKUP_ROOT="$STATE/backups"
EXPECTED_NEW="ead45fcfae0417038542f1bc7a7d4f93651bfd5e0dd0d730db29053e82d46a10"
EXPECTED_PREVIOUS="b56706f65fd045acc60dc88d11643362faded88ae9f0a504a7ec17bf2a906830"
EXPECTED_ORIGINAL="4792fab2b553537219fe43afe06cb8a9745f02ad4d897d17870575218d75f902"
PIN="eaab55ffdf6cd928947a2967b8fd449c89bf7910"
MCP_PIN="9f516fbe7842aa56b2be93a7f5021208cfc06b16"
BLOB="7d710e7f12dd211a79a6b9c624ddc07933fe6a04"
HERE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
MODE="${1:---audit}"
# Single latest-run console log, separate from the durable append-only JSON receipt.
# Only the ENTRYPOINT writes this log: nested scan and MCP calls inherit the guard.
# Do not create a log while disk is full: previous evidence must remain intact.
LOG_DIR="${CENTRALDARK_LOG_DIR:-/var/log/centraldark}"
LOG_FILE="$LOG_DIR/centraldark-inventory-reconcile.log"
LOG_MIN_FREE_KIB=16384
if [[ "${CENTRALDARK_EXECUTION_LOG_ACTIVE:-0}" != 1 && "$MODE" != '--help' && "$MODE" != '-h' ]]; then
  [[ "$LOG_DIR" == /* && "$LOG_DIR" != '/' ]] || { printf '🔴 [BLOCKED] LOG_DIR_INVALID=%s\n' "$LOG_DIR" >&2; exit 73; }
  LOG_PARENT="$(dirname -- "$LOG_DIR")"
  [[ -d "$LOG_PARENT" ]] || { printf '🔴 [BLOCKED] LOG_PARENT_MISSING=%s\n' "$LOG_PARENT" >&2; exit 73; }
  [[ ! -L "$LOG_DIR" && ! -L "$LOG_FILE" ]] || { printf '🔴 [BLOCKED] LOG_SYMLINK_REFUSED\n' >&2; exit 73; }
  if [[ -e "$LOG_FILE" && ! -f "$LOG_FILE" ]]; then
    printf '🔴 [BLOCKED] LOG_NOT_REGULAR_FILE=%s\n' "$LOG_FILE" >&2; exit 73
  fi
  command -v df >/dev/null && command -v tee >/dev/null && command -v flock >/dev/null \
    || { printf '🔴 [BLOCKED] LOG_TOOLS_MISSING=df_or_tee_or_flock\n' >&2; exit 73; }
  LOG_AVAILABLE_KIB="$(df -Pk "$LOG_PARENT" | awk 'END { print $4 }')"
  if [[ ! "$LOG_AVAILABLE_KIB" =~ ^[0-9]+$ ]] || (( LOG_AVAILABLE_KIB < LOG_MIN_FREE_KIB )); then
    printf '🔴 [BLOCKED] LOG_DISK_FULL free_kib=%s required_kib=%s; preserving_previous_log=true; no_execution=true\n' \
      "${LOG_AVAILABLE_KIB:-UNKNOWN}" "$LOG_MIN_FREE_KIB" >&2
    exit 73
  fi
  # The flock file is a volatile lock, NOT another log. Avoid concurrent truncations.
  exec 8> /run/lock/centraldark-inventory-reconcile-log.lock \
    || { printf '🔴 [BLOCKED] LOG_LOCK_OPEN_FAILED\n' >&2; exit 73; }
  flock -n 8 || { printf '🟡 [PARTIAL] LOG_EXECUTION_ALREADY_RUNNING; wait_for_current_run=true\n' >&2; exit 75; }
  if [[ ! -d "$LOG_DIR" ]]; then
    (umask 077; mkdir -m 700 -- "$LOG_DIR") || { printf '🔴 [BLOCKED] LOG_DIR_CREATE_FAILED=%s\n' "$LOG_DIR" >&2; exit 73; }
  fi
  [[ -d "$LOG_DIR" && ! -L "$LOG_DIR" && ! -L "$LOG_FILE" ]] || { printf '🔴 [BLOCKED] LOG_PATH_CHANGED\n' >&2; exit 73; }
  umask 077
  export CENTRALDARK_EXECUTION_LOG_ACTIVE=1
  set +e
  bash "$0" "$@" 2>&1 | tee -- "$LOG_FILE"
  LOG_PIPE=( "${PIPESTATUS[@]}" )
  set -e
  if (( LOG_PIPE[1] != 0 )); then
    printf '🔴 [BLOCKED] LOG_WRITE_FAILED path=%s; exit=%s\n' "$LOG_FILE" "${LOG_PIPE[1]}" >&2
    exit 74
  fi
  exit "${LOG_PIPE[0]}"
fi
log(){ printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
if [[ "${CENTRALDARK_EXECUTION_LOG_ACTIVE:-0}" == 1 ]]; then
  log "🟢 [PASS] LOG_LATEST=$LOG_FILE LOG_MODE=OVERWRITE; JSON_RECEIPT=$RECEIPT"
fi
fail(){ log "🔴 BLOCKED: $*";exit 2; }
need(){ command -v "$1" >/dev/null || fail "FERRAMENTA_AUSENTE=$1"; }
sha(){ sha256sum "$1" | awk '{print $1}'; }
gates(){
 need git; need bash; need python3; need sha256sum
 [[ -d "$ROOT/.git" ]] || fail "CHECKOUT_INEXISTENTE=$ROOT"
 log "👑🪬 GOAL=ONE_INTENT TWO_OWNERS FRONT1_MCP FRONT2_RECONCILER"
 log "🔗 REPO=$ROOT MODE=$MODE"
 log "🏛️ VPS_HEAD=$(git -C "$ROOT" rev-parse HEAD)"
 log "🏛️ MAIN_CACHED=$(git -C "$ROOT" rev-parse origin/main 2>/dev/null || echo UNKNOWN)"
 log "🛡️ NO_RESET NO_CLEAN NO_FORCE_PUSH NO_SECRET_SEARCH"
}
# Verified Experience Replay: this is a mode of the existing executor, not another service.
# It reuses the existing reconciler JSON, .lock, Git and pre-existing MCP owner.
replay_event(){
  local stage="$1" status="$2" detail="$3" cursor="${4:-VERIFY_FROM_CURRENT}"
  python3 "$HERE/tools/verificar-integridade.py" --repo "$ROOT" --state "$STATE" \
    --record-event "$stage" "$status" "$detail" --next-cursor "$cursor" \
    || fail "EVENT_NOT_PERSISTED=$stage"
}
known_current_main_sha(){
  git -C "$ROOT" cat-file -e "origin/main:$MAIN_REL" 2>/dev/null || return 1
  git -C "$ROOT" show "origin/main:$MAIN_REL" | sha256sum | awk '{print $1}'
}
script_matches_owner(){
  [[ -f "$MAIN" ]] || return 1
  local current="$1" head_sha
  if [[ "$current" == "$EXPECTED_NEW" ]]; then return 0; fi
  head_sha="$(known_current_main_sha)" || return 1
  [[ "$current" == "$head_sha" ]]
}
# Guard do owner real: a atribuicao Python tem UM espaco de indentacao.
# A antiga regex com ^v nao reconhecia o codigo correto e gerava BLOCKED falso.
scanner_preserves_replay(){
  [[ -f "$MAIN" ]] || return 1
  grep -Fq "if isinstance(old.get('replay'), dict):" "$MAIN" \
    && grep -Eq "^[[:space:]]*v\['replay'\][[:space:]]*=[[:space:]]*old\['replay'\][[:space:]]*$" "$MAIN"
}
# Resume sem a prova de uma varredura ja concluida NAO pode pular o scan.
# Exige mesmo script, mesma main em cache e fingerprint anexado ao evento PASS.
previous_scan_verified(){
  python3 - "$RECEIPT" "$1" "$2" <<'PY_SCAN_RESUME'
import json,sys
try:
 data=json.load(open(sys.argv[1],encoding='utf-8'))
 replay=data.get('replay') or {}
 dup=data.get('duplicates') or {}
 fp=dup.get('fingerprint')
 assert isinstance(fp,str) and len(fp)==64
 for event in reversed(replay.get('events') or []):
  if event.get('state')=='EXECUTE' and event.get('status') in ('FAIL','BLOCKED'):
   break
  if (event.get('state')=='EXECUTE' and event.get('status')=='PASS'
      and event.get('detail')=='SCAN_EXEC_EXIT_0; fingerprint='+fp
      and event.get('script_sha256')==sys.argv[2]
      and event.get('main_cached_sha')==sys.argv[3]):
   sys.exit(0)
except (ValueError,TypeError,OSError,AssertionError,AttributeError,KeyError):pass
sys.exit(1)
PY_SCAN_RESUME
}
scan_fingerprint(){
  python3 - "$RECEIPT" <<'PY_SCAN_FP'
import json,sys
try:
 fp=(json.load(open(sys.argv[1],encoding='utf-8')).get('duplicates') or {}).get('fingerprint')
 if not isinstance(fp,str) or len(fp)!=64 or any(c not in '0123456789abcdef' for c in fp):raise ValueError('INVALID_FINGERPRINT')
 print(fp)
except (OSError,ValueError,TypeError) as exc:
 print('SCAN_FINGERPRINT_UNPROVEN: '+str(exc),file=sys.stderr);sys.exit(2)
PY_SCAN_FP
}
replay_cycle(){
  local resume="$1" repair="$2" sha_now main_sha prefix status scan_status
  gates
  [[ -f "$RECEIPT" ]] || fail "JSON_CANONICO_AUSENTE=$RECEIPT; PRIMEIRO --scan"
  python3 -m json.tool "$RECEIPT" >/dev/null || fail 'RECIBO_INVALIDO_NAO_PODE_CONTINUAR'
  replay_event INTENT PASS "ONE_INTENT_TWO_OWNERS mode=$MODE" RECOVER
  if [[ "$resume" == true ]]; then
    python3 "$HERE/tools/verificar-integridade.py" --state "$STATE" --read-replay \
      || fail 'RESUME_RECEIPT_INVALID'
  fi
  replay_event RECOVER PASS 'RECOVER_EXISTING_CHECKPOINT; NOT_AUTOMATIC_RUNTIME_PROOF' OBSERVE
  sha_now="$(sha "$MAIN" 2>/dev/null)" || fail 'RECONCILER_FILE_MISSING'
  main_sha="$(known_current_main_sha)" || main_sha='UNKNOWN'
  replay_event OBSERVE PASS "runtime_sha=$sha_now cached_main_blob_sha=$main_sha" RECONCILE
  if ! script_matches_owner "$sha_now"; then
    if [[ "$repair" == true && "$main_sha" == "$EXPECTED_NEW" && ( "$sha_now" == "$EXPECTED_ORIGINAL" || "$sha_now" == "$EXPECTED_PREVIOUS" ) ]]; then
      replay_event DIAGNOSE PASS 'KNOWN_OLD_SHA_SAFE_UPGRADE_CANDIDATE; prior_backup_required' REPAIR
      replay_event REPAIR UNKNOWN 'Applying same existing --apply-reconciler guarded recipe' RETEST
      if "$HERE/executar-tudo.sh" --apply-reconciler; then
        sha_now="$(sha "$MAIN")"
        if ! script_matches_owner "$sha_now"; then
          replay_event RETEST FAIL 'POST_REPAIR_SHA_MISMATCH' OWNER_SHA_DRIFT
          return 3
        fi
        replay_event RETEST PASS 'EXACT_KNOWN_SHA_FIXED_AND_BASH_CHECKED' EXECUTE
      else
        replay_event REPAIR BLOCKED 'SAFE_REPAIR_REFUSED_OR_FAILED; rollback owned by existing recipe' INSPECT_SOURCE_OWNER
        return 3
      fi
    elif [[ "$sha_now" == "$EXPECTED_PREVIOUS" && "$main_sha" == "$EXPECTED_NEW" && "$repair" != true ]]; then
      replay_event RECONCILE PARTIAL 'KNOWN_PREVIOUS_OWNER; update available only with --repair-known' REPLAY_OWNER_UPGRADE_AVAILABLE
      replay_event HALT BLOCKED 'UPGRADE_OPT_IN_REQUIRED; preserve existing files' REPLAY_OWNER_UPGRADE_AVAILABLE
      log '🟡 OWNER_PREVIOUS_SHA=KNOWN; USE=--replay --repair-known; NO_MUTATION'
      return 3
    else
      replay_event RECONCILE BLOCKED "UNEXPECTED_RUNTIME_SHA=$sha_now; DO_NOT_REPLACE; current_main=$main_sha" OWNER_SHA_DRIFT
      log '🔴 SCRIPT_MUDOU_FORA_DO_CONTRATO; preservar; corrigir o owner primeiro'
      return 3
    fi
  else
    replay_event RECONCILE PASS "script_owner_proven_sha=$sha_now" VERIFY
  fi
  if ! bash -n "$MAIN"; then
    replay_event VERIFY FAIL 'BASH_SYNTAX_FAIL; no automatic blind rewrite' FIX_SYNTAX_EXISTING_OWNER
    return 3
  fi
  if ! "$MAIN" --pulse --plan; then
    replay_event VERIFY FAIL 'PULSE_PLAN_FAIL; not pulse live' FIX_PULSE_PLAN_WITH_EXISTING_OWNER
    return 3
  fi
  replay_event VERIFY PASS 'BASH_SYNTAX_PASS; PULSE_PLAN_PASS (NOT LIVE_PULSE)' EXECUTE
  # The CURRENT scanner overwrites the JSON. Replay requires the owner to
  # preserve existing `replay` field; otherwise an audit scan can ERASE proof.
  if ! scanner_preserves_replay; then
    replay_event EXECUTE BLOCKED 'SCANNER_DROPS_REPLAY_EVENTS; refusing data loss' FIX_OWNER_REPLAY_PRESERVATION
    return 3
  fi
  # Resume somente pula scan quando ha evidencias ligadas ao mesmo owner,
  # main e fingerprint. Um HALT anterior ao primeiro scan nao valida skip.
  if [[ "$resume" == true ]] && previous_scan_verified "$sha_now" "$(git -C "$ROOT" rev-parse origin/main)"; then
    replay_event EXECUTE NOOP 'RESUME_REUSES_PROVEN_SCAN; same script, main and fingerprint' READ_PARTIAL_RECEIPT
    log '🟢 [PASS] SCAN_SKIP=RESUME_PROVEN; sem varredura redundante'
  else
    if [[ "$resume" == true ]]; then
      log '🟡 [PARTIAL] SCAN_PREVIOUS_UNPROVEN; executar --scan conhecido antes de continuar'
    fi
    log '🔎 SCAN_START=existing_reconciler; modifies canonical JSON only'
    if "$MAIN" --scan; then
      scan_fp="$(scan_fingerprint)" || { replay_event EXECUTE FAIL 'SCAN_FINGERPRINT_UNPROVEN' VERIFY_SCAN_RECEIPT; return 3; }
      replay_event EXECUTE PASS "SCAN_EXEC_EXIT_0; fingerprint=$scan_fp" VERIFY_COVERAGE
    else
      replay_event EXECUTE FAIL 'SCAN_EXIT_NONZERO; not safe to guess Python patch' INSPECT_SCAN_STDERR
      return 3
    fi
  fi
  local info
  info="$(python3 - "$RECEIPT" <<'PY'
import json,sys
v=json.load(open(sys.argv[1]))
d=v.get('duplicates') or {}
if not d:print('MISSING')
else:print(('PARTIAL' if d.get('partial') else 'COMPLETE')+' '+str(d.get('scanned_script_files','UNKNOWN')))
PY
)" || { replay_event VERIFY FAIL 'CANONICAL_JSON_INVALID' REPAIR_JSON_SAFELY; return 3; }
  scan_status="${info%% *}"
  if [[ "$scan_status" == 'PARTIAL' ]]; then
    replay_event VERIFY PARTIAL "SCAN=$info; bounded_scan is not total coverage" SCANNER_COVERAGE
  elif [[ "$scan_status" == 'COMPLETE' ]]; then
    replay_event VERIFY PASS "SCAN=$info; scanner bounded scope only" MCP_RUNTIME_AND_PULSE_LIVE
  else
    replay_event VERIFY UNKNOWN 'DUPLICATE_SCAN_MISSING_IN_RECEIPT' SCANNER_COVERAGE
  fi
  # We deliberately never auto-deploy MCP or auto-delete a legacy script here.
  # The executor cannot claim a live MCP code identity without an owner health proof.
  replay_event DIAGNOSE BLOCKED 'MCP_RUNTIME_NOT_PROVEN; PULSE_LIVE_NOT_PROVEN; no unauthorized workaround' MCP_RUNTIME_AND_PULSE_LIVE
  replay_event LEARN DOCUMENTED 'RECIPES_IN_EXISTING_DOCS; RECEIPT_EVENT_NOT_MODEL_TRAINING' VERIFY_RECIPE_CONSUMPTION
  replay_event HALT BLOCKED "GLOBAL_PASS=false; scan=$scan_status; HAKAI=NOT_EXECUTED" 'MCP_RUNTIME + PULSE_LIVE + SCAN_COVERAGE + CALLER_MAP'
  log '🟡 [UNKNOWN] MCP_RUNTIME=UNKNOWN; PULSE_LIVE=UNKNOWN; verificacao pendente' 
  log "🟡 [$scan_status] SCAN_COVERAGE=$scan_status; HAKAI_NOT_EXECUTED; NO_NEW_RUNTIME"
  log '🔴 [BLOCKED] GLOBAL_PASS=FALSE; HAKAI_NOT_EXECUTED=true'
  log '🧭 NEXT_CURSOR=MCP_RUNTIME + PULSE_LIVE + SCAN_COVERAGE + CALLER_MAP'
  return 3  # Incomplete does not become PASS; safe rollback is for actual mutation failures.
}
case "$MODE" in
 --audit)
  gates
  log '🟢 FRENTE_1: consulta de origem, sem declarar runtime implantado'
  # Exit 2 pode sinalizar drift/UNKNOWN; auditoria ainda exibe diagnóstico completo.
  if python3 "$HERE/tools/verificar-integridade.py" --repo "$ROOT" --state "$STATE"; then
    log '🟢 AUDIT_CHECKS_EXECUTED=TRUE'
  else
    log '🟡 AUDIT_HAS_BLOCKERS_OR_DRIFT; GLOBAL_PASS=FALSE; auditoria continua'
  fi
  log '🟡 MCP_RUNTIME_NEW_CODE=UNKNOWN; MICRODEPLOY_FILESET_NOT_APPROVED (ultimo ensaio)'
  log '🟢 FRENTE_2: inventário/plan/backup verificados sem HAKAI'
  log '🟡 PULSE_LIVE=UNKNOWN; SCAN_COMPLETE=UNKNOWN; HAKAI=NOT_EXECUTED'
  log '🧭 NEXT_CURSOR=MCP_OWNER_RUNTIME + PULSE_LIVE_PARITY + CALLER_MAP'
  ;;
 --scan)
  gates
  [[ -f "$MAIN" ]] || fail 'RECONCILIADOR_AUSENTE'
  script_matches_owner "$(sha "$MAIN")" || fail 'SCRIPT_DRIFT_PROTEGIDO'
  # Existing scanner used to drop replay history. Refuse scans that would erase it.
  if [[ -f "$RECEIPT" ]] && ! scanner_preserves_replay; then
    if python3 - "$RECEIPT" <<'PYSCAN'
import json,sys
v=json.load(open(sys.argv[1]))
assert not (v.get('replay') or {}).get('events'), 'REPLAY_EVENTS_MUST_SURVIVE'
PYSCAN
    then :; else fail 'SCAN_WOULD_ERASE_REPLAY_EVENTS: update owner or use --replay --repair-known'; fi
  fi
  bash -n "$MAIN" || fail 'BASH_SYNTAX_FAIL'
  log '🔎 SCAN_START=script_existente; até limite interno do scanner'
  "$MAIN" --scan
  python3 -m json.tool "$RECEIPT" >/dev/null || fail 'RECEIPT_INVALID'
  python3 - "$RECEIPT" <<'PY'
import json,sys
v=json.load(open(sys.argv[1]));d=v.get('duplicates') or {}
print('🧾 RECEIPT_VALID=true; PARTIAL='+str(d.get('partial')).upper()+'; FILES='+str(d.get('scanned_script_files'))+'; SAME_BYTES='+str(d.get('exact_bytes_count')))
if d.get('partial'):print('🟡 GLOBAL_SCRIPT_SCAN_NOT_EXHAUSTIVE=true')
PY
  log '🛡️ SCAN_NAO_DELETA=TRUE'
  ;;
 --pulse-plan)
  gates
  [[ -f "$MAIN" ]] || fail 'RECONCILIADOR_AUSENTE'
  bash -n "$MAIN" || fail 'BASH_SYNTAX_FAIL'
  "$MAIN" --pulse --plan
  log '🛡️ PLAN_NAO_EQUIVALE_A_PULSE_RUNTIME_PASS'
  ;;
 --apply-reconciler)
  gates
  [[ -f "$MAIN" ]] || fail 'RECONCILIADOR_ANTIGO_AUSENTE'
  current="$(sha "$MAIN")"
  if [[ "$current" == "$EXPECTED_NEW" ]]; then log '🟢 NOOP_RECONCILER_ALREADY_INSTALLED';exit 0;fi
  [[ "$current" == "$EXPECTED_ORIGINAL" || "$current" == "$EXPECTED_PREVIOUS" ]] || fail "UNEXPECTED_SHA_NEVER_OVERWRITE=$current"
  [[ "$(git -C "$ROOT" rev-parse "$PIN:$MAIN_REL")" == "$BLOB" ]] || fail 'PIN_BLOB_MISMATCH'
  [[ "$(known_current_main_sha)" == "$EXPECTED_NEW" ]] || fail 'MAIN_EVOLVED_AFTER_PIN; REFUSE_OUTDATED_UPGRADE' 
  mkdir -p "$BACKUP_ROOT"
  checkpoint="$BACKUP_ROOT/$(date -u +%Y%m%dT%H%M%SZ)-replay"
  mkdir -m 700 "$checkpoint"
  cp -p "$MAIN" "$checkpoint/centraldark-inventory-reconcile.sh"
  [[ "$(sha "$checkpoint/centraldark-inventory-reconcile.sh")" == "$current" ]] || fail 'BACKUP_READBACK_FAIL'
  tmp="$MAIN.replay-stage-$$"
  rollback(){ code=$?;trap - EXIT; if [[ $code -ne 0 ]];then
    if [[ -f "$checkpoint/centraldark-inventory-reconcile.sh" ]];then
      cp -p "$checkpoint/centraldark-inventory-reconcile.sh" "$MAIN"
      log "🔴 ROLLBACK_RESTORED=$MAIN"
    fi
   fi;rm -f -- "$tmp";exit "$code"; }
  trap rollback EXIT
  git -C "$ROOT" show "$PIN:$MAIN_REL" > "$tmp"
  [[ "$(sha "$tmp")" == "$EXPECTED_NEW" ]] || fail 'PIN_SHA256_MISMATCH'
  bash -n "$tmp" || fail 'BASH_N_FAIL'
  chmod --reference="$MAIN" "$tmp";mv -- "$tmp" "$MAIN"
  bash -n "$MAIN" || fail 'AFTER_INSTALL_BASH_N_FAIL'
  [[ "$(sha "$MAIN")" == "$EXPECTED_NEW" ]] || fail 'AFTER_INSTALL_SHA_MISMATCH'
  "$MAIN" --pulse --plan || fail 'PULSE_PLAN_FAIL_ROLLBACK'
  trap - EXIT
  log "🟢 INSTALLED_READBACK=$(sha "$MAIN") BACKUP=$checkpoint"
  log '🟡 PULSE_LIVE_NAO_TESTADO HAKAI_PROIBIDO'
  ;;
 --hakai-check)
  gates
  log '🧿 HAKAI_GUARD=NO_DELETE (somente verifica chamadores conhecidos)'
  if [[ -e "$ROOT/scripts/vps/main-pulse-reconciler.sh" ]];then
   log '🟡 LEGACY_PULSE_EXISTS=true'
  else log '🟡 LEGACY_PULSE_EXISTS=false (origem UNKNOWN)';fi
  for dir in "$ROOT/scripts" "$ROOT/.github" "$ROOT/apps/modulos/HERMES-CORE" /etc/systemd/system /etc/cron.d;do
   if [[ -d "$dir" ]];then
    grep -R -l -F --exclude-dir=.git --exclude-dir=node_modules 'main-pulse-reconciler.sh' "$dir" 2>/dev/null || true
   fi
  done
  if command -v systemctl >/dev/null;then
   systemctl list-timers --all --no-pager 2>/dev/null | grep -i 'main.pulse\|centraldark' || true
  fi
  if command -v pgrep >/dev/null;then
   pgrep -af 'main-pulse-reconciler.sh' || true
  fi
  log '🔴 HAKAI=BLOCKED: pulse live parity & all users crontabs not proved'
  ;;
 --mcp-rebuilder)
  gates
  log '🔌 MCP_REBUILDER: medir owner existente, sem criar core nem burlar o gate'
  if [[ -f "$ROOT/apps/modulos/mcp/src/tools/core/mcp-admin.js" ]];then
   grep -n -m 2 'MCP_BLOCK_RECONCILIATION\|diagnoseMcpBlock' "$ROOT/apps/modulos/mcp/src/tools/core/mcp-admin.js" || true
  fi
  if [[ -x "$ROOT/scripts/vps/main-pinned-microdeploy.sh" ]];then
   log '🧪 MICRODEPLOY_PREFLIGHT=EXISTING_OWNER_ONLY'
   "$ROOT/scripts/vps/main-pinned-microdeploy.sh" --owner mcp --source "$MCP_PIN" --file apps/modulos/mcp/src/tools/core/mcp-admin.js --dry-run || log '🟡 GATE_REFUSED=EXPECTED_IF_FILESET_NOT_APPROVED'
  fi
  log '🟡 MCP_RUNTIME_NOT_PROMOTED_BY_THIS_MODE'
  ;;
 --loop|--replay)
  [[ "${2:-}" == '' || "${2:-}" == '--repair-known' ]] || fail 'USO=--replay [--repair-known]'
  replay_cycle false "$( [[ "${2:-}" == '--repair-known' ]] && echo true || echo false )"
  ;;
 --resume)
  [[ "${2:-}" == '' || "${2:-}" == '--repair-known' ]] || fail 'USO=--resume [--repair-known]'
  replay_cycle true "$( [[ "${2:-}" == '--repair-known' ]] && echo true || echo false )"
  ;;
 --papagaio-check)
  [[ "$#" == 3 ]] || fail 'USO=--papagaio-check ORIGINAL DERIVADO'
  python3 "$HERE/tools/verificar-integridade.py" --compare-original "$2" "$3"
  ;;
 --help|-h)
  cat <<'USO'
Uso: bash executar-tudo.sh [--audit|--scan|--pulse-plan|--apply-reconciler|--hakai-check|--mcp-rebuilder|--replay|--resume|--papagaio-check]
--audit (padrão): somente leitura, conserva dirty state
--scan: executa o reconciliador existente (atualiza apenas seu JSON de recibo)
--pulse-plan: read-only, NÃO executa pulse real
--apply-reconciler: idempotente, valida SHA e backup, rollback em falha
--hakai-check: só leitura, legado não é apagado
--mcp-rebuilder: valida owner e microdeploy dry-run, NÃO desbloqueia proteção
--replay [--repair-known]: executa ciclo finito; --scan somente JSON; reparo por SHA apenas se explicitado
--resume: recupera checkpoint JSON e revalida sem refazer scan limitado; não assume PASS histórico
--papagaio-check ORIGINAL DERIVADO: confirma prefixo byte-a-byte e apêndice fiel, sem mutação
Ciclo incompleto retorna exit code 3 propositalmente; MCP/pulso vivo permanecem pendentes
USO
  ;;
 *)fail "MODO_DESCONHECIDO=$MODE";;
esac
