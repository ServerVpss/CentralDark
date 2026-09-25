#!/usr/bin/env bash
set -Eeuo pipefail

REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
SCRATCH="${CENTRALDARK_SCRATCH:-$REPO/_worktrees/main-pinned-runtime-fastpath}"
LOCK="${CENTRALDARK_FASTPATH_LOCK:-/tmp/centraldark-main-pinned-fastpath.lock}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="/root/CentralDark-Recovery/learning-apply/$STAMP"
RECEIPT_DIR="$REPO/logs/receipts"
RECEIPT="$RECEIPT_DIR/learning-apply-$STAMP.json"

FILES=(
  "AGENTS.md"
  "LEIA-ME-IA.md"
  "ROOT-FILE-REGISTRY.md"
  "ROOT-FILE-REGISTRY.json"
  "root-file-binding.yaml"
  ".agents/library-index.json"
  ".agents/skills/root-file-contract-router/SKILL.md"
  ".agents/skills/main-pinned-runtime-fast-path/SKILL.md"
  ".githooks/pre-commit-root-contract.sh"
  "scripts/hooks/pre-commit.centraldark-execution-contract.sh"
  "scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh"
  "scripts/hooks/install-centraldark-hooks.sh"
  "docs/CONSCIENCIA/MICRO-DEPLOY/README.md"
  "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.md"
  "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json"
  "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml"
  "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MICRO-DEPLOY-CONTINUO-BINDING.yml"
  "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/UNIVERSAL-ENGINE-METHOD.yml"
  "apps/bot-telegram/CENTRALDARK-MANDATORY-RULES.yml"
  "apps/bot-telegram/unified-bot.cjs"
  ".github/workflows/vps-exec-selfhosted.yml"
  "scripts/vps/centraldark-deploy.sh"
  "scripts/vps/hydrate-provider-secrets.sh"
)

exec 9>"$LOCK"
flock -w 90 9 || { echo "LOCK_TIMEOUT"; exit 21; }

cd "$REPO"
export HOME="${HOME:-/root}"
git fetch --prune origin main >/dev/null
TARGET_SHA="$(git rev-parse origin/main)"

mkdir -p "$(dirname "$SCRATCH")"
if ! git worktree list --porcelain | grep -F "worktree $SCRATCH" >/dev/null 2>&1; then
  rm -rf "$SCRATCH"
  git worktree add --detach "$SCRATCH" origin/main >/dev/null
fi

REAL="$(readlink -f "$SCRATCH")"
[[ "$REAL" == "$SCRATCH" ]] || { echo "SCRATCH_PATH_MISMATCH=$REAL"; exit 22; }
[[ "$REAL" != "$(readlink -f "$REPO")" ]] || { echo "RUNTIME_IS_NOT_SCRATCH=FAIL"; exit 23; }

git -C "$SCRATCH" fetch --prune origin main >/dev/null
git -C "$SCRATCH" reset --hard origin/main >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null
[[ -z "$(git -C "$SCRATCH" status --porcelain)" ]] || { echo "SCRATCH_DIRTY_BEFORE"; exit 24; }

bash "$SCRATCH/.githooks/pre-commit-root-contract.sh"
node --check "$SCRATCH/apps/bot-telegram/unified-bot.cjs"

mkdir -p "$BACKUP"
for rel in "${FILES[@]}"; do
  [[ -e "$SCRATCH/$rel" ]] || { echo "SOURCE_MISSING=$rel"; exit 25; }
  if [[ -e "$REPO/$rel" ]]; then
    mkdir -p "$BACKUP/$(dirname "$rel")"
    cp -a "$REPO/$rel" "$BACKUP/$rel"
  fi
  mkdir -p "$REPO/$(dirname "$rel")"
  cp -a "$SCRATCH/$rel" "$REPO/$rel"
  cmp -s "$SCRATCH/$rel" "$REPO/$rel" || { echo "HASH_COPY_MISMATCH=$rel"; exit 26; }
done

mkdir -p "$REPO/.git/hooks"
cat > "$REPO/.git/hooks/pre-commit" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
bash "$ROOT/scripts/hooks/pre-commit.centraldark-execution-contract.sh"
bash "$ROOT/.githooks/pre-commit-root-contract.sh"
HOOK
cp "$REPO/scripts/hooks/pre-push.main-pinned-runtime-fast-path.sh" "$REPO/.git/hooks/pre-push"
chmod +x "$REPO/.git/hooks/pre-commit" "$REPO/.git/hooks/pre-push"

for app in CentralDark-HubBot-Srver1 CentralDark-HubBot-Guardiao; do
  PM2_HOME=/root/.pm2 pm2 restart "$app" --update-env >/dev/null
done
sleep 2
for app in CentralDark-HubBot-Srver1 CentralDark-HubBot-Guardiao; do
  status="$(PM2_HOME=/root/.pm2 pm2 jlist | jq -r --arg app "$app" '.[] | select(.name==$app) | .pm2_env.status' | head -n1)"
  [[ "$status" == "online" ]] || { echo "BOT_NOT_ONLINE=$app:$status"; exit 27; }
done

mkdir -p "$RECEIPT_DIR"
jq -n   --arg target "$TARGET_SHA"   --arg backup "$BACKUP"   --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)"   --argjson files "${#FILES[@]}"   '{schema:"centraldark.learning-apply.v2",target_sha:$target,backup:$backup,observed_at:$at,fileset_count:$files,result:"PASS",receipt_before_cleanup:true,secrets_exposed:false}'   > "$RECEIPT"
echo "LOCAL_RECEIPT=$RECEIPT"

git -C "$SCRATCH" reset --hard origin/main >/dev/null
git -C "$SCRATCH" clean -fdx >/dev/null
[[ -z "$(git -C "$SCRATCH" status --porcelain)" ]] || { echo "SCRATCH_DIRTY_AFTER"; exit 28; }

echo "CENTRALDARK_APPLY_LEARNING=PASS"
echo "TARGET_SHA=$TARGET_SHA"
echo "FILES_PROMOTED=${#FILES[@]}"
echo "SCRATCH_CLEAN_AFTER=PASS"
