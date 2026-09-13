#!/usr/bin/env bash
# =============================================================================
# PADRAO CANONICO — writer automatico na main (anti falso-verde)
# =============================================================================
# Owner: scripts/lupa/writer-safe-push-main.sh
# Consumidores: notion-sync, estado-retomada, painel-vivo, painel-validacao,
#               linear-pendencias-sync (+ qualquer writer automatico futuro)
#
# Contrato:
# - ZERO rebase -X ours
# - ZERO force-push
# - ZERO merge cego
# - Cada tentativa observa origin/main fresca em worktree descartavel
# - Regenera (se REGENERATE_CMD) OU reaplica payload local (PATHS)
# - Gate global obrigatorio antes do push
# - Push rejeitado por concorrencia => retry (max MAX_TRIES)
# - Apos esgotar tentativas => fail-closed com TAG_BLOCKED_DIVERGENCE
#
# Env obrigatoria:
#   WRITER_TAG        ex: NOTION_REPORT | ESTADO_RETOMADA | PAINEL_VIVO
#   COMMIT_MESSAGE    mensagem do commit (pode ter quebras via $'...\n...')
#   PATHS             paths relativos separados por espaco (escopo do writer)
#
# Env opcional:
#   AUTO_DISCOVER     1 = descobrir delta rastreado elegível no mesmo owner
#   AUTO_DISCOVER_SCOPE prefixes relativos separados por virgula (obrigatorio com AUTO_DISCOVER)
#   DRY_RUN            1 = mostrar seleção e não criar worktree/commit/push
#   REGENERATE_CMD    comando rodado DENTRO do worktree antes do git add
#   MAX_TRIES         default 3
#   GIT_AUTHOR_NAME   default CentralDark Bot
#   GIT_AUTHOR_EMAIL  default bot@centralldark.com
#   SOURCE_ROOT       raiz com payload ja gerado (default: cwd)
# =============================================================================
set -euo pipefail

