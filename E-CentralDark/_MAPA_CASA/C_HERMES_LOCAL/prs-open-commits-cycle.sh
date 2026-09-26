#!/bin/bash
# PRs abertos com commits — ciclo de verificação auto até 18:00 Brasil
# Sem entrega ao CHEFE. Registra internamente.
set -e

LOG="E:/CentralDark/_MAPA_CASA/C_HERMES_LOCAL/prs-open-commits-cycle.log"
REPO="E:/CentralDark/Pivete/CentralDark"

# Só roda até 18:00 horário Brasil (UTC-3 no momento, ajuste manual se mudar)
HORA_BRASIL=$(date +%H)
if [ "$HORA_BRASIL" -ge 18 ]; then
  echo "$LOG horário >= 18:00 Brasil — ciclo stop." >> "$LOG"
  exit 0
fi

UTC_NOW=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
BR_NOW=$(TZ=Brazil/East date +"%Y-%m-%d %H:%M:%S")

cd "$REPO"

echo "===== CICLO $(date -u +%Y%m%d%H%M%S) | BR: $BR_NOW =====" >> "$LOG"
echo "--- gh disponivel? ---" >> "$LOG"
command -v gh >/dev/null && echo "gh OK" >> "$LOG" || { echo "GH INDISPONIVEL" >> "$LOG"; exit 1; }

echo "--- PRs ABERTOS COM COMMITS ---" >> "$LOG"
gh pr list --state open --limit 50 --json number,title,commits,updatedAt,headRefName,state,isDraft,mergeable,mergedAt,closedAt,createdAt 2>/dev/null > "$LOG/prs.json" || true

if [ ! -s "$LOG/prs.json" ]; then
  echo "NENHUM PR ABERTO OU GH FALHOU" >> "$LOG"
  exit 0
fi

python3 - <<'PY' "$LOG/prs.json" "$LOG"
import json, sys, datetime, subprocess, os

log_file = sys.argv[1]
prs_file = sys.argv[2]

with open(prs_file) as f:
    prs = json.load(f)

lines = []
for pr in prs:
    if not pr.get("commits"):
        continue
    n = pr["number"]
    title = pr["title"]
    state = pr["state"]
    draft = pr.get("isDraft", False)
    mergeable = pr.get("mergeable")
    updated = pr.get("updatedAt")
    created = pr.get("createdAt")
    merged = pr.get("mergedAt")
    closed = pr.get("closedAt")
    commits_count = len(pr["commits"]) if pr.get("commits") else 0
    head = pr.get("headRefName", "")

    lines.append(f"PR #{n}: {title}")
    lines.append(f"  estado: {state} | draft: {draft} | mergeable: {mergeable}")
    lines.append(f"  commits: {commits_count} | branch: {head}")
    lines.append(f"  created: {created} | updated: {updated}")
    if merged: lines.append(f"  merged: {merged}")
    if closed: lines.append(f"  closed: {closed}")

    # CI checks
    try:
        out = subprocess.run(
            ["gh", "pr", "checks", str(n), "--json", "name,state,startedAt,completedAt,workflow"],
            capture_output=True, text=True, timeout=20
        )
        if out.returncode == 0:
            data = json.loads(out.stdout)
            ci = {}
            for c in data:
                s = c.get("state")
                ci.setdefault(s, []).append(f"{c.get('workflow')}: {c.get('name')} ( started:{c.get('startedAt')}, completed:{c.get('completedAt')} )")
            for st in ["PASSING","FAILING","QUEUED","SKIPPED","IN_PROGRESS"]:
                if st in ci:
                    lines.append(f"  CI {st}: {len(ci[st])} checks")
                    for item in ci[st][:4]:
                        lines.append(f"    - {item}")
    except Exception as e:
        lines.append(f"  CI: erro ({e})")

    lines.append("")

with open(log_file, "a", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
PY
echo "CICLO OK" >> "$LOG"
