# Integrate current main into an open PR (history-preserving)

Use when main moved (e.g. #679 merged) and an open PR still bases on old main.

## Hard rules
```text
NO rebase that implies force-push
NO reset --hard on the PR real worktree
NO overwrite dirty real worktree
NO push/merge/deploy without explicit order
YES merge --no-ff origin/main into PR tip in isolated clean WT
```

## Steps
1. Load `centraldark-pr` + `deterministic-casa-ops` + MetaLupa first.
2. `git fetch origin main` + `pull/<n>/head:refs/remotes/origin/pr-<n>-head`
3. Fix MAIN_SHA, PR_SHA, BASE_SHA; abort if empty.
4. Real PR worktree dirty/divergente → READ_ONLY.
5. Temp WT at **exact** PR_SHA (Windows path `E:/tmp/...`, not pretend Linux-only).
6. If branch name already used by another WT → detached + local temp ref only.
7. `git merge --no-commit --no-ff origin/main`
8. Expected conflicts only the overlapping files declared in the mission; else BLOCKED.
9. Resolve by **semantic contract** (three versions: main / PR / result) — not blind “theirs/ours”.
10. Prove (tests/validators/markers/ubuntu=0) then local commit; stop at READY_FOR_PUSH_AUTHORIZATION.

## False green list
YAML parse, empty output, skipped CI, queued run, conflict markers gone, visual WF correctness alone → never PASS.
