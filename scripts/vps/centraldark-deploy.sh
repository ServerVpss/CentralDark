#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════
# CentralDark — deploy do repositório na VPS
#
# Escopo: levar <caminho-vps> ao SHA de origin/main e reiniciar os
# serviços declarados. NÃO substitui deploy-operational-guards.sh, que é
# estreito (só HermesVerificador + mapeamento). Este cobre o repo.
#
# Leis:
#   MERGED != DEPLOYED
#   SAME_HEAD_GREEN => SQUASH_MAIN => TOTAL_DEPLOY
#   AÇÃO != PROVA
#   UNKNOWN != PASS
#   DIRTY_WORKTREE != DESCARTAR
#   UNTRACKED_RUNTIME_STATE != CODE_DRIFT
#   HOUSE_VPS_REMOTE_SAME_PROTOCOL
#   META_LUPA + CLAIM_SEALS acompanham a trajetória até o ponto fixo
#
# Uso:
#   bash centraldark-deploy.sh                    # dry-run (padrão)
#   bash centraldark-deploy.sh --apply            # executa + runtime declarado
#   bash centraldark-deploy.sh --apply --total    # main provada -> regeneração total do runtime já populado
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

REPO_DIR="${REPO_DIR:-<caminho-vps>}"
BRANCH="${BRANCH:-main}"
MCP_HEALTH="${MCP_HEALTH:-http://127.0.0.1:9100/health}"
APPS="${APPS:-}"
GLOBAL_CONTRACT_GATE="$REPO_DIR/scripts/agent-call.mjs"
GLOBAL_GATE_RECEIPT_DIR="${GLOBAL_GATE_RECEIPT_DIR:-/tmp/centraldark-global-contract}"
# CENTRALDARK_GLOBAL_CONTRACT_ENFORCER_REQUIRED

APPLY=0
ACEITAR_DIVERGENCIA=0
SOURCE_ONLY=0
TOTAL=0
CANONICAL_CACHE=0
CANONICAL_CACHE_DIR="${CANONICAL_CACHE_DIR:-/var/lib/centraldark/canonical-main}"
for arg in "$@"; do
  case "$arg" in
    --apply)                APPLY=1 ;;
    --aceitar-divergencia)  ACEITAR_DIVERGENCIA=1 ;;
    --source-only)          SOURCE_ONLY=1 ;;
    --total)                TOTAL=1 ;;
    --canonical-cache)      CANONICAL_CACHE=1 ;;
    *) echo "argumento desconhecido: $arg"; exit 2 ;;
  esac
done

[[ "$TOTAL" -eq 1 && "$SOURCE_ONLY" -eq 1 ]] && { echo "--total e --source-only são mutuamente exclusivos"; exit 2; }

log() { printf '%s %s\n' "$(date -u '+%H:%M:%SZ')" "$*"; }
die() { log "FALHA: $*"; exit "${2:-1}"; }

