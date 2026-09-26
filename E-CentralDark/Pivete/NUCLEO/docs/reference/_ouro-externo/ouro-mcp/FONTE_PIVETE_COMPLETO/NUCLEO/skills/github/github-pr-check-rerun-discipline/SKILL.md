---
name: github-pr-check-rerun-discipline
description: Use when PR labels changed and CI reruns stay stale.
version: 1.0.0
author: Hermes Agent
metadata:
  hermes:
    tags: [github, pull-requests, actions, checks, rerun, ci, false-green]
---

# GitHub PR Check Rerun Discipline

Use this skill when a PR check failed because authorization, labels, PR body, or approval state changed after the original workflow run.

Goal: re-run the check that sees the current PR event state, not a stale run whose original event payload still says the old state.

## Core rule

A GitHub Actions **rerun keeps the original event payload**.

So if a PR gained a label after the first run, re-running the original run can still evaluate expressions like:

```text
contains(github.event.pull_request.labels.*.name, 'permito-pivete')
```

against the old event payload.

That can keep producing:

```text
PIVETE_APPROVED=false
```

even when the PR currently shows the label.

## Correct sequence

1. Read the current PR state:

```bash
gh pr view <PR> --repo <OWNER/REPO> --json labels,headRefOid,body
```

2. Read check status:

```bash
gh pr checks <PR> --repo <OWNER/REPO>
```

3. Inspect failing logs and confirm the failing variable/value:

```bash
gh run view <RUN_ID> --repo <OWNER/REPO> --job <JOB_ID> --log
```

Look specifically for the evaluated env values, for example:

```text
PIVETE_APPROVED: false
BASE_SHA: ...
HEAD_SHA: ...
```

4. If a label/body approval was added after the failed run, locate the later run created by the `labeled`, `edited`, or relevant PR event.

```bash
gh run list --repo <OWNER/REPO> --branch <BRANCH> --limit 20 \
  --json databaseId,workflowName,status,conclusion,createdAt,updatedAt,headSha,url,event
```

5. Prefer re-running the run created **after** the approval/label event, not the original stale run.

```bash
gh run rerun <POST_LABEL_RUN_ID> --repo <OWNER/REPO>
```

6. Poll until completion, then verify the actual log contains the updated gate value and no errors:

```text
PIVETE_APPROVED: true
"ok": true
"errors": []
```

7. Only then treat the previous red check as resolved. Do not merge solely because CI is green if content or human review gates remain.

## Decision table

| Situation | Action |
|---|---|
| Current PR has label, old run says env false | Do not patch code yet; find/run post-label workflow attempt |
| Old run rerun still says env false | Expected stale payload; not proof label is ignored globally |
| Post-label run says env true and passes | CI authorization gate resolved |
| Post-label run says env true but fails elsewhere | Continue with the new real failure |
| No post-label run exists | Trigger workflow through the repository’s approved mechanism, or ask for the authorized remote action if required |

## Pitfalls

- Do not confuse **current PR labels** with the labels embedded in an old workflow event payload.
- Do not patch source files just to fix a CI gate that only needs the correct event run.
- Do not mark `MERGE_READY` from CI alone when the PR body declares fixtures, human review, or Casa validation still pending.
- Do not hide cancelled runs: a cancelled post-label run can be the correct run to rerun because it carries the updated event payload.
- Do not use skipped checks as substitutes for successful checks.

## References

- `references/pr-label-event-rerun.md` — concrete reproduction pattern from a PR where stale reruns kept `PIVETE_APPROVED=false` until the post-label run was rerun.
