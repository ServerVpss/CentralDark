#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# CentralDark — deploy do repositório na VPS
#
# Escopo: levar /root/CentralDark ao SHA de origin/main e reiniciar os
# serviços declarados. NÃO substitui deploy-operational-guards.sh, que é
# estreito (só HermesVerificador + mapeamento). Este cobre o repo.
#
# Leis:
#   MERGED != DEPLOYED
#   AÇÃO != PROVA
#   UNKNOWN != PASS
#   DIRTY_WORKTREE != DESCARTAR
#   HOUSE_VPS_REMOTE_SAME_PROTOCOL
#   META_LUPA + CLAIM_SEALS acompanham a trajetória até o ponto fixo
#
# Uso:
#   bash centraldark-deploy.sh                    # dry-run (padrão)
#   bash centraldark-deploy.sh --apply            # executa + runtime declarado
#   bash centraldark-deploy.sh --apply --source-only # sincroniza fonte sem restart
#   bash centraldark-deploy.sh --apply --aceitar-divergencia
#   APPS="CentralDark-MCP CentralDark-Memoria" bash centraldark-deploy.sh --apply
#
# Saídas:
#   0 ok   10 repo inválido   11 fetch   12 chattr +i   13 divergência
#   14 health   15 SHA não bateu   16 proof guard   17 dirty worktree
#   63 lock   64 origin errado
# ══════════════════════════════════════════════════════════════════════
set -Eeuo pipefail

REPO_DIR="${REPO_DIR:-/root/CentralDark}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
APPS="${APPS:-CentralDark-MCP}"

APPLY=0
ACEITAR_DIVERGENCIA=0
SOURCE_ONLY=0
CANONICAL_CACHE=0
CANONICAL_CACHE_DIR="${CANONICAL_CACHE_DIR:-/var/lib/centraldark/canonical-main}"
for arg in "$@"; do
  case "$arg" in
    --apply)                APPLY=1 ;;
    --aceitar-divergencia)  ACEITAR_DIVERGENCIA=1 ;;
    --source-only)          SOURCE_ONLY=1 ;;
    --canonical-cache)      CANONICAL_CACHE=1 ;;
    *) echo "argumento desconhecido: $arg"; exit 2 ;;
  esac
done

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }

# Worktree suja não é lixo. Nada é resetado/limpo automaticamente.
listar_sujos() { git status --porcelain --untracked-files=all || true; }
contar_sujos() { listar_sujos | sed '/^$/d' | wc -l | tr -d ' '; }

proof_guard_paths_exist_on_ref() {
  local ref="$1"
  local required=(
    "scripts/lupa/validar_autolupa_hash.py"
    ".agents/skills/meta-lupa/SKILL.md"
    ".agents/skills/meta-lupa/guardrails/claim_seal.py"
    ".agents/skills/meta-lupa/references/claim-seals.jsonl"
    "docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json"
  )
  local path
  for path in "${required[@]}"; do
    git cat-file -e "${ref}:${path}" 2>/dev/null || {
      log "PROOF_LINK_MISSING ref=${ref} path=${path}"
      return 1
    }
  done
}

validate_proof_guards_live() {
  log "=== META_LUPA / CLAIM_SEAL ==="
  python3 scripts/lupa/validar_autolupa_hash.py || return 1
  python3 .agents/skills/meta-lupa/guardrails/claim_seal.py --self-test || return 1
  python3 .agents/skills/meta-lupa/guardrails/claim_seal.py validate \
    .agents/skills/meta-lupa/references/claim-seals.jsonl || return 1
  node apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs --self-test || return 1
  log "META_LUPA_AND_CLAIM_SEALS=PASS"
}

runtime_health() {
  local http
  http="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH" 2>/dev/null || true)"
  [[ -n "$http" ]] || http=000
  log "MCP_HEALTH=$http"
  [[ "$http" == "200" ]] || return 1
  ss -tlnp 2>/dev/null | grep -q ':9100' || return 1
  log "PORTA_9100=LISTENING"
}

