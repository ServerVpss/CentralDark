from pathlib import Path
import re
from collections import defaultdict

vault = Path(r"E:/CentralDark/Pivete/CentralDark/docs/BRAIN")
mds = list(vault.rglob("*.md"))
print("MD_COUNT", len(mds))
out = defaultdict(set)
for p in mds:
    try:
        t = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        t = ""
    for L in re.findall(r"\[\[([^\]|#]+)", t):
        name = L.strip().replace("\\", "/").split("/")[-1]
        out[p.stem].add(name)
inbound = defaultdict(set)
for src, dests in out.items():
    for d in dests:
        inbound[d].add(src)
empty, orphans, no_in = [], [], []
for p in mds:
    s = p.stem
    sz = p.stat().st_size
    n_out = len(out[s])
    n_in = len(inbound.get(s, set()))
    rel = str(p.relative_to(vault)).replace("\\", "/")
    if sz == 0:
        empty.append(rel)
    if n_out == 0 and n_in == 0:
        orphans.append((sz, rel))
    elif n_in == 0:
        no_in.append((n_out, sz, rel))
print("EMPTY", len(empty))
for e in empty:
    print("  EMPTY", e)
print("ORPHAN", len(orphans))
for sz, p in sorted(orphans, key=lambda x: -x[0])[:40]:
    print(f"  {sz:6} {p}")
print("NO_INBOUND", len(no_in))
for n, sz, p in sorted(no_in, key=lambda x: -x[0])[:25]:
    print(f"  out={n:2} {sz:6} {p}")
