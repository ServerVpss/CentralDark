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

for f in "${CONFLICTS[@]}"; do
  case "$f" in
    package.json|package-lock.json)
      # Aceita main (theirs no merge = base) e aplica bump do PR depois
      git checkout --theirs "$f"
      git add "$f"
      ;;
    scripts/trigger-fabric/centraldark_master_cycle.py|\
    scripts/lupa/*.py|\
    docs/**|.github/**)
      # Core/canônico: mantém main (ours do merge = main atual)
      git checkout --ours "$f"
      git add "$f"
      ;;
    *)
      # Default fail-closed: não inventa. Mantém main.
      git checkout --ours "$f"
      git add "$f"
      ;;
  esac
done

# Aplicar bump do Dependabot (se package.json foi tocado)
if printf '%s\n' "${CONFLICTS[@]}" | grep -q "package.json"; then
  # Extrai a versão alvo do PR (branch name ou diff)
  BRANCH=$(git branch --show-current)
  # Tenta inferir do nome do branch: typescript-5.9.3 -> typescript@5.9.3
  PKG=$(echo "$BRANCH" | sed -E 's/.*npm_and_yarn\/([a-z0-9@/-]+)-([0-9.]+)$/\1/')
  VER=$(echo "$BRANCH" | sed -E 's/.*npm_and_yarn\/([a-z0-9@/-]+)-([0-9.]+)$/\2/')
  if [ -n "$PKG" ] && [ -n "$VER" ]; then
    PKG_CLEAN=$(echo "$PKG" | sed 's/@/-/')  # radix-ui -> radix-ui
    echo "BUMP_TARGET=$PKG_CLEAN@$VER"
    # patch package.json
    python3 - "$PKG_CLEAN" "$VER" <<'PY'
import sys, json, re
pkg, ver = sys.argv[1], sys.argv[2]
path = "package.json"
with open(path) as fh:
    data = json.load(fh)
def set_dep(section, name, version):
    if section in data and name in data[section]:
        data[section][name] = version
        return True
    return False
name = pkg.replace("radix-ui", "@radix-ui")
for sect in ("dependencies","devDependencies","peerDependencies","optionalDependencies"):
    if set_dep(sect, name, ver):
        break
with open(path, "w") as fh:
    json.dump(data, fh, indent=2)
    fh.write("\n")
print("PATCHED package.json")
PY
    git add package.json
  fi
fi

git commit --no-edit
git push origin pr_resolve_"$PR_NUM":"$(git branch --show-current)"
echo "RESOLVED_AND_PUSHED"
