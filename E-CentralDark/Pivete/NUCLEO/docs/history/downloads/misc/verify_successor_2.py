#!/usr/bin/env python3
from pathlib import Path
import hashlib, sys
ROOT=Path(__file__).resolve().parents[2]
M=ROOT/"08_CROSS_CATEGORY/verification/SUCCESSOR_MANIFEST.sha256"
def h(p):
    x=hashlib.sha256()
    with open(p,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): x.update(b)
    return x.hexdigest()
bad=[]
for line in M.read_text(encoding="utf-8").splitlines():
    if not line: continue
    expected, rel=line.split("  ",1)
    p=ROOT/rel
    if not p.exists() or h(p)!=expected: bad.append(rel)
print("SUCCESSOR_VERIFY=PASS" if not bad else "SUCCESSOR_VERIFY=FAIL")
if bad:
    print("\n".join(bad))
    sys.exit(1)
