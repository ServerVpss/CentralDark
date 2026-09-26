#!/usr/bin/env python3
"""Descoberta robusta de repos via subprocess (find + git -C).
Avoids os.walk issues."""
import os, subprocess, datetime

ROOT="/e/CentralDark"
RECEIPT_DIR=os.path.join(ROOT,"docs/RECEIPTS")
os.makedirs(RECEIPT_DIR, exist_ok=True)
TS=datetime.datetime.now(datetime.UTC).strftime("%Y%m%dT%H%M%SZ")
RECEIPT=os.path.join(RECEIPT_DIR, f"{TS}-canonical-root-quarantine-full.md")

def run(cmd, cwd=None, timeout=8):
    try:
        r=subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip(), r.stderr.strip(), r.returncode
    except Exception as e:
        return "", str(e), -1

L=[]
L.append(f"# Canonical Root Discovery — {TS}")
L.append("")

# 1. Source repo via known paths + git -C
L.append("## 1. Source repo discovery (git -C robust)")
src=None
candidates=[
    os.path.join(ROOT,"CentralDark","CentralDark"),
    os.path.join(ROOT,"CentralDark"),
    os.path.join(ROOT,"CentralDark","CentralDark","CentralDark"),
    ROOT,
]
for c in candidates:
    if os.path.isdir(c):
        out,err,_=run(f"git -C \"{c}\" rev-parse --show-toplevel", timeout=4)
        if out and os.path.isabs(out):
            src=out; break
if not src:
    # fallback: use find via subprocess
    out,err,_=run(f"find \"{ROOT}\" -maxdepth 4 -type d -name .git 2>/dev/null | head -1", timeout=10)
    if out:
        gdir=out.strip()
        repo=os.path.dirname(gdir)
        out2,_,_=run(f"git -C \"{repo}\" rev-parse --show-toplevel", timeout=4)
        if out2: src=out2
if not src:
    L.append("🔴 NENHUM REPO ENCONTRADO"); L.append("")
    open(RECEIPT,"w",encoding="utf-8").write("\n".join(L)+"\n")
    print("\n".join(L)); raise SystemExit(1)

L.append(f"SOURCE_REPO={src}")
remote,_,_=run(f"git -C \"{src}\" remote get-url origin", timeout=4)
branch,_,_=run(f"git -C \"{src}\" branch --show-current", timeout=4)
head,_,_=run(f"git -C \"{src}\" rev-parse --short HEAD", timeout=4)
status,_,_=run(f"git -C \"{src}\" status --short", timeout=4)
dirty_lines=[l for l in (status or "").splitlines() if l.strip() and not l.startswith("?? ")]
untracked_lines=[l for l in (status or "").splitlines() if l.startswith("?? ")]
L.append(f"SOURCE_REMOTE={remote}")
L.append(f"SOURCE_BRANCH={branch}")
L.append(f"SOURCE_HEAD={head}")
L.append(f"DIRTY_STATUS={status or '(limpo)'}")
L.append(f"DIRTY_COUNT={len(dirty_lines)}")
L.append(f"UNTRACKED_COUNT={len(untracked_lines)}")
L.append("")

# 2. Other repos via find subprocess
L.append("## 2. Other repos discovery (find subprocess, timeout 4s/repo)")
L.append("")
dup=[]; ext=[]; unk=[]
found=0
# Use find subprocess to get list
out,err,_=run(f"find \"{ROOT}\" -maxdepth 4 -mindepth 1 -type d -name .git 2>/dev/null | head -100", timeout=30)
if out:
    for gdir in out.splitlines():
        gdir=gdir.strip()
        if not gdir: continue
        repo=os.path.dirname(gdir)
        top,_,_=run(f"git -C \"{repo}\" rev-parse --show-toplevel", timeout=4)
        if not top: continue
        if top==src:
            L.append(f"CANONICAL_CURRENT: {repo}")
            continue
        remote,_,_=run(f"git -C \"{repo}\" remote get-url origin", timeout=4)
        h,_,_=run(f"git -C \"{repo}\" rev-parse --short HEAD", timeout=4)
        b,_,_=run(f"git -C \"{repo}\" branch --show-current", timeout=4)
        s,_,_=run(f"du -sh \"{repo}\"", ROOT, timeout=4)
        size=s.split()[0] if s else "UNKNOWN_SIZE"
        entry=(repo, remote or "UNKNOWN", h or "NO_HEAD", b or "NO_BRANCH", size)
        if remote and remote==remote:
            # same remote as source
            dup.append(entry)
        elif remote=="UNKNOWN":
            unk.append(entry)
        else:
            ext.append(entry)
        found+=1
        if found>=80: break

L.append(f"### DUPLICATE (mesmo remote do SOURCE)")
for p,r,h,b,s in dup: L.append(f"  - {p} | remote={r} | head={h} | branch={b} | size={s}")
L.append("")
L.append(f"### EXTERNAL (remote diferente)")
for p,r,h,b,s in ext: L.append(f"  - {p} | remote={r} | head={h} | branch={b} | size={s}")
L.append("")
L.append(f"### UNKNOWN (sem remote legível)")
for p,r,h,b,s in unk: L.append(f"  - {p} | head={h} | branch={b} | size={s}")
L.append("")
L.append("## 3. Decisão (APPLY=0 = DRY_RUN)")
L.append("APPLY=0")
L.append(f"QUARANTINE_DIR={os.path.join(ROOT,'_QUARANTINE','DUPLICATES')}")
L.append("")
L.append("### Ações previstas no APPLY=1 (apenas DUPLICATE provados):")
for p,r,h,b,s in dup:
    safe=os.path.basename(p)
    L.append(f"  MOVE {p} -> {os.path.join(ROOT,'_QUARANTINE','DUPLICATES',safe)}")
L.append("")
L.append("### Preservados (NÃO moverão):")
L.append("  - CANONICAL_CURRENT: repo fonte")
L.append("  - EXTERNAL_REPO: remote diferente (não é duplicata)")
L.append("  - UNKNOWN_REPO: sem remote legível (UNKNOWN ≠ PASS)")
L.append("")
L.append("## 4. Próximo passo")
L.append("Revisar este receipt e, se correto, rodar:")
L.append("")
L.append("```bash")
L.append(f"cd {ROOT} && APPLY=1 bash scripts/centraldark-canonical-root-quarantine.sh")
L.append("```")
L.append("")
L.append("<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>")
L.append("")

open(RECEIPT,"w",encoding="utf-8").write("\n".join(L)+"\n")
print("\n".join(L))
print(f"\n✅ RECEIPT={RECEIPT}")
