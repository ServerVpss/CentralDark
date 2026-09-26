#!/usr/bin/env python3
from pathlib import Path
import subprocess, sys

ROOT=Path(__file__).resolve().parents[1]
SKILL=Path(sys.argv[1]) if len(sys.argv)>1 else ROOT/".agents/skills/meta-lupa/SKILL.md"
IDENT=Path(sys.argv[2]) if len(sys.argv)>2 else ROOT/".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA"

def git_blob_id(path):
    out=subprocess.check_output(["git","hash-object",str(path)],cwd=path.parent if (path.parent/".git").exists() else None,text=True)
    return out.strip()

def repo_root_for(path):
    out=subprocess.check_output(["git","-C",str(path.parent),"rev-parse","--show-toplevel"],text=True)
    return Path(out.strip())

def reconcile(skill, ident):
    root=repo_root_for(skill)
    rel=skill.resolve().relative_to(root.resolve()).as_posix()
    blob=subprocess.check_output(["git","-C",str(root),"hash-object",rel],text=True).strip()
    expected=f"{blob}  {rel}\n"
    old=ident.read_text(encoding="utf-8") if ident.exists() else ""
    changed=(old != expected)
    ident.parent.mkdir(parents=True,exist_ok=True)
    ident.write_text(expected,encoding="utf-8")
    check=subprocess.check_output(["git","-C",str(root),"hash-object",rel],text=True).strip()
    if check != blob:
        raise SystemExit("IDENTITY_RECHECK_FAILED")
    return blob, rel, changed

if __name__=="__main__":
    blob, rel, changed=reconcile(SKILL,IDENT)
    print(f"META_LUPA_BLOB={blob}")
    print(f"META_LUPA_PATH={rel}")
    print(f"IDENTITY_UPDATED={1 if changed else 0}")
