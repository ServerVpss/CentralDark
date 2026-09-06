#!/usr/bin/env bash
# Radar global de conflitos da Casa — mede TODOS os PRs abertos do repositório.
# O nome histórico vive em scripts/dependabot porque este é o motor canônico já existente.
# NÃO cria segundo resolvedor. NÃO faz merge. NÃO usa IA como autoridade.
# Dependabot pode usar resolução determinística especializada; PR humano é fail-closed
# e recebe receipt/label para o Writer sem apagar conflito semanticamente.

set -euo pipefail

REPO="${REPO:-ServerVpss/CentralDark}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"
RESOLVER="${RESOLVER:-scripts/dependabot/resolve-conflicts.sh}"
MAX_PRS="${MAX_PRS:-100}"
MAIN_REF="${MAIN_REF:-main}"

command -v gh >/dev/null || { echo 'BLOCKED_GH_ABSENT'; exit 2; }
command -v jq >/dev/null || { echo 'BLOCKED_JQ_ABSENT'; exit 2; }
[ -x "$REPO_DIR/$RESOLVER" ] || { echo "BLOCKED_RESOLVER_ABSENT=$REPO_DIR/$RESOLVER"; exit 2; }

main_sha="$(gh api "repos/$REPO/commits/$MAIN_REF" --jq '.sha')"

mapfile -t PRS < <(
  gh api --paginate "repos/$REPO/pulls?state=open&per_page=100" \
    --jq '.[] | [.number,.user.login,.head.repo.full_name,.head.ref,.head.sha,.base.ref,.created_at] | @tsv' \
    | sort -k7,7 \
    | head -n "$MAX_PRS"
)

echo "📡 REPOSITORY_CONFLICT_RADAR_TOTAL=${#PRS[@]}"
echo "🧱 RADAR_MAIN_REF=$MAIN_REF"
echo "🧱 RADAR_MAIN_SHA=$main_sha"

processed=0
updated=0
resolved_dependabot=0
human_conflicts=0
fork_blocked=0
unchanged=0
unknown=0
blocked=0

