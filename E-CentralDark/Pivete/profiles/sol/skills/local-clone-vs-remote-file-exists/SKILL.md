---
name: local-clone-vs-remote-file-exists
description: "CI gate fails on file absent locally. Check origin/main."
trigger:
  - ci_gate_failure_references_missing_local_file
  - reconcile_remote_vs_local_contradiction
  - false_positive_local_pass_on_remote_fail
phases: "MEASURE -> CONTRADICT_COUNTERPROOF -> REMOTE_TRUTH"
steps:
  - When a remote CI run fails on a file your local git status or ls says is absent, DO NOT trust the local checkout. Your branch tree may not include a commit that origin/main has.
  - Verify the file real existence on the remote with BOTH commands: git cat-file -e origin/main:<path> and git ls-tree origin/main --name-only <dir> | grep <name>.
  - If it exists on origin/main but not in your local HEAD/tree the contradiction is explained, you are behind or on a divergent branch, the remote gate is right.
  - Re-run the failing script LOCALLY only after git fetch origin AND reading the file from origin/main via git show origin/main:<path>, not from your local tree.
  - If local re-run passes but remote fails with the same file you likely ran the script against a different or partial working dir, re-run with explicit cd to repo root and absolute path arg.
  - Conclude ONLY after remote truth (origin/main tree plus remote run log) and local re-measure agree OR the divergence is explained.
pitfalls:
  - Local ls or git status absence is not remote absence. Your clone can be behind on specific paths even when rev-list says 0 behind on commit count, path-not-in-your-tree is not commit-behind.
  - uv run --no-project python script.py . resolves CWD. If CWD is a subdir or cache it scans the wrong tree. Always cd to repo root first.
  - First local run may hit a stale state, second run after git fetch may differ. Re-measure before stating PASS.
  - MSYS on Windows rewrites E:/ to /e/ never paste /e/ into search_files, use E:/ in terminal grep/gh or search_files with the real Windows path.
counterproof: "Remote gate FAIL citing file X plus local says X absent then git cat-file -e origin/main:X returns 0 (exists) means contradiction resolved, remote gate correct, NOT a false positive."
fixed_point_contribution: "Resolves the local checkout hides remote file class of falso-verde during reconcile, measure remote tree before concluding local PASS."
---

# Local Clone vs Remote — File Existence Contradiction

## When this bites
A CI gate (porta-de-entrada, Autonomia promocao) fails on a file your local checkout
insists does not exist. You re-run the check locally, it PASSES, and you conclude
"false positive / stale gate". That conclusion is itself the falso-verde.

## Why it happens
Your working branch tree does not include every file origin/main has. A rev-list
--left-right --count origin/main...HEAD showing 0 behind on COMMIT COUNT does NOT mean
your tree matches origin/main on every path. You can be on a branch whose tree omits
files added in commits reachable from origin/main but not from your HEAD.

Also uv run --no-project python script.py . uses CWD. If the tool resolved a subdir or
cache, the script scanned a different tree than the remote runner (fetch-depth 0 + real HEAD).

## Mandatory sequence
```
1. Remote truth first:
   git fetch origin
   git cat-file -e origin/main:<path>        # 0 = exists on remote main
   git ls-tree origin/main --name-only <dir> | grep <name>

2. If exists on origin/main but NOT in local tree:
   contradiction explained. Remote gate is RIGHT. Do not call it false positive.

3. Only then re-run locally:
   cd <repo_root>
   git show origin/main:<path> > /tmp/check.yml   # read the REAL file
   uv run --no-project python scripts/verify.py .  # explicit cd to root

4. If local PASS but remote FAIL on same file:
   you scanned wrong tree. Fix CWD, re-run, re-compare.
```

## Pitfalls (crystallized)
| Pitfall | Fix |
|---------|-----|
| Local ls absence = remote absence | git cat-file -e origin/main:<path> before concluding |
| 0 behind on commits = tree matches | Path-in-tree is not commit-behind. Check git ls-tree |
| uv run script.py . scans wrong dir | cd to repo root, pass absolute or . explicitly |
| MSYS rewrites E:/ to /e/ (search_files IO error) | Use E:/ in terminal/gh, real Windows path in search_files |
| First local run stale, second differs | Re-measure after git fetch, do not state PASS on first run |

## Verification
After a CI gate fails citing file X:
- git cat-file -e origin/main:X checked (not just local ls)
- git ls-tree origin/main listed the dir
- Local re-run done from repo root after git fetch
- Conclusion matches remote truth OR divergence explained

## Counterproof
Remote gate FAIL on X plus local says X absent then git cat-file -e origin/main:X = exists
means remote correct, contradiction resolved, NOT a false positive.
