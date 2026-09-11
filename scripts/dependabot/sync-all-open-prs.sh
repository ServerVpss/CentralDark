#!/usr/bin/env bash
# Radar Casa — sync conservador de PRs abertos (owner: dependabot-auto-merge.yml).
# SYNC != APPROVAL · UNKNOWN != PASS · cancelled histórico ≠ rerun.
#
# CHEFE !CENTRALDARK fechar #1498:
# 1) preservar radar
# 2) anti-thrash: HEAD com checks pending|queued|in_progress → sem update-branch e sem rerun
# 3) rerun só failure|cancelled do SHA HEAD atual (--commit)
# 4) rate-limit: remaining/reset/retry-after; remaining=0 → DEFERRED+cursor, exit 0 (não falha PR)
# 5) OTHER_ERR>0 → FAIL; CONFLICT → receipt explícito

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
MAX_PRS="${MAX_PRS:-100}"
MAX_RERUNS_PER_BRANCH="${MAX_RERUNS_PER_BRANCH:-4}"
SLEEP_BETWEEN_PR="${SLEEP_BETWEEN_PR:-0.8}"
CURSOR_FILE="${CURSOR_FILE:-${RUNNER_TEMP:-/tmp}/centraldark-all-prs-radar-cursor.txt}"

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }
command -v jq >/dev/null || { echo 'BLOCKED_JQ_ABSENT'; exit 2; }

UPDATED=0
NOOP=0
SKIP_NOT_BEHIND=0
SKIP_ACTIVE_CHECKS=0
SKIP_FORK=0
SKIP_BEFORE_CURSOR=0
CONFLICT=0
OTHER_ERR=0
RERUN_OK=0
RERUN_SKIP=0
DEFERRED=0

echo "📡 ALL_OPEN_PRS_SYNC_START repo=$REPO max=$MAX_PRS"
echo "RULE update-branch=BEHIND_AND_QUIET_HEAD_ONLY"
echo "RULE rerun=CURRENT_HEAD_FAILURE_OR_CANCELLED"
echo "RULE rate_limit=DEFER_SAVE_CURSOR_NOT_FAIL"
echo "RULE SYNC!=APPROVAL UNKNOWN!=PASS"

save_cursor() {
  printf '%s\n' "$1" >"$CURSOR_FILE"
  echo "CURSOR_SAVED pr=$1 file=$CURSOR_FILE"
}

load_cursor() {
  if [ -f "$CURSOR_FILE" ]; then tr -d '[:space:]' <"$CURSOR_FILE"; else echo 0; fi
}

# Probe core rate limit. Echoes: ok|deferred
probe_rate_limit() {
  local hdr
  hdr="$(mktemp)"
  set +e
  gh api -i rate_limit >"$hdr" 2>/dev/null
  local rc=$?
  set -e
  local remaining reset retry http
  remaining="$(awk -F': ' 'tolower($1)=="x-ratelimit-remaining"{gsub(/\r/,"",$2);print $2}' "$hdr" | tail -1)"
  reset="$(awk -F': ' 'tolower($1)=="x-ratelimit-reset"{gsub(/\r/,"",$2);print $2}' "$hdr" | tail -1)"
  retry="$(awk -F': ' 'tolower($1)=="retry-after"{gsub(/\r/,"",$2);print $2}' "$hdr" | tail -1)"
  http="$(awk '/^HTTP\//{print $2}' "$hdr" | tail -1)"
  # Also read JSON core.remaining if body present
  local core_rem
  core_rem="$(awk 'found{print} /^[[:space:]]*$/{found=1}' "$hdr" | jq -r '.resources.core.remaining // empty' 2>/dev/null || true)"
  if [ -n "$core_rem" ]; then remaining="$core_rem"; fi
  echo "RATE remaining=${remaining:-UNKNOWN} reset=${reset:-UNKNOWN} retry_after=${retry:--} http=${http:--} rc=$rc"
  rm -f "$hdr"
  if [ "$rc" -ne 0 ] && { [ "${http:-}" = "403" ] || [ "${http:-}" = "429" ]; }; then
    echo deferred
    return 0
  fi
  if [ "${remaining:-}" = "0" ]; then
    echo deferred
    return 0
  fi
  echo ok
}