source_only_fixed_point() {
  local final_head final_remote final_dirty
  final_head="$(git rev-parse HEAD)"
  final_remote="$(git rev-parse "origin/$BRANCH")"
  final_dirty="$(contar_sujos)"
  log "FINAL_HEAD=$final_head"
  log "FINAL_REMOTE=$final_remote"
  log "FINAL_DIRTY=$final_dirty"
  [[ "$final_head" == "$final_remote" && "$final_dirty" -eq 0 ]] || return 1
  validate_proof_guards_live || return 1
  log "SOURCE_SYNC_ONLY=PASS"
  log "RUNTIME_RESTART=NONE"
  log "PONTO_FIXO_SOURCE=PASS"
  log "SHA_VPS_EQ_SHA_MAIN=PROVADO"
}

# ─── Lock ─────────────────────────────────────────────────────────────
exec 9>/tmp/centraldark-repo-deploy.lock
flock -w 90 9 || die "outro deploy segurando a trava" 63

# ─── T0 ───────────────────────────────────────────────────────────────
log "=== T0 (antes) ==="
log "SURFACE=VPS"
log "PROTOCOL=BANDA_META_LUPA_CLAIM_SEAL_SYNC_V1"
log "SOURCE_ONLY=$SOURCE_ONLY"
[[ -d "$REPO_DIR/.git" ]] || die "REPO_DIR sem .git: $REPO_DIR" 10
cd "$REPO_DIR"

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || echo '')"
[[ "$ORIGIN_URL" =~ github\.com[:/]ServerVpss/CentralDark(\.git)?$ ]] \
  || die "origin não é ServerVpss/CentralDark: $ORIGIN_URL" 64

log "PING=origin/$BRANCH"
git fetch --prune origin "$BRANCH" --quiet || die "fetch de origin/$BRANCH falhou" 11

HEAD_ANTES="$(git rev-parse HEAD)"
ALVO="$(git rev-parse "origin/$BRANCH")"
ATRAS="$(git rev-list --count "HEAD..origin/$BRANCH")"
AFRENTE="$(git rev-list --count "origin/$BRANCH..HEAD")"
SUJOS="$(contar_sujos)"

log "HEAD_ANTES=$HEAD_ANTES"
log "ALVO=$ALVO"
log "ATRAS=$ATRAS AFRENTE=$AFRENTE WORKTREE_DIRTY=$SUJOS"

# Cache canônico limpo para consumidores de SOUL/skills/runtime. Ele é uma
# projeção descartável de origin/main e NÃO substitui o checkout operacional.
# Isso permite reancoragem mesmo quando /root/CentralDark contém estado vivo
# ainda não reconciliado. O fluxo reverso continua passando pelo writer
# canônico; nunca promovemos a árvore suja por rsync/reset cego.
if [[ "$CANONICAL_CACHE" -eq 1 ]]; then
  log "=== CANONICAL CACHE ==="
  if [[ "$APPLY" -eq 0 ]]; then
    log "DRY_RUN: atualizaria $CANONICAL_CACHE_DIR para $ALVO sem tocar $REPO_DIR"
    exit 0
  fi
  mkdir -p "$(dirname "$CANONICAL_CACHE_DIR")"
  if git worktree list --porcelain | grep -Fxq "worktree $CANONICAL_CACHE_DIR"; then
    git -C "$CANONICAL_CACHE_DIR" reset --hard "$ALVO" --quiet
    git -C "$CANONICAL_CACHE_DIR" clean -fdx --quiet
  else
    [[ ! -e "$CANONICAL_CACHE_DIR" ]] || die "cache existe mas não é worktree registrada: $CANONICAL_CACHE_DIR" 13
    git worktree add --detach "$CANONICAL_CACHE_DIR" "$ALVO" --quiet
  fi
  CACHE_HEAD="$(git -C "$CANONICAL_CACHE_DIR" rev-parse HEAD)"
  CACHE_DIRTY="$(git -C "$CANONICAL_CACHE_DIR" status --porcelain | wc -l | tr -d ' ')"
  [[ "$CACHE_HEAD" == "$ALVO" && "$CACHE_DIRTY" -eq 0 ]] || die "cache canônico não convergiu" 15
  proof_guard_paths_exist_on_ref "origin/$BRANCH" || die "origin/$BRANCH sem elos do compasso" 16
  (cd "$CANONICAL_CACHE_DIR" && validate_proof_guards_live) || die "proof guard falhou no cache canônico" 16
  log "CANONICAL_CACHE_HEAD=$CACHE_HEAD"
  log "CANONICAL_CACHE_DIRTY=$CACHE_DIRTY"
  log "OPERATIONAL_WORKTREE_MUTATED=false"
  log "CANONICAL_CACHE_SYNC=PASS"
  exit 0
