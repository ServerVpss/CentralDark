#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# CentralDark — deploy do repositório na VPS
#
# Escopo: levar /root/CentralDark ao SHA de origin/main e reiniciar os
# serviços declarados. NÃO substitui deploy-operational-guards.sh, que é
# estreito (só HermesVerificador + mapeamento). Este cobre o repo.
#
# Leis aplicadas (.agents/skills/centraldark-esteira-motor):
#   MERGED != DEPLOYED   -> prova é HEAD da VPS == origin/main, medido em T1
#   AÇÃO != PROVA        -> T0 antes, T1 depois, health real
#   NO_FORCE_PUSH        -> nunca escreve no remoto
#   NO_BLIND_OVERWRITE   -> histórico divergente exige flag explícita
#
# Uso:
#   bash centraldark-deploy.sh                    # dry-run (padrão)
#   bash centraldark-deploy.sh --apply            # executa
#   bash centraldark-deploy.sh --apply --aceitar-divergencia
#   APPS="CentralDark-MCP CentralDark-Memoria" bash centraldark-deploy.sh --apply
#
# Saídas:
#   0 ok   10 repo inválido   11 fetch   12 chattr +i   13 divergência
#   14 health   15 SHA não bateu   63 lock   64 origin errado
# ══════════════════════════════════════════════════════════════════════
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
# Só os serviços que este deploy promete reiniciar. O script NÃO reinicia
# tudo: os demais seguem com o código antigo em memória até quem os
# governa promovê-los. Ajuste via APPS="a b c".
APPS="${APPS:-CentralDark-MCP}"

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

# Conta caminhos RASTREADOS divergentes do índice/HEAD, incluindo
# modificação já staged ("M ") — que é exatamente o estado que um hotfix
# manual na VPS produz.
contar_sujos() { git status --porcelain | grep -cE '^([MARCD ][MARCD]|[MARCD] )' || true; }

# ─── Lock (mesma trava do script irmão para não pisar na mesma árvore) ─
exec 9>/tmp/centraldark-repo-deploy.lock
flock -w 90 9 || die "outro deploy segurando a trava" 63

# ─── T0 ───────────────────────────────────────────────────────────────
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

if [[ "$HEAD_ANTES" == "$ALVO" && "$SUJOS" -eq 0 ]]; then
  log "JA_SINCRONIZADO — nada a fazer"
  exit 0
fi

# ─── Guarda: imutáveis, só entre arquivos RASTREADOS ──────────────────
# chattr +i trava reset/checkout com "Operation not permitted" sem dizer
# a causa. Escopo limitado ao que o deploy realmente reescreve — um
# `chattr +i .env` não deve bloquear deploy nenhum.
log "=== guarda: imutáveis entre arquivos rastreados ==="
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
log "nenhum rastreado imutável — ok"

# ─── Guarda: histórico divergente ─────────────────────────────────────
if [[ "$AFRENTE" -gt 0 && "$ACEITAR_DIVERGENCIA" -eq 0 ]]; then
  log "A VPS tem $AFRENTE commit(s) que origin/$BRANCH não tem."
  log "Eles NÃO são promovidos por este script e sairão do HEAD."
  log "Ficam recuperáveis pela tag âncora criada abaixo."
  log "Para prosseguir mesmo assim: --aceitar-divergencia"
  die "HISTORICO_DIVERGENTE" 13
fi

# ─── Dry-run para aqui ────────────────────────────────────────────────
if [[ "$APPLY" -eq 0 ]]; then
  log "=== DRY-RUN — nada alterado. Use --apply para executar. ==="
  log "faria: tag âncora -> reset --hard origin/$BRANCH -> restart [$APPS] -> health"
  exit 0
fi

# ─── Âncora de rollback ───────────────────────────────────────────────
ANCORA="vps-pre-deploy-$(date -u +%Y%m%d-%H%M%S)"
git tag -f "$ANCORA" HEAD >/dev/null
log "ANCORA=$ANCORA  (rollback: git reset --hard $ANCORA)"

# ─── Aplicar ──────────────────────────────────────────────────────────
# reset --hard move o HEAD de verdade e remove arquivos apagados upstream.
# Untracked (.env, logs, caches) NÃO é tocado — não usamos git clean.
log "=== aplicando ==="
git reset --hard "origin/$BRANCH" --quiet || die "reset para origin/$BRANCH falhou" 13

HEAD_DEPOIS="$(git rev-parse HEAD)"
[[ "$HEAD_DEPOIS" == "$ALVO" ]] || die "HEAD não chegou no alvo ($HEAD_DEPOIS != $ALVO)" 15
log "HEAD_DEPOIS=$HEAD_DEPOIS  == ALVO ✓"

# ─── Reiniciar os serviços declarados ─────────────────────────────────
log "=== reiniciando: $APPS ==="
for APP in $APPS; do
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
log "NAO_REINICIADOS: demais apps seguem com código antigo em memória"

# ─── T1 (contraprova) ─────────────────────────────────────────────────
log "=== T1 (depois) ==="
log "RASTREADOS_SUJOS=$(contar_sujos)  (era $SUJOS)"
log "SHA_VPS == SHA_MAIN ................ PROVADO"

HTTP="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH" 2>/dev/null || true)"
[[ -n "$HTTP" ]] || HTTP=000
log "MCP_HEALTH=$HTTP"
[[ "$HTTP" == "200" ]] || die "health do MCP != 200 (rollback: git reset --hard $ANCORA)" 14

ss -tlnp 2>/dev/null | grep -q ':9100' \
  || die "porta 9100 sem listener (rollback: git reset --hard $ANCORA)" 14
log "PORTA_9100=LISTENING"

log "=== DEPLOY_PROVADO ==="
log "ANCORA_ROLLBACK=$ANCORA"