is_rate_limit_error() {
  local text="$1"
  printf '%s' "$text" | grep -qiE 'API rate limit exceeded|secondary rate limit|Retry later|HTTP 403.*rate limit|HTTP 429'
}

head_activity() {
  local sha="$1"
  local checks_json statuses_json
  set +e
  checks_json="$(gh api "repos/$REPO/commits/$sha/check-runs?per_page=100" 2>&1)"
  local rc1=$?
  statuses_json="$(gh api "repos/$REPO/commits/$sha/status" 2>&1)"
  local rc2=$?
  set -e
  if is_rate_limit_error "$checks_json$statuses_json"; then
    echo RATE_LIMITED
    return 0
  fi
  if [ "$rc1" -ne 0 ] || [ "$rc2" -ne 0 ]; then
    echo UNKNOWN
    return 0
  fi
  local pending_checks pending_statuses
  pending_checks="$(jq '[.check_runs[]? | select(.status == "queued" or .status == "in_progress" or .status == "pending" or .status != "completed")] | length' <<<"$checks_json")"
  pending_statuses="$(jq '[.statuses[]? | select(.state == "pending")] | length' <<<"$statuses_json")"
  if [ "$pending_checks" -gt 0 ] || [ "$pending_statuses" -gt 0 ]; then
    echo ACTIVE
  else
    echo QUIET
  fi
}

CURSOR_START="$(load_cursor)"
echo "CURSOR_START=$CURSOR_START"

RL="$(probe_rate_limit)"
if [ "$RL" = "deferred" ]; then
  echo "DEFERRED_START rate_limit — sem classificar PRs como falhos"
  DEFERRED=1
  echo "RECEIPT UPDATED=0 NOOP=0 CONFLICT=0 OTHER_ERR=0 DEFERRED=1 RERUN_OK=0"
  echo "RESULT=DEFERRED_RATE_LIMIT"
  exit 0
fi

mapfile -t PRS < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha,.head.repo.full_name,.mergeable_state] | @tsv' \
    | head -n "$MAX_PRS"
)

echo "OPEN_PRS=${#PRS[@]}"

