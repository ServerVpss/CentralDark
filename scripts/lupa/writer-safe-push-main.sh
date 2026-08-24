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
#   REGENERATE_CMD    comando rodado DENTRO do worktree antes do git add
#   MAX_TRIES         default 3
#   GIT_AUTHOR_NAME   default CentralDark Bot
#   GIT_AUTHOR_EMAIL  default bot@centralldark.com
#   SOURCE_ROOT       raiz com payload ja gerado (default: cwd)
# =============================================================================
set -euo pipefail

WRITER_TAG="${WRITER_TAG:?WRITER_TAG obrigatorio}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:?COMMIT_MESSAGE obrigatorio}"
PATHS="${PATHS:?PATHS obrigatorio}"
REGENERATE_CMD="${REGENERATE_CMD:-}"
MAX_TRIES="${MAX_TRIES:-3}"
GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-CentralDark Bot}"
GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-bot@centralldark.com}"
SOURCE_ROOT="${SOURCE_ROOT:-$(pwd)}"
REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# shellcheck disable=SC2206
PATH_ARR=($PATHS)

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
    node scripts/lupa/validar-continuidade-global.mjs
    node scripts/lupa/validar-porta-de-entrada.mjs

    if git push origin HEAD:main; then
      echo "✅ ${WRITER_TAG}_PUSH_OK tentativa=$TRY head=${HEAD_SHA:0:12}"
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
