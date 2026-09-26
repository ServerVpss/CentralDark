# Repo Contract: Local PASS ≠ Remote CI PASS

## Symptom
`uv run --no-project python scripts/trigger-fabric/verify_repo_contract.py .` returns
`REPO_CONTRACT_VERIFY=PASS` locally, but the self-hosted runner (`porta-de-entrada` /
`Autonomia — promoção segura`) fails with `GLOBAL_RUNNER_POLICY ok:false`,
`CANONICAL_RUNNER_POLICY=FAIL`, `runner_violations: [...]`.

## Root cause
The runner checks out `origin/main` with `fetch-depth: 0` (full remote tree).
The local working branch (e.g. `pr-1221-head`) may not contain files that exist
on `origin/main`. Example from 2026-08-27: `vps-reboot-forensic.yml` and
`vps-wake-hosted-ssh.yml` use `runs-on: ubuntu-latest` (forbidden by
GLOBAL_RUNNER_POLICY). They existed on `origin/main` but were absent from the local
checkout → local run saw 0 violations and printed PASS. The remote runner saw them
and printed FAIL. Same script, different tree = different verdict.

## Verification recipe (trust the remote, not local disk)
1. `git fetch origin --quiet`
2. Query the REMOTE tree, never local `ls`:
   `git ls-tree origin/main --name-only .github/workflows/ | grep -i vps`
   `git cat-file -e origin/main:.github/workflows/<file>.yml && echo EXISTS_ON_REMOTE`
3. If local `ls .github/workflows/<file>` says "No such file" but the remote has it,
   the local PASS is a false green. The runner's view of `origin/main` is authoritative.
4. To reproduce the runner's exact result locally, check out a clean `origin/main` tree
   (worktree or `git checkout origin/main -- .` in a scratch dir) BEFORE running
   `verify_repo_contract.py`.

## Verdict discipline (FALSE_GREEN_VERDICT_FLIP_LOOP)
A contradictory local re-run does NOT invalidate an earlier remote-derived diagnosis.
Re-measure the remote state first:
- `git ls-tree origin/main --name-only <dir>`
- `gh run view <run_id> --repo ServerVpss/CentralDark --log`
- `gh api repos/ServerVpss/CentralDark/actions/runs/<id>/jobs --jq '...'`
Only flip the verdict after the remote confirms the contradiction. The self-hosted
runner is the source of truth for CI gates; the local checkout is not.

## Why this matters for reconcile
`!RECONCILIAR` measures local + remote. When a gate is red on the base, the cause is
often a file present on `origin/main` but not in the local branch. Conclude base
green/red only after checking `origin/main` directly — otherwise you report a false
green and the 4 open PRs look "blocked by infra" when they're actually blocked by a
real policy violation on the base.
