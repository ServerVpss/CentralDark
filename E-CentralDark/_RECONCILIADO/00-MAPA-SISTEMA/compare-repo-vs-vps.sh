#!/bin/bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
BASE="/root/CentralDark/revisoes/$TS/comparar-repo-vs-vps-apps"
SNAP="$BASE/repo-snapshot"
REPORT="$BASE/RELATORIO-REPO-VS-VPS.md"
DETAIL="$BASE/diff-repo-vs-vps.tsv"

mkdir -p "$SNAP"

echo "🎬 NETFLIX MODE — REPO vs VPS (apps)"
echo "📁 Relatório: $BASE"
echo

# ==================== 1. ATUALIZAR REPO ====================
echo "[$(date +%H:%M:%S)] == 1/5 Atualizando referência do GitHub =="

cd /root/CentralDark
git fetch origin main --quiet || true
REF="origin/main"
SHA="$(git rev-parse "$REF" 2>/dev/null || echo 'desconhecido')"
echo "SHA do repo: $SHA"

# ==================== 2. CRIAR SNAPSHOT ====================
echo "[$(date +%H:%M:%S)] == 2/5 Criando snapshot limpo do repositório =="

git archive "$REF" | tar -x -C "$SNAP"

REPO_APPS="$SNAP/apps"
VPS_APPS="/root/CentralDark/apps"

if [ ! -d "$REPO_APPS" ]; then
    echo "❌ ERRO: Snapshot do repo não contém pasta apps/"
    exit 1
fi

echo "Repo apps: $REPO_APPS"
echo "VPS apps : $VPS_APPS"

# ==================== 3. COMPARAÇÃO (Python) ====================
echo "[$(date +%H:%M:%S)] == 3/5 Inventariando e comparando..."

python3 - <<PYEOF
import os, hashlib, datetime
from pathlib import Path

repo = Path("$REPO_APPS")
vps = Path("$VPS_APPS")
base = Path("$BASE")
report = Path("$REPORT")
detail = Path("$DETAIL")

EXCLUDE = {".git","node_modules",".cache",".npm",".pm2",".grok","logs","sessions","tmp","temp","__pycache__","dist","build"}

def sha256(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def inventory(root):
    data = {}
    for cur, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in EXCLUDE]
        for name in files:
            p = Path(cur) / name
            try:
                rel = str(p.relative_to(root))
                st = p.stat()
                sensitive = name.startswith(".env") or name.endswith((".pem",".key",".p12",".pfx"))
                data[rel] = {
                    "size": st.st_size,
                    "mtime": int(st.st_mtime),
                    "sha": "<sensivel>" if sensitive else sha256(p),
                    "sensitive": sensitive
                }
            except:
                pass
    return data

def human(n):
    n = float(n)
    for u in ["B","KB","MB","GB","TB"]:
        if n < 1024: return f"{n:.1f}{u}"
        n /= 1024
    return f"{n:.1f}TB"

def dt(ts):
    return datetime.datetime.fromtimestamp(ts).strftime("%Y-%m-%d %H:%M:%S")

r = inventory(repo)
v = inventory(vps)

only_repo = sorted(set(r) - set(v))
only_vps  = sorted(set(v) - set(r))
common    = sorted(set(r) & set(v))

same = []
diff = []

for rel in common:
    if r[rel]["sensitive"] or v[rel]["sensitive"]:
        continue
    if r[rel]["sha"] == v[rel]["sha"]:
        same.append(rel)
    else:
        newer = "REPO" if r[rel]["mtime"] > v[rel]["mtime"] else "VPS"
        diff.append((rel, newer))

# TSV
rows = ["status\tarquivo\tmais_novo\tsize_repo\tmtime_repo\tsize_vps\tmtime_vps"]
for rel in only_repo:
    a = r[rel]
    rows.append(f"SO_REPO\t{rel}\tREPO\t{a['size']}\t{a['mtime']}\t-\t-")
for rel in only_vps:
    b = v[rel]
    rows.append(f"SO_VPS\t{rel}\tVPS\t-\t-\t{b['size']}\t{b['mtime']}")
for rel, newer in diff:
    a, b = r[rel], v[rel]
    rows.append(f"DIFERENTE\t{rel}\t{newer}\t{a['size']}\t{a['mtime']}\t{b['size']}\t{b['mtime']}")
for rel in same:
    a, b = r[rel], v[rel]
    rows.append(f"IGUAL\t{rel}\tIGUAL\t{a['size']}\t{a['mtime']}\t{b['size']}\t{b['mtime']}")

detail.write_text("\n".join(rows) + "\n")

# Relatório Markdown
lines = []
lines.append("# 🎬 RELATÓRIO NETFLIX — Repo vs VPS (apps)")
lines.append("")
lines.append(f"- **Data**: `{datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}`")
lines.append(f"- **Repo SHA**: `$SHA`")
lines.append(f"- **Repo apps**: `{repo}`")
lines.append(f"- **VPS apps**: `{vps}`")
lines.append("")
lines.append("## Resumo")
lines.append("")
lines.append(f"- Arquivos no repo/apps: **{len(r)}**")
lines.append(f"- Arquivos na VPS/apps: **{len(v)}**")
lines.append(f"- Só no repo: **{len(only_repo)}**")
lines.append(f"- Só na VPS: **{len(only_vps)}**")
lines.append(f"- Diferentes: **{len(diff)}**")
lines.append(f"- Iguais: **{len(same)}**")
lines.append("")
lines.append("## Recomendação")
lines.append("")
lines.append("1. Não mover nada ainda.")
lines.append("2. Analise o que está **só no repo** (pode estar faltando na VPS).")
lines.append("3. Analise o que está **só na VPS** (pode ser lixo, build antigo ou não versionado).")
lines.append("4. Migre uma pasta por vez para `/root/CentralDark/apps`.")
lines.append("5. Só apague coisas antigas depois de validar funcionamento.")
lines.append("")
lines.append(f"**Detalhe completo (TSV)**: `{detail}`")

report.write_text("\n".join(lines))

print("\n=== RESUMO ===")
print(f"repo/apps : {len(r)} arquivos")
print(f"vps/apps  : {len(v)} arquivos")
print(f"Só no repo: {len(only_repo)}")
print(f"Só na VPS : {len(only_vps)}")
print(f"Diferentes: {len(diff)}")
print(f"Iguais    : {len(same)}")
print(f"\nRelatório salvo em: {report}")
print(f"Detalhe TSV     : {detail}")
PYEOF

# ==================== 4 e 5 ====================
echo
echo "[$(date +%H:%M:%S)] == 4/5 Relatório gerado =="
echo "$REPORT"
echo
echo "[$(date +%H:%M:%S)] == 5/5 Finalizado =="
echo
echo "Para ver o relatório:"
echo "cat '$REPORT'"
