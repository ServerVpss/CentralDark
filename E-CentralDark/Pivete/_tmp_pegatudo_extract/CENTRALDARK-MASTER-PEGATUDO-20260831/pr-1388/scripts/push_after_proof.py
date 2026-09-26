#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys, json, shlex

ROOT = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path.cwd().resolve()

def run(cmd, check=True):
    p=subprocess.run(cmd,cwd=ROOT,text=True,capture_output=True)
    if check and p.returncode:
        print(p.stdout); print(p.stderr,file=sys.stderr); raise SystemExit(p.returncode)
    return p

branch=run(["git","branch","--show-current"]).stdout.strip()
head=run(["git","rev-parse","HEAD"]).stdout.strip()

if run(["git","status","--porcelain"]).stdout.strip():
    raise SystemExit("WORKTREE_NOT_CLEAN_BEFORE_PROOF")

# Re-run gates on exact committed HEAD.
v=run([sys.executable,str(ROOT/"pr-1388/scripts/verify_pr_1388.py"),str(ROOT)],check=False)
print(v.stdout)
if v.returncode:
    print(v.stderr,file=sys.stderr)
    raise SystemExit("PROOF_FAILED_NO_PUSH")

# Normal push only. No force.
p=run(["git","push","origin",branch],check=False)
print(p.stdout); print(p.stderr,file=sys.stderr)
if p.returncode:
    raise SystemExit("PUSH_FAILED_NO_FORCE_FALLBACK")

remote=run(["git","ls-remote","origin",f"refs/heads/{branch}"]).stdout.strip().split()
if not remote or remote[0] != head:
    raise SystemExit("REMOTE_HEAD_MISMATCH")

print(f"PUSHED_HEAD={head}")
print("REMOTE_HEAD_MATCH=1")