fi

if [[ "$SUJOS" -gt 0 ]]; then
  log "BLOQUEADO_DIRTY_WORKTREE — nada será resetado/limpo automaticamente"
  listar_sujos | sed 's/^/  /'
  log "NEXT=RECONCILIAR_TRABALHO_LOCAL_COM_OWNER_CANONICO"
  die "DIRTY_WORKTREE" 17
fi

# O alvo remoto precisa conter o protocolo antes de qualquer reset.
proof_guard_paths_exist_on_ref "origin/$BRANCH" \
  || die "origin/$BRANCH não contém todos os elos do compasso" 16

# Se já está sincronizado, prova apenas o escopo pedido.
if [[ "$HEAD_ANTES" == "$ALVO" ]]; then
  if [[ "$SOURCE_ONLY" -eq 1 ]]; then
    source_only_fixed_point || die "source-only não atingiu ponto fixo" 16
    log "PONG=vps=$HEAD_ANTES remote=$ALVO dirty=0"
    log "DEPLOY_ACTION=NO_CHANGE_SOURCE_ONLY"
    exit 0
  fi
  validate_proof_guards_live || die "proof guard falhou em árvore já sincronizada" 16
  runtime_health || die "runtime health falhou apesar de source sincronizado" 14
  log "PONG=vps=$HEAD_ANTES remote=$ALVO dirty=0"
  log "PONTO_FIXO_SYNC=PASS"
  log "DEPLOY_ACTION=NO_CHANGE"
  exit 0
fi

# ─── Guarda: imutáveis, só entre arquivos RASTREADOS ──────────────────
log "=== guarda: imutáveis entre arquivos rastreados ==="
IMUTAVEIS="$(git ls-files -z \
  | xargs -0 -r lsattr -d 2>/dev/null \
  | awk '$1 ~ /^[-aAcCdDeEFijImNPsStTux]+$/ && $1 ~ /i/ { $1=""; sub(/^ +/,""); print }' \
  || true)"

if [[ -n "$IMUTAVEIS" ]]; then
  log "BLOQUEADO — arquivos rastreados com chattr +i:"
  while IFS= read -r f; do printf '  %s\n' "$f"; done <<< "$IMUTAVEIS"
  die "IMUTAVEL_BLOQUEIA_DEPLOY" 12
fi
log "nenhum rastreado imutável — ok"

# ─── Guarda: histórico divergente ─────────────────────────────────────
if [[ "$AFRENTE" -gt 0 && "$ACEITAR_DIVERGENCIA" -eq 0 ]]; then
  log "A VPS tem $AFRENTE commit(s) que origin/$BRANCH não tem."
  log "Eles NÃO serão apagados sem --aceitar-divergencia."
  log "NEXT=RECONCILIAR_OU_PROMOVER_COMMITS_LOCAIS"
  die "HISTORICO_DIVERGENTE" 13
fi

