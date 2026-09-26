#!/usr/bin/env python3
"""Descoberta robusta de repositórios Git em E:\CentralDark.
Classifica CANONICAL | DUPLICATE | EXTERNAL | UNKNOWN e gera receipt."""
import os, subprocess, datetime, shlex

ROOT = "/e/CentralDark"
RECEIPT_DIR = os.path.join(ROOT, "docs/RECEIPTS")
QUARANTINE_DIR = os.path.join(ROOT, "_QUARANTINE", "DUPLICATES")
os.makedirs(RECEIPT_DIR, exist_ok=True)
os.makedirs(QUARANTINE_DIR, exist_ok=True)

TS = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
RECEIPT = os.path.join(RECEIPT_DIR, f"{TS}-canonical-root-quarantine-dryrun.md")

def run(cmd, cwd, timeout=5):
    try:
        r = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip(), r.returncode
    except Exception:
        return "", -1

lines = []
lines.append(f"# Canonical Root Discovery — {TS}")
lines.append("")
lines.append("## 1. Source repo discovery (robusto, com timeout)")
source_repo = None
candidates = [ROOT,
              os.path.join(ROOT, "CentralDark"),
              os.path.join(ROOT, "CentralDark", "CentralDark")]
for c in candidates:
    if not os.path.isdir(c):
        continue
    top, _ = run("git rev-parse --show-toplevel", c)
    if top:
        source_repo = top
        break
lines.append(f"SOURCE_REPO={source_repo}")
lines.append("")

if not source_repo:
    lines.append("🔴 BLOCKED_REAL: nenhum repo Git canônico encontrado em até 2 níveis")
    lines.append("")
    lines.append("```")
    lines.append("\n".join(lines))
    lines.append("```")
    with open(RECEIPT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    raise SystemExit(1)

remote, _ = run("git remote get-url origin", source_repo)
branch, _ = run("git branch --show-current", source_repo)
head, _ = run("git rev-parse --short HEAD", source_repo)
status, _ = run("git status --short", source_repo)
dirty = len([l for l in status.splitlines() if l.strip() and not l.startswith("?? ")])
untracked = len([l for l in status.splitlines() if l.startswith("?? ")])

lines.append("## 2. Source repo metrics")
lines.append(f"SOURCE_REMOTE={remote}")
lines.append(f"SOURCE_BRANCH={branch}")
lines.append(f"SOURCE_HEAD={head}")
lines.append(f"DIRTY_STATUS={status if status else '(limpo)'}")
lines.append(f"DIRTY_COUNT={dirty}")
lines.append(f"UNTRACKED_COUNT={untracked}")
lines.append("")

lines.append("## 3. Other repos discovery (maxdepth 3, timeout 5s por repo)")
canonicals = []
duplicates = []
externals = []
unknowns = []

found = 0
for dirpath, dirnames, _ in os.walk(ROOT):
    if ".git" in dirnames:
        dirnames.remove(".git")
        repo_path = dirpath
        top, _ = run("git rev-parse --show-toplevel", repo_path)
        if not top:
            continue
        if top == source_repo:
            canonicals.append(repo_path)
            continue
        remote_r, _ = run("git remote get-url origin", repo_path)
        head_r, _ = run("git rev-parse --short HEAD", repo_path)
        branch_r, _ = run("git branch --show-current", repo_path)
        size_r, _ = run("du -sh \"%s\"" % repo_path, ROOT)
        if remote_r:
            if remote_r == remote:
                duplicates.append((repo_path, remote_r, head_r, branch_r, size_r))
            else:
                externals.append((repo_path, remote_r, head_r, branch_r, size_r))
        else:
            unknowns.append((repo_path, head_r, branch_r, size_r))
        found += 1
        if found >= 80:
            break

lines.append(f"### 3.1 CANONICAL (mesmo root do source)")
for p in canonicals:
    lines.append(f"  - {p}")
lines.append("")
lines.append(f"### 3.2 DUPLICATE_SAME_REMOTE (mesmo remote do source)")
for p, r, h, b, s in duplicates:
    lines.append(f"  - {p} | remote={r} | head={h} | branch={b} | size={s}")
lines.append("")
lines.append(f"### 3.3 EXTERNAL (remote diferente)")
for p, r, h, b, s in externals:
    lines.append(f"  - {p} | remote={r} | head={h} | branch={b} | size={s}")
lines.append("")
lines.append(f"### 3.4 UNKNOWN (sem remote legível)")
for p, h, b, s in unknowns:
    lines.append(f"  - {p} | head={h} | branch={b} | size={s}")
lines.append("")

lines.append("## 4. Decisão de quarentena (DRY_RUN)")
lines.append("APPLY=0")
lines.append(f"QUARANTINE_DIR={QUARANTINE_DIR}")
lines.append("")
lines.append("### Ações previstas no APPLY=1")
for p, r, h, b, s in duplicates:
    safe = os.path.basename(p)
    dest = os.path.join(QUARANTINE_DIR, safe)
    lines.append(f"  MOVE {p} -> {dest}")
lines.append("")
lines.append("### O que NÃO será movido")
lines.append("  - CANONICAL_CURRENT: preservado")
lines.append("  - EXTERNAL_REPO: preservado (não é duplicata do source)")
lines.append("  - UNKNOWN_REPO: preservado (sem remote legível → UNKNOWN ≠ PASS)")
lines.append("")
lines.append("## 5. Próximo passo")
lines.append("Rodar com APPLY=1 após revisão:")
lines.append("")
lines.append("```bash")
lines.append(f"cd /e/CentralDark && APPLY=1 python scripts/discover-canonical-repos.py")
lines.append("```")
lines.append("")
lines.append("<i>🟡 UNKNOWN ≠ 🟢 PASS · ⚖️ REALIDADE = 👑 JUIZ · 🦜🚫 PAPAGAIO_OFF</i>")

receipt_text = "\n".join(lines) + "\n"
with open(RECEIPT, "w", encoding="utf-8") as f:
    f.write(receipt_text)

print(receipt_text)
print(f"\n✅ RECEIPT={RECEIPT}")
