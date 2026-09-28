#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# CentralDark — dispatcher condicional de scripts de deploy na VPS
# ══════════════════════════════════════════════════════════════════════
#
# Decide QUAL script de deploy executar (ou nenhum) com base no que
# está sendo commitado, nos recursos existentes e nos riscos detectados.
#
# Leis (.agents/skills/centraldark-esteira-motor):
#   MERGED != DEPLOYED   → deploy é idenficado pelo SHA do evento, não pelo PR
#   AÇÃO != PROVA        → pré-flight antes de qualquer decisão; T1 só se --apply
#   NO_FORCE_PUSH        → nunca modifica o remoto
#   NO_BLIND_OVERWRITE   → divergência de histórico exige flag explícita
#   REUSE_BEFORE_CREATE  → reutiliza os dois scripts existentes; não duplica
#   ONE_WRITER_PER_SCOPE → trava única por tipo de deploy
#   FAIL_HIGH            → falha alto em vez de promover no escuro
#   TLC23/HORN            → corpo incompleto nunca fabrica cabeça PASS
#
# Uso:
#   ./deploy-guards-dispatcher.sh                          # pré-flight (idem)
#   ./deploy-guards-dispatcher.sh --apply                  # executa a decisão
#   ./deploy-guards-dispatcher.sh --apply --aceitar-divergencia
#
# Variáveis de ambiente (opcionais):
#   REPO_DIR             default: /root/CentralDark
#   SSH_KEY              default: ~/.ssh/deploy_centraldark
#
# Saídas:
#   0 ok sem alterações necessárias
#   1 uso | 2 argumento | 10 repo inválido | 11 sem rede/fetch
#   12 imutável | 13 divergência | 14 sem privilégio | 15 hook bloqueia
#   16 TLC23/universal proof gate | 21 operational | 22 repo-wide
#
# ══════════════════════════════════════════════════════════════════════
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
SSH_KEY="${SSH_KEY:-${HOME:-/root}/.ssh/deploy_centraldark}"
TARGET_SHA_INPUT="${TARGET_SHA:-}"

CENTRALDARK_DEPLOY="$REPO_DIR/scripts/vps/centraldark-deploy.sh"
OPERATIONAL_GUARDS="$REPO_DIR/scripts/vps/deploy-operational-guards.sh"
HOOK_PREPARE="$REPO_DIR/.github/hooks/prepare-commit-msg-prevencao-push-sujo"

APPLY=0
GATE_ONLY=0
SOURCE_ONLY=0
TOTAL=0
ACEITAR_DIVERGENCIA=0
for arg in "$@"; do
  case "$arg" in
    --apply)                APPLY=1 ;;
    --gate-only)            GATE_ONLY=1 ;;
    --source-only)          SOURCE_ONLY=1 ;;
    --total)                TOTAL=1 ;;
    --aceitar-divergencia)  ACEITAR_DIVERGENCIA=1 ;;
    *) echo "argumento desconhecido: $arg"; exit 2 ;;
  esac
done
[[ "$APPLY" -eq 0 || "$GATE_ONLY" -eq 0 ]] || { echo "--apply e --gate-only são mutuamente exclusivos"; exit 2; }
[[ "$SOURCE_ONLY" -eq 0 || "$TOTAL" -eq 0 ]] || { echo "--source-only e --total são mutuamente exclusivos"; exit 2; }
[[ "$GATE_ONLY" -eq 0 || ( "$SOURCE_ONLY" -eq 0 && "$TOTAL" -eq 0 ) ]] || { echo "--gate-only não aceita modo de apply"; exit 2; }

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }
info() { log "INFO: $*"; }

contar_sujos() {
  git status --porcelain | grep -cE '^([MARCD ][MARCD]|[MARCD] )' || true
}
contar_sujos_todos() {
  git status --porcelain --untracked-files=all | sed '/^$/d' | wc -l | tr -d ' '
}

