#!/usr/bin/env bash
# lovable-sync-fallback.sh — Quando o sync Lovable↔GitHub falha, este script
# empurra as mudanças usando, em ordem:
#   [A] PAT pessoal via API do GitHub
#   [B] SSH na VPS + git push
#   [C] (futuro) MCP CentralDark
#
# Por padrão abre PR. FALLBACK_DIRECT_MAIN=true permite push direto.
#
# Uso:
#   GITHUB_TOKEN=... bash lovable-sync-fallback.sh [diretorio_repo]
#
# Variáveis:
#   FALLBACK_DIRECT_MAIN  (false)   true = push direto na main
#   FALLBACK_DRY_RUN      (false)   true = faz tudo menos abrir PR/push
#   FALLBACK_MAX_FILES    (50)      corta se divergência > N
#   FALLBACK_LAYER        (auto)    auto | pat | ssh

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=./_lib-sanitize.sh
source "${SCRIPT_DIR}/_lib-sanitize.sh"
# shellcheck source=./_lib-github-api.sh
source "${SCRIPT_DIR}/_lib-github-api.sh"

REPO_DIR="${1:-$PWD}"
LOCK_FILE="/tmp/lovable-sync-fallback.lock"
TS="$(date +%Y%m%d-%H%M%S)"
BRANCH="fallback/lovable-sync-${TS}"

: "${FALLBACK_DIRECT_MAIN:=false}"
: "${FALLBACK_DRY_RUN:=false}"
: "${FALLBACK_MAX_FILES:=50}"
: "${FALLBACK_LAYER:=auto}"

# Token: tenta GITHUB_TOKEN, depois GITHUB_PAT_PERFIL, depois arquivo da VPS
if [ -z "${GITHUB_TOKEN:-}" ]; then
  if [ -n "${GITHUB_PAT_PERFIL:-}" ]; then
    GITHUB_TOKEN="$GITHUB_PAT_PERFIL"
  elif [ -r "/root/CentralDark/secrets/github.env" ]; then
    # shellcheck disable=SC1091
    source /root/CentralDark/secrets/github.env
  fi
fi
: "${GITHUB_TOKEN:?nenhum token disponível (defina GITHUB_PAT_PERFIL ou /root/CentralDark/secrets/github.env)}"
export GITHUB_TOKEN

# Lock pra evitar concorrência
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  echo "[fallback] outra execução em andamento — saindo" >&2
  exit 0
fi

# Diretório de relatório
if [ -d /root/CentralDark/revisoes ]; then
  BASE_REV="/root/CentralDark/revisoes"
else
  BASE_REV="/tmp/centraldark-revisoes"
fi
REV_DIR="${BASE_REV}/${TS}/sync-fallback-lovable"
mkdir -p "$REV_DIR"
LOG_FILE="${REV_DIR}/logs-sanitizados.txt"
ACOES_FILE="${REV_DIR}/acoes-executadas.md"
CHECKS_JSON="${REV_DIR}/checks.json"

: > "$LOG_FILE"; : > "$ACOES_FILE"
log()  { echo "[$(date +%H:%M:%S)] $*" | tee -a "$LOG_FILE" >/dev/null; echo "[$(date +%H:%M:%S)] $*"; }
acao() { echo "- \`$*\`" >> "$ACOES_FILE"; }

log "Iniciando fallback (TS=${TS})"
log "Modo: DIRECT_MAIN=${FALLBACK_DIRECT_MAIN} DRY_RUN=${FALLBACK_DRY_RUN} LAYER=${FALLBACK_LAYER}"

# 1) Roda check
log "Etapa 1/5 — verificando estado"
bash "${SCRIPT_DIR}/lovable-check.sh" "$REPO_DIR" "$CHECKS_JSON" 2>&1 | sanitize | tee -a "$LOG_FILE" >/dev/null

precisa=$(python3 -c "import json;d=json.load(open('${CHECKS_JSON}'));print('1' if d['precisa_fallback'] else '0')" 2>/dev/null || echo 0)
bloq_lim=$(python3 -c "import json;d=json.load(open('${CHECKS_JSON}'));print('1' if d['bloqueado_por_limite'] else '0')")
bloq_sens=$(python3 -c "import json;d=json.load(open('${CHECKS_JSON}'));print('1' if d['bloqueado_por_zona_sensivel'] else '0')")

if [ "$precisa" != "1" ]; then
  log "Nada divergente. Tudo em dia. Saindo."
  printf "# Resumo\n\nStatus: **OK** — nada a sincronizar.\nTimestamp: %s\n" "$TS" > "${REV_DIR}/resumo.md"
  exit 0
fi
if [ "$bloq_lim" = "1" ]; then
  log "BLOQUEADO: divergência acima do limite. Revise manualmente."
  printf "# Resumo\n\nStatus: **BLOQUEADO** — acima de FALLBACK_MAX_FILES=%s.\n" "$FALLBACK_MAX_FILES" > "${REV_DIR}/resumo.md"
  exit 4
fi
if [ "$bloq_sens" = "1" ]; then
  log "BLOQUEADO: divergência em zona sensível (CRM/Caddy/Docker/WuzAPI/WhatsApp). Pedindo confirmação humana."
  printf "# Resumo\n\nStatus: **BLOQUEADO** — arquivos em zona sensível detectados. Revise no checks.json.\n" > "${REV_DIR}/resumo.md"
  exit 5
fi

# Lista arquivos
mapfile -t files < <(python3 -c "import json;d=json.load(open('${CHECKS_JSON}'));[print(f) for f in d['arquivos_divergentes']]")
log "Arquivos a sincronizar: ${#files[@]}"

