# GitHub Fast Inventory for CentralDark Reconciliation

Use the existing authenticated `gh api` route for read-only inventory. Never print tokens; `gh` resolves its configured credential source.

## Preflight

Run through `terminal`:

```bash
gh auth status
REPO=ServerVpss/CentralDark
PR_NUMBER=<number>
```

If `gh auth status` fails, classify `GITHUB_API=BLOCKED` and do not substitute an unrelated credential.

## Correlated reads

Use the same `REPO`, PR number, and exact SHA for every read:

```bash
gh api "repos/$REPO/commits/main" --jq '{sha,message:.commit.message}'
gh api "repos/$REPO/pulls/$PR_NUMBER" --jq '{number,state,base_sha:.base.sha,head_sha:.head.sha,base_ref:.base.ref,head_ref:.head.ref,mergeable,merge_state_status}'
gh api "repos/$REPO/git/ref/heads/<branch>" --jq '{ref,sha:.object.sha}'
gh api "repos/$REPO/commits/<sha>" --jq '{sha,message:.commit.message,author:.author.login}'
gh api "repos/$REPO/commits/<sha>/check-runs?per_page=100" --jq '{total_count,check_runs:[.check_runs[]|{name,status,conclusion,head_sha}]}'
gh api "repos/$REPO/commits/<sha>/status" --jq '{state,total_count,statuses:[.statuses[]|{context,state,description}]}'
gh api "repos/$REPO/actions/runs?head_sha=<sha>&per_page=100" --jq '{total_count,workflow_runs:[.workflow_runs[]|{id,name,status,conclusion,head_sha,event}]}'
gh api --paginate "repos/$REPO/pulls/$PR_NUMBER/reviews?per_page=100" --jq '.[]|{id,state,user:.user.login,commit_id}'
gh api --paginate "repos/$REPO/issues/$PR_NUMBER/comments?per_page=100" --jq '.[]|{id,created_at,user:.user.login,body}'
```

For branches, issues, or open PR inventory, use `--paginate` and preserve the exact cursor/page in the receipt. Do not treat a summary count as complete without checking `has_more`/pagination behavior.

## Reconciliation gates

- `MAIN_SHA`, `PR_HEAD_SHA`, `BASE_SHA`, and `CHECK_HEAD_SHA` must be recorded together.
- A check is current only when `head_sha` equals the target SHA; old green checks are historical.
- `status=queued|in_progress|pending` is not PASS; `cancelled`, `failure`, `action_required`, and missing check runs remain visible.
- `PR=OPEN` is a state readback, not merge or deploy proof.
- Reviews/comments are provenance; they do not replace tests or runtime readback.
- Use one API snapshot per cycle, then query only changed resources when the cursor and SHA remain valid.

## Receipt

```text
GITHUB_API=PASS|BLOCKED|FAIL
REPO=ServerVpss/CentralDark
PR=
PR_STATE=
MAIN_SHA=
BASE_SHA=
PR_HEAD_SHA=
BRANCH_SHA=
CHECKS_SHA=
CHECKS_STATE=
WORKFLOW_RUNS_SHA=
REVIEWS_READ=
COMMENTS_READ=
CURSOR=
COUNTERPROOF=
NEXT_CURSOR=
```

The inventory is a fast evidence source, not an approval engine. Mutation still goes through the exact owner/writer gate and the active PR readback funnel.