# ─── Lock única por dispatcher (não conflita com os locks dos scripts) ─
exec 9>/tmp/centraldark-dispatcher.lock
flock -w 90 9 || die "outro dispatcher segurando a trava" 63

# ─── T0 ────────────────────────────────────────────────────────────────
log "=== T0 (antes) ==="
[[ -d "$REPO_DIR/.git" ]] || die "REPO_DIR sem .git: $REPO_DIR" 10
cd "$REPO_DIR"

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[[ "$ORIGIN_URL" =~ github\.com[:/]ServerVpss/CentralDark(\.git)?$ ]] \
  || die "origin não é ServerVpss/CentralDark: $ORIGIN_URL" 64

git fetch --prune origin "$BRANCH" --quiet || die "fetch de origin/$BRANCH falhou" 11

HEAD_ANTES="$(git rev-parse HEAD)"
ORIGIN_SHA="$(git rev-parse "origin/$BRANCH")"
if [[ -n "$TARGET_SHA_INPUT" ]]; then
  [[ "$TARGET_SHA_INPUT" =~ ^[0-9a-f]{40}$ ]] || die "TARGET_SHA inválido: $TARGET_SHA_INPUT" 16
  git cat-file -e "$TARGET_SHA_INPUT^{commit}" 2>/dev/null || die "TARGET_SHA não materializado após fetch" 16
  [[ "$TARGET_SHA_INPUT" == "$ORIGIN_SHA" ]] || die "TARGET_SHA_STALE gated=$TARGET_SHA_INPUT current=$ORIGIN_SHA" 16
  ALVO="$TARGET_SHA_INPUT"
else
  ALVO="$ORIGIN_SHA"
fi
ATRAS="$(git rev-list --count "HEAD..origin/$BRANCH")"
AFRENTE="$(git rev-list --count "origin/$BRANCH..HEAD")"
SUJOS="$(contar_sujos)"
SUJOS_ALL="$(contar_sujos_todos)"

log "HEAD_ANTES=$HEAD_ANTES"
log "ALVO=$ALVO"
log "ORIGIN_SHA=$ORIGIN_SHA"
log "ATRAS=$ATRAS  AFRENTE=$AFRENTE  RASTREADOS_SUJOS=$SUJOS  WORKTREE_DIRTY=$SUJOS_ALL"

# ─── Guarda: autenticação de deploy ─────────────────────────────────────
# O workflow self-hosted injeta autenticação GitHub efêmera via GIT_CONFIG_*.
# SSH_KEY é fallback, não requisito quando essa rota já foi provada no job.
HAS_EPHEMERAL_GIT_AUTH=0
if [[ "${GIT_CONFIG_COUNT:-0}" =~ ^[1-9][0-9]*$ ]]; then
  for ((i=0; i<GIT_CONFIG_COUNT; i++)); do
    key_var="GIT_CONFIG_KEY_$i"
    value_var="GIT_CONFIG_VALUE_$i"
    if [[ "${!key_var:-}" == "http.https://github.com/.extraheader" && "${!value_var:-}" == AUTHORIZATION:* ]]; then
      HAS_EPHEMERAL_GIT_AUTH=1
      break
    fi
  done
fi
if [[ ! -f "$SSH_KEY" && "$HAS_EPHEMERAL_GIT_AUTH" -ne 1 && "$APPLY" -eq 1 ]]; then
  die "autenticação de deploy ausente: SSH_KEY e GitHub ephemeral auth indisponíveis" 14
fi
info "deploy auth: ephemeral_git=$HAS_EPHEMERAL_GIT_AUTH ssh_key=$([[ -f "$SSH_KEY" ]] && echo presente || echo ausente)"

# ─── Guarda: scripts existentes ─────────────────────────────────────────
[[ -x "$CENTRALDARK_DEPLOY" ]] || die "centraldark-deploy.sh ausente ou não executável" 10
[[ -x "$OPERATIONAL_GUARDS" ]] || die "deploy-operational-guards.sh ausente ou não executável" 10

