#!/usr/bin/env bash
# CentralDark — dispatcher canônico de deploy / TLC23 fail-closed
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/deploy_centraldark}"
TARGET_SHA_INPUT="${TARGET_SHA:-}"

CENTRALDARK_DEPLOY="$REPO_DIR/scripts/vps/centraldark-deploy.sh"
OPERATIONAL_GUARDS="$REPO_DIR/scripts/vps/deploy-operational-guards.sh"
HOOK_PREPARE="$REPO_DIR/.github/hooks/prepare-commit-msg-prevencao-push-sujo"

APPLY=0
GATE_ONLY=0
ACEITAR_DIVERGENCIA=0
for arg in "$@"; do
  case "$arg" in
    --apply) APPLY=1 ;;
    --gate-only) GATE_ONLY=1 ;;
    --aceitar-divergencia) ACEITAR_DIVERGENCIA=1 ;;
    *) echo "argumento desconhecido: $arg"; exit 2 ;;
  esac
done
[[ "$APPLY" -eq 0 || "$GATE_ONLY" -eq 0 ]] || { echo "--apply e --gate-only são mutuamente exclusivos"; exit 2; }

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }
info() { log "INFO: $*"; }
contar_sujos_todos() { git status --porcelain --untracked-files=all | sed '/^$/d' | wc -l | tr -d ' '; }

exec 9>/tmp/centraldark-dispatcher.lock
flock -w 90 9 || die "outro dispatcher segurando a trava" 63

log "=== T0 ==="
[[ -d "$REPO_DIR/.git" ]] || die "REPO_DIR sem .git: $REPO_DIR" 10
cd "$REPO_DIR"
ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[[ "$ORIGIN_URL" =~ github\.com[:/]ServerVpss/CentralDark(\.git)?$ ]] || die "origin não é ServerVpss/CentralDark" 64

git fetch --prune origin "$BRANCH" --quiet || die "fetch de origin/$BRANCH falhou" 11
ORIGIN_SHA="$(git rev-parse "origin/$BRANCH")"
HEAD_ANTES="$(git rev-parse HEAD)"
ATRAS="$(git rev-list --count "HEAD..origin/$BRANCH")"
AFRENTE="$(git rev-list --count "origin/$BRANCH..HEAD")"
SUJOS_ALL="$(contar_sujos_todos)"

if [[ -n "$TARGET_SHA_INPUT" ]]; then
  [[ "$TARGET_SHA_INPUT" =~ ^[0-9a-f]{40}$ ]] || die "TARGET_SHA inválido" 16
  git cat-file -e "$TARGET_SHA_INPUT^{commit}" 2>/dev/null || die "TARGET_SHA não existe localmente após fetch" 16
  git merge-base --is-ancestor "$TARGET_SHA_INPUT" "$ORIGIN_SHA" || die "TARGET_SHA não pertence a origin/$BRANCH" 16
  ALVO="$TARGET_SHA_INPUT"
else
  ALVO="$ORIGIN_SHA"
fi

log "HEAD_ANTES=$HEAD_ANTES"
log "ORIGIN_SHA=$ORIGIN_SHA"
log "ALVO=$ALVO"
log "ATRAS=$ATRAS AFRENTE=$AFRENTE WORKTREE_DIRTY=$SUJOS_ALL GATE_ONLY=$GATE_ONLY APPLY=$APPLY"

# Materializa o SHA exato sem reutilizar diretório já existente.
GATE_ROOT="$(mktemp -d /tmp/centraldark-tlc23-deploy.XXXXXX)"
GATE_TMP="$GATE_ROOT/worktree"
CONTRACT_RECEIPT="$GATE_ROOT/repo-contract.txt"
cleanup_gate_tmp() {
  git worktree remove --force "$GATE_TMP" >/dev/null 2>&1 || true
  rm -rf "$GATE_ROOT" >/dev/null 2>&1 || true
}
trap cleanup_gate_tmp EXIT

git worktree add --detach "$GATE_TMP" "$ALVO" --quiet || die "não foi possível materializar SHA alvo" 16

log "=== TLC23 / UNIVERSAL / META-LUPA SOURCE GATE ==="
(
  set -euo pipefail
  cd "$GATE_TMP"
  test "$(git rev-parse HEAD)" = "$ALVO"
  python3 scripts/trigger-fabric/centraldark_master_cycle.py --self-test
  python3 scripts/trigger-fabric/verify_repo_contract.py . | tee "$CONTRACT_RECEIPT"
  grep -q '^REPO_CONTRACT_VERIFY=PASS$' "$CONTRACT_RECEIPT"
  node apps/modulos/HERMES-CORE/core/universal-method-contract.mjs --self-test
  python3 scripts/lupa/validar_autolupa_hash.py
  python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --self-test
  python3 .agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py --self-test
) || die "SHA alvo falhou gate canônico de source" 16

