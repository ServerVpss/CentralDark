#!/usr/bin/env bash
# Radar determinístico do Dependabot — sincroniza branches e reconcilia conflitos.
# NÃO faz merge. NÃO usa IA como autoridade. Checks amarelos não impedem update-branch.
# Varre TODOS os PRs abertos do dependabot[bot], inclusive antigos.

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
RESOLVER="${RESOLVER:-scripts/dependabot/resolve-conflicts.sh}"
MAX_PRS="${MAX_PRS:-100}"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

# Código confiável e repositório mutável são fronteiras diferentes.
# Em CI, este radar roda do checkout confiável .ci-house, enquanto REPO_DIR
# aponta para a Casa persistente usada pelo resolver para fetch/worktree/push.
# Preferimos o resolver irmão do próprio radar e preservamos override/fallback.
if [ -n "${RESOLVER_PATH:-}" ]; then
  :
elif [ -f "$SCRIPT_DIR/$(basename "$RESOLVER")" ]; then
  RESOLVER_PATH="$SCRIPT_DIR/$(basename "$RESOLVER")"
else
  RESOLVER_PATH="$REPO_DIR/$RESOLVER"
fi

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }
[ -f "$RESOLVER_PATH" ] || { echo "BLOCKED_RESOLVER_ABSENT=$RESOLVER_PATH"; exit 2; }
[ -d "$REPO_DIR/.git" ] || [ -f "$REPO_DIR/.git" ] || { echo "BLOCKED_REPO_NOT_FOUND=$REPO_DIR"; exit 2; }

echo "🧭 RESOLVER_SOURCE=$RESOLVER_PATH"
echo "🏠 REPO_DIR=$REPO_DIR"

mapfile -t PRS < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | select(.user.login == "dependabot[bot]") | [.number,.head.ref,.head.sha,.created_at] | @tsv' \
    | sort -k4,4 \
    | head -n "$MAX_PRS"
)

echo "🤖 DEPENDABOT_RADAR_TOTAL=${#PRS[@]}"

processed=0
updated=0
resolved=0
unchanged=0
blocked=0

for row in "${PRS[@]}"; do
  IFS=$'\t' read -r pr head_ref head_sha created_at <<<"$row"
  processed=$((processed + 1))

  echo ""
  echo "🧭 PR=$pr HEAD_REF=$head_ref HEAD_SHA=$head_sha CREATED_AT=$created_at"

  # Update branch é sincronização com a base, não aprovação. Pode rodar com checks pendentes.
  set +e
  update_json="$(gh api \
    --method PUT \
    -H 'Accept: application/vnd.github+json' \
    "repos/$REPO/pulls/$pr/update-branch" \
    -f "expected_head_sha=$head_sha" 2>&1)"
  update_rc=$?
  set -e

  if [ "$update_rc" -eq 0 ]; then
    echo "🔄 UPDATE_BRANCH=REQUESTED"
    printf '%s\n' "$update_json"
    updated=$((updated + 1))
    continue
  fi

  # Remeça o PR. 422 no update-branch pode ser branch já atualizada OU conflito.
  pr_json="$(gh api "repos/$REPO/pulls/$pr")"
  mergeable="$(jq -r '.mergeable // "UNKNOWN"' <<<"$pr_json")"
  mergeable_state="$(jq -r '.mergeable_state // "UNKNOWN"' <<<"$pr_json")"
  current_sha="$(jq -r '.head.sha' <<<"$pr_json")"

  echo "🧭 UPDATE_BRANCH_RC=$update_rc MERGEABLE=$mergeable MERGEABLE_STATE=$mergeable_state CURRENT_HEAD=$current_sha"

  if [ "$mergeable" = "false" ] || [ "$mergeable_state" = "dirty" ]; then
    echo "🪡 CONFLICT_DETECTED=1 — acionando motor único da Casa"
    set +e
    PR_HEAD_REF="$head_ref" REPO_DIR="$REPO_DIR" bash "$RESOLVER_PATH" "$pr"
    resolve_rc=$?
    set -e
    if [ "$resolve_rc" -eq 0 ]; then
      echo "🟢 CONFLICT_RECONCILE=PASS"
      resolved=$((resolved + 1))
    else
      echo "🟠 CONFLICT_RECONCILE=BLOCKED rc=$resolve_rc"
      blocked=$((blocked + 1))
    fi
  elif [ "$current_sha" != "$head_sha" ]; then
    # Outro ator/Dependabot atualizou entre a leitura e a tentativa. Não repete mutação.
    echo "🔄 REMOTE_MOVED=1 OLD=$head_sha NEW=$current_sha — remeasure only"
    unchanged=$((unchanged + 1))
  else
    echo "⚪ UPDATE_BRANCH_NOOP_OR_POLICY_BLOCK — sem conflito provado; não inventar mutação"
    blocked=$((blocked + 1))
  fi

done

echo ""
echo "🧾 DEPENDABOT_RADAR_RECEIPT"
echo "PROCESSED=$processed"
echo "UPDATE_BRANCH_REQUESTED=$updated"
echo "CONFLICT_RESOLVED=$resolved"
echo "UNCHANGED_OR_REMOTE_MOVED=$unchanged"
echo "BLOCKED=$blocked"
echo "MERGE_PERFORMED=0"
echo "AI_DECISION_USED=0"
echo "CHECKS_PENDING_BLOCK_UPDATE_BRANCH=0"
echo "OLD_OPEN_PRS_INCLUDED=1"
echo "UNKNOWN_IS_PASS=0"