WRITER_TAG="${WRITER_TAG:?WRITER_TAG obrigatorio}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:?COMMIT_MESSAGE obrigatorio}"
AUTO_DISCOVER="${AUTO_DISCOVER:-0}"
AUTO_DISCOVER_SCOPE="${AUTO_DISCOVER_SCOPE:-}"
DRY_RUN="${DRY_RUN:-0}"
PATHS="${PATHS:-}"
REGENERATE_CMD="${REGENERATE_CMD:-}"
MAX_TRIES="${MAX_TRIES:-3}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-CentralDark Bot}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-bot@centralldark.com}"
SOURCE_ROOT="${SOURCE_ROOT:-$(pwd)}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# shellcheck disable=SC2206
if [ "$AUTO_DISCOVER" = "1" ]; then
  if [ -n "$PATHS" ]; then
    echo "${WRITER_TAG}_AUTO_DISCOVER_PATHS_CONFLICT=1" >&2
    exit 2
  fi
  [ -n "$AUTO_DISCOVER_SCOPE" ] || {
    echo "${WRITER_TAG}_AUTO_DISCOVER_SCOPE_REQUIRED=1" >&2
    exit 2
  }
  IFS=',' read -r -a SCOPE_ARR <<< "$AUTO_DISCOVER_SCOPE"
  for prefix in "${SCOPE_ARR[@]}"; do
    case "$prefix" in
      ""|.|/*|*../*|../*|*"$'\n'"*|*"$'\r'"*)
        echo "${WRITER_TAG}_AUTO_DISCOVER_SCOPE_INVALID=1" >&2
        exit 2 ;;
    esac
  done
  mapfile -d '' -t RAW_PATH_ARR < <(git diff HEAD --name-only -z --diff-filter=ACMRTUXB -- .)
  PATH_ARR=()
  for p in "${RAW_PATH_ARR[@]}"; do
    in_scope=0
    for prefix in "${SCOPE_ARR[@]}"; do
      case "$p" in
        "$prefix"|"$prefix"/*) in_scope=1; break ;;
      esac
    done
    [ "$in_scope" -eq 1 ] || continue
    base=$(basename "$p")
    case "$p" in
      .env|.env.*|*/.env|*/.env.*|*secret*|*token*|*credential*|*password*|*.pem|*.key|*.crt|*.p12|*.pfx|.venv_status|*/.venv_status/*|node_modules|*/node_modules/*|.venv|*/.venv/*|__pycache__|*/__pycache__/*|.pytest_cache|*/.pytest_cache/*|dist|*/dist/*|build|*/build/*|*.zip|*.7z|*.tar|*.tgz|*.gz|*/status/*|status/*|*/logs/*|logs/*|*/missions/*|missions/*|*.next_run|*.state.json|*.estado.json|*analyst-decision.json|*last-report.json|*graph.json|status.json|*/status.json|*-health.json|*-status.json|*.jsonl|*.npmrc|*.netrc|id_rsa|kubeconfig|*.pem|*.pub|*.p12|*.pfx|*.jks|*.keystore|*.truststore|*.cer|*.sig|*.asc|*.gpg|*.gnupg|*.b64|*.base64|*.env.local|*.env.production|*.env.staging|*.env.test|*.env.development|*.credentials|*credentials*|*credential*|*auth*token*|*access*token*|*refresh*token*|*api*key*|*apikey*|*private*key*|*public*key*|*ssh*key*|*id_*|*.ssh*|*.ssh/config|*.ssh/known_hosts|*.ssh/id_*|*.ssh/agent|*.ssh/authorized_keys|*.ssh/id_ed25519|*.ssh/id_rsa|*.ssh/id_ecdsa|*.ssh/id_dsa|*.ssh/id_xmss|*.ssh/id_bliss|*.ssh/id_gssapi_krb5|*.ssh/id_whatevs)
        continue ;;
    esac
    case "$base" in
      GRAFO-VIVO.md|latest.md|ESTADO-DA-RETOMADA.md) continue ;;
    esac
    PATH_ARR+=("$p")
  done
  if [ "${#PATH_ARR[@]}" -eq 0 ]; then
    echo "${WRITER_TAG}_NO_ELIGIBLE_TRACKED_DELTA=1"
    exit 0
  fi
  printf '🔎 %s AUTO_DISCOVER_PATHS=%s\n' "$WRITER_TAG" "${PATH_ARR[*]}"
else
  [ -n "$PATHS" ] || { echo "PATHS ou AUTO_DISCOVER=1 obrigatorio" >&2; exit 2; }
  read -r -a PATH_ARR <<< "$PATHS"
fi

for p in "${PATH_ARR[@]}"; do
  case "$p" in
    ""|.|./|*./|*/.|*/./*|/*|*..*|*"$'\n'"*|*"$'\r'"*|*[[:space:]]*)
      echo "${WRITER_TAG}_PATH_INVALID=1" >&2
      exit 2 ;;
  esac
  if [[ "$p" =~ (^|/)\./?($|/) ]]; then
    echo "${WRITER_TAG}_PATH_INVALID=1" >&2
    exit 2
  fi
  if [[ "$p" == *'*'* || "$p" == *'?'* || "$p" == *'['* || "$p" == *']'* || "$p" == *'{'* || "$p" == *'}'* || "$p" == *';'* || "$p" == *'='* || "$p" == *'\\'* || "$p" == *'('* || "$p" == *')'* ]]; then
    echo "${WRITER_TAG}_PATH_INVALID=1" >&2
    exit 2
  fi
  if [[ "$p" != apps/modulos/mcp/dist/* ]]; then
    case "$p" in
      .env|.env.*|*/.env|*/.env.*|*secret*|*token*|*credential*|*password*|.venv_status|*/.venv_status/*|node_modules|*/node_modules/*|.venv|*/.venv/*|__pycache__|*/__pycache__/*|.pytest_cache|*/.pytest_cache/*|dist|*/dist/*|build|*/build/*|*.zip|*.7z|*.tar|*.tgz|*.gz|*/status/*|status/*|*/logs/*|logs/*|*/missions/*|missions/*|*.next_run|*.state.json|*.estado.json|*analyst-decision.json|*last-report.json|*graph.json|status.json|*/status.json|*-health.json|*-status.json|*.jsonl|*.npmrc|*.netrc|id_rsa|kubeconfig|*.pem|*.pub|*.p12|*.pfx|*.jks|*.keystore|*.truststore|*.cer|*.sig|*.asc|*.gpg|*.gnupg|*.b64|*.base64|*.env.local|*.env.production|*.env.staging|*.env.test|*.env.development|*.credentials|*credentials*|*credential*|*auth*token*|*access*token*|*refresh*token*|*api*key*|*apikey*|*private*key*|*public*key*|*ssh*key*|*id_*|*.ssh*|*.ssh/config|*.ssh/known_hosts|*.ssh/id_*|*.ssh/agent|*.ssh/authorized_keys|*.ssh/id_ed25519|*.ssh/id_rsa|*.ssh/id_ecdsa|*.ssh/id_dsa|*.ssh/id_xmss|*.ssh/id_bliss|*.ssh/id_gssapi_krb5|*.ssh/id_whatevs)
        echo "${WRITER_TAG}_PATH_FORBIDDEN=1" >&2
        exit 2 ;;
    esac
  fi
