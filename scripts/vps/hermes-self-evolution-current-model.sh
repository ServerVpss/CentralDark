#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
CENTRALDARK_REPO="${CENTRALDARK_REPO:-$(cd -- "$SCRIPT_DIR/../.." && pwd)}"
DONOR_DIR="${HERMES_SELF_EVOLUTION_DIR:-${HOME:-/root}/.hermes/cache/scratch/hermes-agent-self-evolution}"
DONOR_REPO="${HERMES_SELF_EVOLUTION_REPO:-https://github.com/NousResearch/hermes-agent-self-evolution.git}"
DONOR_REF="${HERMES_SELF_EVOLUTION_REF:-0a929e3aa20e15cf04dc7c28492a7d41a5139125}"
SELF_PROVISION="${HERMES_SELF_PROVISION:-1}"
STATE_DIR="${CENTRALDARK_STATE_DIR:-$CENTRALDARK_REPO/logs}"
BASE_URL="${CENTRALDARK_LOCAL_AI_BASE_URL:-http://127.0.0.1:18435/v1}"
HEALTH_URL="${BASE_URL%/v1}/health"

fail() {
  printf '%s\n' "$1" >&2
  exit "${2:-1}"
}

provision_donor() {
  [ "$SELF_PROVISION" = "1" ] || return 0
  command -v git >/dev/null || fail "SELF_PROVISION_GIT_UNAVAILABLE" 69
  command -v python3 >/dev/null || fail "SELF_PROVISION_PYTHON_UNAVAILABLE" 69

  cloned=0
  if [ ! -d "$DONOR_DIR/.git" ]; then
    [ ! -e "$DONOR_DIR" ] || fail "SELF_PROVISION_REFUSES_UNMANAGED_DONOR:$DONOR_DIR" 73
    mkdir -p "$(dirname -- "$DONOR_DIR")"
    git clone --no-checkout --filter=blob:none "$DONOR_REPO" "$DONOR_DIR"
    cloned=1
  fi

  if ! git -C "$DONOR_DIR" cat-file -e "$DONOR_REF^{commit}" 2>/dev/null; then
    git -C "$DONOR_DIR" fetch --no-tags origin "$DONOR_REF"
  fi
  resolved_ref="$(git -C "$DONOR_DIR" rev-parse "$DONOR_REF^{commit}")"
  if [ "$cloned" -eq 0 ]; then
    [ -z "$(git -C "$DONOR_DIR" status --porcelain --untracked-files=no)" ] || fail "SELF_PROVISION_DONOR_DIRTY:$DONOR_DIR" 73
  fi
  if [ "$cloned" -eq 1 ] || [ "$(git -C "$DONOR_DIR" rev-parse HEAD 2>/dev/null || true)" != "$resolved_ref" ]; then
    git -C "$DONOR_DIR" checkout --detach "$resolved_ref"
  fi

  if [ ! -x "$DONOR_DIR/.venv/bin/python" ]; then
    python3 -m venv "$DONOR_DIR/.venv"
    if [ -f "$DONOR_DIR/requirements.txt" ]; then
      "$DONOR_DIR/.venv/bin/python" -m pip install -r "$DONOR_DIR/requirements.txt"
    elif [ -f "$DONOR_DIR/pyproject.toml" ]; then
      "$DONOR_DIR/.venv/bin/python" -m pip install "$DONOR_DIR"
    else
      fail "SELF_PROVISION_DEPENDENCY_MANIFEST_MISSING:$DONOR_DIR" 65
    fi
  fi

  (cd "$DONOR_DIR" && .venv/bin/python -c 'import evolution.skills.evolve_skill')
  printf 'SELF_PROVISIONED donor=%s ref=%s\n' "$DONOR_DIR" "$resolved_ref"
}

provision_donor
if [ "${1:-}" = "--self-provision-only" ]; then
  exit 0
fi

HEALTH_JSON="$(curl -fsS --max-time 5 "$HEALTH_URL")"
MODEL="$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("model", ""))' <<<"$HEALTH_JSON")"
[ -n "$MODEL" ] || { echo "CURRENT_LOCAL_MODEL_UNKNOWN" >&2; exit 42; }
MODEL_SPEC="openai/$MODEL"
export OPENAI_API_BASE="$BASE_URL"
export OPENAI_BASE_URL="$BASE_URL"
export OPENAI_API_KEY="${OPENAI_API_KEY:-local-kylin}"
ARGS=("$@")
has_optimizer=0; has_eval=0
for ((i=0;i<${#ARGS[@]};i++)); do
  case "${ARGS[$i]}" in
    --optimizer-model|--eval-model)
      flag="${ARGS[$i]}"
      if (( i + 1 >= ${#ARGS[@]} )); then
        echo "MODEL_IS_NOT_IDENTITY: $flag requires $MODEL_SPEC" >&2
        exit 64
      fi
      override="${ARGS[$((i + 1))]}"
      if [ "$override" != "$MODEL_SPEC" ]; then
        echo "MODEL_IS_NOT_IDENTITY: $flag=$override current=$MODEL_SPEC" >&2
        exit 64
      fi
      [ "$flag" = "--optimizer-model" ] && has_optimizer=1 || has_eval=1
      i=$((i + 1))
      ;;
    --optimizer-model=*|--eval-model=*)
      flag="${ARGS[$i]%%=*}"
      override="${ARGS[$i]#*=}"
      if [ "$override" != "$MODEL_SPEC" ]; then
        echo "MODEL_IS_NOT_IDENTITY: $flag=$override current=$MODEL_SPEC" >&2
        exit 64
      fi
      [ "$flag" = "--optimizer-model" ] && has_optimizer=1 || has_eval=1
      ;;
  esac
done
[ "$has_optimizer" -eq 1 ] || ARGS+=(--optimizer-model "$MODEL_SPEC")
[ "$has_eval" -eq 1 ] || ARGS+=(--eval-model "$MODEL_SPEC")
mkdir -p "$STATE_DIR"
python3 - "$MODEL" "$BASE_URL" "$$" "$STATE_DIR/self-evolution-binding.json" "$DONOR_REF" "$SELF_PROVISION" <<'PY'
import json,sys,time,os
model,base,pid,path,donor_ref,self_provision=sys.argv[1:]
with open(path,"w") as f:
    json.dump({"schema":"centraldark.self-evolution-binding.v1","observed_at":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"model":model,"model_spec":"openai/"+model,"base_url":base,"pid":int(pid),"donor_ref":donor_ref,"rules":{"resolved_at_lote_start":True,"mid_lote_swap":False,"self_provision_enabled":self_provision == "1"}},f,indent=2)
    f.write("\n")
os.chmod(path,0o600)
PY
cd "$DONOR_DIR"
exec .venv/bin/python -m evolution.skills.evolve_skill "${ARGS[@]}"
