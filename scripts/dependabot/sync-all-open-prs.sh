#!/usr/bin/env bash
# Radar Casa — sincronização conservadora dos PRs abertos.
# Reusa o workflow existente e separa sincronização de julgamento.
# Regras:
# - update-branch só quando o PR está BEHIND e o HEAD atual não tem checks/status pendentes;
# - nunca rearma run CANCELLED, pois cancelamento pode ser concorrência/HEAD superado;
# - rearma no máximo uma vez run FAILED do HEAD atual e somente sem run ativo;
# - conflito é receipt material, não autorização para mutação paralela;
# - UNKNOWN nunca vira PASS.

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
MAX_PRS="${MAX_PRS:-100}"
MAX_RERUNS_PER_BRANCH="${MAX_RERUNS_PER_BRANCH:-2}"
SLEEP_BETWEEN_PR="${SLEEP_BETWEEN_PR:-0.8}"

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }
command -v jq >/dev/null || { echo 'BLOCKED_JQ_ABSENT'; exit 2; }

UPDATED=0
NOOP=0
SKIP_NOT_BEHIND=0
SKIP_ACTIVE_CHECKS=0
SKIP_FORK=0
CONFLICT=0
OTHER_ERR=0
RERUN_OK=0
RERUN_SKIP=0

echo "📡 ALL_OPEN_PRS_SYNC_START repo=$REPO max=$MAX_PRS"
echo "RULE update-branch=BEHIND_AND_QUIET_HEAD_ONLY rerun=CURRENT_HEAD_FAILURE_ONCE cancelled=NEVER"

head_activity() {
  local sha="$1"
  local checks_json statuses_json
  checks_json="$(gh api -H 'Accept: application/vnd.github+json' "repos/$REPO/commits/$sha/check-runs?per_page=100" 2>/dev/null)" || { echo UNKNOWN; return 0; }
  statuses_json="$(gh api "repos/$REPO/commits/$sha/status" 2>/dev/null)" || { echo UNKNOWN; return 0; }
  local pending_checks pending_statuses
  pending_checks="$(jq '[.check_runs[]? | select(.status != "completed")] | length' <<<"$checks_json")"
  pending_statuses="$(jq '[.statuses[]? | select(.state == "pending")] | length' <<<"$statuses_json")"
  if [ "$pending_checks" -gt 0 ] || [ "$pending_statuses" -gt 0 ]; then echo ACTIVE; else echo QUIET; fi
}

mapfile -t PRS < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha,.head.repo.full_name,.mergeable_state] | @tsv' \
    | head -n "$MAX_PRS"
)

echo "OPEN_PRS=${#PRS[@]}"

for row in "${PRS[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  IFS=$'\t' read -r NUM BR SHA HEAD_REPO MERGE_STATE <<<"$row"
  echo "---- PR #$NUM branch=$BR sha=${SHA:0:10} state=${MERGE_STATE:-UNKNOWN} ----"

  if [ "$HEAD_REPO" != "$REPO" ]; then
    echo "SKIP_FORK #$NUM repo=$HEAD_REPO"
    SKIP_FORK=$((SKIP_FORK + 1))
    continue
  fi
  if [ "${MERGE_STATE:-unknown}" = "dirty" ]; then
    echo "CONFLICT #$NUM mergeable_state=dirty"
    CONFLICT=$((CONFLICT + 1))
    continue
  fi
  if [ "${MERGE_STATE:-unknown}" != "behind" ]; then
    echo "SKIP_NOT_BEHIND #$NUM state=${MERGE_STATE:-UNKNOWN}"
    SKIP_NOT_BEHIND=$((SKIP_NOT_BEHIND + 1))
    continue
  fi

  ACTIVITY="$(head_activity "$SHA")"
  if [ "$ACTIVITY" = "ACTIVE" ]; then
    echo "SKIP_ACTIVE_CHECKS #$NUM head=${SHA:0:10}"
    SKIP_ACTIVE_CHECKS=$((SKIP_ACTIVE_CHECKS + 1))
    continue
  fi
  if [ "$ACTIVITY" = "UNKNOWN" ]; then
    echo "ERR_MEASURE_CI #$NUM head=${SHA:0:10}"
    OTHER_ERR=$((OTHER_ERR + 1))
    continue
  fi

  set +e
  OUT=$(gh api -X PUT "repos/$REPO/pulls/${NUM}/update-branch" -f expected_head_sha="$SHA" 2>&1)
  RC=$?
  set -e
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
  sleep "$SLEEP_BETWEEN_PR"
done

# Rearme conservador: somente FAIL do HEAD atual; CANCELLED não é ressuscitado.
mapfile -t PRS2 < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha,.head.repo.full_name] | @tsv' \
    | head -n "$MAX_PRS"
)

for row in "${PRS2[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  IFS=$'\t' read -r NUM BR SHA HEAD_REPO <<<"$row"
  [ "$HEAD_REPO" = "$REPO" ] || continue

  ACTIVITY="$(head_activity "$SHA")"
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
    gh run list --repo "$REPO" --commit "$SHA" --status failure -L "$MAX_RERUNS_PER_BRANCH" \
      --json databaseId --jq '.[].databaseId' 2>/dev/null || true
  )
  for RID in "${RUNS[@]:-}"; do
    [[ -z "${RID:-}" ]] && continue
    ATTEMPT="$(gh api "repos/$REPO/actions/runs/$RID" --jq '.run_attempt // 1' 2>/dev/null || echo 99)"
    if [ "$ATTEMPT" -gt 1 ]; then
      echo "RERUN_SKIP_ALREADY_RETRIED run=$RID attempt=$ATTEMPT"
      RERUN_SKIP=$((RERUN_SKIP + 1))
      continue
    fi
    set +e
    OUT=$(gh run rerun "$RID" --repo "$REPO" --failed 2>&1)
    RC=$?
    set -e
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

echo "RECEIPT UPDATED=$UPDATED NOOP=$NOOP SKIP_NOT_BEHIND=$SKIP_NOT_BEHIND SKIP_ACTIVE_CHECKS=$SKIP_ACTIVE_CHECKS SKIP_FORK=$SKIP_FORK CONFLICT=$CONFLICT OTHER_ERR=$OTHER_ERR RERUN_OK=$RERUN_OK RERUN_SKIP=$RERUN_SKIP"
if [ "$OTHER_ERR" -gt 0 ]; then
  echo "RESULT=FAIL_OTHER_ERR"
  exit 1
fi
if [ "$CONFLICT" -gt 0 ]; then
  echo "RESULT=BLOCKED_CONFLICT count=$CONFLICT"
else
  echo "RESULT=PASS_RADAR_EXECUTION"
fi
exit 0
