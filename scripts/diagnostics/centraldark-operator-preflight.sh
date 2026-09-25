#!/usr/bin/env bash
# CentralDark operator preflight — diagnóstico determinístico e read-only.
# NÃO autentica, NÃO lê valor de token, NÃO executa source JS/CJS/MJS como shell.
set -uo pipefail

ROOT="${CENTRALDARK_ROOT:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
GH_BIN="${GH_BIN:-gh}"
HOME_DIR="${HOME:-/root}"

echo "CENTRALDARK_OPERATOR_PREFLIGHT=v1"
echo "ROOT=${ROOT}"

# 1) GitHub CLI: medir antes de sugerir login.
if command -v "${GH_BIN}" >/dev/null 2>&1 || [ -x "${GH_BIN}" ]; then
  if "${GH_BIN}" auth status --hostname github.com >/dev/null 2>&1; then
    GH_LOGIN="$("${GH_BIN}" api user -q .login 2>/dev/null || true)"
    echo "GH_AUTH=PASS"
    echo "GH_LOGIN=${GH_LOGIN:-UNKNOWN}"
    echo "GH_LOGIN_ACTION=SKIP_ALREADY_AUTHENTICATED"
  else
    echo "GH_AUTH=UNKNOWN_OR_FAIL"
    echo "GH_LOGIN=UNKNOWN"
    echo "GH_LOGIN_ACTION=AUTH_REQUIRED"
  fi
else
  echo "GH_AUTH=UNKNOWN"
  echo "GH_LOGIN=UNKNOWN"
  echo "GH_LOGIN_ACTION=GH_NOT_FOUND"
fi

# 2) Bash startup: ausência de ~/.cargo/env não derruba a CentralDark.
CARGO_ENV="${HOME_DIR}/.cargo/env"
cargo_refs=0
for startup in "${HOME_DIR}/.bashrc" "${HOME_DIR}/.profile" "${HOME_DIR}/.bash_profile"; do
  [ -f "${startup}" ] || continue
  count="$(grep -Ec '(source|\.)[[:space:]].*\.cargo/env|\.cargo/env' "${startup}" 2>/dev/null || true)"
  cargo_refs=$((cargo_refs + count))
done

if [ -f "${CARGO_ENV}" ]; then
  echo "CARGO_ENV=PRESENT"
  echo "CARGO_STARTUP=OK"
elif [ "${cargo_refs}" -gt 0 ]; then
  echo "CARGO_ENV=ABSENT_OPTIONAL"
  echo "CARGO_STARTUP=GUARD_NEEDED"
  echo 'CARGO_SAFE_SOURCE=[ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"'
else
  echo "CARGO_ENV=ABSENT_OPTIONAL"
  echo "CARGO_STARTUP=NO_REFERENCE_OBSERVED"
fi

# 3) Caminhos canônicos: path é path, não comando shell.
for rel in   "apps/bot-telegram/skills/core/consciousness.cjs"   "apps/modulos/mcp/src/hub-mission-consumer.js"
do
  if [ -f "${ROOT}/${rel}" ]; then
    echo "CANONICAL_PATH=${rel}:PRESENT"
  else
    echo "CANONICAL_PATH=${rel}:UNKNOWN"
  fi
done

orchestrator="$(find "${ROOT}/apps" -type f \( -name 'orchestrator.mjs' -o -name 'orchestrator.js' -o -name 'orchestrator.cjs' \) -print -quit 2>/dev/null || true)"
if [ -n "${orchestrator}" ]; then
  echo "ORCHESTRATOR_PATH=${orchestrator#"${ROOT}/"}"
else
  echo "ORCHESTRATOR_PATH=UNKNOWN"
fi

# 4) Se recebeu uma entrada, classifica sem executá-la.
if [ "$#" -gt 0 ]; then
  raw="$*"
  echo "INPUT_PRESENT=true"

  if [[ "${raw}" =~ ^gh[[:space:]]+STATUS([[:space:]]|$) ]]; then
    echo "INPUT_CLASS=INVALID_GH_SUBCOMMAND_CASE"
    echo "CANONICAL_COMMAND=gh status"
    exit 2
  fi

  if [[ "${raw}" == *"..."* || "${raw}" == *"(ou "* || "${raw}" == *" ou o caminho real"* ]]; then
    echo "INPUT_CLASS=PLACEHOLDER_NOT_EXECUTABLE"
    echo "CANONICAL_COMMAND=NONE"
    exit 2
  fi

  if [ "$#" -eq 1 ]; then
    candidate="$1"
    [ -f "${candidate}" ] || candidate="${ROOT}/$1"
    if [ -f "${candidate}" ] && [[ "${candidate}" =~ \.(cjs|mjs|js|ts|tsx)$ ]]; then
      echo "INPUT_CLASS=SOURCE_PATH_NOT_SHELL_COMMAND"
      echo "SOURCE_PATH=${candidate#"${ROOT}/"}"
      echo "CANONICAL_COMMAND=NONE"
      echo "SAFE_ACTION=INSPECT_OR_USE_OWNER_ENTRYPOINT"
      exit 2
    fi
  fi

  echo "INPUT_CLASS=UNCLASSIFIED"
  echo "CANONICAL_COMMAND=UNKNOWN"
fi

echo "RESULT=PASS_READ_ONLY"
