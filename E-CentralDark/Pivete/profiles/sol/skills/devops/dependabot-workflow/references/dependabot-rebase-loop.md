# Dependabot Rebase Loop — Diagnostic Recipe (PR #1201 case)

Session-specific sequence that diagnosed and attempted to fix a dependabot rebase loop.

## Symptom observed

PR #1201 (`chore(deps): bump @eslint/js from 9.32.0 to 9.39.5`) accumulated merge commits from repeated `@dependabot rebase` invocations. Dependabot replied each time: "Looks like this PR has been edited by someone other than Dependabot. That means Dependabot can't rebase it."

## Diagnosis sequence

1. Inspect commit history:
   ```bash
   gh pr view 1201 --json commits --jq '.commits[] | .messageHeadline'
   # Output showed:
   #   chore(deps): bump @eslint/js from 9.32.0 to 9.39.5
   #   Merge branch 'main' into dependabot/npm_and_yarn/eslint/js-9.39.5
   #   Merge branch 'main' into dependabot/npm_and_yarn/eslint/js-9.39.5
   ```
   The two merge commits are the loop artifact.

2. Inspect the diff to confirm it is a pure dependency bump:
   ```bash
   gh pr diff 1201 | head -40
   # Diff was limited to package.json + package-lock.json.
   ```

3. Classify: **history problem, not code problem.** The diff is correct; the branch is dirty from rebase retries.

## Escape hatch attempted

```bash
gh pr comment 1201 --body "@dependabot recreate"
```

After firing, waited ~3 minutes and re-checked:
```bash
gh api repos/ServerVpss/CentralDark/pulls/1201 --jq '{state: .state, commits: .commits, head: .head.ref}'
gh api repos/ServerVpss/CentralDark/pulls/1201/commits --jq '.[].sha'
# Result: still 3 commits, same merge-commit history. `recreate` did not resolve within the wait window.
```

## State verification when git auth failed

During investigation, `git fetch origin main` failed with authentication error, but `gh api` calls succeeded:
```bash
gh api repos/ServerVpss/CentralDark/branches/main --jq '{sha: .commit.sha}'
# Returned 5d7b1149ca26e9c9bf591bca755353e43516e230
# vs earlier cached origin/main c8df7c721973f5ea78035f2346eb29a57d197188
```

Lesson: when git auth is flaky but `gh` auth works, use `gh api` for state queries. Re-measure main before declaring state — it can change mid-session.

## Manual fallback (not completed in-session)

Planned fallback when `@dependabot recreate` did not resolve:
1. `git fetch origin main && git reset --hard origin/main` (caution: destroys uncommitted changes)
2. Apply only the eslint bump to package.json + package-lock.json
3. Regenerate lockfile cleanly
4. Single commit + `git push --force-with-lease origin dependabot/npm_and_yarn/eslint/js-9.39.5`

This is safe only for pure dependency bumps where the diff is limited to manifests/lockfiles. Not safe if the branch carries meaningful human-authored commits.

## Classification learned

- The loop is **not** a dependabot bug (not proven).
- The loop is a **state conflict**: external rebase attempts add merge commits, which Dependabot interprets as "edited externally".
- `@dependabot rebase` is **not** the remedy once Dependabot has refused — it makes the history dirtier.
- `@dependabot recreate` is the documented escape; manual reset is the fallback when the command channel is unresponsive.
