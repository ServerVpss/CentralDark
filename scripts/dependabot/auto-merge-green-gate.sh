#!/usr/bin/env bash
# CENTRALDARK: gate do auto-merge seguro, sem segundo motor nem merge forçado.
# Uso: bash scripts/dependabot/auto-merge-green-gate.sh <PR> [--enable]
# Sem --enable: somente leitura. Com --enable: delega o merge ao GitHub,
# que continua respeitando branch protection e required checks.
set -euo pipefail
PR="${1:-}"
MODE="${2:---check}"
REPO="${REPO:-ServerVpss/CentralDark}"
if [[ ! "$PR" =~ ^[0-9]+$ ]] || [[ "$MODE" != "--check" && "$MODE" != "--enable" ]]; then
  echo 'USAGE: auto-merge-green-gate.sh <PR_NUMBER> [--enable]'; exit 2
fi
for exe in gh jq; do command -v "$exe" >/dev/null || { echo "BLOCKED_MISSING_$exe"; exit 2; }; done
snapshot="$(gh api "repos/$REPO/pulls/$PR")"
head="$(jq -r '.head.sha' <<<"$snapshot")"
base="$(jq -r '.base.ref' <<<"$snapshot")"
ref="$(jq -r '.head.ref' <<<"$snapshot")"
state="$(jq -r '.state' <<<"$snapshot")"
draft="$(jq -r '.draft' <<<"$snapshot")"
mergeable="$(jq -r '.mergeable | tostring' <<<"$snapshot")"
same_repo="$(jq -r '.head.repo.full_name == .base.repo.full_name' <<<"$snapshot")"
[[ "$state" == open && "$draft" == false && "$base" == main && "$ref" != main && "$same_repo" == true && "$mergeable" == true ]] || {
  echo "YELLOW_PR_NOT_ELIGIBLE head=$head mergeable=$mergeable draft=$draft"; exit 20;
}
# API01..API16 continuam sendo contrato material; não usar mergeable como PASS.
body="$(jq -r '.body // ""' <<<"$snapshot")"
for n in $(seq -w 1 16); do
  grep -Eq -- "- \[x\] API$n([[:space:]]|\b)" <<<"$body" || { echo "YELLOW_API${n}_NOT_PROVED head=$head"; exit 20; }
done
grep -Fq "FIXED_POINT_GLOBAL=TRUE" <<<"$body" || { echo "YELLOW_FIXED_POINT_NOT_PROVED head=$head"; exit 20; }
checks="$(gh api --paginate "repos/$REPO/commits/$head/check-runs?per_page=100" --jq '.check_runs[] | [.name,.status,.conclusion] | @tsv')"
[[ -n "$checks" ]] || { echo "YELLOW_NO_CHECKS head=$head"; exit 20; }
while IFS=$'\t' read -r name status conclusion; do
  [[ "$status" == completed && ( "$conclusion" == success || "$conclusion" == neutral || "$conclusion" == skipped ) ]] || {
    echo "YELLOW_CHECK name=$name status=$status conclusion=$conclusion head=$head"; exit 20;
  }
done <<<"$checks"
combined="$(gh api "repos/$REPO/commits/$head/status" --jq '.state')"
[[ "$combined" == success || "$combined" == pending ]] || { echo "YELLOW_COMMIT_STATUS=$combined"; exit 20; }
if [[ "$combined" == pending ]]; then
  n="$(gh api "repos/$REPO/commits/$head/status" --jq '.statuses | length')"
  [[ "$n" == 0 ]] || { echo "YELLOW_COMMIT_STATUS_PENDING"; exit 20; }
fi
fresh="$(gh api "repos/$REPO/pulls/$PR" --jq '.head.sha')"
[[ "$fresh" == "$head" ]] || { echo "YELLOW_HEAD_MOVED from=$head to=$fresh"; exit 20; }
echo "GREEN_ELIGIBLE=1 PR=$PR SAME_HEAD=$head API_GATES=16/16 CHECKS=PASS"
if [[ "$MODE" == "--enable" ]]; then
  gh pr merge "$PR" --repo "$REPO" --auto --squash --match-head-commit "$head"
  echo "AUTO_MERGE_REQUESTED=1 MERGED_NOT_ASSUMED=1"
fi
