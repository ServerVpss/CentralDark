#!/usr/bin/env python3
"""
checkpoint_zero.py — snapshot do núcleo operacional do profile pivete.
SHA256 delta + manifest + copia atômica (os.replace) + restore-test isolado.
CASA, sem VPS, sem Git. SOUL = cópia read-only. config.yaml = hash-only.
Referência: executado com sucesso na sessão 28/07 (DEST_VALID=True, RESTORE_VALID=True).
"""
import os, hashlib, json, shutil, datetime

BASE = r"E:\CentralDark\Pivete\BACKUPS\hermes-pivete"
DST = os.path.join(BASE, "checkpoint_zero")
RST = os.path.join(BASE, "restore-test")
os.makedirs(DST, exist_ok=True)
os.makedirs(RST, exist_ok=True)

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(65536), b""):
            h.update(b)
    return h.hexdigest()

def stat(p):
    s = os.stat(p)
    return s.st_size, datetime.datetime.fromtimestamp(s.st_mtime).isoformat()

# (key, abs_path, volume, source, readonly_copy)
core = [
    ("A1_04-COMUNICACAO.md", r"E:\CentralDark\Pivete\NUCLEO\motor\01-identidade\04-COMUNICACAO.md", "A", "local", False),
    ("A2_HOJE.md", r"E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\HOJE.md", "A", "local", False),
    ("A3_SEMANA.md", r"E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\SEMANA.md", "A", "local", False),
    ("A4_REGRAS.md", r"E:\CentralDark\Pivete\NUCLEO\motor\03-memoria\memoria\REGRAS.md", "A", "local", False),
    ("B1_SOUL.md", r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\SOUL.md", "B", "local", True),
    ("B2_config.yaml", r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\config.yaml", "B", "local", False),
]
skills = [
    ("B3_vision-fallback-autoresilient", r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\vision-fallback-autoresilient\SKILL.md", "B", "local-custom", False),
    ("B4_pivete-resposta", r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\pivete-resposta\SKILL.md", "B", "local-custom", False),
    ("B5_meta-lupa", r"C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\meta-lupa\SKILL.md", "B", "repo-sync", False),
]

manifest = {}
print("=== SKILL PROOF (custom/repo only) ===")
for k, p, vol, src, ro in skills:
    d = os.path.dirname(p)
    e = {"skill_dir_exists": os.path.exists(d), "skill_dir_is_link": os.path.islink(d)}
    if e["skill_dir_is_link"]:
        e["link_target"] = os.readlink(d)
    e["skill_md_exists"] = os.path.isfile(p)
    if e["skill_md_exists"]:
        e["sha256"] = sha256(p); e["size"], e["mtime"] = stat(p)
    print(k, json.dumps(e, ensure_ascii=False))
    manifest[k] = {"present": e["skill_md_exists"], "orig": p, "volume": vol, "source": src,
                   "readonly_copy": ro, **({kk: e[kk] for kk in ("sha256","size","mtime")} if e["skill_md_exists"] else {})}

print("=== CORE HASHES (config.yaml = hash only) ===")
allfiles = core + skills
for k, p, vol, src, ro in allfiles:
    if not os.path.isfile(p):
        print(k, "MISSING"); manifest[k] = {"present": False, "volume": vol, "source": src, "readonly_copy": ro}; continue
    h = sha256(p); sz, mt = stat(p)
    manifest[k] = {"present": True, "orig": p, "sha256": h, "size": sz, "mtime": mt, "volume": vol, "source": src, "readonly_copy": ro}
    print(k, h[:16], "size=", sz)

print("=== COPY ATOMIC (tmp -> replace) ===")
copied = 0
for k, p, *_ in allfiles:
    if not os.path.isfile(p): continue
    dest = os.path.join(DST, k); tmp = dest + ".tmp"
    shutil.copy2(p, tmp); os.replace(tmp, dest); copied += 1
print("COPIED", copied)

mfile = os.path.join(DST, "manifest.json")
mjson = json.dumps({"generated": datetime.datetime.now().isoformat(), "entries": manifest}, ensure_ascii=False, indent=2)
with open(mfile + ".tmp", "w", encoding="utf-8") as f: f.write(mjson)
os.replace(mfile + ".tmp", mfile)
print("MANIFEST_WRITTEN", mfile)

print("=== VALIDATE DEST ===")
ok = all(sha256(os.path.join(DST, k)) == manifest[k]["sha256"] for k,*_ in allfiles if manifest[k].get("present"))
print("DEST_VALID", ok)

print("=== RESTORE TEST (isolated) ===")
rok = True
for k, p, *_ in allfiles:
    if not manifest[k].get("present"): continue
    rdest = os.path.join(RST, k); tmp = rdest + ".tmp"
    shutil.copy2(os.path.join(DST, k), tmp); os.replace(tmp, rdest)
    if sha256(rdest) != manifest[k]["sha256"]: rok = False; print("RESTORE_MISMATCH", k)
print("RESTORE_VALID", rok)
print("ALL_DONE dest_valid=", ok, "restore_valid=", rok)
