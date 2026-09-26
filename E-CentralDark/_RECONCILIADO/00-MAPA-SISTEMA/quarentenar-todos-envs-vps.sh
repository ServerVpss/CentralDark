#!/usr/bin/env bash
# ============================================================================
# quarentenar-todos-envs-vps.sh
# ----------------------------------------------------------------------------
# Varre /root procurando arquivos .env* fora do cofre oficial e move pra
# quarentena (sem apagar definitivo). Dois modos:
#
#   dry-run  -> só lista o que seria movido, NÃO cria pasta de quarentena
#   apply    -> cria quarentena e move os arquivos, valida o MCP no final
#
# Regras invioláveis:
#   - NUNCA lê o conteúdo de qualquer .env
#   - NUNCA imprime token, secret ou hash de conteúdo
#   - NUNCA apaga definitivo (cp -a + rm do original, dentro da quarentena)
#   - Preserva /root/CentralDark/secrets/ (cofre oficial)
#   - Ignora: quarantine, revisoes, node_modules, .git, dist, build, cache
# ============================================================================

set -Eeuo pipefail

# ---------- Configuração ----------------------------------------------------
ROOT_BASE="/root"
COFRE_DIR="/root/CentralDark/secrets"
COFRE_MCP="${COFRE_DIR}/mcp.env"
QUARANTINE_BASE="/root/CentralDark/quarantine"
REVISOES_BASE="/root/CentralDark/revisoes"
DOCS_CONSCIENCIA="/root/docs/CONSCIENCIA"
DOCS_PENDENCIAS="/root/docs/PENDENCIAS.md"
DOCS_APRENDIZADOS="${DOCS_CONSCIENCIA}/APRENDIZADOS.md"

MCP_HEALTH_URL="https://mcp.centralldark.com/health"
MCP_RPC_URL="https://mcp.centralldark.com/mcp"

# Chaves obrigatórias no mcp.env (presença booleana — nunca imprime valor)
REQUIRED_MCP_KEYS=(
  "MCP_TOKEN"
  "GITHUB_TOKEN"
  "GITHUB_OWNER"
  "GITHUB_REPO"
  "VPS_REPO_PATH"
  "PM2_ALLOWED_RESTART"
)

# Lote 1 SEGURO: NÃO mover estes arquivos sensíveis (WuzAPI / gateway / sync).
# Serão migrados em lote dedicado, serviço por serviço.
PRESERVE_LIST=(
  "/root/Multizap/wuzapi/.env"
  "/root/Multizap/gateway/.env"
  "/root/Multizap/secrets/wabot.env"
  "/root/Multizap/secrets/supabase-mcp.env"
)

is_preserved() {
  local path="$1"
  for p in "${PRESERVE_LIST[@]}"; do
    [[ "$path" == "$p" ]] && return 0
  done
  return 1
}

TS="$(date +%Y%m%d-%H%M%S)"
REVISAO_DIR="${REVISOES_BASE}/${TS}-quarentenar-envs"
RELATORIO="${REVISAO_DIR}/RELATORIO.md"
QUARANTINE_DIR="${QUARANTINE_BASE}/envs-${TS}"

MODE="${1:-dry-run}"

# ---------- Helpers ---------------------------------------------------------
log()  { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }
fail() { printf '\n[ERRO] %s\n' "$*" >&2; exit 1; }