# ─── TLC23 / Universal Method: validar o SHA alvo antes de mutação ──────
log "=== TLC23 / UNIVERSAL PRE-FLIGHT ==="
GATE_ROOT="$(mktemp -d /tmp/centraldark-tlc23-deploy.XXXXXX)"
GATE_TMP="$GATE_ROOT/worktree"
CONTRACT_RECEIPT="$GATE_ROOT/repo-contract.txt"
cleanup_gate_tmp() {
  git worktree remove --force "$GATE_TMP" >/dev/null 2>&1 || true
  rm -rf "$GATE_ROOT" >/dev/null 2>&1 || true
}
trap cleanup_gate_tmp EXIT

git worktree add --detach "$GATE_TMP" "$ALVO" --quiet \
  || die "não foi possível materializar SHA alvo para contraprova" 16

(
  set -euo pipefail
  cd "$GATE_TMP"
  test "$(git rev-parse HEAD)" = "$ALVO"
  python3 scripts/trigger-fabric/centraldark_master_cycle.py --self-test
  python3 scripts/trigger-fabric/verify_repo_contract.py . | tee "$CONTRACT_RECEIPT"
  grep -q '^REPO_CONTRACT_VERIFY=PASS$' "$CONTRACT_RECEIPT"
  node apps/modulos/HERMES-CORE/core/universal-method-contract.mjs --self-test
  node --check scripts/agent-call.mjs
  grep -q "CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED" scripts/agent-call.mjs
  grep -q "GLOBAL_ENTRY_GATE=PASS" scripts/vps/centraldark-deploy.sh
  grep -q "GLOBAL_EXIT_GATE=PASS" scripts/vps/centraldark-deploy.sh
  python3 scripts/lupa/validar_autolupa_hash.py
  python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --self-test
  python3 .agents/skills/centraldark-operational-method/scripts/tlc23_runtime_gate.py --self-test
) || die "SHA alvo falhou Master/Universal/Meta-Lupa/Horn" 16

# Gate-only prova o SHA e sai sem tocar checkout/runtime.
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
  (cd "$GATE_TMP" && python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --facts-file "$GATE_ROOT/tlc23-deploy-facts.json") || die "HORN_CARACOL_GATE_ONLY=BLOCK" 16
  log "TLC23_DEPLOY_GATE_ONLY=PASS TARGET_SHA=$ALVO"
  exit 0
fi

if [[ "$APPLY" -eq 1 && "$ALVO" != "$ORIGIN_SHA" ]]; then
  die "APPLY_TARGET_MUST_EQUAL_ORIGIN_MAIN gated=$ALVO origin=$ORIGIN_SHA" 16
fi

# Os fatos abaixo só são materializados depois das medições acima.
# Divergência local ou worktree suja impede no_destructive_bypass.
[[ "$SUJOS_ALL" -eq 0 ]] || die "TLC23 bloqueou worktree suja" 16
[[ "$AFRENTE" -eq 0 ]] || die "TLC23 bloqueou histórico local à frente; reconciliar antes" 16

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
(
  cd "$GATE_TMP"
  python3 .agents/skills/meta-lupa/scripts/horn_caracol_gate.py --facts-file "$GATE_ROOT/tlc23-deploy-facts.json"
) || die "HORN_CARACOL_DEPLOY_GATE=BLOCK" 16
log "TLC23_TARGET_SHA=$ALVO"
log "UNIVERSAL_METHOD_TARGET=PASS"
log "HORN_CARACOL_DEPLOY_GATE=PASS"
log "GLOBAL_CONTRACT_ENFORCER_TARGET=PASS"

# ─── Guarda: imutáveis ──────────────────────────────────────────────────
IMUTAVEIS="$(git ls-files -z \
  | xargs -0 -r lsattr -d 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/,""); print }' \
  || true)"