for row in "${PRS[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  IFS=$'\t' read -r NUM BR SHA HEAD_REPO MERGE_STATE <<<"$row"

  if [ "$NUM" -le "$CURSOR_START" ] 2>/dev/null; then
    echo "SKIP_BEFORE_CURSOR #$NUM cursor=$CURSOR_START"
    SKIP_BEFORE_CURSOR=$((SKIP_BEFORE_CURSOR + 1))
    continue
  fi

  echo "---- PR #$NUM branch=$BR sha=${SHA:0:10} state=${MERGE_STATE:-UNKNOWN} ----"

  RL="$(probe_rate_limit)"
  if [ "$RL" = "deferred" ]; then
    echo "DEFERRED_MID rate_limit at #$NUM"
    save_cursor "$((NUM - 1))"
    DEFERRED=1
    break
  fi

  if [ "$HEAD_REPO" != "$REPO" ]; then
    echo "SKIP_FORK #$NUM repo=$HEAD_REPO"
    SKIP_FORK=$((SKIP_FORK + 1))
    save_cursor "$NUM"
    continue
  fi

  if [ "${MERGE_STATE:-unknown}" = "dirty" ]; then
    echo "CONFLICT #$NUM mergeable_state=dirty"
    CONFLICT=$((CONFLICT + 1))
    save_cursor "$NUM"
    continue
  fi

  if [ "${MERGE_STATE:-unknown}" != "behind" ]; then
    echo "SKIP_NOT_BEHIND #$NUM state=${MERGE_STATE:-UNKNOWN}"
    SKIP_NOT_BEHIND=$((SKIP_NOT_BEHIND + 1))
    # still may need rerun pass later; mark cursor and continue update phase
    save_cursor "$NUM"
    continue
  fi

  ACTIVITY="$(head_activity "$SHA")"
  if [ "$ACTIVITY" = "RATE_LIMITED" ]; then
    echo "DEFERRED_ACTIVITY #$NUM"
    save_cursor "$((NUM - 1))"
    DEFERRED=1
    break
  fi
  if [ "$ACTIVITY" = "ACTIVE" ]; then
    echo "SKIP_ACTIVE_CHECKS #$NUM head=${SHA:0:10} — sem update-branch/rerun"
    SKIP_ACTIVE_CHECKS=$((SKIP_ACTIVE_CHECKS + 1))
    save_cursor "$NUM"
    continue
  fi
  if [ "$ACTIVITY" = "UNKNOWN" ]; then
    echo "ERR_MEASURE_CI #$NUM head=${SHA:0:10}"
    OTHER_ERR=$((OTHER_ERR + 1))
    save_cursor "$NUM"
    continue
  fi

  set +e
  OUT=$(gh api -X PUT "repos/$REPO/pulls/${NUM}/update-branch" -f expected_head_sha="$SHA" 2>&1)
  RC=$?
  set -e
  if is_rate_limit_error "$OUT"; then
    echo "DEFERRED_UPDATE #$NUM"
    save_cursor "$((NUM - 1))"
    DEFERRED=1
    break
  fi
  if [ "$RC" -eq 0 ]; then
    echo "UPDATE #$NUM OK old_head=${SHA:0:10}"
    UPDATED=$((UPDATED + 1))
  elif printf '%s' "$OUT" | grep -qi 'no new commits on the base branch'; then
    echo "NOOP #$NUM already_synced"
    NOOP=$((NOOP + 1))
  elif printf '%s' "$OUT" | grep -Eqi 'merge conflict|not mergeable'; then
    echo "CONFLICT #$NUM update_branch_rejected"
    CONFLICT=$((CONFLICT + 1))
  else
    echo "ERR_UPDATE #$NUM rc=$RC :: $(printf '%s' "$OUT" | tr '\n' ' ' | head -c 240)"
    OTHER_ERR=$((OTHER_ERR + 1))
  fi
  save_cursor "$NUM"
  sleep "$SLEEP_BETWEEN_PR"
done

if [ "$DEFERRED" -eq 1 ]; then
  echo "RECEIPT UPDATED=$UPDATED NOOP=$NOOP SKIP_NOT_BEHIND=$SKIP_NOT_BEHIND SKIP_ACTIVE_CHECKS=$SKIP_ACTIVE_CHECKS SKIP_FORK=$SKIP_FORK SKIP_BEFORE_CURSOR=$SKIP_BEFORE_CURSOR CONFLICT=$CONFLICT OTHER_ERR=$OTHER_ERR RERUN_OK=$RERUN_OK RERUN_SKIP=$RERUN_SKIP DEFERRED=1"
  echo "RESULT=DEFERRED_RATE_LIMIT"
  # DEFERRED não é falha de PR — exit 0
  exit 0
fi

# Rerun: só failure|cancelled do HEAD atual
mapfile -t PRS2 < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha,.head.repo.full_name] | @tsv' \
    | head -n "$MAX_PRS"
)