if [ "$FALLBACK_DRY_RUN" = "true" ]; then
  log "DRY-RUN ativo. Não vou criar branch/PR."
  printf "# Resumo\n\nStatus: **DRY-RUN** — %d arquivos seriam empurrados. Veja checks.json.\n" "${#files[@]}" > "${REV_DIR}/resumo.md"
  exit 0
fi

# 2) Camada A — PAT via API
camada_usada=""
sucesso=0
if [ "$FALLBACK_LAYER" = "auto" ] || [ "$FALLBACK_LAYER" = "pat" ]; then
  log "Etapa 2/5 — tentando Camada A (PAT)"
  acao "gh_get_ref_sha heads/main"
  base_sha=$(gh_get_ref_sha heads/main)
  if [ -n "$base_sha" ]; then
    if [ "$FALLBACK_DIRECT_MAIN" = "true" ]; then
      target_branch="main"
      log "Push direto na main (FALLBACK_DIRECT_MAIN=true)"
    else
      target_branch="$BRANCH"
      log "Criando branch ${target_branch}"
      acao "gh_create_branch ${target_branch} ${base_sha}"
      resp=$(gh_create_branch "$target_branch" "$base_sha")
      echo "$resp" | sanitize >> "$LOG_FILE"
    fi

    falhas=0
    for f in "${files[@]}"; do
      [ -f "$REPO_DIR/$f" ] || continue
      sha_atual=$(gh_get_file_sha "$f" "$target_branch")
      acao "gh_put_file ${f} ${target_branch}"
      resp=$(gh_put_file "$f" "$target_branch" "chore(fallback): sync via PAT [${TS}]

Co-authored-by: SegredoiDev <segredounlock@users.noreply.github.com>" \
            "$REPO_DIR/$f" "$sha_atual")
      if echo "$resp" | grep -q '"sha"'; then
        log "OK: $f"
      else
        log "FALHA: $f"
        echo "$resp" | sanitize >> "$LOG_FILE"
        falhas=$((falhas+1))
      fi
    done

    if [ "$falhas" = "0" ]; then
      sucesso=1
      camada_usada="PAT"
      if [ "$target_branch" != "main" ]; then
        log "Abrindo PR ${target_branch} -> main"
        acao "gh_open_pr ${target_branch}"
        pr_resp=$(gh_open_pr "$target_branch" \
          "fallback: sync Lovable↔GitHub [${TS}]" \
          "PR aberto automaticamente pelo \`lovable-sync-fallback.sh\` porque o sync da Lovable não propagou. Revisar e merge manual.")
        pr_num=$(echo "$pr_resp" | python3 -c "import sys,json
try:print(json.load(sys.stdin).get('number',''))
except:print('')")
        log "PR #${pr_num} aberto"
        [ -n "$pr_num" ] && gh_add_label "$pr_num" "fallback-lovable" >/dev/null 2>&1 || true
      fi
    fi
  else
    log "Camada A: falhou ao obter sha base"
  fi
fi

# 3) Camada B — SSH na VPS
if [ "$sucesso" = "0" ] && { [ "$FALLBACK_LAYER" = "auto" ] || [ "$FALLBACK_LAYER" = "ssh" ]; }; then
  log "Etapa 3/5 — tentando Camada B (SSH na VPS)"
  if [ -f "/dev-server/scripts/lovable-agent/setup-vps-ssh.sh" ]; then
    # shellcheck disable=SC1091
    source /dev-server/scripts/lovable-agent/setup-vps-ssh.sh 2>/dev/null
  elif [ -f "scripts/lovable-agent/setup-vps-ssh.sh" ]; then
    # shellcheck disable=SC1091
    source scripts/lovable-agent/setup-vps-ssh.sh 2>/dev/null
  fi
  if command -v ssh-vps >/dev/null 2>&1; then
    acao "ssh-vps git pull + commit + push (branch ${BRANCH})"
    ssh-vps "cd /root/Multizap/apps/clone-deck && git fetch origin && git checkout -b ${BRANCH} origin/main && git status" 2>&1 | sanitize | tee -a "$LOG_FILE" >/dev/null
    log "Camada B requer envio dos arquivos via scp-vps — não implementado neste passo (gancho deixado)."
    # Gancho intencional: full implementation envolve scp arquivo-a-arquivo
    # ou criar tarball, transferir, aplicar. Deixado como TODO documentado.
  else
    log "Camada B: ssh-vps indisponível"
  fi
fi

# 4) Validação
log "Etapa 4/5 — validando"
new_sha=$(gh_get_ref_sha "heads/${BRANCH}" 2>/dev/null || true)
[ -z "$new_sha" ] && new_sha=$(gh_get_ref_sha heads/main)
log "sha pós-fallback: ${new_sha:-<vazio>}"

# 5) Relatório
log "Etapa 5/5 — gerando relatório"
status="ERRO"
[ "$sucesso" = "1" ] && status="OK"
cat > "${REV_DIR}/resumo.md" <<EOF
# Resumo — fallback Lovable↔GitHub

- **Status:** ${status}
- **Timestamp:** ${TS}
- **Camada usada:** ${camada_usada:-nenhuma}
- **Arquivos:** ${#files[@]}
- **Branch criada:** ${BRANCH}
- **SHA pós-fallback:** ${new_sha:-<vazio>}
- **DIRECT_MAIN:** ${FALLBACK_DIRECT_MAIN}
- **DRY_RUN:** ${FALLBACK_DRY_RUN}

## Arquivos sincronizados
$(printf -- "- %s\n" "${files[@]}")

## Próximos passos
- Conferir PR no GitHub (\`segredounlock/clone-deck\`)
- Logs detalhados: \`${LOG_FILE}\`
- Ações: \`${ACOES_FILE}\`
EOF

log "Concluído. Relatório: ${REV_DIR}"
[ "$sucesso" = "1" ] && exit 0 || exit 6