# ─── Dry-run ──────────────────────────────────────────────────────────
if [[ "$APPLY" -eq 0 ]]; then
  log "=== DRY-RUN — nada alterado. Use --apply para executar. ==="
  if [[ "$SOURCE_ONLY" -eq 1 ]]; then
    log "faria: âncora -> reset origin/$BRANCH -> proof guards -> SEM restart -> prova SHA/dirty"
  else
    log "faria: âncora -> reset origin/$BRANCH -> proof guards -> restart [$APPS] -> health -> PONG"
  fi
  exit 0
fi

# ─── Âncora de rollback ───────────────────────────────────────────────
ANCORA="vps-pre-deploy-$(date -u +%Y%m%d-%H%M%S)"
git tag -f "$ANCORA" HEAD >/dev/null
log "ANCORA=$ANCORA"

rollback() {
  log "ROLLBACK=$ANCORA"
  git reset --hard "$ANCORA" --quiet || true
}

# ─── Aplicar ──────────────────────────────────────────────────────────
log "=== aplicando ==="
git reset --hard "origin/$BRANCH" --quiet || die "reset para origin/$BRANCH falhou" 13

HEAD_DEPOIS="$(git rev-parse HEAD)"
[[ "$HEAD_DEPOIS" == "$ALVO" ]] || { rollback; die "HEAD não chegou no alvo ($HEAD_DEPOIS != $ALVO)" 15; }
[[ "$(contar_sujos)" -eq 0 ]] || { rollback; die "worktree ficou suja após sync" 17; }
log "HEAD_DEPOIS=$HEAD_DEPOIS == ALVO"

# MetaLupa/lacres são catraca antes de qualquer runtime.
validate_proof_guards_live || { rollback; die "META_LUPA/CLAIM_SEAL/GraphRAG falharam; rollback aplicado" 16; }

# Micro-deploy de fonte/policy: atualiza checkout, não reinicia serviço alheio.
if [[ "$SOURCE_ONLY" -eq 1 ]]; then
  source_only_fixed_point || { rollback; die "source-only final falhou; rollback aplicado" 16; }
  log "PONG=vps=$(git rev-parse HEAD) remote=$(git rev-parse "origin/$BRANCH") dirty=$(contar_sujos)"
  log "ANCORA_ROLLBACK=$ANCORA"
  log "=== MICRO_DEPLOY_SOURCE_PROVADO ==="
  exit 0
fi

# ─── Reiniciar serviços declarados ───────────────────────────────────
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
log "NAO_REINICIADOS=demais apps seguem com código antigo em memória"

# ─── T1 / contraprova ─────────────────────────────────────────────────
log "=== T1 (depois) ==="
FINAL_HEAD="$(git rev-parse HEAD)"
FINAL_REMOTE="$(git rev-parse "origin/$BRANCH")"
FINAL_DIRTY="$(contar_sujos)"
log "FINAL_HEAD=$FINAL_HEAD"
log "FINAL_REMOTE=$FINAL_REMOTE"
log "FINAL_DIRTY=$FINAL_DIRTY"
[[ "$FINAL_HEAD" == "$FINAL_REMOTE" && "$FINAL_DIRTY" -eq 0 ]] \
  || { rollback; die "sync não atingiu ponto fixo source" 15; }

runtime_health || { rollback; die "health do MCP/porta falhou; rollback aplicado" 14; }
validate_proof_guards_live || { rollback; die "proof guard final falhou; rollback aplicado" 16; }

log "PONG=vps=$FINAL_HEAD remote=$FINAL_REMOTE dirty=$FINAL_DIRTY"
log "PONTO_FIXO_SYNC=PASS"
log "SHA_VPS_EQ_SHA_MAIN=PROVADO"
log "META_LUPA_FINAL=PASS"
log "CLAIM_SEALS_FINAL=PASS"
log "ANCORA_ROLLBACK=$ANCORA"
log "=== DEPLOY_PROVADO_NO_ESCOPO_DECLARADO ==="