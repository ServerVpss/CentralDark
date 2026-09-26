from pathlib import Path
import re, json
from collections import defaultdict

vault = Path(r"E:/CentralDark/Pivete/CentralDark/docs/BRAIN")
mds = list(vault.rglob("*.md"))
files_by_stem = {}
files_by_rel = {}
for p in mds:
    rel = str(p.relative_to(vault)).replace("\\", "/")
    files_by_stem[p.stem] = p
    files_by_rel[rel] = p
    files_by_rel[p.name] = p

def resolve(link: str):
    link = link.strip().replace("\\", "/")
    if link in files_by_rel:
        return True, "rel"
    stem = Path(link).stem
    if stem in files_by_stem:
        return True, "stem"
    # folder
    d = vault / link
    if d.is_dir():
        return True, "dir"
    return False, None

broken = []
empty = []
for p in mds:
    rel = str(p.relative_to(vault)).replace("\\", "/")
    sz = p.stat().st_size
    if sz == 0:
        empty.append(rel)
        continue
    try:
        t = p.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue
    for L in re.findall(r"\[\[([^\]|#]+)", t):
        ok, how = resolve(L)
        if not ok:
            broken.append((rel, L.strip()))

print("MD", len(mds))
print("EMPTY", len(empty))
for e in empty:
    print("  0B", e)
print("BROKEN_LINKS", len(broken))
# unique targets
tg = defaultdict(list)
for src, L in broken:
    tg[L].append(src)
print("BROKEN_TARGETS", len(tg))
for L, srcs in sorted(tg.items(), key=lambda x: -len(x[1]))[:40]:
    print(f"  x{len(srcs)} [[{L}]] <- {srcs[0]}")

swarm = list(vault.rglob("*SWARM*")) + list(vault.rglob("*swarm*"))
print("SWARM_FILES")
for p in swarm:
    print(" ", p.stat().st_size, str(p.relative_to(vault)).replace("\\", "/"))
