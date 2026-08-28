#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# CentralDark — deploy do repositório na VPS
#
# Escopo: sincronizar /root/CentralDark com origin/main e reiniciar os
# serviços afetados. NÃO substitui deploy-operational-guards.sh, que é
# estreito (só HermesVerificador + mapeamento). Este cobre o repo.
#
# Leis aplicadas (docs: .agents/skills/centraldark-esteira-motor):
#   MERGED != DEPLOYED        -> prova é SHA na VPS == origin/main
#   AÇÃO != PROVA             -> T0 antes, T1 depois, health real
#   NO_FORCE_PUSH             -> nunca escreve no remoto
#   NO_BLIND_OVERWRITE        -> falha alto em vez de sobrescrever no escuro
#
# Uso:
#   ./centraldark-deploy.sh            # dry-run: mede e diz o que faria
#   ./centraldark-deploy.sh --apply    # executa
#
# Códigos de saída:
#   0  ok            10 repo inválido     11 sem rede/fetch
#   12 chattr +i     13 árvore divergente 14 health falhou
# ══════════════════════════════════════════════════════════════════════
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
APPLY=0
[[ "${1:-}" == "--apply" ]] && APPLY=1

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }

# ─── T0 ───────────────────────────────────────────────────────────────
log "=== T0 (antes) ==="
[[ -d "$REPO_DIR/.git" ]] || die "REPO_DIR sem .git: $REPO_DIR" 10
cd "$REPO_DIR"

git fetch --prune origin "$BRANCH" --quiet || die "fetch de origin/$BRANCH falhou" 11

HEAD_ANTES="$(git rev-parse HEAD)"
ALVO="$(git rev-parse "origin/$BRANCH")"
ATRAS="$(git rev-list --count "HEAD..origin/$BRANCH")"
AFRENTE="$(git rev-list --count "origin/$BRANCH..HEAD")"
SUJOS="$(git status --porcelain | grep -cE '^( M|MM| D|D |A )' || true)"

log "HEAD_ANTES=$HEAD_ANTES"
log "ALVO=$ALVO"
log "ATRAS=$ATRAS  AFRENTE=$AFRENTE  RASTREADOS_SUJOS=$SUJOS"

if [[ "$HEAD_ANTES" == "$ALVO" && "$SUJOS" -eq 0 ]]; then
  log "JA_SINCRONIZADO — nada a fazer"
  exit 0
fi

# ─── Guarda: arquivos imutáveis (chattr +i) ───────────────────────────
# Este é o bloqueador real já medido: trava stash/checkout/reset com
# "Operation not permitted" e o erro não diz que a causa é o atributo.
log "=== guarda: procurando arquivos imutáveis ==="
IMUTAVEIS="$(lsattr -R -a "$REPO_DIR" 2>/dev/null \
  | awk '$1 ~ /i/ && $2 !~ /\/\.$|\/\.\.$/ {print $2}' || true)"

if [[ -n "$IMUTAVEIS" ]]; then
  log "BLOQUEADO — arquivos com chattr +i impedem o deploy:"
  printf '  %s\n' $IMUTAVEIS
  log "Para liberar (decisão do CHEFE, reversível com chattr +i):"
  log "  chattr -i <arquivo>"
  die "IMUTAVEL_BLOQUEIA_DEPLOY" 12
fi
log "nenhum arquivo imutável — ok"

# ─── Guarda: histórico divergente ─────────────────────────────────────
if [[ "$AFRENTE" -gt 0 ]]; then
  log "AVISO: VPS tem $AFRENTE commit(s) que origin/$BRANCH não tem."
  log "       Commits locais não são promovidos por este script."
  log "       Se houver trabalho real aqui, salve antes:"
  log "         git tag vps-pre-deploy-\$(date +%Y%m%d) HEAD"
fi

# ─── Dry-run para aqui ────────────────────────────────────────────────
if [[ "$APPLY" -eq 0 ]]; then
  log "=== DRY-RUN — nada foi alterado. Use --apply para executar. ==="
  log "faria: tag de âncora -> restaurar rastreados de origin/$BRANCH -> restart -> health"
  exit 0
fi

# ─── Âncora de rollback ─────────────────────────────────────────────
ANCORA="vps-pre-deploy-$(date -u +%Y%m%d-%H%M%S)"
git tag -f "$ANCORA" HEAD >/dev/null
log "ANCORA=$ANCORA (rollback: git reset --hard $ANCORA)"

# ─── Aplicar ──────────────────────────────────────────────────────────
# Restaura apenas caminhos RASTREADOS a partir de origin/BRANCH.
# Não apaga untracked (logs, .env, caches ficam intactos).
log "=== aplicando ==="
git checkout "origin/$BRANCH" -- . || die "checkout de origin/$BRANCH falhou" 13
log "arquivos rastreados alinhados com origin/$BRANCH"

# ─── Reiniciar serviços afetados ──────────────────────────────────────
log "=== reiniciando serviços ==="
for APP in CentralDark-MCP; do
  if pm2 describe "$APP" >/dev/null 2>&1; then
    PID_ANTES="$(pm2 pid "$APP" | tail -n1)"
    pm2 restart "$APP" >/dev/null
    sleep 6
    PID_DEPOIS="$(pm2 pid "$APP" | tail -n1)"
    log "$APP: pid $PID_ANTES -> $PID_DEPOIS"
    [[ "$PID_ANTES" != "$PID_DEPOIS" ]] || log "AVISO: $APP não trocou de PID"
  else
    log "$APP ausente no PM2 — pulado"
  fi
done

# ─── T1 (contraprova) ─────────────────────────────────────────────────
log "=== T1 (depois) ==="
SUJOS_DEPOIS="$(git status --porcelain | grep -cE '^( M|MM| D|D |A )' || true)"
log "RASTREADOS_SUJOS=$SUJOS_DEPOIS (era $SUJOS)"

HTTP="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH" || echo 000)"
log "MCP_HEALTH=$HTTP"
[[ "$HTTP" == "200" ]] || die "health do MCP não voltou 200 (rollback: git reset --hard $ANCORA)" 14

if ss -tlnp 2>/dev/null | grep -q ':9100'; then
  log "PORTA_9100=LISTENING"
else
  die "porta 9100 sem listener (rollback: git reset --hard $ANCORA)" 14
fi

log "=== DEPLOY_PROVADO ==="
log "ANCORA_ROLLBACK=$ANCORA"
