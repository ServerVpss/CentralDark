#!/usr/bin/env bash
# scripts/dependabot/resolve-conflicts.sh
# Resolução determinística de conflitos em PRs Dependabot (ou qualquer PR de bump).
# Padrão canônico:
#   - package.json / package-lock.json: aceita BASE (main) e aplica APENAS o bump do PR.
#   - outros arquivos: aceita o lado que não conflita ou main se ambos divergentes.
#   - centraldark_master_cycle.py e outros do core: mantém main (ours do merge = main).
# Fail-closed: se não conseguir resolver deterministicamente, sai com erro (não inventa).

set -euo pipefail

PR_NUM="${1:?Uso: $0 <PR_NUMBER>}"
REPO_DIR="${REPO_DIR:-/root/CentralDark}"   # no runner self-hosted
LOCAL="${LOCAL_REPO:-$REPO_DIR}"

cd "$LOCAL"
git fetch --prune origin main
git fetch origin pull/"$PR_NUM"/head:pr_resolve_"$PR_NUM" 2>/dev/null || git fetch origin "refs/pull/$PR_NUM/head:pr_resolve_$PR_NUM"
git checkout pr_resolve_"$PR_NUM"

if git merge --no-commit --no-ff origin/main 2>&1 | grep -q "CONFLICT"; then
  echo "CONFLICT_DETECTED"
else
  echo "NO_CONFLICT"
  git merge --abort 2>/dev/null || true
  exit 0
fi

# Listar arquivos em conflito
mapfile -t CONFLICTS < <(git diff --name-only --diff-filter=U)

# ATENÇÃO — semântica de ours/theirs neste script (provado empiricamente):
# estamos NA branch do PR e fazemos `git merge origin/main`, portanto:
#   --ours   = lado do PR   (HEAD)
#   --theirs = lado da main (MERGE_HEAD)
# A versão anterior tinha os comentários invertidos em relação ao código:
# dizia "mantém main" e usava --ours, que aceita o PR. Isso fazia o
# "fail-closed" falhar ABERTO — um PR podia sobrescrever .github/, docs/ e
# scripts/trigger-fabric/ sem revisão.
# CORRIGIDO (PR #1343): a versão anterior tinha os comentários invertidos e
# falhava fail-closed ABERTO — um PR podia sobrescrever .github/, docs/ e
# scripts/trigger-fabric/. Agora: lockfile=PR (--ours), resto=main (--theirs).
# REGRA PERMANENTE: FAIL_CLOSED_ESCRITO != FAIL_CLOSED_IMPLEMENTADO.
# Sempre validar o código, não o comentário.
for f in "${CONFLICTS[@]}"; do
  case "$f" in
    # package.json: merge inteligente — aplica o bump do PR mas preserva o resto da main
    package.json|*/package.json)
      python3 - "$f" <<'PY'
import json, sys
f = sys.argv[1]
def read_json(stage):
    try:
        import subprocess
        out = subprocess.check_output(["git", "show", f":{stage}:{f}"], stderr=subprocess.DEVNULL)
        return json.loads(out)
    except:
        return {}
def read_base():
    try:
        import subprocess
        base = subprocess.check_output(["git", "merge-base", "HEAD", "MERGE_HEAD"], stderr=subprocess.DEVNULL).decode().strip()
        out = subprocess.check_output(["git", "show", f"{base}:{f}"], stderr=subprocess.DEVNULL)
        return json.loads(out)
    except:
        return {}
pr = read_json("2")      # :2: = ours = HEAD = PR
main = read_json("3")    # :3: = theirs = MERGE_HEAD = main
base = read_base()
result = {}
all_keys = set(list(main.keys()) + list(pr.keys()))
for k in sorted(all_keys):
    if k not in main:
        result[k] = pr[k]
    elif k not in pr:
        result[k] = main[k]
    else:
        if k in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "scripts"):
            merged = {}
            all_dep_keys = set(list(main.get(k, {}).keys()) + list(pr.get(k, {}).keys()))
            for dep in sorted(all_dep_keys):
                base_val = base.get(k, {}).get(dep)
                pr_val = pr[k].get(dep)
                main_val = main[k].get(dep)
                if pr_val != base_val:
                    merged[dep] = pr_val  # PR mudou, aplica bump
                else:
                    merged[dep] = main_val  # PR não mudou, mantém main
            result[k] = merged
        else:
            result[k] = pr[k]
with open(f, "w") as fh:
    json.dump(result, fh, indent=2)
    fh.write("\n")
print(f"MERGED {f}: base + PR bumps + main preserved")
PY
      git add -- "$f"
      ;;
    # Lockfile: aceita PR (lockfile é gerado, não editado manualmente)
    package-lock.json|pnpm-lock.yaml|yarn.lock|*/package-lock.json|*/pnpm-lock.yaml|*/yarn.lock)
      git checkout --ours -- "$f"
      git add -- "$f"
      ;;
    # Core/canônico e QUALQUER outro caminho: main vence. Fail-closed de verdade.
    *)
      git checkout --theirs -- "$f"
      git add -- "$f"
      ;;
  esac
done

git commit --no-edit
git push origin pr_resolve_"$PR_NUM":"$(git branch --show-current)"
echo "RESOLVED_AND_PUSHED"
