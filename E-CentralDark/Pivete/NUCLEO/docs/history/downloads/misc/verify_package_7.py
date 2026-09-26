#!/usr/bin/env python3
from pathlib import Path
import hashlib,sys
root=Path(__file__).resolve().parents[1]; bad=[]
for line in (root/"05-PROOFS/MANIFEST.sha256").read_text(encoding="utf-8").splitlines():
 if not line.strip():continue
 h,rel=line.split("  ",1); p=root/rel
 if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest()!=h: bad.append(rel)
print("PASS: manifest íntegro" if not bad else "FAIL: "+", ".join(bad)); sys.exit(1 if bad else 0)