# ---------- 1. Pré-flight ---------------------------------------------------
preflight() {
  log "Pré-flight: validando cofre oficial..."

  [[ -d "$COFRE_DIR" ]]  || fail "Cofre não existe: $COFRE_DIR"
  [[ -f "$COFRE_MCP" ]]  || fail "Falta o arquivo: $COFRE_MCP"

  local faltando=()
  for k in "${REQUIRED_MCP_KEYS[@]}"; do
    # grep -q apenas verifica presença da chave; valor nunca é exibido
    if ! grep -Eq "^[[:space:]]*${k}=" "$COFRE_MCP"; then
      faltando+=("$k")
    fi
  done

  if (( ${#faltando[@]} > 0 )); then
    fail "Chaves ausentes em mcp.env: ${faltando[*]} (valores nunca são impressos)"
  fi

  log "Cofre OK. Chaves obrigatórias presentes (sem expor valor)."
}

# ---------- 2. Varredura ----------------------------------------------------
# Saída: linhas "path<TAB>size<TAB>mtime_iso"
varrer_envs() {
  # find: tipo arquivo, nome casa .env / .env.* / *.env
  # -prune pra pular pastas proibidas
  find "$ROOT_BASE" \
    \( \
         -path "$COFRE_DIR" \
      -o -path "$QUARANTINE_BASE" \
      -o -path "$REVISOES_BASE" \
      -o -name "node_modules" \
      -o -name ".git" \
      -o -name "dist" \
      -o -name "build" \
      -o -name "cache" \
      -o -name ".cache" \
    \) -prune \
    -o -type f \
       \( -name ".env" -o -name ".env.*" -o -name "*.env" \) \
       -printf '%p\t%s\t%TY-%Tm-%TdT%TH:%TM:%TS\n' -print 2>/dev/null \
    | awk -F'\t' 'NF==3 {print}'
}

# ---------- 3. Relatório ----------------------------------------------------
gerar_relatorio() {
  local lista="$1"
  mkdir -p "$REVISAO_DIR"

  {
    echo "# Relatório — quarentena de .env (${MODE})"
    echo ""
    echo "- Data: ${TS}"
    echo "- Modo: ${MODE}"
    echo "- Cofre preservado: ${COFRE_DIR}"
    echo "- Pasta de quarentena (${MODE}): ${QUARANTINE_DIR}"
    echo ""
    echo "## Arquivos .env encontrados (fora do cofre)"
    echo ""
    if [[ -z "$lista" ]]; then
      echo "_Nenhum arquivo encontrado._"
    else
      echo "| path | size (bytes) | mtime |"
      echo "|------|--------------|-------|"
      while IFS=$'\t' read -r p s m; do
        [[ -z "$p" ]] && continue
        echo "| \`${p}\` | ${s} | ${m} |"
      done <<< "$lista"
    fi
    echo ""
    echo "> Conteúdo dos arquivos NUNCA foi lido. Apenas metadados."
  } > "$RELATORIO"

  log "Relatório salvo em: $RELATORIO"
}

# ---------- 4. Apply: mover + ENV-README ------------------------------------
mover_envs() {
  local lista="$1"
  mkdir -p "$QUARANTINE_DIR"

  local movidos=0
  while IFS=$'\t' read -r src _size _mtime; do
    [[ -z "$src" ]] && continue

    # Caminho relativo a /root pra preservar a árvore
    local rel="${src#${ROOT_BASE}/}"
    local dst="${QUARANTINE_DIR}/${rel}"
    local dst_dir
    dst_dir="$(dirname "$dst")"

    mkdir -p "$dst_dir"
    cp -a "$src" "$dst"
    rm -f "$src"

    # ENV-README.md na pasta original (não sobrescreve se já existir)
    local origem_dir
    origem_dir="$(dirname "$src")"
    local readme="${origem_dir}/ENV-README.md"
    if [[ ! -f "$readme" ]]; then
      cat > "$readme" <<EOF
# ENV movido pra quarentena

O arquivo \`$(basename "$src")\` que ficava nesta pasta foi movido pra
quarentena em **${TS}** como parte da centralização de secrets.

- Cofre oficial: \`${COFRE_DIR}\`
- Cópia preservada em: \`${dst}\`
- Relatório: \`${RELATORIO}\`

**Não recriar .env aqui.** Use o cofre oficial.
EOF
    fi

    movidos=$((movidos+1))
  done <<< "$lista"

  log "Movidos: ${movidos} arquivo(s) para ${QUARANTINE_DIR}"
  echo "$movidos"
}

# ---------- 5. Doc de consciência -------------------------------------------
gerar_doc_consciencia() {
  mkdir -p "$DOCS_CONSCIENCIA"
  local doc="${DOCS_CONSCIENCIA}/13-COFRE-SECRETS-CENTRALIZADO.md"
  cat > "$doc" <<EOF
# 13 — Cofre de Secrets Centralizado

**Regra:** todo secret/.env do CentralDark vive em um único lugar:

\`\`\`
${COFRE_DIR}/
\`\`\`

## Por que

- Evita .env espalhado por dezenas de pastas (risco de vazar, esquecer, divergir).
- Um único ponto de rotação de chave.
- Backup e auditoria simples.

## O que NÃO fazer

- Não criar \`.env\` em pastas de app (use o cofre).
- Não commitar \`.env\` no repo.
- Não copiar valor de secret pra chat, log, PR ou painel.

## Quarentena

Arquivos \`.env*\` antigos foram movidos (não apagados) pra:

\`\`\`
${QUARANTINE_BASE}/envs-<timestamp>/
\`\`\`

Cada pasta original ficou com um \`ENV-README.md\` apontando pra cá.

## Script

\`CentralDark/scripts/run-once/quarentenar-todos-envs-vps.sh\` faz a varredura
e a movimentação. Dois modos: \`dry-run\` (só lista) e \`apply\` (move).

Última execução registrada: \`${REVISAO_DIR}\`
EOF
  log "Doc de consciência: $doc"
}

# ---------- 6. Atualizar PENDENCIAS + APRENDIZADOS --------------------------
atualizar_docs_repo() {
  local movidos="$1"

  if [[ -f "$DOCS_PENDENCIAS" ]]; then
    {
      echo ""
      echo "## [${TS}] Centralização de secrets — concluída"
      echo "- ${movidos} arquivo(s) \`.env*\` movidos pra \`${QUARANTINE_DIR}\`."
      echo "- Cofre oficial: \`${COFRE_DIR}\`."
      echo "- Relatório: \`${RELATORIO}\`."
    } >> "$DOCS_PENDENCIAS"
    log "PENDENCIAS.md atualizado."
  fi

  if [[ -f "$DOCS_APRENDIZADOS" ]]; then
    {
      echo ""
      echo "## [${TS}] .env espalhados → cofre único"
      echo "- **Categoria:** decisão + atalho"
      echo "- **Contexto:** vários \`.env\` antigos espalhados em \`/root\`."
      echo "- **Aprendizado:** cofre único em \`${COFRE_DIR}\`; quarentena versionada por timestamp; nunca apagar definitivo."
      echo "- **Próximo passo:** validar serviços que liam .env antigo e migrar leitura pro cofre."
    } >> "$DOCS_APRENDIZADOS"
    log "APRENDIZADOS.md atualizado."
  fi
}

# ---------- 7. Validar MCP --------------------------------------------------
validar_mcp() {
  log "Validando MCP..."
  local rel_mcp="${REVISAO_DIR}/VALIDACAO-MCP.md"

  local health_code
  health_code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$MCP_HEALTH_URL" || echo "000")"

  # tools/list via SSE — parsear linhas data: e contar tools
  local sse_body
  sse_body="$(curl -sS --max-time 20 -N \
    -H 'Accept: text/event-stream' \
    -H 'Content-Type: application/json' \
    -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
    "$MCP_RPC_URL" 2>/dev/null || true)"

  local tools_count
  tools_count="$(printf '%s\n' "$sse_body" \
    | grep -E '^data:' \
    | sed -E 's/^data:[[:space:]]*//' \
    | python3 -c '
import sys, json
total = 0
for line in sys.stdin:
    line = line.strip()
    if not line: continue
    try:
        obj = json.loads(line)
    except Exception:
        continue
    res = obj.get("result") or {}
    tools = res.get("tools")
    if isinstance(tools, list):
        total = max(total, len(tools))
print(total)
' 2>/dev/null || echo "0")"

  {
    echo "# Validação MCP pós-apply"
    echo ""
    echo "- /health → HTTP ${health_code}"
    echo "- tools/list → toolsCount=${tools_count}"
    echo ""
    if [[ "$health_code" == "200" && "${tools_count:-0}" -gt 0 ]]; then
      echo "**Resultado:** OK"
    else
      echo "**Resultado:** ALERTA — verificar MCP manualmente."
    fi
  } > "$rel_mcp"

  log "Validação MCP salva em: $rel_mcp (health=${health_code}, tools=${tools_count})"
}

# ============================================================================
# MAIN
# ============================================================================
case "$MODE" in
  dry-run|apply) ;;
  *) fail "Modo inválido: $MODE (use 'dry-run' ou 'apply')" ;;
esac

log "Modo: ${MODE}"
preflight

log "Varrendo ${ROOT_BASE} (ignorando cofre, quarentena, revisoes, node_modules, .git, dist, build, cache)..."
LISTA_BRUTA="$(varrer_envs || true)"

# Filtra PRESERVE_LIST (Lote 1 seguro: WuzAPI / gateway / wabot / supabase-mcp)
LISTA=""
PRESERVADOS=""
while IFS= read -r linha; do
  [[ -z "$linha" ]] && continue
  caminho="${linha%%$'\t'*}"
  if is_preserved "$caminho"; then
    PRESERVADOS+="${linha}"$'\n'
  else
    LISTA+="${linha}"$'\n'
  fi
done <<< "$LISTA_BRUTA"
LISTA="${LISTA%$'\n'}"
PRESERVADOS="${PRESERVADOS%$'\n'}"

TOTAL="$(printf '%s\n' "$LISTA" | grep -c . || true)"
TOTAL_PRESERVADOS="$(printf '%s\n' "$PRESERVADOS" | grep -c . || true)"
log "Encontrados: ${TOTAL} arquivo(s) .env fora do cofre (a quarentenar)."
log "Preservados (Lote 1 seguro): ${TOTAL_PRESERVADOS} arquivo(s) sensíveis intocados."

gerar_relatorio "$LISTA"

# Anexa seção de preservados ao relatório
{
  echo ""
  echo "## Preservados (Lote 1 seguro — NÃO movidos)"
  echo ""
  if [[ -z "$PRESERVADOS" ]]; then
    echo "_Nenhum arquivo preservado._"
  else
    echo "| path | size (bytes) | mtime |"
    echo "|------|--------------|-------|"
    while IFS=$'\t' read -r p s m; do
      [[ -z "$p" ]] && continue
      echo "| \`${p}\` | ${s} | ${m} |"
    done <<< "$PRESERVADOS"
  fi
  echo ""
  echo "> Motivo: WuzAPI / gateway / WhatsApp / sync são sensíveis. Lote 2 dedicado migra serviço por serviço para o cofre oficial."
} >> "$RELATORIO"

if [[ "$MODE" == "dry-run" ]]; then
  log "DRY-RUN: pasta de quarentena NÃO foi criada."
  log "Caminho que seria usado no apply: ${QUARANTINE_DIR}"
  log "Nada foi movido. Revise o relatório e rode 'apply' se estiver OK."
  exit 0
fi

# APPLY
if [[ "$TOTAL" -eq 0 ]]; then
  log "Nada pra mover. Encerrando."
  exit 0
fi

MOVIDOS="$(mover_envs "$LISTA")"
gerar_doc_consciencia
atualizar_docs_repo "$MOVIDOS"
validar_mcp

log "APPLY concluído. Quarentena: ${QUARANTINE_DIR}"
log "Relatório: ${RELATORIO}"