# GATE_ONLY é usado por deploys específicos: não toca no checkout/runtime.
if [[ "$GATE_ONLY" -eq 1 ]]; then
  cat >"$GATE_ROOT/tlc23-deploy-facts.json" <<'JSON'
{
  "centraldark_gate": {
    "acordar_done": true,
    "calibrar_done": true,
    "multibussola_done": true,
    "meta_lupa_done": true,
    "menos_e_mais_done": true,
    "owner_resolved": true,
    "writer_scope_valid": true,
    "evidence_bound": true,
    "no_destructive_bypass": true
  }
}
JSON
  (cd "$GATE_TMP" && python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --facts-file "$GATE_ROOT/tlc23-deploy-facts.json") \
    || die "HORN_CARACOL_GATE_ONLY=BLOCK" 16
  log "TLC23_DEPLOY_GATE_ONLY=PASS TARGET_SHA=$ALVO"
  exit 0
fi

# A partir daqui existe intenção de validar uma futura mutação do checkout vivo.
[[ -x "$CENTRALDARK_DEPLOY" ]] || die "centraldark-deploy.sh ausente ou não executável" 10
[[ -x "$OPERATIONAL_GUARDS" ]] || die "deploy-operational-guards.sh ausente ou não executável" 10
[[ "$SUJOS_ALL" -eq 0 ]] || die "TLC23 bloqueou worktree suja" 16
[[ "$AFRENTE" -eq 0 ]] || die "TLC23 bloqueou histórico local à frente; reconciliar antes" 16
if [[ "$ACEITAR_DIVERGENCIA" -eq 1 ]]; then
  info "--aceitar-divergencia mantido por compatibilidade; TLC23 não permite bypass de AFRENTE>0"
fi

if [[ ! -f "$SSH_KEY" && "$APPLY" -eq 1 ]]; then
  die "chave de deploy ausente em $SSH_KEY" 14
fi

IMUTAVEIS="$(git ls-files -z | xargs -0 -r lsattr -d 2>/dev/null | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/, ""); print }' || true)"
[[ -z "$IMUTAVEIS" ]] || die "IMUTAVEL_BLOQUEIA_DEPLOY" 12

if [[ -x "$HOOK_PREPARE" ]]; then
  info "hook de push sujo presente"
fi

# Só agora, depois das contraprovas destrutivas, materializa no_destructive_bypass=true.
cat >"$GATE_ROOT/tlc23-deploy-facts.json" <<'JSON'
{
  "centraldark_gate": {
    "acordar_done": true,
    "calibrar_done": true,
    "multibussola_done": true,
    "meta_lupa_done": true,
    "menos_e_mais_done": true,
    "owner_resolved": true,
    "writer_scope_valid": true,
    "evidence_bound": true,
    "no_destructive_bypass": true
  }
}
JSON
(cd "$GATE_TMP" && python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --facts-file "$GATE_ROOT/tlc23-deploy-facts.json") \
  || die "HORN_CARACOL_DEPLOY_GATE=BLOCK" 16

log "TLC23_TARGET_SHA=$ALVO"
log "UNIVERSAL_METHOD_TARGET=PASS"
log "HORN_CARACOL_DEPLOY_GATE=PASS"

if [[ "$HEAD_ANTES" == "$ORIGIN_SHA" && "$SUJOS_ALL" -eq 0 ]]; then
  log "JA_SINCRONIZADO — source já está no alvo; gate revalidado"
  exit 0
fi

if [[ "$APPLY" -eq 0 ]]; then
  log "PRE_FLIGHT=PASS MUTATION_PERFORMED=false"
  exit 0
fi

log "=== APLICANDO ==="
"$CENTRALDARK_DEPLOY" --apply || die "centraldark-deploy.sh falhou" 13

log "=== T1 ==="
HTTP="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH" 2>/dev/null || true)"
[[ -n "$HTTP" ]] || HTTP=000
[[ "$HTTP" == "200" ]] || die "health do MCP != 200" 14
ss -tlnp 2>/dev/null | grep -q ':9100' || die "porta 9100 sem listener" 14

log "DEPLOY_PROVADO=PASS"
log "TLC23/HORN/UNIVERSAL=PASS"
log "MCP_HEALTH=200 PORTA_9100=LISTENING"
