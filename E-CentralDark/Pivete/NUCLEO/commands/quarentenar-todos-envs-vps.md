# COMANDO - quarentenar-todos-envs-vps.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\scripts\run-once\quarentenar-todos-envs-vps.sh
**SHA:** c62e2b06b7d3d7cb
**Timestamp:** 2026-08-26T19:32:47.097318
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- log "DRY-RUN: pasta de quarentena NÃO foi criada."

### Padroes
- **Regra:** todo secret/.env do CentralDark vive em um único lugar:

### Ouro Bruto (primeiros 5000 chars)
```
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
    [[ -z "$src" ]] && continu
```