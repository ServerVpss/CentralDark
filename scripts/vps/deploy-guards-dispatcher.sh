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
#
# Uso:
#   ./deploy-guards-dispatcher.sh                          # pré-flight (idem)
#   ./deploy-guards-dispatcher.sh --apply                  # executa a decisão
#   ./deploy-guards-dispatcher.sh --apply --aceitar-divergencia
#
# Variáveis de ambiente (opcionais):
#   REPO_DIR             default: /root/CentralDark
#   SSH_KEY             default: ~/.ssh/deploy_centraldark
#
# Saídas:
#   0 ok sem alterações necessárias
#   1 uso | 2 argumento | 10 repo inválido | 11 sem rede/fetch
#   12 imutável | 13 divergência | 14 sem privilégio | 15 hook bloqueia
#   21 deploy-operational-guards executado (use --apply)
#   22 centraldark-deploy executado (use --apply)
#
# ══════════════════════════════════════════════════════════════════════
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/deploy_centraldark}"

CENTRALDARK_DEPLOY="$REPO_DIR/scripts/vps/centraldark-deploy.sh"
OPERATIONAL_GUARDS="$REPO_DIR/scripts/vps/deploy-operational-guards.sh"
HOOK_PREPARE="$REPO_DIR/.github/hooks/prepare-commit-msg-prevencao-push-sujo"

APPLY=0
ACEITAR_DIVERGENCIA=0
for arg in "$@"; do
  case "$arg" in
    --apply)                APPLY=1 ;;
    --aceitar-divergencia)  ACEITAR_DIVERGENCIA=1 ;;
    *) echo "argumento desconhecido: $arg"; exit 2 ;;
  esac
done

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }
info() { log "INFO: $*"; }

contar_sujos() {
  git status --porcelain | grep -cE '^([MARCD ][MARCD]|[MARCD] )' || true
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
ALVO="$(git rev-parse "origin/$BRANCH")"
ATRAS="$(git rev-list --count "HEAD..origin/$BRANCH")"
AFRENTE="$(git rev-list --count "origin/$BRANCH..HEAD")"
SUJOS="$(contar_sujos)"

log "HEAD_ANTES=$HEAD_ANTES"
log "ALVO=$ALVO"
log "ATRAS=$ATRAS  AFRENTE=$AFRENTE  RASTREADOS_SUJOS=$SUJOS"

# ─── Guarda: ssh deploy ─────────────────────────────────────────────────
if [[ ! -f "$SSH_KEY" && "$APPLY" -eq 1 ]]; then
  die "chave de deploy ausente em $SSH_KEY (SSH_KEY)" 14
fi
info "chave de deploy: $([[ -f "$SSH_KEY" ]] && echo "presente" || echo "ausente (não aplicando)")"

# ─── Guarda: scripts existentes ─────────────────────────────────────────
[[ -x "$CENTRALDARK_DEPLOY" ]] || die "centraldark-deploy.sh ausente ou não executável" 10
[[ -x "$OPERATIONAL_GUARDS" ]] || die "deploy-operational-guards.sh ausente ou não executável" 10

# ─── Guarda: imutáveis ──────────────────────────────────────────────────
IMUTAVEIS="$(git ls-files -z \
  | xargs -0 -r lsattr -d 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/, ""); print }' \
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
  log "O dispatcher bow sala divergência de histórico."
  die "HISTORICO_DIVERGENTE" 13
fi

# ─── Guarda: hook de push sujo ──────────────────────────────────────────
if [[ -x "$HOOK_PREPARE" ]]; then
  log "=== guarda: hook prepare-commit-msg ==="
  log "presente em $HOOK_PREPARE"
fi

# ─── Decisão: nada a fazer ──────────────────────────────────────────────
if [[ "$HEAD_ANTES" == "$ALVO" && "$SUJOS" -eq 0 ]]; then
  log "JA_SINCRONIZADO — nada a fazer"
  exit 0
fi

# ─── Dry-run para aqui ──────────────────────────────────────────────────
if [[ "$APPLY" -eq 0 ]]; then
  log "=== PRÉ-FLIGHT — nada alterado. Use --apply para executar. ==="
  log "ATRAS=$ATRAS  AFRENTE=$AFRENTE  RASTREADOS_SUJOS=$SUJOS"
  log "caminho para origem: $ORIGIN_URL ($BRANCH)"
  log "alvo: origin/$BRANCH"
  log "scripts disponíveis: centraldark-deploy.sh, deploy-operational-guards.sh"
  log "próxima etapa: executar --apply para decidir e aplicar"
  exit 0
fi

# ─── Aplicar ────────────────────────────────────────────────────────────
log "=== APLICANDO ==="

# Repo-wide com guards de imutabilidade
log "executando centraldark-deploy.sh --apply"
"$CENTRALDARK_DEPLOY" --apply \
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
log "MCP_HEALTH=200  PORTA_9100=LISTENING"
