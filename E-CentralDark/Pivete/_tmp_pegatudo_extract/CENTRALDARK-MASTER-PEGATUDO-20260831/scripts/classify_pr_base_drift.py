#!/usr/bin/env python3
import subprocess, sys, json

BASE=sys.argv[1] if len(sys.argv)>1 else "origin/main"
HEAD=sys.argv[2] if len(sys.argv)>2 else "HEAD"

def run(*args):
    return subprocess.check_output(["git",*args],text=True).strip()

def main():
    head=run("rev-parse",HEAD)
    base=run("rev-parse",BASE)
    mb=run("merge-base",BASE,HEAD)
    behind=int(run("rev-list","--count",f"{HEAD}..{BASE}"))
    ahead=int(run("rev-list","--count",f"{BASE}..{HEAD}"))
    files=run("diff","--name-only",f"{mb}..{BASE}").splitlines() if mb != base else []
    material=any(
        p.startswith(".agents/skills/meta-lupa/") or
        "mapeamento" in p.lower() or
        p.startswith(".github/") or
        p.endswith("LEIA-ME-IA.md")
        for p in files
    )
    verdict="BASE_SYNC_REQUIRED" if behind>0 and material else ("BASE_BEHIND_NONMATERIAL" if behind>0 else "BASE_SYNCED")
    print(json.dumps({
        "head":head,"base":base,"merge_base":mb,
        "behind_base_commits":behind,"ahead_base_commits":ahead,
        "material_base_changes":material,"verdict":verdict,
        "rule":"do_not_weaken_validator_to_match_stale_branch"
    },indent=2))
    return 2 if verdict=="BASE_SYNC_REQUIRED" else 0

if __name__=="__main__":
    raise SystemExit(main())
