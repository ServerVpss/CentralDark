#!/usr/bin/env bash
# Radar Casa — sincroniza PRs abertos sem provocar loop de HEAD/CI.
# Rodar só via workflow Dependabot (schedule/workflow_dispatch) no self-hosted VPS1.
# update-branch = sincronização, NÃO aprovação, NÃO merge.
# Regra anti-thrash: CI ativo no HEAD => WAIT, não muda HEAD e não rearma run.
# Rearme considera somente runs failure/cancelled do HEAD ATUAL do PR.
# Conflito real → CONFLICT logado e segue. UNKNOWN ≠ PASS.

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
MAX_PRS="${MAX_PRS:-100}"
MAX_RERUNS_PER_BRANCH="${MAX_RERUNS_PER_BRANCH:-8}"
SLEEP_BETWEEN_PR="${SLEEP_BETWEEN_PR:-0.8}"

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }

UPDATED=0
NOOP=0
WAITING_CI=0
CONFLICT=0
OTHER_ERR=0
RERUN_OK=0
RERUN_SKIP=0
RERUN_WAIT=0

echo "📡 ALL_OPEN_PRS_SYNC_START repo=$REPO max=$MAX_PRS"
echo "RULE update-branch=SYNC_ONLY approval=false merge=false active_ci=head_immutable"

head_has_active_ci() {
  local sha="$1"
  local active_checks active_statuses

  set +e
  active_checks=$(gh api "repos/$REPO/commits/$sha/check-runs?per_page=100" \
    --jq '[.check_runs[] | select(.status != "completed")] | length' 2>/dev/null)
  local rc_checks=$?
  active_statuses=$(gh api "repos/$REPO/commits/$sha/status" \
    --jq '[.statuses[] | select(.state == "pending")] | length' 2>/dev/null)
  local rc_statuses=$?
  set -e

  # Falha de medição não autoriza mutação: UNKNOWN != PASS.
  if [ "$rc_checks" -ne 0 ] || [ "$rc_statuses" -ne 0 ]; then
    echo "UNKNOWN"
    return 0
  fi

  if [ "${active_checks:-0}" -gt 0 ] || [ "${active_statuses:-0}" -gt 0 ]; then
    echo "YES"
  else
    echo "NO"
  fi
}

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

  ACTIVE=$(head_has_active_ci "$SHA")
  if [ "$ACTIVE" = "YES" ]; then
    echo "WAIT_CI #$NUM head=${SHA:0:10} (não alterar HEAD durante julgamento)"
    WAITING_CI=$((WAITING_CI + 1))
    continue
  fi
  if [ "$ACTIVE" = "UNKNOWN" ]; then
    echo "ERR_MEASURE_CI #$NUM head=${SHA:0:10}"
    OTHER_ERR=$((OTHER_ERR + 1))
    continue
  fi

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

# Brief settle so GitHub indexes new head SHAs after legitimate update-branch merges.
sleep 5

# Refresh PR list: heads may have moved. SHA é obrigatório para não rerodar história velha.
mapfile -t PRS2 < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.head.ref,.head.sha] | @tsv' \
    | head -n "$MAX_PRS"
)

for row in "${PRS2[@]:-}"; do
  [[ -z "${row:-}" ]] && continue
  NUM=$(printf '%s' "$row" | cut -f1)
  BR=$(printf '%s' "$row" | cut -f2)
  SHA=$(printf '%s' "$row" | cut -f3)
  echo "---- RERUN #$NUM branch=$BR sha=${SHA:0:10} ----"

  ACTIVE=$(head_has_active_ci "$SHA")
  if [ "$ACTIVE" = "YES" ]; then
    echo "RERUN_WAIT #$NUM active_ci_on_current_head"
    RERUN_WAIT=$((RERUN_WAIT + 1))
    continue
  fi
  if [ "$ACTIVE" = "UNKNOWN" ]; then
    echo "RERUN_SKIP #$NUM ci_measurement_unknown"
    RERUN_SKIP=$((RERUN_SKIP + 1))
    OTHER_ERR=$((OTHER_ERR + 1))
    continue
  fi

  mapfile -t RUNS < <(
    {
      gh run list --repo "$REPO" --branch "$BR" --commit "$SHA" --status failure -L "$MAX_RERUNS_PER_BRANCH" --json databaseId --jq '.[].databaseId' 2>/dev/null || true
      gh run list --repo "$REPO" --branch "$BR" --commit "$SHA" --status cancelled -L 4 --json databaseId --jq '.[].databaseId' 2>/dev/null || true
    } | awk 'NF' | sort -u | head -n "$MAX_RERUNS_PER_BRANCH"
  )

  if [ "${#RUNS[@]}" -eq 0 ]; then
    echo "RERUN_NONE #$NUM current_head_only"
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
      echo "RERUN_OK run=$RID head=${SHA:0:10}"
      RERUN_OK=$((RERUN_OK + 1))
    else
      echo "RERUN_SKIP run=$RID :: $(printf '%s' "$OUT" | tr '\n' ' ' | head -c 180)"
      RERUN_SKIP=$((RERUN_SKIP + 1))
    fi
    sleep 0.35
  done
done

echo "RECEIPT UPDATED=$UPDATED NOOP=$NOOP WAITING_CI=$WAITING_CI CONFLICT=$CONFLICT OTHER_ERR=$OTHER_ERR RERUN_OK=$RERUN_OK RERUN_WAIT=$RERUN_WAIT RERUN_SKIP=$RERUN_SKIP"
echo "ALL_OPEN_PRS_SYNC_DONE"
# CONFLICT = sync bloqueado por conflito real (log only; sync≠resolve).
# WAITING_CI/RERUN_WAIT = estado saudável: preservar HEAD enquanto o CI julga.
# OTHER_ERR = falha de API/medição → fail-closed (UNKNOWN≠PASS / no false-green).
if [ "$OTHER_ERR" -gt 0 ]; then
  echo "RESULT=FAIL OTHER_ERR=$OTHER_ERR"
  exit 1
fi
echo "RESULT=PASS"
exit 0
