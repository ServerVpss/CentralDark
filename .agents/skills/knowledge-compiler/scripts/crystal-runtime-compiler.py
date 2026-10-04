#!/usr/bin/env python3
"""CentralDark portable crystal runtime backend.

Owner: .agents/skills/knowledge-compiler/
Role: compile one semantic crystal into environment-specific bindings without
creating a second brain or promoting UNKNOWN to PASS.
"""
from __future__ import annotations

import argparse, hashlib, json, os, subprocess
from pathlib import Path
from typing import Any

REQUIRED = (
    "ONE_SYSTEM_ONLY","REUSE_BEFORE_CREATE","CURRENT_OVER_HISTORY",
    "UNKNOWN_IS_NOT_PASS","SYNC_MEANS_RECONCILE_NOT_OVERWRITE",
    "LOCAL_GOLD_PRESERVED","UNKNOWN_NOT_OVERWRITTEN",
    "CI_WORKSPACE_ISOLATED_FROM_SHARED_FORGE","NO_SECRET_VALUES_IN_GIT",
)
FORBIDDEN = ("reset --hard","checkout .","clean -fd","robocopy /mir")

def canon(v: Any) -> bytes:
    return json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()

def sha(v: bytes | str) -> str:
    return hashlib.sha256(v.encode() if isinstance(v,str) else v).hexdigest()

def hashes(c: dict[str,Any]) -> dict[str,str]:
    material={k:c.get(k) for k in (
        "name","schema","invariants","sequence","proof_plan","security_boundary",
        "result_schema","effect_schema","temporal_research","ssh_promotion_gates",
        "runner_promotion_gates","lineage"
    )}
    raw=canon(material)
    return {
        "compiled_crystal_fingerprint":sha(raw),
        "lock_key":sha(b"LOCK:"+raw),
        "proof_plan_hash":sha(canon(c["proof_plan"])),
        "result_schema_hash":sha(c["result_schema"]),
        "effect_schema_hash":sha(c["effect_schema"]),
        "source_claim_fingerprint":c.get("source_claim_fingerprint",""),
    }

def validate(c: dict[str,Any]) -> None:
    if c.get("schema")!="centraldark.crystal.v2":
        raise SystemExit("CRYSTAL_SCHEMA=FAIL")
    missing=[x for x in REQUIRED if c.get("invariants",{}).get(x) is not True]
    if missing: raise SystemExit("CRYSTAL_INVARIANTS=FAIL:"+",".join(missing))
    raw=json.dumps(c,ensure_ascii=False).lower()
    bad=[x for x in FORBIDDEN if x in raw]
    if bad: raise SystemExit("FORBIDDEN_DESTRUCTIVE_ROUTE="+",".join(bad))

def git(root:Path,*args:str,check=True)->str:
    p=subprocess.run(["git","-C",str(root),*args],text=True,capture_output=True)
    if check and p.returncode:
        raise RuntimeError(p.stderr.strip() or "git failed")
    return p.stdout

def names(root:Path,a:str,b:str)->set[str]:
    return {x for x in git(root,"diff","--name-only","-z",a,b).split("\0") if x}

def dirty(root:Path)->set[str]:
    out=set()
    for x in git(root,"status","--porcelain=v1","-z").split("\0"):
        if len(x)>=4: out.add(x[3:])
    return out

def blob(root:Path,ref:str,path:str)->str|None:
    p=subprocess.run(["git","-C",str(root),"rev-parse",f"{ref}:{path}"],text=True,capture_output=True)
    return p.stdout.strip() if p.returncode==0 else None

def inventory(root:Path,head:str,upstream:str,base:str)->dict[str,list[str]]:
    d,local,up=dirty(root),names(root,base,head),names(root,base,upstream)
    buckets={k:[] for k in ("LOCAL_GOLD","ALREADY_IN_MAIN","STALE","CONFLICT","UNKNOWN")}
    for path in sorted(d|local|up):
        if path in d:
            buckets["CONFLICT" if path in up else "LOCAL_GOLD"].append(path)
        elif path in local and path in up:
            buckets["ALREADY_IN_MAIN" if blob(root,head,path)==blob(root,upstream,path) else "CONFLICT"].append(path)
        elif path in local: buckets["LOCAL_GOLD"].append(path)
        elif path in up: buckets["STALE"].append(path)
        else: buckets["UNKNOWN"].append(path)
    return buckets