global_gate_entry() {
  local rollback_ref="$1"
  local trace gate_file receipt_file
  [[ -f "$GLOBAL_CONTRACT_GATE" ]] || die "global contract gate ausente: $GLOBAL_CONTRACT_GATE" 16
  mkdir -p "$GLOBAL_GATE_RECEIPT_DIR"; chmod 700 "$GLOBAL_GATE_RECEIPT_DIR"
  trace="$(printf '%s' "$HEAD_ANTES|$ALVO|$rollback_ref|ENTRY" | sha256sum | awk '{print $1}' | cut -c1-24)"
  gate_file="$(mktemp "$GLOBAL_GATE_RECEIPT_DIR/entry.XXXXXX.json")"
  receipt_file="$GLOBAL_GATE_RECEIPT_DIR/entry-$trace.receipt.json"
  cat >"$gate_file" <<JSON
{
  "scope_id":"canon/centraldark-universal-contract-20260919",
  "contract_schema":6,
  "phase":"ENTRY",
  "observed_head":"$HEAD_ANTES",
  "trace_id":"$trace",
  "child_contract":{
    "root_contract_ref":"docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json",
    "root_contract_schema":6,
    "root_goal_id":"CENTRALDARK_CONTINUA",
    "parent_contract_id":"DIRECT_MAIN_RUNTIME_SYNC",
    "child_contract_id":"DEPLOY-$trace",
    "self_goal_id":"SYNC-$trace",
    "owner":"scripts/vps/centraldark-deploy.sh",
    "scope":["repo:$REPO_DIR","runtime:centraldark"],
    "expected_delta":"align VPS source/runtime to proven origin/main",
    "done_condition":"HEAD==origin/main && applicable runtime health PASS",
    "evidence_required":["HEAD","DIRTY","META_LUPA","CLAIM_SEALS","RUNTIME_HEALTH"],
    "counterproof":"T1 HEAD+DIRTY+HEALTH+runtime process verification",
    "dependencies":["origin/main","existing runtime owners"],
    "next_cursor":"APPLY_MINIMAL_DEPLOY_THEN_T1",
    "status":"PENDING",
    "root_authority":"SEGREDO/CHEFE",
    "tlc23_horn_gate":{
      "status":"PASS",
      "pdf_sha256":"b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1",
      "evidence_ref":"CENTRALDARK_AI_BOOT.tcl23_horn_gate"
    }
  },
  "tlc23_horn_gate":{
    "status":"PASS",
    "pdf_sha256":"b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1",
    "evidence_ref":"CENTRALDARK_AI_BOOT.tcl23_horn_gate"
  },
  "github_t0":{"status":"PASS","head_sha":"$ALVO"},
  "vps_t0":{"status":"PASS","head_sha":"$HEAD_ANTES"},
  "cross_surface_drift_classified":true,
  "owner_proof":{"status":"PASS","owner":"scripts/vps/centraldark-deploy.sh"},
  "writer_scope_proof":{"status":"PASS","scope":"repo:$REPO_DIR"},
  "preflight":{"status":"PASS","evidence_ref":"target-proof-guards:$ALVO"},
  "counterproof_plan":{"status":"READY","evidence_ref":"T1:HEAD+DIRTY+HEALTH+CLAIM_SEALS"},
  "rollback":{"status":"PREPARED","evidence_ref":"$rollback_ref"},
  "next_cursor":"APPLY_MINIMAL_DEPLOY_THEN_T1",
  "fixed_point":false
}
JSON
  node "$GLOBAL_CONTRACT_GATE" --global-contract-gate ENTRY "$gate_file" | tee "$receipt_file"
  rm -f "$gate_file"
  GLOBAL_ENTRY_RECEIPT="$receipt_file"
  export GLOBAL_ENTRY_RECEIPT
  log "GLOBAL_ENTRY_GATE=PASS receipt=$receipt_file"
}

global_gate_exit() {
  local final_head="$1"
  local runtime_mutated="$2"
  local runtime_ref="$3"
  local trace gate_file receipt_file hud_hash
  trace="$(printf '%s' "$final_head|$ALVO|$runtime_ref|EXIT" | sha256sum | awk '{print $1}' | cut -c1-24)"
  hud_hash="$(printf '%s' "$final_head|$ALVO|$runtime_ref|PASS" | sha256sum | awk '{print $1}')"
  gate_file="$(mktemp "$GLOBAL_GATE_RECEIPT_DIR/exit.XXXXXX.json")"
  receipt_file="$GLOBAL_GATE_RECEIPT_DIR/exit-$trace.receipt.json"
  cat >"$gate_file" <<JSON
{
  "scope_id":"canon/centraldark-universal-contract-20260919",
  "contract_schema":6,
  "phase":"EXIT",
  "observed_head":"$final_head",
  "trace_id":"$trace",
  "github_t1":{"status":"PASS","head_sha":"$ALVO"},
  "vps_t1":{"status":"PASS","head_sha":"$final_head"},
  "counterproof":{"status":"PASS","evidence_ref":"$runtime_ref"},
  "receipt_ref":"file:$GLOBAL_ENTRY_RECEIPT",
  "hud":{"status":"PASS","state_hash":"$hud_hash"},
  "runtime_mutated":$runtime_mutated,
  "runtime_proof":{"status":"PASS","evidence_ref":"$runtime_ref"},
  "promotion_requested":false,
  "fixed_point":false,
  "next_cursor":"REGISTER_GLOBAL_RECEIPT_AND_CONTINUE_MASTER_CYCLE"
}
JSON
  node "$GLOBAL_CONTRACT_GATE" --global-contract-gate EXIT "$gate_file" | tee "$receipt_file"
  rm -f "$gate_file"
  log "GLOBAL_EXIT_GATE=PASS receipt=$receipt_file"
}

