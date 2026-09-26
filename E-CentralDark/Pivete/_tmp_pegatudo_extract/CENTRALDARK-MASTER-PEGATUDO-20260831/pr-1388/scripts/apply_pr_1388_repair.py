#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, json, shlex, os

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()

def run(args, check=True, capture=True):
    cmd = ["git", "-C", str(ROOT), *args]
    p = subprocess.run(cmd, text=True, capture_output=capture)
    if check and p.returncode != 0:
        print(p.stdout)
        print(p.stderr, file=sys.stderr)
        raise SystemExit(f"GIT_FAILED: {' '.join(shlex.quote(x) for x in cmd)}")
    return p

def out(args):
    return run(args).stdout.strip()

def py(script):
    p = subprocess.run([sys.executable, str(script), str(ROOT)], text=True, capture_output=True)
    print(p.stdout, end="")
    if p.returncode:
        print(p.stderr, file=sys.stderr)
        raise SystemExit(p.returncode)

# 1. Context
branch = out(["branch", "--show-current"])
head0 = out(["rev-parse", "HEAD"])
status = out(["status", "--porcelain"])
if status:
    raise SystemExit("WORKTREE_NOT_CLEAN: classify/preserve before mutation")

print(f"BRANCH={branch}")
print(f"HEAD_BEFORE={head0}")

# 2. Fetch base
run(["fetch", "origin", "main"])
base = out(["rev-parse", "origin/main"])
mb = out(["merge-base", "HEAD", "origin/main"])
behind = int(out(["rev-list", "--count", "HEAD..origin/main"]))

print(f"ORIGIN_MAIN={base}")
print(f"MERGE_BASE={mb}")
print(f"BEHIND_MAIN={behind}")

# 3. Shared PR branch: merge, do not rewrite published history by default.
if behind > 0:
    p = run(["merge", "--no-ff", "--no-edit", "origin/main"], check=False)
    if p.returncode != 0:
        run(["merge", "--abort"], check=False)
        raise SystemExit("BASE_MERGE_CONFLICT: requires real reconciliation; no blind force/rebase")
    print("BASE_SYNC=MERGED_MAIN")
else:
    print("BASE_SYNC=ALREADY_CURRENT")

# 4. Fix canonical core markers and identity.
py(ROOT / "pr-1388/scripts/ensure_core_markers.py")
py(ROOT / "pr-1388/scripts/reconcile_meta_lupa_identity.py")

# 5. Commit deterministic repair delta if needed.
changed = out(["status", "--porcelain"])
if changed:
    run(["add", "LEIA-ME-IA.md", ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"])
    # Only commit files actually present/staged; architecture integration is handled separately.
    staged = out(["diff", "--cached", "--name-only"])
    if staged:
        run(["commit", "-m", "fix(governança): reconciliar core e identidade no PR #1388"])
        print("REPAIR_COMMIT=CREATED")
else:
    print("REPAIR_COMMIT=NOT_NEEDED")

print("HEAD_REPAIRED=" + out(["rev-parse", "HEAD"]))
