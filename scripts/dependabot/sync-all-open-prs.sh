#!/usr/bin/env bash
# Radar Casa — Update branch em TODOS os PRs abertos + rearme de jobs falhos/cancelados.
# Rodar só via workflow Dependabot (schedule/workflow_dispatch) no self-hosted VPS1.
# update-branch = sincronização, NÃO aprovação, NÃO merge.
# Conflito real → CONFLICT logado e segue. UNKNOWN ≠ PASS.

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
MAX_PRS="${MAX_PRS:-100}"
MAX_RERUNS_PER_BRANCH="${MAX_RERUNS_PER_BRANCH:-8}"
SLEEP_BETWEEN_PR="${SLEEP_BETWEEN_PR:-0.8}"

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }

UPDATED=0
NOOP=0
CONFLICT=0
OTHER_ERR=0
RERUN_OK=0
RERUN_SKIP=0

echo "📡 ALL_OPEN_PRS_SYNC_START repo=$REPO max=$MAX_PRS"
echo "RULE update-branch=SYNC_ONLY approval=false merge=false"

mapfile -t PRS < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha] | @tsv' \
    | head -n "$MAX_PRS"
)

echo "OPEN_PRS=${#PRS[@]}"

for row in "${PRS[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  NUM=$(printf '%s' "$row" | cut -f1)
  BR=$(printf '%s' "$row" | cut -f2)
  SHA=$(printf '%s' "$row" | cut -f3)

  echo "---- PR #$NUM branch=$BR sha=${SHA:0:10} ----"

  set +e
  OUT=$(gh api -X PUT "repos/$REPO/pulls/${NUM}/update-branch" -f expected_head_sha="$SHA" 2>&1)
  RC=$?
  set -e

  if [ "$RC" -eq 0 ]; then
    echo "UPDATE #$NUM OK"
    UPDATED=$((UPDATED + 1))
  elif printf '%s' "$OUT" | grep -qi 'no new commits on the base branch'; then
    echo "NOOP #$NUM already_synced"
    NOOP=$((NOOP + 1))
  elif printf '%s' "$OUT" | grep -qi 'merge conflict'; then
    echo "CONFLICT #$NUM (manual reconcile needed)"
    CONFLICT=$((CONFLICT + 1))
  else
    echo "ERR_UPDATE #$NUM rc=$RC :: $(printf '%s' "$OUT" | tr '\n' ' ' | head -c 240)"
    OTHER_ERR=$((OTHER_ERR + 1))
  fi

  sleep "$SLEEP_BETWEEN_PR"
done

# Brief settle so GitHub indexes new head SHAs after update-branch merges
sleep 5

# Refresh PR list (heads may have moved)
mapfile -t PRS2 < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref] | @tsv' \
    | head -n "$MAX_PRS"
)

for row in "${PRS2[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  NUM=$(printf '%s' "$row" | cut -f1)
  BR=$(printf '%s' "$row" | cut -f2)
  echo "---- RERUN #$NUM branch=$BR ----"

  mapfile -t RUNS < <(
    {
      gh run list --repo "$REPO" --branch "$BR" --status failure -L "$MAX_RERUNS_PER_BRANCH" --json databaseId --jq '.[].databaseId' 2>/dev/null || true
      gh run list --repo "$REPO" --branch "$BR" --status cancelled -L 4 --json databaseId --jq '.[].databaseId' 2>/dev/null || true
    } | awk 'NF' | sort -u | head -n "$MAX_RERUNS_PER_BRANCH"
  )

  if [ "${#RUNS[@]}" -eq 0 ]; then
    echo "RERUN_NONE #$NUM"
    continue
  fi

  for RID in "${RUNS[@]}"; do
    set +e
    OUT=$(gh run rerun "$RID" --repo "$REPO" --failed 2>&1)
    RC=$?
    if [ "$RC" -ne 0 ]; then
      OUT=$(gh run rerun "$RID" --repo "$REPO" 2>&1)
      RC=$?
    fi
    set -e
    if [ "$RC" -eq 0 ]; then
      echo "RERUN_OK run=$RID"
      RERUN_OK=$((RERUN_OK + 1))
    else
      echo "RERUN_SKIP run=$RID :: $(printf '%s' "$OUT" | tr '\n' ' ' | head -c 180)"
      RERUN_SKIP=$((RERUN_SKIP + 1))
    fi
    sleep 0.35
  done
done

echo "RECEIPT UPDATED=$UPDATED NOOP=$NOOP CONFLICT=$CONFLICT OTHER_ERR=$OTHER_ERR RERUN_OK=$RERUN_OK RERUN_SKIP=$RERUN_SKIP"
echo "ALL_OPEN_PRS_SYNC_DONE"
# Never fail the job solely for per-PR conflicts — receipt is the truth.
exit 0