def compile_plan(c:dict[str,Any],target:str)->dict[str,Any]:
    validate(c)
    binding=c["bindings"][target]
    return {
        "schema":"centraldark.compiled-plan.v2","crystal":c["name"],"target":target,
        "binding":binding,"invariants":c["invariants"],"sequence":c["sequence"],
        "proof_plan":c["proof_plan"],"temporal_research":c["temporal_research"],
        "ssh_promotion_gates":c["ssh_promotion_gates"],
        "runner_promotion_gates":c["runner_promotion_gates"],
        "hashes":hashes(c),
        "policy":{"default":"INSPECT_ONLY","destructive_write":"FORBIDDEN_WHILE_CONFLICT_OR_UNKNOWN"}
    }

def inspect(c:dict[str,Any],target:str,root_override:str|None)->dict[str,Any]:
    validate(c); b=c["bindings"][target]
    root=Path(root_override or b["forge_root"]).expanduser()
    r={"schema":c["result_schema"],"target":target,"root":str(root),"status":"UNKNOWN",
       "inventory":{k:[] for k in ("LOCAL_GOLD","ALREADY_IN_MAIN","STALE","CONFLICT","UNKNOWN")},
       "proof":{},"next_cursor":"FIX_BINDING_ROOT"}
    if not root.exists(): return r
    try:
        head=git(root,"rev-parse","HEAD").strip()
        r["proof"].update(origin=git(root,"remote","get-url","origin").strip(),
                          branch=git(root,"branch","--show-current").strip(),
                          head_before=head,dirty_count_before=len(dirty(root)))
        # fetch updates refs only; never reset/merge/checkout the forge.
        git(root,"fetch","--prune","origin",c["canonical_branch"])
        upstream=git(root,"rev-parse",f"origin/{c['canonical_branch']}").strip()
        base=git(root,"merge-base",head,upstream).strip()
        inv=inventory(root,head,upstream,base); r["inventory"]=inv
        ignored=subprocess.run(["git","-C",str(root),"check-ignore",".obsidian/app.json"],
                               capture_output=True).returncode==0
        r["proof"].update(origin_main=upstream,merge_base=base,
                          fetch_main_without_worktree_overwrite=True,
                          dot_obsidian_git_ignored=ignored,
                          local_gold_preserved=True,unknown_overwritten=False)
        if inv["CONFLICT"]:
            r["status"]="CONFLICT"; r["next_cursor"]="REVIEW_CONFLICT"
        elif inv["UNKNOWN"]:
            r["status"]="UNKNOWN"; r["next_cursor"]="REVIEW_UNKNOWN"
        else:
            r["status"]="PASS"; r["next_cursor"]="SAFE_DELTA_READY_FOR_OWNER_RECONCILIATION"
    except Exception as e:
        r["proof"]["error"]=f"{type(e).__name__}: {e}"
    return r

def main():
    ap=argparse.ArgumentParser(); sub=ap.add_subparsers(dest="cmd",required=True)
    for name in ("hash","compile","inspect"):
        p=sub.add_parser(name); p.add_argument("--crystal",required=True)
        if name!="hash": p.add_argument("--target",choices=("windows","vmware","vps"),required=True)
        if name=="compile": p.add_argument("--out",required=True)
        if name=="inspect":
            p.add_argument("--root"); p.add_argument("--receipt",required=True)
    a=ap.parse_args(); c=json.loads(Path(a.crystal).read_text(encoding="utf-8"))
    if a.cmd=="hash": print(json.dumps(hashes(c),indent=2)); return
    if a.cmd=="compile":
        out=Path(a.out); out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(compile_plan(c,a.target),indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
        print(out); return
    receipt=inspect(c,a.target,a.root)
    Path(a.receipt).write_text(json.dumps(receipt,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print(json.dumps(receipt,indent=2,ensure_ascii=False))
    raise SystemExit(2 if receipt["status"]=="CONFLICT" else 3 if receipt["status"]=="UNKNOWN" else 0)

if __name__=="__main__": main()