for row in "${PRS2[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  IFS=$'\t' read -r NUM BR SHA HEAD_REPO <<<"$row"
  [ "$HEAD_REPO" = "$REPO" ] || continue

  RL="$(probe_rate_limit)"
  if [ "$RL" = "deferred" ]; then
    echo "DEFERRED_RERUN_PHASE at #$NUM"
    save_cursor "$((NUM - 1))"
    DEFERRED=1
    break
  fi

  ACTIVITY="$(head_activity "$SHA")"
  if [ "$ACTIVITY" = "RATE_LIMITED" ]; then
    save_cursor "$((NUM - 1))"
    DEFERRED=1
    break
  fi
  if [ "$ACTIVITY" = "ACTIVE" ]; then
    echo "RERUN_SKIP_ACTIVE #$NUM head=${SHA:0:10}"
    RERUN_SKIP=$((RERUN_SKIP + 1))
    continue
  fi
  if [ "$ACTIVITY" = "UNKNOWN" ]; then
    echo "RERUN_SKIP_UNKNOWN #$NUM head=${SHA:0:10}"
    OTHER_ERR=$((OTHER_ERR + 1))
    continue
  fi

  mapfile -t RUNS < <(
    {
      gh run list --repo "$REPO" --commit "$SHA" --status failure -L "$MAX_RERUNS_PER_BRANCH" --json databaseId --jq '.[].databaseId' 2>/dev/null || true
      gh run list --repo "$REPO" --commit "$SHA" --status cancelled -L "$MAX_RERUNS_PER_BRANCH" --json databaseId --jq '.[].databaseId' 2>/dev/null || true
    } | awk 'NF' | sort -u | head -n "$MAX_RERUNS_PER_BRANCH"
  )

  if [ "${#RUNS[@]}" -eq 0 ]; then
    echo "RERUN_NONE #$NUM current_head_only sha=${SHA:0:10}"
    continue
  fi

  for RID in "${RUNS[@]}"; do
    # prove run belongs to current head
    RUN_SHA="$(gh api "repos/$REPO/actions/runs/$RID" --jq .head_sha 2>/dev/null || echo '')"
    if [ "$RUN_SHA" != "$SHA" ]; then
      echo "RERUN_SKIP_OLD_SHA run=$RID run_sha=${RUN_SHA:0:10} want=${SHA:0:10}"
      RERUN_SKIP=$((RERUN_SKIP + 1))
      continue
    fi
    set +e
    OUT=$(gh run rerun "$RID" --repo "$REPO" --failed 2>&1)
    RC=$?
    if [ "$RC" -ne 0 ]; then
      OUT=$(gh run rerun "$RID" --repo "$REPO" 2>&1)
      RC=$?
    fi
    set -e
    if is_rate_limit_error "$OUT"; then
      echo "DEFERRED_RERUN run=$RID"
      save_cursor "$((NUM - 1))"
      DEFERRED=1
      break 2
    fi
    if [ "$RC" -eq 0 ]; then
      echo "RERUN_OK run=$RID head=${SHA:0:10}"
      RERUN_OK=$((RERUN_OK + 1))
    else
      echo "RERUN_SKIP run=$RID :: $(printf '%s' "$OUT" | tr '\n' ' ' | head -c 180)"
      RERUN_SKIP=$((RERUN_SKIP + 1))
    fi
    sleep 0.35
  done
done

# sucesso completo → zera cursor
if [ "$DEFERRED" -eq 0 ] && [ "$OTHER_ERR" -eq 0 ]; then
  rm -f "$CURSOR_FILE"
  echo "CURSOR_CLEARED"
fi

echo "RECEIPT UPDATED=$UPDATED NOOP=$NOOP SKIP_NOT_BEHIND=$SKIP_NOT_BEHIND SKIP_ACTIVE_CHECKS=$SKIP_ACTIVE_CHECKS SKIP_FORK=$SKIP_FORK SKIP_BEFORE_CURSOR=$SKIP_BEFORE_CURSOR CONFLICT=$CONFLICT OTHER_ERR=$OTHER_ERR RERUN_OK=$RERUN_OK RERUN_SKIP=$RERUN_SKIP DEFERRED=$DEFERRED"

if [ "$DEFERRED" -eq 1 ]; then
  echo "RESULT=DEFERRED_RATE_LIMIT"
  exit 0
fi
if [ "$OTHER_ERR" -gt 0 ]; then
  echo "RESULT=FAIL OTHER_ERR=$OTHER_ERR"
  exit 1
fi
if [ "$CONFLICT" -gt 0 ]; then
  echo "RESULT=BLOCKED_CONFLICT count=$CONFLICT"
  exit 0
fi
echo "RESULT=PASS_RADAR_EXECUTION"
exit 0