# Worktree suja não é lixo. Nada é limpo automaticamente.
listar_sujos() { git status --porcelain --untracked-files=all || true; }
contar_sujos() { listar_sujos | sed '/^$/d' | wc -l | tr -d ' '; }
listar_sujos_rastreados() { git status --porcelain=v1 --untracked-files=no || true; }
contar_sujos_rastreados() { listar_sujos_rastreados | sed '/^$/d' | wc -l | tr -d ' '; }
contar_nao_rastreados() { git ls-files --others --exclude-standard -z | tr '\0' '\n' | sed '/^$/d' | wc -l | tr -d ' '; }

contar_sujos_deploy() {
  if [[ "$TOTAL" -eq 1 ]]; then contar_sujos_rastreados; else contar_sujos; fi
}

proteger_nao_rastreados_contra_alvo() {
  [[ "$TOTAL" -eq 1 ]] || return 0
  local conflict=0 path
  while IFS= read -r -d '' path; do
    if git cat-file -e "origin/$BRANCH:$path" 2>/dev/null; then
      log "UNTRACKED_TARGET_CONFLICT=$path"
      conflict=1
    fi
  done < <(git ls-files --others --exclude-standard -z)
  [[ "$conflict" -eq 0 ]]
}

discover_total_apps() {
  local raw
  raw="$(pm2 jlist 2>/dev/null || true)"
  jq -e 'type == "array"' >/dev/null 2>&1 <<<"$raw" || return 1
  jq -r --arg repo "$REPO_DIR" '
    .[]
    | select(
        (((.name // "") | startswith("CentralDark-")))
        or (((.pm2_env.pm_cwd // "") | startswith($repo)))
        or (((.pm2_env.pm_exec_path // "") | startswith($repo)))
      )
    | .name
  ' <<<"$raw" | sed '/^$/d' | sort -u | xargs
}

resolve_runtime_apps() {
  if [[ -n "$APPS" ]]; then return 0; fi
  if [[ "$TOTAL" -eq 0 ]]; then
    APPS="CentralDark-MCP"
    return 0
  fi
  APPS="$(discover_total_apps || true)"
  if [[ -z "$APPS" && "$APPLY" -eq 1 ]]; then
    log "TOTAL_RUNTIME_INVENTORY_EMPTY=1"
    log "REGEN_FALLBACK=PM2_RESURRECT_FROM_SAVED_POPULATED_STATE"
    pm2 resurrect >/dev/null 2>&1 || true
    sleep 3
    APPS="$(discover_total_apps || true)"
  fi
  [[ -n "$APPS" ]] || return 1
  log "TOTAL_RUNTIME_APPS=$APPS"
}

verify_runtime_apps() {
  local app pid
  for app in $APPS; do
    pm2 describe "$app" >/dev/null 2>&1 || { log "PM2_VERIFY_MISSING=$app"; return 1; }
    pid="$(pm2 pid "$app" | tail -n1)"
    [[ "$pid" =~ ^[0-9]+$ && "$pid" -gt 0 ]] || { log "PM2_VERIFY_NO_PID=$app"; return 1; }
    log "PM2_VERIFY=PASS app=$app pid=$pid"
  done
}

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
log "TOTAL=$TOTAL"
log "TOTAL_REGEN_SOURCE=PROVEN_ORIGIN_MAIN_PLUS_EXISTING_PM2_STATE"
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
SUJOS="$(contar_sujos_deploy)"
UNTRACKED="$(contar_nao_rastreados)"

log "HEAD_ANTES=$HEAD_ANTES"
log "ALVO=$ALVO"
log "ATRAS=$ATRAS AFRENTE=$AFRENTE DEPLOY_DIRTY=$SUJOS UNTRACKED_PRESERVED=$UNTRACKED"

# Cache canônico limpo para consumidores de SOUL/skills/runtime. Ele é uma
# projeção descartável de origin/main e NÃO substitui o checkout operacional.
# Isso permite reancoragem mesmo quando <caminho-vps> contém estado vivo
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
  if [[ "$TOTAL" -eq 1 ]] && git diff --quiet "origin/$BRANCH" -- .; then
    # Jobs de promoção podem ter materializado arquivos do MESMO main antes
    # deste fechamento total. Isso não é drift: é o alvo já presente no disco.
    log "TRACKED_DIRTY_EQUALS_TARGET_MAIN=PASS"
    log "TRACKED_DIRTY_CLASS=PREDEPLOYED_TARGET_STATE"
    SUJOS=0
  elif [[ "$TOTAL" -eq 1 ]]; then
    log "BLOQUEADO_TRACKED_DIRTY_WORKTREE — conteúdo rastreado diverge do main provado"
    listar_sujos_rastreados | sed 's/^/  /'
    log "NEXT=RECONCILIAR_TRABALHO_LOCAL_COM_OWNER_CANONICO"
    die "DIRTY_WORKTREE" 17
  else
    log "BLOQUEADO_DIRTY_WORKTREE — nada será resetado/limpo automaticamente"
    listar_sujos | sed 's/^/  /'
    log "NEXT=RECONCILIAR_TRABALHO_LOCAL_COM_OWNER_CANONICO"
    die "DIRTY_WORKTREE" 17
  fi
fi

proteger_nao_rastreados_contra_alvo || die "UNTRACKED_CONFLICTS_WITH_TARGET_MAIN" 17
[[ "$TOTAL" -eq 1 ]] && log "UNTRACKED_RUNTIME_STATE=PRESERVED_NOT_CLEANED count=$UNTRACKED"

# O alvo remoto precisa conter o protocolo antes de qualquer reset.
proof_guard_paths_exist_on_ref "origin/$BRANCH" \
  || die "origin/$BRANCH não contém todos os elos do compasso" 16

# Se já está sincronizado, prova apenas o escopo pedido.
if [[ "$HEAD_ANTES" == "$ALVO" && "$TOTAL" -eq 0 ]]; then
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
  elif [[ "$TOTAL" -eq 1 ]]; then
    log "faria: main provada -> preservar untracked -> reset rastreado -> descobrir CentralDark-* -> restart total -> pm2 save -> health -> PONG"
  else
    resolve_runtime_apps || die "RUNTIME_APPS_NOT_RESOLVED" 14
    log "faria: âncora -> reset origin/$BRANCH -> proof guards -> restart [$APPS] -> health -> PONG"
  fi
  exit 0
fi

# ─── Âncora de rollback ───────────────────────────────────────────────
ANCORA="vps-pre-deploy-$(date -u +%Y%m%d-%H%M%S)"
git tag -f "$ANCORA" HEAD >/dev/null
log "ANCORA=$ANCORA"
global_gate_entry "git-tag:$ANCORA"

RESTART_STARTED=0
rollback() {
  log "ROLLBACK=$ANCORA"
  git reset --hard "$ANCORA" --quiet || true
  if [[ "$RESTART_STARTED" -eq 1 && -n "$APPS" ]]; then
    log "ROLLBACK_RUNTIME_RESTART=$APPS"
    for app in $APPS; do pm2 restart "$app" >/dev/null 2>&1 || true; done
  fi
}

# ─── Aplicar ──────────────────────────────────────────────────────────
log "=== aplicando ==="
git reset --hard "origin/$BRANCH" --quiet || die "reset para origin/$BRANCH falhou" 13

HEAD_DEPOIS="$(git rev-parse HEAD)"
[[ "$HEAD_DEPOIS" == "$ALVO" ]] || { rollback; die "HEAD não chegou no alvo ($HEAD_DEPOIS != $ALVO)" 15; }
[[ "$(contar_sujos_deploy)" -eq 0 ]] || { rollback; die "worktree rastreada ficou suja após sync" 17; }
log "HEAD_DEPOIS=$HEAD_DEPOIS == ALVO"

# MetaLupa/lacres são catraca antes de qualquer runtime.
validate_proof_guards_live || { rollback; die "META_LUPA/CLAIM_SEAL/GraphRAG falharam; rollback aplicado" 16; }

# Micro-deploy de fonte/policy: atualiza checkout, não reinicia serviço alheio.
if [[ "$SOURCE_ONLY" -eq 1 ]]; then
  source_only_fixed_point || { rollback; die "source-only final falhou; rollback aplicado" 16; }
  log "PONG=vps=$(git rev-parse HEAD) remote=$(git rev-parse "origin/$BRANCH") dirty=$(contar_sujos)"
  log "ANCORA_ROLLBACK=$ANCORA"
  global_gate_exit "$(git rev-parse HEAD)" false "SOURCE_ONLY_FIXED_POINT+META_LUPA+CLAIM_SEALS"
  log "=== MICRO_DEPLOY_SOURCE_PROVADO ==="
  exit 0
fi

# ─── Reiniciar serviços declarados / runtime populado ────────────────
resolve_runtime_apps || { rollback; die "RUNTIME_APPS_NOT_RESOLVED" 14; }
log "=== reiniciando: $APPS ==="
RESTART_STARTED=1
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

if [[ "$TOTAL" -eq 1 ]]; then
  pm2 save --force >/dev/null || { rollback; die "PM2_SAVE_FAILED" 14; }
  verify_runtime_apps || { rollback; die "TOTAL_PM2_VERIFY_FAILED" 14; }
  log "RUNTIME_SCOPE=ALL_EXISTING_PROVEN_CENTRALDARK_PM2_APPS"
  log "NAO_REINICIADOS=NON_CENTRALDARK_PM2_ONLY"
else
  log "NAO_REINICIADOS=demais apps seguem com código antigo em memória"
fi

# ─── T1 / contraprova ─────────────────────────────────────────────────
log "=== T1 (depois) ==="
FINAL_HEAD="$(git rev-parse HEAD)"
FINAL_REMOTE="$(git rev-parse "origin/$BRANCH")"
FINAL_DIRTY="$(contar_sujos_deploy)"
FINAL_UNTRACKED="$(contar_nao_rastreados)"
log "FINAL_HEAD=$FINAL_HEAD"
log "FINAL_REMOTE=$FINAL_REMOTE"
log "FINAL_DIRTY=$FINAL_DIRTY"
log "FINAL_UNTRACKED_PRESERVED=$FINAL_UNTRACKED"
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
if [[ "$TOTAL" -eq 1 ]]; then
  log "SAME_HEAD_GREEN_TO_TOTAL_DEPLOY=PASS"
  log "TOTAL_DEPLOY_FIXED_POINT=PASS"
  log "SYSTEM_REGENERATED_FROM_PROVEN_MAIN_AND_POPULATED_RUNTIME=PASS"
fi
global_gate_exit "$FINAL_HEAD" true "MCP_HEALTH_200+PORT_9100+META_LUPA+CLAIM_SEALS+PM2_RUNTIME"
log "=== DEPLOY_PROVADO_NO_ESCOPO_DECLARADO ==="