done

if [ "$DRY_RUN" = "1" ]; then
  printf '🧾 %s DRY_RUN=1; nenhuma worktree, alteração, commit ou publicação será feita\n' "$WRITER_TAG"
  exit 0
fi

has_payload() {
  local p
  for p in "${PATH_ARR[@]}"; do
    if [ -e "$SOURCE_ROOT/$p" ]; then
      return 0
    fi
  done
  return 1
}

if [ -z "$REGENERATE_CMD" ] && ! has_payload; then
  echo "${WRITER_TAG}_NO_PAYLOAD=1"
  exit 0
fi

PAYLOAD_DIR=""
if [ -z "$REGENERATE_CMD" ]; then
  PAYLOAD_DIR="${RUNNER_TEMP:-/tmp}/writer-payload-${WRITER_TAG}-$$"
  rm -rf "$PAYLOAD_DIR"
  mkdir -p "$PAYLOAD_DIR"
  for p in "${PATH_ARR[@]}"; do
    if [ -e "$SOURCE_ROOT/$p" ]; then
      mkdir -p "$PAYLOAD_DIR/$(dirname "$p")"
      cp -a "$SOURCE_ROOT/$p" "$PAYLOAD_DIR/$p"
    fi
  done
fi

for TRY in $(seq 1 "$MAX_TRIES"); do
  echo "🔄 ${WRITER_TAG} tentativa $TRY/$MAX_TRIES"
  git fetch --no-tags origin refs/heads/main
  BASE_SHA="$(git rev-parse FETCH_HEAD)"
  WORKTREE="${RUNNER_TEMP:-/tmp}/writer-wt-${WRITER_TAG}-${GITHUB_RUN_ID:-local}-${GITHUB_RUN_ATTEMPT:-0}-${TRY}-$$"

  if [ -e "$WORKTREE" ]; then
    echo "❌ WORKTREE_TEMP_JA_EXISTE=$WORKTREE"
    exit 1
  fi

  git worktree add --detach "$WORKTREE" "$BASE_SHA"

  STATUS=0
  if (
    set -euo pipefail
    cd "$WORKTREE"
    git config user.name "$GIT_AUTHOR_NAME"
    git config user.email "$GIT_AUTHOR_EMAIL"

    if [ -n "$REGENERATE_CMD" ]; then
      bash -lc "$REGENERATE_CMD"
    else
      for p in "${PATH_ARR[@]}"; do
        if [ -e "$PAYLOAD_DIR/$p" ]; then
          mkdir -p "$(dirname "$p")"
          rm -rf "$p"
          cp -a "$PAYLOAD_DIR/$p" "$p"
        fi
      done
    fi

    git add -- "${PATH_ARR[@]}"
    if git diff --cached --quiet; then
      echo "${WRITER_TAG}_NO_CHANGE=1"
      exit 0
    fi

    git commit -m "$COMMIT_MESSAGE"

    HEAD_SHA="$(git rev-parse HEAD)"
    echo "🚪 Gate global pré-main tag=$WRITER_TAG base=${BASE_SHA:0:12} head=${HEAD_SHA:0:12}"
    if [ -f scripts/trigger-fabric/verify_repo_contract.py ]; then
      python scripts/trigger-fabric/verify_repo_contract.py .
    fi

    RESPONSE_CONTRACT="docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md"
    test -f "$RESPONSE_CONTRACT" || {
      echo "CHEFE_SYSTEMATIC_PROOF_CONTRACT=FAIL reason=MISSING_OWNER"
      exit 1
    }
    for needle in \
      'CHEFE_SYSTEMATIC_PROOF_REQUIRED=true' \
      'SYSTEMATIC_PROOF_REQUIRED_FOR_MATERIAL_CONFIRMATIONS=true' \
      'CONFIRMATIONS_ONE_TOPIC_BELOW_ANOTHER=true' \
      'CONFIRMATIONS_MUST_INCLUDE_ALL_MATERIAL_PROVEN_ITEMS_IN_SCOPE=true' \
      'PROOF_REF_REQUIRED_FOR_PROVEN=true' \
      'SAME_TARGET_PROOF_REQUIRED=true' \
      'SAME_HEAD_REQUIRED_FOR_GIT_CLAIMS=true' \
      'SOURCE_ROLE_MUST_BE_QUALIFIED=true' \
      'NO_REGRESSION_OF_EXISTING_RESPONSE_LAYERS=true' \
      'EXISTING_PROVEN_FORMATS_REMAIN_REQUIRED=true' \
      'EVIDENCE_MUST_MATCH_CLAIM=true' \
      'ZERO_TRUST_FOR_MATERIAL_CLAIMS=true' \
      'GREEN_WITHOUT_RECONSTRUCTIBLE_PROOF=INCOMPLETE'
    do
      grep -Fq "$needle" "$RESPONSE_CONTRACT" || {
        echo "CHEFE_SYSTEMATIC_PROOF_CONTRACT=FAIL missing=$needle"
        exit 1
      }
    done
    echo "CHEFE_SYSTEMATIC_PROOF_CONTRACT=PASS"

    node scripts/lupa/validar-continuidade-global.mjs
    node scripts/lupa/validar-porta-de-entrada.mjs

    if git push origin HEAD:main; then
      REMOTE_HEAD="$(git ls-remote origin refs/heads/main | cut -f1)"
      if [ "$REMOTE_HEAD" != "$HEAD_SHA" ]; then
        echo "❌ ${WRITER_TAG}_REMOTE_HEAD_MISMATCH expected=$HEAD_SHA observed=$REMOTE_HEAD"
        exit 1
      fi
      echo "REMOTE_HEAD_VERIFIED=$REMOTE_HEAD"
      echo "✅ ${WRITER_TAG}_PUSH_OK tentativa=$TRY head=${HEAD_SHA:0:12} remote=${REMOTE_HEAD:0:12}"
      exit 0
    fi

    echo "⚠️ ${WRITER_TAG}_PUSH_REJECTED tentativa=$TRY — concorrencia; observando main de novo"
    exit 75
  ); then
    STATUS=0
  else
    STATUS=$?
  fi

  if ! git worktree remove --force "$WORKTREE" 2>/dev/null; then
    rm -rf "$WORKTREE" || true
    git worktree prune || true
  fi

  if [ "$STATUS" -eq 0 ]; then
    [ -n "$PAYLOAD_DIR" ] && rm -rf "$PAYLOAD_DIR" || true
    exit 0
  fi
  if [ "$STATUS" -ne 75 ]; then
    echo "❌ ${WRITER_TAG}_FAIL status=$STATUS (nao concorrencial)"
    [ -n "$PAYLOAD_DIR" ] && rm -rf "$PAYLOAD_DIR" || true
    exit "$STATUS"
  fi

  sleep 2
done

[ -n "$PAYLOAD_DIR" ] && rm -rf "$PAYLOAD_DIR" || true
echo "${WRITER_TAG}_BLOCKED_DIVERGENCE apos ${MAX_TRIES} tentativas"
exit 1