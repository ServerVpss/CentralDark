#!/usr/bin/env python3
"""Gera ZIP reprodutível do pacote nivel-7. Determinístico: paths ordenados, mtime fixo."""
import hashlib, pathlib, sys, zipfile

PKG = pathlib.Path(__file__).resolve().parents[1]
DST = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path("/tmp/nivel7.zip")

def files():
    for f in sorted(PKG.rglob("*")):
        if not f.is_file(): continue
        parts = f.relative_to(PKG).parts
        if "__pycache__" in parts: continue
        yield f

manifest = []
with zipfile.ZipFile(DST, "w", compression=zipfile.ZIP_DEFLATED) as z:
    for f in files():
        rel = str(f.relative_to(PKG))
        data = f.read_bytes()
        h = hashlib.sha256(data).hexdigest()
        manifest.append(f"{h}  {rel}\n")
        zi = zipfile.ZipInfo(rel)
        zi.date_time = (2026, 1, 1, 0, 0, 0)
        zi.external_attr = 0o644 << 16
        z.writestr(zi, data, compress_type=zipfile.ZIP_DEFLATED)
    zi = zipfile.ZipInfo("MANIFEST.sha256")
    zi.date_time = (2026, 1, 1, 0, 0, 0)
    zi.external_attr = 0o644 << 16
    z.writestr(zi, "".join(manifest))

sha = hashlib.sha256(DST.read_bytes()).hexdigest()
print(f"ZIP={DST}")
print(f"SHA256={sha}")