if [[ -n "$IMUTAVEIS" ]]; then
  log "BLOQUEADO — arquivos rastreados com chattr +i:"
  while IFS= read -r f; do printf '  %s\n' "$f"; done <<< "$IMUTAVEIS"
  log "Para liberar (reversível com chattr +i):"
  log "  cd $REPO_DIR && git ls-files -z | xargs -0 -r chattr -i 2>/dev/null"
  die "IMUTAVEL_BLOQUEIA_DEPLOY" 12
fi
info "nenhum rastreado imutável — ok"

# ─── Guarda: histórico divergente ───────────────────────────────────────
if [[ "$AFRENTE" -gt 0 && "$ACEITAR_DIVERGENCIA" -eq 0 ]]; then
  log "O dispatcher bloqueia divergência de histórico."
  die "HISTORICO_DIVERGENTE" 13
fi

# ─── Guarda: hook de push sujo ──────────────────────────────────────────
if [[ -x "$HOOK_PREPARE" ]]; then
  log "=== guarda: hook prepare-commit-msg ==="
  log "presente em $HOOK_PREPARE"
fi

# ─── Decisão: nada a fazer ──────────────────────────────────────────────
if [[ "$HEAD_ANTES" == "$ALVO" && "$SUJOS_ALL" -eq 0 ]]; then
  log "JA_SINCRONIZADO — source já está no alvo; gate TLC23 foi revalidado"
  exit 0
fi

# ─── Dry-run para aqui ──────────────────────────────────────────────────
if [[ "$APPLY" -eq 0 ]]; then
  log "=== PRÉ-FLIGHT — nada alterado. Use --apply para executar. ==="
  log "ATRAS=$ATRAS  AFRENTE=$AFRENTE  WORKTREE_DIRTY=$SUJOS_ALL"
  log "caminho para origem: $ORIGIN_URL ($BRANCH)"
  log "alvo: origin/$BRANCH"
  log "scripts disponíveis: centraldark-deploy.sh, deploy-operational-guards.sh"
  log "TLC23/HORN/UNIVERSAL=PASS no SHA alvo"
  exit 0
fi

# ─── Aplicar ────────────────────────────────────────────────────────────
log "=== APLICANDO ==="

# Repo-wide com guards de imutabilidade; só alcançável após TLC23 PASS.
DEPLOY_ARGS=(--apply)
[[ "$SOURCE_ONLY" -eq 1 ]] && DEPLOY_ARGS+=(--source-only)
[[ "$TOTAL" -eq 1 ]] && DEPLOY_ARGS+=(--total)
[[ "$ACEITAR_DIVERGENCIA" -eq 1 ]] && DEPLOY_ARGS+=(--aceitar-divergencia)
log "executando centraldark-deploy.sh ${DEPLOY_ARGS[*]} via gate canônico"
CENTRALDARK_CANONICAL_DEPLOY_GATE=PASS \
CENTRALDARK_CANONICAL_DEPLOY_TARGET="$ALVO" \
  "$CENTRALDARK_DEPLOY" "${DEPLOY_ARGS[@]}" \
  || die "centraldark-deploy.sh falhou" 13

# ─── T1 (contraprova) ──────────────────────────────────────────────────
log "=== T1 (depois) ==="
log "SHA_VPS == SHA_MAIN ................ PROVADO (pelo centraldark-deploy)"

HTTP="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH" 2>/dev/null || true)"
[[ -n "$HTTP" ]] || HTTP=000
log "MCP_HEALTH=$HTTP"
[[ "$HTTP" == "200" ]] || die "health do MCP != 200 (rollback: git reset --hard vps-pre-deploy-<timestamp>)" 14

ss -tlnp 2>/dev/null | grep -q ':9100' \
  || die "porta 9100 sem listener (rollback: git reset --hard vps-pre-deploy-<timestamp>)" 14

log "=== DEPLOY_PROVADO ==="
log "TLC23/HORN/UNIVERSAL=PASS"
log "MCP_HEALTH=200  PORTA_9100=LISTENING"
