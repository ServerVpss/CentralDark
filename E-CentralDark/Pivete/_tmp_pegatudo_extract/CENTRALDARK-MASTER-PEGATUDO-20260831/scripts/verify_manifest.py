#!/usr/bin/env python3
from pathlib import Path
import hashlib, sys

ROOT=Path(__file__).resolve().parents[1]
MAN=ROOT/"MANIFEST.sha256"

def h(p):
    x=hashlib.sha256()
    with open(p,"rb") as f:
        for c in iter(lambda:f.read(1024*1024),b""): x.update(c)
    return x.hexdigest()

def verify():
    errors=[]
    for line in MAN.read_text(encoding="utf-8").splitlines():
        if not line.strip(): continue
        digest, rel=line.split("  ",1)
        p=ROOT/rel
        if not p.exists() or h(p)!=digest:
            errors.append(rel)
    return errors

if __name__=="__main__":
    e=verify()
    print("HASH_CHAIN_VALID="+("1" if not e else "0"))
    for x in e: print("MISMATCH="+x)
    raise SystemExit(0 if not e else 1)