comment_conflict_receipt() {
  local pr="$1" author="$2" head_ref="$3" head_sha="$4" merge_state="$5"
  local marker='<!-- centraldark-global-conflict-radar -->'
  local body
  body="${marker}
## 📡 Radar Global de Conflitos — receipt

\`#ACORDAR → CURRENT → CONFLICT_RADAR → OWNER → NEXT_CURSOR\`

- PR: #${pr}
- autor: \`${author}\`
- branch: \`${head_ref}\`
- HEAD observado: \`${head_sha}\`
- main observada: \`${main_sha}\`
- mergeabilidade: \`${merge_state}\`
- classe: \`HUMAN_OR_NON_DEPENDABOT_CONFLICT\`
- resolução automática de conteúdo: **BLOQUEADA fail-closed**
- motor único: \`${RESOLVER}\`
- next cursor: \`SEMANTIC_WRITER_RECONCILE → SAME_HEAD_TEST → COUNTERPROOF\`

\`UNKNOWN != PASS\` · \`ONE_SYSTEM_ONLY\` · \`ONE_WRITER_PER_SCOPE\` · \`NO_CONFLICT_LEFT_UNSEEN=true\`"

  existing_id="$(gh api --paginate "repos/$REPO/issues/$pr/comments?per_page=100" \
    --jq ".[] | select(.body | contains(\"$marker\")) | .id" | tail -n1 || true)"
  if [ -n "$existing_id" ]; then
    gh api --method PATCH "repos/$REPO/issues/comments/$existing_id" -f "body=$body" >/dev/null
    echo "🧾 CONFLICT_RECEIPT=UPDATED comment_id=$existing_id"
  else
    created_id="$(gh api --method POST "repos/$REPO/issues/$pr/comments" -f "body=$body" --jq '.id')"
    echo "🧾 CONFLICT_RECEIPT=CREATED comment_id=$created_id"
  fi

  # Label existente da Casa; se indisponível, o radar continua e registra UNKNOWN.
  if gh api --method POST "repos/$REPO/issues/$pr/labels" -f 'labels[]=🔄 GIT-DIVERGÊNCIA' >/dev/null 2>&1; then
    echo "🏷️ CONFLICT_LABEL=APPLIED"
  else
    echo "🟡 CONFLICT_LABEL=UNKNOWN_OR_UNAVAILABLE"
  fi
}

for row in "${PRS[@]}"; do
  IFS=$'\t' read -r pr author head_repo head_ref head_sha base_ref created_at <<<"$row"
  processed=$((processed + 1))
  kind='human'
  [ "$author" = 'dependabot[bot]' ] && kind='dependabot'

  echo ""
  echo "🧭 PR=$pr AUTHOR=$author KIND=$kind HEAD_REPO=$head_repo HEAD_REF=$head_ref HEAD_SHA=$head_sha BASE=$base_ref CREATED_AT=$created_at"

  if [ "$base_ref" != "$MAIN_REF" ]; then
    echo "🟡 NON_MAIN_BASE=1 — medido, não ignorado; mutação bloqueada"
    blocked=$((blocked + 1))
    continue
  fi

  if [ "$head_repo" != "$REPO" ]; then
    echo "🛡️ FORK_PR=1 — radar mede, mas não muta branch externa"
    fork_blocked=$((fork_blocked + 1))
    continue
  fi

  # Update branch é sincronização, não aprovação. Vale para qualquer PR same-repo.
  set +e
  update_json="$(gh api \
    --method PUT \
    -H 'Accept: application/vnd.github+json' \
    "repos/$REPO/pulls/$pr/update-branch" \
    -f "expected_head_sha=$head_sha" 2>&1)"
  update_rc=$?
  set -e

  if [ "$update_rc" -eq 0 ]; then
    echo "🔄 UPDATE_BRANCH=REQUESTED kind=$kind"
    printf '%s\n' "$update_json"
    updated=$((updated + 1))
    continue
  fi

  # 422 pode ser up-to-date ou conflito. Sempre remedir; nunca deduzir por erro textual.
  pr_json="$(gh api "repos/$REPO/pulls/$pr")"
  mergeable="$(jq -r 'if .mergeable == null then "UNKNOWN" else (.mergeable|tostring) end' <<<"$pr_json")"
  mergeable_state="$(jq -r '.mergeable_state // "UNKNOWN"' <<<"$pr_json")"
  current_sha="$(jq -r '.head.sha' <<<"$pr_json")"

  echo "🧭 UPDATE_BRANCH_RC=$update_rc MERGEABLE=$mergeable MERGEABLE_STATE=$mergeable_state CURRENT_HEAD=$current_sha"

  if [ "$mergeable" = "false" ] || [ "$mergeable_state" = "dirty" ]; then
    echo "🪡 CONFLICT_DETECTED=1 kind=$kind — passa pelo motor único da Casa"
    if [ "$kind" = 'dependabot' ]; then
      set +e
      PR_KIND=dependabot PR_HEAD_REF="$head_ref" REPO_DIR="$REPO_DIR" bash "$REPO_DIR/$RESOLVER" "$pr"
      resolve_rc=$?
      set -e
      if [ "$resolve_rc" -eq 0 ]; then
        echo "🟢 DEPENDABOT_CONFLICT_RECONCILE=PASS"
        resolved_dependabot=$((resolved_dependabot + 1))
      else
        echo "🟠 DEPENDABOT_CONFLICT_RECONCILE=BLOCKED rc=$resolve_rc"
        blocked=$((blocked + 1))
      fi
    else
      # Todo conflito passa pelo mesmo motor, mas PR humano não aceita resolução cega.
      set +e
      PR_KIND=human PR_HEAD_REF="$head_ref" REPO_DIR="$REPO_DIR" bash "$REPO_DIR/$RESOLVER" "$pr"
      resolve_rc=$?
      set -e
      echo "🧿 HUMAN_CONFLICT_ROUTED rc=$resolve_rc"
      comment_conflict_receipt "$pr" "$author" "$head_ref" "$current_sha" "$mergeable_state"
      human_conflicts=$((human_conflicts + 1))
    fi
  elif [ "$mergeable" = "UNKNOWN" ]; then
    echo "🟡 MERGEABILITY=UNKNOWN — preservado como UNKNOWN"
    unknown=$((unknown + 1))
  elif [ "$current_sha" != "$head_sha" ]; then
    echo "🔄 REMOTE_MOVED=1 OLD=$head_sha NEW=$current_sha — remeasure only"
    unchanged=$((unchanged + 1))
  else
    echo "⚪ UPDATE_BRANCH_NOOP_OR_UP_TO_DATE — sem conflito provado"
    unchanged=$((unchanged + 1))
  fi

done

echo ""
echo "🧾 REPOSITORY_CONFLICT_RADAR_RECEIPT"
echo "MAIN_SHA=$main_sha"
echo "PROCESSED=$processed"
echo "UPDATE_BRANCH_REQUESTED=$updated"
echo "DEPENDABOT_CONFLICT_RESOLVED=$resolved_dependabot"
echo "HUMAN_CONFLICT_ROUTED=$human_conflicts"
echo "FORK_BLOCKED=$fork_blocked"
echo "UNCHANGED_OR_REMOTE_MOVED=$unchanged"
echo "UNKNOWN=$unknown"
echo "BLOCKED=$blocked"
echo "MERGE_PERFORMED=0"
echo "AI_DECISION_USED=0"
echo "ALL_OPEN_PRS_INCLUDED=1"
echo "DEPENDABOT_AND_HUMAN_CONFLICTS_SHARE_RADAR=1"
echo "HUMAN_CONFLICT_AUTO_CONTENT_RESOLUTION=0"
echo "ONE_CONFLICT_ENGINE=1"
echo "UNKNOWN_IS_PASS=0"
